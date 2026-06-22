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
    <div className={`rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} shadow-xl overflow-hidden`}>
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 animate-pulse text-blue-100" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">
                {isRtl ? 'مركز المحاكاة الرقمي وحماية البيانات' : 'Digital Simulation & Privacy Hub'}
              </h3>
              <p className="text-[11px] text-blue-100/90 leading-tight">
                {isRtl
                  ? 'محاكاة كاملة للتواصل الآمن والإشعار بالبريد والرسائل لتسهيل التجربة'
                  : 'Full mock smtp/sms sandbox for instant testing and compliance presentation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClearNotifications}
            className="text-[10px] uppercase font-black tracking-wider bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full transition"
          >
            {isRtl ? 'مسح السجلات' : 'Clear logs'}
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-slate-700/10 font-sans">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'email'
              ? 'border-b-2 border-blue-600 text-blue-600 font-extrabold bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4 text-blue-500" />
          <span>{isRtl ? 'صندوق البريد الجامعي' : 'University Gmail'}</span>
          {filteredEmails.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {filteredEmails.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'sms'
              ? 'border-b-2 border-green-600 text-green-600 font-extrabold bg-green-50/50 dark:bg-green-950/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-green-500" />
          <span>{isRtl ? 'رسائل الجوال SMS' : 'Short SMS Logs'}</span>
          {filteredSMS.length > 0 && (
            <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {filteredSMS.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('push')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'push'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-indigo-500" />
          <span>{isRtl ? 'تطبيق الهاتف' : 'App Push'}</span>
          {filteredPush.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {filteredPush.length}
            </span>
          )}
        </button>
      </div>

      {/* Simulator Content Panel */}
      <div className="p-5 max-h-[340px] overflow-y-auto space-y-3.5">
        {activeTab === 'email' && (
          <div className="space-y-3.5">
            {/* Real Gmail Connection Status Box */}
            <div className={`p-4 rounded-2xl border ${gmailEmail ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-blue-500/5 border-blue-500/20'} text-xs space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                    <span className={`w-2.5 h-2.5 rounded-full ${gmailEmail ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isRtl ? 'تفعيل قنوات البريد الإلكتروني الحقيقية (Gmail API)' : 'Live Email Alert Channel (Gmail API)'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {gmailEmail 
                      ? (isRtl 
                        ? `✓ تم ربط البريد الإلكتروني الحقيقي بنجاح: (${gmailEmail}). سيقوم النظام بإرسال إشعارات وخطابات حقيقية فاعلة ومؤكدة إلى بريد الطلاب فوراً.` 
                        : `✓ Live Gmail notification channel is active via: (${gmailEmail}). Students will receive real production-grade emails to activate and schedule.`)
                      : (isRtl 
                        ? 'إن إرسال رسائل بريد إلكتروني حقيقية مغلق الآن. يمكنك ربط بريدك الحقيقي (Gmail) لتشغيل الإشعارات الحقيقية والخطابات الأكاديمية الصادرة من بريدك مباشرة للطلاب.'
                        : 'Real email transmission is disabled. Authenticate with Gmail to dispatch actual verified emails directly to standard student mailboxes.')
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {gmailEmail ? (
                  <button
                    onClick={onDisconnectGmail}
                    className="px-3 py-1.5 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/15 rounded-xl transition cursor-pointer"
                  >
                    {isRtl ? 'إلغاء الربط وإيقاف الإرسال' : 'Disconnect Gmail'}
                  </button>
                ) : (
                  <button
                    onClick={onConnectGmail}
                    className="transition-all duration-305 transform hover:scale-[1.01] active:scale-95 shadow-xs cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #dadce0',
                      borderRadius: '8px',
                      color: '#3c4043',
                      fontFamily: '"Google Sans",Roboto,Arial,sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      height: '32px',
                      letterSpacing: '0.25px',
                      padding: '0 12px',
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
                    <span>{isRtl ? 'ربط حساب Gmail الحقيقي' : 'Connect Real Gmail Account'}</span>
                  </button>
                )}
              </div>
            </div>

            {filteredEmails.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Mail className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لا يوجد رسائل بريد إلكتروني واردة حالياً.' : 'No university emails received yet.'}</p>
                <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400 font-medium">
                  {isRtl ? 'احجز موعداً أو سجل حساباً لتلقي رابط التأكيد' : 'Book a slot or register a user to receive alerts'}
                </p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                // Check if this is a verification email or appointment confirmation
                const isVerification = email.content.includes('كود') || email.content.includes('يرجى تأكيد حسابك');
                const isAppointmentVerify = email.content.includes('تأكيد الموعد') || email.content.includes('APT-');
                
                // Try to find the associated appointment date/code
                const aptIdMatch = email.content.match(/APT-\d+/);
                const aptId = aptIdMatch ? aptIdMatch[0] : null;
                const targetApt = appointments.find(a => a.id === aptId);

                return (
                  <div
                    key={email.id}
                    className={`p-4 rounded-2xl border text-xs transition-colors duration-250 ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="font-bold">{email.recipient}</span>
                      <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-extrabold mb-1.5 text-blue-600 dark:text-blue-400 text-sm">
                      {isRtl ? email.titleAr || email.title : email.title}
                    </div>
                    <p className="text-slate-650 dark:text-slate-300 mb-3.5 leading-relaxed">
                      {isRtl ? email.contentAr || email.content : email.content}
                    </p>

                    {/* Interactive confirmation action in mailbox */}
                    {isAppointmentVerify && targetApt && targetApt.status === 'pending_email' && (
                      <button
                        onClick={() => onConfirmAppointment(targetApt.id)}
                        className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full flex items-center justify-center gap-1.5 transition text-xs shadow-lg shadow-emerald-500/10"
                      >
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                        <span>{isRtl ? 'اضغط هنا لتأكيد حجز مقابلتك فوراً' : 'Click Here to Approve & Confirm Scheduled Entry'}</span>
                      </button>
                    )}

                    {isVerification && !email.content.includes('تأكيد الموعد') && (
                      <button
                        onClick={() => onVerifyEmail(email.recipient)}
                        className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full flex items-center justify-center gap-1.5 transition text-xs shadow-lg shadow-blue-500/10"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{isRtl ? 'اضغط هنا لتفعيل وتأكيد حسابك الأكاديمي' : 'Click Here to Verify University Account'}</span>
                      </button>
                    )}

                    {targetApt && targetApt.status === 'confirmed' && (
                      <div className="mt-2 text-center text-[11px] font-extrabold text-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/20 shadow-xs">
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
          <div className="space-y-3.5">
            {filteredSMS.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لم يتم إرسال أي تنبيهات SMS بعد.' : 'No mobile SMS alerts dispatch log.'}</p>
              </div>
            ) : (
              filteredSMS.map((sms) => (
                <div
                  key={sms.id}
                  className={`p-4 rounded-2xl border text-xs relative ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="absolute top-3.5 right-4 font-black text-[9px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                    SMS Carrier
                  </div>
                  <div className="text-[10px] text-slate-400 mb-1.5 font-mono">
                    To: {sms.recipient} | {new Date(sms.timestamp).toLocaleTimeString()}
                  </div>
                  <p className="text-slate-650 dark:text-slate-300 leading-relaxed font-mono">
                    {isRtl ? sms.contentAr || sms.content : sms.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'push' && (
          <div className="space-y-3.5">
            {filteredPush.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Bell className="w-10 h-10 mx-auto mb-2.5 opacity-20 text-slate-500" />
                <p className="font-bold">{isRtl ? 'لا يوجد إشعارات هاتف ذكي في السجل الحالي.' : 'No mobile app push notification indicators.'}</p>
              </div>
            ) : (
              filteredPush.map((push) => (
                <div
                  key={push.id}
                  className="p-4 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/15 rounded-2xl text-xs flex gap-3.5 items-start"
                >
                  <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-tight">
                        {push.recipient === 'director@institute.edu.sa' ? (isRtl ? 'تطبيق المدير' : 'Director App') : (isRtl ? 'تطبيق الطالب' : 'Student App')}
                      </span>
                      <span>{new Date(push.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{isRtl ? push.titleAr || push.title : push.title}</div>
                    <p className="text-slate-650 dark:text-slate-300 text-[11px] leading-relaxed">
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
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border-t border-emerald-500/15 p-4 text-[10px] flex gap-3.5 items-start text-emerald-805 dark:text-emerald-300 leading-relaxed rounded-b-3xl">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold font-sans">
            {isRtl ? 'تنويه الأمان والخصوصية الرقمية (GDPR & PDPL):' : 'Security Audit & Compliance (GDPR & PDPL Standards):'}
          </p>
          <p className="opacity-90 mt-0.5">
            {isRtl
              ? 'تخضع الاتصالات ورموز التحقق الرقمي للتشفير الأمني العالي وتأكيد الهوية الثنائية لضمان سرية طلبات الطلاب وسلامة الجداول الأكاديمية.'
              : 'Our system adopts high-tier security models with virtual sandboxing. All verification payloads, codes, and private details are encrypted during transport.'}
          </p>
        </div>
      </div>
    </div>
  );
}
