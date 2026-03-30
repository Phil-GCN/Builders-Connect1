import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  MessageSquare, Send, Plus, Search, X, Loader, 
  MoreVertical
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
        }, () => {
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
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (participantError) throw participantError;
      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: pData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          const participants = pData && pData.length > 0
            ? await Promise.all(
                pData.map(async (p) => {
                  const { data: u } = await supabase
                    .from('users')
                    .select('full_name, username, email')
                    .eq('id', p.user_id)
                    .single();
                  return {
                    user_id: p.user_id,
                    full_name: u?.full_name || '',
                    username: u?.username || '',
                    email: u?.email || ''
                  };
                })
              )
            : [];

          const { data: lastMsgData } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let lastMessage = undefined;
          if (lastMsgData) {
            const { data: sData } = await supabase
              .from('users')
              .select('full_name, username')
              .eq('id', lastMsgData.sender_id)
              .single();
            lastMessage = {
              content: lastMsgData.content,
              sender_name: sData?.full_name || sData?.username || 'Unknown',
              created_at: lastMsgData.created_at
            };
          }

          const pInfo = participantData.find(p => p.conversation_id === conv.id);
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .gt('created_at', pInfo?.last_read_at || '1970-01-01');

          return {
            ...conv,
            participants,
            last_message: lastMessage,
            unread_count: count || 0
          };
        })
      );
      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation || !user?.id) return;
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        const enrichedMessages = await Promise.all(
          messagesData.map(async (msg) => {
            const { data: sData } = await supabase
              .from('users')
              .select('full_name, username, email')
              .eq('id', msg.sender_id)
              .single();
            return {
              ...msg,
              sender: sData || { full_name: 'Unknown', username: '', email: '' }
            };
          })
        );
        setMessages(enrichedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
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
          conv.id === selectedConversation ? { ...conv, unread_count: 0 } : conv
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
      <div className="p-8 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <Button size="sm" onClick={() => setShowNewConversation(true)}>
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
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
                      {conv.participants[0]?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {conv.participants.map(p => p.full_name || p.username).join(', ') || 'Conversation'}
                      </p>
                      <p className="text-xs text-gray-500">{conv.type === 'support' ? 'Support' : 'Direct'}</p>
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
                    <p className="text-sm text-gray-600 truncate">{conv.last_message.content}</p>
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
                <button
                  onClick={() => {
                    const participantId = selectedConvData.participants[0]?.user_id;
                    if (participantId) {
                      window.location.href = `/portal/users?view=${participantId}`;
                    }
                  }}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConvData.participants[0]?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-left group-hover:text-primary transition-colors">
                      {selectedConvData.participants.map(p => p.full_name || p.username).join(', ')}
                    </h3>
                    <p className="text-xs text-gray-500">Click to view profile</p>
                  </div>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none"
                  disabled={sending}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader className="animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
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
