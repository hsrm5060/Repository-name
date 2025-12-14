import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiTruck, FiAlertCircle, FiDollarSign, FiTrendingDown, FiTool, FiTrendingUp, FiShield, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatsCard from '../components/common/StatsCard';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchDebts } from '../store/slices/debtsSlice';
import { fetchOwnershipVehicles } from '../store/slices/ownershipVehiclesSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { fetchMaintenance, fetchUpcomingMaintenance, fetchOverdueMaintenance } from '../store/slices/maintenanceSlice';
import { fetchInsurances, fetchInsuranceStats } from '../store/slices/insuranceSlice';
import { fetchLicenses, fetchLicenseStats } from '../store/slices/licensesSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drivers, loading: driversLoading } = useSelector((state) => state.drivers);
  const { vehicles, loading: vehiclesLoading } = useSelector((state) => state.vehicles);
  const { payments, loading: paymentsLoading } = useSelector((state) => state.payments);
  const { debts } = useSelector((state) => state.debts);
  const { ownershipVehicles } = useSelector((state) => state.ownershipVehicles);
  const { expenses } = useSelector((state) => state.expenses);
  const { maintenance, upcoming = [], overdue = [] } = useSelector((state) => state.maintenance);
  const { insurances = [], stats: insuranceStats } = useSelector((state) => state.insurance);
  const { driverLicenses = [], vehicleLicenses = [], stats: licenseStats } = useSelector((state) => state.licenses);
  
  const isLoading = driversLoading || vehiclesLoading || paymentsLoading;

  // تحميل البيانات الأساسية فقط أولاً
  useEffect(() => {
    // البيانات الأساسية (الأهم)
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchPayments());
  }, [dispatch]);

  // تحميل البيانات الثانوية بعد تأخير بسيط
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchDebts());
      dispatch(fetchOwnershipVehicles());
      dispatch(fetchExpenses());
      dispatch(fetchMaintenance());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // تحميل البيانات الإضافية بعد تأخير أكبر
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchUpcomingMaintenance(30));
      dispatch(fetchOverdueMaintenance());
      dispatch(fetchInsurances());
      dispatch(fetchInsuranceStats());
      dispatch(fetchLicenses('driver'));
      dispatch(fetchLicenses('vehicle'));
      dispatch(fetchLicenseStats());
    }, 1000);
    return () => clearTimeout(timer);
  }, [dispatch]);
  
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const availableVehicles = vehicles.filter(v => v.status === 'active').length;
  const assignedVehicles = vehicles.filter(v => v.assigned_driver).length;
  
  // الإيرادات = المدفوعات المكتملة (paid أو completed)
  const totalRevenue = payments.filter(p => ['paid', 'completed'].includes(p.status)).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  
  // إحصائيات الديون
  const totalDebts = debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0);
  const paidDebts = debts.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0);
  const remainingDebts = debts.reduce((sum, d) => sum + parseFloat(d.remaining_amount || 0), 0);
  
  // إحصائيات التمليك
  const totalOwnership = ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.total_price || 0), 0);
  const paidOwnership = ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.paid_amount || 0) + parseFloat(v.down_payment || 0), 0);

  // إحصائيات المصروفات
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  // إحصائيات الصيانة
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
  
  // صافي الربح
  const netProfit = totalRevenue - totalExpenses - totalMaintenanceCost;

  // إحصائيات التأمين والرخص
  const activeInsurances = insuranceStats?.active || 0;
  const warningInsurances = insuranceStats?.warning || 0;
  const expiredInsurances = insuranceStats?.expired || 0;
  
  const activeDriverLicenses = licenseStats?.driver?.active || 0;
  const warningDriverLicenses = licenseStats?.driver?.warning || 0;
  const expiredDriverLicenses = licenseStats?.driver?.expired || 0;
  
  const activeVehicleLicenses = licenseStats?.vehicle?.active || 0;
  const warningVehicleLicenses = licenseStats?.vehicle?.warning || 0;
  const expiredVehicleLicenses = licenseStats?.vehicle?.expired || 0;

  const stats = [
    { 
      icon: FiUsers, 
      label: 'إجمالي السائقين', 
      value: drivers.length, 
      color: 'bg-blue-500',
      subtitle: `نشط: ${activeDrivers}`
    },
    { 
      icon: FiTruck, 
      label: 'إجمالي المركبات', 
      value: vehicles.length, 
      color: 'bg-purple-500',
      subtitle: `متاح: ${availableVehicles}`
    },
    { 
      icon: FiTrendingUp, 
      label: 'الإيرادات المحصلة', 
      value: `${totalRevenue.toLocaleString()} ر.س`, 
      color: 'bg-green-500',
      subtitle: `معلق: ${pendingPayments}`
    },
    { 
      icon: FiTrendingDown, 
      label: 'إجمالي المصروفات', 
      value: `${totalExpenses.toLocaleString()} ر.س`, 
      color: 'bg-red-500',
      subtitle: `${expenses.length} مصروف`
    },
    { 
      icon: FiTool, 
      label: 'تكاليف الصيانة', 
      value: `${totalMaintenanceCost.toLocaleString()} ر.س`, 
      color: 'bg-blue-600',
      subtitle: `${maintenance.length} سجل`
    },
    { 
      icon: FiDollarSign, 
      label: 'صافي الربح', 
      value: `${netProfit.toLocaleString()} ر.س`, 
      color: netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-600',
      subtitle: netProfit >= 0 ? 'ربح' : 'خسارة'
    },
    { 
      icon: FiAlertCircle, 
      label: 'الديون المتبقية', 
      value: `${remainingDebts.toLocaleString()} ر.س`, 
      color: 'bg-orange-500',
      subtitle: `من ${totalDebts.toLocaleString()} ر.س`
    },
    { 
      icon: FiTool, 
      label: 'تنبيهات الصيانة', 
      value: upcoming.length + overdue.length, 
      color: overdue.length > 0 ? 'bg-red-500' : 'bg-orange-500',
      subtitle: `متأخرة: ${overdue.length} | قادمة: ${upcoming.length}`
    },
    { 
      icon: FiShield, 
      label: 'التأمينات', 
      value: insurances.length, 
      color: expiredInsurances > 0 ? 'bg-red-500' : warningInsurances > 0 ? 'bg-orange-500' : 'bg-green-500',
      subtitle: `سارية: ${activeInsurances} | تحذير: ${warningInsurances} | منتهية: ${expiredInsurances}`
    },
    { 
      icon: FiFileText, 
      label: 'رخص القيادة', 
      value: driverLicenses.length, 
      color: expiredDriverLicenses > 0 ? 'bg-red-500' : warningDriverLicenses > 0 ? 'bg-orange-500' : 'bg-green-500',
      subtitle: `سارية: ${activeDriverLicenses} | تحذير: ${warningDriverLicenses} | منتهية: ${expiredDriverLicenses}`
    },
    { 
      icon: FiFileText, 
      label: 'رخص المركبات', 
      value: vehicleLicenses.length, 
      color: expiredVehicleLicenses > 0 ? 'bg-red-500' : warningVehicleLicenses > 0 ? 'bg-orange-500' : 'bg-green-500',
      subtitle: `سارية: ${activeVehicleLicenses} | تحذير: ${warningVehicleLicenses} | منتهية: ${expiredVehicleLicenses}`
    },
  ];

  // بيانات حقيقية للرسوم البيانية
  const statusData = [
    { name: 'نشط', value: availableVehicles, color: '#10b981' },
    { name: 'مخصص', value: assignedVehicles, color: '#0ea5e9' },
    { name: 'صيانة', value: vehicles.filter(v => v.status === 'maintenance').length, color: '#f59e0b' },
  ];

  // بيانات المدفوعات حسب الخطة
  const paymentsByPlan = [
    { plan: 'يومي', amount: payments.filter(p => p.plan === 'daily').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0), count: payments.filter(p => p.plan === 'daily').length },
    { plan: 'أسبوعي', amount: payments.filter(p => p.plan === 'weekly').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0), count: payments.filter(p => p.plan === 'weekly').length },
    { plan: 'شهري', amount: payments.filter(p => p.plan === 'monthly').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0), count: payments.filter(p => p.plan === 'monthly').length },
  ];

  // بيانات مالية
  const financialData = [
    { name: 'المدفوعات', value: totalRevenue },
    { name: 'الديون المسددة', value: paidDebts },
    { name: 'التمليك المسدد', value: paidOwnership },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-1">نظرة عامة على النظام</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">جاري التحميل...</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* تنبيهات الصيانة */}
      {(upcoming.length > 0 || overdue.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => navigate('/maintenance')}
            >
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-600 text-2xl" />
                <div>
                  <p className="font-bold text-red-800">صيانات متأخرة</p>
                  <p className="text-sm text-red-600">{overdue.length} مركبة تحتاج صيانة فورية</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {upcoming.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => navigate('/maintenance')}
            >
              <div className="flex items-center gap-3">
                <FiTool className="text-orange-600 text-2xl" />
                <div>
                  <p className="font-bold text-orange-800">صيانات قادمة</p>
                  <p className="text-sm text-orange-600">{upcoming.length} مركبة تحتاج صيانة خلال 30 يوم</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* تنبيهات التأمين والرخص */}
      {(expiredInsurances > 0 || warningInsurances > 0 || expiredDriverLicenses > 0 || warningDriverLicenses > 0 || expiredVehicleLicenses > 0 || warningVehicleLicenses > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">تنبيهات التأمين والرخص</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* تنبيهات التأمين */}
            {(expiredInsurances > 0 || warningInsurances > 0) && (
              <div 
                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                  expiredInsurances > 0 ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                }`}
                onClick={() => navigate('/insurance')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FiShield className={`text-2xl ${expiredInsurances > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                  <h4 className={`font-bold ${expiredInsurances > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                    التأمينات
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  {expiredInsurances > 0 && (
                    <p className="text-red-600">منتهية: {expiredInsurances}</p>
                  )}
                  {warningInsurances > 0 && (
                    <p className="text-orange-600">قريبة من الانتهاء: {warningInsurances}</p>
                  )}
                </div>
              </div>
            )}

            {/* تنبيهات رخص القيادة */}
            {(expiredDriverLicenses > 0 || warningDriverLicenses > 0) && (
              <div 
                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                  expiredDriverLicenses > 0 ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                }`}
                onClick={() => navigate('/licenses')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FiFileText className={`text-2xl ${expiredDriverLicenses > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                  <h4 className={`font-bold ${expiredDriverLicenses > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                    رخص القيادة
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  {expiredDriverLicenses > 0 && (
                    <p className="text-red-600">منتهية: {expiredDriverLicenses}</p>
                  )}
                  {warningDriverLicenses > 0 && (
                    <p className="text-orange-600">قريبة من الانتهاء: {warningDriverLicenses}</p>
                  )}
                </div>
              </div>
            )}

            {/* تنبيهات رخص المركبات */}
            {(expiredVehicleLicenses > 0 || warningVehicleLicenses > 0) && (
              <div 
                className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                  expiredVehicleLicenses > 0 ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                }`}
                onClick={() => navigate('/licenses')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FiFileText className={`text-2xl ${expiredVehicleLicenses > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                  <h4 className={`font-bold ${expiredVehicleLicenses > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                    رخص المركبات
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  {expiredVehicleLicenses > 0 && (
                    <p className="text-red-600">منتهية: {expiredVehicleLicenses}</p>
                  )}
                  {warningVehicleLicenses > 0 && (
                    <p className="text-orange-600">قريبة من الانتهاء: {warningVehicleLicenses}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* رسم بياني: الإيرادات vs المصروفات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">الإيرادات والمصروفات</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[
            { name: 'الإيرادات', value: totalRevenue, fill: '#10b981' },
            { name: 'المصروفات', value: totalExpenses, fill: '#ef4444' },
            { name: 'الصيانة', value: totalMaintenanceCost, fill: '#3b82f6' },
            { name: 'صافي الربح', value: netProfit, fill: netProfit >= 0 ? '#059669' : '#dc2626' },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
            <Legend />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {[
                { name: 'الإيرادات', value: totalRevenue, fill: '#10b981' },
                { name: 'المصروفات', value: totalExpenses, fill: '#ef4444' },
                { name: 'الصيانة', value: totalMaintenanceCost, fill: '#3b82f6' },
                { name: 'صافي الربح', value: netProfit, fill: netProfit >= 0 ? '#059669' : '#dc2626' },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">المدفوعات حسب الخطة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentsByPlan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plan" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
              <Bar dataKey="amount" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">حالة المركبات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* إحصائيات مالية إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        >
          <h4 className="text-lg font-semibold mb-3 opacity-90">إجمالي الديون</h4>
          <p className="text-3xl font-bold mb-2">{totalDebts.toLocaleString()} ر.س</p>
          <div className="flex justify-between text-sm opacity-90">
            <span>مسدد: {paidDebts.toLocaleString()}</span>
            <span>متبقي: {remainingDebts.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        >
          <h4 className="text-lg font-semibold mb-3 opacity-90">عقود التمليك</h4>
          <p className="text-3xl font-bold mb-2">{ownershipVehicles.length}</p>
          <div className="flex justify-between text-sm opacity-90">
            <span>نشط: {ownershipVehicles.filter(v => v.status === 'active').length}</span>
            <span>مكتمل: {ownershipVehicles.filter(v => v.status === 'completed').length}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <h4 className="text-lg font-semibold mb-3 opacity-90">إجمالي التمليك</h4>
          <p className="text-3xl font-bold mb-2">{totalOwnership.toLocaleString()} ر.س</p>
          <div className="flex justify-between text-sm opacity-90">
            <span>مسدد: {paidOwnership.toLocaleString()}</span>
            <span>متبقي: {(totalOwnership - paidOwnership).toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
        >
          <h4 className="text-lg font-semibold mb-3 opacity-90">صافي الربح</h4>
          <p className="text-3xl font-bold mb-2">{netProfit.toLocaleString()} ر.س</p>
          <div className="flex justify-between text-sm opacity-90">
            <span>إيرادات: {totalRevenue.toLocaleString()}</span>
            <span>مصروفات: {(totalExpenses + totalMaintenanceCost).toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* رسوم بيانية للمصروفات والصيانة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">المصروفات حسب الفئة</h3>
            <button onClick={() => navigate('/expenses')} className="text-primary-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'وقود', value: expenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), fill: '#f59e0b' },
                  { name: 'صيانة', value: expenses.filter(e => e.category === 'maintenance').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), fill: '#3b82f6' },
                  { name: 'تأمين', value: expenses.filter(e => e.category === 'insurance').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), fill: '#8b5cf6' },
                  { name: 'رواتب', value: expenses.filter(e => e.category === 'salary').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), fill: '#10b981' },
                  { name: 'أخرى', value: expenses.filter(e => !['fuel', 'maintenance', 'insurance', 'salary'].includes(e.category)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0), fill: '#6b7280' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">الصيانة حسب النوع</h3>
            <button onClick={() => navigate('/maintenance')} className="text-primary-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'زيت', value: maintenance.filter(m => m.maintenance_type === 'oil_change').length },
              { name: 'إطارات', value: maintenance.filter(m => m.maintenance_type === 'tire_change').length },
              { name: 'فرامل', value: maintenance.filter(m => m.maintenance_type === 'brake_service').length },
              { name: 'محرك', value: maintenance.filter(m => m.maintenance_type === 'engine_repair').length },
              { name: 'أخرى', value: maintenance.filter(m => !['oil_change', 'tire_change', 'brake_service', 'engine_repair'].includes(m.maintenance_type)).length },
            ].filter(item => item.value > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">أفضل السائقين</h3>
            <button onClick={() => navigate('/drivers')} className="text-primary-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <div className="space-y-3">
            {[...drivers]
              .filter(d => d.status === 'active')
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 5)
              .map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/drivers/${driver.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUsers className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm">⭐ {driver.rating || 'N/A'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {driver.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">المدفوعات المعلقة</h3>
            <button onClick={() => navigate('/payments')} className="text-primary-600 text-sm hover:underline">
              عرض الكل
            </button>
          </div>
          <div className="space-y-3">
            {payments.filter(p => p.status === 'pending' || p.status === 'overdue').slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{payment.driver_name}</p>
                  <p className="text-sm text-gray-600">استحقاق: {payment.due_date}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{parseFloat(payment.amount || 0).toLocaleString()} ر.س</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status === 'overdue' ? 'متأخر' : 'معلق'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
