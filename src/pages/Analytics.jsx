import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchDebts } from '../store/slices/debtsSlice';
import { fetchOwnershipVehicles } from '../store/slices/ownershipVehiclesSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { fetchMaintenance } from '../store/slices/maintenanceSlice';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiTruck, 
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import DriverAnalytics from '../components/Analytics/DriverAnalytics';
import VehicleAnalytics from '../components/Analytics/VehicleAnalytics';
import FinancialAnalytics from '../components/Analytics/FinancialAnalytics';
import PerformanceMetrics from '../components/Analytics/PerformanceMetrics';
import { exportToJSON } from '../utils/exportUtils';

const Analytics = () => {
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  const { payments } = useSelector((state) => state.payments);
  const { debts } = useSelector((state) => state.debts);
  const { ownershipVehicles } = useSelector((state) => state.ownershipVehicles);
  const { expenses } = useSelector((state) => state.expenses);
  const { maintenance } = useSelector((state) => state.maintenance);

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchPayments());
    dispatch(fetchDebts());
    dispatch(fetchOwnershipVehicles());
    dispatch(fetchExpenses());
    dispatch(fetchMaintenance());
  }, [dispatch]);

  // حساب الإحصائيات العامة
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalMaintenanceCost;

  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === 'active').length,
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    totalRevenue: totalRevenue,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalDebts: debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0),
    paidDebts: debts.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0),
    ownershipContracts: ownershipVehicles.length,
    completedContracts: ownershipVehicles.filter(v => v.status === 'completed').length,
    totalExpenses: totalExpenses,
    expensesCount: expenses.length,
    totalMaintenanceCost: totalMaintenanceCost,
    maintenanceCount: maintenance.length,
    netProfit: netProfit,
    profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: FiActivity },
    { id: 'drivers', label: 'السائقين', icon: FiUsers },
    { id: 'vehicles', label: 'المركبات', icon: FiTruck },
    { id: 'financial', label: 'المالية', icon: FiDollarSign },
    { id: 'performance', label: 'الأداء', icon: FiTrendingUp }
  ];

  // دالة تصدير التقرير
  const handleExportReport = () => {
    const reportData = {
      تاريخ_التقرير: new Date().toLocaleDateString('ar-SA'),
      الفترة: selectedPeriod === 'week' ? 'آخر أسبوع' : 
               selectedPeriod === 'month' ? 'آخر شهر' : 
               selectedPeriod === 'quarter' ? 'آخر 3 أشهر' : 'آخر سنة',
      
      إحصائيات_عامة: {
        إجمالي_السائقين: stats.totalDrivers,
        سائقين_نشطين: stats.activeDrivers,
        إجمالي_المركبات: stats.totalVehicles,
        مركبات_نشطة: stats.activeVehicles,
        إجمالي_الإيرادات: stats.totalRevenue,
        إجمالي_المصروفات: stats.totalExpenses,
        عدد_المصروفات: stats.expensesCount,
        تكاليف_الصيانة: stats.totalMaintenanceCost,
        عدد_سجلات_الصيانة: stats.maintenanceCount,
        صافي_الربح: stats.netProfit,
        هامش_الربح: stats.profitMargin + '%',
        مدفوعات_معلقة: stats.pendingPayments,
        إجمالي_الديون: stats.totalDebts,
        ديون_مسددة: stats.paidDebts,
        عقود_التمليك: stats.ownershipContracts,
        عقود_مكتملة: stats.completedContracts
      },
      
      مؤشرات_الأداء: {
        معدل_استخدام_السائقين: `${((stats.activeDrivers / stats.totalDrivers) * 100).toFixed(1)}%`,
        معدل_استخدام_المركبات: `${((stats.activeVehicles / stats.totalVehicles) * 100).toFixed(1)}%`,
        معدل_استرداد_الديون: `${((stats.paidDebts / stats.totalDebts) * 100).toFixed(1)}%`,
        معدل_إكمال_التمليك: `${((stats.completedContracts / stats.ownershipContracts) * 100).toFixed(1)}%`
      },
      
      تفاصيل_السائقين: drivers.map(d => ({
        الاسم: d.name,
        الحالة: d.status === 'active' ? 'نشط' : d.status === 'inactive' ? 'غير نشط' : 'موقوف',
        الهاتف: d.phone,
        التقييم: d.rating || 0
      })),
      
      تفاصيل_المركبات: vehicles.map(v => ({
        اللوحة: v.plate_number,
        الماركة: v.make,
        الموديل: v.model,
        السنة: v.year,
        الحالة: v.status === 'active' ? 'نشط' : v.status === 'maintenance' ? 'صيانة' : 'غير نشط'
      })),
      
      تفاصيل_المدفوعات: payments.map(p => ({
        السائق: p.driver_name,
        المبلغ: p.amount,
        الحالة: p.status === 'paid' ? 'مدفوع' : p.status === 'pending' ? 'معلق' : 'متأخر',
        التاريخ: p.due_date
      })),
      
      تفاصيل_الديون: debts.map(d => ({
        السائق: d.driver_name,
        إجمالي_الدين: d.total_debt,
        المسدد: d.paid_amount,
        المتبقي: d.remaining_amount,
        الحالة: d.status === 'paid' ? 'مسدد' : d.status === 'partial' ? 'جزئي' : 'نشط'
      })),
      
      تفاصيل_التمليك: ownershipVehicles.map(v => ({
        رقم_العقد: v.contract_number,
        السائق: v.driver_name,
        المركبة: v.vehicle_plate,
        القيمة: v.total_price,
        المسدد: v.paid_amount + v.down_payment,
        المتبقي: v.remaining_amount,
        نسبة_الإنجاز: v.completion_percentage + '%'
      })),
      
      تفاصيل_المصروفات: expenses.map(e => ({
        رقم_المصروف: e.expense_number,
        الفئة: e.category,
        المبلغ: e.amount,
        التاريخ: e.expense_date,
        المركبة: e.vehicle_plate || '-',
        السائق: e.driver_name || '-',
        الوصف: e.description
      })),
      
      تفاصيل_الصيانة: maintenance.map(m => ({
        رقم_الصيانة: m.maintenance_number,
        المركبة: m.plate_number,
        النوع: m.maintenance_type,
        التكلفة: m.cost,
        التاريخ: m.maintenance_date,
        الصيانة_القادمة: m.next_maintenance_date || '-',
        مزود_الخدمة: m.service_provider,
        الحالة: m.status
      }))
    };

    exportToJSON([reportData], `تقرير_التحليلات_${selectedPeriod}`);
    toast.success('تم تصدير التقرير بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* العنوان وشريط الأدوات */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiBarChart2 className="w-8 h-8 text-blue-600" />
            التحليلات المتقدمة
          </h1>
          <p className="text-gray-600 mt-2">تحليل شامل لأداء النظام والإحصائيات</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="year">آخر سنة</option>
          </select>

          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* البطاقات الإحصائية الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiUsers className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">السائقين</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalDrivers}</p>
          <p className="text-sm opacity-90">نشط: {stats.activeDrivers}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiTruck className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">المركبات</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalVehicles}</p>
          <p className="text-sm opacity-90">نشط: {stats.activeVehicles}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">الإيرادات</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm opacity-90">ر.س</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiTrendingUp className="w-6 h-6 transform rotate-180" />
            </div>
            <span className="text-sm opacity-90">المصروفات</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalExpenses.toLocaleString()}</p>
          <p className="text-sm opacity-90">{stats.expensesCount} مصروف</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiActivity className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">الصيانة</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalMaintenanceCost.toLocaleString()}</p>
          <p className="text-sm opacity-90">{stats.maintenanceCount} سجل</p>
        </div>

        <div className={`bg-gradient-to-br ${stats.netProfit >= 0 ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'} rounded-lg shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">صافي الربح</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.netProfit.toLocaleString()}</p>
          <p className="text-sm opacity-90">هامش: {stats.profitMargin}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">الديون</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.totalDebts.toLocaleString()}</p>
          <p className="text-sm opacity-90">مسدد: {stats.paidDebts.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FiPieChart className="w-6 h-6" />
            </div>
            <span className="text-sm opacity-90">عقود التمليك</span>
          </div>
          <p className="text-3xl font-bold mb-2">{stats.ownershipContracts}</p>
          <p className="text-sm opacity-90">مكتمل: {stats.completedContracts}</p>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <PerformanceMetrics stats={stats} period={selectedPeriod} />
            </div>
          )}

          {activeTab === 'drivers' && (
            <DriverAnalytics drivers={drivers} period={selectedPeriod} />
          )}

          {activeTab === 'vehicles' && (
            <VehicleAnalytics vehicles={vehicles} period={selectedPeriod} />
          )}

          {activeTab === 'financial' && (
            <FinancialAnalytics 
              payments={payments}
              debts={debts}
              ownershipVehicles={ownershipVehicles}
              expenses={expenses}
              maintenance={maintenance}
              period={selectedPeriod}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceMetrics stats={stats} period={selectedPeriod} detailed />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
