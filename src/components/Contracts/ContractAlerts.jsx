import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiX, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ContractAlerts = ({ ownershipVehicles, payments, onDismiss }) => {
  const navigate = useNavigate();

  const alerts = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const alertsList = [];

    // تنبيهات عقود التمليك
    ownershipVehicles.forEach(ownership => {
      if (ownership.status !== 'active') return;
      
      const endDate = new Date(ownership.end_date);
      
      // عقد ينتهي خلال 7 أيام
      if (endDate <= sevenDaysLater && endDate > today) {
        alertsList.push({
          id: `ownership-urgent-${ownership.id}`,
          type: 'urgent',
          category: 'ownership',
          title: 'عقد تمليك ينتهي قريباً جداً!',
          message: `عقد ${ownership.driver_name} ينتهي في ${ownership.end_date}`,
          daysLeft: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
          data: ownership,
        });
      }
      // عقد ينتهي خلال 30 يوم
      else if (endDate <= thirtyDaysLater && endDate > sevenDaysLater) {
        alertsList.push({
          id: `ownership-warning-${ownership.id}`,
          type: 'warning',
          category: 'ownership',
          title: 'عقد تمليك قريب من الانتهاء',
          message: `عقد ${ownership.driver_name} ينتهي في ${ownership.end_date}`,
          daysLeft: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
          data: ownership,
        });
      }
      
      // عقد منتهي
      if (endDate < today) {
        alertsList.push({
          id: `ownership-expired-${ownership.id}`,
          type: 'expired',
          category: 'ownership',
          title: 'عقد تمليك منتهي!',
          message: `عقد ${ownership.driver_name} انتهى في ${ownership.end_date}`,
          daysLeft: Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) * -1,
          data: ownership,
        });
      }

      // أقساط متأخرة
      if (parseFloat(ownership.remaining_amount) > 0) {
        const expectedPaid = parseFloat(ownership.total_price) - parseFloat(ownership.remaining_amount);
        const actualPaid = parseFloat(ownership.paid_amount || 0) + parseFloat(ownership.down_payment || 0);
        if (actualPaid < expectedPaid * 0.9) { // متأخر بأكثر من 10%
          alertsList.push({
            id: `ownership-overdue-${ownership.id}`,
            type: 'overdue',
            category: 'ownership',
            title: 'أقساط متأخرة',
            message: `${ownership.driver_name} لديه أقساط متأخرة - المتبقي: ${parseFloat(ownership.remaining_amount).toLocaleString()} ر.س`,
            data: ownership,
          });
        }
      }
    });

    // تنبيهات مدفوعات الإيجار المتأخرة
    const overduePayments = payments.filter(p => p.status === 'overdue' || 
      (p.status === 'pending' && new Date(p.due_date) < today));
    
    // تجميع حسب السائق
    const overdueByDriver = {};
    overduePayments.forEach(p => {
      if (!overdueByDriver[p.driver_id]) {
        overdueByDriver[p.driver_id] = {
          driver_name: p.driver_name,
          count: 0,
          total: 0,
        };
      }
      overdueByDriver[p.driver_id].count++;
      overdueByDriver[p.driver_id].total += parseFloat(p.amount || 0);
    });

    Object.entries(overdueByDriver).forEach(([driverId, data]) => {
      alertsList.push({
        id: `rental-overdue-${driverId}`,
        type: 'overdue',
        category: 'rental',
        title: 'دفعات إيجار متأخرة',
        message: `${data.driver_name} لديه ${data.count} دفعة متأخرة بإجمالي ${data.total.toLocaleString()} ر.س`,
        data: { driver_id: driverId, ...data },
      });
    });

    // ترتيب حسب الأهمية
    const priority = { expired: 0, urgent: 1, overdue: 2, warning: 3 };
    return alertsList.sort((a, b) => priority[a.type] - priority[b.type]);
  }, [ownershipVehicles, payments]);

  if (alerts.length === 0) return null;

  const getAlertStyle = (type) => {
    switch (type) {
      case 'expired':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'urgent':
        return 'bg-orange-50 border-orange-300 text-orange-800';
      case 'overdue':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'expired':
      case 'overdue':
        return <FiAlertTriangle className="text-red-500 text-xl" />;
      case 'urgent':
        return <FiAlertTriangle className="text-orange-500 text-xl animate-pulse" />;
      case 'warning':
        return <FiClock className="text-yellow-500 text-xl" />;
      default:
        return <FiClock className="text-gray-500 text-xl" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FiAlertTriangle className="text-orange-500" />
          تنبيهات العقود ({alerts.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center justify-between p-4 rounded-xl border-2 ${getAlertStyle(alert.type)}`}
          >
            <div className="flex items-center gap-3">
              {getAlertIcon(alert.type)}
              <div>
                <p className="font-bold">{alert.title}</p>
                <p className="text-sm opacity-80">{alert.message}</p>
                {alert.daysLeft !== undefined && (
                  <p className="text-xs mt-1">
                    {alert.daysLeft > 0 
                      ? `متبقي ${alert.daysLeft} يوم` 
                      : `متأخر ${Math.abs(alert.daysLeft)} يوم`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(alert.category === 'ownership' ? '/ownership-vehicles' : '/payments')}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="عرض التفاصيل"
              >
                <FiChevronLeft />
              </button>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  title="إخفاء"
                >
                  <FiX />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ContractAlerts;
