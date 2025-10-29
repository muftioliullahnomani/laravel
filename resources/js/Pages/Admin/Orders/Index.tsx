import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Order {
  id: number;
  customer_name: string;
  customer_email?: string | null;
  status: string;
  payment_status: string;
  total: number;
}

interface Paginated<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({ orders, filters }: { orders: Paginated<Order>; filters: { q?: string; status?: string; payment_status?: string } }) {
  const { data, setData, get, processing } = useForm({ q: filters.q || '', status: filters.status || '', payment_status: filters.payment_status || '' });
  const [selected, setSelected] = React.useState<number[]>([]);
  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
  const [bulkAction, setBulkAction] = React.useState<string>('cancel');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    if (data.status) params.set('status', data.status);
    if (data.payment_status) params.set('payment_status', data.payment_status);
    get(`/admin/orders?${params.toString()}`);
  };

  const allIdsOnPage = React.useMemo(()=> orders.data.map(o=>o.id), [orders]);
  const allSelectedOnPage = allIdsOnPage.length>0 && allIdsOnPage.every(id => selected.includes(id));
  const toggleAll = (checked: boolean) => {
    if (checked) setSelected(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
    else setSelected(prev => prev.filter(id => !allIdsOnPage.includes(id)));
  };
  const toggleOne = (id: number, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(x => x!==id));
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Manage Orders</h1>}>
      <Head title="Manage Orders" />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Orders</h1>
        </div>

        <form onSubmit={submit} className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search (ID, email, name)" value={data.q} onChange={e=>setData('q', e.target.value)} />
          <select className="border rounded px-3 py-2" value={data.status} onChange={e=>setData('status', e.target.value)}>
            <option value="">All statuses</option>
            <option>pending</option>
            <option>paid</option>
            <option>shipped</option>
            <option>completed</option>
            <option>cancelled</option>
          </select>
          <select className="border rounded px-3 py-2" value={data.payment_status} onChange={e=>setData('payment_status', e.target.value)}>
            <option value="">All payment statuses</option>
            <option>unpaid</option>
            <option>paid</option>
            <option>refunded</option>
          </select>
          <button disabled={processing} className="bg-blue-600 text-white px-3 py-2 rounded">Filter</button>
        </form>

        <div className="bg-white rounded shadow overflow-x-auto">
          <div className="p-3 border-b flex items-center gap-2">
            <form method="post" action="/admin/orders-bulk" className="flex items-center gap-2">
              <input type="hidden" name="_token" value={csrf} />
              {selected.map(id => (
                <input key={id} type="hidden" name="ids[]" value={id} />
              ))}
              <select name="action" value={bulkAction} onChange={(e)=>setBulkAction(e.target.value)} className="border rounded px-2 py-1">
                <option value="cancel">Mark Cancelled</option>
                <option value="mark-paid">Mark Paid</option>
                <option value="mark-shipped">Mark Shipped</option>
                <option value="mark-completed">Mark Completed</option>
                <option value="delete">Delete</option>
              </select>
              <button className="bg-gray-800 text-white px-3 py-1 rounded" disabled={selected.length===0}>Apply to selected ({selected.length})</button>
            </form>
          </div>
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th className="px-4 py-2">
                  <input type="checkbox" checked={allSelectedOnPage} onChange={e=>toggleAll(e.target.checked)} />
                </th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.map(o => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input type="checkbox" checked={selected.includes(o.id)} onChange={e=>toggleOne(o.id, e.target.checked)} />
                  </td>
                  <td className="px-4 py-2">{o.id}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-gray-500">{o.customer_email || '-'}</div>
                  </td>
                  <td className="px-4 py-2">{o.status}</td>
                  <td className="px-4 py-2">{o.payment_status}</td>
                  <td className="px-4 py-2">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <Link href={route('admin.orders.show', o.id)} className="text-blue-600">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {orders.links.map((l, idx) => (
            <Link key={idx} href={l.url || '#'} className={`px-3 py-1 rounded border ${l.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
