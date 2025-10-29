<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;

class CartController extends Controller
{
    protected function getCart(Request $request): array
    {
        return $request->session()->get('cart', []);
    }

    protected function putCart(Request $request, array $cart): void
    {
        $request->session()->put('cart', $cart);
    }

    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $productIds = array_keys($cart);
        $products = $productIds ? Product::whereIn('id', $productIds)->get() : collect();

        $items = $products->map(function($p) use ($cart) {
            $qty = $cart[$p->id] ?? 0;
            $total = $qty * (float)$p->price;
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'image_url' => $p->image_url,
                'price' => (float)$p->price,
                'qty' => $qty,
                'total' => $total,
            ];
        })->values();

        $subtotal = $items->sum('total');

        return Inertia::render('Store/Cart', [
            'items' => $items,
            'subtotal' => $subtotal,
        ]);
    }

    public function add(Request $request, Product $product)
    {
        $validated = $request->validate([
            'qty' => ['nullable','integer','min:1','max:100']
        ]);
        $qty = (int)($validated['qty'] ?? 1);

        $cart = $this->getCart($request);
        $cart[$product->id] = ($cart[$product->id] ?? 0) + $qty;
        $this->putCart($request, $cart);

        return back()->with('success', 'Added to cart');
    }

    public function update(Request $request)
    {
        $lines = $request->input('lines');
        if (is_string($lines)) {
            $decoded = json_decode($lines, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge(['lines' => $decoded]);
            }
        }

        $validated = $request->validate([
            'lines' => ['required','array'],
            'lines.*.product_id' => ['required','integer'],
            'lines.*.qty' => ['required','integer','min:0','max:100'],
        ]);

        $cart = [];
        foreach ($validated['lines'] as $line) {
            if ($line['qty'] > 0) {
                $cart[$line['product_id']] = $line['qty'];
            }
        }
        $this->putCart($request, $cart);
        return back()->with('success', 'Cart updated');
    }

    public function remove(Request $request, Product $product)
    {
        $cart = $this->getCart($request);
        unset($cart[$product->id]);
        $this->putCart($request, $cart);
        return back()->with('success', 'Removed from cart');
    }

    public function clear(Request $request)
    {
        $this->putCart($request, []);
        return back()->with('success', 'Cart cleared');
    }

    public function checkoutCod(Request $request)
    {
        $cart = $this->getCart($request);
        if (empty($cart)) {
            return back()->with('error', 'Your cart is empty');
        }

        $productIds = array_keys($cart);
        $products = Product::whereIn('id', $productIds)->get();
        if ($products->isEmpty()) {
            return back()->with('error', 'No products found in cart');
        }

        $subtotal = 0;
        foreach ($products as $p) {
            $qty = (int)($cart[$p->id] ?? 0);
            $subtotal += $qty * (float)$p->price;
        }

        $order = Order::create([
            'user_id' => optional($request->user())->id,
            'status' => 'placed',
            'payment_method' => 'COD',
            'payment_status' => 'pending',
            'subtotal' => $subtotal,
            'tax' => 0,
            'shipping' => 0,
            'total' => $subtotal,
            'customer_name' => $request->user()->name ?? 'Guest',
            'customer_email' => $request->user()->email ?? '',
            'customer_phone' => '',
            'ship_line1' => '',
            'ship_line2' => '',
            'ship_city' => '',
            'ship_state' => '',
            'ship_postal_code' => '',
            'ship_country' => '',
            'placed_at' => now(),
        ]);

        foreach ($products as $p) {
            $qty = (int)($cart[$p->id] ?? 0);
            if ($qty <= 0) continue;
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $p->id,
                'quantity' => $qty,
                'unit_price' => (float)$p->price,
                'total' => $qty * (float)$p->price,
            ]);
        }

        // Clear cart after successful checkout
        $this->putCart($request, []);
        return redirect()->route('cart.index')->with('success', 'Order placed with Cash on Delivery');
    }
}
