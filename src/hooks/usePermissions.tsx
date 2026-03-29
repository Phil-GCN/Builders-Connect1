import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Permission {
  key: string;
  name: string;
  category: string;
  description: string;
  minimum_role_level: number;
}

interface UserPermission {
  permission_key: string;
  permission_name: string;
  source: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadPermissions();
    }
  }, [user?.id]);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_uuid: user?.id
      });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionKey: string): boolean => {
    return permissions.some(p => p.permission_key === permissionKey);
  };

  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reload: loadPermissions
  };
};
