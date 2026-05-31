<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('plan')->default('starter')->after('is_active');
            $table->string('billing_status')->default('trial')->after('plan');
            $table->timestamp('subscription_ends_at')->nullable()->after('billing_status');
            $table->unsignedInteger('student_limit')->nullable()->after('subscription_ends_at');
            $table->text('notes')->nullable()->after('student_limit');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn([
                'plan',
                'billing_status',
                'subscription_ends_at',
                'student_limit',
                'notes',
            ]);
        });
    }
};
