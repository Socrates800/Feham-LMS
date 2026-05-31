export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent';

export interface School {
  id: number;
  name: string;
  slug: string;
  logo_path?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  bank_account?: string | null;
  bank_name?: string | null;
  is_active?: boolean;
  plan?: string;
  billing_status?: string;
  subscription_ends_at?: string | null;
  student_limit?: number | null;
  notes?: string | null;
  created_at?: string;
  students_count?: number;
  teachers_count?: number;
  admins_count?: number;
  primary_admin?: { id: number; name: string; email: string } | null;
}

export interface User {
  id: number;
  school_id: number | null;
  name: string;
  email: string;
  role: UserRole;
}

export interface PlatformStats {
  total_schools: number;
  active_schools: number;
  inactive_schools: number;
  total_students: number;
  total_teachers: number;
  total_users: number;
  monthly_revenue: number;
  trial_schools: number;
  paid_schools: number;
}

export interface PlatformDashboardData {
  stats: PlatformStats;
  billing_summary: Record<string, number>;
  recent_schools: School[];
}

export interface PlatformReportsData {
  top_schools_by_students: School[];
  top_schools_by_revenue: Array<{ school_id: number; school_name: string; revenue: number }>;
  plans_breakdown: Record<string, number>;
}

export interface SectionOption {
  id: number;
  name: string;
  school_class_id: number;
  school_class?: { id: number; name: string };
}

export interface SectionDetail {
  id: number;
  name: string;
  school_class_id: number;
  class_teacher_id?: number | null;
  class_teacher?: { id: number; user?: { name: string } } | null;
  students_count?: number;
  students?: Array<{
    id: number;
    roll_number: string;
    name: string;
    guardian_name: string;
    guardian_phone: string;
  }>;
}

export interface SchoolClassItem {
  id: number;
  name: string;
  grade_level: number;
  sections?: SectionDetail[];
}

export interface Teacher {
  id: number;
  employee_code?: string;
  subject_specialization?: string;
  phone?: string;
  cnic?: string;
  base_salary?: number;
  joining_date?: string;
  user?: { id: number; name: string; email: string };
  assigned_sections?: Array<{
    id: number;
    name: string;
    school_class?: { id: number; name: string };
  }>;
}

export interface Student {
  id: number;
  section_id?: number;
  roll_number: string;
  name: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_cnic?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | string | null;
  address?: string | null;
  challans_count?: number;
  parent_user?: { id: number; name: string; email: string } | null;
  section?: {
    id: number;
    name: string;
    school_class?: { id: number; name: string };
  };
}

export interface Challan {
  id: number;
  challan_number: string;
  month: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  paid_date?: string | null;
  payment_method?: string | null;
  fee_items_snapshot?: Array<{ label: string; amount: number | string; is_optional?: boolean }>;
  student?: Student;
}

export interface FeeItem {
  id?: number;
  label: string;
  amount: number | string;
  is_optional?: boolean;
}

export interface FeeStructure {
  id: number;
  name: string;
  school_class_id?: number | null;
  school_class?: { id: number; name: string } | null;
  items?: FeeItem[];
}

export interface SalarySlip {
  id: number;
  teacher_id: number;
  month: string;
  base_salary: number | string;
  allowances: number | string;
  deductions: number | string;
  net_salary: number | string;
  status: 'draft' | 'issued' | string;
  breakdown?: {
    base?: number | string;
    allowances?: number | string;
    manual_deductions?: number | string;
    unpaid_leave_days?: number;
    unpaid_leave_deduction?: number | string;
    per_day_salary?: number | string;
    deductions?: number | string;
    payroll_note?: string | null;
  } | null;
  teacher?: Teacher;
}

export interface Period {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  order_index: number;
}

export interface TimetableEntry {
  id: number;
  section_id: number;
  teacher_id: number;
  period_id: number;
  subject: string;
  day: string;
  period?: Period;
  teacher?: { id: number; user?: { name: string } };
  section?: { id: number; name: string; school_class?: { id: number; name: string } };
}

export interface StructureTree {
  school: { id: number; name: string };
  summary: {
    classes: number;
    sections: number;
    students: number;
    teachers: number;
    timetable_slots: number;
  };
  classes: Array<{
    id: number;
    name: string;
    grade_level: number;
    sections: Array<{
      id: number;
      name: string;
      class_teacher: string | null;
      students_count: number;
      students: Array<{ id: number; roll_number: string; name: string }>;
      timetable: Array<{
        id: number;
        day: string;
        subject: string;
        period: string | null;
        time: string | null;
        teacher: string | null;
      }>;
    }>;
  }>;
  teachers: Array<{
    id: number;
    name: string | null;
    subject_specialization?: string;
    sections: Array<{ id: number; name: string; class: string | null }>;
  }>;
  periods: Period[];
}

export interface DashboardStats {
  students: number;
  teachers: number;
  challans_paid: number;
  challans_total: number;
  monthly_revenue: number;
}

export interface TeacherStats {
  today_periods: number;
  weekly_periods: number;
  assigned_sections: number;
  students: number;
  homework_total: number;
  homework_upcoming: number;
  remarks_total: number;
  remarks_unread: number;
}

export interface TeacherHomework {
  id: number;
  subject: string;
  description: string;
  due_date: string;
  section?: {
    id: number;
    name: string;
    school_class?: { name: string } | null;
  };
}

export interface TeacherRemark {
  id: number;
  student_id: number;
  message: string;
  is_read: boolean;
  created_at?: string;
  student?: Student;
}

export interface ParentRemark {
  id: number;
  student_id: number;
  message: string;
  is_read: boolean;
  created_at?: string;
  teacher?: { id: number; user?: { name: string } | null } | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface TeacherAttendanceSection {
  id: number;
  name: string;
  label: string;
  school_class?: { id: number; name: string } | null;
}

export interface TeacherAttendanceStudent {
  id: number;
  roll_number: string;
  name: string;
  guardian_name: string;
  section?: {
    id: number;
    name: string;
    school_class?: { id: number; name: string } | null;
  } | null;
  attendance?: {
    id: number;
    status: AttendanceStatus;
    remarks?: string | null;
  } | null;
}

export interface TeacherAttendanceResponse {
  sections: TeacherAttendanceSection[];
  selected_section_id: number | null;
  date: string;
  students: TeacherAttendanceStudent[];
}

export type TeacherLeaveType = 'casual' | 'sick' | 'emergency' | 'unpaid' | 'other';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TeacherLeaveRequest {
  id: number;
  teacher_id: number;
  leave_type: TeacherLeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveRequestStatus;
  admin_note?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  teacher?: Teacher;
  reviewer?: { id: number; name: string; email: string } | null;
}

export interface TeacherDashboardData {
  stats: TeacherStats;
  schedule: TimetableEntry[];
  homework: TeacherHomework[];
  remarks: TeacherRemark[];
}

export interface TeacherContextSection {
  id: number;
  name: string;
  label: string;
  school_class?: { id: number; name: string } | null;
}

export interface TeacherContextStudent {
  id: number;
  name: string;
  roll_number: string;
  section_id: number;
  label: string;
  section?: {
    id: number;
    name: string;
    school_class?: { name: string } | null;
  };
}

export interface TeacherContext {
  sections: TeacherContextSection[];
  students: TeacherContextStudent[];
  subjects: string[];
}
