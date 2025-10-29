<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HomepageSection;
use App\Models\Category;
use App\Models\HomeCardStyle;

class HomepageSectionAdminController extends Controller
{
    public function index()
    {
        $sections = HomepageSection::with(['categories' => function($q){ $q->orderBy('name'); }])
            ->ordered()->paginate(20);
        return Inertia::render('Admin/Homepage/Sections/Index', [
            'sections' => $sections,
        ]);
    }

    public function create()
    {
        $style = optional(HomeCardStyle::query()->first())->style;
        $sectionStyle = (isset($style['home']) || isset($style['section'])) ? ($style['section'] ?? null) : $style; // legacy fallback
        return Inertia::render('Admin/Homepage/Sections/Edit', [
            'section' => null,
            'allCategories' => Category::orderBy('name')->get(['id','name']),
            'homeStyle' => $sectionStyle,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'is_active' => ['boolean'],
            'position' => ['nullable','integer','min:0'],
            'categories' => ['array'],
            'categories.*.id' => ['required','integer','exists:categories,id'],
            'categories.*.product_limit' => ['required','integer','min:1','max:50'],
        ]);
        $section = HomepageSection::create([
            'title' => $data['title'],
            'is_active' => $data['is_active'] ?? true,
            'position' => $data['position'] ?? 0,
        ]);
        if (!empty($data['categories'])) {
            $sync = [];
            foreach ($data['categories'] as $c) {
                $sync[$c['id']] = ['product_limit' => $c['product_limit']];
            }
            $section->categories()->sync($sync);
        }
        return redirect()->route('admin.homepage.sections.index')->with('success', 'Section created');
    }

    public function edit(HomepageSection $section)
    {
        $section->load('categories');
        $style = optional(HomeCardStyle::query()->first())->style;
        $sectionStyle = (isset($style['home']) || isset($style['section'])) ? ($style['section'] ?? null) : $style; // legacy fallback
        return Inertia::render('Admin/Homepage/Sections/Edit', [
            'section' => $section,
            'allCategories' => Category::orderBy('name')->get(['id','name']),
            'homeStyle' => $sectionStyle,
        ]);
    }

    public function update(Request $request, HomepageSection $section)
    {
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'is_active' => ['boolean'],
            'position' => ['nullable','integer','min:0'],
            'categories' => ['array'],
            'categories.*.id' => ['required','integer','exists:categories,id'],
            'categories.*.product_limit' => ['required','integer','min:1','max:50'],
        ]);
        $section->update([
            'title' => $data['title'],
            'is_active' => $data['is_active'] ?? false,
            'position' => $data['position'] ?? 0,
        ]);
        $sync = [];
        foreach ($data['categories'] ?? [] as $c) {
            $sync[$c['id']] = ['product_limit' => $c['product_limit']];
        }
        $section->categories()->sync($sync);
        return redirect()->route('admin.homepage.sections.index')->with('success', 'Section updated');
    }

    public function destroy(HomepageSection $section)
    {
        $section->delete();
        return back()->with('success', 'Section deleted');
    }

    public function reorder(Request $request)
    {
        $orders = $request->validate([
            'orders' => ['required','array'],
            'orders.*.id' => ['required','integer','exists:homepage_sections,id'],
            'orders.*.position' => ['required','integer','min:0'],
        ])['orders'];
        foreach ($orders as $o) {
            HomepageSection::where('id', $o['id'])->update(['position' => $o['position']]);
        }
        return back()->with('success', 'Order updated');
    }
}
