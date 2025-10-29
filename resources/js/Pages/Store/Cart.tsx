import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

interface CartItem {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price: number;
  qty: number;
  total: number;
}

export default function Cart({ items, subtotal }: { items: CartItem[]; subtotal: number }) {
  const { props } = usePage();
  const user = (props as any)?.auth?.user as { name?: string } | null;
  const frontendMenu = (props as any)?.frontendMenu as { id: number; name: string; items: Array<{ id: number; title: string; url: string; target: string; visible: boolean }> } | null;
  const flash = (props as any)?.flash as { success?: string; error?: string } | undefined;
  const [lines, setLines] = useState(items.map(i => ({ product_id: i.id, qty: i.qty })));
  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const updateQty = (id: number, qty: number) => {
    setLines(prev => prev.map(l => l.product_id === id ? { ...l, qty } : l));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Cart" />
      <div className="max-w-5xl mx-auto p-4">
        {flash?.success ? (
          <div className="mb-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2">{flash.success}</div>
        ) : null}
        {flash?.error ? (
          <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2">{flash.error}</div>
        ) : null}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <div className="flex items-center gap-4">
            {frontendMenu && frontendMenu.items?.length ? (
              <nav className="hidden md:flex items-center gap-3">
                {frontendMenu.items.filter((it:any)=>it.visible).map((it:any)=> (
                  <Link key={it.id} href={it.url} target={it.target} className="text-gray-700 hover:text-gray-900">
                    {it.title}
                  </Link>
                ))}
              </nav>
            ) : null}
            <Link href={route('store.home')} className="text-blue-600">Continue shopping →</Link>
            {user ? (
              <>
                <span className="text-gray-700 hidden sm:inline">Hi, {user.name || 'User'}</span>
                <Link href={route('dashboard')} className="text-blue-600">Dashboard</Link>
                <form method="post" action={route('logout')}> 
                  <input type="hidden" name="_token" value={csrf} />
                  <button className="text-gray-700 hover:underline">Logout</button>
                </form>
              </>
            ) : (
              <>
                <Link href={route('login')} className="text-blue-600">Login</Link>
                <Link href={route('register')} className="text-blue-600">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white rounded shadow">
          {items.length === 0 ? (
            <div className="p-6 text-gray-600">Your cart is empty.</div>
          ) : (
            <div className="divide-y">
              {items.map(item => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <Link href={route('products.show', item.slug)} className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || `https://picsum.photos/seed/${encodeURIComponent(item.slug || String(item.id))}/300/300`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e)=>{
                        const t = e.currentTarget as HTMLImageElement;
                        t.onerror = null;
                        t.src = `https://picsum.photos/seed/${encodeURIComponent(item.slug || String(item.id))}/300/300`;
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-600">${item.price.toFixed(2)}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={lines.find(l => l.product_id === item.id)?.qty ?? item.qty}
                    onChange={(e) => updateQty(item.id, parseInt(e.target.value || '0', 10))}
                    className="w-20 border rounded px-2 py-1"
                  />
                  <div className="w-24 text-right font-medium">${item.total.toFixed(2)}</div>
                  <form method="post" action={route('cart.remove', item.slug)}>
                    <input type="hidden" name="_token" value={csrf} />
                    <button className="ml-2 text-red-600 hover:underline">Remove</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="text-xl">Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
          <div className="flex gap-2">
            <form method="post" action={route('cart.update')} className="contents">
              <input type="hidden" name="_token" value={csrf} />
              <input type="hidden" name="lines" value={JSON.stringify(lines)} />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Update Cart</button>
            </form>
            <form method="post" action={route('cart.clear')}>
              <input type="hidden" name="_token" value={csrf} />
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Clear</button>
            </form>
            <form method="post" action={route('cart.checkout_cod')}>
              <input type="hidden" name="_token" value={csrf} />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded" disabled={items.length === 0}>Checkout (COD)</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
