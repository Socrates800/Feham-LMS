<?php

use App\Http\Controllers\Admin\ChallanController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\FeeController;
use App\Http\Controllers\Admin\PeriodController;
use App\Http\Controllers\Admin\SalaryController;
use App\Http\Controllers\Admin\SchoolController;
use App\Http\Controllers\Admin\StructureController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\TimetableController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\ParentPortal\ParentPortalController;
use App\Http\Controllers\Teacher\HomeworkController;
use App\Http\Controllers\Teacher\RemarkController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register-school', [OnboardingController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [SchoolController::class, 'dashboard']);
        Route::post('/school/logo', [SchoolController::class, 'uploadLogo']);
        Route::put('/school', [SchoolController::class, 'update']);

        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('classes', ClassController::class);
        Route::apiResource('sections', SectionController::class);
        Route::apiResource('periods', PeriodController::class);
        Route::apiResource('timetables', TimetableController::class);
        Route::get('/structure', [StructureController::class, 'index']);
        Route::get('/students/next-roll-number', [StudentController::class, 'nextRollNumber']);
        Route::apiResource('students', StudentController::class);

        Route::apiResource('fee-structures', FeeController::class);
        Route::post('/challans/generate', [ChallanController::class, 'generate']);
        Route::get('/challans', [ChallanController::class, 'index']);
        Route::get('/challans/{challan}/pdf', [ChallanController::class, 'downloadPdf']);
        Route::put('/challans/{challan}/mark-paid', [ChallanController::class, 'markPaid']);

        Route::post('/salary-slips/generate', [SalaryController::class, 'generate']);
        Route::get('/salary-slips', [SalaryController::class, 'index']);
        Route::get('/salary-slips/{salarySlip}/pdf', [SalaryController::class, 'downloadPdf']);
    });

    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::get('/schedule', [TeacherDashboardController::class, 'schedule']);
        Route::apiResource('homework', HomeworkController::class);
        Route::apiResource('remarks', RemarkController::class)->except(['update']);
    });

    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/children', [ParentPortalController::class, 'children']);
        Route::get('/children/{studentId}/challans', [ParentPortalController::class, 'challans']);
        Route::get('/children/{studentId}/homework', [ParentPortalController::class, 'homework']);
        Route::get('/children/{studentId}/remarks', [ParentPortalController::class, 'remarks']);
        Route::put('/remarks/{id}/read', [ParentPortalController::class, 'markRemarkRead']);
    });
});
