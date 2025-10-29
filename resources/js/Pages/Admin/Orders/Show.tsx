import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface OrderItem {
  id: number;
  product?: { id: number; name: string; slug: string } | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  ship_line1: string;
  ship_line2?: string | null;
  ship_city: string;
  ship_state?: string | null;
  ship_postal_code?: string | null;
  ship_country: string;
  items: OrderItem[];
}

export default function Show({ order }: { order: Order }) {
  const { data, setData, put, processing } = useForm({ status: order.status, payment_status: order.payment_status });
  const flash = (window as any).Ziggy ? ((window as any).Inertia?.page?.props?.flash as { success?: string; error?: string } | undefined) : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/orders/${order.id}`);
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">Order #{order.id}</h1>}>
      <Head title={`Order #${order.id}`} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {flash?.success ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2">{flash.success}</div>
        ) : null}
        {flash?.error ? (
          <div className="rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2">{flash.error}</div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <div className="flex items-center gap-2">
            {order.status !== 'cancelled' ? (
              <form method="post" action={`/admin/orders/${order.id}/cancel`} onSubmit={(e)=>{ if(!confirm('Cancel this order?')) e.preventDefault(); }}>
                <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content} />
                <button className="bg-red-600 text-white px-3 py-1 rounded">Cancel Order</button>
              </form>
            ) : null}
            <form method="post" action={`/admin/orders/${order.id}/mark-paid`} onSubmit={(e)=>{ if(!confirm('Mark order as paid?')) e.preventDefault(); }}>
              <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content} />
              <button className="bg-emerald-600 text-white px-3 py-1 rounded">Mark Paid</button>
            </form>
            <form method="post" action={`/admin/orders/${order.id}/mark-shipped`} onSubmit={(e)=>{ if(!confirm('Mark order as shipped?')) e.preventDefault(); }}>
              <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content} />
              <button className="bg-blue-600 text-white px-3 py-1 rounded">Mark Shipped</button>
            </form>
            <form method="post" action={`/admin/orders/${order.id}/mark-completed`} onSubmit={(e)=>{ if(!confirm('Mark order as completed?')) e.preventDefault(); }}>
              <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content} />
              <button className="bg-indigo-600 text-white px-3 py-1 rounded">Mark Completed</button>
            </form>
            <form method="post" action={`/admin/orders/${order.id}`} onSubmit={(e)=>{ if(!confirm('Delete this order? This cannot be undone.')) e.preventDefault(); }}>
              <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content} />
              <input type="hidden" name="_method" value="DELETE" />
              <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded">Delete</button>
            </form>
            <Link href={`/admin/orders`} className="text-blue-600">Back to Orders</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-2">Customer</div>
            <div>{order.customer_name}</div>
            <div className="text-gray-600 text-sm">{order.customer_email || '-'}</div>
            <div className="text-gray-600 text-sm">{order.customer_phone || '-'}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-2">Shipping</div>
            <div>{order.ship_line1}</div>
            {order.ship_line2 && <div>{order.ship_line2}</div>}
            <div>{order.ship_city}{order.ship_state ? `, ${order.ship_state}` : ''} {order.ship_postal_code || ''}</div>
            <div>{order.ship_country}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-2">Totals</div>
            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${order.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="font-medium mb-3">Items</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-600">
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(it => (
                  <tr key={it.id} className="border-b">
                    <td className="px-4 py-2">
                      {it.product ? (
                        <Link href={route('products.show', it.product.slug)} className="text-blue-600">{it.product.name}</Link>
                      ) : 'Product'}
                    </td>
                    <td className="px-4 py-2">{it.quantity}</td>
                    <td className="px-4 py-2">${it.unit_price.toFixed(2)}</td>
                    <td className="px-4 py-2">${it.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4">
          <div className="font-medium mb-3">Update Status</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Order Status</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={data.status} onChange={e=>setData('status', e.target.value)}>
                <option>pending</option>
                <option>paid</option>
                <option>shipped</option>
                <option>completed</option>
                <option>cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Payment Status</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={data.payment_status} onChange={e=>setData('payment_status', e.target.value)}>
                <option>unpaid</option>
                <option>paid</option>
                <option>refunded</option>
              </select>
            </div>
            <div className="flex items-end">
              <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
