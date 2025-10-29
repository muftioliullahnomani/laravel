<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\HomeCardStyle;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->with('category')->where('is_active', true);

        if ($search = $request->string('q')->toString()) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%");
            });
        }

        if ($categorySlug = $request->string('category')->toString()) {
            $query->whereHas('category', fn($q) => $q->where('slug', $categorySlug));
        }

        $products = $query->latest('id')->paginate(12)->withQueryString();
        $categories = Category::query()->orderBy('name')->get(['id','name','slug']);

        $sections = HomepageSection::query()
            ->active()->ordered()
            ->with(['categories' => function($q){ $q->orderBy('name'); }])
            ->get();

        $sectionBlocks = [];
        foreach ($sections as $section) {
            $groups = [];
            foreach ($section->categories as $cat) {
                $limit = (int)($cat->pivot->product_limit ?? 4);
                $catProducts = Product::query()
                    ->where('is_active', true)
                    ->where('category_id', $cat->id)
                    ->latest('id')
                    ->limit($limit)
                    ->get(['id','name','slug','image_url','price','category_id']);
                $groups[] = [
                    'category' => [ 'id' => $cat->id, 'name' => $cat->name, 'slug' => $cat->slug ?? null ],
                    'products' => $catProducts,
                ];
            }
            $sectionBlocks[] = [
                'id' => $section->id,
                'title' => $section->title,
                'groups' => $groups,
            ];
        }

        $homeStyle = optional(HomeCardStyle::query()->first())->style;
        $cart = $request->session()->get('cart', []);
        $cartCount = array_sum($cart);
        return Inertia::render('Store/Home', [
            'products' => $products,
            'categories' => $categories,
            'sections' => $sectionBlocks,
            'homeStyle' => $homeStyle,
            'cartCount' => $cartCount,
            'filters' => [
                'q' => $request->input('q'),
                'category' => $request->input('category'),
            ],
        ]);
    }

    public function show(Product $product)
    {
        $product->load('category', 'productModel');
        return Inertia::render('Store/ProductShow', [
            'product' => $product,
            'model' => $product->productModel ? [
                'id' => $product->productModel->id,
                'is_active' => (bool)$product->productModel->is_active,
                'definition' => $product->productModel->definition,
            ] : null,
        ]);
    }
}
