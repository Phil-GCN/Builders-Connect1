import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface UserPermission {
  permission_key: string;
  permission_name: string;
  source: string;
}

// Pass userId as a parameter instead of calling useAuth()
export const usePermissions = (userId: string | undefined) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async () => {
    if (!userId) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_uuid: userId
      });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

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
