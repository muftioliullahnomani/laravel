<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class CategoryAdminController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query()
            ->with('parent:id,name')
            ->orderBy('name')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => null,
            'parents' => Category::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['nullable','string','max:255','unique:categories,slug'],
            'parent_id' => ['nullable','integer','exists:categories,id'],
            'description' => ['nullable','string'],
        ]);
        if (empty($data['slug'])) {
            $data['slug'] = str($data['name'].'-'.str()->random(4))->slug();
        }
        Category::create($data);
        return redirect()->route('admin.categories.index')->with('success', 'Category created');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => $category->only(['id','name','slug','parent_id','description']),
            'parents' => Category::where('id','!=',$category->id)->orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'slug' => ['required','string','max:255','unique:categories,slug,'.$category->id],
            'parent_id' => ['nullable','integer','exists:categories,id'],
            'description' => ['nullable','string'],
        ]);
        $category->update($data);
        return redirect()->route('admin.categories.index')->with('success', 'Category updated');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return back()->with('success', 'Category deleted');
    }
}
