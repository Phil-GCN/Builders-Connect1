import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  Bell, MessageSquare, Check, X, Loader, 
  CheckCheck, Shield, Plus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NewConversationModal } from '../../components/portal/NewConversationModal';

type Tab = 'notifications' | 'messages';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
  metadata: any;
}

interface RoleRequest {
  id: string;
  from_role: { name: string; color: string };
  to_role: { name: string; color: string };
  requested_by_user: { full_name: string; username: string };
  message: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  subject: string;
  last_message_at: string;
  participants: Array<{
    full_name: string;
    username: string;
  }>;
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count: number;
}

const Communications: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const userLevel = user?.role_level || 1;
  const isStaff = userLevel >= 3;

  useEffect(() => {
    if (user?.id) {
      loadAll();
      
      const notifChannel = supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => loadNotifications())
        .subscribe();

      const messagesChannel = supabase
        .channel('messages_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, () => loadConversations())
        .subscribe();

      return () => {
        notifChannel.unsubscribe();
        messagesChannel.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadNotifications(),
      loadRoleRequests(),
      loadConversations()
    ]);
    setLoading(false);
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
  };

  const loadRoleRequests = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('role_change_requests')
      .select(`
        *,
        from_role:from_role_id(name, color),
        to_role:to_role_id(name, color),
        requested_by_user:requested_by(full_name, username)
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setRoleRequests(data || []);
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    const { data: participantData } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!participantData || participantData.length === 0) {
      setConversations([]);
      return;
    }

    const conversationIds = participantData.map(p => p.conversation_id);
    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });

    const enriched = await Promise.all(
      (convData || []).map(async (conv) => {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', user.id);

        const participantDetails = participants && participants.length > 0
          ? await Promise.all(
              participants.map(async (p) => {
                const { data: userData } = await supabase
                  .from('users')
                  .select('full_name, username')
                  .eq('id', p.user_id)
                  .single();
                return {
                  full_name: userData?.full_name || '',
                  username: userData?.username || ''
                };
              })
            )
          : [];

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const participantInfo = participantData.find(p => p.conversation_id === conv.id);
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .gt('created_at', participantInfo?.last_read_at || '1970-01-01');

        return {
          ...conv,
          participants: participantDetails,
          last_message: lastMsg,
          unread_count: count || 0
        };
      })
    );
    setConversations(enriched);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    loadNotifications();
  };

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
        alert('⚠️ Role Changed\n\nYour role has been changed by an administrator.');
      } else if (accept) {
        alert('✅ Role Accepted!');
      }
      if (data.is_demotion || accept) {
        setTimeout(() => window.location.reload(), 1000);
      } else {
        loadRoleRequests();
      }
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isStaff ? 'Communications' : 'Support & Notifications'}
          </h1>
          <p className="text-gray-600">
            {isStaff ? 'Manage your notifications and messages' : 'View notifications and contact support'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {(unreadNotifications + roleRequests.length) > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications + roleRequests.length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {isStaff ? 'Messages' : 'Support'}
              {unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </div>
          </button>
        </div>

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {roleRequests.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Pending Role Changes
                </h3>
                <div className="space-y-3">
                  {roleRequests.map(request => (
                    <div key={request.id} className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 mb-2">
                        <strong>{request.requested_by_user.full_name || request.requested_by_user.username}</strong> wants to change your role from <span style={{ color: request.from_role.color }} className="font-semibold">{request.from_role.name}</span> to <span style={{ color: request.to_role.color }} className="font-semibold">{request.to_role.name}</span>
                      </p>
                      {request.message && <p className="text-sm text-gray-600 mb-3 italic">"{request.message}"</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRoleResponse(request.id, true)} disabled={processing === request.id}>
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRoleResponse(request.id, false)} disabled={processing === request.id}>
                          <X className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border-2 border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">All Notifications</h3>
                {unreadNotifications > 0 && (
                  <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
                  </Button>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-4 hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                        {!notif.is_read && (
                          <button onClick={() => handleMarkAsRead(notif.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <Check className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border-2 border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{isStaff ? 'Conversations' : 'Support Messages'}</h3>
              <Button onClick={() => setShowNewMessage(true)}>
                <Plus className="w-4 h-4 mr-1" /> New {isStaff ? 'Message' : 'Support Request'}
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {conversations.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No conversations yet</p>
                  <Button onClick={() => setShowNewMessage(true)}>Start a request</Button>
                </div>
              ) : (
                conversations.map(conv => (
                  <a 
                    key={conv.id} 
                    href={`/portal/messages?conversation=${conv.id}`} 
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {conv.participants.map(p => p.full_name || p.username).join(', ') || 'Conversation'}
                          </h4>
                          {conv.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{conv.unread_count}</span>
                          )}
                        </div>
                        {conv.last_message && <p className="text-sm text-gray-600 truncate">{conv.last_message.content}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(conv.last_message_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showNewMessage && (
        <NewConversationModal
          onClose={() => setShowNewMessage(false)}
          onCreated={(convId) => {
            setShowNewMessage(false);
            window.location.href = `/portal/messages?conversation=${convId}`;
          }}
        />
      )}
    </div>
  );
};

export default Communications;
