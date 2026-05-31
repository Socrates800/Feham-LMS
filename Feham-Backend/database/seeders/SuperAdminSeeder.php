<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'super@feham.test'],
            [
                'school_id' => null,
                'name' => 'Platform Super Admin',
                'password' => 'password',
                'role' => 'super_admin',
            ]
        );

        $this->command?->info('Super admin seeded. Login: super@feham.test / password');
    }
}
