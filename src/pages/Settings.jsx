import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiSave, FiUser, FiBell, FiLock, FiRefreshCw, FiHome,
  FiDollarSign, FiPrinter, FiUsers, FiActivity, FiSettings, FiDownload,
  FiUpload, FiTrash2, FiPlus, FiEdit2, FiAlertTriangle, FiDroplet
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { login } from '../store/slices/authSlice';
import api from '../services/api';
import BackupManager from '../components/Settings/BackupManager';
import ChangePasswordModal from '../components/Settings/ChangePasswordModal';
import BrandingSettings from '../components/Settings/BrandingSettings';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // بيانات المستخدم
  const [profile, setProfile] = useState({ name: '', username: '', email: '', phone: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useState({
    company_name: '', company_logo: '', company_address: '', commercial_register: '', tax_number: '',
    company_phone: '', company_email: '', currency: 'SAR', payment_methods: ['cash'],
    bank_name: '', bank_account: '', iban: '', insurance_alert_days: 30, license_alert_days: 30,
    contract_alert_days: 30, maintenance_alert_days: 7, invoice_header: '', invoice_footer: '',
    invoice_template: 'default', date_format: 'ar-SA'
  });
  
  // المستخدمين
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  
  // سجل النشاطات
  const [activityLog, setActivityLog] = useState([]);
  
  // إعدادات محلية
  const [localSettings, setLocalSettings] = useState({
    darkMode: false, fontSize: 'medium', 
    notifications: { 
      email: true, sms: true, push: true,
      // إشعارات تفصيلية
      payment_due: true,
      payment_overdue: true,
      contract_expiry: true,
      insurance_expiry: true,
      license_expiry: true,
      maintenance_due: true,
      new_driver: false,
      system_updates: true
    }
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // جلب بيانات المستخدم
      const userRes = await api.get('/auth/me');
      setProfile({
        name: userRes.data.name || userRes.data.username || '',
        username: userRes.data.username || '',
        email: userRes.data.email || '',
        phone: userRes.data.phone || ''
      });
      
      // جلب إعدادات النظام
      try {
        const settingsRes = await api.get('/settings');
        if (settingsRes.data) {
          setSystemSettings(prev => ({ ...prev, ...settingsRes.data }));
        }
      } catch (e) { console.log('Settings not available yet'); }
      
      // جلب المستخدمين (للمدير فقط)
      if (user?.role === 'admin') {
        try {
          const usersRes = await api.get('/settings/users');
          setUsers(usersRes.data);
        } catch (e) { console.log('Users API not available'); }
        
        // جلب سجل النشاطات
        try {
          const logRes = await api.get('/settings/activity-log?limit=20');
          setActivityLog(logRes.data.logs || []);
        } catch (e) { console.log('Activity log not available'); }
      }
      
      // جلب الإعدادات المحلية
      const saved = localStorage.getItem('appSettings');
      if (saved) setLocalSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // رفع صورة الملف الشخصي
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة فقط');
      return;
    }
    
    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً! الحد الأقصى 5MB');
      return;
    }
    
    // معاينة الصورة
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    
    // رفع الصورة
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatars');
    
    try {
      const res = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const avatarUrl = res.data.file?.url || res.data.url;
      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error(error.response?.data?.message || 'خطأ في رفع الصورة');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', profile);
      dispatch(login({ user: response.data.user, role: response.data.user.role, token }));
      toast.success('تم حفظ الملف الشخصي');
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطأ في الحفظ');
    } finally { setSaving(false); }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      await api.put('/settings/company', {
        company_name: systemSettings.company_name, company_logo: systemSettings.company_logo,
        company_address: systemSettings.company_address, commercial_register: systemSettings.commercial_register,
        tax_number: systemSettings.tax_number, phone: systemSettings.company_phone, email: systemSettings.company_email
      });
      toast.success('تم حفظ إعدادات الشركة');
    } catch (error) { toast.error('خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleSavePayments = async () => {
    setSaving(true);
    try {
      await api.put('/settings/payments', {
        currency: systemSettings.currency, payment_methods: systemSettings.payment_methods,
        bank_name: systemSettings.bank_name, bank_account: systemSettings.bank_account, iban: systemSettings.iban
      });
      toast.success('تم حفظ إعدادات المدفوعات');
    } catch (error) { toast.error('خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleSaveAlerts = async () => {
    setSaving(true);
    try {
      await api.put('/settings/alerts', {
        insurance_alert_days: systemSettings.insurance_alert_days,
        license_alert_days: systemSettings.license_alert_days,
        contract_alert_days: systemSettings.contract_alert_days,
        maintenance_alert_days: systemSettings.maintenance_alert_days
      });
      toast.success('تم حفظ إعدادات التنبيهات');
    } catch (error) { toast.error('خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleSavePrint = async () => {
    setSaving(true);
    try {
      await api.put('/settings/print', {
        invoice_header: systemSettings.invoice_header,
        invoice_footer: systemSettings.invoice_footer,
        invoice_template: systemSettings.invoice_template
      });
      toast.success('تم حفظ إعدادات الطباعة');
    } catch (error) { toast.error('خطأ في الحفظ'); }
    finally { setSaving(false); }
  };

  const handleSaveLocalSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(localSettings));
    toast.success('تم حفظ الإعدادات');
  };

  const handleExportSettings = async () => {
    try {
      const res = await api.get('/settings/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'settings-export.json'; a.click();
      toast.success('تم تصدير الإعدادات');
    } catch (error) { toast.error('خطأ في التصدير'); }
  };

  const handleImportSettings = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.post('/settings/import', { settings: data.settings });
      toast.success('تم استيراد الإعدادات');
      fetchData();
    } catch (error) { toast.error('خطأ في الاستيراد'); }
  };

  const handleResetSystem = async () => {
    const confirm1 = window.confirm('⚠️ تحذير: سيتم حذف جميع البيانات! هل أنت متأكد؟');
    if (!confirm1) return;
    const confirm2 = window.prompt('اكتب RESET_ALL_DATA للتأكيد:');
    if (confirm2 !== 'RESET_ALL_DATA') { toast.error('نص التأكيد غير صحيح'); return; }
    try {
      await api.post('/settings/reset-system', { confirmText: 'RESET_ALL_DATA' });
      toast.success('تم إعادة تعيين النظام');
    } catch (error) { toast.error('خطأ في إعادة التعيين'); }
  };

  const handleAddUser = async () => {
    const username = window.prompt('اسم المستخدم:');
    const email = window.prompt('البريد الإلكتروني:');
    const password = window.prompt('كلمة المرور:');
    if (!username || !email || !password) return;
    try {
      await api.post('/settings/users', { username, email, password, role: 'user' });
      toast.success('تم إضافة المستخدم');
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'خطأ'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/settings/users/${id}`);
      toast.success('تم الحذف');
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'خطأ'); }
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: FiUser },
    { id: 'branding', label: 'الهوية البصرية', icon: FiDroplet },
    { id: 'company', label: 'الشركة', icon: FiHome },
    { id: 'payments', label: 'المدفوعات', icon: FiDollarSign },
    { id: 'alerts', label: 'التنبيهات', icon: FiBell },
    { id: 'print', label: 'الطباعة', icon: FiPrinter },
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'المستخدمين', icon: FiUsers }] : []),
    ...(user?.role === 'admin' ? [{ id: 'activity', label: 'سجل النشاطات', icon: FiActivity }] : []),
    { id: 'system', label: 'النظام', icon: FiSettings },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: FiDownload },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
        <p className="text-gray-600 mt-1">إدارة إعدادات الحساب والنظام</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* القائمة الجانبية */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* المحتوى */}
        <div className="flex-1">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            
            {/* الهوية البصرية */}
            {activeTab === 'branding' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiDroplet className="text-primary-600" /> الهوية البصرية
                </h2>
                <BrandingSettings />
              </div>
            )}

            {/* الملف الشخصي */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiUser className="text-primary-600" /> الملف الشخصي</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* صورة الملف الشخصي */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {avatarPreview || profile.avatar ? (
                          <img src={avatarPreview || profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-primary-600">{profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-lg">
                        <FiEdit2 className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{profile.name || profile.username}</h3>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <p className="text-xs text-gray-500 mt-1">انقر على الأيقونة لتغيير الصورة</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">الاسم</label><input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">اسم المستخدم</label><input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">البريد</label><input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">الهاتف</label><input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input-field" dir="ltr" /></div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />} حفظ</button>
                    <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="btn-secondary flex items-center gap-2"><FiLock /> تغيير كلمة المرور</button>
                  </div>
                </form>
              </div>
            )}

            {/* إعدادات الشركة */}
            {activeTab === 'company' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiHome className="text-primary-600" /> إعدادات الشركة</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">اسم الشركة</label><input type="text" value={systemSettings.company_name} onChange={e => setSystemSettings({...systemSettings, company_name: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">رقم السجل التجاري</label><input type="text" value={systemSettings.commercial_register || ''} onChange={e => setSystemSettings({...systemSettings, commercial_register: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">الرقم الضريبي</label><input type="text" value={systemSettings.tax_number || ''} onChange={e => setSystemSettings({...systemSettings, tax_number: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">هاتف الشركة</label><input type="tel" value={systemSettings.company_phone || ''} onChange={e => setSystemSettings({...systemSettings, company_phone: e.target.value})} className="input-field" dir="ltr" /></div>
                    <div><label className="block text-sm font-medium mb-2">بريد الشركة</label><input type="email" value={systemSettings.company_email || ''} onChange={e => setSystemSettings({...systemSettings, company_email: e.target.value})} className="input-field" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-2">عنوان الشركة</label><textarea value={systemSettings.company_address || ''} onChange={e => setSystemSettings({...systemSettings, company_address: e.target.value})} className="input-field" rows={3} /></div>
                  <button onClick={handleSaveCompany} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />} حفظ</button>
                </div>
              </div>
            )}

            {/* إعدادات المدفوعات */}
            {activeTab === 'payments' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiDollarSign className="text-primary-600" /> إعدادات المدفوعات</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">العملة</label><select value={systemSettings.currency} onChange={e => setSystemSettings({...systemSettings, currency: e.target.value})} className="input-field"><option value="SAR">ريال سعودي (SAR)</option><option value="USD">دولار (USD)</option><option value="EUR">يورو (EUR)</option><option value="AED">درهم إماراتي (AED)</option></select></div>
                    <div><label className="block text-sm font-medium mb-2">اسم البنك</label><input type="text" value={systemSettings.bank_name || ''} onChange={e => setSystemSettings({...systemSettings, bank_name: e.target.value})} className="input-field" /></div>
                    <div><label className="block text-sm font-medium mb-2">رقم الحساب</label><input type="text" value={systemSettings.bank_account || ''} onChange={e => setSystemSettings({...systemSettings, bank_account: e.target.value})} className="input-field" dir="ltr" /></div>
                    <div><label className="block text-sm font-medium mb-2">IBAN</label><input type="text" value={systemSettings.iban || ''} onChange={e => setSystemSettings({...systemSettings, iban: e.target.value})} className="input-field" dir="ltr" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-2">طرق الدفع المتاحة</label>
                    <div className="flex flex-wrap gap-3">
                      {['cash', 'bank_transfer', 'card', 'check'].map(method => (
                        <label key={method} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                          <input type="checkbox" checked={systemSettings.payment_methods?.includes(method)} onChange={e => {
                            const methods = e.target.checked ? [...(systemSettings.payment_methods || []), method] : (systemSettings.payment_methods || []).filter(m => m !== method);
                            setSystemSettings({...systemSettings, payment_methods: methods});
                          }} className="w-4 h-4" />
                          <span>{{cash: 'نقدي', bank_transfer: 'تحويل بنكي', card: 'بطاقة', check: 'شيك'}[method]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSavePayments} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />} حفظ</button>
                </div>
              </div>
            )}

            {/* إعدادات التنبيهات */}
            {activeTab === 'alerts' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiBell className="text-primary-600" /> إعدادات التنبيهات</h2>
                
                {/* أيام التنبيه */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">أيام التنبيه قبل انتهاء الصلاحية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-2">التأمين (أيام)</label><input type="number" value={systemSettings.insurance_alert_days} onChange={e => setSystemSettings({...systemSettings, insurance_alert_days: parseInt(e.target.value)})} className="input-field" min={1} /></div>
                    <div><label className="block text-sm font-medium mb-2">الرخص (أيام)</label><input type="number" value={systemSettings.license_alert_days} onChange={e => setSystemSettings({...systemSettings, license_alert_days: parseInt(e.target.value)})} className="input-field" min={1} /></div>
                    <div><label className="block text-sm font-medium mb-2">العقود (أيام)</label><input type="number" value={systemSettings.contract_alert_days} onChange={e => setSystemSettings({...systemSettings, contract_alert_days: parseInt(e.target.value)})} className="input-field" min={1} /></div>
                    <div><label className="block text-sm font-medium mb-2">الصيانة (أيام)</label><input type="number" value={systemSettings.maintenance_alert_days} onChange={e => setSystemSettings({...systemSettings, maintenance_alert_days: parseInt(e.target.value)})} className="input-field" min={1} /></div>
                  </div>
                </div>
                
                {/* إشعارات تفصيلية */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">أنواع الإشعارات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'payment_due', label: 'دفعات مستحقة', desc: 'تنبيه عند اقتراب موعد الدفع' },
                      { key: 'payment_overdue', label: 'دفعات متأخرة', desc: 'تنبيه عند تأخر الدفع' },
                      { key: 'contract_expiry', label: 'انتهاء العقود', desc: 'تنبيه قبل انتهاء العقد' },
                      { key: 'insurance_expiry', label: 'انتهاء التأمين', desc: 'تنبيه قبل انتهاء التأمين' },
                      { key: 'license_expiry', label: 'انتهاء الرخص', desc: 'تنبيه قبل انتهاء الرخصة' },
                      { key: 'maintenance_due', label: 'صيانة مستحقة', desc: 'تنبيه عند موعد الصيانة' },
                      { key: 'new_driver', label: 'سائق جديد', desc: 'تنبيه عند إضافة سائق' },
                      { key: 'system_updates', label: 'تحديثات النظام', desc: 'إشعارات تحديثات النظام' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div>
                          <span className="font-medium text-gray-700">{item.label}</span>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <input type="checkbox" checked={localSettings.notifications[item.key] ?? true} onChange={e => setLocalSettings({...localSettings, notifications: {...localSettings.notifications, [item.key]: e.target.checked}})} className="w-5 h-5 text-primary-600 rounded" />
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={handleSaveAlerts} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />} حفظ إعدادات الأيام</button>
                  <button onClick={handleSaveLocalSettings} className="btn-secondary flex items-center gap-2"><FiSave /> حفظ إعدادات الإشعارات</button>
                </div>
              </div>
            )}

            {/* إعدادات الطباعة */}
            {activeTab === 'print' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiPrinter className="text-primary-600" /> إعدادات الطباعة</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-2">قالب الفاتورة</label><select value={systemSettings.invoice_template} onChange={e => setSystemSettings({...systemSettings, invoice_template: e.target.value})} className="input-field"><option value="default">افتراضي</option><option value="modern">عصري</option><option value="classic">كلاسيكي</option></select></div>
                  <div><label className="block text-sm font-medium mb-2">ترويسة الفاتورة</label><textarea value={systemSettings.invoice_header || ''} onChange={e => setSystemSettings({...systemSettings, invoice_header: e.target.value})} className="input-field" rows={3} placeholder="نص يظهر في أعلى الفاتورة" /></div>
                  <div><label className="block text-sm font-medium mb-2">تذييل الفاتورة</label><textarea value={systemSettings.invoice_footer || ''} onChange={e => setSystemSettings({...systemSettings, invoice_footer: e.target.value})} className="input-field" rows={3} placeholder="نص يظهر في أسفل الفاتورة" /></div>
                  <button onClick={handleSavePrint} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />} حفظ</button>
                </div>
              </div>
            )}

            {/* إدارة المستخدمين */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FiUsers className="text-primary-600" /> إدارة المستخدمين</h2>
                  <button onClick={handleAddUser} className="btn-primary flex items-center gap-2"><FiPlus /> إضافة مستخدم</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-right">المستخدم</th><th className="px-4 py-3 text-right">البريد</th><th className="px-4 py-3 text-right">الدور</th><th className="px-4 py-3 text-right">الحالة</th><th className="px-4 py-3">إجراءات</th></tr></thead>
                    <tbody className="divide-y">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{u.name || u.username}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role === 'admin' ? 'مدير' : 'مستخدم'}</span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status === 'active' ? 'نشط' : 'معطل'}</span></td>
                          <td className="px-4 py-3"><button onClick={() => handleDeleteUser(u.id)} disabled={u.id === user?.id} className="text-red-600 hover:text-red-800 disabled:opacity-50"><FiTrash2 /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* سجل النشاطات */}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiActivity className="text-primary-600" /> سجل النشاطات</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activityLog.length === 0 ? <p className="text-gray-500 text-center py-8">لا توجد نشاطات مسجلة</p> : activityLog.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><FiActivity className="text-primary-600" /></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{log.user_name || log.username || 'مستخدم'}</p>
                        <p className="text-sm text-gray-600">{log.action} - {log.entity_type}</p>
                        <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString('ar-SA')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* إعدادات النظام */}
            {activeTab === 'system' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiSettings className="text-primary-600" /> إعدادات النظام</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-2">تنسيق التاريخ</label><select value={systemSettings.date_format} onChange={e => setSystemSettings({...systemSettings, date_format: e.target.value})} className="input-field"><option value="ar-SA">عربي (هجري)</option><option value="ar-EG">عربي (ميلادي)</option><option value="en-US">إنجليزي</option></select></div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><span>الوضع الليلي</span><input type="checkbox" checked={localSettings.darkMode} onChange={e => setLocalSettings({...localSettings, darkMode: e.target.checked})} className="w-5 h-5" /></div>
                  <div className="flex gap-3">
                    <button onClick={handleExportSettings} className="btn-secondary flex items-center gap-2"><FiDownload /> تصدير الإعدادات</button>
                    <label className="btn-secondary flex items-center gap-2 cursor-pointer"><FiUpload /> استيراد<input type="file" accept=".json" onChange={handleImportSettings} className="hidden" /></label>
                  </div>
                  <button onClick={handleSaveLocalSettings} className="btn-primary flex items-center gap-2"><FiSave /> حفظ</button>
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2"><FiAlertTriangle /> منطقة الخطر</h3>
                    <button onClick={handleResetSystem} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"><FiTrash2 /> إعادة تعيين النظام</button>
                    <p className="text-sm text-gray-500 mt-2">سيتم حذف جميع البيانات بشكل نهائي</p>
                  </div>
                </div>
              </div>
            )}

            {/* النسخ الاحتياطي */}
            {activeTab === 'backup' && <BackupManager />}
          </motion.div>
        </div>
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
};

export default Settings;
