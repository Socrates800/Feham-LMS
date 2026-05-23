<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->string('month');
            $table->decimal('base_salary', 10, 2);
            $table->decimal('allowances', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2);
            $table->enum('status', ['draft', 'issued'])->default('draft');
            $table->json('breakdown')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_slips');
    }
};
