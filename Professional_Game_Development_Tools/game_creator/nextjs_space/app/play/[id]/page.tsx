
'use client';

/**
 * Play Level Page
 * Play a specific level by ID
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GamePreview } from '@/components/game/game-preview';
import { motion } from 'framer-motion';
import { ArrowLeft, User } from 'lucide-react';
import { LevelData } from '@/lib/game-engine/types';

export default function PlayLevelPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLevel();
  }, [params.id]);

  const fetchLevel = async () => {
    try {
      const response = await fetch(`/api/levels/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load level');
      }

      if (data.level) {
        setLevelData({
          title: data.level.title,
          description: data.level.description,
          configuration: data.level.levelData.configuration,
          entities: data.level.levelData.entities,
        });
        setLevelInfo(data.level);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load level');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading level...</p>
        </div>
      </div>
    );
  }

  if (error || !levelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Level Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The level you are looking for does not exist'}
            </p>
            <Button onClick={() => router.push('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{levelData.title}</h1>
                  {levelData.description && (
                    <p className="text-sm text-muted-foreground">
                      {levelData.description}
                    </p>
                  )}
                </div>
              </div>
              {levelInfo?.user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>by {levelInfo.user.name || 'Unknown'}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Game Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="h-[calc(100vh-200px)]"
        >
          <GamePreview levelData={levelData} />
        </motion.div>
      </div>
    </div>
  );
}
