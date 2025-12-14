import { useState, useEffect } from 'react';
import { FiX, FiShield } from 'react-icons/fi';

const InsuranceModal = ({ isOpen, onClose, onSave, insurance, vehicles }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    insurance_type: 'comprehensive',
    policy_number: '',
    insurance_company: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    premium_amount: '',
    coverage_details: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (insurance) {
      setFormData({
        vehicle_id: insurance.vehicle_id || '',
        insurance_type: insurance.insurance_type || 'comprehensive',
        policy_number: insurance.policy_number || '',
        insurance_company: insurance.insurance_company || '',
        start_date: insurance.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiry_date: insurance.expiry_date?.split('T')[0] || '',
        premium_amount: insurance.premium_amount || '',
        coverage_details: insurance.coverage_details || '',
        notes: insurance.notes || ''
      });
    } else {
      // Reset form for new insurance
      setFormData({
        vehicle_id: '',
        insurance_type: 'comprehensive',
        policy_number: '',
        insurance_company: '',
        start_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        premium_amount: '',
        coverage_details: '',
        notes: ''
      });
    }
    setErrors({});
  }, [insurance, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.vehicle_id) newErrors.vehicle_id = 'المركبة مطلوبة';
    if (!formData.policy_number) newErrors.policy_number = 'رقم البوليصة مطلوب';
    if (!formData.insurance_company) newErrors.insurance_company = 'شركة التأمين مطلوبة';
    if (!formData.start_date) newErrors.start_date = 'تاريخ البدء مطلوب';
    if (!formData.expiry_date) newErrors.expiry_date = 'تاريخ الانتهاء مطلوب';
    if (!formData.premium_amount) newErrors.premium_amount = 'قيمة القسط مطلوبة';
    
    if (formData.premium_amount && parseFloat(formData.premium_amount) <= 0) {
      newErrors.premium_amount = 'قيمة القسط يجب أن تكون أكبر من صفر';
    }

    if (formData.start_date && formData.expiry_date) {
      if (new Date(formData.expiry_date) <= new Date(formData.start_date)) {
        newErrors.expiry_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiShield className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {insurance ? 'تعديل بوليصة التأمين' : 'إضافة بوليصة تأمين جديدة'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {insurance ? 'تحديث بيانات البوليصة' : 'إضافة بوليصة تأمين جديدة للمركبة'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المركبة <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vehicle_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر المركبة</option>
                {vehicles?.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
              {errors.vehicle_id && <p className="text-red-500 text-sm mt-1">{errors.vehicle_id}</p>}
            </div>

            {/* Insurance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع التأمين <span className="text-red-500">*</span>
              </label>
              <select
                name="insurance_type"
                value={formData.insurance_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="comprehensive">شامل</option>
                <option value="third_party">ضد الغير</option>
              </select>
            </div>

            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم البوليصة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.policy_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل رقم البوليصة"
              />
              {errors.policy_number && <p className="text-red-500 text-sm mt-1">{errors.policy_number}</p>}
            </div>

            {/* Insurance Company */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شركة التأمين <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="insurance_company"
                value={formData.insurance_company}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.insurance_company ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل اسم شركة التأمين"
              />
              {errors.insurance_company && <p className="text-red-500 text-sm mt-1">{errors.insurance_company}</p>}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البدء <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الانتهاء <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expiry_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiry_date && <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>}
            </div>

            {/* Premium Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قيمة القسط (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premium_amount"
                value={formData.premium_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.premium_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.premium_amount && <p className="text-red-500 text-sm mt-1">{errors.premium_amount}</p>}
            </div>

            {/* Coverage Details */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تفاصيل التغطية
              </label>
              <textarea
                name="coverage_details"
                value={formData.coverage_details}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل تفاصيل التغطية التأمينية..."
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
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل أي ملاحظات إضافية..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              {insurance ? 'تحديث البوليصة' : 'إضافة البوليصة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceModal;
