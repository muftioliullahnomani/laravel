<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductModel;
use App\Models\Product;

class ProductModelAdminController extends Controller
{
    public function index()
    {
        $models = ProductModel::orderBy('name')->paginate(20);
        return Inertia::render('Admin/ProductModels/Index', [
            'models' => $models,
        ]);
    }

    public function create()
    {
        $previewProducts = Product::orderBy('id')->limit(50)->get(['id','name','slug']);
        $previewProduct = Product::orderBy('id')->first(['id','name','slug','price','image_url','description']);
        return Inertia::render('Admin/ProductModels/Edit', [
            'model' => null,
            'previewProducts' => $previewProducts,
            'previewProduct' => $previewProduct,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'is_active' => ['boolean'],
            'preview_product_id' => ['nullable','integer','exists:products,id'],
            'definition' => ['nullable','array'],
        ]);
        $model = ProductModel::create([
            'name' => $data['name'],
            'is_active' => $data['is_active'] ?? true,
            'preview_product_id' => $data['preview_product_id'] ?? null,
            'definition' => $data['definition'] ?? [
                'layout' => 'vertical',
                'elements' => [
                    ['id' => uniqid(), 'type' => 'title', 'props' => ['tag' => 'h1'], 'visible' => true, 'order' => 1],
                    ['id' => uniqid(), 'type' => 'price', 'props' => [], 'visible' => true, 'order' => 2],
                    ['id' => uniqid(), 'type' => 'image', 'props' => ['ratio' => '1:1'], 'visible' => true, 'order' => 0],
                    ['id' => uniqid(), 'type' => 'description', 'props' => [], 'visible' => true, 'order' => 3],
                ],
            ],
        ]);
        return redirect()->route('admin.product_models.edit', $model->id)->with('success', 'Model created');
    }

    public function edit(ProductModel $model)
    {
        $previewProducts = Product::orderBy('id')->limit(50)->get(['id','name','slug']);
        $previewProduct = null;
        if ($model->preview_product_id) {
            $previewProduct = Product::where('id', $model->preview_product_id)->first(['id','name','slug','price','image_url','description']);
        }
        if (!$previewProduct) {
            $previewProduct = Product::orderBy('id')->first(['id','name','slug','price','image_url','description']);
        }
        return Inertia::render('Admin/ProductModels/Edit', [
            'model' => $model,
            'previewProducts' => $previewProducts,
            'previewProduct' => $previewProduct,
        ]);
    }

    public function update(Request $request, ProductModel $model)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'is_active' => ['boolean'],
            'preview_product_id' => ['nullable','integer','exists:products,id'],
            'definition' => ['nullable','array'],
        ]);
        $model->update([
            'name' => $data['name'],
            'is_active' => $data['is_active'] ?? false,
            'preview_product_id' => $data['preview_product_id'] ?? null,
            'definition' => $data['definition'] ?? [],
        ]);
        return back()->with('success', 'Model updated');
    }

    public function destroy(ProductModel $model)
    {
        $model->delete();
        return back()->with('success', 'Model deleted');
    }
}
