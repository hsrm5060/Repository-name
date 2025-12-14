import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiCalendar, FiDollarSign, FiX } from 'react-icons/fi';

const PaymentAlerts = ({ payments, onClose, onPaymentClick }) => {
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overduePayments = payments.filter(p => p.status === 'overdue');
    const todayPayments = payments.filter(p => {
      if (p.status === 'paid' || p.status === 'completed') return false;
      const dueDate = new Date(p.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    
    const weekPayments = payments.filter(p => {
      if (p.status === 'paid' || p.status === 'completed' || p.status === 'overdue') return false;
      const dueDate = new Date(p.due_date);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      return dueDate > today && dueDate <= weekFromNow;
    });

    return {
      overdue: overduePayments,
      today: todayPayments,
      week: weekPayments,
      overdueTotal: overduePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      todayTotal: todayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      weekTotal: weekPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    };
  }, [payments]);

  const hasAlerts = alerts.overdue.length > 0 || alerts.today.length > 0;

  if (!hasAlerts) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* تنبيه المدفوعات المتأخرة */}
      {alerts.overdue.length > 0 && (
        <div className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-lg">
                  ⚠️ {alerts.overdue.length} مدفوعات متأخرة!
                </h3>
                <p className="text-red-600 mt-1">
                  إجمالي المبلغ المتأخر: <span className="font-bold">{alerts.overdueTotal.toLocaleString()} ر.س</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {alerts.overdue.slice(0, 5).map(p => (
                    <button
                      key={p.id}
                      onClick={() => onPaymentClick && onPaymentClick(p)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-sm transition-colors"
                    >
                      {p.driver_name} - {parseFloat(p.amount).toLocaleString()} ر.س
                    </button>
                  ))}
                  {alerts.overdue.length > 5 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      +{alerts.overdue.length - 5} أخرى
                    </span>
                  )}
                </div>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-red-400 hover:text-red-600">
                <FiX />
              </button>
            )}
          </div>
        </div>
      )}

      {/* تنبيه مدفوعات اليوم */}
      {alerts.today.length > 0 && (
        <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiClock className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 text-lg">
                📅 {alerts.today.length} مدفوعات مستحقة اليوم
              </h3>
              <p className="text-yellow-600 mt-1">
                إجمالي: <span className="font-bold">{alerts.todayTotal.toLocaleString()} ر.س</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {alerts.today.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => onPaymentClick && onPaymentClick(p)}
                    className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full text-sm transition-colors"
                  >
                    {p.driver_name} - {parseFloat(p.amount).toLocaleString()} ر.س
                  </button>
                ))}
                {alerts.today.length > 5 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    +{alerts.today.length - 5} أخرى
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تنبيه مدفوعات الأسبوع */}
      {alerts.week.length > 0 && (
        <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCalendar className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800">
                📆 {alerts.week.length} مدفوعات مستحقة خلال الأسبوع
              </h3>
              <p className="text-blue-600 mt-1">
                إجمالي: <span className="font-bold">{alerts.weekTotal.toLocaleString()} ر.س</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentAlerts;
