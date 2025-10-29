<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductImageAndMoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have categories to attach to
        $categories = Category::query()->get(['id','slug']);
        if ($categories->isEmpty()) {
            $categories = Category::factory()->count(5)->create();
        }

        // Update existing products with Unsplash image URLs
        Product::query()->chunkById(200, function ($products) {
            foreach ($products as $p) {
                $sig = random_int(1, 1000000);
                $p->image_url = "https://source.unsplash.com/640x640/?product,ecommerce,gadget&sig={$sig}";
                if (!$p->is_active) { $p->is_active = true; }
                $p->save();
            }
        });

        // Create 50 more products with Unsplash images
        for ($i = 0; $i < 50; $i++) {
            $category = $categories->random();
            Product::factory()->create([
                'category_id' => $category->id,
            ]);
        }
    }
}
