import { useState, useEffect } from 'react';
import { FiX, FiTool } from 'react-icons/fi';

const MaintenanceModal = ({ isOpen, onClose, onSave, maintenance, vehicles }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    maintenance_type: 'oil_change',
    description: '',
    cost: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    next_maintenance_date: '',
    mileage: '',
    next_maintenance_mileage: '',
    service_provider: '',
    warranty_until: '',
    parts_replaced: '',
    status: 'completed',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle_id: maintenance.vehicle_id || '',
        maintenance_type: maintenance.maintenance_type || 'oil_change',
        description: maintenance.description || '',
        cost: maintenance.cost || '',
        maintenance_date: maintenance.maintenance_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        next_maintenance_date: maintenance.next_maintenance_date?.split('T')[0] || '',
        mileage: maintenance.mileage || '',
        next_maintenance_mileage: maintenance.next_maintenance_mileage || '',
        service_provider: maintenance.service_provider || '',
        warranty_until: maintenance.warranty_until?.split('T')[0] || '',
        parts_replaced: maintenance.parts_replaced || '',
        status: maintenance.status || 'completed',
        priority: maintenance.priority || 'medium',
        notes: maintenance.notes || ''
      });
    }
  }, [maintenance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const typeLabels = {
    oil_change: 'تغيير زيت',
    tire_change: 'تغيير إطارات',
    brake_service: 'صيانة فرامل',
    engine_repair: 'إصلاح محرك',
    transmission: 'ناقل حركة',
    electrical: 'كهربائية',
    ac_service: 'صيانة مكيف',
    general_checkup: 'فحص عام',
    other: 'أخرى'
  };

  const statusLabels = {
    completed: 'مكتملة',
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ'
  };

  const priorityLabels = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiTool className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {maintenance ? 'تعديل سجل صيانة' : 'إضافة سجل صيانة جديد'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {maintenance ? 'تحديث بيانات الصيانة' : 'إضافة سجل صيانة جديد للنظام'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المركبة <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- اختر مركبة --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الصيانة <span className="text-red-500">*</span>
              </label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التكلفة (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الصيانة <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="maintenance_date"
                value={formData.maintenance_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Next Maintenance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الصيانة القادمة
              </label>
              <input
                type="date"
                name="next_maintenance_date"
                value={formData.next_maintenance_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكيلومترات الحالية
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                placeholder="45000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Next Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكيلومترات للصيانة القادمة
              </label>
              <input
                type="number"
                name="next_maintenance_mileage"
                value={formData.next_maintenance_mileage}
                onChange={handleChange}
                min="0"
                placeholder="50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Service Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مزود الخدمة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="service_provider"
                value={formData.service_provider}
                onChange={handleChange}
                required
                placeholder="مركز الصيانة السريع"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Warranty Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الضمان حتى
              </label>
              <input
                type="date"
                name="warranty_until"
                value={formData.warranty_until}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="وصف تفصيلي للصيانة..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Parts Replaced */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القطع المستبدلة
              </label>
              <textarea
                name="parts_replaced"
                value={formData.parts_replaced}
                onChange={handleChange}
                rows="2"
                placeholder="زيت موبيل 1، فلتر زيت، فلتر هواء..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="ملاحظات إضافية..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {maintenance ? 'تحديث السجل' : 'إضافة السجل'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
