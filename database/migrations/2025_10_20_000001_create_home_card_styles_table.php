<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('home_card_styles', function (Blueprint $table) {
            $table->id();
            $table->json('style');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_card_styles');
    }
};
