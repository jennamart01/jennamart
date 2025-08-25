'use client';

import dynamic from 'next/dynamic';

// Dynamically import the admin layout to avoid SSR issues
const AdminLayout = dynamic(() => import('@/components/layout/AdminLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminLayout />;
}