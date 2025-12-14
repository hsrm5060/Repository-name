import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTruck, FiCamera, FiCalendar, FiHash, FiDroplet, FiSettings } from 'react-icons/fi';

const VehicleModal = ({ isOpen, onClose, onSave, vehicle, drivers = [] }) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plate_number: '',
    color: '',
    status: 'active',
    mileage: 0,
    assigned_driver: '',
    // الحقول الجديدة
    vin: '',
    fuel_type: 'petrol',
    engine_size: '',
    transmission: 'automatic',
    seats: 5,
    purchase_date: '',
    purchase_price: '',
    notes: '',
    image: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        plate_number: vehicle.plate_number || '',
        color: vehicle.color || '',
        status: vehicle.status || 'active',
        mileage: vehicle.mileage || 0,
        assigned_driver: vehicle.assigned_driver || '',
        vin: vehicle.vin || '',
        fuel_type: vehicle.fuel_type || 'petrol',
        engine_size: vehicle.engine_size || '',
        transmission: vehicle.transmission || 'automatic',
        seats: vehicle.seats || 5,
        purchase_date: vehicle.purchase_date || '',
        purchase_price: vehicle.purchase_price || '',
        notes: vehicle.notes || '',
        image: vehicle.image || '',
      });
      setImagePreview(vehicle.image || null);
    } else {
      setFormData({
        make: '', model: '', year: new Date().getFullYear(), plate_number: '', color: '',
        status: 'active', mileage: 0, assigned_driver: '', vin: '', fuel_type: 'petrol', engine_size: '',
        transmission: 'automatic', seats: 5, purchase_date: '', purchase_price: '', notes: '', image: '',
      });
      setImagePreview(null);
    }
    setActiveTab('basic');
  }, [vehicle, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) { height *= maxSize / width; width = maxSize; }
          } else {
            if (height > maxSize) { width *= maxSize / height; height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(compressedImage);
          setFormData({ ...formData, image: compressedImage });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'البيانات الأساسية', icon: FiTruck },
    { id: 'technical', label: 'البيانات الفنية', icon: FiSettings },
    { id: 'purchase', label: 'بيانات الشراء', icon: FiCalendar },
  ];

  const carMakes = ['تويوتا', 'هيونداي', 'نيسان', 'هوندا', 'كيا', 'مازدا', 'فورد', 'شيفروليه', 'جي إم سي', 'مرسيدس', 'بي إم دبليو', 'أودي', 'لكزس', 'إنفينيتي', 'جينيسيس', 'أخرى'];
  const colors = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'أخضر', 'بني', 'ذهبي', 'برتقالي'];

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
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-2xl font-bold">{vehicle ? 'تعديل بيانات المركبة' : 'إضافة مركبة جديدة'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><FiX className="text-xl" /></button>
            </div>

            <div className="flex border-b bg-gray-50">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div onClick={() => fileInputRef.current?.click()}
                          className="w-48 h-32 rounded-xl bg-gray-100 border-4 border-blue-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden">
                          {imagePreview ? (
                            <img src={imagePreview} alt="صورة المركبة" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <FiCamera className="w-8 h-8 text-gray-400 mx-auto" />
                              <span className="text-xs text-gray-500 mt-1">إضافة صورة</span>
                            </div>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        {imagePreview && (
                          <button type="button" onClick={() => { setImagePreview(null); setFormData({ ...formData, image: '' }); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الماركة *</label>
                        <select value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="input-field" required>
                          <option value="">اختر الماركة</option>
                          {carMakes.map(make => <option key={make} value={make}>{make}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الموديل *</label>
                        <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="input-field" placeholder="مثال: كامري" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">السنة *</label>
                        <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="input-field" min="2000" max={new Date().getFullYear() + 1} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم اللوحة *</label>
                        <input type="text" value={formData.plate_number} onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })} className="input-field" placeholder="ABC 1234" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اللون *</label>
                        <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input-field" required>
                          <option value="">اختر اللون</option>
                          {colors.map(color => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                          <option value="active">نشط</option>
                          <option value="maintenance">صيانة</option>
                          <option value="inactive">غير نشط</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">المسافة المقطوعة (كم)</label>
                        <input type="number" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">السائق المخصص</label>
                        <select value={formData.assigned_driver} onChange={(e) => setFormData({ ...formData, assigned_driver: e.target.value ? parseInt(e.target.value) : null })} className="input-field">
                          <option value="">-- بدون سائق --</option>
                          {drivers.filter(d => d.status === 'active').map(driver => (
                            <option key={driver.id} value={driver.id}>{driver.name} - {driver.phone}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2"><FiHash className="inline ml-1" /> رقم الشاصي (VIN)</label>
                        <input type="text" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })} className="input-field font-mono" placeholder="مثال: 1HGBH41JXMN109186" maxLength={17} />
                        <p className="text-xs text-gray-500 mt-1">رقم الشاصي يتكون من 17 حرف ورقم</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><FiDroplet className="inline ml-1" /> نوع الوقود</label>
                        <select value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} className="input-field">
                          <option value="petrol">بنزين</option>
                          <option value="diesel">ديزل</option>
                          <option value="hybrid">هايبرد</option>
                          <option value="electric">كهربائي</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><FiSettings className="inline ml-1" /> سعة المحرك</label>
                        <select value={formData.engine_size} onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })} className="input-field">
                          <option value="">اختر سعة المحرك</option>
                          <option value="1.0L">1.0 لتر</option>
                          <option value="1.3L">1.3 لتر</option>
                          <option value="1.5L">1.5 لتر</option>
                          <option value="1.6L">1.6 لتر</option>
                          <option value="1.8L">1.8 لتر</option>
                          <option value="2.0L">2.0 لتر</option>
                          <option value="2.4L">2.4 لتر</option>
                          <option value="2.5L">2.5 لتر</option>
                          <option value="2.7L">2.7 لتر</option>
                          <option value="3.0L">3.0 لتر</option>
                          <option value="3.5L">3.5 لتر</option>
                          <option value="4.0L">4.0 لتر</option>
                          <option value="5.0L+">5.0 لتر أو أكثر</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ناقل الحركة</label>
                        <select value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} className="input-field">
                          <option value="automatic">أوتوماتيك</option>
                          <option value="manual">عادي (مانيوال)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">عدد المقاعد</label>
                        <select value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })} className="input-field">
                          <option value="2">2 مقاعد</option>
                          <option value="4">4 مقاعد</option>
                          <option value="5">5 مقاعد</option>
                          <option value="7">7 مقاعد</option>
                          <option value="8">8 مقاعد</option>
                          <option value="9">9+ مقاعد</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'purchase' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2"><FiCalendar className="inline ml-1" /> تاريخ الشراء</label>
                        <input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">سعر الشراء (ر.س)</label>
                        <input type="number" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} className="input-field" placeholder="0" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" rows={4} placeholder="أي ملاحظات إضافية عن المركبة..." />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-3 font-medium">{vehicle ? 'حفظ التعديلات' : 'إضافة المركبة'}</button>
                <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3 font-medium">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VehicleModal;
