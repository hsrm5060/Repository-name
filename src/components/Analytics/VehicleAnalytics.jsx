import { FiTruck, FiCheckCircle, FiClock, FiAlertCircle, FiTool } from 'react-icons/fi';

const VehicleAnalytics = ({ vehicles, period }) => {
  // تحليل حالات المركبات
  const statusAnalysis = {
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length
  };

  // تحليل حسب النوع
  const typeAnalysis = vehicles.reduce((acc, vehicle) => {
    const make = vehicle.make;
    acc[make] = (acc[make] || 0) + 1;
    return acc;
  }, {});

  // تحليل حسب السنة
  const currentYear = new Date().getFullYear();
  const ageAnalysis = {
    new: vehicles.filter(v => currentYear - v.year <= 2).length,
    medium: vehicles.filter(v => currentYear - v.year > 2 && currentYear - v.year <= 5).length,
    old: vehicles.filter(v => currentYear - v.year > 5).length
  };

  // المركبات المعينة
  const assignmentAnalysis = {
    assigned: vehicles.filter(v => v.assignedDriver).length,
    unassigned: vehicles.filter(v => !v.assignedDriver).length
  };

  return (
    <div className="space-y-6">
      {/* نظرة عامة */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">تحليل المركبات</h3>
        <p className="text-gray-600">تحليل شامل لحالة وأداء المركبات</p>
      </div>

      {/* إحصائيات الحالة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">مركبات نشطة</p>
              <p className="text-3xl font-bold text-green-600">{statusAnalysis.active}</p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.active / vehicles.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.active / vehicles.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <FiTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">قيد الصيانة</p>
              <p className="text-3xl font-bold text-yellow-600">{statusAnalysis.maintenance}</p>
            </div>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.maintenance / vehicles.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.maintenance / vehicles.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">غير نشطة</p>
              <p className="text-3xl font-bold text-red-600">{statusAnalysis.inactive}</p>
            </div>
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.inactive / vehicles.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.inactive / vehicles.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>
      </div>

      {/* تحليل التعيين */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">حالة التعيين</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">مركبات معينة</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{assignmentAnalysis.assigned}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-gray-400 p-2 rounded-lg">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">مركبات غير معينة</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">{assignmentAnalysis.unassigned}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${(assignmentAnalysis.assigned / vehicles.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {((assignmentAnalysis.assigned / vehicles.length) * 100).toFixed(1)}% من المركبات معينة
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع حسب العمر</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <FiTruck className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">جديدة (0-2 سنة)</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{ageAnalysis.new}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600 p-2 rounded-lg">
                  <FiTruck className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">متوسطة (3-5 سنوات)</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{ageAnalysis.medium}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <FiTruck className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">قديمة (+5 سنوات)</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{ageAnalysis.old}</span>
            </div>
          </div>
        </div>
      </div>

      {/* توزيع حسب الماركة */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع المركبات حسب الماركة</h4>
        <div className="space-y-3">
          {Object.entries(typeAnalysis)
            .sort(([, a], [, b]) => b - a)
            .map(([make, count]) => (
              <div key={make}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{make}</span>
                  <span className="font-semibold text-blue-600">
                    {count} ({((count / vehicles.length) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(count / vehicles.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ملخص الحالة */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">ملخص الحالة</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{vehicles.length}</p>
            <p className="text-sm text-gray-600 mt-1">إجمالي المركبات</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {((statusAnalysis.active / vehicles.length) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">معدل التشغيل</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {((assignmentAnalysis.assigned / vehicles.length) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">معدل التعيين</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {(vehicles.reduce((sum, v) => sum + v.year, 0) / vehicles.length).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">متوسط السنة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleAnalytics;
