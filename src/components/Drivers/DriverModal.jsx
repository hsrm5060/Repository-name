import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiCreditCard, FiCamera, FiAlertCircle, FiUpload } from 'react-icons/fi';

const DriverModal = ({ isOpen, onClose, onSave, driver }) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    status: 'active',
    vehicle: '',
    rating: 5.0,
    totalTrips: 0,
    // الحقول الجديدة
    national_id: '',
    birth_date: '',
    address: '',
    city: '',
    avatar: '',
    nationality: 'سعودي',
    blood_type: '',
    notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        licenseNumber: driver.licenseNumber || driver.license_number || '',
        licenseExpiry: driver.licenseExpiry || driver.license_expiry || '',
      });
      setAvatarPreview(driver.avatar || null);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        licenseNumber: '',
        licenseExpiry: '',
        status: 'active',
        vehicle: '',
        rating: 5.0,
        totalTrips: 0,
        national_id: '',
        birth_date: '',
        address: '',
        city: '',
        avatar: '',
        nationality: 'سعودي',
        blood_type: '',
        notes: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
      });
      setAvatarPreview(null);
    }
    setActiveTab('basic');
  }, [driver, isOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ضغط الصورة قبل حفظها
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 150; // الحجم الأقصى
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // تحويل لـ JPEG بجودة 70%
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setAvatarPreview(compressedImage);
          setFormData({ ...formData, avatar: compressedImage });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const driverData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      license_number: formData.licenseNumber,
      license_expiry: formData.licenseExpiry,
      status: formData.status,
      rating: formData.rating || 5,
      vehicle: formData.vehicle || '',
      join_date: formData.join_date || new Date().toISOString().split('T')[0],
      // الحقول الجديدة
      national_id: formData.national_id,
      birth_date: formData.birth_date || null,
      address: formData.address,
      city: formData.city,
      avatar: formData.avatar,
      nationality: formData.nationality,
      blood_type: formData.blood_type || null,
      notes: formData.notes,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      emergency_contact_relation: formData.emergency_contact_relation,
    };
    
    onSave(driverData);
  };

  const tabs = [
    { id: 'basic', label: 'البيانات الأساسية', icon: FiUser },
    { id: 'personal', label: 'البيانات الشخصية', icon: FiCreditCard },
    { id: 'emergency', label: 'جهة الاتصال للطوارئ', icon: FiAlertCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-2xl font-bold">
                {driver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6">
                {/* البيانات الأساسية */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    {/* صورة السائق */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-32 h-32 rounded-full bg-gray-100 border-4 border-blue-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                        >
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="صورة السائق" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <FiCamera className="w-8 h-8 text-gray-400 mx-auto" />
                              <span className="text-xs text-gray-500 mt-1">إضافة صورة</span>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarPreview(null);
                              setFormData({ ...formData, avatar: '' });
                            }}
                            className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline ml-1" /> الاسم الكامل *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-field"
                          placeholder="أدخل اسم السائق"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiPhone className="inline ml-1" /> رقم الهاتف *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="input-field"
                          placeholder="05xxxxxxxx"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiMail className="inline ml-1" /> البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-field"
                          placeholder="example@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiCreditCard className="inline ml-1" /> رقم الرخصة *
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          className="input-field"
                          placeholder="رقم رخصة القيادة"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiCalendar className="inline ml-1" /> تاريخ انتهاء الرخصة *
                        </label>
                        <input
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="input-field"
                        >
                          <option value="active">نشط</option>
                          <option value="inactive">غير نشط</option>
                          <option value="suspended">موقوف</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">المركبة</label>
                        <input
                          type="text"
                          value={formData.vehicle}
                          onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                          className="input-field"
                          placeholder="مثال: تويوتا كامري - ABC 1234"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* البيانات الشخصية */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiCreditCard className="inline ml-1" /> رقم الهوية
                        </label>
                        <input
                          type="text"
                          value={formData.national_id}
                          onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                          className="input-field"
                          placeholder="رقم الهوية الوطنية أو الإقامة"
                          maxLength={10}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiCalendar className="inline ml-1" /> تاريخ الميلاد
                        </label>
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الجنسية</label>
                        <select
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          className="input-field"
                        >
                          <option value="سعودي">سعودي</option>
                          <option value="يمني">يمني</option>
                          <option value="مصري">مصري</option>
                          <option value="سوداني">سوداني</option>
                          <option value="باكستاني">باكستاني</option>
                          <option value="هندي">هندي</option>
                          <option value="بنغلاديشي">بنغلاديشي</option>
                          <option value="فلبيني">فلبيني</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">فصيلة الدم</label>
                        <select
                          value={formData.blood_type}
                          onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                          className="input-field"
                        >
                          <option value="">اختر فصيلة الدم</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiMapPin className="inline ml-1" /> المدينة
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="input-field"
                        >
                          <option value="">اختر المدينة</option>
                          <option value="الرياض">الرياض</option>
                          <option value="جدة">جدة</option>
                          <option value="مكة المكرمة">مكة المكرمة</option>
                          <option value="المدينة المنورة">المدينة المنورة</option>
                          <option value="الدمام">الدمام</option>
                          <option value="الخبر">الخبر</option>
                          <option value="الطائف">الطائف</option>
                          <option value="تبوك">تبوك</option>
                          <option value="بريدة">بريدة</option>
                          <option value="خميس مشيط">خميس مشيط</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiMapPin className="inline ml-1" /> العنوان التفصيلي
                        </label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="input-field"
                          rows={2}
                          placeholder="الحي، الشارع، رقم المبنى..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="input-field"
                          rows={3}
                          placeholder="أي ملاحظات إضافية..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* جهة الاتصال للطوارئ */}
                {activeTab === 'emergency' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-orange-800">
                        <FiAlertCircle className="w-5 h-5" />
                        <p className="font-medium">معلومات جهة الاتصال في حالات الطوارئ</p>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">
                        يُفضل إضافة شخص يمكن التواصل معه في حالات الطوارئ
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline ml-1" /> اسم جهة الاتصال
                        </label>
                        <input
                          type="text"
                          value={formData.emergency_contact_name}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                          className="input-field"
                          placeholder="اسم الشخص"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiPhone className="inline ml-1" /> رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={formData.emergency_contact_phone}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                          className="input-field"
                          placeholder="05xxxxxxxx"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">صلة القرابة</label>
                        <select
                          value={formData.emergency_contact_relation}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                          className="input-field"
                        >
                          <option value="">اختر صلة القرابة</option>
                          <option value="أب">أب</option>
                          <option value="أم">أم</option>
                          <option value="أخ">أخ</option>
                          <option value="أخت">أخت</option>
                          <option value="زوج">زوج</option>
                          <option value="زوجة">زوجة</option>
                          <option value="ابن">ابن</option>
                          <option value="ابنة">ابنة</option>
                          <option value="صديق">صديق</option>
                          <option value="قريب">قريب</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-3 font-medium">
                  {driver ? 'حفظ التعديلات' : 'إضافة السائق'}
                </button>
                <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3 font-medium">
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DriverModal;
