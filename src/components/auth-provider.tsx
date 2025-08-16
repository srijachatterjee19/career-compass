"use client";

import AuthContextInternalProvider from '@/contexts/AuthContext'; // Renamed internal provider
import type { ReactNode } from 'react';

// This component is primarily to ensure AuthContextInternalProvider is a client component
// and can be used in the server-rendered RootLayout.
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextInternalProvider>{children}</AuthContextInternalProvider>;
}
