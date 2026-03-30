import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  MessageSquare, Send, Plus, Search, X, Loader, 
  Users, Clock, Check, CheckCheck, MoreVertical
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NewConversationModal } from '../../components/portal/NewConversationModal';

interface Conversation {
  id: string;
  type: string;
  subject: string;
  created_at: string;
  last_message_at: string;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
  participants: Array<{
    user_id: string;
    full_name: string;
    username: string;
    email: string;
  }>;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
    username: string;
    email: string;
  };
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      markAsRead();

      const subscription = supabase
        .channel(`conversation_${selectedConversation}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        }, (payload) => {
          console.log('New message received:', payload);
          loadMessages();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // 1. Get user's conversation IDs first
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error loading participants:', participantError);
        throw participantError;
      }

      console.log('User participant data:', participantData);

      if (!participantData || participantData.length === 0) {
        console.log('No conversations found');
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);
      console.log('Conversation IDs:', conversationIds);

      // 2. Get conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Error loading conversations:', convError);
        throw convError;
      }

      console.log('Conversations loaded:', convData);

      // 3. Enrich with participants and last message
      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get OTHER participants (not current user)
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              users!inner(full_name, username, email)
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          // Get last message - Using users!sender_id join
          const { data: lastMsg } = await supabase
            .from('messages')
            .select(`
              content,
              created_at,
              sender:users!sender_id(full_name, username)
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const participantInfo = participantData.find(p => p.conversation_id === conv.id);
          const lastReadAt = participantInfo?.last_read_at || '1970-01-01';
          
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .gt('created_at', lastReadAt);

          return {
            ...conv,
            participants: participants?.map(p => ({
              user_id: p.user_id,
              full_name: p.users.full_name,
              username: p.users.username,
              email: p.users.email
            })) || [],
            last_message: lastMsg ? {
              content: lastMsg.content,
              sender_name: lastMsg.sender?.full_name || lastMsg.sender?.username || 'Unknown',
              created_at: lastMsg.created_at
            } : undefined,
            unread_count: count || 0
          };
        })
      );

      console.log('Enriched conversations:', enrichedConversations);
      setConversations(enrichedConversations);

    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(full_name, username, email)
        `)
        .eq('conversation_id', selectedConversation)
        .eq('is_deleted', false) // Added filter
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      console.log('Messages loaded:', data);
      setMessages(data || []);

    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!selectedConversation || !user?.id) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', selectedConversation)
        .eq('user_id', user.id);

      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );

    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      await loadMessages();
      await loadConversations();

    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadConversations();
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

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
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewConversation(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {conv.participants[0]?.full_name?.charAt(0) || 
                       conv.participants[0]?.username?.charAt(0) || 
                       'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.subject || 
                         conv.participants.map(p => p.full_name || p.username).join(', ') ||
                         'Conversation'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conv.type === 'support' ? 'Support' : 'Direct'}
                      </p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {conv.last_message && (
                  <div className="ml-12">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.last_message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.last_message.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation && selectedConvData ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConvData.participants[0]?.full_name?.charAt(0) || 
                     selectedConvData.participants[0]?.username?.charAt(0) || 
                     'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedConvData.subject || 
                       selectedConvData.participants.map(p => p.full_name || p.username).join(', ')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedConvData.participants.length + 1} participants
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1 ml-2">
                          {msg.sender?.full_name || msg.sender?.username || 'Unknown'}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-2' : 'ml-2'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
};

export default Messages;
