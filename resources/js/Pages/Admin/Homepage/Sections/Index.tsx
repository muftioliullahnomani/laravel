import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface SectionCat { id: number; name: string; pivot: { product_limit: number }; }
interface Section { id: number; title: string; is_active: boolean; position: number; categories: SectionCat[] }
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[] }

export default function Index({ sections }: { sections: Paginated<Section> }) {
  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Homepage Sections</h1>}>
      <Head title="Homepage Sections" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Sections</h1>
          <Link href={route('admin.homepage.sections.create')} className="bg-emerald-600 text-white px-4 py-2 rounded">New Section</Link>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Position</th>
                <th className="px-4 py-2">Categories</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.data.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.title}</td>
                  <td className="px-4 py-2">{s.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{s.position}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {s.categories.length === 0 ? '—' : s.categories.map(c=> `${c.name} (${c.pivot.product_limit})`).join(', ')}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={route('admin.homepage.sections.edit', s.id)} className="text-blue-600">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {sections.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
