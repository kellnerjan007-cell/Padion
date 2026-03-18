import { supabase } from './supabase';
import type { Friendship } from '@/types/friendship';
import type { Profile } from '@/types/profile';
import { transformFriendship, transformProfile } from '@/utils/transforms';

export const friendService = {
  fetchFriends: async (): Promise<Friendship[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('friendships')
      .select('*, friend:profiles!friend_id(*)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...transformFriendship(row),
      friend: row.friend ? transformProfile(row.friend) : undefined,
    }));
  },

  searchUsers: async (query: string): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data ?? []).map(transformProfile);
  },

  sendRequest: async (friendId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht eingeloggt');

    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: user.id, friend_id: friendId, status: 'pending' });

    if (error) throw error;
  },

  acceptRequest: async (friendshipId: string): Promise<void> => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) throw error;
  },

  removeFriend: async (friendId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('friendships')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', friendId);
  },
};
