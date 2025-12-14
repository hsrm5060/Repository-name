import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { markPaymentAsPaid, fetchPayments } from '../../store/slices/paymentsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiDollarSign, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MarkAsPaidModal = ({ isOpen, onClose, payment }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payment) return;

    setLoading(true);
    try {
      await dispatch(markPaymentAsPaid({
        id: payment.id,
        data: {
          paid_date: paidDate,
          payment_method: paymentMethod,
          notes: notes
        }
      })).unwrap();
      
      toast.success('تم تحديث حالة الدفع بنجاح');
      dispatch(fetchPayments());
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث حالة الدفع');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'card': return 'بطاقة';
      case 'check': return 'شيك';
      default: return method;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="bg-gradient-to-l from-green-500 to-green-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-xl" />
                </div>
                <h2 className="text-xl font-bold">تحديد كمدفوع</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* تفاصيل الدفعة */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" /> تفاصيل الدفعة
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">السائق:</span>
                    <span className="font-medium text-gray-800">{payment.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبلغ:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {parseFloat(payment.amount || 0).toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الاستحقاق:</span>
                    <span className="font-medium text-gray-800">{payment.due_date}</span>
                  </div>
                </div>
              </div>

              {/* تاريخ الدفع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-gray-400" /> تاريخ الدفع
                </label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* طريقة الدفع */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiCreditCard className="text-gray-400" /> طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="cash">💵 نقدي</option>
                  <option value="bank_transfer">🏦 تحويل بنكي</option>
                  <option value="card">💳 بطاقة</option>
                  <option value="check">📝 شيك</option>
                </select>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              {/* الأزرار */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <FiCheckCircle />
                  )}
                  {loading ? 'جاري الحفظ...' : 'تأكيد الدفع'}
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={loading}
                  className="flex-1 btn-secondary py-3"
                >
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

export default MarkAsPaidModal;
