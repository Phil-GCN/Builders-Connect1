import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { Mail, Bell, Save, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const EmailPreferences: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    orderConfirmations: true,
    roleChanges: true,
    messageNotifications: true,
    marketingEmails: false,
    weeklyDigest: true
  });

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('email_preferences')
        .eq('id', user.id)
        .single();

      if (data?.email_preferences) {
        setPreferences(data.email_preferences);
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ email_preferences: preferences })
        .eq('id', user.id);

      if (error) throw error;

      alert('✅ Email preferences saved!');
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Preferences</h2>
            <p className="text-gray-600">Manage how we communicate with you</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'orderConfirmations', label: 'Order Confirmations', description: 'Receive emails when you place an order' },
            { key: 'roleChanges', label: 'Role Changes', description: 'Get notified when your role is updated' },
            { key: 'messageNotifications', label: 'Message Notifications', description: 'Email alerts for new messages' },
            { key: 'marketingEmails', label: 'Marketing & Updates', description: 'News, tips, and product updates' },
            { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of platform activity' }
          ].map(pref => (
            <label key={pref.key} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={preferences[pref.key as keyof typeof preferences]}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  [pref.key]: e.target.checked
                }))}
                className="mt-1 w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{pref.label}</p>
                <p className="text-sm text-gray-600">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full mt-6" disabled={saving}>
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default EmailPreferences;
