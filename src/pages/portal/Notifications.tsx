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
  from_role: { name: string; color: string };
  to_role: { name: string; color: string };
  requested_by_user: { full_name: string; email: string };
  message: string | null;
  status: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading notifications for user:', user?.id);
  
      // Load notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
  
      if (notifError) {
        console.error('Notification error:', notifError);
        throw notifError;
      }
  
      console.log('Notifications loaded:', notifData);
      setNotifications(notifData || []);
  
      // Load pending role change requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('role_change_requests')
        .select(`
            id,
            message,
            status,
            from_role_id,
            to_role_id,
            requested_by
          `)
        .eq('user_id', user?.id)
        .eq('status', 'pending');
  
      if (requestsError) {
        console.error('Role requests error:', requestsError);
        throw requestsError;
      }
  
      console.log('Role requests loaded:', requestsData);
  
      // Now fetch the related data separately
      if (requestsData && requestsData.length > 0) {
        const requestsWithDetails = await Promise.all(
          requestsData.map(async (req) => {
            // Get from_role
            const { data: fromRole } = await supabase
              .from('roles')
              .select('name, color')
              .eq('id', req.from_role_id)
              .single();
  
            // Get to_role
            const { data: toRole } = await supabase
              .from('roles')
              .select('name, color')
              .eq('id', req.to_role_id)
              .single();
  
            // Get requester
            const { data: requester } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', req.requested_by)
              .single();
  
            return {
              ...req,
              from_role: fromRole || { name: 'Unknown', color: '#gray' },
              to_role: toRole || { name: 'Unknown', color: '#gray' },
              requested_by_user: requester || { full_name: 'Unknown', email: '' }
            };
          })
        );
  
        console.log('Requests with details:', requestsWithDetails);
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleRoleResponse = async (requestId: string, accept: boolean) => {
    setProcessing(requestId);
    try {
      // Get the request details
      const request = roleRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update request status
      const { error: updateError } = await supabase
        .from('role_change_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If accepted, update user's role
      if (accept) {
        const { error: roleError } = await supabase
          .from('users')
          .update({ role_id: request.to_role.id })
          .eq('id', user?.id);

        if (roleError) throw roleError;

        alert('✅ Role change accepted! Your new role is now active.');
        
        // Reload page to reflect new role
        window.location.reload();
      } else {
        alert('Role change rejected');
        setRoleRequests(prev => prev.filter(r => r.id !== requestId));
      }

    } catch (error: any) {
      console.error('Error responding to role request:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="w-5 h-5 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Pending Role Requests */}
        {roleRequests.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Pending Role Changes
            </h2>
            {roleRequests.map(request => (
              <div key={request.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      New Role Assignment
                    </h3>
                    <p className="text-gray-700 mb-3">
                      <strong>{request.requested_by_user.full_name}</strong> wants to assign you a new role
                    </p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Current Role</p>
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${request.from_role.color}20`,
                            color: request.from_role.color 
                          }}
                        >
                          {request.from_role.name}
                        </span>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">New Role</p>
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${request.to_role.color}20`,
                            color: request.to_role.color 
                          }}
                        >
                          {request.to_role.name}
                        </span>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-white rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Message:</p>
                        <p className="text-gray-900">{request.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRoleResponse(request.id, true)}
                    disabled={processing === request.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing === request.id ? (
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleRoleResponse(request.id, false)}
                    disabled={processing === request.id}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border-2 p-4 transition-all ${
                  notification.read 
                    ? 'border-gray-200' 
                    : 'border-primary bg-primary/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.read ? 'bg-gray-100' : 'bg-primary/10'
                  }`}>
                    <Bell className={`w-5 h-5 ${notification.read ? 'text-gray-600' : 'text-primary'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
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
