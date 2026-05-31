<?php

namespace Database\Seeders;

use App\Models\Challan;
use App\Models\FeeItem;
use App\Models\FeeStructure;
use App\Models\Homework;
use App\Models\Period;
use App\Models\Remark;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use App\Services\ChallanService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::create([
            'name' => 'Beacon Light Academy',
            'slug' => 'beacon-light',
            'address' => 'Main Boulevard, Lahore',
            'phone' => '+92-300-1234567',
            'email' => 'info@beacon.test',
            'bank_account' => '12345678901234',
            'bank_name' => 'HBL',
        ]);

        $admin = User::create([
            'school_id' => $school->id,
            'name' => 'Admin User',
            'email' => 'admin@beacon.test',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $teachers = [];
        $subjects = ['Mathematics', 'English', 'Science', 'Urdu', 'Islamiat'];
        foreach (range(1, 5) as $i) {
            $user = User::create([
                'school_id' => $school->id,
                'name' => "Teacher {$i}",
                'email' => "teacher{$i}@beacon.test",
                'password' => 'password',
                'role' => 'teacher',
            ]);
            $teachers[] = Teacher::create([
                'school_id' => $school->id,
                'user_id' => $user->id,
                'employee_code' => 'T'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'subject_specialization' => $subjects[$i - 1],
                'base_salary' => 45000 + ($i * 2000),
                'joining_date' => now()->subYears(2),
            ]);
        }

        $classes = [];
        foreach (range(1, 10) as $grade) {
            $classes[$grade] = SchoolClass::create([
                'school_id' => $school->id,
                'name' => "Class {$grade}",
                'grade_level' => $grade,
            ]);
        }

        $sections = [];
        foreach ($classes as $grade => $class) {
            foreach (['A', 'B'] as $secName) {
                $sections["{$grade}-{$secName}"] = Section::create([
                    'school_id' => $school->id,
                    'school_class_id' => $class->id,
                    'name' => $secName,
                    'class_teacher_id' => $teachers[array_rand($teachers)]->id,
                ]);
            }
        }

        $section5A = $sections['5-A'];
        $roll = 1;
        foreach (array_slice(array_keys($sections), 0, 10) as $key) {
            $section = $sections[$key];
            for ($j = 0; $j < 2; $j++) {
                Student::create([
                    'school_id' => $school->id,
                    'section_id' => $section->id,
                    'roll_number' => 'BLA-'.str_pad((string) $roll++, 4, '0', STR_PAD_LEFT),
                    'name' => \fake()->name(),
                    'guardian_name' => \fake()->name(),
                    'guardian_phone' => '+92-3'.rand(10, 99).rand(1000000, 9999999),
                    'date_of_birth' => now()->subYears(rand(6, 15)),
                    'gender' => rand(0, 1) ? 'male' : 'female',
                ]);
            }
        }

        $demoParent = User::create([
            'school_id' => $school->id,
            'name' => 'Karson Johnston',
            'email' => 'parent.bla0001@beacon.test',
            'password' => 'password',
            'role' => 'parent',
        ]);

        Student::where('school_id', $school->id)
            ->where('roll_number', 'BLA-0001')
            ->update([
                'user_id' => $demoParent->id,
                'guardian_name' => 'Karson Johnston',
                'guardian_phone' => '+92-3825156601',
            ]);

        $periods = [];
        $times = [
            ['08:00', '08:45'],
            ['08:45', '09:30'],
            ['09:45', '10:30'],
            ['10:30', '11:15'],
            ['11:30', '12:15'],
            ['12:15', '13:00'],
        ];
        foreach ($times as $idx => [$start, $end]) {
            $periods[] = Period::create([
                'school_id' => $school->id,
                'name' => 'Period '.($idx + 1),
                'start_time' => $start,
                'end_time' => $end,
                'order_index' => $idx,
            ]);
        }

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        foreach ($days as $dayIdx => $day) {
            Timetable::create([
                'school_id' => $school->id,
                'section_id' => $section5A->id,
                'teacher_id' => $teachers[$dayIdx % count($teachers)]->id,
                'period_id' => $periods[$dayIdx % count($periods)]->id,
                'subject' => $subjects[$dayIdx % count($subjects)],
                'day' => $day,
            ]);
        }

        foreach ($teachers as $idx => $teacher) {
            Homework::create([
                'school_id' => $school->id,
                'teacher_id' => $teacher->id,
                'section_id' => $section5A->id,
                'subject' => $subjects[$idx % count($subjects)],
                'description' => 'Review chapter '.($idx + 1).' and complete practice questions.',
                'due_date' => now()->addDays($idx + 1),
            ]);
        }

        $feeStructure = FeeStructure::create([
            'school_id' => $school->id,
            'name' => 'Standard Monthly Fee',
            'school_class_id' => null,
        ]);
        foreach ([['Tuition Fee', 3500], ['Transport', 800], ['Lab Fee', 200]] as [$label, $amount]) {
            FeeItem::create([
                'fee_structure_id' => $feeStructure->id,
                'label' => $label,
                'amount' => $amount,
            ]);
        }

        auth()->login($admin);
        app(ChallanService::class)->generateForMonth(now()->format('Y-m'));

        $students = Student::where('section_id', $section5A->id)->get();
        foreach ($teachers as $idx => $teacher) {
            $student = $students[$idx % max(1, $students->count())] ?? $students->first();
            if ($student) {
                Remark::create([
                    'school_id' => $school->id,
                    'teacher_id' => $teacher->id,
                    'student_id' => $student->id,
                    'message' => 'Please ensure regular attendance and homework completion.',
                    'is_read' => $idx % 2 === 0,
                ]);
            }
        }

        $this->command?->info('Demo school seeded. Login: admin@beacon.test / password');
    }
}
