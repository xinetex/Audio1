
'use client';

/**
 * Dashboard Page
 * User's game library and level management
 */

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Plus,
  Play,
  Edit,
  Trash2,
  LogOut,
  Gamepad2,
  Eye,
  Clock,
  Users,
} from 'lucide-react';

interface Level {
  id: string;
  title: string;
  description?: string;
  plays: number;
  likes: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [myLevels, setMyLevels] = useState<Level[]>([]);
  const [publicLevels, setPublicLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-levels' | 'community'>('my-levels');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLevels();
    }
  }, [status, activeTab]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const filter = activeTab === 'my-levels' ? 'my-levels' : 'public';
      const response = await fetch(`/api/levels?filter=${filter}`);
      const data = await response.json();

      if (activeTab === 'my-levels') {
        setMyLevels(data.levels || []);
      } else {
        setPublicLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Are you sure you want to delete this level?')) return;

    try {
      await fetch(`/api/levels/${levelId}`, {
        method: 'DELETE',
      });
      fetchLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const levels = activeTab === 'my-levels' ? myLevels : publicLevels;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Game Creator Platform</h1>
              <p className="text-muted-foreground">
                Welcome back, {session?.user?.name || 'Creator'}!
              </p>
            </div>
          </div>
          <Button onClick={() => signOut()} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.push('/editor')}
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Plus className="h-5 w-5" />
            Create New Level
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('my-levels')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'my-levels'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Levels
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'community'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Community Levels
            </button>
          </div>
        </motion.div>

        {/* Levels Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading levels...</p>
          </div>
        ) : levels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                {activeTab === 'my-levels'
                  ? "You haven't created any levels yet"
                  : 'No community levels available'}
              </p>
              {activeTab === 'my-levels' && (
                <Button onClick={() => router.push('/editor')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Level
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {levels.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{level.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {level.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>by {level.user?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{level.plays}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(level.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/play/${level.id}`)}
                        size="sm"
                        className="flex-1 gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Play
                      </Button>
                      {activeTab === 'my-levels' && (
                        <>
                          <Button
                            onClick={() => router.push(`/editor?id=${level.id}`)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteLevel(level.id)}
                            size="sm"
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
