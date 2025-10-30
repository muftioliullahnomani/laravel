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

        $categoryNames = ['Electronics', 'Fashion', 'Home', 'Sports', 'Toys'];
        $categories = [];
        foreach ($categoryNames as $n) {
            $slug = Str::slug($n);
            $categories[$n] = Category::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $n,
                    'description' => $n . ' category',
                    'parent_id' => null,
                ]
            );
        }

        foreach ($categories as $name => $cat) {
            for ($i = 1; $i <= 5; $i++) {
                $pname = $name . ' Item ' . $i;
                $slug = Str::slug($pname) . '-' . strtolower(Str::random(4));
                Product::query()->firstOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $cat->id,
                        'product_model_id' => null,
                        'name' => $pname,
                        'sku' => strtoupper(substr($name, 0, 3)) . '-' . str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                        'description' => $pname . ' description',
                        'price' => rand(10, 200) * 100,
                        'stock' => rand(5, 50),
                        'image_url' => null,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
