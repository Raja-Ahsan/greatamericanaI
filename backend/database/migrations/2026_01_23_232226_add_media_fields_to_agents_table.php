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
        Schema::table('agents', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('file_path');
            $table->string('thumbnail_image')->nullable()->after('video_url');
            $table->json('gallery_images')->nullable()->after('thumbnail_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'thumbnail_image', 'gallery_images']);
        });
    }
};
