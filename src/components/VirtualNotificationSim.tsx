import React, { useState } from 'react';
import { AppNotification, Appointment, Lang, Theme } from '../types';
import { Mail, MessageSquare, Smartphone, Bell, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface VirtualNotificationSimProps {
  notifications: AppNotification[];
  appointments: Appointment[];
  activeEmail: string;
  lang: Lang;
  theme: Theme;
  onConfirmAppointment: (appointmentId: string) => void;
  onVerifyEmail: (email: string) => void;
  onClearNotifications: () => void;
  gmailEmail: string | null;
  onConnectGmail: () => Promise<void>;
  onDisconnectGmail: () => Promise<void>;
}

export default function VirtualNotificationSim({
  notifications,
  appointments,
  activeEmail,
  lang,
  theme,
  onConfirmAppointment,
  onVerifyEmail,
  onClearNotifications,
  gmailEmail,
  onConnectGmail,
  onDisconnectGmail
}: VirtualNotificationSimProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'push'>('email');

  // Filter emails belonging to either the student or the current active email
  const filteredEmails = notifications.filter(
    (n) => n.type === 'email' && (n.recipient.toLowerCase() === activeEmail.toLowerCase() || activeEmail === 'director@institute.edu.sa')
  );

  const filteredSMS = notifications.filter((n) => n.type === 'sms');
  const filteredPush = notifications.filter((n) => n.type === 'app');

  const isRtl = lang === 'ar';

  return (
    <div className={`rounded-3xl border transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 shadow-xl' : 'bg-white border-slate-150 text-slate-800 shadow-sm'
    } overflow-hidden`}>
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 animate-pulse text-blue-100" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">
                {isRtl ? 'صندوق محاكاة الاتصالات وإشعارات المستفيدين' : 'Bilingual Notification & Simulation Sandbox'}
              </h3>
              <p className="text-[11px] text-blue-100/90 leading-tight font-medium">
                {isRtl
                  ? 'محاكاة تفاعلية فورية لتلقي البريد الجامعي الموثق والرسائل النصية للتحقق الثنائي.'
                  : 'Interact with virtual academic emails and OTP verification states for security testing.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClearNotifications}
            className="text-[9px] uppercase font-black tracking-wider bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full transition cursor-pointer"
          >
            {isRtl ? 'مسح السجلات' : 'Clear logs'}
          </button>
        </div>
      </div>

      {/* Selector Tabs - Styled like premium navigation pills */}
      <div className="flex border-b border-slate-100 dark:border-slate-850 font-sans text-xs">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-3.5 font-extrabold flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'email'
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4 text-blue-500" />
          <span>{isRtl ? 'البريد الجامعي' : 'University Mail'}</span>
          {filteredEmails.length > 0 && (
            <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
              {filteredEmails.length}
            </span>
          )}
          {activeTab === 'email' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`flex-1 py-3.5 font-extrabold flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'sms'
              ? 'text-emerald-600 font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-550" />
          <span>{isRtl ? 'رسائل الجوال SMS' : 'Short SMS Logs'}</span>
          {filteredSMS.length > 0 && (
            <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
              {filteredSMS.length}
            </span>
          )}
          {activeTab === 'sms' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => setActiveTab('push')}
          className={`flex-1 py-3.5 font-extrabold flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'push'
              ? 'text-indigo-600 font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-indigo-500" />
          <span>{isRtl ? 'تنبيهات النظام' : 'App Push'}</span>
          {filteredPush.length > 0 && (
            <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
              {filteredPush.length}
            </span>
          )}
          {activeTab === 'push' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {/* Simulator Content Panel */}
      <div className="p-5 max-h-[360px] overflow-y-auto space-y-4">
        {activeTab === 'email' && (
          <div className="space-y-4">
            {/* Real Gmail Connection Status Box */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              gmailEmail 
                ? 'bg-emerald-500/5 border-emerald-500/15' 
                : 'bg-blue-500/5 border-blue-500/15'
            } text-xs space-y-3.5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <span className={`w-2.5 h-2.5 rounded-full ${gmailEmail ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isRtl ? 'تفعيل قنوات البريد الإلكتروني الحقيقية (Gmail API)' : 'Live Email Alert Channel (Gmail API)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                    {gmailEmail 
                      ? (isRtl 
                        ? `✓ تم ربط البريد الإلكتروني الحقيقي بنجاح: (${gmailEmail}). سيقوم النظام بإرسال إشعارات وخطابات حقيقية فاعلة ومؤكدة إلى بريد الطلاب فوراً.` 
                        : `✓ Live Gmail notification channel is active via: (${gmailEmail}). Students will receive real production-grade emails to activate and schedule.`)
                      : (isRtl 
                        ? 'إن إرسال رسائل بريد إلكتروني حقيقية معطل الآن. يمكنك ربط بريدك الحقيقي (Gmail) لتشغيل الإشعارات الحقيقية والخطابات الأكاديمية الصادرة من بريدك مباشرة للطلاب.'
                        : 'Real email transmission is disabled. Authenticate with Gmail to dispatch actual verified emails directly to standard student mailboxes.')
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {gmailEmail ? (
                  <button
                    onClick={onDisconnectGmail}
                    className="px-3.5 py-2 text-[10px] font-black bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 border border-rose-500/15 rounded-xl transition cursor-pointer"
                  >
                    {isRtl ? 'إلغاء الربط وإيقاف الإرسال' : 'Disconnect Gmail'}
                  </button>
                ) : (
                  <button
                    onClick={onConnectGmail}
                    className="transition-all duration-300 transform hover:scale-[1.01] active:scale-97 shadow-xs cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #dadce0',
                      borderRadius: '12px',
                      color: '#3c4043',
                      fontFamily: '"Google Sans",Roboto,Arial,sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      height: '36px',
                      letterSpacing: '0.25px',
                      padding: '0 14px',
                      position: 'relative',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      width: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isRtl ? 'ربط حساب Gmail الأكاديمي' : 'Connect Real Gmail Account'}</span>
                  </button>
                )}
              </div>
            </div>

            {filteredEmails.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Mail className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لا توجد رسائل بريد إلكتروني حالياً.' : 'No university emails received yet.'}</p>
                <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-450 font-medium">
                  {isRtl ? 'قم بإنشاء حساب طالب أو حجز موعد لتوليد التنبيهات' : 'Create an account or book a slot to trigger actions'}
                </p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isVerification = email.content.includes('كود') || email.content.includes('يرجى تأكيد حسابك');
                const isAppointmentVerify = email.content.includes('تأكيد الموعد') || email.content.includes('APT-');
                
                const aptIdMatch = email.content.match(/APT-\d+/);
                const aptId = aptIdMatch ? aptIdMatch[0] : null;
                const targetApt = appointments.find(a => a.id === aptId);

                return (
                  <div
                    key={email.id}
                    className={`p-4 rounded-2xl border text-xs transition-colors duration-200 animate-fade-in ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/70 border-slate-200/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 text-[9px] text-slate-400 font-mono font-bold">
                      <span>{email.recipient}</span>
                      <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-black mb-1.5 text-blue-600 dark:text-blue-400 text-sm">
                      {isRtl ? email.titleAr || email.title : email.title}
                    </div>
                    <p className="text-slate-650 dark:text-slate-300 mb-4 leading-relaxed font-medium text-[11px]">
                      {isRtl ? email.contentAr || email.content : email.content}
                    </p>

                    {isAppointmentVerify && targetApt && targetApt.status === 'pending_email' && (
                      <button
                        onClick={() => onConfirmAppointment(targetApt.id)}
                        className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-extrabold rounded-full flex items-center justify-center gap-1.5 transition text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                        <span>{isRtl ? 'اضغط هنا لتأكيد حجز مقابلتك فوراً' : 'Click Here to Approve & Confirm Scheduled Entry'}</span>
                      </button>
                    )}

                    {isVerification && !email.content.includes('تأكيد الموعد') && (
                      <button
                        onClick={() => onVerifyEmail(email.recipient)}
                        className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-extrabold rounded-full flex items-center justify-center gap-1.5 transition text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{isRtl ? 'اضغط هنا لتفعيل وتأكيد حسابك الأكاديمي' : 'Click Here to Verify University Account'}</span>
                      </button>
                    )}

                    {targetApt && targetApt.status === 'confirmed' && (
                      <div className="mt-2 text-center text-[10px] font-black text-emerald-600 bg-emerald-500/10 p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/15">
                        <CheckCircle className="w-4 h-4" />
                        <span>{isRtl ? 'تم تأكيد الموعد بنجاح!' : 'Appointment was Confirmed!'}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-4">
            {filteredSMS.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لم يتم إرسال أي تنبيهات SMS بعد.' : 'No mobile SMS alerts dispatch log.'}</p>
              </div>
            ) : (
              filteredSMS.map((sms) => (
                <div
                  key={sms.id}
                  className={`p-4 rounded-2xl border text-xs relative animate-fade-in ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="absolute top-3.5 right-4 font-black text-[8px] bg-green-500/10 text-green-600 px-2.5 py-0.5 rounded-full uppercase">
                    SMS Carrier
                  </div>
                  <div className="text-[9px] text-slate-400 mb-2 font-mono font-bold">
                    To: {sms.recipient} | {new Date(sms.timestamp).toLocaleTimeString()}
                  </div>
                  <p className="text-slate-650 dark:text-slate-300 leading-relaxed font-mono font-bold">
                    {isRtl ? sms.contentAr || sms.content : sms.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'push' && (
          <div className="space-y-4 font-sans">
            {filteredPush.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Bell className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لا يوجد إشعارات دفع واردة.' : 'No mobile app push notification indicators.'}</p>
              </div>
            ) : (
              filteredPush.map((push) => (
                <div
                  key={push.id}
                  className="p-4 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl text-xs flex gap-3.5 items-start animate-fade-in"
                >
                  <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono font-bold">
                      <span className="text-indigo-650 dark:text-indigo-400 uppercase tracking-tight">
                        {push.recipient === 'director@institute.edu.sa' ? (isRtl ? 'تطبيق المدير' : 'Director App') : (isRtl ? 'تطبيق الطالب' : 'Student App')}
                      </span>
                      <span>{new Date(push.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">{isRtl ? push.titleAr || push.title : push.title}</div>
                    <p className="text-slate-550 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
                      {isRtl ? push.contentAr || push.content : push.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Compliance/Privacy Verification Footer */}
      <div className="bg-emerald-500/5 border-t border-emerald-500/15 p-4 text-[10px] flex gap-3 items-start text-slate-600 dark:text-slate-300 leading-relaxed rounded-b-3xl">
        <ShieldCheck className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-emerald-600 uppercase tracking-wider">
            {isRtl ? 'تنويه الأمان وحماية الخصوصية الرقمية (GDPR & PDPL):' : 'Bilingual Safety & Privacy Compliance (GDPR & PDPL Standards):'}
          </p>
          <p className="opacity-90 mt-0.5 font-medium">
            {isRtl
              ? 'تخضع قنوات الاتصال ورموز التحقق للتشفير الأمني المتكامل لضمان سرية طلبات الطلاب وسلامة الجداول الأكاديمية وصحة التراخيص.'
              : 'Our backend enforces strict rate limits and multi-step validations. All simulation data represents authentic university-compliant security protocols.'}
          </p>
        </div>
      </div>
    </div>
  );
}
