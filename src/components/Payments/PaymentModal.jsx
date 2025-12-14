import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const PaymentModal = ({ isOpen, onClose, onSave, payment }) => {
  const { drivers } = useSelector((state) => state.drivers);
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    amount: 500,
    plan: 'weekly',
    status: 'pending',
    due_date: '',
    paid_date: null,
    payment_method: null,
    notes: ''
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        driver_id: payment.driver_id || '',
        driver_name: payment.driver_name || '',
        amount: payment.amount || 500,
        plan: payment.plan || 'weekly',
        status: payment.status || 'pending',
        due_date: payment.due_date || '',
        paid_date: payment.paid_date || null,
        payment_method: payment.payment_method || null,
        notes: payment.notes || ''
      });
    } else {
      const today = new Date();
      const nextWeek = new Date(today.setDate(today.getDate() + 7));
      setFormData({
        driver_id: '',
        driver_name: '',
        amount: 500,
        plan: 'weekly',
        status: 'pending',
        due_date: nextWeek.toISOString().split('T')[0],
        paid_date: null,
        payment_method: null,
        notes: ''
      });
    }
  }, [payment, isOpen]);

  const handleDriverChange = (e) => {
    const driver_id = parseInt(e.target.value);
    const driver = drivers.find(d => d.id === driver_id);
    setFormData({
      ...formData,
      driver_id,
      driver_name: driver ? driver.name : '',
    });
  };

  const handlePlanChange = (e) => {
    const plan = e.target.value;
    let amount = 500;
    if (plan === 'monthly') amount = 2000;
    if (plan === 'yearly') amount = 20000;
    
    setFormData({
      ...formData,
      plan,
      amount
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {payment ? 'تعديل الدفعة' : 'إضافة دفعة جديدة'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">السائق *</label>
                  <select
                    value={formData.driver_id}
                    onChange={handleDriverChange}
                    className="input-field"
                    required
                  >
                    <option value="">اختر السائق</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">خطة الدفع *</label>
                  <select
                    value={formData.plan}
                    onChange={handlePlanChange}
                    className="input-field"
                    required
                  >
                    <option value="weekly">أسبوعي - 500 ر.س</option>
                    <option value="monthly">شهري - 2000 ر.س</option>
                    <option value="yearly">سنوي - 20000 ر.س</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ (ر.س) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                    <option value="overdue">متأخر</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary py-3">
                  {payment ? 'حفظ التعديلات' : 'إضافة الدفعة'}
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

export default PaymentModal;
