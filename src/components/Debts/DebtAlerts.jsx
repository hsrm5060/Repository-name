import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiClock, FiDollarSign, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { debtsAPI } from '../../services/api';

const DEBT_TYPES = {
  advance: { label: 'سلفة', color: 'text-blue-600' },
  loan: { label: 'قرض', color: 'text-purple-600' },
  violation: { label: 'مخالفات', color: 'text-red-600' },
  maintenance: { label: 'صيانة', color: 'text-orange-600' },
  insurance: { label: 'تأمين', color: 'text-green-600' },
  fuel: { label: 'وقود', color: 'text-yellow-600' },
  other: { label: 'أخرى', color: 'text-gray-600' }
};

const DebtAlerts = ({ onPayClick }) => {
  const [alerts, setAlerts] = useState({ upcoming: [], overdue: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await debtsAPI.getAlerts();
      setAlerts(response.data || { upcoming: [], overdue: [], stats: {} });
    } catch (error) {
      console.error('Error fetching debt alerts:', error);
      // في حالة الخطأ، نضع قيم فارغة
      setAlerts({ upcoming: [], overdue: [], stats: {} });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const hasAlerts = alerts.overdue?.length > 0 || alerts.upcoming?.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-gray-900">تنبيهات الأقساط</h3>
            <p className="text-sm text-gray-600">
              {alerts.stats?.overdue_count > 0 && (
                <span className="text-red-600 font-medium">
                  {alerts.stats.overdue_count} قسط متأخر
                </span>
              )}
              {alerts.stats?.overdue_count > 0 && alerts.stats?.upcoming_count > 0 && ' • '}
              {alerts.stats?.upcoming_count > 0 && (
                <span className="text-orange-600">
                  {alerts.stats.upcoming_count} قسط قادم
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {alerts.stats?.overdue_amount > 0 && (
            <div className="text-left">
              <p className="text-xs text-gray-500">إجمالي المتأخر</p>
              <p className="text-lg font-bold text-red-600">
                {parseFloat(alerts.stats.overdue_amount || 0).toLocaleString()} ر.س
              </p>
            </div>
          )}
          {expanded ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* الأقساط المتأخرة */}
          {alerts.overdue?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" />
                أقساط متأخرة ({alerts.overdue.length})
              </h4>
              <div className="space-y-2">
                {alerts.overdue.slice(0, 5).map((installment) => {
                  const debtType = DEBT_TYPES[installment.debt_type] || DEBT_TYPES.other;
                  return (
                    <div
                      key={installment.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <FiDollarSign className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {installment.driver_name}
                            <span className={`text-xs mr-2 ${debtType.color}`}>
                              ({debtType.label})
                            </span>
                          </p>
                          <p className="text-xs text-red-600">
                            متأخر منذ {installment.days_overdue} يوم
                            {installment.vehicle_plate && ` • ${installment.vehicle_plate}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-red-600">
                          {parseFloat(installment.amount).toLocaleString()} ر.س
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(installment.due_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {alerts.overdue.length > 5 && (
                  <p className="text-xs text-center text-gray-500">
                    و {alerts.overdue.length - 5} قسط آخر...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* الأقساط القادمة */}
          {alerts.upcoming?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                أقساط مستحقة قريباً ({alerts.upcoming.length})
              </h4>
              <div className="space-y-2">
                {alerts.upcoming.slice(0, 5).map((installment) => {
                  const debtType = DEBT_TYPES[installment.debt_type] || DEBT_TYPES.other;
                  const isToday = installment.days_until_due === 0;
                  const isUrgent = installment.days_until_due <= 3;
                  
                  return (
                    <div
                      key={installment.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isToday 
                          ? 'bg-red-50 border-red-200' 
                          : isUrgent 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isToday ? 'bg-red-100' : isUrgent ? 'bg-orange-100' : 'bg-yellow-100'
                        }`}>
                          <FiClock className={`w-4 h-4 ${
                            isToday ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {installment.driver_name}
                            <span className={`text-xs mr-2 ${debtType.color}`}>
                              ({debtType.label})
                            </span>
                          </p>
                          <p className={`text-xs ${
                            isToday ? 'text-red-600 font-medium' : isUrgent ? 'text-orange-600' : 'text-yellow-600'
                          }`}>
                            {isToday ? 'مستحق اليوم!' : `خلال ${installment.days_until_due} يوم`}
                            {installment.vehicle_plate && ` • ${installment.vehicle_plate}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${
                          isToday ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          {parseFloat(installment.amount).toLocaleString()} ر.س
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(installment.due_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {alerts.upcoming.length > 5 && (
                  <p className="text-xs text-center text-gray-500">
                    و {alerts.upcoming.length - 5} قسط آخر...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebtAlerts;
