import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiAward, FiTool } from 'react-icons/fi';

const FinancialAnalytics = ({ payments, debts, ownershipVehicles, expenses = [], maintenance = [], period }) => {
  // تحليل المدفوعات
  const paymentAnalysis = {
    total: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    completed: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    failed: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  };

  // تحليل الديون
  const debtAnalysis = {
    total: debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0),
    paid: debts.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0),
    remaining: debts.reduce((sum, d) => sum + parseFloat(d.remaining_amount || 0), 0),
    recoveryRate: debts.length > 0 && debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0) > 0
      ? ((debts.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0) / debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0)) * 100).toFixed(1)
      : 0
  };

  // تحليل عقود التمليك
  const ownershipAnalysis = {
    totalValue: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.total_price || 0), 0),
    downPayments: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.down_payment || 0), 0),
    totalPaid: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.paid_amount || 0) + parseFloat(v.down_payment || 0), 0),
    remaining: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.remaining_amount || 0), 0),
    monthlyRevenue: ownershipVehicles
      .filter(v => v.status === 'active')
      .reduce((sum, v) => sum + parseFloat(v.monthly_installment || 0), 0)
  };

  // تحليل المصروفات
  const expenseAnalysis = {
    total: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    count: expenses.length,
    byCategory: {
      fuel: expenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
      maintenance: expenses.filter(e => e.category === 'maintenance').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
      insurance: expenses.filter(e => e.category === 'insurance').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
      salary: expenses.filter(e => e.category === 'salary').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
      other: expenses.filter(e => !['fuel', 'maintenance', 'insurance', 'salary'].includes(e.category)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    }
  };

  // تحليل الصيانة
  const maintenanceAnalysis = {
    total: maintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0),
    count: maintenance.length,
    byType: {
      oil_change: maintenance.filter(m => m.maintenance_type === 'oil_change').length,
      tire_change: maintenance.filter(m => m.maintenance_type === 'tire_change').length,
      brake_service: maintenance.filter(m => m.maintenance_type === 'brake_service').length,
      other: maintenance.filter(m => !['oil_change', 'tire_change', 'brake_service'].includes(m.maintenance_type)).length
    }
  };

  // الإيرادات الإجمالية
  const totalRevenue = paymentAnalysis.completed + debtAnalysis.paid + ownershipAnalysis.totalPaid;
  
  // المصروفات الإجمالية
  const totalExpenses = expenseAnalysis.total + maintenanceAnalysis.total;
  
  // صافي الربح
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* نظرة عامة */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">التحليل المالي</h3>
        <p className="text-gray-600">تحليل شامل للوضع المالي والإيرادات</p>
      </div>

      {/* الملخص المالي الشامل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-2">إجمالي الإيرادات</p>
              <p className="text-4xl font-bold">{totalRevenue.toLocaleString()}</p>
              <p className="text-sm mt-2">ريال سعودي</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FiTrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-2">إجمالي المصروفات</p>
              <p className="text-4xl font-bold">{totalExpenses.toLocaleString()}</p>
              <p className="text-sm mt-2">ريال سعودي</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FiTrendingDown className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-600 to-red-700'} rounded-lg shadow-xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-2">صافي الربح</p>
              <p className="text-4xl font-bold">{netProfit.toLocaleString()}</p>
              <p className="text-sm mt-2">هامش: {profitMargin}%</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FiDollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* تحليل المدفوعات */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiDollarSign className="w-5 h-5 text-blue-600" />
          تحليل المدفوعات
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">مدفوعات مكتملة</p>
            <p className="text-2xl font-bold text-green-600">{paymentAnalysis.completed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-2">مدفوعات معلقة</p>
            <p className="text-2xl font-bold text-yellow-600">{paymentAnalysis.pending.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-2">مدفوعات فاشلة</p>
            <p className="text-2xl font-bold text-red-600">{paymentAnalysis.failed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700">معدل النجاح</span>
            <span className="font-semibold text-green-600">
              {((paymentAnalysis.completed / paymentAnalysis.total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${(paymentAnalysis.completed / paymentAnalysis.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* تحليل الديون */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiCreditCard className="w-5 h-5 text-orange-600" />
          تحليل الديون
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">إجمالي الديون</p>
            <p className="text-2xl font-bold text-blue-600">{debtAnalysis.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">المبلغ المسدد</p>
            <p className="text-2xl font-bold text-green-600">{debtAnalysis.paid.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">المبلغ المتبقي</p>
            <p className="text-2xl font-bold text-orange-600">{debtAnalysis.remaining.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">معدل استرداد الديون</span>
            <span className="text-3xl font-bold text-green-600">{debtAnalysis.recoveryRate}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-3 mt-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${debtAnalysis.recoveryRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* تحليل عقود التمليك */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiAward className="w-5 h-5 text-purple-600" />
          تحليل عقود التمليك
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">قيمة العقود</p>
            <p className="text-2xl font-bold text-purple-600">{ownershipAnalysis.totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">الدفعات المقدمة</p>
            <p className="text-2xl font-bold text-blue-600">{ownershipAnalysis.downPayments.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">المبلغ المسدد</p>
            <p className="text-2xl font-bold text-green-600">{ownershipAnalysis.totalPaid.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">المبلغ المتبقي</p>
            <p className="text-2xl font-bold text-orange-600">{ownershipAnalysis.remaining.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">الإيرادات الشهرية المتوقعة</p>
              <p className="text-3xl font-bold text-blue-600">{ownershipAnalysis.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">ريال سعودي / شهر</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <FiTrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* تحليل المصروفات */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiTrendingDown className="w-5 h-5 text-red-600" />
          تحليل المصروفات
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">الإجمالي</p>
            <p className="text-2xl font-bold text-red-600">{expenseAnalysis.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{expenseAnalysis.count} مصروف</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">وقود</p>
            <p className="text-2xl font-bold text-orange-600">{expenseAnalysis.byCategory.fuel.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">صيانة</p>
            <p className="text-2xl font-bold text-blue-600">{expenseAnalysis.byCategory.maintenance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">تأمين</p>
            <p className="text-2xl font-bold text-purple-600">{expenseAnalysis.byCategory.insurance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">رواتب</p>
            <p className="text-2xl font-bold text-green-600">{expenseAnalysis.byCategory.salary.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
          </div>
        </div>
      </div>

      {/* تحليل الصيانة */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiTool className="w-5 h-5 text-blue-600" />
          تحليل الصيانة
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">إجمالي تكاليف الصيانة</p>
            <p className="text-3xl font-bold text-blue-600">{maintenanceAnalysis.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{maintenanceAnalysis.count} سجل صيانة</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">تغيير زيت</p>
              <p className="text-xl font-bold text-gray-800">{maintenanceAnalysis.byType.oil_change}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">إطارات</p>
              <p className="text-xl font-bold text-gray-800">{maintenanceAnalysis.byType.tire_change}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">فرامل</p>
              <p className="text-xl font-bold text-gray-800">{maintenanceAnalysis.byType.brake_service}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">أخرى</p>
              <p className="text-xl font-bold text-gray-800">{maintenanceAnalysis.byType.other}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ملخص مالي */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">التدفق النقدي</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">الإيرادات المحققة</span>
              <span className="font-bold text-green-600">+{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">المصروفات</span>
              <span className="font-bold text-red-600">-{expenseAnalysis.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">تكاليف الصيانة</span>
              <span className="font-bold text-blue-600">-{maintenanceAnalysis.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
              <span className="text-gray-900 font-bold">صافي الربح</span>
              <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">مؤشرات الأداء المالي</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">هامش الربح</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profitMargin}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">معدل التحصيل</span>
              <span className="font-bold text-green-600">{debtAnalysis.recoveryRate}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">معدل نجاح المدفوعات</span>
              <span className="font-bold text-green-600">
                {paymentAnalysis.total > 0 ? ((paymentAnalysis.completed / paymentAnalysis.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">الإيرادات الشهرية</span>
              <span className="font-bold text-blue-600">{ownershipAnalysis.monthlyRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
