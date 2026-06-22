import { WeeklySchedule, User, Appointment, AppNotification } from './types';

// Let's seed default schedules for the director
export const defaultSchedules: WeeklySchedule[] = [
  { id: '1', dayOfWeek: 0, startTime: '09:00', endTime: '10:00', maxCapacity: 2, isActive: true },
  { id: '2', dayOfWeek: 0, startTime: '10:30', endTime: '11:30', maxCapacity: 2, isActive: true },
  { id: '3', dayOfWeek: 0, startTime: '12:00', endTime: '13:00', maxCapacity: 3, isActive: true },
  
  { id: '4', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxCapacity: 2, isActive: true },
  { id: '5', dayOfWeek: 1, startTime: '10:30', endTime: '11:30', maxCapacity: 2, isActive: true },
  { id: '6', dayOfWeek: 1, startTime: '13:00', endTime: '14:00', maxCapacity: 4, isActive: true },

  { id: '7', dayOfWeek: 2, startTime: '09:30', endTime: '10:30', maxCapacity: 2, isActive: true },
  { id: '8', dayOfWeek: 2, startTime: '11:00', endTime: '12:00', maxCapacity: 3, isActive: true },
  { id: '9', dayOfWeek: 2, startTime: '12:30', endTime: '13:30', maxCapacity: 2, isActive: true },

  { id: '10', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', maxCapacity: 2, isActive: true },
  { id: '11', dayOfWeek: 3, startTime: '10:30', endTime: '11:30', maxCapacity: 1, isActive: true },
  { id: '12', dayOfWeek: 3, startTime: '12:00', endTime: '13:00', maxCapacity: 3, isActive: true },

  { id: '13', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', maxCapacity: 2, isActive: true },
  { id: '14', dayOfWeek: 4, startTime: '11:00', endTime: '12:00', maxCapacity: 2, isActive: true },
];

export const seedUsers: User[] = [
  {
    id: 'student-1',
    name: 'سلطان بن عبدالرحمن الحربي',
    email: 'sultan.academic@institute.edu.sa',
    phone: '+966501234567',
    role: 'student',
    isVerified: true,
    createdAt: '2026-06-10T08:00:00.000Z'
  },
  {
    id: 'student-2',
    name: 'سارة عبد الله الشمري',
    email: 'sara.student@institute.edu.sa',
    phone: '+966507654321',
    role: 'student',
    isVerified: true,
    createdAt: '2026-06-11T09:15:00.000Z'
  },
  {
    id: 'student-3',
    name: 'أحمد علي السعيد',
    email: 'ahmad.saeed@institute.edu.sa',
    phone: '+966559988776',
    role: 'student',
    isVerified: false,
    verificationCode: '7741',
    createdAt: '2026-06-13T10:30:00.000Z'
  },
  {
    id: 'director-1',
    name: 'أ. د. عبدالمحسن بن صالح آل شيخ',
    email: 'director@institute.edu.sa',
    phone: '+966500000001',
    role: 'director',
    isVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const seedAppointments: Appointment[] = [
  {
    id: 'APT-9831',
    studentId: 'student-1',
    studentName: 'سلطان بن عبدالرحمن الحربي',
    studentEmail: 'sultan.academic@institute.edu.sa',
    studentPhone: '+966501234567',
    reason: 'تقديم طلب مراجعة درجة اختبار مقرر كيمياء فيزيائية والموازنة الأكاديمية للفصل الحالي.',
    date: '2026-06-14',
    timeSlot: '09:00 - 10:00',
    status: 'completed',
    createdAt: '2026-06-11T08:15:00.000Z',
    managerNotes: 'تمت مقابلة الطالب ومراجعة ورقة الامتحان مع منسق القسم، وتمت الموافقة على رصد التعديل وتحديث سجله الأكاديمي.',
    verificationCode: 'verified-direct',
    isEmailConfirmed: true
  },
  {
    id: 'APT-3741',
    studentId: 'student-2',
    studentName: 'سارة عبد الله الشمري',
    studentEmail: 'sara.student@institute.edu.sa',
    studentPhone: '+966507654321',
    reason: 'اعتماد النموذج النهائي لمشروع التخرج البحثي الممول من عمادة البحث العلمي.',
    date: '2026-06-15',
    timeSlot: '10:30 - 11:30',
    status: 'confirmed',
    createdAt: '2026-06-12T11:20:00.000Z',
    verificationCode: 'verified-direct',
    isEmailConfirmed: true
  },
  {
    id: 'APT-5109',
    studentId: 'student-3',
    studentName: 'أحمد علي السعيد',
    studentEmail: 'ahmad.saeed@institute.edu.sa',
    studentPhone: '+966559988776',
    reason: 'طلب مواءمة الساعات الخارجية المعادلة من جامعة الملك سعود لتفادي تأخر التخرج.',
    date: '2026-06-16',
    timeSlot: '09:30 - 10:30',
    status: 'pending_email',
    createdAt: '2026-06-14T04:10:00.000Z',
    verificationCode: '8823',
    isEmailConfirmed: false
  },
  {
    id: 'APT-3921',
    studentId: 'student-1',
    studentName: 'سلطان بن عبدالرحمن الحربي',
    studentEmail: 'sultan.academic@institute.edu.sa',
    studentPhone: '+966501234567',
    reason: 'استلام درع أكاديمي معتمد وخطاب توصية للمتابعة للدراسات العليا.',
    date: '2026-06-17',
    timeSlot: '12:00 - 13:00',
    status: 'confirmed',
    createdAt: '2026-06-14T02:05:00.000Z',
    verificationCode: 'verified-direct',
    isEmailConfirmed: true
  }
];

export const seedNotifications: AppNotification[] = [
  {
    id: 'nt-1',
    type: 'email',
    recipient: 'sultan.academic@institute.edu.sa',
    title: 'تأكيد حجز موعد - مدير المعهد',
    titleAr: 'تأكيد حجز موعد - مدير المعهد',
    content: 'عزيزي سلطان، تم تأكيد موعد دخولك على مدير المعهد بنجاح ليوم الأحد 14 يونيو الساعة 09:00 صباحاً.',
    contentAr: 'عزيزي سلطان، تم تأكيد موعد دخولك على مدير المعهد بنجاح ليوم الأحد 14 يونيو الساعة 09:00 صباحاً.',
    timestamp: '2026-06-11T09:00:00.000Z',
    isUnread: false
  },
  {
    id: 'nt-2',
    type: 'sms',
    recipient: '+966507654321',
    title: 'تنبيه الرسائل النصية',
    titleAr: 'تنبيه الرسائل النصية',
    content: 'مرحباً سارة، تم جدولة موعدك لمقابلة مدير المعهد يوم الاثنين 15 يونيو الساعة 10:30 ص بنجاح.',
    contentAr: 'مرحباً سارة، تم جدولة موعدك لمقابلة مدير المعهد يوم الاثنين 15 يونيو الساعة 10:30 ص بنجاح.',
    timestamp: '2026-06-12T11:21:00.000Z',
    isUnread: false
  },
  {
    id: 'nt-3',
    type: 'app',
    recipient: 'director@institute.edu.sa',
    title: 'طلب موعد جديد معلق بالتأكيد البريدي',
    titleAr: 'طلب موعد جديد معلق بالتأكيد البريدي',
    content: 'قام الطالب أحمد علي السعيد بتقديم طلب مقابلة ليوم الثلاثاء 16 يونيو الساعة 09:30 ص.',
    contentAr: 'قام الطالب أحمد علي السعيد بتقديم طلب مقابلة ليوم الثلاثاء 16 يونيو الساعة 09:30 ص.',
    timestamp: '2026-06-14T04:10:00.000Z',
    isUnread: true
  }
];
