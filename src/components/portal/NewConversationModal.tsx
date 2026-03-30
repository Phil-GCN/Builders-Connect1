import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../Button';
import { X, Search, Loader, CheckCircle } from 'lucide-react';
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
  const [subject, setSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [user?.id]);

  const loadUsers = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading users for messaging...');

      // Get all users except current user with their roles
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          username,
          email,
          role_id,
          roles!inner(id, level)
        `)
        .neq('id', user.id);

      if (error) {
        console.error('Error loading users:', error);
        throw error;
      }

      console.log('Raw user data:', data);

      // Get current user's role level
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('users')
        .select(`
          role_id,
          roles!inner(level)
        `)
        .eq('id', user.id)
        .single();

      if (currentUserError) throw currentUserError;

      const currentUserLevel = currentUserData?.roles?.level || 1;
      console.log('Current user level:', currentUserLevel);

      // Transform and filter users based on messaging permissions
      const transformedUsers = (data || [])
        .map(u => ({
          id: u.id,
          full_name: u.full_name,
          username: u.username,
          email: u.email,
          role_level: u.roles?.level || 1
        }))
        .filter(u => {
          // Members (level 1) can only message staff (level >= 3)
          if (currentUserLevel < 2) {
            return u.role_level >= 3;
          }
          // Moderators (level 2) can message moderators and above
          if (currentUserLevel === 2) {
            return u.role_level >= 2;
          }
          // Staff (level >= 3) can message anyone
          return true;
        });

      console.log('Filtered users:', transformedUsers);
      setUsers(transformedUsers);

    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedUser || !user?.id) return;

    setCreating(true);
    try {
      console.log('Creating conversation with user:', selectedUser);

      // Check if conversation already exists between these two users
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants && existingParticipants.length > 0) {
        for (const ep of existingParticipants) {
          const { data: otherParticipants, error: otherError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', ep.conversation_id);

          if (otherError) {
            console.error('Error checking participants:', otherError);
            continue;
          }

          // Check if this is a 2-person conversation with the selected user
          if (
            otherParticipants &&
            otherParticipants.length === 2 &&
            otherParticipants.some(p => p.user_id === selectedUser)
          ) {
            console.log('Conversation already exists:', ep.conversation_id);
            onCreated(ep.conversation_id);
            onClose();
            return;
          }
        }
      }

      console.log('Creating new conversation...');

      // Create new conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          subject: subject.trim() || null,
          created_by: user.id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Conversation created:', conv.id);

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

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }

      console.log('Participants added successfully');

      alert('✅ Conversation created successfully!');
      onCreated(conv.id);
      onClose();

    } catch (error: any) {
      console.error('Error creating conversation:', error);
      alert(`Failed to create conversation: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this conversation about?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Search Users */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Recipient *
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* User List */}
            <div className="border-2 border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm mb-1">
                    {searchQuery ? 'No users found' : 'No users available'}
                  </p>
                  {users.length === 0 && (
                    <p className="text-xs text-gray-400">
                      You can only message staff members
                    </p>
                  )}
                </div>
              ) : (
                filteredUsers.map(u => (
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
