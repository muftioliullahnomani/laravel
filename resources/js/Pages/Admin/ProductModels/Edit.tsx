import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface PreviewProd { id: number; name: string; slug: string }
type FullPreview = { id: number; name: string; slug: string; price: number; image_url?: string | null; description?: string | null } | null;

export default function Edit({ model, previewProducts, previewProduct }: { model: any | null; previewProducts: PreviewProd[]; previewProduct: FullPreview }) {
  const isCreate = !model;
  const { data, setData, post, put, processing, errors } = useForm<any>({
    id: model?.id as number | undefined,
    name: model?.name || '',
    is_active: model?.is_active ?? true,
    preview_product_id: model?.preview_product_id ?? (previewProducts[0]?.id || ''),
    definition: model?.definition || {
      layout: 'vertical',
      elements: [
        { id: crypto.randomUUID?.() || String(Date.now()), type: 'title', props: { tag: 'h1' }, visible: true, order: 1 },
        { id: (crypto.randomUUID?.() || String(Date.now())) + 'p', type: 'price', props: {}, visible: true, order: 2 },
        { id: (crypto.randomUUID?.() || String(Date.now())) + 'i', type: 'image', props: { ratio: '1:1' }, visible: true, order: 0 },
        { id: (crypto.randomUUID?.() || String(Date.now())) + 'd', type: 'description', props: {}, visible: true, order: 3 },
      ],
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      post(route('admin.product_models.store'));
    } else {
      put(route('admin.product_models.update', data.id as number));
    }
  };

  // Visual editor state
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const elements = React.useMemo(() => {
    const els = (data.definition?.elements || []) as Array<any>;
    return [...els].sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));
  }, [data.definition]);

  const updateElements = (updater: (prev: any[]) => any[]) => {
    const prevEls = (data.definition?.elements as any[]) || [];
    const next = updater(prevEls);
    const def: any = { ...((data.definition as any) || {}), elements: next as any[] };
    setData('definition', def as any);
  };

  const addElement = (type: string) => {
    const id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
    const base: any = { id, type, props: {}, visible: true, order: (elements[elements.length-1]?.order ?? elements.length) + 1 };
    if (type === 'title') base.props = { tag: 'h1' };
    if (type === 'image') base.props = {
      ratio: '1:1',
      fit: 'cover',
      rounded: 'rounded',
      shadow: 'shadow',
      border: false,
      alt: '',
      src: '',
      link: '',
      newTab: false,
      showCaption: false,
      caption: '',
      htmlBelow: '',
      placeholderMode: 'auto',
      placeholderUrl: ''
    };
    if (type === 'badge') base.props = { text: 'Badge', bg: '#DCFCE7', color: '#166534' };
    if (type === 'html') base.props = { html: '<p>Custom HTML</p>' };
    updateElements(prev => [...prev, base]);
    setSelectedId(id);
  };

  const moveElement = (id: string, dir: -1 | 1) => {
    const ordered = elements;
    const idx = ordered.findIndex(e => e.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[swapIdx];
    const newEls = [...ordered];
    [newEls[idx], newEls[swapIdx]] = [newEls[swapIdx], newEls[idx]];
    // reassign order
    const reassigned = newEls.map((e, i) => ({ ...e, order: i }));
    const def: any = { ...((data.definition as any) || {}), elements: reassigned as any[] };
    setData('definition', def as any);
  };

  const toggleVisibility = (id: string) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, visible: !e.visible } : e));
  };

  const removeElement = (id: string) => {
    updateElements(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const setProp = (id: string, key: string, value: any) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, props: { ...(e.props || {}), [key]: value } } : e));
  };

  const selected = elements.find(e => e.id === selectedId) || null;

  const renderPreview = () => {
    const p = previewProduct;
    if (!p) return <div className="text-gray-500">No preview product found.</div>;
    const renderImage = (e: any) => {
      const ratio = e.props?.ratio || '1:1';
      const fit = e.props?.fit || 'cover';
      const rounded = e.props?.rounded || 'rounded';
      const shadow = e.props?.shadow || '';
      const border = e.props?.border ? 'border' : '';
      const placeholderSeed = encodeURIComponent(p.slug || String(p.id));
      const defaultPlaceholder = `https://picsum.photos/seed/${placeholderSeed}/640/640`;
      const placeholderMode = e.props?.placeholderMode || 'auto';
      const placeholderUrl = e.props?.placeholderUrl || '';
      const srcBase = e.props?.src || p.image_url || '';
      const computedSrc = placeholderMode === 'always' ? (placeholderUrl || defaultPlaceholder) : (srcBase || (placeholderMode === 'auto' ? (placeholderUrl || defaultPlaceholder) : ''));
      const src = computedSrc;
      const alt = e.props?.alt || p.name;
      const link = e.props?.link as string | undefined;
      const newTab = !!e.props?.newTab;
      const showCaption = !!e.props?.showCaption;
      const caption = e.props?.caption || '';
      const htmlBelow = e.props?.htmlBelow || '';

      const imgEl = (
        <img
          src={src || ''}
          alt={alt}
          className={`w-full h-full object-${fit}`}
          referrerPolicy="no-referrer"
          onError={(ev)=>{ const t=ev.currentTarget as HTMLImageElement; t.onerror=null; t.src = placeholderUrl || defaultPlaceholder; }}
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
        <a href={link} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}>
          {box}
        </a>
      ) : box;

      return (
        <div>
          {wrapped}
          {showCaption && caption ? (
            <div className="text-sm text-gray-600 mt-1">{caption}</div>
          ) : null}
          {htmlBelow ? (
            <div className="prose max-w-none mt-1" dangerouslySetInnerHTML={{ __html: htmlBelow }} />
          ) : null}
        </div>
      );
    };
    const right = (
      <div className="space-y-3">
        {elements.filter(e=>e.type !== 'image' && e.visible !== false).map(e => {
          if (e.type === 'title') {
            const Tag = (e.props?.tag || 'h1') as keyof JSX.IntrinsicElements;
            return <Tag key={e.id} className="text-2xl font-semibold">{p.name}</Tag>;
          }
          if (e.type === 'price') return <div key={e.id} className="text-3xl font-bold">${p.price.toFixed(2)}</div>;
          if (e.type === 'description') return <div key={e.id} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.description || 'No description' }} />;
          if (e.type === 'badge') return <span key={e.id} style={{ backgroundColor: e.props?.bg || '#DCFCE7', color: e.props?.color || '#166534' }} className="inline-block px-2 py-1 rounded text-xs font-medium">{e.props?.text || 'Badge'}</span>;
          if (e.type === 'divider') return <hr key={e.id} className="border-t" />;
          if (e.type === 'html') return <div key={e.id} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: e.props?.html || '' }} />;
          return null;
        })}
      </div>
    );
    const leftImages = elements.filter(e=>e.type==='image' && e.visible !== false).length > 0;
    return (
      <div className="bg-white rounded shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {leftImages ? elements.filter(e=>e.type==='image' && e.visible !== false).map(e => (<div key={e.id}>{renderImage(e)}</div>)) : null}
          </div>
          <div>{right}</div>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout header={<h1 className="text-xl font-semibold">{isCreate ? 'New Product Model' : 'Edit Product Model'}</h1>}>
      <Head title={isCreate ? 'New Product Model' : 'Edit Product Model'} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isCreate ? 'New Product Model' : 'Edit Product Model'}</h1>
          <Link href={route('admin.product_models.index')} className="text-blue-600">Back to Models</Link>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700">Name</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} />
              {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
            </div>
            <div>
              <label className="block text-sm text-gray-700">Preview Product</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={data.preview_product_id ?? ''} onChange={e=>setData('preview_product_id', e.target.value ? Number(e.target.value) : null)}>
                {previewProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.id}. {p.name}</option>
                ))}
              </select>
              {errors.preview_product_id && <div className="text-sm text-red-600">{errors.preview_product_id}</div>}
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!data.is_active} onChange={e=>setData('is_active', e.target.checked)} />
              <span>Active</span>
            </label>
            {errors.is_active && <div className="text-sm text-red-600">{errors.is_active}</div>}
          </div>

          {/* Visual editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Elements List */}
            <div className="bg-white rounded border p-3 space-y-3">
              <div className="font-medium">Elements</div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('image')}>+ Image</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('title')}>+ Title</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('price')}>+ Price</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('description')}>+ Description</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('badge')}>+ Badge</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('divider')}>+ Divider</button>
                <button type="button" className="px-3 py-1 rounded border" onClick={()=>addElement('html')}>+ Custom HTML</button>
              </div>
              <div className="divide-y">
                {elements.map((el, idx) => (
                  <div key={el.id} className={`py-2 flex items-center justify-between ${selectedId===el.id?'bg-emerald-50':''}`}>
                    <button type="button" onClick={()=>setSelectedId(el.id)} className="text-left flex-1 px-2">
                      <div className="font-medium capitalize">{el.type}</div>
                      <div className="text-xs text-gray-500">order: {el.order ?? idx} {el.visible===false?'(hidden)':''}</div>
                    </button>
                    <div className="flex items-center gap-1">
                      <button type="button" className="px-2 py-1 rounded border" onClick={()=>moveElement(el.id, -1)}>↑</button>
                      <button type="button" className="px-2 py-1 rounded border" onClick={()=>moveElement(el.id, 1)}>↓</button>
                      <button type="button" className="px-2 py-1 rounded border" onClick={()=>toggleVisibility(el.id)}>{el.visible===false?'Show':'Hide'}</button>
                      <button type="button" className="px-2 py-1 rounded border text-red-600" onClick={()=>removeElement(el.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              {renderPreview()}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="bg-white rounded border p-3">
            <div className="font-medium mb-2">Properties</div>
            {!selected ? (
              <div className="text-gray-600 text-sm">কোনো এলিমেন্ট সিলেক্ট করুন।</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Type</label>
                  <div className="mt-1 px-3 py-2 border rounded bg-gray-50">{selected.type}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Visible</label>
                  <button type="button" className="mt-1 px-3 py-2 border rounded" onClick={()=>toggleVisibility(selected.id)}>{selected.visible===false?'Show':'Hide'}</button>
                </div>

                {selected.type === 'title' && (
                  <div>
                    <label className="block text-sm text-gray-700">Tag</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.tag || 'h1'} onChange={e=>setProp(selected.id,'tag', e.target.value)}>
                      <option>h1</option>
                      <option>h2</option>
                      <option>h3</option>
                      <option>h4</option>
                    </select>
                  </div>
                )}

                {selected.type === 'badge' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700">Text</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.text || ''} onChange={e=>setProp(selected.id,'text', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Background</label>
                      <input type="color" className="mt-1 w-16 h-10 border rounded" value={selected.props?.bg || '#DCFCE7'} onChange={e=>setProp(selected.id,'bg', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Text Color</label>
                      <input type="color" className="mt-1 w-16 h-10 border rounded" value={selected.props?.color || '#166534'} onChange={e=>setProp(selected.id,'color', e.target.value)} />
                    </div>
                  </>
                )}

                {selected.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700">Ratio</label>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.ratio || '1:1'} onChange={e=>setProp(selected.id,'ratio', e.target.value)}>
                        <option value="auto">Auto</option>
                        <option value="1:1">1:1</option>
                        <option value="4:3">4:3</option>
                        <option value="16:9">16:9</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Object Fit</label>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.fit || 'cover'} onChange={e=>setProp(selected.id,'fit', e.target.value)}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Border Radius</label>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.rounded || 'rounded'} onChange={e=>setProp(selected.id,'rounded', e.target.value)}>
                        <option value="">None</option>
                        <option value="rounded">Rounded</option>
                        <option value="rounded-md">Rounded-md</option>
                        <option value="rounded-lg">Rounded-lg</option>
                        <option value="rounded-xl">Rounded-xl</option>
                        <option value="rounded-full">Rounded-full</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Shadow</label>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.shadow || ''} onChange={e=>setProp(selected.id,'shadow', e.target.value)}>
                        <option value="">None</option>
                        <option value="shadow-sm">shadow-sm</option>
                        <option value="shadow">shadow</option>
                        <option value="shadow-md">shadow-md</option>
                        <option value="shadow-lg">shadow-lg</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input id="img-border" type="checkbox" checked={!!selected.props?.border} onChange={e=>setProp(selected.id,'border', e.target.checked)} />
                      <label htmlFor="img-border" className="text-sm text-gray-700">Show Border</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700">Override Image URL</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" placeholder="https://... (optional)" value={selected.props?.src || ''} onChange={e=>setProp(selected.id,'src', e.target.value)} />
                      <div className="text-xs text-gray-500 mt-1">ফাঁকা রাখলে প্রডাক্ট ইমেজ ব্যবহার হবে।</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Placeholder Mode</label>
                      <select className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.placeholderMode || 'auto'} onChange={e=>setProp(selected.id,'placeholderMode', e.target.value)}>
                        <option value="auto">Auto (when missing/error)</option>
                        <option value="always">Always use placeholder</option>
                        <option value="never">Never (show blank if missing)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700">Placeholder URL</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" placeholder="https://placeholder.example/640x640" value={selected.props?.placeholderUrl || ''} onChange={e=>setProp(selected.id,'placeholderUrl', e.target.value)} />
                      <div className="text-xs text-gray-500 mt-1">ফাঁকা থাকলে ডিফল্ট প্লেসহোল্ডার (picsum) ব্যবহার হবে।</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Alt text</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={selected.props?.alt || ''} onChange={e=>setProp(selected.id,'alt', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Link (optional)</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." value={selected.props?.link || ''} onChange={e=>setProp(selected.id,'link', e.target.value)} />
                      <label className="inline-flex items-center gap-2 mt-1">
                        <input type="checkbox" checked={!!selected.props?.newTab} onChange={e=>setProp(selected.id,'newTab', e.target.checked)} />
                        <span className="text-sm">Open in new tab</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={!!selected.props?.showCaption} onChange={e=>setProp(selected.id,'showCaption', e.target.checked)} />
                        <span className="text-sm">Show caption</span>
                      </label>
                      {selected.props?.showCaption ? (
                        <input className="mt-1 w-full border rounded px-3 py-2" placeholder="Caption text" value={selected.props?.caption || ''} onChange={e=>setProp(selected.id,'caption', e.target.value)} />
                      ) : null}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700">HTML below image</label>
                      <textarea className="mt-1 w-full border rounded px-3 py-2 font-mono text-sm min-h-[100px]" placeholder="<p>Custom HTML after image</p>" value={selected.props?.htmlBelow || ''} onChange={e=>setProp(selected.id,'htmlBelow', e.target.value)} />
                    </div>
                  </>
                )}

                {selected.type === 'html' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700">HTML</label>
                    <textarea className="mt-1 w-full border rounded px-3 py-2 font-mono text-sm min-h-[120px]" value={selected.props?.html || ''} onChange={e=>setProp(selected.id,'html', e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{processing ? 'Saving...' : (isCreate ? 'Create' : 'Save')}</button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
