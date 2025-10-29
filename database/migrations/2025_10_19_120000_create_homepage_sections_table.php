<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('homepage_section_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('homepage_sections')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->unsignedInteger('product_limit')->default(4);
            $table->timestamps();
            $table->unique(['section_id','category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_section_category');
        Schema::dropIfExists('homepage_sections');
    }
};
