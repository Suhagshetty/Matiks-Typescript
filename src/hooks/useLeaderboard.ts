import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  id: string;
  username: string;
  rating: number;
  global_rank: number;
}

interface UseLeaderboardOptions {
  limit?: number;
  offset?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { limit = 100, offset = 0 } = options;
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the database function for tie-aware ranking
      const { data, error: queryError } = await supabase
        .rpc('get_leaderboard', { p_limit: limit, p_offset: offset });

      if (queryError) throw queryError;

      setUsers(data || []);

      // Get total count
      const { data: countData } = await supabase.rpc('get_user_count');
      setTotalCount(countData || 0);

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          // Refresh leaderboard on any change
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  return {
    users,
    loading,
    error,
    totalCount,
    refresh: fetchLeaderboard
  };
}

export function useUserSearch() {
  const [results, setResults] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .rpc('search_users', { p_search_term: searchTerm, p_limit: 50 });

      if (queryError) throw queryError;

      setResults(data || []);

    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}
