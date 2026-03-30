import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Bell, CheckCircle, XCircle, Clock, AlertCircle, 
  Shield, Loader, Trash2, Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  metadata: any;
}

interface RoleChangeRequest {
  id: string;
  from_role_id: string;
  to_role_id: string;
  requested_by: string;
  message: string | null;
  status: string;
  from_role: { name: string; color: string };
  to_role: { name: string; color: string };
  requested_by_user: { full_name: string; email: string };
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Load pending role change requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('role_change_requests')
        .select('id, message, status, from_role_id, to_role_id, requested_by')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      if (requestsData && requestsData.length > 0) {
        const requestsWithDetails = await Promise.all(
          requestsData.map(async (req) => {
            const { data: fromRole } = await supabase.from('roles').select('name, color').eq('id', req.from_role_id).single();
            const { data: toRole } = await supabase.from('roles').select('name, color').eq('id', req.to_role_id).single();
            const { data: requester } = await supabase.from('users').select('full_name, email').eq('id', req.requested_by).single();

            return {
              ...req,
              from_role: fromRole || { name: 'Unknown', color: '#6B7280' },
              to_role: toRole || { name: 'Unknown', color: '#6B7280' },
              requested_by_user: requester || { full_name: 'Unknown', email: '' }
            };
          })
        );
        setRoleRequests(requestsWithDetails);
      } else {
        setRoleRequests([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: handleRoleResponse with demotion logic
  const handleRoleResponse = async (requestId: string, accept: boolean) => {
    if (!user?.id) return;

    setProcessing(requestId);
    try {
      const { data, error } = await supabase.rpc('handle_role_change_response', {
        p_request_id: requestId,
        p_user_id: user.id,
        p_accept: accept
      });

      if (error) throw error;

      if (data.is_demotion) {
        alert('⚠️ Role Changed\n\nYour role has been changed by an administrator.\n\nThis change has been applied automatically.');
      } else if (accept) {
        alert('✅ Role Accepted!\n\nYour new role is now active.');
      } else {
        alert('Role change declined');
      }

      // Reload to reflect session/UI changes if role actually changed
      if (data.is_demotion || accept) {
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setRoleRequests(prev => prev.filter(r => r.id !== requestId));
      }

    } catch (error: any) {
      console.error('Error responding to role request:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="w-5 h-5 mr-2" /> Mark All as Read
            </Button>
          )}
        </div>

        {/* Pending Role Requests */}
        {roleRequests.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Pending Role Changes
            </h2>
            {roleRequests.map(request => (
              <div key={request.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">New Role Assignment</h3>
                    <p className="text-gray-700 mb-3">
                      <strong>{request.requested_by_user.full_name || request.requested_by_user.email}</strong> wants to change your role
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">From</p>
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${request.from_role.color}20`, color: request.from_role.color }}>
                          {request.from_role.name}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-4">→</div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">To</p>
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${request.to_role.color}20`, color: request.to_role.color }}>
                          {request.to_role.name}
                        </span>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-white/50 rounded-lg p-3 border border-yellow-200">
                        <p className="text-xs text-gray-500 mb-1 font-semibold">Note from Admin:</p>
                        <p className="text-sm text-gray-800 italic">"{request.message}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => handleRoleResponse(request.id, true)} disabled={!!processing} className="flex-1 bg-green-600 hover:bg-green-700">
                    {processing === request.id ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    Accept & Refresh
                  </Button>
                  <Button onClick={() => handleRoleResponse(request.id, false)} disabled={!!processing} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                    <XCircle className="w-5 h-5 mr-2" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={`bg-white rounded-xl border-2 p-4 transition-all ${notification.read ? 'border-gray-100 opacity-75' : 'border-primary/20 bg-primary/5 shadow-sm'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-gray-100' : 'bg-primary/10'}`}>
                    <Bell className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h3>
                      <span className="text-[10px] text-gray-400">{new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-3">
                      {!notification.read && (
                        <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs font-bold text-primary hover:underline">Mark read</button>
                      )}
                      <button onClick={() => handleDeleteNotification(notification.id)} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
