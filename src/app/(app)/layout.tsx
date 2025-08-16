
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/layout/AppHeader';
import { Icons } from '@/components/icons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    console.log('🔍 AppLayout - User state changed:', { user, loading, pathname });
    
    if (!loading && !user) {
      console.log('❌ No user found, redirecting to login');
      router.replace('/login');
    } else if (user) {
      console.log('✅ User authenticated, allowing access to:', pathname);
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup' )) {
    console.log('🔄 AppLayout - Showing loading state:', { loading, user, pathname });
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
        <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading app...</p>
      </div>
    );
  }
  
  if (!user) {
     return null; 
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
