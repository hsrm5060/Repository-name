import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUpload, FiImage, FiDroplet, FiType, FiSave, FiRefreshCw,
  FiEye, FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useBranding } from '../../contexts/BrandingContext';

const BrandingSettings = () => {
  const { branding, updateBranding, loading } = useBranding();
  const [localBranding, setLocalBranding] = useState(branding);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const logoRef = useRef(null);
  const stampRef = useRef(null);
  const watermarkRef = useRef(null);

  // تحديث الحالة المحلية عند تغيير branding من Context
  useState(() => {
    setLocalBranding(branding);
  }, [branding]);

  const setBranding = (newValue) => {
    if (typeof newValue === 'function') {
      setLocalBranding(prev => newValue(prev));
    } else {
      setLocalBranding(newValue);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة فقط');
      return;
    }

    // التحقق من الحجم (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً! الحد الأقصى 2MB');
      return;
    }

    // تحويل لـ Base64 للتخزين المحلي
    const reader = new FileReader();
    reader.onloadend = () => {
      setBranding(prev => ({ ...prev, [field]: reader.result }));
      toast.success('تم رفع الصورة بنجاح');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field) => {
    setBranding(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // حفظ وتطبيق عبر Context
      await updateBranding(localBranding);
      toast.success('تم حفظ وتطبيق إعدادات الهوية البصرية ✨');
    } catch (error) {
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('هل تريد إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      localStorage.removeItem('branding');
      window.location.reload();
    }
  };

  const colorPresets = [
    { name: 'أزرق', primary: '#2563eb', secondary: '#7c3aed' },
    { name: 'أخضر', primary: '#10b981', secondary: '#059669' },
    { name: 'بنفسجي', primary: '#8b5cf6', secondary: '#6366f1' },
    { name: 'برتقالي', primary: '#f97316', secondary: '#ea580c' },
    { name: 'أحمر', primary: '#ef4444', secondary: '#dc2626' },
    { name: 'ذهبي', primary: '#eab308', secondary: '#ca8a04' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiRefreshCw className="animate-spin text-3xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الهوية الأساسية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiType className="text-primary-600" /> الهوية الأساسية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة (عربي)</label>
            <input
              type="text"
              value={localBranding.company_name}
              onChange={(e) => setLocalBranding({ ...branding, company_name: e.target.value })}
              className="input-field"
              placeholder="اسم الشركة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة (إنجليزي)</label>
            <input
              type="text"
              value={localBranding.company_name_en}
              onChange={(e) => setLocalBranding({ ...branding, company_name_en: e.target.value })}
              className="input-field"
              dir="ltr"
              placeholder="Company Name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">شعار الشركة (نص)</label>
            <input
              type="text"
              value={localBranding.company_slogan}
              onChange={(e) => setLocalBranding({ ...branding, company_slogan: e.target.value })}
              className="input-field"
              placeholder="شعار أو وصف مختصر"
            />
          </div>
        </div>
      </motion.div>

      {/* الشعار والصور */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiImage className="text-primary-600" /> الشعار والصور
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* الشعار */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شعار الشركة</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => logoRef.current?.click()}
            >
              {localBranding.logo ? (
                <div className="relative">
                  <img src={localBranding.logo} alt="Logo" className="max-h-24 mx-auto" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage('logo'); }}
                    className="absolute top-0 left-0 p-1 bg-red-500 text-white rounded-full"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">اضغط لرفع الشعار</p>
                  <p className="text-xs text-gray-400">PNG, JPG (الحد: 2MB)</p>
                </>
              )}
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="hidden"
            />
          </div>

          {/* الختم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ختم الشركة</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => stampRef.current?.click()}
            >
              {localBranding.stamp ? (
                <div className="relative">
                  <img src={localBranding.stamp} alt="Stamp" className="max-h-24 mx-auto" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage('stamp'); }}
                    className="absolute top-0 left-0 p-1 bg-red-500 text-white rounded-full"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">اضغط لرفع الختم</p>
                  <p className="text-xs text-gray-400">PNG شفاف مفضل</p>
                </>
              )}
            </div>
            <input
              ref={stampRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'stamp')}
              className="hidden"
            />
          </div>

          {/* العلامة المائية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العلامة المائية</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => watermarkRef.current?.click()}
            >
              {localBranding.watermark ? (
                <div className="relative">
                  <img src={localBranding.watermark} alt="Watermark" className="max-h-24 mx-auto opacity-50" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage('watermark'); }}
                    className="absolute top-0 left-0 p-1 bg-red-500 text-white rounded-full"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">اضغط لرفع العلامة المائية</p>
                  <p className="text-xs text-gray-400">PNG شفاف مفضل</p>
                </>
              )}
            </div>
            <input
              ref={watermarkRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'watermark')}
              className="hidden"
            />
          </div>
        </div>

        {/* إعدادات العلامة المائية */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={localBranding.show_watermark}
              onChange={(e) => setLocalBranding({ ...branding, show_watermark: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="text-gray-700">إظهار العلامة المائية في التقارير</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={localBranding.show_stamp}
              onChange={(e) => setLocalBranding({ ...branding, show_stamp: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="text-gray-700">إظهار الختم في الإيصالات</span>
          </label>
        </div>

        {localBranding.show_watermark && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شفافية العلامة المائية: {Math.round(localBranding.watermark_opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={localBranding.watermark_opacity}
              onChange={(e) => setLocalBranding({ ...branding, watermark_opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </motion.div>

      {/* الألوان */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiDroplet className="text-primary-600" /> الألوان
        </h3>

        {/* ألوان مسبقة */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">ألوان جاهزة</label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setLocalBranding({ 
                  ...branding, 
                  primary_color: preset.primary, 
                  secondary_color: preset.secondary 
                })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-gray-400 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللون الرئيسي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localBranding.primary_color}
                onChange={(e) => setLocalBranding({ ...branding, primary_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={localBranding.primary_color}
                onChange={(e) => setLocalBranding({ ...branding, primary_color: e.target.value })}
                className="input-field flex-1"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللون الثانوي</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localBranding.secondary_color}
                onChange={(e) => setLocalBranding({ ...branding, secondary_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={localBranding.secondary_color}
                onChange={(e) => setLocalBranding({ ...branding, secondary_color: e.target.value })}
                className="input-field flex-1"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">لون التمييز</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localBranding.accent_color}
                onChange={(e) => setLocalBranding({ ...branding, accent_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={localBranding.accent_color}
                onChange={(e) => setLocalBranding({ ...branding, accent_color: e.target.value })}
                className="input-field flex-1"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* معاينة الألوان */}
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: localBranding.primary_color + '10' }}>
          <p className="text-sm text-gray-600 mb-2">معاينة:</p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: localBranding.primary_color }}
            >
              زر رئيسي
            </button>
            <button 
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: localBranding.secondary_color }}
            >
              زر ثانوي
            </button>
            <button 
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: localBranding.accent_color }}
            >
              زر تمييز
            </button>
          </div>
        </div>
      </motion.div>

      {/* إعدادات الطباعة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات الطباعة والتقارير</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ترويسة التقارير</label>
            <textarea
              value={localBranding.print_header}
              onChange={(e) => setLocalBranding({ ...branding, print_header: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="نص يظهر في أعلى التقارير..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تذييل التقارير</label>
            <textarea
              value={localBranding.print_footer}
              onChange={(e) => setLocalBranding({ ...branding, print_footer: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="نص يظهر في أسفل التقارير..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">قالب التقارير</label>
            <select
              value={localBranding.report_template}
              onChange={(e) => setLocalBranding({ ...branding, report_template: e.target.value })}
              className="input-field"
            >
              <option value="modern">عصري</option>
              <option value="classic">كلاسيكي</option>
              <option value="minimal">بسيط</option>
              <option value="professional">احترافي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">قالب الإيصالات</label>
            <select
              value={localBranding.receipt_template}
              onChange={(e) => setLocalBranding({ ...branding, receipt_template: e.target.value })}
              className="input-field"
            >
              <option value="default">افتراضي</option>
              <option value="compact">مضغوط</option>
              <option value="detailed">تفصيلي</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* أزرار الحفظ */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleReset}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw /> إعادة تعيين
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <FiEye /> معاينة
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* نافذة المعاينة */}
      {previewMode && (
        <PreviewModal 
          branding={branding} 
          onClose={() => setPreviewMode(false)} 
        />
      )}
    </div>
  );
};

// مكون المعاينة
const PreviewModal = ({ branding, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">معاينة التقرير</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[70vh] bg-gray-100">
          {/* معاينة التقرير */}
          <div className="bg-white p-8 shadow-lg relative" style={{ minHeight: '500px' }}>
            {/* العلامة المائية */}
            {localBranding.show_watermark && localBranding.watermark && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: localBranding.watermark_opacity }}
              >
                <img src={localBranding.watermark} alt="" className="max-w-[300px]" />
              </div>
            )}

            {/* الترويسة */}
            <div className="text-center border-b pb-4 mb-6">
              {localBranding.logo && (
                <img src={localBranding.logo} alt="Logo" className="h-16 mx-auto mb-2" />
              )}
              <h1 className="text-2xl font-bold" style={{ color: localBranding.primary_color }}>
                {localBranding.company_name}
              </h1>
              {localBranding.company_slogan && (
                <p className="text-gray-500 text-sm">{localBranding.company_slogan}</p>
              )}
              {localBranding.print_header && (
                <p className="text-gray-600 mt-2">{localBranding.print_header}</p>
              )}
            </div>

            {/* محتوى وهمي */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">تقرير المدفوعات</h2>
              <p className="text-gray-600">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
              
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr style={{ backgroundColor: localBranding.primary_color + '20' }}>
                    <th className="border p-2 text-right">السائق</th>
                    <th className="border p-2 text-right">المبلغ</th>
                    <th className="border p-2 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">أحمد محمد</td>
                    <td className="border p-2">1,500 ر.س</td>
                    <td className="border p-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">مدفوع</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">خالد علي</td>
                    <td className="border p-2">2,000 ر.س</td>
                    <td className="border p-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">معلق</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* الختم */}
            {localBranding.show_stamp && localBranding.stamp && (
              <div className="absolute bottom-20 left-8">
                <img src={localBranding.stamp} alt="Stamp" className="w-24 h-24 opacity-80" />
              </div>
            )}

            {/* التذييل */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm border-t pt-4 mx-8">
              {localBranding.print_footer}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="btn-primary">
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
