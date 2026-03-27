import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppSetting, SettingsMap } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'app_settings' },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('key, value, is_public')
        .eq('is_public', true);

      if (fetchError) throw fetchError;

      const settingsMap: SettingsMap = {};
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value || '';
      });

      setSettings(settingsMap);
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, reload: loadSettings };
};

// Hook for admin to get ALL settings (including private)
export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (fetchError) throw fetchError;

      setSettings(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading admin settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ value })
        .eq('key', key);

      if (updateError) throw updateError;

      await loadSettings();
      return { success: true };
    } catch (err) {
      console.error('Error updating setting:', err);
      return { success: false, error: err };
    }
  };

  return { settings, loading, error, updateSetting, reload: loadSettings };
};
