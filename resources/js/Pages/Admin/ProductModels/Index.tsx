import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProductModel { id: number; name: string; is_active: boolean }
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }

export default function Index({ models }: { models: Paginated<ProductModel> }) {
  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Product Models</h1>}>
      <Head title="Product Models" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Models</h1>
          <Link href={route('admin.product_models.create')} className="bg-emerald-600 text-white px-4 py-2 rounded">New Model</Link>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.data.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{m.id}</td>
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">
                    <Link href={route('admin.product_models.edit', m.id)} className="text-blue-600">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {models.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
