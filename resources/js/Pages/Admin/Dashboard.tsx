import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
  return (
    <AuthenticatedLayout header={
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Profile</h1>
      </div>
    }>
      <Head title="Admin Profile" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded shadow p-6">
          <div className="text-gray-800">This page is reserved for admin profile.</div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
