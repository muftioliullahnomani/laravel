<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(rand(1, 2), true);
        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name . '-' . Str::random(4)),
            'description' => $this->faker->optional()->sentence(8),
            'parent_id' => null,
        ];
    }
}
