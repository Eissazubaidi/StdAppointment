import React, { useState, useEffect } from 'react';
import { Lang, Theme, User, Appointment, WeeklySchedule, AppNotification, AppointmentStatus, UserRole } from './types';
import { translations } from './translations';
import { defaultSchedules, seedUsers, seedAppointments, seedNotifications } from './data';
import StudentBooking from './components/StudentBooking';
import StudentPortal from './components/StudentPortal';
import DirectorDashboard from './components/DirectorDashboard';
import VirtualNotificationSim from './components/VirtualNotificationSim';
import { Sun, Moon, Languages, GraduationCap, Calendar, Sliders, User as UserIcon, LogOut, CheckCircle, Smartphone, ShieldCheck } from 'lucide-react';
import { 
  loadUsersFromDb, 
  saveUserToDb, 
  updateUserVerificationInDb, 
  loadAppointmentsFromDb, 
  saveAppointmentToDb, 
  updateAppointmentInDb, 
  loadSchedulesFromDb, 
  saveSchedulesToDb, 
  loadNotificationsFromDb, 
  saveNotificationToDb, 
  clearNotificationsInDb 
} from './firebase';
import { 
  googleSignIn, 
  logoutGmail, 
  sendRealGmail, 
  getConnectedGmailEmail, 
  getGmailToken 
} from './gmailService';

export default function App() {
  // 1. Language and Theme States
  const [lang, setLang] = useState<Lang>(() => {
    const cached = localStorage.getItem('inst_lang');
    return (cached as Lang) || 'ar';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const cached = localStorage.getItem('inst_theme');
    if (cached) return cached as Theme;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // State to track connected Gmail configuration
  const [gmailEmail, setGmailEmail] = useState<string | null>(() => getConnectedGmailEmail());

  const handleConnectGmail = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGmailEmail(result.email);
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'ar' 
        ? 'فشل ربطه بـ Gmail. يرجى مراجعة إعدادات متصفحك أو صلاحيات الوصول.' 
        : 'Failed to connect to Gmail. Please review permissions or browser settings.');
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await logoutGmail();
      setGmailEmail(null);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Active Tab Router
  const [activeTab, setActiveTab] = useState<'booking' | 'portal' | 'dashboard'>('booking');

  // 3. User, Appointments, Schedules & Alerts states
  const [userList, setUserList] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('inst_current_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Load from database on startup
  useEffect(() => {
    async function initDbAndState() {
      try {
        console.log("Initializing database connection & loading profiles...");
        
        // 1. Load users
        const dbUsers = await loadUsersFromDb();
        if (dbUsers.length === 0) {
          // Send seed users to DB
          await Promise.all(seedUsers.map(user => saveUserToDb(user)));
          setUserList(seedUsers);
        } else {
          setUserList(dbUsers);
        }

        // 2. Load appointments
        const dbApts = await loadAppointmentsFromDb();
        if (dbApts.length === 0) {
          // Send seed appointments to DB
          await Promise.all(seedAppointments.map(apt => saveAppointmentToDb(apt)));
          setAppointments(seedAppointments);
        } else {
          setAppointments(dbApts);
        }

        // 3. Load schedules
        const dbSchedules = await loadSchedulesFromDb();
        if (dbSchedules.length === 0) {
          // Send seed schedules to DB
          await saveSchedulesToDb(defaultSchedules);
          setWeeklySchedules(defaultSchedules);
        } else {
          setWeeklySchedules(dbSchedules);
        }

        // 4. Load notifications
        const dbNotifs = await loadNotificationsFromDb();
        if (dbNotifs.length === 0) {
          // Send seed notifications to DB
          await Promise.all(seedNotifications.map(n => saveNotificationToDb(n)));
          setNotifications(seedNotifications);
        } else {
          setNotifications(dbNotifs);
        }
      } catch (err) {
        console.error("Failed to sync with Firestore, falling back to local defaults", err);
        // Fallback to cache or defaults
        const cachedUsers = localStorage.getItem('inst_users');
        setUserList(cachedUsers ? JSON.parse(cachedUsers) : seedUsers);
        
        const cachedApts = localStorage.getItem('inst_appointments');
        setAppointments(cachedApts ? JSON.parse(cachedApts) : seedAppointments);
        
        const cachedSchedules = localStorage.getItem('inst_schedules');
        setWeeklySchedules(cachedSchedules ? JSON.parse(cachedSchedules) : defaultSchedules);
        
        const cachedNotifs = localStorage.getItem('inst_notifications');
        setNotifications(cachedNotifs ? JSON.parse(cachedNotifs) : seedNotifications);
      } finally {
        setLoading(false);
      }
    }

    initDbAndState();
  }, []);

  // Keep state synchronized with LocalStorage & Document Root (No theme flash)
  useEffect(() => {
    localStorage.setItem('inst_lang', lang);
    localStorage.setItem('inst_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [lang, theme]);

  // Synchronize dynamic lists to LocalStorage (as cache fallback)
  useEffect(() => {
    if (userList.length > 0) {
      localStorage.setItem('inst_users', JSON.stringify(userList));
    }
  }, [userList]);

  useEffect(() => {
    localStorage.setItem('inst_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('inst_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    if (weeklySchedules.length > 0) {
      localStorage.setItem('inst_schedules', JSON.stringify(weeklySchedules));
    }
  }, [weeklySchedules]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('inst_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Translate helper
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Toggle helpers
  const handleLangToggle = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // State Updates API

  // 1. Student Login
  const handleLogin = (email: string, role: UserRole, password?: string): boolean => {
    const matchedUser = userList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (matchedUser) {
      const storedPassword = matchedUser.password || '123456';
      if (password && storedPassword !== password) {
        return false;
      }
      setCurrentUser(matchedUser);
      // Route instantly
      if (role === 'director') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('booking');
      }
      return true;
    }
    return false;
  };

  // 2. Student Registration
  const handleRegister = (name: string, email: string, phone: string, password?: string) => {
    const checkEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const duplicate = userList.find((u) => u.email.toLowerCase() === checkEmail);
    if (duplicate) {
      setCurrentUser(duplicate);
      return;
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const newUser: User = {
      id: `std-${Date.now()}`,
      name,
      email,
      phone,
      role: 'student',
      isVerified: false,
      verificationCode,
      createdAt: new Date().toISOString(),
      password: password || '123456'
    };

    const updatedList = [...userList, newUser];
    setUserList(updatedList);
    setCurrentUser(newUser);
    saveUserToDb(newUser); // Save user to Firestore

    // Seed visual verification email notification
    const verificationEmail: AppNotification = {
      id: `notif-${Date.now()}-1`,
      type: 'email',
      recipient: email,
      title: 'بوابة المعهد - تفعيل حساب الطالب الأكاديمي',
      titleAr: 'بوابة المعهد - تفعيل حساب الطالب الأكاديمي',
      content: `مرحباً بك يا ${name}. رمز تأكيد حسابك لتأمين المواعيد هو [${verificationCode}]. يرجى الضغط على زر التفعيل لتأكيد هويتك الجامعية.`,
      contentAr: `مرحباً بك يا ${name}. رمز تأكيد حسابك لتأمين المواعيد هو [${verificationCode}]. يرجى الضغط على زر التفعيل لتأكيد هويتك الجامعية.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    // SMS alert to phone
    const verificationSMS: AppNotification = {
      id: `notif-${Date.now()}-2`,
      type: 'sms',
      recipient: phone,
      title: 'رمز تحقق الطالب',
      titleAr: 'رمز تحقق الطالب',
      content: `مرحباً ${name}، بوابتك الأكاديمية لحجز مقابلة المدير تم إنشاؤها بنجاح. رمز تأكيد بريدك الإلكتروني هو (${verificationCode}).`,
      contentAr: `مرحباً ${name}، بوابتك الأكاديمية لحجز مقابلة المدير تم إنشاؤها بنجاح. رمز تأكيد بريدك الإلكتروني هو (${verificationCode}).`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [verificationEmail, verificationSMS, ...prev]);
    saveNotificationToDb(verificationEmail); // Save notification to Firestore
    saveNotificationToDb(verificationSMS); // Save notification to Firestore
    if (getGmailToken()) {
      sendRealGmail(email, verificationEmail.titleAr || verificationEmail.title, verificationEmail.contentAr || verificationEmail.content).catch(err => console.error(err));
    }
  };

  // 3. Confirm Student Email Verification
  const handleVerifyEmail = (emailAddress: string) => {
    const updatedUsers = userList.map((user) => {
      if (user.email.toLowerCase() === emailAddress.toLowerCase()) {
        updateUserVerificationInDb(user.id, true); // Update user verification state in Firestore
        return { ...user, isVerified: true };
      }
      return user;
    });

    setUserList(updatedUsers);

    // Update logged in user if applicable
    if (currentUser && currentUser.email.toLowerCase() === emailAddress.toLowerCase()) {
      setCurrentUser((prev) => (prev ? { ...prev, isVerified: true } : null));
    }

    // Direct notification
    const successEmail: AppNotification = {
      id: `notif-${Date.now()}-ver`,
      type: 'email',
      recipient: emailAddress,
      title: 'تم تفعيل حسابك الأكاديمي',
      titleAr: 'تم تفعيل حسابك الأكاديمي',
      content: 'عزيزي الطالب، تم تأكيد هويتك وتفعيل حسابك بنجاح. يمكنك الآن حجز فترات المقابلة وتلقي جدول المواعيد مباشرة.',
      contentAr: 'عزيزي الطالب، تم تأكيد هويتك وتفعيل حسابك بنجاح. يمكنك الآن حجز فترات المقابلة وتلقي جدول المواعيد مباشرة.',
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [successEmail, ...prev]);
    saveNotificationToDb(successEmail); // Save notification to Firestore
    if (getGmailToken()) {
      sendRealGmail(emailAddress, successEmail.titleAr || successEmail.title, successEmail.contentAr || successEmail.content).catch(err => console.error(err));
    }
  };

  // 4. Student Logs out
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('booking');
  };

  // 5. Booking appointment logic
  const handleBookAppointment = (date: string, timeSlot: string, reason: string) => {
    if (!currentUser) return;

    // Double safeguard check
    const hasExistingBookingOnDay = appointments.some(
      (apt) =>
        apt.studentId === currentUser.id &&
        apt.date === date &&
        apt.status !== 'cancelled'
    );
    if (hasExistingBookingOnDay) return;

    const aptId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newApt: Appointment = {
      id: aptId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone,
      reason,
      date,
      timeSlot,
      status: 'pending_email',
      createdAt: new Date().toISOString(),
      verificationCode,
      isEmailConfirmed: false
    };

    setAppointments((prev) => [newApt, ...prev]);
    saveAppointmentToDb(newApt); // Save appointment to Firestore

    // Send visual Booking confirmation SMTP notification to email
    const bookingEmail: AppNotification = {
      id: `notif-${Date.now()}-apt1`,
      type: 'email',
      recipient: currentUser.email,
      title: 'بوابة المعهد - تأكيد طلب المقابلة المعلق',
      titleAr: 'بوابة المعهد - تأكيد طلب المقابلة المعلق',
      content: `عزيزي ${currentUser.name}، تم استلام طلبك للمقابلة يوم [${date}] لفترة [${timeSlot}]. لتأكيد الموعد وإدراجه رسمياً لمدير المعهد، الرجاء الضغط على تأكيد الموعد أدناه. كود المعاملة: (${aptId})`,
      contentAr: `عزيزي ${currentUser.name}، تم استلام طلبك للمقابلة يوم [${date}] لفترة [${timeSlot}]. لتأكيد الموعد وإدراجه رسمياً لمدير المعهد، الرجاء الضغط على تأكيد الموعد أدناه. كود المعاملة: (${aptId})`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    // SMS notify to phone
    const bookingSMS: AppNotification = {
      id: `notif-${Date.now()}-apt2`,
      type: 'sms',
      recipient: currentUser.phone,
      title: 'طلب حجز مقابلة',
      titleAr: 'طلب حجز مقابلة',
      content: `تم حجز موعد مقابلتك بنجاح برمز (${aptId}) ليوم ${date} الساعة ${timeSlot} وهو بانتظار تفعيلك البريدي لتفادي إلغائه.`,
      contentAr: `تم حجز موعد مقابلتك بنجاح برمز (${aptId}) ليوم ${date} الساعة ${timeSlot} وهو بانتظار تفعيلك البريدي لتفادي إلغائه.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [bookingEmail, bookingSMS, ...prev]);
    saveNotificationToDb(bookingEmail); // Save notification to Firestore
    saveNotificationToDb(bookingSMS); // Save notification to Firestore
    if (getGmailToken()) {
      sendRealGmail(currentUser.email, bookingEmail.titleAr || bookingEmail.title, bookingEmail.contentAr || bookingEmail.content).catch(err => console.error(err));
    }
  };

  // 6. Confirm appointment via email confirmation
  const handleConfirmAppointment = (appointmentId: string) => {
    let studentName = '';
    let studentEmail = '';
    let studentPhone = '';
    let aptDate = '';
    let aptTime = '';

    const updatedApts = appointments.map((apt) => {
      if (apt.id === appointmentId) {
        studentName = apt.studentName;
        studentEmail = apt.studentEmail;
        studentPhone = apt.studentPhone;
        aptDate = apt.date;
        aptTime = apt.timeSlot;

        updateAppointmentInDb(appointmentId, { status: 'confirmed', isEmailConfirmed: true }); // Update state in Firestore

        return {
          ...apt,
          status: 'confirmed' as AppointmentStatus,
          isEmailConfirmed: true
        };
      }
      return apt;
    });

    setAppointments(updatedApts);

    // Direct alerts to student showing confirmation
    const verifiedAlertEmail: AppNotification = {
      id: `notif-${Date.now()}-cv`,
      type: 'email',
      recipient: studentEmail,
      title: 'تم اعتماد موعدك رسمياً مع مدير المعهد',
      titleAr: 'تم اعتماد موعدك رسمياً مع مدير المعهد',
      content: `عزيزي ${studentName}، تم تأكيد وتفعيل موعدك بنجاح ليوم الأسبوع والموعد المحدد ${aptDate} خلال الفترة ${aptTime}. يرجى الحضور بمقر الإدارة قبل الجلسة بـ 10 دقائق.`,
      contentAr: `عزيزي ${studentName}، تم تأكيد وتفعيل موعدك بنجاح ليوم الأسبوع والموعد المحدد ${aptDate} خلال الفترة ${aptTime}. يرجى الحضور بمقر الإدارة قبل الجلسة بـ 10 دقائق.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    const verifiedAlertSMS: AppNotification = {
      id: `notif-${Date.now()}-csms`,
      type: 'sms',
      recipient: studentPhone,
      title: 'تأكيد المقابلة رسمي',
      titleAr: 'تأكيد المقابلة رسمي',
      content: `تم إدراج مقابلتك للمدير ${appointmentId} رسمياً يوم ${aptDate} الساعة ${aptTime}. بانتظار حضورك الأكاديمي.`,
      contentAr: `تم إدراج مقابلتك للمدير ${appointmentId} رسمياً يوم ${aptDate} الساعة ${aptTime}. بانتظار حضورك الأكاديمي.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    // Push alert to the Director's phone
    const directorAlertPush: AppNotification = {
      id: `notif-${Date.now()}-dirp`,
      type: 'app',
      recipient: 'director@institute.edu.sa',
      title: 'موعد مؤكد جديد مجدول',
      titleAr: 'موعد مؤكد جديد مجدول',
      content: `قام الطالب ${studentName} بتأكيد بريده، وتمت جدولة موعده رسمياً ليوم ${aptDate} الساعة ${aptTime} كود: ${appointmentId}.`,
      contentAr: `قام الطالب ${studentName} بتأكيد بريده، وتمت جدولة موعده رسمياً ليوم ${aptDate} الساعة ${aptTime} كود: ${appointmentId}.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [verifiedAlertEmail, verifiedAlertSMS, directorAlertPush, ...prev]);
    saveNotificationToDb(verifiedAlertEmail); // Save notification to Firestore
    saveNotificationToDb(verifiedAlertSMS); // Save notification to Firestore
    saveNotificationToDb(directorAlertPush); // Save notification to Firestore
    if (getGmailToken() && studentEmail) {
      sendRealGmail(studentEmail, verifiedAlertEmail.titleAr || verifiedAlertEmail.title, verifiedAlertEmail.contentAr || verifiedAlertEmail.content).catch(err => console.error(err));
    }
  };

  // 7. Cancel Appointment
  const handleCancelAppointment = (appointmentId: string) => {
    let studentEmail = '';
    const updatedApts = appointments.map((apt) => {
      if (apt.id === appointmentId) {
        studentEmail = apt.studentEmail;
        updateAppointmentInDb(appointmentId, { status: 'cancelled' }); // Update state in Firestore
        return { ...apt, status: 'cancelled' as AppointmentStatus };
      }
      return apt;
    });
    setAppointments(updatedApts);

    const cancelEmail: AppNotification = {
      id: `notif-${Date.now()}-can`,
      type: 'email',
      recipient: studentEmail,
      title: 'تم إلغاء الموعد المجدول',
      titleAr: 'تم إلغاء الموعد المجدول',
      content: `تنبيه: تم إلغاء موعد مقابلتك برمز الأطروحة (${appointmentId}) بناء على رغبتك أو تحديث إدارة المعهد لجدول المدير. يرجى حجز موعد جديد إن دعت الحاجة.`,
      contentAr: `تنبيه: تم إلغاء موعد مقابلتك برمز الأطروحة (${appointmentId}) بناء على رغبتك أو تحديث إدارة المعهد لجدول المدير. يرجى حجز موعد جديد إن دعت الحاجة.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [cancelEmail, ...prev]);
    saveNotificationToDb(cancelEmail); // Save notification to Firestore
    if (getGmailToken() && studentEmail) {
      sendRealGmail(studentEmail, cancelEmail.titleAr || cancelEmail.title, cancelEmail.contentAr || cancelEmail.content).catch(err => console.error(err));
    }
  };

  // 8. Director Updates Appointment (Complete/notes)
  const handleUpdateStatus = (appointmentId: string, status: AppointmentStatus, notes?: string) => {
    let studentEmail = '';
    let studentPhone = '';
    let studentName = '';
    let currentNotes = '';

    const updatedApts = appointments.map((apt) => {
      if (apt.id === appointmentId) {
        studentEmail = apt.studentEmail;
        studentPhone = apt.studentPhone;
        studentName = apt.studentName;
        currentNotes = notes !== undefined ? notes : (apt.managerNotes || '');

        updateAppointmentInDb(appointmentId, { status, managerNotes: currentNotes }); // Update state in Firestore

        return {
          ...apt,
          status,
          managerNotes: notes !== undefined ? notes : apt.managerNotes
        };
      }
      return apt;
    });

    setAppointments(updatedApts);

    // Alert details
    let titleAr = 'تحديث على طلب مقابلتك مع المدير';
    let contentAr = `عزيزي الطالب، قام مدير المعهد بإجراء تحديث لطلب مقابلتك رمز (${appointmentId}). الحالة الحالية: ${t[status]}.`;
    if (notes) {
      contentAr += ` توجيه المدير: "${notes}"`;
    }

    const updateEmail: AppNotification = {
      id: `notif-${Date.now()}-upd`,
      type: 'email',
      recipient: studentEmail,
      title: 'بوابة المعهد - تحديث وتوجيه مقابلتك',
      titleAr: 'بوابة المعهد - تحديث وتوجيه مقابلتك',
      content: contentAr,
      contentAr: contentAr,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    const updateSMS: AppNotification = {
      id: `notif-${Date.now()}-updsms`,
      type: 'sms',
      recipient: studentPhone,
      title: 'إدارة المعهد - تنبيه المقابلة',
      titleAr: 'إدارة المعهد - تنبيه المقابلة',
      content: `تنبيه من المدير: تم تحديث مقابلتك (${appointmentId}) لتكون (${t[status]}). للملاحظات تفقد بريدك الإلكتروني.`,
      contentAr: `تنبيه من المدير: تم تحديث مقابلتك (${appointmentId}) لتكون (${t[status]}). للملاحظات تفقد بريدك الإلكتروني.`,
      timestamp: new Date().toISOString(),
      isUnread: true
    };

    setNotifications((prev) => [updateEmail, updateSMS, ...prev]);
    saveNotificationToDb(updateEmail); // Save notification to Firestore
    saveNotificationToDb(updateSMS); // Save notification to Firestore
    if (getGmailToken() && studentEmail) {
      sendRealGmail(studentEmail, updateEmail.titleAr || updateEmail.title, updateEmail.contentAr || updateEmail.content).catch(err => console.error(err));
    }
  };

  // 9. Director updates Weekly Availability slots
  const handleUpdateSchedules = (updatedSchedules: WeeklySchedule[]) => {
    setWeeklySchedules(updatedSchedules);
    saveSchedulesToDb(updatedSchedules); // Save schedules to Firestore
  };

  // 11. Profile updates for current user (like director name)
  const handleUpdateProfile = (name: string, phone: string, password?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, phone };
    if (password) {
      updatedUser.password = password;
    }
    setCurrentUser(updatedUser);

    // Update in userList state
    setUserList((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );

    // Save to Firestore
    saveUserToDb(updatedUser);
  };

  // 10. Clear simulation notification logs
  const handleClearNotifications = () => {
    clearNotificationsInDb(notifications); // Delete notifications from Firestore
    setNotifications([]);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans font-medium text-sm tracking-tight text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'جاري الاتصال بقاعدة البيانات وحفظ المواعيد...' : 'Connecting to Firestore database...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-800'} transition-colors duration-300`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Visual Navigation Bar */}
      <header className={`sticky top-0 z-40 border-b ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-150'} backdrop-blur-md transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Nav: App Brand logo and label with custom official program branding */}
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all duration-300 overflow-visible p-1" 
                onClick={() => setActiveTab('booking')}
              >
                <svg viewBox="0 0 100 100" className="w-9 h-9 select-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Calendar Arch */}
                  <path 
                    d="M24,51 L24,32 C24,24 76,24 76,32 L76,51" 
                    fill="none" 
                    stroke="#52aba5" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />
                  {/* Binder rings */}
                  <rect x="38" y="11" width="8" height="18" rx="4" fill="#00afea" stroke="#ffffff" strokeWidth="2.5" />
                  <rect x="64" y="11" width="8" height="18" rx="4" fill="#00afea" stroke="#ffffff" strokeWidth="2.5" />

                  {/* Motion bars */}
                  <rect x="20" y="55" width="10" height="5.5" rx="2.75" fill="#00afea" />
                  <rect x="11" y="64" width="18" height="5.5" rx="2.75" fill="#00afea" />
                  <rect x="6" y="73" width="22" height="5.5" rx="2.75" fill="#00afea" />

                  {/* Sand & Hourglass in rotated group */}
                  <g transform="rotate(8, 53, 62)">
                    {/* Top sand */}
                    <path d="M45,49 L61,49 L53,61 Z" fill="#52aba5" />
                    {/* Bottom sand */}
                    <path d="M43,76 C43,76 53,65 63,76 Z" fill="#52aba5" />
                    {/* Hourglass outer track */}
                    <path 
                      d="M42,45 L64,45 L53,62 L64,79 L42,79 L53,62 Z" 
                      fill="none" 
                      stroke="#00afea" 
                      strokeWidth="7.5" 
                      strokeLinejoin="round" 
                      strokeLinecap="round" 
                    />
                  </g>
                </svg>
              </div>
              <div className="space-y-0.5 select-none text-left rtl:text-right">
                <h1 className="text-base font-extrabold tracking-tight leading-none text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="font-black tracking-tight">
                    <span className="text-[#00afea] font-black">{isRtl ? 'بوابة' : 'Inst.'}</span> <span className="text-[#52aba5] font-black tracking-normal">{isRtl ? 'المواعيد' : 'Portal'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-650 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md hidden sm:inline-block">
                    {isRtl ? 'المُعتمد' : 'Official'}
                  </span>
                </h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wide hidden sm:block">
                  {t.appName}
                </p>
              </div>
            </div>

            {/* Middle Nav Links: Sleek pills */}
            <nav className="hidden md:flex space-x-1.5 rtl:space-x-reverse text-xs">
              <button
                onClick={() => setActiveTab('booking')}
                className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'booking'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.navHome}</span>
              </button>

              <button
                onClick={() => setActiveTab('portal')}
                className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'portal'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t.navStudentPortal}</span>
              </button>

              {currentUser?.role === 'director' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.navDirectorDashboard}</span>
                </button>
              )}
            </nav>

            {/* Right Nav Options (User details, dark toggle, language toggle) */}
            <div className="flex items-center gap-1.5">
              
              {/* Language toggler */}
              <button
                onClick={handleLangToggle}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${theme === 'dark' ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 text-slate-650'}`}
              >
                <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              {/* Theme Toggler */}
              <button
                onClick={handleThemeToggle}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className={`p-1.5 rounded-lg border transition ${theme === 'dark' ? 'border-slate-800 bg-slate-900/60 text-yellow-400 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Quick Profile Indicators: Styled precisely as design avatar */}
              {currentUser && (
                <div className="hidden sm:flex items-center gap-3 pr-4 rtl:pr-0 pl-0 rtl:pl-4 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 font-medium">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold leading-none uppercase select-none">
                      {currentUser.role === 'director' ? t.director : t.student}
                    </p>
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-50 truncate max-w-[120px] leading-tight mt-1">
                      {currentUser.name}
                    </p>
                  </div>
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                      {currentUser.name.slice(0, 2).trim().toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-850"></span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title={t.logout}
                    className="p-1 px-2 rounded-lg text-red-500 hover:bg-red-500/10 text-[10px] font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile Route Dropdown triggers */}
              <div className="flex md:hidden items-center">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className={`text-xs p-1.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-250'} text-slate-700 dark:text-slate-300`}
                >
                  <option value="booking">{t.navHome}</option>
                  <option value="portal">{t.navStudentPortal}</option>
                  {currentUser?.role === 'director' && (
                    <option value="dashboard">{t.navDirectorDashboard}</option>
                  )}
                </select>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick warning overlay if director accesses without selecting dashboard */}
        {currentUser?.role === 'director' && activeTab === 'booking' && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-xl flex items-center justify-between">
            <span className="font-bold">
              {isRtl 
                ? 'مرحباً أيها المدير! لقد قمت بتسجيل الدخول بنجاح. انقر هنا للانتقال مباشرة للوحة تحكم المواعيد وإدارة جدولك:' 
                : 'Welcome Director! You are logged in. Tap here to manage the schedules:'}
            </span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-[10px] transition"
            >
              {t.navDirectorDashboard}
            </button>
          </div>
        )}

        {/* Dynamic Route views */}
        {activeTab === 'booking' && (
          <StudentBooking
            lang={lang}
            theme={theme}
            weeklySchedules={weeklySchedules}
            appointments={appointments}
            currentUser={currentUser}
            onBookAppointment={handleBookAppointment}
            onNavigateToPortal={() => setActiveTab('portal')}
          />
        )}

        {activeTab === 'portal' && (
          <StudentPortal
            lang={lang}
            theme={theme}
            currentUser={currentUser}
            appointments={appointments}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            onCancelAppointment={handleCancelAppointment}
            onVerifyEmail={handleVerifyEmail}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'dashboard' && currentUser?.role === 'director' && (
          <DirectorDashboard
            lang={lang}
            theme={theme}
            appointments={appointments}
            weeklySchedules={weeklySchedules}
            onUpdateStatus={handleUpdateStatus}
            onUpdateSchedules={handleUpdateSchedules}
            langCode={lang}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* Real-Time Communication and Verification Simulator Widget */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-850">
          <VirtualNotificationSim
            notifications={notifications}
            appointments={appointments}
            activeEmail={currentUser ? currentUser.email : ''}
            currentUser={currentUser}
            lang={lang}
            theme={theme}
            onConfirmAppointment={handleConfirmAppointment}
            onVerifyEmail={handleVerifyEmail}
            onClearNotifications={handleClearNotifications}
            gmailEmail={gmailEmail}
            onConnectGmail={handleConnectGmail}
            onDisconnectGmail={handleDisconnectGmail}
          />
        </div>

      </main>

      {/* Global Footer */}
      <footer className={`border-t py-6 text-center text-xs ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-150 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold">© 2026 {isRtl ? 'بوابة المعهد الإلكترونية لإدارة وتأمين المواعيد' : 'Institute Portal Scheduler Administration'}</p>
          <p className="opacity-75 max-w-lg mx-auto text-[10px] leading-relaxed">
            {isRtl 
              ? 'مبني بامتثال فائق لخصوصية المستفيدين ومتطلبات نظام حماية البيانات الشخصية والأمن المزدوج في المعهد.' 
              : 'Constructed according to advanced GDPR encryption strategies and double-step auth compliance models.'}
          </p>
        </div>
      </footer>

    </div>
  );
}
