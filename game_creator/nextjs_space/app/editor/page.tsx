
'use client';

/**
 * Editor Page
 * Full-featured level editor with customization and preview
 */

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LevelEditor } from '@/components/game/level-editor';
import { GamePreview } from '@/components/game/game-preview';
import { CustomizationPanel } from '@/components/game/customization-panel';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Play, Settings, X } from 'lucide-react';
import { LevelData } from '@/lib/game-engine/types';
import { useToast } from '@/hooks/use-toast';

function EditorContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const levelId = searchParams?.get('id');

  const [mode, setMode] = useState<'edit' | 'play' | 'customize'>('edit');
  const [levelData, setLevelData] = useState<LevelData>({
    title: 'Untitled Level',
    description: '',
    configuration: {
      gravity: 0.8,
      friction: 0.85,
      playerSpeed: 5,
      playerJumpPower: 15,
      playerLives: 3,
      backgroundColor: '#87CEEB',
      platformColor: '#795548',
      playerColor: '#4CAF50',
      enemyColor: '#F44336',
      collectibleColor: '#FFC107',
    },
    entities: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [existingLevelId, setExistingLevelId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (levelId && status === 'authenticated') {
      fetchLevel(levelId);
    }
  }, [levelId, status]);

  const fetchLevel = async (id: string) => {
    try {
      const response = await fetch(`/api/levels/${id}`);
      const data = await response.json();

      if (data.level) {
        setLevelData({
          title: data.level.title,
          description: data.level.description || '',
          configuration: data.level.levelData.configuration,
          entities: data.level.levelData.entities,
        });
        setExistingLevelId(id);
      }
    } catch (error) {
      console.error('Error fetching level:', error);
      toast({
        title: 'Error',
        description: 'Failed to load level',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (updatedLevelData?: LevelData) => {
    const dataToSave = updatedLevelData || levelData;
    setIsSaving(true);

    try {
      const method = existingLevelId ? 'PUT' : 'POST';
      const url = existingLevelId
        ? `/api/levels/${existingLevelId}`
        : '/api/levels';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dataToSave.title,
          description: dataToSave.description,
          levelData: {
            configuration: dataToSave.configuration,
            entities: dataToSave.entities,
          },
          isPublic: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Level saved successfully',
        });

        if (!existingLevelId && data.level?.id) {
          setExistingLevelId(data.level.id);
          router.replace(`/editor?id=${data.level.id}`);
        }
      } else {
        throw new Error(data.error || 'Failed to save level');
      }
    } catch (error) {
      console.error('Error saving level:', error);
      toast({
        title: 'Error',
        description: 'Failed to save level',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlay = (playLevelData: LevelData) => {
    setLevelData(playLevelData);
    setMode('play');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading editor...</p>
        </div>
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
              <div className="flex items-center gap-4 flex-1">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex-1 max-w-md space-y-2">
                  <Input
                    value={levelData.title}
                    onChange={(e) =>
                      setLevelData({ ...levelData, title: e.target.value })
                    }
                    placeholder="Level Title"
                    className="font-semibold"
                  />
                  <Input
                    value={levelData.description || ''}
                    onChange={(e) =>
                      setLevelData({ ...levelData, description: e.target.value })
                    }
                    placeholder="Level Description (optional)"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setMode('edit')}
                  variant={mode === 'edit' ? 'default' : 'outline'}
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => setMode('customize')}
                  variant={mode === 'customize' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
                <Button
                  onClick={() => handleSave()}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-[1fr_320px] gap-6"
        >
          {/* Editor/Preview Area */}
          <div className="h-[calc(100vh-200px)]">
            {mode === 'edit' && (
              <LevelEditor
                initialLevelData={levelData}
                onSave={handleSave}
                onPlay={handlePlay}
              />
            )}
            {mode === 'play' && (
              <GamePreview
                levelData={levelData}
                onClose={() => setMode('edit')}
              />
            )}
            {mode === 'customize' && (
              <div className="h-full overflow-y-auto">
                <CustomizationPanel
                  config={levelData.configuration}
                  onChange={(newConfig) =>
                    setLevelData({ ...levelData, configuration: newConfig })
                  }
                />
              </div>
            )}
          </div>

          {/* Side Panel */}
          {mode === 'edit' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <Card className="p-6 h-full overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Entities: {levelData.entities.length}
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Gravity: {levelData.configuration.gravity.toFixed(2)}
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Player Speed: {levelData.configuration.playerSpeed}
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Jump Power: {levelData.configuration.playerJumpPower}
                    </Label>
                  </div>
                  <Button
                    onClick={() => setMode('customize')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Open Customization Panel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
