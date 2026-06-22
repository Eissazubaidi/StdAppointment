import React, { useState } from 'react';
import { Lang, Theme, User, Appointment } from '../types';
import { translations } from '../translations';
import { UserPlus, LogIn, Mail, Phone, Lock, User as UserIcon, LogOut, CheckCircle, Clock, XCircle, ChevronRight, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface StudentPortalProps {
  lang: Lang;
  theme: Theme;
  currentUser: User | null;
  appointments: Appointment[];
  onLogin: (email: string, role: 'student' | 'director') => boolean;
  onRegister: (name: string, email: string, phone: string) => void;
  onLogout: () => void;
  onCancelAppointment: (appointmentId: string) => void;
  onVerifyEmail: (email: string) => void;
  onUpdateProfile?: (name: string, phone: string) => void;
}

export default function StudentPortal({
  lang,
  theme,
  currentUser,
  appointments,
  onLogin,
  onRegister,
  onLogout,
  onCancelAppointment,
  onVerifyEmail,
  onUpdateProfile
}: StudentPortalProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Toggle modes
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('••••••••');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState<string>(currentUser?.phone || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  const startEditing = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      alert(isRtl ? 'الرجاء إدخال الاسم كاملاً' : 'Name is required');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile(editName.trim(), editPhone.trim());
      setProfileSuccessMsg(isRtl ? 'تم تحديث بيانات الحساب بنجاح!' : 'Profile updated successfully!');
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditingProfile(false);
      }, 2000);
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال بريدك الإلكتروني.' : 'Please input your email.');
      return;
    }

    // Determine role: simple trick, if the email is director@institute.edu.sa, they log in as director
    const isDirector = email.toLowerCase() === 'director@institute.edu.sa';
    const role = isDirector ? 'director' : 'student';

    const success = onLogin(email.trim(), role);

    if (!success) {
      setErrorMessage(
        isRtl 
          ? 'المستخدم غير مسجل لدينا! يرجى إنشاء حساب طالب جديد أولاً.' 
          : 'User not registered! Please create a student account first.'
      );
    } else {
      setSuccessMessage(isRtl ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني جامعي صحيح.' : 'Please enter a valid academic email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال رقم جوالك لتلقي تنبيهات SMS.' : 'Please enter your mobile phone for SMS alerts.');
      return;
    }

    onRegister(name.trim(), email.trim(), phone.trim());
    setSuccessMessage(isRtl ? 'تم إنشاء الحساب بنجاح! يرجى النقر على رابط التفعيل في صندوق البريد الجامعي الموضح أدناه.' : 'Account registered! Please click the activation link in the Student Virtual Inbox at the bottom of the page.');
    
    // Switch to login or clear fields
    setName('');
    setEmail('');
    setPhone('');
    setIsRegistering(false);
  };

  // Filter appointments for active student
  const studentAppointments = currentUser
    ? appointments.filter((apt) => apt.studentEmail.toLowerCase() === currentUser.email.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      {currentUser ? (
        // Logged in View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Summary */}
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-5`}>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 p-3 rounded-2xl">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold">
                  <span>{currentUser.role === 'director' ? t.director : t.student}</span>
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{currentUser.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-mono leading-none">{currentUser.email}</p>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="space-y-3.5 pt-2 border-t border-slate-150 dark:border-slate-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">{isRtl ? 'الاسم الجديد للمستخدم:' : 'New Display Name:'}</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">{isRtl ? 'رقم هاتف التنبيهات:' : 'SMS Alert Phone:'}</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
                {profileSuccessMsg && (
                  <p className="text-[10px] text-green-500 dark:text-green-400 font-bold">{profileSuccessMsg}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-blue-650 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl transition"
                  >
                    {isRtl ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-slate-250 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold py-1.5 px-3 rounded-xl transition"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-t border-slate-150 dark:border-slate-850 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>{isRtl ? 'هاتف التنبيهات SMS:' : 'SMS Alert Contact:'}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{currentUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRtl ? 'حالة الحساب:' : 'Account Status:'}</span>
                    <span>
                      {currentUser.isVerified ? (
                        <span className="bg-green-105 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-bold px-2.5 py-0.5 rounded-full border border-green-500/10">
                          {isRtl ? 'مؤكد ونشط' : 'Verified & Active'}
                        </span>
                      ) : (
                        <span className="bg-amber-105 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/10">
                          {isRtl ? 'غير مؤكد' : 'Unconfirmed'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startEditing}
                  className="w-full text-xs py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 font-bold rounded-xl transition border border-slate-200/40 dark:border-slate-800"
                >
                  {isRtl ? 'تعديل بيانات الحساب ✎' : 'Edit Account Info ✎'}
                </button>
              </>
            )}

            {!currentUser.isVerified && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-3 animate-pulse">
                <div className="flex gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold items-center">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? 'تفعيل البريد الأكاديمي معلق' : 'Academic Verification Pending'}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isRtl 
                    ? 'لكي تتمكن من تأكيد طلبات المقابلات بنجاح، انزل لأسفل الصفحة (صندوق البريد الافتراضي) واضغط على زر "تفعيل حسابك" مباشرة.'
                    : 'Please scroll down to the Virtual Student Inbox and click "Confirm Account" to establish full scheduler permissions.'}
                </p>
                <button
                  onClick={() => onVerifyEmail(currentUser.email)}
                  className="w-full text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-xl transition shadow-sm"
                >
                  {isRtl ? 'تجريد محاكاة التفعيل الفوري' : 'Automate verification code'}
                </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 border border-red-500/10 text-red-600 hover:bg-red-500/5 transition text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* User Appointments Track Panel */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {t.recentAppointments}
              </h3>
              <span className="bg-blue-100 dark:bg-blue-900/35 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
                {studentAppointments.length}
              </span>
            </div>

            {studentAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-450 text-xs">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-20 text-slate-500" />
                <p>{t.noAppointmentsYet}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentAppointments.map((apt) => {
                  const statusColors = {
                    pending_email: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200/55',
                    confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200/55',
                    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200/55',
                    completed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200/55'
                  };

                  return (
                    <div
                      key={apt.id}
                      className={`p-5 rounded-2xl border transition ${
                        theme === 'dark' ? 'bg-slate-950/40 border-slate-800 hover:border-slate-750' : 'bg-slate-50/70 border-slate-200/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded">
                            {apt.id}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(apt.createdAt).toLocaleString(isRtl ? 'ar' : 'en')}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${statusColors[apt.status]}`}>
                          {t[apt.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850 my-2">
                        <div>
                          <div className="text-slate-400 text-[10px]">{t.date}</div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{apt.date}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">{t.time}</div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{apt.timeSlot}</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100/30 dark:bg-slate-950/60 p-2.5 rounded-xl my-2 leading-relaxed border border-slate-100/50 dark:border-slate-850">
                        <span className="font-bold block text-[10px] text-slate-400 uppercase mb-0.5">{isRtl ? 'غرض المقابلة:' : 'Reason for entry:'}</span>
                        {apt.reason}
                      </div>

                      {apt.managerNotes && (
                        <div className="p-3 bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/10 rounded-xl text-xs space-y-1 my-2">
                          <span className="font-bold text-blue-600 block text-[10px]">{isRtl ? 'توجيه وملاحظات المدير:' : 'Director Executive Notes:'}</span>
                          <p className="text-slate-700 dark:text-slate-300 italic">“{apt.managerNotes}”</p>
                        </div>
                      )}

                      {/* Display warning or actions */}
                      <div className="mt-3.5 flex flex-wrap gap-2 justify-between items-center pt-2.5 border-t border-slate-150 dark:border-slate-850 text-xs">
                        {apt.status === 'pending_email' ? (
                          <div className="flex gap-1.5 items-center text-amber-600 bg-amber-500/5 p-1.5 rounded-lg text-[11px] font-sans">
                            <Info className="w-4 h-4 shrink-0 text-amber-500" />
                            <span>
                              {isRtl 
                                ? 'يرجى تفعيل الموعد من صندوق البريد أسفل الصفحة للتأكيد.' 
                                : 'Please look down inside the mock email box to confirm.'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex gap-1 items-center text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-sans font-bold">{isRtl ? 'تم الاتصال بالمدير' : 'Linked with Manager'}</span>
                          </div>
                        )}

                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => onCancelAppointment(apt.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded transition shadow-sm"
                          >
                            {isRtl ? 'إلغاء الموعد' : 'Cancel appointment'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Login / Register Form View
        <div className="max-w-md mx-auto">
          <div className={`p-8 sm:p-10 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-md space-y-6`}>
            
            {/* Header Icons & Title */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center">
                {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-black text-slate-850 dark:text-slate-100">
                {isRegistering ? t.registerTitle : t.loginTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl 
                  ? 'بوابة الطلاب الإلكترونية لتفعيل الخصوصية وترتيب المقابلات' 
                  : 'Official portal for verifying student identities and bookings'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-xs flex gap-1.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex gap-1.5 items-start">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1">{t.name}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: سلطان علي الحربي' : 'John Doe'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-full border border-slate-300 dark:border-slate-850 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1">{t.email}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder={
                      isRegistering 
                        ? (isRtl ? 'user@institute.edu.sa' : 'student@edu.sa') 
                        : (isRtl ? 'البريد المسجل أو director@institute.edu.sa' : 'Your address')
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-full border border-slate-300 dark:border-slate-850 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {!isRegistering && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    🚀 {isRtl ? 'للوج كمدير استخدم: director@institute.edu.sa' : 'To log as director use: director@institute.edu.sa'}
                  </span>
                )}
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1">{t.phone}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="+96650XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-full border border-slate-300 dark:border-slate-850 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1">{t.password}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-full border border-slate-300 dark:border-slate-855 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit trigger button - Sleek blue active button with shadow */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 text-xs flex justify-center items-center gap-1.5"
              >
                <span>{isRegistering ? t.registerBtn : t.loginBtn}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Selector Trigger */}
            <div className="text-center text-xs pt-2">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-blue-650 dark:text-blue-400 hover:underline font-bold"
              >
                {isRegistering ? t.haveAccount : t.noAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
