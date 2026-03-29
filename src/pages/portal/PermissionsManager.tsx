import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Shield, Search, Plus, Trash2, Loader, CheckCircle,
  XCircle, AlertCircle, Lock, Unlock, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Permission {
  id: string;
  key: string;
  category: string;
  name: string;
  description: string;
  minimum_role_level: number;
}

interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission: Permission;
}

interface Role {
  id: string;
  name: string;
  level: number;
  color: string;
  description: string;
}

const PermissionsManager: React.FC = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions();
    }
  }, [selectedRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all permissions
      const { data: permsData, error: permsError } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (permsError) throw permsError;
      setPermissions(permsData || []);

      // Load all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false });

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      if (rolesData && rolesData.length > 0) {
        setSelectedRole(rolesData[0].id);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          id,
          role_id,
          permission_id,
          permission:permissions(*)
        `)
        .eq('role_id', selectedRole);

      if (error) throw error;
      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  const handleTogglePermission = async (permissionId: string) => {
    const hasPermission = rolePermissions.some(
      rp => rp.permission_id === permissionId
    );

    setSubmitting(true);
    try {
      if (hasPermission) {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', selectedRole)
          .eq('permission_id', permissionId);

        if (error) throw error;
      } else {
        // Add permission
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: selectedRole,
            permission_id: permissionId,
          });

        if (error) throw error;
      }

      await loadRolePermissions();
    } catch (error: any) {
      console.error('Error toggling permission:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = 
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(permissions.map(p => p.category)));
  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const permissionsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredPermissions.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, Permission[]>);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Permissions Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage role-based permissions and access control
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Role to Configure
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield 
                    className="w-5 h-5" 
                    style={{ color: role.color }}
                  />
                  <span className="font-bold text-gray-900">{role.name}</span>
                </div>
                <p className="text-xs text-gray-600">{role.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Level {role.level} • {rolePermissions.filter(rp => rp.role_id === role.id).length} permissions
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions List by Category */}
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, perms]) => {
            if (perms.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Permissions
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {perms.map(permission => {
                    const hasPermission = rolePermissions.some(
                      rp => rp.permission_id === permission.id
                    );
                    const isLocked = selectedRoleData && permission.minimum_role_level > selectedRoleData.level;

                    return (
                      <div
                        key={permission.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {permission.name}
                              </h4>
                              <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {permission.key}
                              </code>
                              {isLocked && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Requires Level {permission.minimum_role_level}+
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {permission.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleTogglePermission(permission.id)}
                            disabled={submitting || isLocked}
                            className={`flex-shrink-0 relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              hasPermission ? 'bg-green-600' : 'bg-gray-300'
                            } ${(submitting || isLocked) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                hasPermission ? 'translate-x-7' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPermissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No permissions found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsManager;
