<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(rand(2, 4), true);
        $sig = $this->faker->numberBetween(1, 100000);
        $unsplash = "https://source.unsplash.com/640x640/?product,ecommerce,gadget&sig={$sig}";
        return [
            'category_id' => null,
            'name' => Str::title($name),
            'slug' => Str::slug($name . '-' . Str::random(5)),
            'sku' => 'SKU-' . strtoupper(Str::random(8)),
            'description' => $this->faker->paragraphs(2, true),
            'price' => $this->faker->randomFloat(2, 5, 500),
            'stock' => $this->faker->numberBetween(0, 200),
            'image_url' => $unsplash,
            'is_active' => $this->faker->boolean(90),
        ];
    }
}

