import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  UserPlus, Copy, Check, X, Loader, Mail, Calendar,
  Link as LinkIcon, Users, TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CreateInvitationModal } from '../../components/portal/CreateInvitationModal';

interface Invitation {
  id: string;
  code: string;
  invited_email: string | null;
  role_id: string | null;
  status: string;
  message: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  created_at: string;
  role?: {
    name: string;
    color: string;
  };
  acceptances?: Array<{
    accepted_by_user: {
      full_name: string;
      email: string;
    };
    accepted_at: string;
  }>;
}

const InvitationsManager: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadInvitations();
    }
  }, [user?.id]);

  const loadInvitations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: invitationsData, error: invError } = await supabase
        .from('invitations')
        .select(`
          *,
          role:roles(name, color)
        `)
        .eq('invited_by', user.id)
        .order('created_at', { ascending: false });

      if (invError) throw invError;

      // Enrich with acceptance data
      const enriched = await Promise.all(
        (invitationsData || []).map(async (inv) => {
          const { data: acceptances } = await supabase
            .from('invitation_acceptances')
            .select(`
              accepted_at,
              accepted_by_user:accepted_by(full_name, email)
            `)
            .eq('invitation_id', inv.id);

          return {
            ...inv,
            acceptances: acceptances || []
          };
        })
      );

      setInvitations(enriched);

    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    const inviteLink = `${window.location.origin}/accept-invitation/${code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Cancel this invitation? It will no longer be usable.')) return;

    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      await loadInvitations();
      alert('✅ Invitation cancelled');

    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    totalAcceptances: invitations.reduce((sum, inv) => sum + (inv.acceptances?.length || 0), 0)
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
            <p className="text-gray-600 mt-2">
              Invite new members to join the platform
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-5 h-5 mr-2" />
            Create Invitation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Invitations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
                <p className="text-sm text-gray-600">Accepted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAcceptances}</p>
                <p className="text-sm text-gray-600">Total Sign-ups</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          {invitations.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No invitations yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first invitation to invite members
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Invitation
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {invitations.map(invitation => {
                const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();
                const isMaxedOut = invitation.max_uses && invitation.uses_count >= invitation.max_uses;
                const isActive = invitation.status === 'pending' && !isExpired && !isMaxedOut;

                return (
                  <div key={invitation.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-lg font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                            {invitation.code}
                          </code>
                          
                          {isActive ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Active
                            </span>
                          ) : isExpired ? (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              Expired
                            </span>
                          ) : isMaxedOut ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Fully Used
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              {invitation.status}
                            </span>
                          )}

                          {invitation.role && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: `${invitation.role.color}20`,
                                color: invitation.role.color
                              }}
                            >
                              → {invitation.role.name}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          {invitation.invited_email && (
                            <p className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {invitation.invited_email}
                            </p>
                          )}
                          
                          <p className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {new Date(invitation.created_at).toLocaleDateString()}
                          </p>

                          {invitation.expires_at && (
                            <p className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Expires {new Date(invitation.expires_at).toLocaleDateString()}
                            </p>
                          )}

                          {invitation.max_uses && (
                            <p className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {invitation.uses_count} / {invitation.max_uses} uses
                            </p>
                          )}
                        </div>

                        {invitation.message && (
                          <p className="mt-2 text-sm text-gray-700 italic bg-gray-50 p-2 rounded">
                            "{invitation.message}"
                          </p>
                        )}

                        {invitation.acceptances && invitation.acceptances.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Accepted by:</p>
                            <div className="flex flex-wrap gap-2">
                              {invitation.acceptances.map((acc, idx) => (
                                <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                  {acc.accepted_by_user?.full_name || acc.accepted_by_user?.email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleCopyCode(invitation.code)}
                          >
                            {copiedCode === invitation.code ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        )}

                        {isActive && (
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Invitation Modal - Next step */}
      {showCreateModal && (
        <CreateInvitationModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadInvitations();
          }}
        />
      )}
    </div>
  );
};

export default InvitationsManager;
