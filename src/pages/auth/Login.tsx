import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LogIn, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../../components/Button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        // Handle specific Supabase error cases
        if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before logging in.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('User logged in:', data.user.email);

        // 2. Check if email is confirmed (Extra safety check)
        if (!data.user.email_confirmed_at) {
          setError('Please verify your email before logging in. Check your inbox for the confirmation link.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // 3. Check if user exists in public.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, role_id, role:roles(name, level)')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          console.error('User not found in users table, attempting creation:', userError);
          
          // Try to create the user profile if it doesn't exist
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.email?.split('@')[0] || 
                          'User';
          const username = data.user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 
                          'user' + Math.floor(Math.random() * 1000);
          
          const { data: memberRole } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'member')
            .single();

          if (memberRole) {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: fullName,
                full_name: fullName,
                username: username,
                role_id: memberRole.id
              });

            if (createError) {
              console.error('Failed to create user profile:', createError);
              setError('Account setup incomplete. Please contact support.');
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }
          }
        }

        // 4. Success - Redirect based on role level
        // (If role was just created, userData might be null, but default is portal)
        const roleLevel = (userData?.role as any)?.level || 1;
        if (roleLevel >= 4) {
          navigate('/admin');
        } else {
          navigate('/portal');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }

    setResending(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`
        }
      });

      if (error) throw error;
      alert('✅ Confirmation email sent! Please check your inbox.');
    } catch (err: any) {
      setError(`Failed to resend: ${err.message}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary">BUILDERSCONNECT</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your BuildersConnect account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 leading-relaxed">{error}</p>
                {error.includes('confirm your account') && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="mt-2 text-sm font-bold text-red-700 hover:underline flex items-center gap-1"
                  >
                    {resending && <Loader className="w-3 h-3 animate-spin" />}
                    Resend confirmation email
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || loading}
              className="text-sm text-primary hover:underline"
            >
              {resending ? 'Sending...' : 'Resend confirmation email'}
            </button>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 hover:underline font-semibold">
              Create one here
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
