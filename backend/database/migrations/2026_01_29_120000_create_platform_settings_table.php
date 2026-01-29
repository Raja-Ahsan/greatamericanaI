<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        // Seed default platform & payment settings
        DB::table('platform_settings')->insert([
            ['key' => 'platform', 'value' => json_encode([
                'platformName' => 'GreatAmerican.Ai',
                'platformFee' => 15,
                'sellerCommission' => 85,
                'taxRate' => 10,
                'maintenanceMode' => false,
            ]), 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'payment_gateways', 'value' => json_encode([
                'default_gateway' => 'stripe',
                'enabled_gateways' => ['stripe', 'paypal'],
            ]), 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
