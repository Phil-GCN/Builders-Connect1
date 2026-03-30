import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Save, Eye, EyeOff, ExternalLink, AlertTriangle, 
  CheckCircle, Settings as SettingsIcon, Webhook, Shield 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PermissionsManager from '../portal/PermissionsManager';

interface Setting {
  id: string;
  category: string;
  key: string;
  value: string;
  is_encrypted: boolean;
  is_public: boolean;
  description: string;
}

type Tab = 'payment' | 'general' | 'webhooks' | 'permissions';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('payment');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test');

  const categories = [
    { id: 'payment', label: 'Payment (Stripe)', icon: SettingsIcon },
    { id: 'general', label: 'General Content', icon: SettingsIcon },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'permissions', label: 'Permissions', icon: Shield },
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
        if (setting.key === 'stripe_mode') {
          setStripeMode(setting.value as 'test' | 'live');
        }
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

      if (key === 'stripe_mode') {
        setStripeMode(editedValues[key] as 'test' | 'live');
      }

      alert('Setting saved successfully!');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMode = async () => {
    const newMode = stripeMode === 'test' ? 'live' : 'test';
    
    if (newMode === 'live') {
      const confirmSwitch = window.confirm(
        '⚠️ IMPORTANT: Switching to Live Mode\n\n' +
        'This will enable REAL payments with REAL money.\n\n' +
        '• Customers will be charged actual amounts\n' +
        '• Make sure your live Stripe keys are configured\n\n' +
        'Are you sure you want to continue?'
      );
      if (!confirmSwitch) return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: newMode })
        .eq('key', 'stripe_mode');

      if (error) throw error;

      setStripeMode(newMode);
      setEditedValues(prev => ({ ...prev, stripe_mode: newMode }));
      alert(`✅ Successfully switched to ${newMode.toUpperCase()} mode`);
    } catch (error) {
      console.error('Error toggling mode:', error);
      alert('Failed to switch mode');
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

  // Filter settings for the General tab (anything not Stripe-specific)
  const generalSettings = settings.filter(s => 
    !['stripe_mode', 'stripe_test_publishable_key', 'stripe_test_secret_key', 
      'stripe_live_publishable_key', 'stripe_live_secret_key', 'stripe_webhook_secret'].includes(s.key)
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings Manager</h1>
          <p className="text-gray-600 mt-2">Manage system integrations, API keys, and access controls</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as Tab)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === cat.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Payment Tab Content */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Environment</h2>
                  <p className="text-gray-600">Active environment: <span className="font-bold uppercase">{stripeMode}</span></p>
                </div>
                <button
                  onClick={handleToggleMode}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    stripeMode === 'live' ? 'bg-red-600' : 'bg-blue-600'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${stripeMode === 'live' ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`p-4 rounded-xl border-2 ${stripeMode === 'test' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {stripeMode === 'test' ? <CheckCircle className="w-6 h-6 text-blue-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                  <div>
                    <h3 className={`font-bold ${stripeMode === 'test' ? 'text-blue-900' : 'text-red-900'}`}>
                      {stripeMode === 'test' ? '🧪 Test Mode Active' : '🔴 LIVE MODE ACTIVE'}
                    </h3>
                    <p className="text-sm mt-1">{stripeMode === 'test' ? 'Safe for testing with fake cards.' : 'Real money is being charged.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Keys Sections */}
            {[
              { label: 'Test Mode Keys', mode: 'test', prefix: 'stripe_test' },
              { label: 'Live Mode Keys', mode: 'live', prefix: 'stripe_live' }
            ].map((section) => (
              <div key={section.mode} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {section.label}
                  {stripeMode === section.mode && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>}
                </h3>
                <div className="space-y-4">
                  {['publishable_key', 'secret_key'].map(keyType => {
                    const fullKey = `${section.prefix}_${keyType}`;
                    const isSecret = keyType === 'secret_key';
                    return (
                      <div key={fullKey}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{keyType.replace('_', ' ')}</label>
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type={showSecrets[fullKey] ? 'text' : 'password'}
                              value={editedValues[fullKey] || ''}
                              onChange={(e) => handleValueChange(fullKey, e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none font-mono text-sm"
                            />
                            <button type="button" onClick={() => toggleSecret(fullKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              {showSecrets[fullKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <Button onClick={() => handleSave(fullKey)} disabled={editedValues[fullKey] === settings.find(s => s.key === fullKey)?.value || saving}>
                            <Save className="w-4 h-4 mr-2" /> Save
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Webhooks Tab Content */}
        {activeTab === 'webhooks' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Webhook Configuration</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">Configure your Stripe dashboard to send events to the endpoint below.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Webhook Endpoint URL</label>
              <div className="flex gap-2">
                <input readOnly value="https://builders-connect1.vercel.app/api/stripe-webhook" className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-sm" />
                <Button onClick={() => { navigator.clipboard.writeText('https://builders-connect1.vercel.app/api/stripe-webhook'); alert('Copied!'); }}>Copy</Button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mt-4">Signing Secret ({stripeMode.toUpperCase()})</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
                    value={editedValues['stripe_webhook_secret'] || ''}
                    onChange={(e) => handleValueChange('stripe_webhook_secret', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button type="button" onClick={() => toggleSecret('stripe_webhook_secret')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showSecrets['stripe_webhook_secret'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button onClick={() => handleSave('stripe_webhook_secret')} disabled={saving}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* General Content Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {generalSettings.map(setting => {
              const hasChanged = editedValues[setting.key] !== setting.value;
              return (
                <div key={setting.id} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">{setting.key}</h3>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <input
                      value={editedValues[setting.key] || ''}
                      onChange={(e) => handleValueChange(setting.key, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                    <Button onClick={() => handleSave(setting.key)} disabled={!hasChanged || saving}>
                      <Save className="w-4 h-4 mr-2" /> {hasChanged ? 'Save' : 'Saved'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Permissions Tab Content */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <PermissionsManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
