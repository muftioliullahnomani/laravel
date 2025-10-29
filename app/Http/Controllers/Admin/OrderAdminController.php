<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderAdminController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()
            ->when($request->filled('q'), function ($q) use ($request) {
                $s = $request->string('q')->toString();
                $q->where(function($w) use ($s) {
                    $w->where('id', $s)
                      ->orWhere('customer_email', 'like', "%$s%")
                      ->orWhere('customer_name', 'like', "%$s%");
                });
            })
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('payment_status'), fn($q) => $q->where('payment_status', $request->string('payment_status')->toString()))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->input('q'),
                'status' => $request->input('status'),
                'payment_status' => $request->input('payment_status'),
            ],
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['items' => function($q){ $q->with('product:id,name,slug'); }]);
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required','string','max:50'],
            'payment_status' => ['required','string','max:50'],
        ]);
        $order->update($data);
        return back()->with('success', 'Order updated');
    }

    public function cancel(Order $order)
    {
        if ($order->status !== 'cancelled') {
            $order->status = 'cancelled';
            // Do not force payment status if already refunded/paid logic exists; default to unpaid if empty
            if (!$order->payment_status) {
                $order->payment_status = 'unpaid';
            }
            $order->save();
        }
        return back()->with('success', 'Order cancelled');
    }

    public function markPaid(Order $order)
    {
        $order->status = $order->status === 'pending' ? 'paid' : $order->status;
        $order->payment_status = 'paid';
        $order->save();
        return back()->with('success', 'Order marked as paid');
    }

    public function markShipped(Order $order)
    {
        $order->status = 'shipped';
        $order->save();
        return back()->with('success', 'Order marked as shipped');
    }

    public function markCompleted(Order $order)
    {
        $order->status = 'completed';
        if ($order->payment_status !== 'paid') {
            $order->payment_status = 'paid';
        }
        $order->save();
        return back()->with('success', 'Order marked as completed');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('admin.orders.index')->with('success', 'Order deleted');
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => ['required','string','in:cancel,mark-paid,mark-shipped,mark-completed,delete'],
            'ids' => ['required','array'],
            'ids.*' => ['integer','exists:orders,id'],
        ]);

        $ids = $data['ids'];
        $action = $data['action'];

        switch ($action) {
            case 'cancel':
                Order::whereIn('id', $ids)->update(['status' => 'cancelled']);
                break;
            case 'mark-paid':
                Order::whereIn('id', $ids)->update(['payment_status' => 'paid']);
                break;
            case 'mark-shipped':
                Order::whereIn('id', $ids)->update(['status' => 'shipped']);
                break;
            case 'mark-completed':
                Order::whereIn('id', $ids)->update(['status' => 'completed', 'payment_status' => 'paid']);
                break;
            case 'delete':
                Order::whereIn('id', $ids)->delete();
                break;
        }

        return back()->with('success', 'Bulk action applied');
    }
}
