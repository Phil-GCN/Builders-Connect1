import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { User, Mail, Calendar, Shield, Save, Loader, Edit2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name, display_name, color, level)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFullName(data.full_name || '');
      setUsername(data.username || '');

    } catch (error) {
      console.error('Error loading profile:', error);
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
        .update({
          full_name: fullName,
          username: username
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('✅ Profile updated successfully!');
      setEditing(false);
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 500);

    } catch (error: any) {
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {fullName?.charAt(0) || username?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{fullName || username}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4" style={{ color: user.role_color }} />
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${user.role_color}20`,
                    color: user.role_color
                  }}
                >
                  {user.role_display_name || user.role_name}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  disabled={!editing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={new Date(user.created_at).toLocaleDateString()}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            {editing ? (
              <>
                <Button
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="w-full">
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
