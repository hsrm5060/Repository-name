import { useState, useEffect } from 'react';
import { FiX, FiCreditCard } from 'react-icons/fi';

const LicenseModal = ({ isOpen, onClose, onSave, license, licenseCategory, drivers, vehicles }) => {
  const [formData, setFormData] = useState({
    category: licenseCategory || 'driver',
    driver_id: '',
    vehicle_id: '',
    license_number: '',
    license_type: 'private',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    issuing_authority: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (license) {
      setFormData({
        category: license.license_category || 'driver',
        driver_id: license.driver_id || '',
        vehicle_id: license.vehicle_id || '',
        license_number: license.license_number || '',
        license_type: license.license_type || 'private',
        issue_date: license.issue_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiry_date: license.expiry_date?.split('T')[0] || '',
        issuing_authority: license.issuing_authority || '',
        notes: license.notes || ''
      });
    } else {
      setFormData({
        category: licenseCategory || 'driver',
        driver_id: '',
        vehicle_id: '',
        license_number: '',
        license_type: 'private',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        issuing_authority: '',
        notes: ''
      });
    }
    setErrors({});
  }, [license, licenseCategory, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (formData.category === 'driver') {
      if (!formData.driver_id) newErrors.driver_id = 'السائق مطلوب';
      if (!formData.license_type) newErrors.license_type = 'نوع الرخصة مطلوب';
    } else {
      if (!formData.vehicle_id) newErrors.vehicle_id = 'المركبة مطلوبة';
    }

    if (!formData.license_number) newErrors.license_number = 'رقم الرخصة مطلوب';
    if (!formData.issue_date) newErrors.issue_date = 'تاريخ الإصدار مطلوب';
    if (!formData.expiry_date) newErrors.expiry_date = 'تاريخ الانتهاء مطلوب';

    if (formData.issue_date && formData.expiry_date) {
      if (new Date(formData.expiry_date) <= new Date(formData.issue_date)) {
        newErrors.expiry_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ الإصدار';
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  const licenseTypeLabels = {
    private: 'خاصة',
    public: 'عامة',
    heavy: 'نقل ثقيل',
    motorcycle: 'دراجة نارية'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiCreditCard className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {license ? 'تعديل الرخصة' : `إضافة ${formData.category === 'driver' ? 'رخصة قيادة' : 'رخصة مركبة'} جديدة`}
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  {license ? 'تحديث بيانات الرخصة' : `إضافة ${formData.category === 'driver' ? 'رخصة قيادة' : 'رخصة مركبة'} جديدة`}
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

        {/* Category Selector (only for new licenses) */}
        {!license && (
          <div className="p-6 bg-purple-50 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع الرخصة <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'driver' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'driver'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">رخصة قيادة</div>
                <div className="text-sm text-gray-600">للسائقين</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: 'vehicle' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'vehicle'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">رخصة مركبة</div>
                <div className="text-sm text-gray-600">استمارة المركبة</div>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Driver or Vehicle Selection */}
            {formData.category === 'driver' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السائق <span className="text-red-500">*</span>
                </label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.driver_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر السائق</option>
                  {drivers?.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
                {errors.driver_id && <p className="text-red-500 text-sm mt-1">{errors.driver_id}</p>}
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المركبة <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
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
            )}

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الرخصة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.license_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل رقم الرخصة"
              />
              {errors.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number}</p>}
            </div>

            {/* License Type (only for driver licenses) */}
            {formData.category === 'driver' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الرخصة <span className="text-red-500">*</span>
                </label>
                <select
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.license_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Object.entries(licenseTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.license_type && <p className="text-red-500 text-sm mt-1">{errors.license_type}</p>}
              </div>
            )}

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الإصدار <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.issue_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.issue_date && <p className="text-red-500 text-sm mt-1">{errors.issue_date}</p>}
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.expiry_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiry_date && <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>}
            </div>

            {/* Issuing Authority */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجهة المصدرة
              </label>
              <input
                type="text"
                name="issuing_authority"
                value={formData.issuing_authority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="أدخل اسم الجهة المصدرة"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg"
            >
              {license ? 'تحديث الرخصة' : 'إضافة الرخصة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicenseModal;
