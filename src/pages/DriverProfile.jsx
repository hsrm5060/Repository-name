import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, FiUser, FiPhone, FiMail, FiTruck, FiDollarSign, 
  FiCreditCard, FiAward, FiTool, FiShield, FiFileText, FiCalendar,
  FiEdit2, FiDownload, FiAlertCircle, FiCheckCircle, FiClock, FiActivity,
  FiMapPin, FiDroplet, FiUsers
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { toast } from 'react-toastify';
import { fetchDrivers, modifyDriver } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchDebts } from '../store/slices/debtsSlice';
import { fetchOwnershipVehicles } from '../store/slices/ownershipVehiclesSlice';
import { fetchMaintenance } from '../store/slices/maintenanceSlice';
import { fetchInsurances } from '../store/slices/insuranceSlice';
import { fetchLicenses } from '../store/slices/licensesSlice';
import { fetchTrips } from '../store/slices/tripsSlice';
import DriverModal from '../components/Drivers/DriverModal';

const DriverProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  const { payments } = useSelector((state) => state.payments);
  const { debts } = useSelector((state) => state.debts);
  const { ownershipVehicles } = useSelector((state) => state.ownershipVehicles);
  const { maintenance } = useSelector((state) => state.maintenance);
  const { insurances } = useSelector((state) => state.insurance);
  const { driverLicenses } = useSelector((state) => state.licenses);
  const { trips } = useSelector((state) => state.trips);

  const [activeTab, setActiveTab] = useState('overview');
  const [driver, setDriver] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchPayments());
    dispatch(fetchDebts());
    dispatch(fetchOwnershipVehicles());
    dispatch(fetchMaintenance());
    dispatch(fetchInsurances());
    dispatch(fetchLicenses('driver'));
    dispatch(fetchTrips());
  }, [dispatch]);

  useEffect(() => {
    const foundDriver = drivers.find(d => d.id === parseInt(id));
    if (foundDriver) {
      setDriver(foundDriver);
    } else if (drivers.length > 0) {
      toast.error('السائق غير موجود');
      navigate('/drivers');
    }
  }, [id, drivers, navigate]);

  const handleEditSave = async (driverData) => {
    try {
      await dispatch(modifyDriver({ id: driver.id, data: driverData })).unwrap();
      toast.success('تم تحديث بيانات السائق بنجاح');
      setIsEditModalOpen(false);
      dispatch(fetchDrivers());
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // البيانات المرتبطة بالسائق
  const driverVehicle = vehicles.find(v => v.assigned_driver === driver.id);
  const driverPayments = payments.filter(p => p.driver_id === driver.id);
  const driverDebts = debts.filter(d => d.driver_id === driver.id);
  const driverOwnership = ownershipVehicles.find(o => o.driver_id === driver.id);
  const driverMaintenance = driverVehicle ? maintenance.filter(m => m.vehicle_id === driverVehicle.id) : [];
  const driverInsurance = driverVehicle ? insurances.find(i => i.vehicle_id === driverVehicle.id) : null;
  const driverLicense = driverLicenses.find(l => l.driver_id === driver.id);
  const driverTrips = trips.filter(t => t.driver_id === driver.id);

  // الإحصائيات
  const totalPaid = driverPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPending = driverPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalDebt = driverDebts.reduce((sum, d) => sum + parseFloat(d.remaining_amount || 0), 0);
  const totalTripsCount = driverTrips.length;
  const completedTrips = driverTrips.filter(t => t.status === 'completed').length;
  const totalTripsFare = driverTrips.reduce((sum, t) => sum + parseFloat(t.fare || 0), 0);


  // بيانات الرسم البياني للمدفوعات
  const paymentChartData = [
    { name: 'مدفوع', value: totalPaid, color: '#10b981' },
    { name: 'معلق', value: totalPending, color: '#f59e0b' },
    { name: 'ديون', value: totalDebt, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // بيانات الأداء الشهري (محاكاة)
  const performanceData = [
    { month: 'يناير', trips: 45, revenue: 4500 },
    { month: 'فبراير', trips: 52, revenue: 5200 },
    { month: 'مارس', trips: 48, revenue: 4800 },
    { month: 'أبريل', trips: 60, revenue: 6000 },
    { month: 'مايو', trips: 55, revenue: 5500 },
    { month: 'يونيو', trips: 65, revenue: 6500 },
  ];

  // سجل النشاطات
  const activityLog = [
    ...driverPayments.slice(0, 3).map(p => ({
      type: 'payment',
      icon: FiDollarSign,
      color: p.status === 'paid' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100',
      title: p.status === 'paid' ? 'دفعة مكتملة' : 'دفعة معلقة',
      description: `${parseFloat(p.amount || 0).toLocaleString()} ر.س`,
      date: p.due_date || p.created_at,
    })),
    ...driverTrips.slice(0, 3).map(t => ({
      type: 'trip',
      icon: FiTruck,
      color: t.status === 'completed' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100',
      title: t.status === 'completed' ? 'رحلة مكتملة' : 'رحلة',
      description: `${t.from_location} → ${t.to_location}`,
      date: t.trip_date,
    })),
    ...driverMaintenance.slice(0, 2).map(m => ({
      type: 'maintenance',
      icon: FiTool,
      color: 'text-orange-600 bg-orange-100',
      title: 'صيانة',
      description: m.description,
      date: m.maintenance_date,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: FiUser },
    { id: 'performance', label: 'الأداء', icon: FiActivity },
    { id: 'vehicle', label: 'المركبة', icon: FiTruck },
    { id: 'payments', label: 'المدفوعات', icon: FiDollarSign },
    { id: 'debts', label: 'الديون', icon: FiCreditCard },
    { id: 'ownership', label: 'التمليك', icon: FiAward },
    { id: 'maintenance', label: 'الصيانة', icon: FiTool },
    { id: 'activity', label: 'سجل النشاطات', icon: FiClock },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/drivers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <FiArrowRight /> العودة للسائقين
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiEdit2 /> تعديل البيانات
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <FiDownload /> تصدير الملف
          </button>
        </div>
      </div>

      {/* بطاقة المعلومات الأساسية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img 
              src={driver.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driver.name) + '&background=random'} 
              alt={driver.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full shadow-lg hover:bg-gray-100"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl font-bold mb-2">{driver.name}</h1>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm mb-3">
              <div className="flex items-center gap-2">
                <FiPhone /> {driver.phone}
              </div>
              {driver.email && (
                <div className="flex items-center gap-2">
                  <FiMail /> {driver.email}
                </div>
              )}
              {driver.city && (
                <div className="flex items-center gap-2">
                  <FiMapPin /> {driver.city}
                </div>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                driver.status === 'active' ? 'bg-green-500' : 
                driver.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                {driver.status === 'active' ? 'نشط' : driver.status === 'suspended' ? 'موقوف' : 'غير نشط'}
              </span>
            </div>
            {/* معلومات إضافية */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm opacity-90">
              {driver.national_id && (
                <span>الهوية: {driver.national_id}</span>
              )}
              {driver.nationality && (
                <span>الجنسية: {driver.nationality}</span>
              )}
              {driver.blood_type && (
                <span className="flex items-center gap-1"><FiDroplet /> {driver.blood_type}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-xs">التقييم</p>
              <p className="text-2xl font-bold">⭐ {driver.rating || 0}</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-xs">الرحلات</p>
              <p className="text-2xl font-bold">{totalTripsCount}</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-xs">المدفوع</p>
              <p className="text-2xl font-bold">{totalPaid.toLocaleString()}</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-xs">الديون</p>
              <p className="text-2xl font-bold">{totalDebt.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>


      {/* جهة الاتصال للطوارئ */}
      {driver.emergency_contact_name && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-orange-50 border border-orange-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="text-orange-600 w-5 h-5" />
            <h3 className="font-bold text-orange-800">جهة الاتصال للطوارئ</h3>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-600">الاسم: </span>
              <span className="font-medium">{driver.emergency_contact_name}</span>
            </div>
            <div>
              <span className="text-gray-600">الهاتف: </span>
              <span className="font-medium">{driver.emergency_contact_phone}</span>
            </div>
            <div>
              <span className="text-gray-600">صلة القرابة: </span>
              <span className="font-medium">{driver.emergency_contact_relation}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* التبويبات */}
      <div className="card p-0 overflow-hidden">
        <div className="flex overflow-x-auto border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-blue-50">
                  <h3 className="font-bold text-gray-800 mb-2">معلومات الاتصال</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>الهاتف:</strong> {driver.phone}</p>
                    <p><strong>البريد:</strong> {driver.email || 'غير محدد'}</p>
                    <p><strong>العنوان:</strong> {driver.address || 'غير محدد'}</p>
                    <p><strong>المدينة:</strong> {driver.city || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="card bg-green-50">
                  <h3 className="font-bold text-gray-800 mb-2">الحالة المالية</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>إجمالي المدفوع:</strong> {totalPaid.toLocaleString()} ر.س</p>
                    <p><strong>المعلق:</strong> {totalPending.toLocaleString()} ر.س</p>
                    <p><strong>الديون:</strong> {totalDebt.toLocaleString()} ر.س</p>
                  </div>
                </div>

                <div className="card bg-purple-50">
                  <h3 className="font-bold text-gray-800 mb-2">معلومات شخصية</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>رقم الهوية:</strong> {driver.national_id || 'غير محدد'}</p>
                    <p><strong>تاريخ الميلاد:</strong> {driver.birth_date || 'غير محدد'}</p>
                    <p><strong>الجنسية:</strong> {driver.nationality || 'غير محدد'}</p>
                    <p><strong>فصيلة الدم:</strong> {driver.blood_type || 'غير محدد'}</p>
                  </div>
                </div>
              </div>

              {/* التنبيهات */}
              <div className="space-y-3">
                {driverLicense && new Date(driverLicense.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 border-r-4 border-orange-500 rounded">
                    <FiAlertCircle className="text-orange-600 text-xl" />
                    <div>
                      <p className="font-bold text-orange-800">رخصة القيادة قريبة من الانتهاء</p>
                      <p className="text-sm text-orange-600">تنتهي في: {driverLicense.expiry_date}</p>
                    </div>
                  </div>
                )}
                {totalDebt > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border-r-4 border-red-500 rounded">
                    <FiCreditCard className="text-red-600 text-xl" />
                    <div>
                      <p className="font-bold text-red-800">يوجد ديون متبقية</p>
                      <p className="text-sm text-red-600">المبلغ: {totalDebt.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* الأداء */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* إحصائيات الأداء */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <p className="text-sm opacity-90">إجمالي الرحلات</p>
                  <p className="text-3xl font-bold mt-2">{totalTripsCount}</p>
                </div>
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <p className="text-sm opacity-90">رحلات مكتملة</p>
                  <p className="text-3xl font-bold mt-2">{completedTrips}</p>
                </div>
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <p className="text-sm opacity-90">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold mt-2">{totalTripsFare.toLocaleString()}</p>
                </div>
                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <p className="text-sm opacity-90">معدل الإنجاز</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalTripsCount > 0 ? ((completedTrips / totalTripsCount) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>

              {/* رسم بياني للأداء الشهري */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4">الأداء الشهري</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="trips" stroke="#3b82f6" name="الرحلات" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="الإيرادات" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* توزيع المدفوعات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">توزيع المدفوعات</h3>
                  {paymentChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={paymentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {paymentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">لا توجد بيانات</div>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">مؤشرات الأداء</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>معدل إكمال الرحلات</span>
                        <span className="font-bold">{totalTripsCount > 0 ? ((completedTrips / totalTripsCount) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: `${totalTripsCount > 0 ? (completedTrips / totalTripsCount) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>معدل السداد</span>
                        <span className="font-bold">{(totalPaid + totalPending) > 0 ? ((totalPaid / (totalPaid + totalPending)) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(totalPaid + totalPending) > 0 ? (totalPaid / (totalPaid + totalPending)) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>التقييم</span>
                        <span className="font-bold">{((driver.rating || 0) / 5 * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(driver.rating || 0) / 5 * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* المركبة */}
          {activeTab === 'vehicle' && (
            <div>
              {driverVehicle ? (
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <FiTruck className="text-4xl text-blue-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {driverVehicle.make} {driverVehicle.model}
                      </h3>
                      <p className="text-gray-600">{driverVehicle.year}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">رقم اللوحة</p>
                      <p className="font-bold text-gray-800">{driverVehicle.plate_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">اللون</p>
                      <p className="font-bold text-gray-800">{driverVehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المسافة</p>
                      <p className="font-bold text-gray-800">{driverVehicle.mileage?.toLocaleString()} كم</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الحالة</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        driverVehicle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {driverVehicle.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiTruck className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد مركبة مخصصة لهذا السائق</p>
                </div>
              )}
            </div>
          )}

          {/* المدفوعات */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card bg-green-50">
                  <p className="text-sm text-gray-600 mb-1">المدفوع</p>
                  <p className="text-2xl font-bold text-green-700">{totalPaid.toLocaleString()} ر.س</p>
                </div>
                <div className="card bg-yellow-50">
                  <p className="text-sm text-gray-600 mb-1">المعلق</p>
                  <p className="text-2xl font-bold text-yellow-700">{totalPending.toLocaleString()} ر.س</p>
                </div>
                <div className="card bg-blue-50">
                  <p className="text-sm text-gray-600 mb-1">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-blue-700">{driverPayments.length}</p>
                </div>
              </div>

              {driverPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الخطة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الاستحقاق</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {driverPayments.slice(0, 10).map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold">{parseFloat(payment.amount || 0).toLocaleString()} ر.س</td>
                          <td className="px-4 py-3">{payment.plan}</td>
                          <td className="px-4 py-3">{payment.due_date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status === 'paid' ? 'مدفوع' : payment.status === 'pending' ? 'معلق' : 'متأخر'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiDollarSign className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد مدفوعات لهذا السائق</p>
                </div>
              )}
            </div>
          )}


          {/* الديون */}
          {activeTab === 'debts' && (
            <div className="space-y-4">
              {driverDebts.length > 0 ? (
                driverDebts.map((debt) => (
                  <div key={debt.id} className="card bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{debt.description || 'دين'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        debt.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {debt.status === 'paid' ? 'مسدد' : 'نشط'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">إجمالي الدين</p>
                        <p className="font-bold text-gray-800">{parseFloat(debt.total_debt || 0).toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المدفوع</p>
                        <p className="font-bold text-green-600">{parseFloat(debt.paid_amount || 0).toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المتبقي</p>
                        <p className="font-bold text-red-600">{parseFloat(debt.remaining_amount || 0).toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">تاريخ البدء</p>
                        <p className="font-bold text-gray-800">{debt.start_date || debt.created_date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiCreditCard className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد ديون لهذا السائق</p>
                </div>
              )}
            </div>
          )}

          {/* التمليك */}
          {activeTab === 'ownership' && (
            <div>
              {driverOwnership ? (
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center gap-3 mb-6">
                    <FiAward className="text-4xl text-purple-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">عقد تمليك نشط</h3>
                      <p className="text-gray-600">{driverOwnership.vehicle_plate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">السعر الإجمالي</p>
                      <p className="font-bold text-gray-800">{parseFloat(driverOwnership.total_price || 0).toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الدفعة المقدمة</p>
                      <p className="font-bold text-green-600">{parseFloat(driverOwnership.down_payment || 0).toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدفوع</p>
                      <p className="font-bold text-blue-600">{parseFloat(driverOwnership.paid_amount || 0).toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المتبقي</p>
                      <p className="font-bold text-red-600">{parseFloat(driverOwnership.remaining_amount || 0).toLocaleString()} ر.س</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">نسبة الإنجاز</span>
                      <span className="font-bold text-gray-800">{driverOwnership.completion_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${driverOwnership.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiAward className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا يوجد عقد تمليك لهذا السائق</p>
                  <p className="text-sm mt-2">السائق يعمل بنظام الإيجار</p>
                </div>
              )}
            </div>
          )}


          {/* الصيانة */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              {driverMaintenance.length > 0 ? (
                driverMaintenance.map((m) => (
                  <div key={m.id} className="card bg-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">{m.maintenance_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {m.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">التكلفة</p>
                        <p className="font-bold text-gray-800">{parseFloat(m.cost || 0).toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">التاريخ</p>
                        <p className="font-bold text-gray-800">{m.maintenance_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المسافة</p>
                        <p className="font-bold text-gray-800">{m.mileage?.toLocaleString()} كم</p>
                      </div>
                    </div>
                    {m.notes && (
                      <p className="text-sm text-gray-600 mt-3 p-3 bg-white rounded">{m.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiTool className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد سجلات صيانة</p>
                </div>
              )}
            </div>
          )}

          {/* سجل النشاطات */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">آخر النشاطات</h3>
              {activityLog.length > 0 ? (
                <div className="relative">
                  <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  {activityLog.map((activity, index) => (
                    <div key={index} className="relative flex gap-4 pb-6">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                          <span className="text-xs text-gray-500">{activity.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiClock className="text-6xl mx-auto mb-4 opacity-50" />
                  <p>لا توجد نشاطات مسجلة</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal التعديل */}
      <DriverModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        driver={driver}
      />
    </div>
  );
};

export default DriverProfile;
