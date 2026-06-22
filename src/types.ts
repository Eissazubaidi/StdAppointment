export type Lang = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type UserRole = 'student' | 'director';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  verificationCode?: string;
  createdAt: string;
}

export type AppointmentStatus = 'pending_email' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  reason: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "09:00 - 10:00"
  status: AppointmentStatus;
  createdAt: string;
  managerNotes?: string;
  verificationCode: string;
  isEmailConfirmed: boolean;
}

export interface WeeklySchedule {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 4 = Thursday (standard institute weekends are Fri/Sat in many Arabic countries)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  maxCapacity: number;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  type: 'email' | 'sms' | 'app';
  recipient: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  timestamp: string;
  isUnread: boolean;
}

export interface TranslationDict {
  bookingTitle: string;
  directorDashboard: string;
  studentPortal: string;
  home: string;
}
