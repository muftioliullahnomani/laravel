<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin/Test user
        User::query()->firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
                'remember_token' => Str::random(10),
                'is_admin' => true,
            ]
        );

        // Categories
        $categoryNames = ['Electronics', 'Fashion', 'Home', 'Sports', 'Toys'];
        $categories = collect($categoryNames)->map(fn ($n) => Category::factory()->create(['name' => $n]));

        // Products
        foreach (range(1, 30) as $i) {
            $category = $categories->random();
            Product::factory()->create([
                'category_id' => $category->id,
            ]);
        }
    }
}
