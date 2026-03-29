import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { Save, Eye, EyeOff, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test');

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
        '• Transactions will process through your bank\n' +
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

  const filteredSettings = settings.filter(s => 
    s.category === activeTab && 
    !['stripe_mode', 'stripe_test_publishable_key', 'stripe_test_secret_key', 
      'stripe_live_publishable_key', 'stripe_live_secret_key'].includes(s.key)
  );

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

        {/* Tabs */}
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

        {/* Payment Tab - Special Layout */}
        {activeTab === 'payment' && (
          <>
            {/* Environment Toggle */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Environment</h2>
                  <p className="text-gray-600">
                    Control which Stripe environment is active for payments
                  </p>
                </div>
                
                <button
                  onClick={handleToggleMode}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    stripeMode === 'live' ? 'bg-red-600' : 'bg-blue-600'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      stripeMode === 'live' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Current Mode Indicator */}
              {stripeMode === 'test' ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-lg mb-1">🧪 Test Mode Active</h3>
                      <p className="text-blue-700 text-sm mb-2">
                        Safe environment for testing. All payments use test cards and no real money is charged.
                      </p>
                      <ul className="text-blue-600 text-sm space-y-1">
                        <li>• Use test card: 4242 4242 4242 4242</li>
                        <li>• No real transactions processed</li>
                        <li>• Perfect for development and testing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 text-lg mb-1">🔴 LIVE MODE ACTIVE</h3>
                      <p className="text-red-700 text-sm mb-2">
                        Real payments are being processed. Customers will be charged actual money.
                      </p>
                      <ul className="text-red-600 text-sm space-y-1">
                        <li>• Real credit cards only</li>
                        <li>• Actual money charged to customers</li>
                        <li>• Funds deposited to your bank account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stripe Keys Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🧪 Test Mode Keys
                  {stripeMode === 'test' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Currently Active
                    </span>
                  )}
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key (Test)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecrets['stripe_test_publishable_key'] ? 'text' : 'password'}
                        value={editedValues['stripe_test_publishable_key'] || ''}
                        onChange={(e) => handleValueChange('stripe_test_publishable_key', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="pk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe_test_publishable_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets['stripe_test_publishable_key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSave('stripe_test_publishable_key')}
                      disabled={editedValues['stripe_test_publishable_key'] === settings.find(s => s.key === 'stripe_test_publishable_key')?.value || saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key (Test)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecrets['stripe_test_secret_key'] ? 'text' : 'password'}
                        value={editedValues['stripe_test_secret_key'] || ''}
                        onChange={(e) => handleValueChange('stripe_test_secret_key', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="sk_test_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe_test_secret_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets['stripe_test_secret_key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSave('stripe_test_secret_key')}
                      disabled={editedValues['stripe_test_secret_key'] === settings.find(s => s.key === 'stripe_test_secret_key')?.value || saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔴 Live Mode Keys
                  {stripeMode === 'live' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Currently Active
                    </span>
                  )}
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key (Live)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecrets['stripe_live_publishable_key'] ? 'text' : 'password'}
                        value={editedValues['stripe_live_publishable_key'] || ''}
                        onChange={(e) => handleValueChange('stripe_live_publishable_key', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="pk_live_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe_live_publishable_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets['stripe_live_publishable_key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSave('stripe_live_publishable_key')}
                      disabled={editedValues['stripe_live_publishable_key'] === settings.find(s => s.key === 'stripe_live_publishable_key')?.value || saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key (Live)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecrets['stripe_live_secret_key'] ? 'text' : 'password'}
                        value={editedValues['stripe_live_secret_key'] || ''}
                        onChange={(e) => handleValueChange('stripe_live_secret_key', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="sk_live_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe_live_secret_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets['stripe_live_secret_key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSave('stripe_live_secret_key')}
                      disabled={editedValues['stripe_live_secret_key'] === settings.find(s => s.key === 'stripe_live_secret_key')?.value || saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Settings */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Webhook Configuration</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>Important:</strong> You need to configure webhooks in both Test and Live modes separately.
                    </p>
                    <p className="text-xs text-yellow-700">
                      Webhooks automatically update orders when payments complete or refunds are processed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Endpoint URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="https://builders-connect1.vercel.app/api/stripe-webhook"
                      readOnly
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText('https://builders-connect1.vercel.app/api/stripe-webhook');
                        alert('Webhook URL copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret (Test Mode)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
                        value={editedValues['stripe_webhook_secret'] || ''}
                        onChange={(e) => handleValueChange('stripe_webhook_secret', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                        placeholder="whsec_..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('stripe_webhook_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets['stripe_webhook_secret'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSave('stripe_webhook_secret')}
                      disabled={editedValues['stripe_webhook_secret'] === settings.find(s => s.key === 'stripe_webhook_secret')?.value || saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get this from Stripe Dashboard → Webhooks → Signing secret
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events to Listen For
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <code className="bg-white px-2 py-1 rounded">checkout.session.completed</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <code className="bg-white px-2 py-1 rounded">payment_intent.succeeded</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <code className="bg-white px-2 py-1 rounded">charge.refunded</code>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Setup Instructions:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to Stripe Dashboard → Webhooks</li>
                    <li>Click "Add endpoint"</li>
                    <li>Paste the endpoint URL above</li>
                    <li>Select the three events listed</li>
                    <li>Copy the signing secret and save it here</li>
                  </ol>
                </div>
              </div>
            </div>
            
            {/* Stripe Dashboard Link */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Stripe Dashboard</h3>
              <p className="text-sm text-blue-700 mb-4">
                Manage payments, view transactions, and configure webhooks in your Stripe dashboard.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  API Keys <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://dashboard.stripe.com/test/payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Payments <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://dashboard.stripe.com/test/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Webhooks <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </>
        )}

        {/* Other Settings */}
        {activeTab !== 'payment' && (
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
                        </div>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type={shouldMask ? 'password' : 'text'}
                          value={editedValues[setting.key] || ''}
                          onChange={(e) => handleValueChange(setting.key, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          placeholder={`Enter ${setting.key}`}
                        />
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleSecret(setting.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {shouldMask ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>
                        )}
                      </div>

                      <Button
                        onClick={() => handleSave(setting.key)}
                        disabled={!hasChanged || saving}
                        className={`${hasChanged ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {hasChanged ? 'Save' : 'Saved'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
