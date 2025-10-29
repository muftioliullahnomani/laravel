import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

interface Paginated<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({ users }: { users: Paginated<User> }) {
  const { data, setData, get, processing } = useForm({ q: '' });
  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    get(`/admin/users?${params.toString()}`);
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Manage Users</h1>}>
      <Head title="Manage Users" />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Users</h1>
          <Link href={route('admin.users.create')} className="bg-emerald-600 text-white px-4 py-2 rounded">New User</Link>
        </div>

        <form onSubmit={submit} className="mb-4 flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search (name or email)" value={data.q} onChange={e=>setData('q', e.target.value)} />
          <button disabled={processing} className="bg-blue-600 text-white px-3 py-2 rounded">Search</button>
        </form>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.is_admin ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 flex gap-2 items-center">
                    <Link href={route('admin.users.edit', u.id)} className="text-blue-600">Edit</Link>
                    {u.is_admin ? (
                      <form method="post" action={route('admin.users.demote', u.id)}>
                        <input type="hidden" name="_token" value={csrf} />
                        <button type="submit" className="text-amber-700">Demote</button>
                      </form>
                    ) : (
                      <form method="post" action={route('admin.users.promote', u.id)}>
                        <input type="hidden" name="_token" value={csrf} />
                        <button type="submit" className="text-emerald-700">Promote</button>
                      </form>
                    )}
                    <form method="post" action={route('admin.users.destroy', u.id)} onSubmit={(e)=>{ if(!confirm('Delete this user?')) e.preventDefault(); }}>
                      <input type="hidden" name="_token" value={csrf} />
                      <input type="hidden" name="_method" value="DELETE" />
                      <button type="submit" className="text-red-600">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {users.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
