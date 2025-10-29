import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Menu { id?: number; name: string; location: string; is_active: boolean }
interface MenuItem { id: number; title: string; url: string; position: number; parent_id?: number | null; target: string; visible: boolean; icon?: string | null; children?: MenuItem[] }

export default function Edit({ menu, items }: { menu: Menu | null; items: MenuItem[] }) {
  const isCreate = !menu;
  const { data, setData, post, put, processing, errors } = useForm<Menu>({
    id: menu?.id,
    name: menu?.name || '',
    location: menu?.location || 'frontend',
    is_active: menu?.is_active ?? true,
  });

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const submitMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post(route('admin.menus.store'));
    } else {
      put(route('admin.menus.update', data.id));
    }
  };

  const deleteItem = (itemId: number) => {
    if (!confirm('Delete this item?')) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.menus.items.delete', [data.id as number, itemId]);
    form.innerHTML = `<input type="hidden" name="_token" value="${csrf}"><input type="hidden" name="_method" value="DELETE">`;
    document.body.appendChild(form);
    form.submit();
  };

  // Add Item form (Inertia)
  const addForm = useForm<{ title: string; url: string; parent_id: string | number | null; target: string; visible: boolean; icon: string }>({ title: '', url: '', parent_id: '', target: '_self', visible: true, icon: '' });

  const flatItems = useMemo(() => {
    const acc: MenuItem[] = [];
    const walk = (list: MenuItem[], depth = 0) => {
      list.forEach(i => {
        acc.push({ ...i, title: `${'— '.repeat(depth)}${i.title}` });
        if (i.children && i.children.length) walk(i.children, depth + 1);
      });
    };
    walk(items || []);
    return acc;
  }, [items]);

  // Simple reorder helpers: move up/down within same parent
  const move = (id: number, dir: -1 | 1) => {
    const parentId = flatItems.find(i => i.id === id)?.parent_id ?? null;
    const siblings = flatItems.filter(i => (i.parent_id ?? null) === parentId).sort((a,b)=>a.position-b.position);
    const idx = siblings.findIndex(s => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const a = siblings[idx];
    const b = siblings[swapIdx];
    const orders = [
      { id: a.id, position: b.position, parent_id: parentId },
      { id: b.id, position: a.position, parent_id: parentId },
    ];
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.menus.items.reorder', data.id as number);
    form.innerHTML = `<input type="hidden" name="_token" value="${csrf}"><input type="hidden" name="orders" value='${JSON.stringify(orders)}'>`;
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">{isCreate ? 'New Menu' : `Edit Menu`}</h1>}>
      <Head title={isCreate ? 'New Menu' : `Edit Menu: ${menu?.name}`} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isCreate ? 'New Menu' : `Edit Menu`}</h1>
          <Link href={route('admin.menus.index')} className="text-blue-600">Back to Menus</Link>
        </div>

        <form onSubmit={submitMenu} className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} />
            {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm text-gray-700">Location</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={data.location} onChange={e=>setData('location', e.target.value)}>
              <option value="frontend">frontend</option>
              <option value="backend">backend</option>
              <option value="custom">custom</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={data.is_active} onChange={e=>setData('is_active', e.target.checked)} />
              <span>Active</span>
            </label>
            <button disabled={processing} className="ml-auto bg-emerald-600 text-white px-4 py-2 rounded">{isCreate ? 'Create' : 'Save'}</button>
          </div>
        </form>

        {!isCreate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-4">
              <div className="font-medium mb-3">Menu Structure</div>
              <div className="space-y-2">
                {items.length === 0 && <div className="text-gray-500">No items yet.</div>}
                {flatItems.map(i => (
                  <div key={i.id} className="flex items-center gap-2 border rounded px-3 py-2">
                    <div className="flex-1 truncate">{i.title}</div>
                    <button type="button" className="text-gray-600" onClick={()=>move(i.id, -1)}>↑</button>
                    <button type="button" className="text-gray-600" onClick={()=>move(i.id, 1)}>↓</button>
                    <details>
                      <summary className="cursor-pointer text-blue-600">Edit</summary>
                      <form method="post" action={route('admin.menus.items.update', [data.id as number, i.id])} className="mt-2 grid grid-cols-2 gap-2">
                        <input type="hidden" name="_token" value={csrf} />
                        <input type="hidden" name="_method" value="PUT" />
                        <input className="border rounded px-2 py-1 col-span-2" name="title" defaultValue={i.title.replace(/^—\s+/,'')} />
                        <input className="border rounded px-2 py-1 col-span-2" name="url" defaultValue={i.url} />
                        <select className="border rounded px-2 py-1" name="target" defaultValue={i.target}><option>_self</option><option>_blank</option></select>
                        <label className="inline-flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={i.visible} /> <span>Visible</span></label>
                        <input className="border rounded px-2 py-1" name="icon" placeholder="icon (optional)" defaultValue={i.icon || ''} />
                        <div className="col-span-2 flex gap-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded">Update</button>
                          <button type="button" onClick={()=>deleteItem(i.id)} className="text-red-600 px-3 py-1 rounded">Delete</button>
                        </div>
                      </form>
                    </details>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="font-medium mb-3">Add Menu Item</div>
              <form onSubmit={(e)=>{ e.preventDefault(); addForm.post(route('admin.menus.items.add', data.id as number), { preserveScroll: true, onSuccess: ()=> addForm.reset() }); }} className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Title</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={addForm.data.title} onChange={e=>addForm.setData('title', e.target.value)} />
                  {addForm.errors.title && <div className="text-sm text-red-600">{addForm.errors.title}</div>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700">URL</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={addForm.data.url} onChange={e=>addForm.setData('url', e.target.value)} placeholder="/path or https://..." />
                  {addForm.errors.url && <div className="text-sm text-red-600">{addForm.errors.url}</div>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700">Parent</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={addForm.data.parent_id as any} onChange={e=>addForm.setData('parent_id', e.target.value)}>
                      <option value="">None</option>
                      {flatItems.map(i => (
                        <option key={i.id} value={i.id}>{i.title.replace(/^—\s+/,'')}</option>
                      ))}
                    </select>
                    {addForm.errors.parent_id && <div className="text-sm text-red-600">{addForm.errors.parent_id}</div>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Target</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={addForm.data.target} onChange={e=>addForm.setData('target', e.target.value)}>
                      <option value="_self">_self</option>
                      <option value="_blank">_blank</option>
                    </select>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={addForm.data.visible} onChange={e=>addForm.setData('visible', e.target.checked)} /> <span>Visible</span></label>
                <div>
                  <label className="block text-sm text-gray-700">Icon</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={addForm.data.icon} onChange={e=>addForm.setData('icon', e.target.value)} />
                </div>
                <div>
                  <button disabled={addForm.processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{addForm.processing ? 'Adding...' : 'Add Item'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
