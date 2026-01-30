'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Gamepad2, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/play');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null; // Or a loading spinner if preferred, but null prevents flash before redirect
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-foreground overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center max-w-4xl text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-blue-400">
            Doppler
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge, compete with friends, and master your subjects in a whole new way.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6 w-full md:w-auto items-center justify-center"
        >
          <Button size="lg" className="text-lg px-8 h-12" onClick={() => router.push('/play')}>
            <Gamepad2 className="w-5 h-5 mr-2" />
            Play Now
          </Button>

          <div className="flex flex-col md:flex-row gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="text-lg px-8 h-12"
              onClick={() => router.push('/register')}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Register
            </Button>

            <Button variant="outline" size="lg" className="text-lg px-8 h-12" onClick={() => router.push('/login')}>
              <LogIn className="w-5 h-5 mr-2" />
              Log In
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-sm text-muted-foreground z-10"
      >
        © {new Date().getFullYear()} Doppler. All rights reserved.
      </motion.div>
    </div>
  );
}
