import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Cat { id: number; name: string }
interface SectionCat { id: number; name: string; pivot: { product_limit: number } }

export default function Edit({ section, allCategories, homeStyle }: { section: { id: number; title: string; is_active: boolean; position: number; categories: SectionCat[] } | null; allCategories: Cat[]; homeStyle?: any }) {
  const isCreate = !section;
  const { data, setData, post, put, processing, errors } = useForm({
    id: section?.id as number | undefined,
    title: section?.title || '',
    is_active: section?.is_active ?? true,
    position: section?.position ?? 0,
    categories: (section?.categories || []).map(c => ({ id: c.id, product_limit: c.pivot?.product_limit ?? 4 })),
  });

  const toggleCategory = (id: number) => {
    if (data.categories.find(c => c.id === id)) {
      setData('categories', data.categories.filter(c => c.id !== id));
    } else {
      setData('categories', [...data.categories, { id, product_limit: 4 }]);
    }
  };

  const setLimit = (id: number, limit: number) => {
    setData('categories', data.categories.map(c => c.id === id ? { ...c, product_limit: limit } : c));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post(route('admin.homepage.sections.store'));
    } else {
      put(route('admin.homepage.sections.update', data.id as number));
    }
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">{isCreate ? 'New Section' : 'Edit Section'}</h1>}>
      <Head title={isCreate ? 'New Section' : 'Edit Section'} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isCreate ? 'New Section' : 'Edit Section'}</h1>
          <Link href={route('admin.homepage.sections.index')} className="text-blue-600">Back to Sections</Link>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-4">
          {/* Section Card Style snapshot for sections */}
          <div className="bg-gray-50 border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Section Card Style (applies to section product cards)</div>
              <Link href={route('dashboard.section_style.edit')} className="text-blue-600 text-sm">Edit Section Style</Link>
            </div>
            {homeStyle ? (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                <div>
                  <div className="font-medium text-gray-800">Card</div>
                  <div>Shadow: {homeStyle.card?.shadow || 'none'}</div>
                  <div>Rounded TL/TR/BL/BR: {homeStyle.card?.roundedTopLeft ?? 0}/{homeStyle.card?.roundedTopRight ?? 0}/{homeStyle.card?.roundedBottomLeft ?? 0}/{homeStyle.card?.roundedBottomRight ?? 0}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Image</div>
                  <div>Ratio: {homeStyle.image?.ratio || '1:1'}</div>
                  <div>Fit: {homeStyle.image?.fit || 'cover'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Overlay & Buttons</div>
                  <div>Position: {homeStyle.buttons?.position || 'over'}</div>
                  {homeStyle.buttons?.position==='over' ? (
                    <div>Overlay: {homeStyle.buttons?.overVisibility || 'hover'}, Content: {homeStyle.buttons?.overContent || 'buttons'}, V-Align: {homeStyle.buttons?.overVAlign || 'center'}</div>
                  ) : null}
                  <div>Price: {homeStyle.price?.show ? 'show' : 'hide'} | Hover actions: {homeStyle.hover?.show ? 'show' : 'hide'}</div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">No Section Style loaded. It will use defaults. You can edit it from the link above.</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700">Title</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={data.title} onChange={e=>setData('title', e.target.value)} />
              {errors.title && <div className="text-sm text-red-600">{errors.title}</div>}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Position</label>
              <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={data.position} onChange={e=>setData('position', Number(e.target.value || 0))} />
              {errors.position && <div className="text-sm text-red-600">{errors.position}</div>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={data.is_active} onChange={e=>setData('is_active', e.target.checked)} />
              <span>Active</span>
            </label>
          </div>

          <div>
            <div className="font-medium mb-2">Categories in this section</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allCategories.map(cat => {
                const selected = data.categories.find(c => c.id === cat.id);
                return (
                  <div key={cat.id} className={`border rounded p-3 flex items-center justify-between ${selected ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!selected} onChange={()=>toggleCategory(cat.id)} />
                      <span>{cat.name}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Limit</span>
                      <input type="number" min={1} max={50} disabled={!selected} value={selected ? selected.product_limit : 4} onChange={e=>setLimit(cat.id, Math.max(1, Math.min(50, Number(e.target.value || 1))))} className="w-20 border rounded px-2 py-1 disabled:bg-gray-100" />
                    </div>
                  </div>
                );
              })}
            </div>
            {errors['categories'] && <div className="text-sm text-red-600">{errors['categories'] as any}</div>}
          </div>

          <div>
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{processing ? 'Saving...' : (isCreate ? 'Create' : 'Save')}</button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
