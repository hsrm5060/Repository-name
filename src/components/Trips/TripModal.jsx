import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiUser, FiTruck, FiDollarSign, FiClock, FiCalendar } from 'react-icons/fi';

const TripModal = ({ isOpen, onClose, onSave, trip, drivers = [], vehicles = [] }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    vehicle_id: '',
    from_location: '',
    to_location: '',
    trip_date: new Date().toISOString().split('T')[0],
    trip_time: '',
    distance: '',
    fare: '',
    status: 'pending',
    customer_name: '',
    customer_phone: '',
    notes: '',
  });

  useEffect(() => {
    if (trip) {
      setFormData({
        driver_id: trip.driver_id || '',
        vehicle_id: trip.vehicle_id || '',
        from_location: trip.from_location || '',
        to_location: trip.to_location || '',
        trip_date: trip.trip_date || new Date().toISOString().split('T')[0],
        trip_time: trip.trip_time || '',
        distance: trip.distance || '',
        fare: trip.fare || '',
        status: trip.status || 'pending',
        customer_name: trip.customer_name || '',
        customer_phone: trip.customer_phone || '',
        notes: trip.notes || '',
      });
    } else {
      setFormData({
        driver_id: '',
        vehicle_id: '',
        from_location: '',
        to_location: '',
        trip_date: new Date().toISOString().split('T')[0],
        trip_time: '',
        distance: '',
        fare: '',
        status: 'pending',
        customer_name: '',
        customer_phone: '',
        notes: '',
      });
    }
  }, [trip, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.driver_id || !formData.from_location || !formData.to_location) {
      alert('الرجاء ملء الحقول المطلوبة');
      return;
    }
    onSave(formData);
  };

  // الحصول على السائقين النشطين
  const activeDrivers = drivers.filter(d => d.status === 'active');
  
  // الحصول على المركبات المتاحة
  const availableVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'available');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {trip ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* السائق والمركبة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline ml-1" /> السائق *
                </label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">اختر السائق</option>
                  {activeDrivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTruck className="inline ml-1" /> المركبة
                </label>
                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="">اختر المركبة</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_number} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* نقطة البداية والنهاية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline ml-1 text-red-500" /> من (نقطة البداية) *
                </label>
                <input
                  type="text"
                  name="from_location"
                  value={formData.from_location}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="مثال: الرياض - حي النخيل"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline ml-1 text-green-500" /> إلى (الوجهة) *
                </label>
                <input
                  type="text"
                  name="to_location"
                  value={formData.to_location}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="مثال: جدة - حي الحمراء"
                  required
                />
              </div>
            </div>

            {/* التاريخ والوقت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline ml-1" /> تاريخ الرحلة
                </label>
                <input
                  type="date"
                  name="trip_date"
                  value={formData.trip_date}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline ml-1" /> وقت الرحلة
                </label>
                <input
                  type="time"
                  name="trip_time"
                  value={formData.trip_time}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* المسافة والأجرة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المسافة (كم)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="inline ml-1" /> الأجرة (ر.س)
                </label>
                <input
                  type="number"
                  name="fare"
                  value={formData.fare}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="pending">معلقة</option>
                  <option value="in-progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
            </div>

            {/* بيانات العميل */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">بيانات العميل (اختياري)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="اسم العميل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم هاتف العميل
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field w-full"
                rows="3"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" className="btn-primary flex-1">
                {trip ? 'حفظ التعديلات' : 'إضافة الرحلة'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripModal;
