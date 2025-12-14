import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiTruck, FiDollarSign, FiCalendar } from 'react-icons/fi';

const RentalContractModal = ({ isOpen, onClose, onSave, contract, drivers, vehicles }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    vehicle_id: '',
    amount: '',
    plan: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        driver_id: contract.driver_id || '',
        driver_name: contract.driver_name || '',
        vehicle_id: contract.vehicle_id || '',
        amount: contract.amount || '',
        plan: contract.plan || 'monthly',
        start_date: contract.start_date || new Date().toISOString().split('T')[0],
        due_date: contract.due_date || '',
        notes: contract.notes || '',
      });
    } else {
      setFormData({
        driver_id: '',
        driver_name: '',
        vehicle_id: '',
        amount: '',
        plan: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
      });
    }
  }, [contract, isOpen]);

  const handleDriverChange = (e) => {
    const driverId = e.target.value;
    const driver = drivers.find(d => d.id === parseInt(driverId));
    setFormData({
      ...formData,
      driver_id: driverId,
      driver_name: driver?.name || '',
    });
  };

  const calculateDueDate = (startDate, plan) => {
    const date = new Date(startDate);
    switch (plan) {
      case 'daily': date.setDate(date.getDate() + 1); break;
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
      case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
      default: date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.start_date && formData.plan) {
      setFormData(prev => ({
        ...prev,
        due_date: calculateDueDate(prev.start_date, prev.plan)
      }));
    }
  }, [formData.start_date, formData.plan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      driver_id: parseInt(formData.driver_id),
      amount: parseFloat(formData.amount),
      status: 'pending',
    });
  };

  const availableDrivers = drivers.filter(d => d.status === 'active');
  const availableVehicles = vehicles.filter(v => v.status === 'active');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold">
                {contract ? 'تعديل عقد الإيجار' : 'إضافة عقد إيجار جديد'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline ml-1" /> السائق *
                </label>
                <select
                  value={formData.driver_id}
                  onChange={handleDriverChange}
                  className="input-field"
                  required
                >
                  <option value="">اختر السائق</option>
                  {availableDrivers.map(driver => (
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
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">اختر المركبة (اختياري)</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.plate_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiDollarSign className="inline ml-1" /> مبلغ الإيجار *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline ml-1" /> خطة الدفع *
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary py-3">
                  {contract ? 'حفظ التعديلات' : 'إنشاء العقد'}
                </button>
                <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">
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

export default RentalContractModal;
