import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiUser, FiDollarSign, FiCalendar, FiClock, FiCheckCircle,
  FiAlertCircle, FiTruck, FiPhone, FiMail, FiPrinter, FiEdit2,
  FiCreditCard, FiFileText, FiRefreshCw
} from 'react-icons/fi';
import { paymentsAPI } from '../../services/api';

const PaymentDetailsModal = ({ isOpen, onClose, payment, onEdit, onMarkAsPaid, onPrint }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && payment?.id) {
      fetchDetails();
    }
  }, [isOpen, payment?.id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await paymentsAPI.getById(payment.id);
      setDetails(response.data);
    } catch (error) {
      console.error('خطأ في جلب التفاصيل:', error);
      setDetails(payment);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const data = details || payment;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': case 'completed': return 'مدفوع';
      case 'pending': return 'معلق';
      case 'overdue': return 'متأخر';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': case 'completed': return <FiCheckCircle className="text-green-600" />;
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'overdue': return <FiAlertCircle className="text-red-600" />;
      default: return <FiClock className="text-gray-600" />;
    }
  };

  const getPlanText = (plan) => {
    switch (plan) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      case 'yearly': return 'سنوي';
      default: return plan;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'card': return 'بطاقة';
      case 'check': return 'شيك';
      default: return method || '-';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-primary-600 to-primary-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiDollarSign className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">تفاصيل الدفعة #{data?.id}</h2>
                  <p className="text-primary-100 text-sm">{getPlanText(data?.plan)}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white p-2">
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <FiRefreshCw className="animate-spin text-3xl text-primary-600" />
            </div>
          ) : (
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* الحالة */}
              <div className="flex items-center justify-center mb-6">
                <div className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 ${getStatusColor(data?.status)}`}>
                  {getStatusIcon(data?.status)}
                  <span className="font-bold text-lg">{getStatusText(data?.status)}</span>
                </div>
              </div>

              {/* المبلغ */}
              <div className="text-center mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm mb-1">المبلغ المستحق</p>
                <p className="text-4xl font-bold text-gray-800">
                  {parseFloat(data?.amount || 0).toLocaleString()} <span className="text-lg">ر.س</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* معلومات السائق */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiUser className="text-blue-600" /> معلومات السائق
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{data?.driver_name || '-'}</p>
                    {data?.driver_phone && (
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <FiPhone className="text-gray-400" /> {data.driver_phone}
                      </p>
                    )}
                    {data?.driver_email && (
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <FiMail className="text-gray-400" /> {data.driver_email}
                      </p>
                    )}
                  </div>
                </div>

                {/* معلومات المركبة */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiTruck className="text-green-600" /> معلومات المركبة
                  </h3>
                  <div className="space-y-2">
                    {data?.vehicle_plate ? (
                      <>
                        <p className="text-gray-700 font-medium">{data.vehicle_plate}</p>
                        {data?.vehicle_make && (
                          <p className="text-gray-600 text-sm">
                            {data.vehicle_make} {data.vehicle_model}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">غير محدد</p>
                    )}
                  </div>
                </div>

                {/* تاريخ الاستحقاق */}
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiCalendar className="text-yellow-600" /> تاريخ الاستحقاق
                  </h3>
                  <p className="text-gray-700 font-medium text-lg">{data?.due_date || '-'}</p>
                </div>

                {/* تاريخ الدفع */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-purple-600" /> تاريخ الدفع
                  </h3>
                  <p className="text-gray-700 font-medium text-lg">
                    {data?.paid_date || 'لم يتم الدفع بعد'}
                  </p>
                  {data?.payment_method && (
                    <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                      <FiCreditCard className="text-gray-400" />
                      {getPaymentMethodText(data.payment_method)}
                    </p>
                  )}
                </div>
              </div>

              {/* الملاحظات */}
              {data?.notes && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FiFileText className="text-gray-600" /> ملاحظات
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}

              {/* سجل الدفعات */}
              {data?.history && data.history.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold text-gray-800 mb-3">سجل الدفعات</h3>
                  <div className="space-y-2">
                    {data.history.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-700">{h.paid_date}</p>
                          <p className="text-sm text-gray-500">{getPaymentMethodText(h.payment_method)}</p>
                        </div>
                        <p className="font-bold text-green-600">{parseFloat(h.amount).toLocaleString()} ر.س</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t p-4 bg-gray-50 flex flex-wrap gap-2 justify-end">
            {data?.status !== 'paid' && data?.status !== 'completed' && (
              <button
                onClick={() => onMarkAsPaid && onMarkAsPaid(data)}
                className="btn-primary flex items-center gap-2"
              >
                <FiCheckCircle /> تحديد كمدفوع
              </button>
            )}
            <button
              onClick={() => onEdit && onEdit(data)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiEdit2 /> تعديل
            </button>
            <button
              onClick={() => onPrint && onPrint(data)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiPrinter /> طباعة إيصال
            </button>
            <button onClick={onClose} className="btn-secondary">
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentDetailsModal;
