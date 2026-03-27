import React, { useState } from 'react';
import { useAdminSettings } from '../../hooks/useSettings';
import { Button } from '../../components/Button';
import { Save, Check, X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { AppSetting } from '../../types';

const Settings: React.FC = () => {
  const { settings, loading, updateSetting, reload } = useAdminSettings();
  const [activeCategory, setActiveCategory] = useState<string>('payment');
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [saved, setSaved] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const categories = [
    { id: 'payment', label: 'Payment Processing' },
    { id: 'content', label: 'Content APIs' },
    { id: 'email', label: 'Email & Marketing' },
    { id: 'social', label: 'Social Media' },
    { id: 'app', label: 'Application Config' },
  ];

  const handleValueChange = (key: string, value: string) => {
    setEditedValues({ ...editedValues, [key]: value });
    setSaved({ ...saved, [key]: false });
  };

  const handleSave = async (setting: AppSetting) => {
    setSaving({ ...saving, [setting.key]: true });

    const newValue = editedValues[setting.key] !== undefined 
      ? editedValues[setting.key] 
      : setting.value;

    const result = await updateSetting(setting.key, newValue);

    if (result.success) {
      setSaved({ ...saved, [setting.key]: true });
      setTimeout(() => {
        setSaved({ ...saved, [setting.key]: false });
      }, 2000);
    }

    setSaving({ ...saving, [setting.key]: false });
  };

  const filteredSettings = settings.filter(s => s.category === activeCategory);

  const getValue = (setting: AppSetting) => {
    return editedValues[setting.key] !== undefined 
      ? editedValues[setting.key] 
      : setting.value;
  };

  const isEdited = (setting: AppSetting) => {
    return editedValues[setting.key] !== undefined && 
           editedValues[setting.key] !== setting.value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage API keys, integrations, and configuration</p>
          </div>
          <Button 
            variant="outline" 
            onClick={reload}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap font-medium ${
                  activeCategory === category.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-6">
          {filteredSettings.map((setting) => (
            <div key={setting.id} className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    {setting.is_public ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        Public
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        Private
                      </span>
                    )}
                    {isEdited(setting) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Modified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type={
                      setting.key.includes('secret') || setting.key.includes('key')
                        ? (showPassword[setting.key] ? 'text' : 'password')
                        : 'text'
                    }
                    value={getValue(setting)}
                    onChange={(e) => handleValueChange(setting.key, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                  />
                  {(setting.key.includes('secret') || setting.key.includes('key')) && (
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, [setting.key]: !showPassword[setting.key] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword[setting.key] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => handleSave(setting)}
                  disabled={saving[setting.key] || !isEdited(setting)}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  {saving[setting.key] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : saved[setting.key] ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>

              {setting.updated_at && (
                <p className="text-xs text-gray-500 mt-3">
                  Last updated: {new Date(setting.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Settings Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Public settings</strong> are accessible to the frontend application</li>
            <li>• <strong>Private settings</strong> (API keys, secrets) are only accessible by Super Admins</li>
            <li>• Changes take effect immediately across the application</li>
            <li>• All changes are logged with timestamp and user information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
