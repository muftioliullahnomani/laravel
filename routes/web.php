<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\HomeCardStyleController;
use App\Http\Controllers\Admin\ProductAdminController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Storefront
Route::get('/', [ProductController::class, 'index'])->name('store.home');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// Cart (session-based)
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add/{product:slug}', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove/{product:slug}', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
Route::post('/cart/checkout-cod', [CartController::class, 'checkoutCod'])->name('cart.checkout_cod');

// Admin routes (protected)
Route::prefix('admin')
    ->middleware(['auth', 'verified', AdminMiddleware::class])
    ->as('admin.')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        Route::get('/products', [ProductAdminController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductAdminController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductAdminController::class, 'store'])->name('products.store');
        Route::get('/products/{product:id}/edit', [ProductAdminController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product:id}', [ProductAdminController::class, 'update'])->name('products.update');
        Route::delete('/products/{product:id}', [ProductAdminController::class, 'destroy'])->name('products.destroy');

        // Categories management
        Route::get('/categories', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'create'])->name('categories.create');
        Route::post('/categories', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category:id}/edit', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category:id}', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category:id}', [\App\Http\Controllers\Admin\CategoryAdminController::class, 'destroy'])->name('categories.destroy');

        // Orders management
        Route::get('/orders', [\App\Http\Controllers\Admin\OrderAdminController::class, 'index'])->name('orders.index');
        // Bulk must be before parameterized routes
        Route::any('/orders/bulk', [\App\Http\Controllers\Admin\OrderAdminController::class, 'bulk'])->name('orders.bulk');
        // Alternate bulk endpoint to avoid any server/router conflicts
        Route::any('/orders-bulk', [\App\Http\Controllers\Admin\OrderAdminController::class, 'bulk'])->name('orders.bulk_alt');
        Route::get('/orders/{order:id}', [\App\Http\Controllers\Admin\OrderAdminController::class, 'show'])->whereNumber('order')->name('orders.show');
        Route::put('/orders/{order:id}', [\App\Http\Controllers\Admin\OrderAdminController::class, 'update'])->whereNumber('order')->name('orders.update');
        Route::post('/orders/{order:id}/cancel', [\App\Http\Controllers\Admin\OrderAdminController::class, 'cancel'])->whereNumber('order')->name('orders.cancel');
        Route::post('/orders/{order:id}/mark-paid', [\App\Http\Controllers\Admin\OrderAdminController::class, 'markPaid'])->whereNumber('order')->name('orders.mark_paid');
        Route::post('/orders/{order:id}/mark-shipped', [\App\Http\Controllers\Admin\OrderAdminController::class, 'markShipped'])->whereNumber('order')->name('orders.mark_shipped');
        Route::post('/orders/{order:id}/mark-completed', [\App\Http\Controllers\Admin\OrderAdminController::class, 'markCompleted'])->whereNumber('order')->name('orders.mark_completed');
        Route::delete('/orders/{order:id}', [\App\Http\Controllers\Admin\OrderAdminController::class, 'destroy'])->whereNumber('order')->name('orders.destroy');

        // Users management
        Route::get('/users', [\App\Http\Controllers\Admin\UserAdminController::class, 'index'])->name('users.index');
        Route::get('/users/create', [\App\Http\Controllers\Admin\UserAdminController::class, 'create'])->name('users.create');
        Route::post('/users', [\App\Http\Controllers\Admin\UserAdminController::class, 'store'])->name('users.store');
        Route::get('/users/{user:id}/edit', [\App\Http\Controllers\Admin\UserAdminController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user:id}', [\App\Http\Controllers\Admin\UserAdminController::class, 'update'])->name('users.update');
        Route::delete('/users/{user:id}', [\App\Http\Controllers\Admin\UserAdminController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user:id}/promote', [\App\Http\Controllers\Admin\UserAdminController::class, 'promote'])->name('users.promote');
        Route::post('/users/{user:id}/demote', [\App\Http\Controllers\Admin\UserAdminController::class, 'demote'])->name('users.demote');

        // Menus management
        Route::get('/menus', [\App\Http\Controllers\Admin\MenuAdminController::class, 'index'])->name('menus.index');
        Route::get('/menus/create', [\App\Http\Controllers\Admin\MenuAdminController::class, 'create'])->name('menus.create');
        Route::post('/menus', [\App\Http\Controllers\Admin\MenuAdminController::class, 'store'])->name('menus.store');
        Route::get('/menus/{menu:id}/edit', [\App\Http\Controllers\Admin\MenuAdminController::class, 'edit'])->name('menus.edit');
        Route::put('/menus/{menu:id}', [\App\Http\Controllers\Admin\MenuAdminController::class, 'update'])->name('menus.update');
        Route::delete('/menus/{menu:id}', [\App\Http\Controllers\Admin\MenuAdminController::class, 'destroy'])->name('menus.destroy');
        Route::post('/menus/{menu:id}/items', [\App\Http\Controllers\Admin\MenuAdminController::class, 'addItem'])->name('menus.items.add');
        Route::put('/menus/{menu:id}/items/{item:id}', [\App\Http\Controllers\Admin\MenuAdminController::class, 'updateItem'])->name('menus.items.update');
        Route::delete('/menus/{menu:id}/items/{item:id}', [\App\Http\Controllers\Admin\MenuAdminController::class, 'deleteItem'])->name('menus.items.delete');
        Route::post('/menus/{menu:id}/reorder', [\App\Http\Controllers\Admin\MenuAdminController::class, 'reorder'])->name('menus.items.reorder');

        // Product Models management
        Route::get('/product-models', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'index'])->name('product_models.index');
        Route::get('/product-models/create', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'create'])->name('product_models.create');
        Route::post('/product-models', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'store'])->name('product_models.store');
        Route::get('/product-models/{model:id}/edit', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'edit'])->name('product_models.edit');
        Route::put('/product-models/{model:id}', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'update'])->name('product_models.update');
        Route::delete('/product-models/{model:id}', [\App\Http\Controllers\Admin\ProductModelAdminController::class, 'destroy'])->name('product_models.destroy');

        // Homepage sections management
        Route::get('/homepage/sections', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'index'])->name('homepage.sections.index');
        Route::get('/homepage/sections/create', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'create'])->name('homepage.sections.create');
        Route::post('/homepage/sections', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'store'])->name('homepage.sections.store');
        Route::get('/homepage/sections/{section:id}/edit', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'edit'])->name('homepage.sections.edit');
        Route::put('/homepage/sections/{section:id}', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'update'])->name('homepage.sections.update');
        Route::delete('/homepage/sections/{section:id}', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'destroy'])->name('homepage.sections.destroy');
        Route::post('/homepage/sections/reorder', [\App\Http\Controllers\Admin\HomepageSectionAdminController::class, 'reorder'])->name('homepage.sections.reorder');
    });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Dashboard-managed Home Card Style editor
    Route::get('/dashboard/home-style', [HomeCardStyleController::class, 'edit'])->name('dashboard.home_style.edit');
    Route::put('/dashboard/home-style', [HomeCardStyleController::class, 'update'])->name('dashboard.home_style.update');
    // Dashboard-managed Section Card Style editor
    Route::get('/dashboard/section-style', [HomeCardStyleController::class, 'edit'])->name('dashboard.section_style.edit');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

