import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../Button';
import { X, Loader, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Role {
  id: string;
  name: string;
  level: number;
  color: string;
  display_name: string;
}

interface CreateInvitationModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateInvitationModal: React.FC<CreateInvitationModalProps> = ({
  onClose,
  onCreated
}) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [message, setMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [maxUses, setMaxUses] = useState('1');
  const [creating, setCreating] = useState(false);
  const [canAssignRoles, setCanAssignRoles] = useState(false);

  useEffect(() => {
    loadRoles();
  }, [user?.role_level]);

  const loadRoles = async () => {
    if (!user?.id) return;

    const currentUserLevel = user.role_level || 1;
    
    const canAssign = currentUserLevel >= 3;
    setCanAssignRoles(canAssign);

    if (!canAssign) {
      setRoles([]);
      return;
    }

    let maxAssignableLevel = 0;
    if (currentUserLevel === 3) maxAssignableLevel = 2;
    else if (currentUserLevel === 4) maxAssignableLevel = 3;
    else if (currentUserLevel >= 5) maxAssignableLevel = 5;

    const { data } = await supabase
      .from('roles')
      .select('*')
      .lte('level', maxAssignableLevel)
      .order('level', { ascending: false });

    setRoles(data || []);
    if (data && data.length > 0) {
      setRoleId(data.find(r => r.name === 'member')?.id || data[data.length - 1].id);
    }
  };

  const handleCreate = async () => {
    if (!user?.id) return;

    setCreating(true);
    try {
      // Generate unique code
      const code = Array.from({ length: 8 }, () => 
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 1. Create the invitation record
      const { error } = await supabase
        .from('invitations')
        .insert({
          code,
          invited_by: user.id,
          invited_email: email || null,
          role_id: canAssignRoles && roleId ? roleId : null,
          message: message || null,
          expires_at: expiresAt,
          max_uses: maxUses ? parseInt(maxUses) : null,
          status: 'pending'
        });

      if (error) throw error;

      // 2. Queue the invitation email if a recipient email was provided
      if (email) {
        const inviterName = user.full_name || user.username || 'A member';
        
        await supabase.rpc('queue_email', {
          p_to_email: email,
          p_subject: `${inviterName} invited you to Builders Connect`,
          p_html_content: '', // Template will generate the HTML
          p_template_name: 'invitation',
          p_template_data: {
            inviterName,
            inviteCode: code,
            message: message || null
          }
        });
      }

      alert('✅ Invitation created successfully!');
      onCreated();

    } catch (error: any) {
      console.error('Error creating invitation:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Invitation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, we will send an email automatically
            </p>
          </div>

          {canAssignRoles && roles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Role (Optional)
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="">No specific role (default: Member)</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name || role.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                New members will be assigned this role upon registration
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Note (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! Join me on Builders Connect..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires in (days)
              </label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                min="1"
                max="365"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Uses
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
                max="100"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="flex-1"
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create & Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
