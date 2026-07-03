import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { appConfig } from '@/config';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-dot-pattern opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {appConfig.name}
          </h1>
          <p className="mt-2 text-sm text-secondary-400">
            Manage your fleet operations efficiently
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-secondary-500">
          &copy; {new Date().getFullYear()} {appConfig.name}. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
