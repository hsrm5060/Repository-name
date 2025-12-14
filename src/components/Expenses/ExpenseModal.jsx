import { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiFileText } from 'react-icons/fi';

const ExpenseModal = ({ isOpen, onClose, onSave, expense, vehicles, drivers }) => {
  const [formData, setFormData] = useState({
    category: 'fuel',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    vehicle_id: '',
    driver_id: '',
    description: '',
    payment_method: 'cash',
    paid_to: '',
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || 'fuel',
        amount: expense.amount || '',
        expense_date: expense.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        vehicle_id: expense.vehicle_id || '',
        driver_id: expense.driver_id || '',
        description: expense.description || '',
        payment_method: expense.payment_method || 'cash',
        paid_to: expense.paid_to || '',
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const categoryLabels = {
    fuel: 'وقود',
    maintenance: 'صيانة',
    insurance: 'تأمين',
    license: 'رخص',
    fine: 'غرامات',
    salary: 'رواتب',
    rent: 'إيجار',
    other: 'أخرى'
  };

  const paymentMethods = {
    cash: 'نقدي',
    bank_transfer: 'تحويل بنكي',
    credit_card: 'بطاقة ائتمان',
    check: 'شيك'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiDollarSign className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {expense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  {expense ? 'تحديث بيانات المصروف' : 'إضافة مصروف جديد للنظام'}
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
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (ر.س) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ المصروف <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.entries(paymentMethods).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المركبة (اختياري)
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">-- اختر مركبة --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السائق (اختياري)
              </label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">-- اختر سائق --</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Paid To */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدفوع لـ
              </label>
              <input
                type="text"
                name="paid_to"
                value={formData.paid_to}
                onChange={handleChange}
                placeholder="اسم الجهة أو الشخص"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
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
                placeholder="وصف تفصيلي للمصروف..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {expense ? 'تحديث المصروف' : 'إضافة المصروف'}
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

export default ExpenseModal;
