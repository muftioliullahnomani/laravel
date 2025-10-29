import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent?: { id: number; name: string } | null;
}

interface Paginated<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({ categories }: { categories: Paginated<Category> }) {
  const { data, setData, get, processing } = useForm({ q: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    get(`/admin/categories?${params.toString()}`);
  };

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Manage Categories</h1>}>
      <Head title="Manage Categories" />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <Link href={route('admin.categories.create')} className="bg-emerald-600 text-white px-4 py-2 rounded">New Category</Link>
        </div>

        <form onSubmit={submit} className="mb-4 flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search (name or slug)" value={data.q} onChange={e=>setData('q', e.target.value)} />
          <button disabled={processing} className="bg-blue-600 text-white px-3 py-2 rounded">Search</button>
        </form>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Parent</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.data.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.slug}</td>
                  <td className="px-4 py-2">{c.parent?.name || '-'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={route('admin.categories.edit', c.id)} className="text-blue-600">Edit</Link>
                    <form method="post" action={route('admin.categories.destroy', c.id)} onSubmit={(e)=>{ if(!confirm('Delete this category?')) e.preventDefault(); }}>
                      <input type="hidden" name="_token" value={csrf} />
                      <input type="hidden" name="_method" value="DELETE" />
                      <button className="text-red-600">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {categories.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
