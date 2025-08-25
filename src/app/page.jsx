'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Dynamically import the POS layout to avoid SSR issues
const POSLayout = dynamic(() => import('@/components/layout/POSLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Jennamart POS</h1>
        <p className="text-lg text-gray-600">Point of Sale System</p>
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

  return <POSLayout />;
}