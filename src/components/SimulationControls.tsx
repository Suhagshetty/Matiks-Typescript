import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SimulationControlsProps {
  onDataChange?: () => void;
}

export function SimulationControls({ onDataChange }: SimulationControlsProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-users');
      
      if (error) throw error;
      
      toast.success(data.message || 'Database seeded successfully!');
      onDataChange?.();
    } catch (err) {
      console.error('Seed error:', err);
      toast.error('Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  const simulateUpdate = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-ratings', {
        body: { count: 20 }
      });
      
      if (error) throw error;
      
      setUpdateCount(prev => prev + (data.updated || 0));
      onDataChange?.();
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsSimulating(false);
      toast.info('Simulation paused');
    } else {
      setIsSimulating(true);
      toast.success('Simulation started - ratings updating every 3 seconds');
      // Run immediately and then every 3 seconds
      simulateUpdate();
      intervalRef.current = setInterval(simulateUpdate, 3000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Seed Database Button */}
      <Button
        onClick={seedDatabase}
        disabled={isSeeding}
        variant="outline"
        className="gap-2"
      >
        <Database className={cn('h-4 w-4', isSeeding && 'animate-pulse')} />
        {isSeeding ? 'Seeding...' : 'Seed 10K Users'}
      </Button>

      {/* Simulation Toggle */}
      <Button
        onClick={toggleSimulation}
        variant={isSimulating ? 'destructive' : 'default'}
        className={cn(
          'gap-2',
          !isSimulating && 'bg-gradient-primary hover:opacity-90'
        )}
      >
        {isSimulating ? (
          <>
            <Pause className="h-4 w-4" />
            Stop Simulation
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Start Simulation
          </>
        )}
      </Button>

      {/* Update Counter */}
      {updateCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {updateCount.toLocaleString()} updates
          </span>
        </div>
      )}

      {/* Live Indicator */}
      {isSimulating && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary pulse-live" />
          <span className="text-sm text-primary">Live</span>
        </div>
      )}
    </div>
  );
}
