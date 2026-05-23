# Feham — Pakistani Private School Management SaaS
## Complete Cursor Build Prompt

---

## PROJECT OVERVIEW

You are building **Feham** — a multi-tenant SaaS platform for Pakistani private schools. The goal is a professional, modern, blazing-fast school management system marketed to private schools across Pakistan.

**Stack:**
- Frontend: `Next.js 14` (App Router) — folder name: `Feham-Frontend`
- Backend: `Laravel 11` — folder name: `Feham-Backend`
- Database: `mySQL`
- Auth: `Laravel Sanctum` (API token-based, multi-tenant aware)
- File Storage: `Laravel Storage` with S3-compatible driver
- PDF Generation: `Laravel DomPDF` (fee challans, salary slips)
- Queue: `Laravel Queues` with `Redis` driver
- Caching: `Redis`

**Create both folders inside the current directory:**
```
Feham-Project/
├── Feham-Frontend/     ← Next.js 14 app
└── Feham-Backend/      ← Laravel 11 API
```

---

## DESIGN SYSTEM

### Color Palette
```css
/* Primary — Deep Indigo (trust, professionalism) */
--primary-50:  #eef2ff;
--primary-100: #e0e7ff;
--primary-500: #6366f1;
--primary-600: #4f46e5;
--primary-700: #4338ca;
--primary-900: #1e1b4b;

/* Accent — Emerald (growth, progress) */
--accent-400: #34d399;
--accent-500: #10b981;
--accent-600: #059669;

/* Neutral — Slate */
--neutral-50:  #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-400: #94a3b8;
--neutral-600: #475569;
--neutral-800: #1e293b;
--neutral-900: #0f172a;

/* Semantic */
--danger:   #ef4444;
--warning:  #f59e0b;
--success:  #10b981;
--info:     #3b82f6;
```

### Typography
```css
/* Font Stack */
font-family: 'Inter', 'Geist', system-ui, sans-serif;

/* Scale */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */

/* Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold) */
```

### Component Style Rules
- Border radius: `8px` (sm), `12px` (md), `16px` (lg), `24px` (xl)
- Shadows: subtle, layered — `0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)`
- Cards: white background, 1px `--neutral-200` border, `12px` radius, `24px` padding
- Inputs: `--neutral-100` background, `--neutral-200` border, `8px` radius, focus ring `--primary-500`
- Buttons: Primary uses `--primary-600` bg with white text; hover `--primary-700`; Ghost uses transparent with border
- Transitions: `150ms ease` for hover, `200ms ease` for modals/drawers
- All UI must feel like **Notion × Linear × Vercel dashboard** — minimal, dense, purposeful

### UI Library
Use **shadcn/ui** on top of **Tailwind CSS v3** for the frontend. Install and configure it fully. Use **Lucide React** for icons. Import **Inter** from Google Fonts or next/font.

---

## MULTI-TENANCY ARCHITECTURE

Every school is a **tenant**. Every database table (except `schools` and `users` at the global level) must have a `school_id` foreign key. All API routes must be scoped to the authenticated school's tenant context.

### Tenant Resolution
- Resolve tenant via subdomain: `schoolname.feham.pk`
- Or via `X-School-ID` header for local dev
- Backend middleware: `EnsureTenantContext` — sets school context on every request
- All Eloquent models use a `BelongsToSchool` trait that auto-scopes queries to current school

```php
// App\Traits\BelongsToSchool.php
trait BelongsToSchool {
    protected static function bootBelongsToSchool() {
        static::addGlobalScope('school', function ($query) {
            if (auth()->check()) {
                $query->where('school_id', auth()->user()->school_id);
            }
        });
        static::creating(function ($model) {
            $model->school_id = auth()->user()->school_id;
        });
    }
}
```

---

## BACKEND: LARAVEL 11

### Setup Commands
```bash
composer create-project laravel/laravel Feham-Backend
cd Feham-Backend
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require spatie/laravel-permission
composer require intervention/image
php artisan install:api
```

### Folder Structure
```
Feham-Backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── OnboardingController.php
│   │   │   ├── Admin/
│   │   │   │   ├── SchoolController.php
│   │   │   │   ├── TeacherController.php
│   │   │   │   ├── StudentController.php
│   │   │   │   ├── ClassController.php
│   │   │   │   ├── SectionController.php
│   │   │   │   ├── PeriodController.php
│   │   │   │   ├── TimetableController.php
│   │   │   │   ├── FeeController.php
│   │   │   │   ├── ChallanController.php
│   │   │   │   └── SalaryController.php
│   │   │   ├── Teacher/
│   │   │   │   ├── TeacherDashboardController.php
│   │   │   │   ├── HomeworkController.php
│   │   │   │   └── RemarkController.php
│   │   │   └── Parent/
│   │   │       └── ParentPortalController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureTenantContext.php
│   │   │   └── RoleMiddleware.php
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── TeacherResource.php
│   │       ├── StudentResource.php
│   │       ├── ClassResource.php
│   │       ├── SectionResource.php
│   │       ├── PeriodResource.php
│   │       ├── ChallanResource.php
│   │       └── HomeworkResource.php
│   ├── Models/
│   │   ├── School.php
│   │   ├── User.php
│   │   ├── Teacher.php
│   │   ├── Student.php
│   │   ├── SchoolClass.php
│   │   ├── Section.php
│   │   ├── Period.php
│   │   ├── Timetable.php
│   │   ├── FeeStructure.php
│   │   ├── FeeItem.php
│   │   ├── Challan.php
│   │   ├── SalarySlip.php
│   │   ├── Homework.php
│   │   └── Remark.php
│   ├── Services/
│   │   ├── ChallanService.php
│   │   ├── SalaryService.php
│   │   └── PdfService.php
│   └── Traits/
│       └── BelongsToSchool.php
├── database/migrations/
├── routes/
│   └── api.php
└── resources/views/
    └── pdf/
        ├── challan.blade.php
        └── salary-slip.blade.php
```

### Database Migrations (in order)

**1. schools**
```php
Schema::create('schools', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique(); // subdomain
    $table->string('logo_path')->nullable();
    $table->string('address')->nullable();
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('bank_account')->nullable();
    $table->string('bank_name')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

**2. users**
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['super_admin', 'admin', 'teacher', 'parent']);
    $table->timestamps();
});
```

**3. teachers**
```php
Schema::create('teachers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('employee_code')->nullable();
    $table->string('subject_specialization')->nullable();
    $table->string('phone')->nullable();
    $table->string('cnic')->nullable();
    $table->decimal('base_salary', 10, 2)->default(0);
    $table->date('joining_date')->nullable();
    $table->timestamps();
});
```

**4. school_classes**
```php
Schema::create('school_classes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "Class 1", "Class 10"
    $table->integer('grade_level'); // 1-10
    $table->timestamps();
});
```

**5. sections**
```php
Schema::create('sections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // A, B, C, D
    $table->foreignId('class_teacher_id')->nullable()->constrained('teachers');
    $table->timestamps();
});
```

**6. students**
```php
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->nullable()->constrained(); // parent user
    $table->string('roll_number')->unique();
    $table->string('name');
    $table->string('guardian_name');
    $table->string('guardian_phone');
    $table->string('guardian_cnic')->nullable();
    $table->date('date_of_birth')->nullable();
    $table->string('gender')->nullable();
    $table->string('address')->nullable();
    $table->timestamps();
});
```

**7. periods**
```php
Schema::create('periods', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "Period 1"
    $table->time('start_time');
    $table->time('end_time');
    $table->integer('order_index');
    $table->timestamps();
});
```

**8. timetables**
```php
Schema::create('timetables', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->foreignId('period_id')->constrained()->cascadeOnDelete();
    $table->string('subject');
    $table->enum('day', ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']);
    $table->timestamps();
});
```

**9. fee_structures**
```php
Schema::create('fee_structures', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('school_class_id')->nullable()->constrained(); // null = all classes
    $table->string('name'); // e.g. "Standard Monthly Fee"
    $table->timestamps();
});
```

**10. fee_items**
```php
Schema::create('fee_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('fee_structure_id')->constrained()->cascadeOnDelete();
    $table->string('label'); // e.g. "Tuition Fee", "Transport", "Lab Fee"
    $table->decimal('amount', 10, 2);
    $table->boolean('is_optional')->default(false);
    $table->timestamps();
});
```

**11. challans**
```php
Schema::create('challans', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->string('challan_number')->unique();
    $table->string('month'); // e.g. "2025-01"
    $table->decimal('total_amount', 10, 2);
    $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
    $table->date('due_date');
    $table->date('paid_date')->nullable();
    $table->string('payment_method')->nullable(); // 'online', 'bank'
    $table->json('fee_items_snapshot'); // store fee breakdown at time of generation
    $table->timestamps();
});
```

**12. salary_slips**
```php
Schema::create('salary_slips', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->string('month'); // e.g. "2025-01"
    $table->decimal('base_salary', 10, 2);
    $table->decimal('allowances', 10, 2)->default(0);
    $table->decimal('deductions', 10, 2)->default(0);
    $table->decimal('net_salary', 10, 2);
    $table->enum('status', ['draft', 'issued'])->default('draft');
    $table->json('breakdown')->nullable();
    $table->timestamps();
});
```

**13. homeworks**
```php
Schema::create('homeworks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->string('subject');
    $table->text('description');
    $table->date('due_date');
    $table->timestamps();
});
```

**14. remarks**
```php
Schema::create('remarks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('school_id')->constrained()->cascadeOnDelete();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->text('message');
    $table->boolean('is_read')->default(false);
    $table->timestamps();
});
```

### API Routes (`routes/api.php`)

```php
// Public
Route::post('/auth/register-school', [OnboardingController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [SchoolController::class, 'dashboard']);
        Route::post('/school/logo', [SchoolController::class, 'uploadLogo']);
        Route::put('/school', [SchoolController::class, 'update']);

        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('classes', ClassController::class);
        Route::apiResource('sections', SectionController::class);
        Route::apiResource('periods', PeriodController::class);
        Route::apiResource('timetables', TimetableController::class);
        Route::apiResource('students', StudentController::class);

        Route::apiResource('fee-structures', FeeController::class);
        Route::post('/challans/generate', [ChallanController::class, 'generate']);
        Route::get('/challans', [ChallanController::class, 'index']);
        Route::get('/challans/{id}/pdf', [ChallanController::class, 'downloadPdf']);
        Route::put('/challans/{id}/mark-paid', [ChallanController::class, 'markPaid']);

        Route::post('/salary-slips/generate', [SalaryController::class, 'generate']);
        Route::get('/salary-slips', [SalaryController::class, 'index']);
        Route::get('/salary-slips/{id}/pdf', [SalaryController::class, 'downloadPdf']);
    });

    // Teacher routes
    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::get('/schedule', [TeacherDashboardController::class, 'schedule']);
        Route::apiResource('homework', HomeworkController::class);
        Route::apiResource('remarks', RemarkController::class);
    });

    // Parent routes
    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/children', [ParentPortalController::class, 'children']);
        Route::get('/children/{studentId}/challans', [ParentPortalController::class, 'challans']);
        Route::get('/children/{studentId}/homework', [ParentPortalController::class, 'homework']);
        Route::get('/children/{studentId}/remarks', [ParentPortalController::class, 'remarks']);
        Route::put('/remarks/{id}/read', [ParentPortalController::class, 'markRemarkRead']);
    });
});
```

### ChallanService
```php
class ChallanService {
    public function generateForMonth(string $month, ?int $classId = null): void {
        $students = Student::with('section.schoolClass')
            ->when($classId, fn($q) => $q->whereHas('section', fn($q2) => $q2->where('school_class_id', $classId)))
            ->get();

        foreach ($students as $student) {
            $feeStructure = FeeStructure::where(function($q) use ($student) {
                $q->where('school_class_id', $student->section->school_class_id)
                  ->orWhereNull('school_class_id');
            })->with('items')->first();

            if (!$feeStructure) continue;

            $items = $feeStructure->items;
            $total = $items->sum('amount');

            Challan::create([
                'student_id' => $student->id,
                'challan_number' => 'CH-' . strtoupper(uniqid()),
                'month' => $month,
                'total_amount' => $total,
                'due_date' => now()->endOfMonth(),
                'fee_items_snapshot' => $items->toArray(),
            ]);
        }
    }
}
```

### PDF Views (`resources/views/pdf/challan.blade.php`)
The challan PDF must include:
- School logo + school name at top
- Student name, roll number, class, section
- Month label
- Table: Fee Item | Amount
- Total row (bold)
- Bank account details for payment
- A unique challan number and due date
- Footer: "Pay at bank or online via Feham portal"

Style it cleanly with inline CSS. Respect A4 dimensions.

---

## FRONTEND: NEXT.JS 14

### Setup Commands
```bash
npx create-next-app@latest Feham-Frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd Feham-Frontend
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label badge dialog sheet table tabs select avatar dropdown-menu toast separator skeleton
npm install lucide-react axios @tanstack/react-query zustand next-themes clsx tailwind-merge date-fns
```

### Folder Structure
```
Feham-Frontend/src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              ← Landing page
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   └── layout.tsx            ← Marketing layout (navbar + footer)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx     ← Multi-step school onboarding
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← Dashboard shell (sidebar + topbar)
│   │   ├── admin/
│   │   │   ├── page.tsx          ← Admin dashboard
│   │   │   ├── school/page.tsx
│   │   │   ├── teachers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── classes/page.tsx
│   │   │   ├── sections/page.tsx
│   │   │   ├── timetable/page.tsx
│   │   │   ├── students/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── fees/page.tsx
│   │   │   ├── challans/page.tsx
│   │   │   └── salaries/page.tsx
│   │   ├── teacher/
│   │   │   ├── page.tsx          ← Teacher dashboard
│   │   │   ├── schedule/page.tsx
│   │   │   ├── homework/page.tsx
│   │   │   └── remarks/page.tsx
│   │   └── parent/
│   │       ├── page.tsx          ← Parent portal
│   │       ├── challans/page.tsx
│   │       ├── homework/page.tsx
│   │       └── remarks/page.tsx
├── components/
│   ├── ui/                       ← shadcn components (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MarketingNav.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   └── EmptyState.tsx
│   ├── forms/
│   │   ├── TeacherForm.tsx
│   │   ├── StudentForm.tsx
│   │   ├── ClassForm.tsx
│   │   ├── SectionForm.tsx
│   │   ├── PeriodForm.tsx
│   │   ├── FeeStructureForm.tsx
│   │   └── HomeworkForm.tsx
│   ├── marketing/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PricingSection.tsx
│   │   └── TestimonialsSection.tsx
│   └── onboarding/
│       └── MultiStepForm.tsx
├── lib/
│   ├── api.ts                    ← Axios instance
│   ├── queryClient.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTeachers.ts
│   ├── useStudents.ts
│   └── useChallans.ts
├── store/
│   └── authStore.ts              ← Zustand auth store
└── types/
    └── index.ts                  ← All TypeScript interfaces
```

---

## KEY PAGES — DETAILED SPECS

### 1. Marketing Landing Page (`/`)

Build a world-class SaaS marketing page with these sections:

**Hero Section:**
- Headline: `"Manage Your School. Effortlessly."` in 56px bold Inter
- Sub-headline (18px, neutral-600): `"Feham is the all-in-one school management platform built for Pakistani private schools — from fee challans to timetables, all in one place."`
- Two CTAs: `"Get Started Free"` (primary button) and `"See How It Works"` (ghost button)
- Hero image/mockup: A browser frame showing the admin dashboard (use a styled div to represent it)
- Background: clean white with a subtle indigo dot-grid pattern

**Features Section:**
- 6 feature cards in a 3-col grid:
  1. 🧾 Fee Challan Generation — "Auto-generate monthly challans with PDF download and bank slip format"
  2. 📅 Smart Timetable — "Design periods, assign teachers, visualise weekly schedules"
  3. 👩‍🏫 Teacher Portal — "Teachers see their schedule, post homework, and send remarks to parents"
  4. 👨‍👩‍👧 Parent Portal — "Parents view challans, homework, and teacher remarks in real-time"
  5. 💰 Salary Management — "Generate salary slips for teachers with allowance and deduction breakdown"
  6. 🏫 Multi-School SaaS — "Each school gets their own isolated environment with custom branding"

**How It Works Section:**
- 4-step horizontal timeline: Register School → Configure Classes → Add Students & Teachers → Everything Runs

**Pricing Section:**
- 3 pricing tiers: Starter (free, up to 100 students), Growth (PKR 2,500/month, up to 500 students), Pro (PKR 6,000/month, unlimited)

**CTA Banner:** "Ready to modernise your school?" with a `"Start Free Trial"` button

**Footer:** Logo, links, copyright

### 2. School Registration (`/register`) — Multi-Step Form

**Step 1 — School Info:**
- School name (required)
- School address
- City (dropdown: Lahore, Karachi, Islamabad, Peshawar, Quetta, Other)
- School phone number
- School email
- Number of students (range selector)

**Step 2 — Admin Account:**
- Admin full name
- Admin email
- Password + confirm password

**Step 3 — Confirmation:**
- Summary of entered info
- "Launch Your School" button
- On success: redirect to `/admin` with a welcome toast

Style: Card-based stepper with progress dots. Each step fades in with a smooth transition.

### 3. Admin Dashboard (`/admin`)

Top stat cards row:
- Total Students
- Total Teachers
- Challans This Month (paid/total)
- Monthly Revenue

Below: Two columns
- Left: Recent challans table (student, class, amount, status badge, actions)
- Right: Upcoming timetable entries for today

Quick Action buttons: `+ Add Student`, `+ Add Teacher`, `Generate Challans`, `View Timetable`

### 4. Teachers Page (`/admin/teachers`)

Full data table with columns: Name, Employee Code, Subject, Classes Assigned, Salary, Actions (Edit, Delete, View Salary Slip)

Top bar: Search input + `+ Add Teacher` button (opens a slide-over Sheet)

Teacher form fields: Name, Email, Password (auto-sent), Phone, CNIC, Subject Specialization, Base Salary, Joining Date

### 5. Classes & Sections (`/admin/classes`)

Two-panel layout:
- Left panel: List of classes (Class 1 through Class 10) with `+ Add Class` button
- Right panel: When a class is selected, show its sections with `+ Add Section` button
- Each section shows: Section name, Class Teacher assigned, number of students
- Section can be assigned a class teacher from a teacher dropdown

### 6. Timetable Builder (`/admin/timetable`)

A **visual weekly grid** where:
- Rows = Periods (Period 1, Period 2, etc. with time labels)
- Columns = Days (Mon–Sat)
- Cells = Assigned subject + teacher
- User can click any cell to open a modal: select Section, Teacher, Subject for that Period × Day slot
- Color-code by teacher (consistent colour per teacher across the grid)
- Section selector at top to switch between sections

### 7. Students Page (`/admin/students`)

Table: Roll No, Name, Class, Section, Guardian Name, Guardian Phone, Actions

Search by name or roll number. Filter by class and section.

`+ Add Student` opens a form: Name, Roll No (auto-suggest next available), Guardian Name, Guardian Phone, Class, Section, Date of Birth, Gender, Address.

### 8. Fee Management (`/admin/fees`)

Two tabs:
**Tab 1 — Fee Structures:**
- List of fee structures with their associated class
- Each structure has a list of fee items (label + amount)
- `+ Add Structure` button → form: Name, applicable class (or All Classes), then dynamic fee items table where admin can add/remove rows (label + amount)

**Tab 2 — Challans:**
- Filter: Month picker, Class filter, Status filter (All / Pending / Paid / Overdue)
- Table: Challan No, Student, Class, Month, Amount, Status badge, Due Date, Actions (Download PDF, Mark Paid)
- Top: `Generate Challans` button → modal to select month + class filter → confirm → backend generates challans for all students

### 9. Salary Slips (`/admin/salaries`)

Table: Teacher name, Month, Base Salary, Allowances, Deductions, Net Salary, Status, Actions (Download PDF)

`+ Generate Salaries` button → select month → auto-generates for all teachers using base salary

Each row expandable to show breakdown.

### 10. Teacher Dashboard (`/teacher`)

**Today's Schedule card** (prominent, top of page):
- Shows upcoming lectures for today in chronological order
- Each entry: Time slot, Subject, Class-Section (e.g. "1-A"), Room
- Current/next period highlighted with a pulsing green dot indicator
- "No more lectures today" state when done

**Homework Section:**
- List of posted homeworks by the teacher with subject, class, due date
- `+ Post Homework` button → form: Section, Subject, Description (textarea), Due Date

**Recent Remarks Sent:**
- List of remarks sent to parents with student name, date, message preview

### 11. Teacher Remarks (`/teacher/remarks`)

`+ Send Remark` button → form: Select Student (searchable), Message (textarea)

List of all sent remarks: Student name, Date, Message, Read status badge (Read/Unread)

### 12. Parent Portal (`/parent`)

After login (parents log in with credentials set by admin when adding student):

**My Children tab** (if multiple children): Switch between children

**For selected child:**
- Class & Section info card
- **Challans tab:** Table of monthly challans — Month, Amount, Status, Due Date, Download PDF button
- **Homework tab:** List of homework by subject — Subject, Description, Due Date (grouped by week)
- **Remarks tab:** Remarks from teachers — Teacher name, Date, Message — with unread dot indicator

---

## GLOBAL COMPONENTS

### Sidebar (`components/layout/Sidebar.tsx`)

Collapsible sidebar. Width: 240px expanded, 64px collapsed. Smooth CSS transition.

**Admin nav items:**
- Dashboard (Home icon)
- School Settings (Settings icon)
- Teachers (Users icon)
- Classes & Sections (Layers icon)
- Timetable (Calendar icon)
- Students (GraduationCap icon)
- Fee Management (Receipt icon)
- Salaries (Wallet icon)

**Teacher nav items:**
- Dashboard
- My Schedule
- Homework
- Remarks

**Parent nav items:**
- My Children
- Fee Challans
- Homework
- Remarks

All nav items: icon + label, active state with indigo background + white text, hover state with neutral-100 background.

School logo + name at sidebar top. User avatar + role badge at sidebar bottom with logout button.

### Topbar (`components/layout/Topbar.tsx`)

- Breadcrumb navigation (dynamic based on current route)
- Notification bell (unread count badge)
- User dropdown (Profile, Settings, Logout)

### StatCard (`components/dashboard/StatCard.tsx`)
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;      // e.g. "+12% from last month"
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}
```

### DataTable (`components/dashboard/DataTable.tsx`)
A reusable table component with:
- Typed columns config
- Built-in search (client-side)
- Pagination (10 rows default)
- Loading skeleton state
- Empty state with icon

---

## STATE MANAGEMENT & DATA FETCHING

### Auth Store (Zustand)
```ts
interface AuthStore {
  user: User | null;
  token: string | null;
  school: School | null;
  setAuth: (user: User, token: string, school: School) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}
```
Persist to localStorage. On app mount, rehydrate and verify token with `/auth/me`.

### API Client (`lib/api.ts`)
```ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### React Query
Wrap the app in `QueryClientProvider`. Use `useQuery` for all GET requests, `useMutation` for POST/PUT/DELETE. Invalidate relevant queries on mutation success.

```ts
// Example hook
export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## PERFORMANCE & CODE QUALITY

1. **Next.js Optimizations:**
   - Use `next/image` for all images
   - Use `next/font` for Inter font (zero layout shift)
   - Route-level code splitting is automatic with App Router
   - Use React Suspense boundaries around every dashboard page with Skeleton fallbacks

2. **Laravel Optimizations:**
   - Eager load relationships: `Teacher::with('user', 'sections.schoolClass')`
   - Use `select()` to only fetch needed columns
   - Index all foreign keys and frequently queried columns (`school_id`, `month`, `status`)
   - Cache school settings: `Cache::remember("school:{$id}", 3600, fn() => School::find($id))`
   - Use API Resources for consistent, lean JSON responses

3. **Code Quality:**
   - TypeScript strict mode enabled (`"strict": true` in tsconfig)
   - ESLint + Prettier configured
   - Laravel Pint for PHP formatting
   - All controllers thin — business logic in Services
   - All forms validated on both frontend (zod) and backend (Laravel FormRequest classes)
   - Create a `FormRequest` class for every POST/PUT endpoint

4. **Environment:**
   - `.env.example` files for both frontend and backend with all required variables documented
   - Frontend `.env.local` needs: `NEXT_PUBLIC_API_URL`
   - Backend `.env` needs: `DB_*`, `REDIS_*`, `AWS_*` (for storage), `APP_URL`, `FRONTEND_URL`

---

## CORS CONFIGURATION (Laravel)

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

---

## SEEDERS

Create seeders to generate realistic demo data:

**DemoSchoolSeeder:**
1. Create a school: "Beacon Light Academy"
2. Create admin user (email: `admin@beacon.test`, password: `password`)
3. Create 5 teachers
4. Create classes 1-10, each with sections A and B
5. Create 20 students across different classes
6. Create a fee structure with 3 items (Tuition: 3500, Transport: 800, Lab: 200)
7. Generate challans for current month
8. Create a timetable for Class 5-A (6 periods, Mon-Fri)
9. Create 3 homework entries and 5 remarks

---

## ADDITIONAL IMPLEMENTATION NOTES

1. **Challan PDF** must be printable and clean. Use a table layout with school header, challan number in large text, and a perforated-looking cut line in the middle (student copy / bank copy).

2. **Timetable grid** — use CSS Grid, not a table. Each cell is `grid-column` × `grid-row`. Clicking a cell opens a Dialog with the assignment form.

3. **Role-based routing** in Next.js: Middleware at `middleware.ts` checks the role from auth store and redirects to the correct dashboard (`/admin`, `/teacher`, `/parent`).

4. **Toast notifications** for all actions — use shadcn's `Sonner` or `useToast`. Success, error, and loading states for every mutation.

5. **Responsive:** Dashboard is fully usable on tablets (768px+). Marketing page is fully responsive down to 375px mobile.

6. **Dark mode ready:** Use `next-themes` with `ThemeProvider`. All Tailwind colors must have dark variants defined.

7. The sidebar **school logo** supports uploading: admin can click the logo area to upload a new image. This hits `POST /admin/school/logo` which stores the file and returns the URL.

8. **Notifications** for teachers: When admin assigns a new timetable entry, the teacher gets a notification record. Show unread count on the bell icon in topbar.

---

## GETTING STARTED SEQUENCE

After creating both projects:

**Backend:**
```bash
cd Feham-Backend
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DemoSchoolSeeder
php artisan serve --port=8000
```

**Frontend:**
```bash
cd Feham-Frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Demo login: `admin@beacon.test` / `password`

---

*Build Feham to feel like the most professional school software Pakistani schools have ever used. Every interaction should be fast, intuitive, and beautiful.*