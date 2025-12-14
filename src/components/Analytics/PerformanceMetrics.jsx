import { FiTrendingUp, FiTrendingDown, FiMinus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PerformanceMetrics = ({ stats, period, detailed = false }) => {
  // حساب مؤشرات الأداء
  const metrics = {
    driverUtilization: ((stats.activeDrivers / stats.totalDrivers) * 100).toFixed(1),
    vehicleUtilization: ((stats.activeVehicles / stats.totalVehicles) * 100).toFixed(1),
    debtRecoveryRate: ((stats.paidDebts / stats.totalDebts) * 100).toFixed(1),
    contractCompletionRate: ((stats.completedContracts / stats.ownershipContracts) * 100).toFixed(1)
  };

  const getTrendIcon = (value) => {
    if (value > 75) return <FiTrendingUp className="w-5 h-5 text-green-600" />;
    if (value > 50) return <FiMinus className="w-5 h-5 text-yellow-600" />;
    return <FiTrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (value) => {
    if (value > 75) return 'text-green-600';
    if (value > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">مؤشرات الأداء الرئيسية (KPIs)</h3>
        <p className="text-gray-600 mb-6">تحليل شامل لأداء النظام خلال {period === 'week' ? 'الأسبوع' : period === 'month' ? 'الشهر' : period === 'quarter' ? '3 أشهر' : 'السنة'} الماضية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* معدل استخدام السائقين */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">معدل استخدام السائقين</h4>
            {getTrendIcon(metrics.driverUtilization)}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className={`text-4xl font-bold ${getStatusColor(metrics.driverUtilization)}`}>
              {metrics.driverUtilization}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.driverUtilization > 75 ? 'bg-green-600' :
                metrics.driverUtilization > 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${metrics.driverUtilization}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.activeDrivers} من {stats.totalDrivers} سائق نشط
          </p>
        </div>

        {/* معدل استخدام المركبات */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">معدل استخدام المركبات</h4>
            {getTrendIcon(metrics.vehicleUtilization)}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className={`text-4xl font-bold ${getStatusColor(metrics.vehicleUtilization)}`}>
              {metrics.vehicleUtilization}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.vehicleUtilization > 75 ? 'bg-green-600' :
                metrics.vehicleUtilization > 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${metrics.vehicleUtilization}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.activeVehicles} من {stats.totalVehicles} مركبة نشطة
          </p>
        </div>

        {/* معدل استرداد الديون */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">معدل استرداد الديون</h4>
            {getTrendIcon(metrics.debtRecoveryRate)}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className={`text-4xl font-bold ${getStatusColor(metrics.debtRecoveryRate)}`}>
              {metrics.debtRecoveryRate}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.debtRecoveryRate > 75 ? 'bg-green-600' :
                metrics.debtRecoveryRate > 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${metrics.debtRecoveryRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.paidDebts.toLocaleString()} من {stats.totalDebts.toLocaleString()} ر.س
          </p>
        </div>

        {/* معدل إكمال عقود التمليك */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">معدل إكمال التمليك</h4>
            {getTrendIcon(metrics.contractCompletionRate)}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className={`text-4xl font-bold ${getStatusColor(metrics.contractCompletionRate)}`}>
              {metrics.contractCompletionRate}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.contractCompletionRate > 75 ? 'bg-green-600' :
                metrics.contractCompletionRate > 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${metrics.contractCompletionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.completedContracts} من {stats.ownershipContracts} عقد مكتمل
          </p>
        </div>
      </div>

      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* تقييم الأداء العام */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-blue-600" />
              تقييم الأداء العام
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">الأداء الإجمالي:</span>
                <span className="font-bold text-blue-600">
                  {((parseFloat(metrics.driverUtilization) + parseFloat(metrics.vehicleUtilization) + 
                     parseFloat(metrics.debtRecoveryRate) + parseFloat(metrics.contractCompletionRate)) / 4).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">الحالة:</span>
                <span className={`font-semibold ${
                  ((parseFloat(metrics.driverUtilization) + parseFloat(metrics.vehicleUtilization) + 
                    parseFloat(metrics.debtRecoveryRate) + parseFloat(metrics.contractCompletionRate)) / 4) > 75
                    ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {((parseFloat(metrics.driverUtilization) + parseFloat(metrics.vehicleUtilization) + 
                     parseFloat(metrics.debtRecoveryRate) + parseFloat(metrics.contractCompletionRate)) / 4) > 75
                    ? 'ممتاز' : 'جيد'}
                </span>
              </div>
            </div>
          </div>

          {/* التوصيات */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 border-orange-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-orange-600" />
              التوصيات
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {metrics.driverUtilization < 75 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>زيادة معدل استخدام السائقين من خلال تعيين المزيد من الرحلات</span>
                </li>
              )}
              {metrics.vehicleUtilization < 75 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>تحسين استخدام المركبات المتاحة</span>
                </li>
              )}
              {metrics.debtRecoveryRate < 75 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>متابعة الديون المتأخرة وتحسين معدل الاسترداد</span>
                </li>
              )}
              {metrics.contractCompletionRate < 75 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>متابعة عقود التمليك المتعثرة</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
