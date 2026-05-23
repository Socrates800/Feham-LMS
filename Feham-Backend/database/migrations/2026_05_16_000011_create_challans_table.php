<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('challan_number')->unique();
            $table->string('month');
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->json('fee_items_snapshot');
            $table->timestamps();

            $table->index(['school_id', 'month', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challans');
    }
};
