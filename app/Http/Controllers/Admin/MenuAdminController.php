<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Validation\Rule;

class MenuAdminController extends Controller
{
    public function index()
    {
        $menus = Menu::orderBy('name')->paginate(20);
        return Inertia::render('Admin/Menus/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Menus/Edit', [
            'menu' => null,
            'items' => [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'location' => ['required','string','max:100'],
            'is_active' => ['boolean'],
        ]);
        $menu = Menu::create($data);
        return redirect()->route('admin.menus.edit', $menu->id)->with('success', 'Menu created');
    }

    public function edit(Menu $menu)
    {
        $items = MenuItem::where('menu_id', $menu->id)
            ->whereNull('parent_id')
            ->orderBy('position')
            ->with(['children' => function($q){ $q->orderBy('position'); }])
            ->get();
        return Inertia::render('Admin/Menus/Edit', [
            'menu' => $menu,
            'items' => $items,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'location' => ['required','string','max:100'],
            'is_active' => ['boolean'],
        ]);
        $menu->update($data);
        return back()->with('success', 'Menu updated');
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();
        return redirect()->route('admin.menus.index')->with('success', 'Menu deleted');
    }

    // Items
    public function addItem(Request $request, Menu $menu)
    {
        $request->merge([
            'parent_id' => $request->input('parent_id') ?: null,
            'visible' => $request->boolean('visible'),
        ]);
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'url' => ['required','string','max:2048'],
            'parent_id' => ['nullable','integer', Rule::exists('menu_items','id')->where('menu_id', $menu->id)],
            'target' => ['nullable','string','max:20'],
            'visible' => ['boolean'],
            'icon' => ['nullable','string','max:255'],
        ]);
        $position = (int) MenuItem::where('menu_id', $menu->id)
            ->where('parent_id', $data['parent_id'] ?? null)
            ->max('position') + 1;
        MenuItem::create([
            'menu_id' => $menu->id,
            'parent_id' => $data['parent_id'] ?? null,
            'title' => $data['title'],
            'url' => $data['url'],
            'position' => $position,
            'target' => $data['target'] ?? '_self',
            'visible' => $data['visible'] ?? true,
            'icon' => $data['icon'] ?? null,
        ]);
        return back()->with('success', 'Menu item added');
    }

    public function updateItem(Request $request, Menu $menu, MenuItem $item)
    {
        abort_unless($item->menu_id === $menu->id, 404);
        $request->merge([
            'parent_id' => $request->input('parent_id') ?: null,
            'visible' => $request->boolean('visible'),
        ]);
        $data = $request->validate([
            'title' => ['required','string','max:255'],
            'url' => ['required','string','max:2048'],
            'parent_id' => ['nullable','integer', Rule::exists('menu_items','id')->where('menu_id', $menu->id)],
            'target' => ['nullable','string','max:20'],
            'visible' => ['boolean'],
            'icon' => ['nullable','string','max:255'],
        ]);
        $item->update([
            'title' => $data['title'],
            'url' => $data['url'],
            'parent_id' => $data['parent_id'] ?? null,
            'target' => $data['target'] ?? '_self',
            'visible' => $data['visible'] ?? true,
            'icon' => $data['icon'] ?? null,
        ]);
        return back()->with('success', 'Menu item updated');
    }

    public function deleteItem(Menu $menu, MenuItem $item)
    {
        abort_unless($item->menu_id === $menu->id, 404);
        $item->delete();
        return back()->with('success', 'Menu item deleted');
    }

    public function reorder(Request $request, Menu $menu)
    {
        // Allow JSON string payload from a single hidden input
        $orders = $request->input('orders');
        if (is_string($orders)) {
            $decoded = json_decode($orders, true);
            if (is_array($decoded)) {
                $request->merge(['orders' => $decoded]);
            }
        }
        $data = $request->validate([
            'orders' => ['required','array'], // [{id, position, parent_id}]
            'orders.*.id' => ['required','integer'],
            'orders.*.position' => ['required','integer','min:0'],
            'orders.*.parent_id' => ['nullable','integer'],
        ]);
        foreach ($data['orders'] as $o) {
            MenuItem::where('menu_id', $menu->id)->where('id', $o['id'])->update([
                'position' => $o['position'],
                'parent_id' => $o['parent_id'] ?? null,
            ]);
        }
        return back()->with('success', 'Menu order updated');
    }
}
