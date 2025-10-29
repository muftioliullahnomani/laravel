import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function HomeCardStyleEdit({ style, scope }: { style: any; scope?: 'home' | 'section' }) {
  const { data, setData, put, processing } = useForm<{ style: any }>({ style: style || {} });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('dashboard.home_style.update'));
  };

  const set = (path: string, value: any) => {
    setData((prev: any) => {
      const current = prev?.style || {};
      const hasScopes = !!(current.home || current.section);
      const activeScope = hasScopes ? (scope || 'home') : undefined;
      const target = activeScope ? { ...(current[activeScope] || {}) } : { ...current };

      // deep dot setter on target
      const parts = path.split('.');
      let ref: any = target;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        ref[k] = typeof ref[k] === 'object' && ref[k] !== null ? { ...ref[k] } : {};
        ref = ref[k];
      }
      ref[parts[parts.length - 1]] = value;

      // keep at least one CTA visible if buttons.show is true
      if (target?.buttons?.show) {
        const add = target?.addToCart?.show;
        const det = target?.viewDetails?.show;
        if (!add && !det) {
          target.addToCart = { ...(target.addToCart || {}), show: true };
        }
      }

      const newStyle = activeScope ? { ...current, [activeScope]: target } : target;
      return { ...prev, style: newStyle };
    });
  };

  const s = (data.style && (data.style.home || data.style.section))
    ? (data.style[scope || 'home'] || {})
    : (data.style || {});

  const title = scope === 'section' ? 'Section Card Style' : 'Home Card Style';

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{title}</h2>}>
      <Head title={title} />
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <Link href={route('dashboard')} className="text-blue-600">Back to Dashboard</Link>
        </div>

        {/* Live Preview (Top & Center) */
        }
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2 text-center">Live Preview</div>
          <div className="flex justify-center">
            <div
              className={`${s.card?.shadow || ''} w-72`}
              style={{
                backgroundColor: s.card?.bgColor || '#ffffff',
                padding: `${Number(s.card?.padding ?? 12)}px`,
                border: s.card?.border?.show
                  ? `${Number(s.card?.border?.width ?? 1)}px ${s.card?.border?.style || 'solid'} ${s.card?.border?.color || '#e5e7eb'}`
                  : 'none',
                borderTopLeftRadius: `${s.card?.roundedTopLeft ?? 8}px`,
                borderTopRightRadius: `${s.card?.roundedTopRight ?? 8}px`,
                borderBottomLeftRadius: `${s.card?.roundedBottomLeft ?? 8}px`,
                borderBottomRightRadius: `${s.card?.roundedBottomRight ?? 8}px`,
              }}
            >
              <div className="group relative">
                <div
                  className={`overflow-hidden bg-gray-100`}
                  style={{
                    borderTopLeftRadius: `${s.image?.roundedTopLeft ?? 8}px`,
                    borderTopRightRadius: `${s.image?.roundedTopRight ?? 8}px`,
                    borderBottomLeftRadius: `${s.image?.roundedBottomLeft ?? 8}px`,
                    borderBottomRightRadius: `${s.image?.roundedBottomRight ?? 8}px`,
                    ...(s.image?.ratio && s.image?.ratio !== 'auto'
                      ? {
                          aspectRatio:
                            s.image?.ratio === '1:1'
                              ? '1 / 1'
                              : s.image?.ratio === '4:3'
                              ? '4 / 3'
                              : s.image?.ratio === '16:9'
                              ? '16 / 9'
                              : s.image?.ratio === 'custom'
                              ? `${Math.max(1, Number(s.image?.customW || 1))} / ${Math.max(1, Number(s.image?.customH || 1))}`
                              : undefined,
                        }
                      : {}),
                  }}
                >
                  <img src={s.image?.placeholderUrl || 'https://picsum.photos/seed/preview/640/640'} alt="Preview" className={`w-full ${s.image?.ratio==='auto' ? 'h-auto' : 'h-full'} object-${s.image?.fit || 'cover'}`} />
                </div>
                {s.buttons?.show && s.buttons?.position==='over' ? (
                  <div className={`pointer-events-none absolute inset-0 flex justify-center ${s.buttons?.overVAlign==='top' ? 'items-start pt-3' : (s.buttons?.overVAlign==='bottom' ? 'items-end pb-3' : 'items-center')} ${s.buttons?.overVisibility==='hover' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                    <div className={`flex ${s.buttons?.overContent==='both' ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                      {(s.buttons?.overContent==='buttons' || s.buttons?.overContent==='both') ? (
                        <div className="flex items-center gap-2">
                          {s.addToCart?.show ? (
                            <button className={`${s.buttons?.style==='outline' ? 'bg-white/80 text-emerald-700 border border-emerald-600' : 'text-white'} ${s.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${s.buttons?.rounded ?? 9999}px`, ...(s.buttons?.style==='solid' ? { backgroundColor: s.buttons?.bgColor || '#059669', opacity: Number(s.buttons?.opacity ?? 100)/100 } : {}) }}>
                              {(s.buttons?.contentMode==='icon' || s.buttons?.contentMode==='both') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
                              ) : null}
                              {(s.buttons?.contentMode==='text' || s.buttons?.contentMode==='both') ? 'Add to cart' : null}
                            </button>
                          ) : null}
                          {s.viewDetails?.show ? (
                            <button className={`${s.buttons?.style==='outline' ? 'bg-white/80 text-blue-700 border border-blue-600' : 'text-white'} ${s.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${s.buttons?.rounded ?? 9999}px`, ...(s.buttons?.style==='solid' ? { backgroundColor: s.buttons?.bgColor || '#2563eb', opacity: Number(s.buttons?.opacity ?? 100)/100 } : {}) }}>
                              {(s.buttons?.contentMode==='icon' || s.buttons?.contentMode==='both') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                              ) : null}
                              {(s.buttons?.contentMode==='text' || s.buttons?.contentMode==='both') ? 'Details' : null}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      {(s.buttons?.overContent==='text' || s.buttons?.overContent==='both') ? (
                        <span className="pointer-events-auto inline-block text-sm font-medium px-2 py-1 rounded bg-black/50 text-white">Preview Product</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              {(s.altText?.show && s.altText?.position==='below') ? (
                <div className="text-xs text-gray-600 mt-1 text-center">Preview Product</div>
              ) : null}
              {s.buttons?.show && s.buttons?.position==='below' ? (
                <div className="mt-2 flex items-center justify-center gap-2">
                  {s.addToCart?.show ? (
                    <button className={`${s.buttons?.style==='outline' ? 'bg-white text-emerald-700 border border-emerald-600' : 'text-white'} ${s.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${s.buttons?.rounded ?? 9999}px`, ...(s.buttons?.style==='solid' ? { backgroundColor: s.buttons?.bgColor || '#059669', opacity: Number(s.buttons?.opacity ?? 100)/100 } : {}) }}>
                      {(s.buttons?.contentMode==='icon' || s.buttons?.contentMode==='both') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 18a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4zM3 2h2l3.6 7.59-1.35 2.45A2 2 0 009 15h9a2 2 0 001.8-1.1l3.58-6.49A1 1 0 0021.5 6H7.1l-.9-2H3z"/></svg>
                      ) : null}
                      {(s.buttons?.contentMode==='text' || s.buttons?.contentMode==='both') ? 'Add to cart' : null}
                    </button>
                  ) : null}
                  {s.viewDetails?.show ? (
                    <button className={`${s.buttons?.style==='outline' ? 'bg-white text-blue-700 border border-blue-600' : 'text-white'} ${s.buttons?.shadow || ''} px-3 py-2 flex items-center gap-1`} style={{ borderRadius: `${s.buttons?.rounded ?? 9999}px`, ...(s.buttons?.style==='solid' ? { backgroundColor: s.buttons?.bgColor || '#2563eb', opacity: Number(s.buttons?.opacity ?? 100)/100 } : {}) }}>
                      {(s.buttons?.contentMode==='icon' || s.buttons?.contentMode==='both') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                      ) : null}
                      {(s.buttons?.contentMode==='text' || s.buttons?.contentMode==='both') ? 'Details' : null}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded shadow p-4 space-y-6">
          <div className="pb-2">
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">Save</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Card</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Shadow</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.card?.shadow || ''} onChange={e=>set('card.shadow', e.target.value)}>
                    <option value="">none</option>
                    <option value="shadow-sm">shadow-sm</option>
                    <option value="shadow">shadow</option>
                    <option value="shadow-md">shadow-md</option>
                    <option value="shadow-lg">shadow-lg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Padding (px)</label>
                  <input type="number" step={1} min={0} className="mt-1 w-full border rounded px-2 py-2" value={Number(s.card?.padding ?? 12)} onChange={e=>set('card.padding', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700">Background</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" className="h-9 w-12 border rounded" value={s.card?.bgColor || '#ffffff'} onChange={e=>set('card.bgColor', e.target.value)} />
                    <input className="flex-1 border rounded px-2 py-2" placeholder="#ffffff" value={s.card?.bgColor || ''} onChange={e=>set('card.bgColor', e.target.value)} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700">Border</label>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                    <label className="inline-flex items-center gap-2 col-span-2 md:col-span-1">
                      <input type="checkbox" checked={!!s.card?.border?.show} onChange={e=>set('card.border.show', e.target.checked)} />
                      <span>Show</span>
                    </label>
                    <div>
                      <input type="number" min={0} step={1} className="w-full border rounded px-2 py-2" value={Number(s.card?.border?.width ?? 1)} onChange={e=>set('card.border.width', Number(e.target.value))} />
                      <div className="text-[11px] text-gray-500 mt-1">Width (px)</div>
                    </div>
                    <div>
                      <select className="w-full border rounded px-2 py-2" value={s.card?.border?.style || 'solid'} onChange={e=>set('card.border.style', e.target.value)}>
                        <option value="solid">solid</option>
                        <option value="dashed">dashed</option>
                        <option value="dotted">dotted</option>
                      </select>
                      <div className="text-[11px] text-gray-500 mt-1">Style</div>
                    </div>
                    <div>
                      <input type="color" className="h-9 w-full border rounded" value={s.card?.border?.color || '#e5e7eb'} onChange={e=>set('card.border.color', e.target.value)} />
                      <div className="text-[11px] text-gray-500 mt-1">Color</div>
                    </div>
                  </div>
                </div>
                {['roundedTopLeft','roundedTopRight','roundedBottomLeft','roundedBottomRight'].map((k)=> (
                  <div key={k}>
                    <label className="block text-sm text-gray-700">{k}</label>
                    <input type="number" step={1} className="mt-1 w-full border rounded px-2 py-2" value={s.card?.[k] ?? 8} onChange={e=>set(`card.${k}`, Number(e.target.value))} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700">Rounded (all corners)</label>
                  <input
                    type="number"
                    step={1}
                    className="mt-1 w-full border rounded px-2 py-2"
                    value={Math.min(
                      ...[s.card?.roundedTopLeft ?? 8, s.card?.roundedTopRight ?? 8, s.card?.roundedBottomLeft ?? 8, s.card?.roundedBottomRight ?? 8]
                    )}
                    onChange={(e)=>{
                      const v = Number(e.target.value);
                      set('card.roundedTopLeft', v);
                      set('card.roundedTopRight', v);
                      set('card.roundedBottomLeft', v);
                      set('card.roundedBottomRight', v);
                    }}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Image</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700">Ratio</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.image?.ratio || '1:1'} onChange={e=>set('image.ratio', e.target.value)}>
                    <option value="auto">Auto</option>
                    <option value="1:1">1:1</option>
                    <option value="4:3">4:3</option>
                    <option value="16:9">16:9</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {s.image?.ratio === 'custom' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700">Custom Width</label>
                      <input type="number" min={1} step={1} className="mt-1 w-full border rounded px-2 py-2" value={Number(s.image?.customW || 1)} onChange={e=>set('image.customW', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Custom Height</label>
                      <input type="number" min={1} step={1} className="mt-1 w-full border rounded px-2 py-2" value={Number(s.image?.customH || 1)} onChange={e=>set('image.customH', Number(e.target.value))} />
                    </div>
                  </>
                ) : null}
                <div>
                  <label className="block text-sm text-gray-700">Object Fit</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.image?.fit || 'cover'} onChange={e=>set('image.fit', e.target.value)}>
                    <option value="cover">cover</option>
                    <option value="contain">contain</option>
                    <option value="fill">fill</option>
                  </select>
                </div>
                {['roundedTopLeft','roundedTopRight','roundedBottomLeft','roundedBottomRight'].map((k)=> (
                  <div key={k}>
                    <label className="block text-sm text-gray-700">{k}</label>
                    <input type="number" step={1} className="mt-1 w-full border rounded px-2 py-2" value={s.image?.[k] ?? 8} onChange={e=>set(`image.${k}`, Number(e.target.value))} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-700">Placeholder Mode</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.image?.placeholderMode || 'auto'} onChange={e=>set('image.placeholderMode', e.target.value)}>
                    <option value="auto">Auto</option>
                    <option value="always">Always</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700">Placeholder URL</label>
                  <input className="mt-1 w-full border rounded px-2 py-2" value={s.image?.placeholderUrl || ''} onChange={e=>set('image.placeholderUrl', e.target.value)} />
                </div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Buttons</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.buttons?.show} onChange={e=>set('buttons.show', e.target.checked)} />
                  <span>Show</span>
                </label>
                {s.buttons?.show && !s.addToCart?.show && !s.viewDetails?.show ? (
                  <div className="col-span-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    No buttons are selected. Enable at least one: Add to cart or View details.
                  </div>
                ) : null}
                <div>
                  <label className="block text-sm text-gray-700">Position</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.position || 'over'} onChange={e=>set('buttons.position', e.target.value)}>
                    <option value="over">Over image</option>
                    <option value="below">Below image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Rounded (px)</label>
                  <input type="number" step={1} className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.rounded ?? 9999} onChange={e=>set('buttons.rounded', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Style</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.style || 'solid'} onChange={e=>set('buttons.style', e.target.value)}>
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Button content</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.contentMode || 'text'} onChange={e=>set('buttons.contentMode', e.target.value)}>
                    <option value="icon">Icon only</option>
                    <option value="text">Text only</option>
                    <option value="both">Icon + text</option>
                  </select>
                </div>
                {s.buttons?.position === 'over' ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700">Overlay visibility</label>
                      <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.overVisibility || 'hover'} onChange={e=>set('buttons.overVisibility', e.target.value)}>
                        <option value="hover">On hover</option>
                        <option value="always">Always visible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Overlay content</label>
                      <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.overContent || 'buttons'} onChange={e=>set('buttons.overContent', e.target.value)}>
                        <option value="buttons">Buttons only</option>
                        <option value="text">Text only</option>
                        <option value="both">Text and buttons</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Overlay vertical align</label>
                      <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.overVAlign || 'center'} onChange={e=>set('buttons.overVAlign', e.target.value)}>
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </>
                ) : null}
                <div>
                  <label className="block text-sm text-gray-700">Background</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" className="h-9 w-12 border rounded" value={s.buttons?.bgColor || '#059669'} onChange={e=>set('buttons.bgColor', e.target.value)} />
                    <input className="flex-1 border rounded px-2 py-2" placeholder="#059669" value={s.buttons?.bgColor || ''} onChange={e=>set('buttons.bgColor', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Shadow</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.buttons?.shadow || ''} onChange={e=>set('buttons.shadow', e.target.value)}>
                    <option value="">none</option>
                    <option value="shadow-sm">shadow-sm</option>
                    <option value="shadow">shadow</option>
                    <option value="shadow-md">shadow-md</option>
                    <option value="shadow-lg">shadow-lg</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700">Opacity ({Math.round((Number(s.buttons?.opacity ?? 100)))}%)</label>
                  <input type="range" min={0} max={100} step={1} className="mt-1 w-full" value={Number(s.buttons?.opacity ?? 100)} onChange={e=>set('buttons.opacity', Number(e.target.value))} />
                </div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.addToCart?.show} onChange={e=>set('addToCart.show', e.target.checked)} />
                  <span>Add to cart</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.viewDetails?.show} onChange={e=>set('viewDetails.show', e.target.checked)} />
                  <span>View details</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Badge</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.badge?.show} onChange={e=>set('badge.show', e.target.checked)} />
                  <span>Show</span>
                </label>
                <div>
                  <label className="block text-sm text-gray-700">Position</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.badge?.position || 'top-left'} onChange={e=>set('badge.position', e.target.value)}>
                    <option value="top-left">Top-left</option>
                    <option value="top-right">Top-right</option>
                    <option value="bottom-left">Bottom-left</option>
                    <option value="bottom-right">Bottom-right</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700">Text</label>
                  <input className="mt-1 w-full border rounded px-2 py-2" value={s.badge?.text || ''} onChange={e=>set('badge.text', e.target.value)} />
                </div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Alt text</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.altText?.show} onChange={e=>set('altText.show', e.target.checked)} />
                  <span>Show</span>
                </label>
                <div>
                  <label className="block text-sm text-gray-700">Position</label>
                  <select className="mt-1 w-full border rounded px-2 py-2" value={s.altText?.position || 'below'} onChange={e=>set('altText.position', e.target.value)}>
                    <option value="over">Over image</option>
                    <option value="below">Below image</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="border rounded p-3">
              <legend className="px-1 text-sm text-gray-700">Price & Hover</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.price?.show} onChange={e=>set('price.show', e.target.checked)} />
                  <span>Show price</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!s.hover?.show} onChange={e=>set('hover.show', e.target.checked)} />
                  <span>Show hover actions</span>
                </label>
              </div>
            </fieldset>
          </div>

          <div className="pt-2">
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">Save</button>
            <Link href={route('dashboard')} className="ml-3 text-blue-600">Cancel</Link>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
