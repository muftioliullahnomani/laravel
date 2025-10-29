import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category { id: number; name: string; }
interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  is_active: boolean;
  category?: Category | null;
}

interface Paginated<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({ products }: { products: Paginated<Product> }) {
  const { data, setData, get, processing } = useForm({ q: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    get(`/admin/products?${params.toString()}`);
  };

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Manage Products</h1>}>
      <Head title="Manage Products" />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Link href={route('admin.products.create')} className="bg-emerald-600 text-white px-4 py-2 rounded">New Product</Link>
        </div>

        <form onSubmit={submit} className="mb-4 flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search name or slug" value={data.q} onChange={e=>setData('q', e.target.value)} />
          <button disabled={processing} className="bg-blue-600 text-white px-3 py-2 rounded">Search</button>
        </form>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.data.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      <Link href={`/products/${p.slug}`} target="_blank" className="text-blue-600 hover:underline">{p.name}</Link>
                    </div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </td>
                  <td className="px-4 py-2">{p.sku}</td>
                  <td className="px-4 py-2">{p.category?.name || '-'}</td>
                  <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">{p.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={route('admin.products.edit', p.id)} className="text-blue-600">Edit</Link>
                    <form method="post" action={route('admin.products.destroy', p.id)} onSubmit={(e)=>{ if(!confirm('Delete this product?')) e.preventDefault(); }}>
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
          {products.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
