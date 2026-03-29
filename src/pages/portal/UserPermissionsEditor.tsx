import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Shield, Plus, Trash2, Loader, CheckCircle, X, AlertCircle, Calendar
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Permission {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  minimum_role_level: number;
}

interface UserPermission {
  id: string;
  permission_id: string;
  grant_type: string;
  reason: string;
  expires_at: string | null;
  granted_by_user: {
    full_name: string;
    email: string;
  };
  permission: Permission;
  created_at: string;
}

interface UserPermissionsEditorProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRoleLevel: number;
  onClose: () => void;
}

export const UserPermissionsEditor: React.FC<UserPermissionsEditorProps> = ({
  userId,
  userName,
  userEmail,
  userRoleLevel,
  onClose
}) => {
  const { user: currentUser } = useAuth();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all available permissions
      const { data: permsData, error: permsError } = await supabase
        .from('permissions')
        .select('*')
        .lte('minimum_role_level', userRoleLevel + 1) // Can only grant permissions up to one level above user
        .order('category');

      if (permsError) throw permsError;
      setAllPermissions(permsData || []);

      // Load user's custom permissions
      const { data: userPermsData, error: userPermsError } = await supabase
        .from('user_permissions')
        .select(`
          id,
          permission_id,
          grant_type,
          reason,
          expires_at,
          created_at,
          granted_by_user:granted_by(full_name, email),
          permission:permissions(*)
        `)
        .eq('user_id', userId);

      if (userPermsError) throw userPermsError;
      setUserPermissions(userPermsData || []);

    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedPermission) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: selectedPermission,
          granted_by: currentUser?.id,
          grant_type: 'add',
          reason: reason || null,
          expires_at: expiresAt || null,
        });

      if (error) throw error;

      alert('Permission granted successfully!');
      setShowAddModal(false);
      setSelectedPermission('');
      setReason('');
      setExpiresAt('');
      await loadData();

    } catch (error: any) {
      console.error('Error granting permission:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) return;

    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      alert('Permission revoked successfully!');
      await loadData();

    } catch (error: any) {
      console.error('Error revoking permission:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const activePermissions = userPermissions.filter(up => 
    up.grant_type === 'add' && (!up.expires_at || new Date(up.expires_at) > new Date())
  );

  const availableToGrant = allPermissions.filter(
    perm => !userPermissions.some(up => up.permission_id === perm.id && up.grant_type === 'add')
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Permissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              {userName} ({userEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Permission Button */}
          <div className="mb-6">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Grant Custom Permission
            </Button>
          </div>

          {/* Current Custom Permissions */}
          {activePermissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No custom permissions
              </h3>
              <p className="text-gray-600">
                This user only has permissions from their role
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activePermissions.map(up => (
                <div
                  key={up.id}
                  className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">
                          {up.permission.name}
                        </h4>
                        <code className="text-xs bg-white text-gray-700 px-2 py-1 rounded">
                          {up.permission.key}
                        </code>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {up.permission.description}
                      </p>
                      {up.reason && (
                        <p className="text-sm text-gray-600 italic mb-2">
                          Reason: {up.reason}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          Granted by {up.granted_by_user?.full_name || up.granted_by_user?.email}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(up.created_at).toLocaleDateString()}
                        </span>
                        {up.expires_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires {new Date(up.expires_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokePermission(up.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Permission Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Grant Custom Permission
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission *
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">Select a permission...</option>
                  {availableToGrant.map(perm => (
                    <option key={perm.id} value={perm.id}>
                      {perm.name} ({perm.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  rows={3}
                  placeholder="Why is this permission being granted?"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires On (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedPermission('');
                    setReason('');
                    setExpiresAt('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantPermission}
                  disabled={!selectedPermission || submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Granting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Grant Permission
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPermissionsEditor;
