<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductModel;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductAdminController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->when($request->filled('q'), function($q) use ($request) {
                $s = trim($request->string('q')->toString());
                $q->where(function($w) use ($s) {
                    $w->where('name', 'like', "%$s%")
                      ->orWhere('slug', 'like', "%$s%")
                      ->orWhere('sku', 'like', "%$s%")
                      ->orWhere('description', 'like', "%$s%")
                      ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%$s%"));
                    if (is_numeric($s)) {
                        $num = 0 + $s;
                        $w->orWhere('id', '=', $num)
                          ->orWhere('price', '=', $num)
                          ->orWhere('stock', '=', (int)$num);
                    }
                });
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => Category::orderBy('name')->get(['id','name']),
            'models' => ProductModel::orderBy('name')->get(['id','name','is_active']),
        ]);
    }

    public function store(Request $request)
    {
        // Normalize inputs to avoid false 'required' trips
        $request->merge([
            'price' => $request->input('price') === '' ? null : $request->input('price'),
            'stock' => $request->input('stock') === '' ? null : $request->input('stock'),
            'slug' => trim((string)$request->input('slug')) === '' ? null : trim((string)$request->input('slug')),
            'name' => is_string($request->input('name')) ? trim($request->input('name')) : $request->input('name'),
        ]);
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:products,slug'],
            'sku' => ['nullable','string','max:100','unique:products,sku'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'product_model_id' => ['nullable','integer','exists:product_models,id'],
            'description' => ['nullable','string'],
            'price' => ['required','numeric','min:0'],
            'stock' => ['required','integer','min:0'],
            'image_url' => ['nullable','url'],
            'image' => ['nullable','image','max:4096'],
            'is_active' => ['boolean'],
        ]);
        if (empty($data['slug'])) {
            $data['slug'] = str( $data['name'] . '-' . str()->random(5) )->slug();
        }
        if (empty($data['sku'])) {
            $data['sku'] = $this->generateUniqueSku($data['name']);
        }
        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }
        Product::create($data);
        return redirect()->route('admin.products.index')->with('success', 'Product created');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => $product->only(['id','name','slug','sku','category_id','product_model_id','description','price','stock','image_url','is_active']),
            'categories' => Category::orderBy('name')->get(['id','name']),
            'models' => ProductModel::orderBy('name')->get(['id','name','is_active']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        // Normalize empty strings to null for numeric fields to avoid confusing validation messages
        $request->merge([
            'price' => $request->input('price') === '' ? null : $request->input('price'),
            'stock' => $request->input('stock') === '' ? null : $request->input('stock'),
            'slug' => trim((string)$request->input('slug')) === '' ? null : trim((string)$request->input('slug')),
            'name' => is_string($request->input('name')) ? trim($request->input('name')) : $request->input('name'),
        ]);
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:products,slug,' . $product->id],
            'sku' => ['nullable','string','max:100','unique:products,sku,' . $product->id],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'product_model_id' => ['nullable','integer','exists:product_models,id'],
            'description' => ['nullable','string'],
            'price' => ['required','numeric','min:0'],
            'stock' => ['required','integer','min:0'],
            'image_url' => ['nullable','url'],
            'image' => ['nullable','image','max:4096'],
            'is_active' => ['boolean'],
        ]);
        if (empty($data['sku'])) {
            $data['sku'] = $this->generateUniqueSku($data['name']);
        }
        if (empty($data['slug'])) {
            $data['slug'] = str( $data['name'] . '-' . str()->random(5) )->slug();
        }
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }
        $product->update($data);
        return redirect()->route('admin.products.index')->with('success', 'Product updated');
    }

    protected function generateUniqueSku(string $name): string
    {
        do {
            $candidate = 'SKU-' . strtoupper(Str::random(8));
        } while (Product::where('sku', $candidate)->exists());
        return $candidate;
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return back()->with('success', 'Product deleted');
    }
}
