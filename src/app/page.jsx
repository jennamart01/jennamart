'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Dynamically import the client-side layout to avoid SSR issues
const ClientLayout = dynamic(() => import('@/components/layout/ClientLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">FreePos</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return <ClientLayout />;
}