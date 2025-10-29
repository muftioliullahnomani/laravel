import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

type ProductType = { id: number; name: string; slug: string; description?: string; image_url?: string | null; price: number; category?: { name: string; slug: string } };
type ModelType = { id: number; is_active: boolean; definition?: { layout?: string; elements?: Array<{ id: string; type: string; props?: any; visible?: boolean; order?: number }> } } | null;

export default function ProductShow({ product, model }: { product: ProductType; model?: ModelType }) {
  const { props } = usePage();
  const user = (props as any)?.auth?.user as { name?: string } | null;
  const frontendMenu = (props as any)?.frontendMenu as { id: number; name: string; items: Array<{ id: number; title: string; url: string; target: string; visible: boolean }> } | null;
  const def = model && model.is_active ? (model.definition || undefined) : undefined;

  const renderByModel = () => {
    const els = def?.elements?.filter(e => e.visible !== false) || [];
    const ordered = [...els].sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));
    if (!ordered.length) return null;
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded shadow p-4">
        {/* Simple two-column layout: image left if present, others right */}
        <div className="space-y-3">
          {ordered.filter(e => e.type === 'image').map(e => {
            const ratio = e.props?.ratio || '1:1';
            const fit = e.props?.fit || 'cover';
            const rounded = e.props?.rounded || 'rounded';
            const shadow = e.props?.shadow || '';
            const border = e.props?.border ? 'border' : '';
            const src = e.props?.src || product.image_url || '';
            const alt = e.props?.alt || product.name;
            const link = e.props?.link as string | undefined;
            const newTab = !!e.props?.newTab;
            const showCaption = !!e.props?.showCaption;
            const caption = e.props?.caption || '';
            const htmlBelow = e.props?.htmlBelow || '';

            const imgEl = (
              <img
                src={src}
                alt={alt}
                className={`w-full h-full object-${fit}`}
                referrerPolicy="no-referrer"
                onError={(ev)=>{ const t=ev.currentTarget as HTMLImageElement; t.onerror=null; t.src = `https://picsum.photos/seed/${encodeURIComponent(product.slug || String(product.id))}/640/640`; }}
              />
            );

            const box = (
              <div className={`${rounded} ${shadow} ${border} overflow-hidden bg-gray-100 ${ratio==='auto' ? '' : 'aspect-square'}`}>
                {ratio==='16:9' ? (
                  <div className={`w-full relative`} style={{ paddingTop: '56.25%' }}>
                    <div className="absolute inset-0">{imgEl}</div>
                  </div>
                ) : ratio==='4:3' ? (
                  <div className={`w-full relative`} style={{ paddingTop: '75%' }}>
                    <div className="absolute inset-0">{imgEl}</div>
                  </div>
                ) : ratio==='1:1' ? (
                  <div className="w-full h-full">{imgEl}</div>
                ) : (
                  <div className="w-full">{imgEl}</div>
                )}
              </div>
            );

            const wrapped = link ? (
              <a key={e.id} href={link} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}>
                {box}
              </a>
            ) : (
              <div key={e.id}>{box}</div>
            );

            return (
              <div key={e.id}>
                {wrapped}
                {showCaption && caption ? (
                  <div className="text-sm text-gray-600 mt-1">{caption}</div>
                ) : null}
                {htmlBelow ? (
                  <div className="prose max-w-none mt-1" dangerouslySetInnerHTML={{ __html: htmlBelow }} />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          {ordered.filter(e => e.type !== 'image').map(e => {
            if (e.type === 'title') {
              const Tag = (e.props?.tag || 'h1') as keyof JSX.IntrinsicElements;
              return <Tag key={e.id} className="text-2xl font-semibold">{product.name}</Tag>;
            }
            if (e.type === 'price') {
              return <div key={e.id} className="text-3xl font-bold">${product.price.toFixed(2)}</div>;
            }
            if (e.type === 'description') {
              return <div key={e.id} className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description' }} />;
            }
            if (e.type === 'badge') {
              const text = e.props?.text || 'Badge';
              const bg = e.props?.bg || '#DCFCE7';
              const color = e.props?.color || '#166534';
              return <span key={e.id} style={{ backgroundColor: bg, color }} className="inline-block px-2 py-1 rounded text-xs font-medium">{text}</span>;
            }
            if (e.type === 'divider') {
              return <hr key={e.id} className="border-t" />;
            }
            if (e.type === 'html') {
              return <div key={e.id} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: e.props?.html || '' }} />;
            }
            return null;
          })}
          <form method="post" action={route('cart.add', product.slug)} className="mt-2 flex gap-2 items-center">
            <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
            <input type="number" name="qty" min={1} defaultValue={1} className="w-24 border rounded px-3 py-2" />
            <button className="bg-emerald-600 text-white px-5 py-2 rounded">Add to cart</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title={product.name} />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <Link href={route('store.home')} className="text-blue-600">← Back to store</Link>
          <div className="flex items-center gap-4">
            {frontendMenu && frontendMenu.items?.length ? (
              <nav className="hidden md:flex items-center gap-3">
                {frontendMenu.items
                  .filter((it:any)=>it.visible)
                  .filter((it:any)=> {
                    const t = String(it.title || '').trim().toLowerCase();
                    return t !== 'admin' && t !== 'useradmin';
                  })
                  .map((it:any)=> (
                  <Link key={it.id} href={it.url} target={it.target} className="text-gray-700 hover:text-gray-900">
                    {it.title}
                  </Link>
                ))}
              </nav>
            ) : null}
            {user ? (
              <>
                <span className="text-gray-700 hidden sm:inline">Hi, {user.name || 'User'}</span>
                <Link href={route('dashboard')} className="text-blue-600">Dashboard</Link>
                <form method="post" action={route('logout')}> 
                  <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
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

        {def ? (
          renderByModel()
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded shadow p-4">
            <div>
              <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      const seed = encodeURIComponent(product.slug || String(product.id));
                      target.src = `https://picsum.photos/seed/${seed}/640/640`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <div className="mt-1 text-gray-600">{product.category ? (
                <Link href={route('store.home', { category: product.category.slug })} className="underline">{product.category.name}</Link>
              ) : null}</div>
              <div className="mt-3 text-3xl font-bold">${product.price.toFixed(2)}</div>
              <div className="mt-4 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description' }} />

              <form method="post" action={route('cart.add', product.slug)} className="mt-6 flex gap-2 items-center">
                <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
                <input type="number" name="qty" min={1} defaultValue={1} className="w-24 border rounded px-3 py-2" />
                <button className="bg-emerald-600 text-white px-5 py-2 rounded">Add to cart</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
