<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('roll_number');
            $table->string('name');
            $table->string('guardian_name');
            $table->string('guardian_phone');
            $table->string('guardian_cnic')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'roll_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
