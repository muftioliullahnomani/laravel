import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface CategoryForm {
  id?: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string | null;
}

export default function Form({ category, parents }: { category: Partial<CategoryForm> | null; parents: { id: number; name: string }[] }) {
  const isEdit = !!category?.id;
  const { data, setData, post, put, processing, errors } = useForm<CategoryForm>({
    id: category?.id,
    name: category?.name || '',
    slug: category?.slug || '',
    parent_id: category?.parent_id ?? null,
    description: (category?.description as string) || '',
  });

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.categories.update', data.id));
    } else {
      post(route('admin.categories.store'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title={isEdit ? 'Edit Category' : 'New Category'} />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Category' : 'New Category'}</h1>
          <Link href={route('admin.categories.index')} className="text-blue-600">Back to list</Link>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-4">
          <input type="hidden" name="_token" value={csrf} />

          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} />
            {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Slug</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.slug} onChange={e=>setData('slug', e.target.value)} placeholder="Leave blank to auto-generate (on create)" />
            {errors.slug && <div className="text-sm text-red-600">{errors.slug}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Parent</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={data.parent_id ?? ''} onChange={e=>setData('parent_id', e.target.value ? Number(e.target.value) : null)}>
              <option value="">None</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.parent_id && <div className="text-sm text-red-600">{errors.parent_id}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea className="mt-1 w-full border rounded px-3 py-2" value={data.description || ''} onChange={e=>setData('description', e.target.value)} />
            {errors.description && <div className="text-sm text-red-600">{errors.description}</div>}
          </div>

          <div className="pt-2">
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
