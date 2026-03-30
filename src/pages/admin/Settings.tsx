import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Save, Eye, EyeOff, AlertTriangle, CheckCircle, 
  Settings as SettingsIcon, Webhook, Shield, CreditCard,
  Key, Globe, Mail, DollarSign
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

type MainTab = 'payment' | 'general' | 'webhooks' | 'permissions';
type GeneralSubTab = 'site' | 'email' | 'api' | 'other';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>('payment');
  const [generalSubTab, setGeneralSubTab] = useState<GeneralSubTab>('site');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test');

  const mainTabs = [
    { id: 'payment', label: 'Payment (Stripe)', icon: CreditCard },
    { id: 'general', label: 'General Settings', icon: SettingsIcon },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'permissions', label: 'Permissions', icon: Shield },
  ];

  const generalSubTabs = [
    { id: 'site', label: 'Site Settings', icon: Globe },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'other', label: 'Other', icon: SettingsIcon },
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

      alert('✅ Setting saved successfully!');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('❌ Failed to save setting');
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
      alert('❌ Failed to switch mode');
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

  // Categorize settings
  const stripeKeys = ['stripe_mode', 'stripe_test_publishable_key', 'stripe_test_secret_key', 
                      'stripe_live_publishable_key', 'stripe_live_secret_key', 'stripe_webhook_secret'];
  
  const categorizeGeneralSettings = () => {
    const nonStripeSettings = settings.filter(s => !stripeKeys.includes(s.key));
    
    return {
      site: nonStripeSettings.filter(s => 
        s.key.includes('site_') || s.key.includes('app_') || s.key.includes('name') || 
        s.key.includes('url') || s.key.includes('logo') || s.key.includes('tagline')
      ),
      email: nonStripeSettings.filter(s => 
        s.key.includes('email_') || s.key.includes('smtp_') || s.key.includes('mail_')
      ),
      api: nonStripeSettings.filter(s => 
        s.key.includes('api_') || s.key.includes('_key') && !stripeKeys.includes(s.key)
      ),
      other: nonStripeSettings.filter(s => {
        const inSite = s.key.includes('site_') || s.key.includes('app_') || s.key.includes('name') || 
                       s.key.includes('url') || s.key.includes('logo') || s.key.includes('tagline');
        const inEmail = s.key.includes('email_') || s.key.includes('smtp_') || s.key.includes('mail_');
        const inApi = s.key.includes('api_') || s.key.includes('_key');
        return !inSite && !inEmail && !inApi;
      })
    };
  };

  const renderSettingCard = (setting: Setting) => {
    const hasChanged = editedValues[setting.key] !== setting.value;
    const isSecret = setting.is_encrypted || setting.key.includes('secret') || setting.key.includes('key');

    return (
      <div key={setting.id} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {isSecret && <Key className="w-4 h-4 text-gray-400" />}
          </h3>
          {setting.description && (
            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type={isSecret && !showSecrets[setting.key] ? 'password' : 'text'}
              value={editedValues[setting.key] || ''}
              onChange={(e) => handleValueChange(setting.key, e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
            />
            {isSecret && (
              <button
                type="button"
                onClick={() => toggleSecret(setting.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecrets[setting.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
          <Button 
            onClick={() => handleSave(setting.key)} 
            disabled={!hasChanged || saving}
            variant={hasChanged ? 'default' : 'outline'}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasChanged ? 'Save' : 'Saved'}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categorizedSettings = categorizeGeneralSettings();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings Manager</h1>
          <p className="text-gray-600 mt-2">Configure system integrations, API keys, and access controls</p>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Environment</h2>
                  <p className="text-gray-600">
                    Active mode: <span className={`font-bold uppercase ${stripeMode === 'live' ? 'text-red-600' : 'text-blue-600'}`}>{stripeMode}</span>
                  </p>
                </div>
                <button
                  onClick={handleToggleMode}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    stripeMode === 'live' ? 'bg-red-600' : 'bg-blue-600'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    stripeMode === 'live' ? 'translate-x-9' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                stripeMode === 'test' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {stripeMode === 'test' ? (
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`font-bold ${stripeMode === 'test' ? 'text-blue-900' : 'text-red-900'}`}>
                      {stripeMode === 'test' ? '🧪 Test Mode Active' : '🔴 LIVE MODE ACTIVE'}
                    </h3>
                    <p className={`text-sm mt-1 ${stripeMode === 'test' ? 'text-blue-700' : 'text-red-700'}`}>
                      {stripeMode === 'test' 
                        ? 'Safe for testing. Use test cards. No real money involved.' 
                        : 'Real money is being processed. Customer payments are live.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys Sections */}
            {[
              { label: 'Test Mode Keys', mode: 'test', prefix: 'stripe_test' },
              { label: 'Live Mode Keys', mode: 'live', prefix: 'stripe_live' }
            ].map((section) => (
              <div key={section.mode} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {section.label}
                  {stripeMode === section.mode && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Currently Active
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  {['publishable_key', 'secret_key'].map(keyType => {
                    const fullKey = `${section.prefix}_${keyType}`;
                    const setting = settings.find(s => s.key === fullKey);
                    if (!setting) return null;
                    return renderSettingCard(setting);
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Tab with Subtabs */}
        {activeTab === 'general' && (
          <div>
            {/* Subtabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
              {generalSubTabs.map(tab => {
                const Icon = tab.icon;
                const count = categorizedSettings[tab.id as GeneralSubTab].length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGeneralSubTab(tab.id as GeneralSubTab)}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                      generalSubTab === tab.id
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subtab Content */}
            <div className="space-y-4">
              {categorizedSettings[generalSubTab].length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                  <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No {generalSubTabs.find(t => t.id === generalSubTab)?.label} Yet
                  </h3>
                  <p className="text-gray-600">
                    Settings in this category will appear here when added.
                  </p>
                </div>
              ) : (
                categorizedSettings[generalSubTab].map(setting => renderSettingCard(setting))
              )}
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Webhook Configuration</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">Configuration Required</p>
                <p className="text-sm text-yellow-700">
                  Add this endpoint to your Stripe dashboard to receive webhook events.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value="https://builders-connect1.vercel.app/api/stripe-webhook"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText('https://builders-connect1.vercel.app/api/stripe-webhook');
                      alert('✅ Copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Signing Secret ({stripeMode.toUpperCase()} Mode)
                </label>
                {renderSettingCard(settings.find(s => s.key === 'stripe_webhook_secret')!)}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div>
            <PermissionsManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
