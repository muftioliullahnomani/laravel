<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Menu;
use App\Models\MenuItem;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'backendMenu' => function () use ($request) {
                $user = $request->user();
                if (!$user || !$user->is_admin) {
                    return null;
                }
                $menu = Menu::query()
                    ->where('location', 'backend')
                    ->where('is_active', true)
                    ->first();
                if (!$menu) {
                    return null;
                }
                $items = MenuItem::query()
                    ->where('menu_id', $menu->id)
                    ->whereNull('parent_id')
                    ->orderBy('position')
                    ->with(['children' => function($q){ $q->orderBy('position'); }])
                    ->get(['id','title','url','target','visible','icon','position','parent_id','align']);
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'items' => $items,
                ];
            },
            'frontendMenu' => function () {
                $menu = Menu::query()
                    ->where('location', 'frontend')
                    ->where('is_active', true)
                    ->first();
                if (!$menu) {
                    return null;
                }
                $items = MenuItem::query()
                    ->where('menu_id', $menu->id)
                    ->whereNull('parent_id')
                    ->orderBy('position')
                    ->with(['children' => function($q){ $q->orderBy('position'); }])
                    ->get(['id','title','url','target','visible','icon','position','parent_id','align']);
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'items' => $items,
                ];
            },
        ];
    }
}

