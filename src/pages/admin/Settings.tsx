import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { Save, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface Setting {
  id: string;
  category: string;
  key: string;
  value: string;
  is_encrypted: boolean;
  is_public: boolean;
  description: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('payment');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});

  const categories = [
    { id: 'payment', label: 'Payment (Stripe)' },
    { id: 'content', label: 'Content' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social Media' },
    { id: 'app', label: 'App Settings' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);

      const values: { [key: string]: string } = {};
      data?.forEach(setting => {
        values[setting.key] = setting.value;
      });
      setEditedValues(values);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: editedValues[key],
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => prev.map(s => 
        s.key === key ? { ...s, value: editedValues[key] } : s
      ));

      alert('Setting saved successfully!');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSettings = settings.filter(s => s.category === activeTab);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage all system settings, API keys, and integrations
          </p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === cat.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredSettings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No settings found in this category
            </div>
          ) : (
            filteredSettings.map(setting => {
              const hasChanged = editedValues[setting.key] !== setting.value;
              const isSecret = setting.is_encrypted || setting.key.includes('secret') || setting.key.includes('key');
              const shouldMask = isSecret && !showSecrets[setting.key];

              return (
                <div key={setting.id} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{setting.key}</h3>
                        {!setting.is_public && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Private
                          </span>
                        )}
                        {setting.key === 'stripe_publishable_key' && (
                          
                            href="https://dashboard.stripe.com/test/apikeys"
                            target="_blan
