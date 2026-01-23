<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->text('long_description');
            $table->decimal('price', 10, 2);
            $table->string('category');
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews')->default(0);
            $table->string('image')->nullable();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->json('capabilities')->nullable();
            $table->boolean('api_access')->default(true);
            $table->string('model')->nullable();
            $table->string('response_time')->nullable();
            $table->json('languages')->nullable();
            $table->json('tags')->nullable();
            $table->date('date_added');
            $table->integer('sales')->default(0);
            $table->enum('status', ['active', 'pending', 'inactive'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
