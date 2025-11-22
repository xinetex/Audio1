
'use client';

/**
 * Landing Page
 * Entry point for the application with login/signup
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Palette, Share2, Code } from 'lucide-react';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(true);
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl">
              <Gamepad2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Game Creator Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build stunning 2D platformer games with our intuitive visual editor
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <Code className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visual Level Editor</h3>
            <p className="text-sm text-gray-600">
              Drag and drop platforms, enemies, and collectibles to create your perfect level
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-3 bg-cyan-100 rounded-lg w-fit mb-4">
              <Zap className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Physics</h3>
            <p className="text-sm text-gray-600">
              Test your levels instantly with fully functional physics and collision detection
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <Palette className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Full Customization</h3>
            <p className="text-sm text-gray-600">
              Adjust physics, player abilities, colors, and more to match your vision
            </p>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          {showLogin ? (
            <LoginForm onToggle={() => setShowLogin(false)} />
          ) : (
            <SignupForm onToggle={() => setShowLogin(true)} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
