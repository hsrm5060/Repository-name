import { useState, useEffect } from 'react';
import { FiX, FiRefreshCw, FiCalendar, FiDollarSign } from 'react-icons/fi';

const RenewInsuranceModal = ({ isOpen, onClose, onRenew, insurance }) => {
  const [formData, setFormData] = useState({
    new_expiry_date: '',
    renewal_cost: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (insurance && isOpen) {
      // Set default new expiry date to 1 year from current expiry
      const currentExpiry = new Date(insurance.expiry_date);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      
      setFormData({
        new_expiry_date: newExpiry.toISOString().split('T')[0],
        renewal_cost: insurance.premium_amount || '',
        notes: ''
      });
      setErrors({});
    }
  }, [insurance, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.new_expiry_date) {
      newErrors.new_expiry_date = 'تاريخ الانتهاء الجديد مطلوب';
    } else {
      const newDate = new Date(formData.new_expiry_date);
      const currentDate = new Date(insurance.expiry_date);
      if (newDate <= currentDate) {
        newErrors.new_expiry_date = 'تاريخ الانتهاء الجديد يجب أن يكون بعد التاريخ الحالي';
      }
    }

    if (formData.renewal_cost && parseFloat(formData.renewal_cost) <= 0) {
      newErrors.renewal_cost = 'تكلفة التجديد يجب أن تكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onRenew(insurance.id, formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !insurance) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiRefreshCw className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">تجديد بوليصة التأمين</h2>
                <p className="text-green-100 text-sm mt-1">
                  تجديد البوليصة رقم: {insurance.policy_number}
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

        {/* Current Info */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-4">البيانات الحالية</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">المركبة</p>
              <p className="font-bold text-gray-900">{insurance.plate_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">شركة التأمين</p>
              <p className="font-bold text-gray-900">{insurance.insurance_company}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ الانتهاء الحالي</p>
              <p className="font-bold text-red-600">
                {new Date(insurance.expiry_date).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">القسط الحالي</p>
              <p className="font-bold text-blue-600">
                {parseFloat(insurance.premium_amount).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* New Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-green-600" />
                  <span>تاريخ الانتهاء الجديد <span className="text-red-500">*</span></span>
                </div>
              </label>
              <input
                type="date"
                name="new_expiry_date"
                value={formData.new_expiry_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.new_expiry_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.new_expiry_date && (
                <p className="text-red-500 text-sm mt-1">{errors.new_expiry_date}</p>
              )}
            </div>

            {/* Renewal Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  <span>تكلفة التجديد (ر.س)</span>
                </div>
              </label>
              <input
                type="number"
                name="renewal_cost"
                value={formData.renewal_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.renewal_cost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.renewal_cost && (
                <p className="text-red-500 text-sm mt-1">{errors.renewal_cost}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                اتركه فارغاً إذا كانت التكلفة نفس القسط السابق
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات التجديد
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أدخل أي ملاحظات حول عملية التجديد..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> سيتم حفظ سجل التجديد في السجل التاريخي، وسيتم تحديث تاريخ انتهاء البوليصة الحالية.
              </p>
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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg flex items-center gap-2"
            >
              <FiRefreshCw />
              تجديد البوليصة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewInsuranceModal;
