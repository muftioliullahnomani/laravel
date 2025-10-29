import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
  const { props } = usePage();
  const user = (props as any)?.auth?.user as { name?: string; is_admin?: boolean } | null;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              You're logged in!
            </div>
          </div>

          {user?.is_admin ? (
            <AdminCardGrid />
          ) : null}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function AdminCardGrid() {
  const defaultOrder = [
    'home_style',
    'section_style',
    'homepage_sections',
    'product_models',
    'products',
    'categories',
    'orders',
    'users',
  ];
  const [order, setOrder] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('dashboard_card_order');
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.every((x)=>typeof x === 'string')) {
        const withNew = [...parsed, ...defaultOrder.filter(id=>!parsed.includes(id))];
        return withNew.filter(id=>defaultOrder.includes(id));
      }
    } catch {}
    return defaultOrder;
  });
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dragEnabled, setDragEnabled] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('dashboard_drag_enabled');
      return raw === null ? true : JSON.parse(raw) === true;
    } catch { return true; }
  });

  React.useEffect(()=>{
    try { localStorage.setItem('dashboard_card_order', JSON.stringify(order)); } catch {}
  }, [order]);
  React.useEffect(()=>{
    try { localStorage.setItem('dashboard_drag_enabled', JSON.stringify(dragEnabled)); } catch {}
  }, [dragEnabled]);

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    if (!dragEnabled) return;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (overIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragEnabled) return;
    if (dragIdx === null || dragIdx === overIdx) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(overIdx, 0, moved);
    setDragIdx(overIdx);
    setOrder(next);
  };
  const onDrop = () => setDragIdx(null);

  const base = `block bg-white rounded shadow p-5 hover:shadow-md transition ${dragEnabled ? 'cursor-move' : ''}`;
  const renderCard = (id: string) => {
    switch (id) {
      case 'home_style':
        return (
          <Link href={route('dashboard.home_style.edit')} className={base}>
            <div className="text-lg font-medium">Home Card Style</div>
            <div className="text-gray-600">Edit homepage product card appearance</div>
          </Link>
        );
      case 'section_style':
        return (
          <Link href="/dashboard/section-style" className={base}>
            <div className="text-lg font-medium">Section Card Style</div>
            <div className="text-gray-600">Edit section product card appearance</div>
          </Link>
        );
      case 'homepage_sections':
        return (
          <Link href={route('admin.homepage.sections.index')} className={base}>
            <div className="text-lg font-medium">Homepage Sections</div>
            <div className="text-gray-600">Manage homepage section blocks</div>
          </Link>
        );
      case 'product_models':
        return (
          <Link href={route('admin.product_models.index')} className={base}>
            <div className="text-lg font-medium">Product Models</div>
            <div className="text-gray-600">Design templates and assign to products</div>
          </Link>
        );
      case 'products':
        return (
          <Link href={route('admin.products.index')} className={base}>
            <div className="text-lg font-medium">Manage Products</div>
            <div className="text-gray-600">Create, edit, delete products</div>
          </Link>
        );
      case 'categories':
        return (
          <Link href={route('admin.categories.index')} className={base}>
            <div className="text-lg font-medium">Manage Categories</div>
            <div className="text-gray-600">Create, edit, delete categories</div>
          </Link>
        );
      case 'orders':
        return (
          <Link href={route('admin.orders.index')} className={base}>
            <div className="text-lg font-medium">Manage Orders</div>
            <div className="text-gray-600">View and update order status</div>
          </Link>
        );
      case 'users':
        return (
          <Link href={route('admin.users.index')} className={base}>
            <div className="text-lg font-medium">Manage Users</div>
            <div className="text-gray-600">Create, edit, delete, promote to admin</div>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-medium">Admin Shortcuts</div>
        <button
          type="button"
          onClick={()=>setDragEnabled(v=>!v)}
          className={`px-3 py-1 rounded border ${dragEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
          title="Toggle draggable order"
        >
          {dragEnabled ? 'Disable drag' : 'Enable drag'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {order.map((id, idx) => (
        <div
          key={id}
          draggable={dragEnabled}
          onDragStart={onDragStart(idx)}
          onDragOver={onDragOver(idx)}
          onDrop={onDrop}
        >
          {renderCard(id)}
        </div>
      ))}
      </div>
    </div>
  );
}
