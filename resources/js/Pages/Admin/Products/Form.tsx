import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface ProductForm {
  id?: number;
  name: string;
  slug: string;
  sku: string;
  category_id?: number | null;
  product_model_id?: number | null;
  description?: string | null;
  price: number | string;
  stock: number | string;
  image_url?: string | null;
  image?: File | null;
  is_active: boolean;
}

export default function Form({ product, categories, models }: { product: Partial<ProductForm> | null; categories: { id: number; name: string }[]; models: { id: number; name: string; is_active: boolean }[] }) {
  const isEdit = !!product?.id;
  const { data, setData, post, put, processing, errors, transform } = useForm<ProductForm>({
    id: product?.id,
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    category_id: product?.category_id ?? null,
    product_model_id: (product as any)?.product_model_id ?? null,
    description: (product?.description as string) || '',
    price: (product?.price as number) || 0,
    stock: (product?.stock as number) || 0,
    image_url: (product?.image_url as string) || '',
    image: null,
    is_active: (product?.is_active as boolean) ?? true,
  });

  const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

  const genSku = () => {
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `SKU-${rand}`;
  };

  // Image preview URL handling for selected file
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (data.image) {
      const url = URL.createObjectURL(data.image);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreview(null);
    }
  }, [data.image]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize outgoing payload so multipart with File keeps fields intact
    transform((payload) => ({
      ...payload,
      name: String(payload.name ?? '').trim(),
      slug: (payload.slug ?? '') as string,
      price: (payload.price as any) === '' ? null : String(payload.price ?? ''),
      stock: (payload.stock as any) === '' ? null : String(payload.stock ?? ''),
      category_id: payload.category_id ?? null,
      product_model_id: payload.product_model_id ?? null,
      description: payload.description ?? '',
      image_url: payload.image_url ?? '',
      // image stays as File | null, Inertia will switch to FormData automatically
    }));
    if (isEdit) {
      put(route('admin.products.update', data.id), { preserveScroll: true } as any);
    } else {
      post(route('admin.products.store'), { preserveScroll: true } as any);
    }
  };

  const editorRef = React.useRef<HTMLDivElement | null>(null);

  const applyCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      setData('description', editorRef.current.innerHTML);
    }
  };

  const onEditorInput = () => {
    if (editorRef.current) {
      setData('description', editorRef.current.innerHTML);
    }
  };

  const onEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title={isEdit ? 'Edit Product' : 'New Product'} />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <div className="flex items-center gap-3">
            {isEdit && (product?.slug || data.slug) ? (
              <a
                href={`/products/${product?.slug || data.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded border text-blue-700 hover:bg-blue-50"
              >
                Preview
              </a>
            ) : null}
            <Link href={route('admin.products.index')} className="text-blue-600">Back to list</Link>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded shadow p-4 space-y-4">
          <input type="hidden" name="_token" value={csrf} />

          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input name="name" required className="mt-1 w-full border rounded px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} />
            {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Slug</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.slug} onChange={e=>setData('slug', e.target.value)} placeholder="Leave blank to auto-generate (on create)" />
            {errors.slug && <div className="text-sm text-red-600">{errors.slug}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">SKU</label>
            <div className="mt-1 flex gap-2">
              <input className="flex-1 border rounded px-3 py-2" value={data.sku} onChange={e=>setData('sku', e.target.value)} placeholder="Leave blank to auto-generate" />
              <button type="button" onClick={()=>setData('sku', genSku())} className="px-3 py-2 rounded border bg-white hover:bg-gray-50">Generate</button>
            </div>
            {errors.sku && <div className="text-sm text-red-600">{errors.sku}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Category</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={data.category_id ?? ''} onChange={e=>setData('category_id', e.target.value ? Number(e.target.value) : null)}>
              <option value="">None</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <div className="text-sm text-red-600">{errors.category_id}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Model</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={data.product_model_id ?? ''} onChange={e=>setData('product_model_id', e.target.value ? Number(e.target.value) : null)}>
              <option value="">Default layout</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.is_active ? '' : ' (inactive)'}</option>
              ))}
            </select>
            {errors.product_model_id && <div className="text-sm text-red-600">{errors.product_model_id}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Price</label>
            <input
              name="price"
              required
              inputMode="decimal"
              step="0.01"
              className="mt-1 w-full border rounded px-3 py-2"
              value={data.price}
              onChange={e=>{
                const raw = e.target.value.replace(',', '.');
                const cleaned = raw.replace(/[^0-9.]/g, '');
                setData('price', cleaned);
              }}
            />
            {errors.price && <div className="text-sm text-red-600">{errors.price}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Stock</label>
            <input
              name="stock"
              required
              inputMode="numeric"
              className="mt-1 w-full border rounded px-3 py-2"
              value={data.stock}
              onChange={e=>{
                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                setData('stock', cleaned);
              }}
            />
            {errors.stock && <div className="text-sm text-red-600">{errors.stock}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <div className="mt-1 border rounded">
              <div className="flex flex-wrap gap-1 border-b px-2 py-1 bg-gray-50">
                <button type="button" onClick={()=>applyCmd('bold')} className="px-2 py-1 rounded hover:bg-gray-100">B</button>
                <button type="button" onClick={()=>applyCmd('italic')} className="px-2 py-1 rounded hover:bg-gray-100 italic">I</button>
                <button type="button" onClick={()=>applyCmd('underline')} className="px-2 py-1 rounded hover:bg-gray-100 underline">U</button>
                <button type="button" onClick={()=>applyCmd('insertUnorderedList')} className="px-2 py-1 rounded hover:bg-gray-100">• List</button>
                <button type="button" onClick={()=>applyCmd('insertOrderedList')} className="px-2 py-1 rounded hover:bg-gray-100">1. List</button>
                <button type="button" onClick={()=>applyCmd('formatBlock','<h3>')} className="px-2 py-1 rounded hover:bg-gray-100">H3</button>
                <button type="button" onClick={()=>applyCmd('formatBlock','<p>')} className="px-2 py-1 rounded hover:bg-gray-100">P</button>
                <button type="button" onClick={()=>{ const url = prompt('Enter URL'); if(url) applyCmd('createLink', url); }} className="px-2 py-1 rounded hover:bg-gray-100">Link</button>
                <button type="button" onClick={()=>applyCmd('removeFormat')} className="px-2 py-1 rounded hover:bg-gray-100">Clear</button>
              </div>
              <div
                ref={editorRef}
                className="min-h-40 px-3 py-2 outline-none prose max-w-none"
                contentEditable
                onInput={onEditorInput}
                onPaste={onEditorPaste}
                dangerouslySetInnerHTML={{ __html: (data.description as string) || '' }}
              />
            </div>
            <input type="hidden" name="description" value={data.description || ''} />
            {errors.description && <div className="text-sm text-red-600">{errors.description}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Image URL</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={data.image_url ?? ''} onChange={e=>setData('image_url', e.target.value)} placeholder="https://..." />
            {errors.image_url && <div className="text-sm text-red-600">{errors.image_url}</div>}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full border rounded px-3 py-2"
              onChange={(e)=> setData('image', e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null)}
            />
            <div className="text-xs text-gray-500 mt-1">If you upload a file, it will override Image URL.</div>
            {(filePreview || product?.image_url || data.image_url) ? (
              <div className="mt-2 w-32 h-32 bg-gray-100 rounded overflow-hidden">
                <img src={filePreview || (product?.image_url as string) || (data.image_url as string) || ''} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : null}
            {errors.image && <div className="text-sm text-red-600">{errors.image as any}</div>}
          </div>

          <div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={data.is_active} onChange={e=>setData('is_active', e.target.checked)} />
              <span>Active</span>
            </label>
            {errors.is_active && <div className="text-sm text-red-600">{errors.is_active}</div>}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button disabled={processing} className="bg-emerald-600 text-white px-4 py-2 rounded">{isEdit ? 'Update' : 'Create'}</button>
            {isEdit && (product?.slug || data.slug) ? (
              <a
                href={`/products/${product?.slug || data.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded border text-blue-700 hover:bg-blue-50"
              >
                Preview
              </a>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
