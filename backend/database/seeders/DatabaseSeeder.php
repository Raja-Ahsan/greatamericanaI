<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create or Update Admin User
        User::updateOrCreate(
            ['email' => 'admin@greatamerican.ai'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'verified' => true,
            ]
        );

        // Create or Update Vendor User
        User::updateOrCreate(
            ['email' => 'vendor@greatamerican.ai'],
            [
                'name' => 'Vendor User',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'verified' => true,
            ]
        );

        // Create or Update Customer User (Demo)
        User::updateOrCreate(
            ['email' => 'demo@greatamerican.ai'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('demo123'),
                'role' => 'customer',
                'verified' => true,
            ]
        );

        $this->command->info('Users seeded successfully!');

        // Seed dummy agents for vendor
        $this->call(AgentSeeder::class);

        // Seed dummy sales for testing wallet integration (optional)
        $this->call(DummySalesSeeder::class);
    }
}
