import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../Button';
import { X, Search, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role_level: number;
}

interface NewConversationModalProps {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onCreated
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const userLevel = user?.role_level || 1;
  const isMember = userLevel < 2;

  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!user?.id || searchQuery.length < 3) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          username,
          email,
          role:roles!inner(level)
        `)
        .neq('id', user.id)
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);

      if (error) throw error;

      // Filter based on messaging permissions
      const filteredUsers = (data || [])
        .map(u => ({
          id: u.id,
          full_name: u.full_name,
          username: u.username,
          email: u.email,
          role_level: u.role?.level || 1
        }))
        .filter(u => {
          // Members can only message staff (level >= 3)
          if (isMember) {
            return u.role_level >= 3;
          }
          // Staff can message anyone
          return true;
        });

      setSearchResults(filteredUsers);

    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedUser || !user?.id) return;

    setCreating(true);
    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants) {
        for (const ep of existingParticipants) {
          const { data: otherParticipants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', ep.conversation_id);

          if (
            otherParticipants &&
            otherParticipants.length === 2 &&
            otherParticipants.some(p => p.user_id === selectedUser)
          ) {
            // Conversation exists
            onCreated(ep.conversation_id);
            onClose();
            return;
          }
        }
      }

      // Create new conversation (no subject needed)
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          subject: null, // No subject for direct messages
          created_by: user.id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { 
            conversation_id: conv.id, 
            user_id: user.id,
            last_read_at: new Date().toISOString()
          },
          { 
            conversation_id: conv.id, 
            user_id: selectedUser,
            last_read_at: new Date().toISOString()
          }
        ]);

      if (participantsError) throw participantsError;

      alert('✅ Conversation started!');
      onCreated(conv.id);
      onClose();

    } catch (error: any) {
      console.error('Error creating conversation:', error);
      alert(`Failed to create conversation: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {isMember ? 'Contact Support' : 'New Conversation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Info for members */}
          {isMember && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Search for a team member to start a support conversation. You can only contact our staff team.
              </p>
            </div>
          )}

          {/* Search Users */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isMember ? 'Search Staff Members' : 'Search Users'}
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type at least 3 characters to search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Search hint */}
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="text-xs text-gray-500 mb-2">
                Type {3 - searchQuery.length} more character{3 - searchQuery.length > 1 ? 's' : ''} to search
              </p>
            )}

            {/* User List */}
            <div className="border-2 border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : searchQuery.length < 3 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Start typing to search for {isMember ? 'staff members' : 'users'}
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">
                    No {isMember ? 'staff members' : 'users'} found
                  </p>
                </div>
              ) : (
                searchResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`w-full p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 ${
                      selectedUser === u.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {u.full_name?.charAt(0) || u.username?.charAt(0) || u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {u.full_name || u.username || 'No name'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {u.username ? `@${u.username}` : u.email.split('@')[0]}
                      </p>
                    </div>
                    {selectedUser === u.id && (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={!selectedUser || creating}
            >
              {creating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Conversation'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
