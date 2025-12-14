import { FiUsers, FiCheckCircle, FiClock, FiAlertCircle, FiAward } from 'react-icons/fi';

const DriverAnalytics = ({ drivers, period }) => {
  // تحليل حالات السائقين
  const statusAnalysis = {
    active: drivers.filter(d => d.status === 'active').length,
    inactive: drivers.filter(d => d.status === 'inactive').length,
    suspended: drivers.filter(d => d.status === 'suspended').length
  };

  // تحليل الرخص
  const licenseAnalysis = {
    valid: drivers.filter(d => new Date(d.licenseExpiry) > new Date()).length,
    expiringSoon: drivers.filter(d => {
      const daysUntilExpiry = Math.ceil((new Date(d.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length,
    expired: drivers.filter(d => new Date(d.licenseExpiry) <= new Date()).length
  };

  // أفضل السائقين (حسب التقييم)
  const topDrivers = [...drivers]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* نظرة عامة */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">تحليل السائقين</h3>
        <p className="text-gray-600">تحليل شامل لحالة وأداء السائقين</p>
      </div>

      {/* إحصائيات الحالة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">سائقين نشطين</p>
              <p className="text-3xl font-bold text-green-600">{statusAnalysis.active}</p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.active / drivers.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.active / drivers.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <FiClock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">سائقين غير نشطين</p>
              <p className="text-3xl font-bold text-yellow-600">{statusAnalysis.inactive}</p>
            </div>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.inactive / drivers.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.inactive / drivers.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 p-3 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">سائقين موقوفين</p>
              <p className="text-3xl font-bold text-red-600">{statusAnalysis.suspended}</p>
            </div>
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${(statusAnalysis.suspended / drivers.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {((statusAnalysis.suspended / drivers.length) * 100).toFixed(1)}% من الإجمالي
          </p>
        </div>
      </div>

      {/* تحليل الرخص */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">حالة رخص القيادة</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{licenseAnalysis.valid}</p>
            <p className="text-sm text-gray-600">رخص سارية</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiClock className="w-10 h-10 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600 mb-1">{licenseAnalysis.expiringSoon}</p>
            <p className="text-sm text-gray-600">تنتهي قريباً (30 يوم)</p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiAlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600 mb-1">{licenseAnalysis.expired}</p>
            <p className="text-sm text-gray-600">رخص منتهية</p>
          </div>
        </div>
      </div>

      {/* أفضل السائقين */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiAward className="w-5 h-5 text-yellow-600" />
          أفضل السائقين
        </h4>
        <div className="space-y-3">
          {topDrivers.map((driver, index) => (
            <div key={driver.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-600' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{driver.name}</p>
                <p className="text-sm text-gray-600">{driver.phone}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < (driver.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{driver.rating || 0} / 5</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* توزيع السائقين حسب الحالة */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع السائقين</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">نشط</span>
              <span className="font-semibold text-green-600">{statusAnalysis.active} ({((statusAnalysis.active / drivers.length) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${(statusAnalysis.active / drivers.length) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">غير نشط</span>
              <span className="font-semibold text-yellow-600">{statusAnalysis.inactive} ({((statusAnalysis.inactive / drivers.length) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-600 h-3 rounded-full transition-all"
                style={{ width: `${(statusAnalysis.inactive / drivers.length) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">موقوف</span>
              <span className="font-semibold text-red-600">{statusAnalysis.suspended} ({((statusAnalysis.suspended / drivers.length) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{ width: `${(statusAnalysis.suspended / drivers.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAnalytics;
