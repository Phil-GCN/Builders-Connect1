import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Users, Search, UserPlus, Shield, Mail, Calendar,
  RefreshCw, Loader, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserPermissionsEditor from './UserPermissionsEditor';

interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  created_at: string;
  role: {
    id: string;
    name: string;
    level: number;
    color: string;
  };
}

interface Role {
  id: string;
  name: string;
  display_name?: string;
  level: number;
  description: string;
  color: string;
}

const UsersManager: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleChangeMessage, setRoleChangeMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPermissionsEditor, setShowPermissionsEditor] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

  const currentUserLevel = currentUser?.role_level || 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          username,
          created_at,
          role_id,
          roles!inner(id, name, level, color)
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const transformedUsers = usersData?.map(user => ({
        ...user,
        role: user.roles
      })) || [];

      setUsers(transformedUsers);

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false });

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load users. Please check browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role.id);
    setRoleChangeMessage('');
    setShowRoleModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    if (selectedRole === selectedUser.role.id) {
      alert('⚠️ This user already has this role');
      return;
    }

    const targetUserLevel = selectedUser.role.level;
    const selectedRoleData = roles.find(r => r.id === selectedRole);
    const newRoleLevel = selectedRoleData?.level || 0;

    if (currentUserLevel < 3) {
      alert('⚠️ Access Denied\n\nOnly Managers and above can assign roles.');
      setShowRoleModal(false);
      return;
    }

    if (targetUserLevel >= 4 && currentUserLevel < 5) {
      alert('⚠️ Permission Denied\n\nYou cannot change the role of Admin users.\n\nOnly Super Admins can modify Admin roles.');
      setShowRoleModal(false);
      return;
    }

    if (currentUserLevel === 3 && newRoleLevel > 2) {
      alert('⚠️ Permission Denied\n\nAs a Manager, you can only assign:\n• Member\n• Moderator\n\nContact an Admin to assign Manager+ roles.');
      setShowRoleModal(false);
      return;
    }

    if (currentUserLevel === 4 && newRoleLevel > 3) {
      alert('⚠️ Permission Denied\n\nAs an Admin, you can only assign roles up to Manager level.\n\nContact a Super Admin to assign higher roles.');
      setShowRoleModal(false);
      return;
    }

    setSubmitting(true);
    try {
      const { error: requestError } = await supabase
        .from('role_change_requests')
        .insert({
          user_id: selectedUser.id,
          from_role_id: selectedUser.role.id,
          to_role_id: selectedRole,
          requested_by: currentUser?.id,
          message: roleChangeMessage || null,
          status: 'pending',
        });

      if (requestError) {
        if (requestError.message.includes('valid_role_assignment')) {
          alert('⚠️ Permission Denied\n\nYou don\'t have permission to assign this role.\n\nPlease contact a higher-level administrator.');
        } else {
          throw requestError;
        }
        return;
      }

      alert('✅ Success!\n\nRole change request sent. The user will be notified to accept the change.');
      setShowRoleModal(false);
      setSelectedUser(null);
      setRoleChangeMessage('');
      
    } catch (error: any) {
      console.error('Error assigning role:', error);
      alert(`❌ Failed to assign role\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Manager</h1>
            <p className="text-gray-600 mt-2">Manage users and roles</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </Button>
            {currentUserLevel >= 2 && (
              <Button onClick={() => navigate('/portal/invitations')}>
                <UserPlus className="w-5 h-5 mr-2" />
                Manage Invitations
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg outline-none"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.display_name || role.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{user.full_name || user.username || 'No name'}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${user.role.color}20`, color: user.role.color }}
                    >
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUser?.id && (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleOpenRoleModal(user)} size="sm" variant="outline">
                          <Shield className="w-4 h-4 mr-1" /> Role
                        </Button>
                        <Button
                          onClick={() => { setPermissionsUser(user); setShowPermissionsEditor(true); }}
                          size="sm" variant="outline"
                        >
                          <Shield className="w-4 h-4 mr-1" /> Perms
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assign Role</h2>
              <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {roles
                    .filter(role => {
                      // Logic: Filter based on currentUserLevel
                      if (currentUserLevel === 3) return role.level <= 2;
                      if (currentUserLevel === 4) return role.level <= 3;
                      return true; // Super Admin (5+) can see all
                    })
                    .map(role => (
                      <option key={role.id} value={role.id}>
                        {role.display_name || role.name} - {role.description}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={roleChangeMessage}
                  onChange={(e) => setRoleChangeMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none"
                  rows={3}
                  placeholder="Explain why the role is being changed..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowRoleModal(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={handleAssignRole} className="flex-1" disabled={submitting}>
                  {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5 mr-1" />}
                  Assign Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsEditor && permissionsUser && (
        <UserPermissionsEditor
          userId={permissionsUser.id}
          userName={permissionsUser.full_name || permissionsUser.username || 'No name'}
          userEmail={permissionsUser.email}
          userRoleLevel={permissionsUser.role.level}
          onClose={() => { setShowPermissionsEditor(false); setPermissionsUser(null); }}
        />
      )}
    </div>
  );
};

export default UsersManager;
