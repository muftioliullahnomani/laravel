import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface UserForm {
  id?: number;
  name: string;
  email: string;
  password?: string;
  is_admin: boolean;
}

export default function Form({ user }: { user: Partial<UserForm> | null }) {
  const isEdit = !!user?.id;
  const { data, setData, post, put, processing, errors } = useForm<UserForm>({
    id: user?.id,
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    is_admin: (user?.is_admin as boolean) ?? false,
  });

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.users.update', data.id));
    } else {
      post(route('admin.users.store'));
    }
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">{isEdit ? 'Edit User' : 'New User'}</h1>}>
      <Head title={isEdit ? 'Edit User' : 'New User'} />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit User' : 'New User'}</h1>
          <Link href={route('admin.users.index')} className="text-blue-600">Back to list</Link>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-4">
          <input type="hidden" name="_token" value={csrf} />

          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} />
            {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.email} onChange={e=>setData('email', e.target.value)} />
            {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password {isEdit ? '(leave blank to keep current)' : ''}</label>
            <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={data.password || ''} onChange={e=>setData('password', e.target.value)} />
            {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
          </div>

          <div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={data.is_admin} onChange={e=>setData('is_admin', e.target.checked)} />
              <span>Administrator</span>
            </label>
            {errors.is_admin && <div className="text-sm text-red-600">{errors.is_admin}</div>}
          </div>

          <div className="pt-2">
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
