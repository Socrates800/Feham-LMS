export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent';

export interface School {
  id: number;
  name: string;
  slug: string;
  logo_path?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface User {
  id: number;
  school_id: number;
  name: string;
  email: string;
  role: UserRole;
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
    deductions?: number | string;
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
