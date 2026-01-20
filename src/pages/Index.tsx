import { useState, useEffect } from 'react';
import { Trophy, Users, TrendingUp, Zap } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { StatsCard } from '@/components/StatsCard';
import { SimulationControls } from '@/components/SimulationControls';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    topRating: 0,
    averageRating: 0
  });

  const fetchStats = async () => {
    try {
      // Get total count
      const { data: countData } = await supabase.rpc('get_user_count');
      
      // Get top player
      const { data: topPlayer } = await supabase
        .from('users')
        .select('rating')
        .order('rating', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get average rating (sample for performance)
      const { data: avgData } = await supabase
        .from('users')
        .select('rating')
        .limit(1000);

      const avgRating = avgData?.length 
        ? Math.round(avgData.reduce((sum, u) => sum + u.rating, 0) / avgData.length)
        : 0;

      setStats({
        totalUsers: countData || 0,
        topRating: topPlayer?.rating || 0,
        averageRating: avgRating
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Leaderboard</h1>
                <p className="text-xs text-muted-foreground">Real-time global rankings</p>
              </div>
            </div>
            <SimulationControls onDataChange={fetchStats} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Find Your Rank</h2>
            <p className="text-muted-foreground">
              Search for any player to see their live global ranking
            </p>
          </div>
          <SearchBar />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Players"
            value={stats.totalUsers}
            subtitle="Active in leaderboard"
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Top Rating"
            value={stats.topRating}
            subtitle="Highest skill rating"
            icon={TrendingUp}
            variant="gold"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating}
            subtitle="Across all players"
            icon={Zap}
          />
        </section>

        {/* Leaderboard Table */}
        <section className="bg-card rounded-xl border border-border shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-secondary/20">
            <h3 className="text-lg font-semibold">Global Rankings</h3>
            <p className="text-sm text-muted-foreground">
              Tie-aware ranking with DENSE_RANK • Users with same rating share the same rank
            </p>
          </div>
          <LeaderboardTable />
        </section>

        {/* Info Section */}
        <section className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Rating range: 100 - 5000 • Rankings update in real-time • Simulation updates 20 random users every 3 seconds
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
