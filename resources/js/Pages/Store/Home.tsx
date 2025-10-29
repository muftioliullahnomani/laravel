import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  price: number;
}

interface Paginated<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
}

type SectionBlock = { id: number; title: string; groups: { category: { id: number; name: string; slug?: string | null }; products: Product[] }[] };

export default function Home({ products, categories, sections, filters, homeStyle, cartCount }: { products: Paginated<Product>; categories: Category[]; sections?: SectionBlock[]; filters: { q?: string; category?: string }; homeStyle?: any; cartCount?: number }) {
  const { props } = usePage();
  const user = (props as any)?.auth?.user as { name?: string } | null;
  const frontendMenu = (props as any)?.frontendMenu as { id: number; name: string; items: Array<{ id: number; title: string; url: string; target: string; visible: boolean }> } | null;
  const { data, setData, get, processing } = useForm({ q: filters.q || '', category: filters.category || '' });

  // Currency switcher
  type Currency = 'USD' | 'BDT' | 'EUR';
  const [currency, setCurrency] = React.useState<Currency>(() => {
    try { const v = localStorage.getItem('currency'); return (v as Currency) || 'USD'; } catch { return 'USD'; }
  });
  React.useEffect(()=>{ try { localStorage.setItem('currency', currency); } catch {} }, [currency]);
  const rates: Record<Currency, { rate: number; symbol: string; suffix?: string }> = {
    USD: { rate: 1, symbol: '$' },
    BDT: { rate: 110, symbol: '৳' },
    EUR: { rate: 0.92, symbol: '€' },
  };
  const fmtPrice = (usd: number) => {
    const r = rates[currency];
    const val = usd * r.rate;
    return `${r.symbol}${val.toFixed(2)}`;
  };

  type CardStyle = {
    ratio: 'auto' | '1:1' | '4:3' | '16:9';
    fit: 'cover' | 'contain' | 'fill';
    rounded: '' | 'rounded' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
    shadow: '' | 'shadow-sm' | 'shadow' | 'shadow-md' | 'shadow-lg';
    showPrice: boolean;
    showHover: boolean;
  };
  const defaultStyle: CardStyle = { ratio: '1:1', fit: 'cover', rounded: 'rounded', shadow: 'shadow', showPrice: true, showHover: true };
  // Use nested home scope when available for initial defaults
  const initFrom: any = (homeStyle && (homeStyle.home || homeStyle.section)) ? (homeStyle.home || {}) : (homeStyle || {});
  const [style, setStyle] = React.useState<CardStyle>({ ...defaultStyle, ...(initFrom?.image ? {
    ratio: initFrom?.image?.ratio ?? defaultStyle.ratio,
    fit: initFrom?.image?.fit ?? defaultStyle.fit,
  } : {}), ...(initFrom?.card ? {
    rounded: (initFrom.card && (initFrom.card.roundedTopLeft===initFrom.card.roundedTopRight && initFrom.card.roundedTopLeft===initFrom.card.roundedBottomLeft && initFrom.card.roundedTopLeft===initFrom.card.roundedBottomRight))
      ? (initFrom.card.roundedTopLeft>=9999 ? 'rounded-full' : (initFrom.card.roundedTopLeft>=12 ? 'rounded-xl' : (initFrom.card.roundedTopLeft>=8 ? 'rounded-lg' : (initFrom.card.roundedTopLeft>=6 ? 'rounded-md' : (initFrom.card.roundedTopLeft>0 ? 'rounded' : '')))))
      : defaultStyle.rounded,
    shadow: initFrom?.card?.shadow ?? defaultStyle.shadow,
  } : {}),
  showPrice: initFrom?.price?.show ?? defaultStyle.showPrice,
  showHover: initFrom?.hover?.show ?? defaultStyle.showHover,
  });

  // Resolve legacy vs nested styles
  const home = (homeStyle && (homeStyle.home || homeStyle.section)) ? (homeStyle.home || {}) : (homeStyle || {});
  const sectionStyle = (homeStyle && (homeStyle.home || homeStyle.section)) ? (homeStyle.section || {}) : (homeStyle || {});

  // Prefer latest server-sent values when present
  const ratio = home?.image?.ratio ?? style.ratio;
  const fit = home?.image?.fit ?? style.fit;
  const shadow = home?.card?.shadow ?? style.shadow;
  const showPrice = (home?.price?.show ?? style.showPrice);
  // Section-specific fallbacks
  const sectionRatio = (sectionStyle?.image?.ratio ?? ratio);
  const sectionFit = (sectionStyle?.image?.fit ?? fit);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    if (data.category) params.set('category', data.category);
    get(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Store" />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Storefront</h1>
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
            <select className="border rounded px-2 py-1" value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
              <option value="USD">USD</option>
              <option value="BDT">BDT</option>
              <option value="EUR">EUR</option>
            </select>
            {/* Card Style editor removed from Home; configure from Admin Dashboard */}
            {user ? (
              <>
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
        

        <form onSubmit={submit} className="flex flex-col md:flex-row items-stretch gap-2 mb-4">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Search products..."
            value={data.q}
            onChange={(e) => setData('q', e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={data.category}
            onChange={(e) => setData('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.data.map((p) => (
            <div
              key={p.id}
              className={`${shadow} flex flex-col`}
              style={{
                backgroundColor: home?.card?.bgColor || '#ffffff',
                padding: `${Number(home?.card?.padding ?? 12)}px`,
                border: home?.card?.border?.show
                  ? `${Number(home?.card?.border?.width ?? 1)}px ${home?.card?.border?.style || 'solid'} ${home?.card?.border?.color || '#e5e7eb'}`
                  : 'none',
                borderTopLeftRadius: `${home?.card?.roundedTopLeft ?? 8}px`,
                borderTopRightRadius: `${home?.card?.roundedTopRight ?? 8}px`,
                borderBottomLeftRadius: `${home?.card?.roundedBottomLeft ?? 8}px`,
                borderBottomRightRadius: `${home?.card?.roundedBottomRight ?? 8}px`,
              }}
            >
              <div className="group relative">
                <Link href={route('products.show', p.slug)} className="block">
                  <div
                    className={`overflow-hidden bg-gray-100`}
                    style={{
                      borderTopLeftRadius: `${home?.image?.roundedTopLeft ?? 8}px`,
                      borderTopRightRadius: `${home?.image?.roundedTopRight ?? 8}px`,
                      borderBottomLeftRadius: `${home?.image?.roundedBottomLeft ?? 8}px`,
                      borderBottomRightRadius: `${home?.image?.roundedBottomRight ?? 8}px`,
                      ...((home?.image?.ratio && home?.image?.ratio !== 'auto')
                        ? {
                          aspectRatio:
                              home?.image?.ratio === '1:1'
                                ? '1 / 1'
                                : home?.image?.ratio === '4:3'
                                ? '4 / 3'
                                : home?.image?.ratio === '16:9'
                                ? '16 / 9'
                                : home?.image?.ratio === 'custom'
                                ? `${Math.max(1, Number(home?.image?.customW || 1))} / ${Math.max(1, Number(home?.image?.customH || 1))}`
                                : undefined,
                          }
                        : {}),
                    }}
                  >
                    {/* Badge */}
                    {home?.badge?.show ? (
                      <span
                        className="absolute z-10 px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                        style={{
                          top: home.badge.position?.includes('top') ? 8 : 'auto',
                          bottom: home.badge.position?.includes('bottom') ? 8 : 'auto',
                          left: home.badge.position?.includes('left') ? 8 : 'auto',
                          right: home.badge.position?.includes('right') ? 8 : 'auto',
                        }}
                      >
                        {home.badge.text || 'Badge'}
                      </span>
                    ) : null}
                    {ratio==='16:9' ? (
                      <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
                        <div className="absolute inset-0">
                          <img
                            src={(home?.image?.placeholderMode==='always' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (home?.image?.placeholderMode==='auto' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                            alt={p.name}
                            className={`w-full h-full object-${fit}`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.onerror = null;
                              target.src = home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                            }}
                          />
                        </div>
                      </div>
                    ) : ratio==='4:3' ? (
                      <div className="w-full relative" style={{ paddingTop: '75%' }}>
                        <div className="absolute inset-0">
                          <img
                            src={(home?.image?.placeholderMode==='always' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (home?.image?.placeholderMode==='auto' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                            alt={p.name}
                            className={`w-full h-full object-${fit}`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.onerror = null;
                              target.src = home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                            }}
                          />
                        </div>
                      </div>
                    ) : ratio==='1:1' ? (
                      <img
                        src={(home?.image?.placeholderMode==='always' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (home?.image?.placeholderMode==='auto' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                        alt={p.name}
                        className={`w-full h-full object-${fit}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                        }}
                      />
                    ) : (
                      <img
                        src={(home?.image?.placeholderMode==='always' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (home?.image?.placeholderMode==='auto' ? (home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                        alt={p.name}
                        className={`w-full h-auto object-${fit}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = home?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                        }}
                      />
                    )}
                  </div>
                </Link>
                {/* Buttons over image */}
                {home?.buttons?.show && home?.buttons?.position === 'over' ? (
                  <div
                    className={`pointer-events-none absolute inset-0 flex justify-center ${home?.buttons?.overVAlign === 'top' ? 'items-start pt-3' : (home?.buttons?.overVAlign === 'bottom' ? 'items-end pb-3' : 'items-center')} ${home?.buttons?.overVisibility === 'hover' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}
                  >
                    <div className={`flex ${home?.buttons?.overContent === 'both' ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                      {(['buttons','both'].includes(home?.buttons?.overContent)) ? (
                        <div className="flex items-center gap-2">
                          {home?.addToCart?.show ? (
                            <form method="post" action={route('cart.add', p.slug)} className="pointer-events-auto" onClick={(e)=>e.stopPropagation()} onSubmit={(e)=>e.stopPropagation()}>
                              <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
                              <button
                                title="Add to cart"
                                className={`${home?.buttons?.style==='outline' ? 'bg-white/80 text-emerald-700 border border-emerald-600' : 'text-white'} ${home?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`}
                                style={{ borderRadius: `${home?.buttons?.rounded ?? 9999}px`, ...(home?.buttons?.style==='solid' ? { backgroundColor: home?.buttons?.bgColor || '#059669', opacity: Number(home?.buttons?.opacity ?? 100)/100 } : {}) }}
                                onClick={(e)=>e.stopPropagation()}
                              >
                                {(home?.buttons?.contentMode==='icon' || home?.buttons?.contentMode==='both') ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
                                ) : null}
                                {(home?.buttons?.contentMode==='text' || home?.buttons?.contentMode==='both') ? 'Add to cart' : null}
                              </button>
                            </form>
                          ) : null}
                          {home?.viewDetails?.show ? (
                            <Link href={route('products.show', p.slug)} title="Details" className={`pointer-events-auto ${home?.buttons?.style==='outline' ? 'bg-white/80 text-blue-700 border border-blue-600' : 'text-white'} ${home?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${home?.buttons?.rounded ?? 9999}px`, ...(home?.buttons?.style==='solid' ? { backgroundColor: home?.buttons?.bgColor || '#2563eb', opacity: Number(home?.buttons?.opacity ?? 100)/100 } : {}) }}>
                              {(home?.buttons?.contentMode==='icon' || home?.buttons?.contentMode==='both') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                              ) : null}
                              {(home?.buttons?.contentMode==='text' || home?.buttons?.contentMode==='both') ? 'Details' : null}
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                      {( ['text','both'].includes(home?.buttons?.overContent) ) ? (
                        <span className="pointer-events-auto inline-block text-sm font-medium px-2 py-1 rounded bg-black/50 text-white">{p.name}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              {/* Alt text below */}
              {home?.altText?.show && home?.altText?.position==='below' ? (
                <div className="text-xs text-gray-600 mt-1">{p.name}</div>
              ) : null}
              <Link href={route('products.show', p.slug)} className="mt-2 font-medium line-clamp-2">{p.name}</Link>
              {showPrice ? (
                <div className="mt-1 text-gray-700">{fmtPrice(p.price)}</div>
              ) : null}
              {/* Buttons below image */}
              {home?.buttons?.show && home?.buttons?.position === 'below' ? (
                <div className="mt-2 flex items-center gap-2">
                  {home?.addToCart?.show ? (
                    <form method="post" action={route('cart.add', p.slug)}>
                      <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
                      <button className={`${home?.buttons?.style==='outline' ? 'bg-white text-emerald-700 border border-emerald-600' : 'text-white'} ${home?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${home?.buttons?.rounded ?? 9999}px`, ...(home?.buttons?.style==='solid' ? { backgroundColor: home?.buttons?.bgColor || '#059669', opacity: Number(home?.buttons?.opacity ?? 100)/100 } : {}) }}>
                        {(home?.buttons?.contentMode==='icon' || home?.buttons?.contentMode==='both') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
                        ) : null}
                        {(home?.buttons?.contentMode==='text' || home?.buttons?.contentMode==='both') ? 'Add to cart' : null}
                      </button>
                    </form>
                  ) : null}
                  {home?.viewDetails?.show ? (
                    <Link href={route('products.show', p.slug)} className={`${home?.buttons?.style==='outline' ? 'bg-white text-blue-700 border border-blue-600' : 'text-white'} ${home?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${home?.buttons?.rounded ?? 9999}px`, ...(home?.buttons?.style==='solid' ? { backgroundColor: home?.buttons?.bgColor || '#2563eb', opacity: Number(home?.buttons?.opacity ?? 100)/100 } : {}) }}>
                      {(home?.buttons?.contentMode==='icon' || home?.buttons?.contentMode==='both') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                      ) : null}
                      {(home?.buttons?.contentMode==='text' || home?.buttons?.contentMode==='both') ? 'Details' : null}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Homepage Sections */}
        {sections && sections.length ? (
          <div className="mt-10 space-y-10">
            {sections.map((s) => (
              <section key={s.id}>
                <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
                {s.groups.map((g, gi) => (
                  <div key={gi} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{g.category.name}</h3>
                      {g.category.slug ? (
                        <Link href={route('store.home', { category: g.category.slug })} className="text-blue-600 text-sm">View all</Link>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {g.products.map((p) => (
                        <div
                          key={p.id}
                          className={`${(sectionStyle?.card?.shadow ?? shadow)}`}
                          style={{
                            backgroundColor: sectionStyle?.card?.bgColor || '#ffffff',
                            padding: `${Number(sectionStyle?.card?.padding ?? 8)}px`,
                            border: sectionStyle?.card?.border?.show
                              ? `${Number(sectionStyle?.card?.border?.width ?? 1)}px ${sectionStyle?.card?.border?.style || 'solid'} ${sectionStyle?.card?.border?.color || '#e5e7eb'}`
                              : 'none',
                            borderTopLeftRadius: `${sectionStyle?.card?.roundedTopLeft ?? 8}px`,
                            borderTopRightRadius: `${sectionStyle?.card?.roundedTopRight ?? 8}px`,
                            borderBottomLeftRadius: `${sectionStyle?.card?.roundedBottomLeft ?? 8}px`,
                            borderBottomRightRadius: `${sectionStyle?.card?.roundedBottomRight ?? 8}px`,
                          }}
                        >
                          <Link href={route('products.show', p.slug)} className="relative group block">
                            <div
                              className={`relative group overflow-hidden bg-gray-100`}
                              style={{
                                borderTopLeftRadius: `${sectionStyle?.image?.roundedTopLeft ?? 8}px`,
                                borderTopRightRadius: `${sectionStyle?.image?.roundedTopRight ?? 8}px`,
                                borderBottomLeftRadius: `${sectionStyle?.image?.roundedBottomLeft ?? 8}px`,
                                borderBottomRightRadius: `${sectionStyle?.image?.roundedBottomRight ?? 8}px`,
                                ...((sectionStyle?.image?.ratio && sectionStyle?.image?.ratio !== 'auto')
                                  ? {
                                      aspectRatio:
                                        sectionStyle?.image?.ratio === '1:1'
                                          ? '1 / 1'
                                          : sectionStyle?.image?.ratio === '4:3'
                                          ? '4 / 3'
                                          : sectionStyle?.image?.ratio === '16:9'
                                          ? '16 / 9'
                                          : sectionStyle?.image?.ratio === 'custom'
                                          ? `${Math.max(1, Number(sectionStyle?.image?.customW || 1))} / ${Math.max(1, Number(sectionStyle?.image?.customH || 1))}`
                                          : undefined,
                                    }
                                  : {}),
                              }}
                            >
                              {sectionStyle?.badge?.show ? (
                                <span
                                  className="absolute z-10 px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                                  style={{
                                    top: sectionStyle.badge.position?.includes('top') ? 8 : 'auto',
                                    bottom: sectionStyle.badge.position?.includes('bottom') ? 8 : 'auto',
                                    left: sectionStyle.badge.position?.includes('left') ? 8 : 'auto',
                                    right: sectionStyle.badge.position?.includes('right') ? 8 : 'auto',
                                  }}
                                >
                                  {sectionStyle.badge.text || 'Badge'}
                                </span>
                              ) : null}
                              {sectionRatio==='16:9' ? (
                                <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
                                  <div className="absolute inset-0">
                                    <img
                                      src={(sectionStyle?.image?.placeholderMode==='always' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (sectionStyle?.image?.placeholderMode==='auto' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                                      alt={p.name}
                                      className={`w-full h-full object-${sectionFit}`}
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : sectionRatio==='4:3' ? (
                                <div className="w-full relative" style={{ paddingTop: '75%' }}>
                                  <div className="absolute inset-0">
                                    <img
                                      src={(sectionStyle?.image?.placeholderMode==='always' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (sectionStyle?.image?.placeholderMode==='auto' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                                      alt={p.name}
                                      className={`w-full h-full object-${sectionFit}`}
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : sectionRatio==='1:1' ? (
                                <img
                                  src={(sectionStyle?.image?.placeholderMode==='always' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (sectionStyle?.image?.placeholderMode==='auto' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                                  alt={p.name}
                                  className={`w-full h-full object-${sectionFit}`}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                                  }}
                                />
                              ) : (
                                <img
                                  src={(sectionStyle?.image?.placeholderMode==='always' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : (p.image_url || (sectionStyle?.image?.placeholderMode==='auto' ? (sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`) : '')))}
                                  alt={p.name}
                                  className={`w-full h-auto object-${sectionFit}`}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = sectionStyle?.image?.placeholderUrl || `https://picsum.photos/seed/${encodeURIComponent(p.slug || String(p.id))}/640/640`;
                                  }}
                                />
                              )}
                            </div>
                          {/* Buttons over image for sections */}
                          {sectionStyle?.buttons?.show && sectionStyle?.buttons?.position === 'over' ? (
                            <div
                              className={`pointer-events-none absolute inset-0 flex justify-center ${sectionStyle?.buttons?.overVAlign === 'top' ? 'items-start pt-3' : (sectionStyle?.buttons?.overVAlign === 'bottom' ? 'items-end pb-3' : 'items-center')} ${sectionStyle?.buttons?.overVisibility === 'hover' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}
                            >
                              <div className={`flex ${sectionStyle?.buttons?.overContent === 'both' ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                                {(['buttons','both'].includes(sectionStyle?.buttons?.overContent)) ? (
                                  <div className="flex items-center gap-2">
                                    {sectionStyle?.addToCart?.show ? (
                                      <form method="post" action={route('cart.add', p.slug)} className="pointer-events-auto" onClick={(e)=>e.stopPropagation()} onSubmit={(e)=>e.stopPropagation()}>
                                        <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
                                        <button
                                          title="Add to cart"
                                          className={`${sectionStyle?.buttons?.style==='outline' ? 'bg-white/80 text-emerald-700 border border-emerald-600' : 'text-white'} ${sectionStyle?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`}
                                          style={{ borderRadius: `${sectionStyle?.buttons?.rounded ?? 9999}px`, ...(sectionStyle?.buttons?.style==='solid' ? { backgroundColor: sectionStyle?.buttons?.bgColor || '#059669', opacity: Number(sectionStyle?.buttons?.opacity ?? 100)/100 } : {}) }}
                                          onClick={(e)=>e.stopPropagation()}
                                        >
                                          {(sectionStyle?.buttons?.contentMode==='icon' || sectionStyle?.buttons?.contentMode==='both') ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
                                          ) : null}
                                          {(sectionStyle?.buttons?.contentMode==='text' || sectionStyle?.buttons?.contentMode==='both') ? 'Add to cart' : null}
                                        </button>
                                      </form>
                                    ) : null}
                                    {sectionStyle?.viewDetails?.show ? (
                                      <Link href={route('products.show', p.slug)} title="Details" className={`pointer-events-auto ${sectionStyle?.buttons?.style==='outline' ? 'bg-white/80 text-blue-700 border border-blue-600' : 'text-white'} ${sectionStyle?.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${sectionStyle?.buttons?.rounded ?? 9999}px`, ...(sectionStyle?.buttons?.style==='solid' ? { backgroundColor: sectionStyle?.buttons?.bgColor || '#2563eb', opacity: Number(sectionStyle?.buttons?.opacity ?? 100)/100 } : {}) }}>
                                        {(sectionStyle?.buttons?.contentMode==='icon' || sectionStyle?.buttons?.contentMode==='both') ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                                        ) : null}
                                        {(sectionStyle?.buttons?.contentMode==='text' || sectionStyle?.buttons?.contentMode==='both') ? 'Details' : null}
                                      </Link>
                                    ) : null}
                                  </div>
                                ) : null}
                                {( ['text','both'].includes(sectionStyle?.buttons?.overContent) ) ? (
                                  <span className="pointer-events-auto inline-block text-sm font-medium px-2 py-1 rounded bg-black/50 text-white">{p.name}</span>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                          <div className="mt-1 text-sm font-medium line-clamp-2">{p.name}</div>
                          </Link>
                          {style.showPrice ? (
                            <div className="text-sm text-gray-700">{fmtPrice(p.price)}</div>
                          ) : null}
                          {/* Buttons below image for sections if configured */}
                          {sectionStyle?.buttons?.show && sectionStyle?.buttons?.position === 'below' ? (
                            <div className="mt-2 flex items-center gap-2">
                              {sectionStyle?.addToCart?.show ? (
                                <form method="post" action={route('cart.add', p.slug)}>
                                  <input type="hidden" name="_token" value={(document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content} />
                                  <button className={`${sectionStyle?.buttons?.style==='outline' ? 'bg-white text-emerald-700 border border-emerald-600' : 'text-white'} ${sectionStyle?.buttons?.shadow || ''} px-3 py-2`} style={{ borderRadius: `${sectionStyle?.buttons?.rounded ?? 9999}px`, ...(sectionStyle?.buttons?.style==='solid' ? { backgroundColor: sectionStyle?.buttons?.bgColor || '#059669', opacity: Number(sectionStyle?.buttons?.opacity ?? 100)/100 } : {}) }}>Add to cart</button>
                                </form>
                              ) : null}
                              {sectionStyle?.viewDetails?.show ? (
                                <Link href={route('products.show', p.slug)} className={`${sectionStyle?.buttons?.style==='outline' ? 'bg-white text-blue-700 border border-blue-600' : 'text-white'} ${sectionStyle?.buttons?.shadow || ''} px-3 py-2`} style={{ borderRadius: `${sectionStyle?.buttons?.rounded ?? 9999}px`, ...(sectionStyle?.buttons?.style==='solid' ? { backgroundColor: sectionStyle?.buttons?.bgColor || '#2563eb', opacity: Number(sectionStyle?.buttons?.opacity ?? 100)/100 } : {}) }}>Details</Link>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : null}
        {/* Floating Go to cart button */}
        {typeof cartCount === 'number' && cartCount > 0 ? (
          <div className="fixed bottom-4 right-4 z-40">
            <Link href={route('cart.index')} className="shadow-lg bg-emerald-600 text-white px-4 py-3 rounded-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
              <span>Go to cart ({cartCount})</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
