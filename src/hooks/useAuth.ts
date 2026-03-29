import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { usePermissions } from './usePermissions';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const permissionsHook = usePermissions();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role_id,
          created_at,
          updated_at,
          role:role_id (
            id,
            name,
            display_name,
            level,
            permissions
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Flatten role data for easier access
      const userWithRole: User = {
        ...data,
        role_name: data.role?.name,
        role_display_name: data.role?.display_name,
        role_level: data.role?.level,
        permissions: data.role?.permissions || []
      };

      setUser(userWithRole);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    
    // Super admin has all permissions
    if (user.permissions.includes('*')) return true;
    
    return user.permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    return user?.role_name === roleName;
  };

  const hasMinimumRole = (requiredLevel: number): boolean => {
    return (user?.role_level || 0) >= requiredLevel;
  };

  return { 
    user, 
    loading, 
    hasRole,
    hasMinimumRole,
    hasPermission: permissionsHook.hasPermission,
    hasAnyPermission: permissionsHook.hasAnyPermission,
    hasAllPermissions: permissionsHook.hasAllPermissions,
    permissions: permissionsHook.permissions,
    reload: () => user && loadUserProfile(user.id)
  };
};
