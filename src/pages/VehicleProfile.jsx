import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, FiTruck, FiUser, FiDollarSign, FiTool, FiShield, 
  FiFileText, FiCalendar, FiEdit2, FiAlertCircle, 
  FiCheckCircle, FiActivity, FiDroplet, FiSettings
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'react-toastify';
import { fetchVehicles, modifyVehicle } from '../store/slices/vehiclesSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchMaintenance } from '../store/slices/maintenanceSlice';
import { fetchInsurances } from '../store/slices/insuranceSlice';
import { fetchLicenses } from '../store/slices/licensesSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';
import { fetchOwnershipVehicles } from '../store/slices/ownershipVehiclesSlice';
import VehicleModal from '../components/Vehicles/VehicleModal';

const VehicleProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { vehicles } = useSelector((state) => state.vehicles);
  const { drivers } = useSelector((state) => state.drivers);
  const { maintenance } = useSelector((state) => state.maintenance);
  const { insurances } = useSelector((state) => state.insurance);
  const { vehicleLicenses } = useSelector((state) => state.licenses);
  const { expenses } = useSelector((state) => state.expenses);
  const { ownershipVehicles } = useSelector((state) => state.ownershipVehicles);

  const [activeTab, setActiveTab] = useState('overview');
  const [vehicle, setVehicle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchMaintenance());
    dispatch(fetchInsurances());
    dispatch(fetchLicenses('vehicle'));
    dispatch(fetchExpenses());
    dispatch(fetchOwnershipVehicles());
  }, [dispatch]);

  useEffect(() => {
    const foundVehicle = vehicles.find(v => v.id === parseInt(id));
    if (foundVehicle) setVehicle(foundVehicle);
    else if (vehicles.length > 0) { toast.error('المركبة غير موجودة'); navigate('/vehicles'); }
  }, [id, vehicles, navigate]);


  const handleEditSave = async (vehicleData) => {
    try {
      await dispatch(modifyVehicle({ id: vehicle.id, data: vehicleData })).unwrap();
      toast.success('تم تحديث بيانات المركبة بنجاح');
      setIsEditModalOpen(false);
      dispatch(fetchVehicles());
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const assignedDriver = drivers.find(d => d.id === vehicle.assigned_driver);
  const vehicleMaintenance = maintenance.filter(m => m.vehicle_id === vehicle.id);
  const vehicleInsurance = insurances.find(i => i.vehicle_id === vehicle.id);
  const vehicleLicense = vehicleLicenses.find(l => l.vehicle_id === vehicle.id);
  const vehicleExpenses = expenses.filter(e => e.vehicle_id === vehicle.id);
  const vehicleOwnership = ownershipVehicles.find(o => o.vehicle_id === vehicle.id);

  // حساب التكاليف
  const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
  const fuelExpenses = vehicleExpenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const otherExpenses = vehicleExpenses.filter(e => !['fuel', 'maintenance'].includes(e.category)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const insuranceCost = vehicleInsurance ? parseFloat(vehicleInsurance.premium || 0) : 0;
  const licenseCost = vehicleLicense ? parseFloat(vehicleLicense.cost || 0) : 0;
  const totalCosts = totalMaintenanceCost + fuelExpenses + otherExpenses + insuranceCost + licenseCost;

  // بيانات رسم التكاليف البياني
  const costChartData = [
    { name: 'الصيانة', value: totalMaintenanceCost, color: '#ef4444' },
    { name: 'الوقود', value: fuelExpenses, color: '#f59e0b' },
    { name: 'التأمين', value: insuranceCost, color: '#3b82f6' },
    { name: 'الترخيص', value: licenseCost, color: '#8b5cf6' },
    { name: 'أخرى', value: otherExpenses, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // بيانات الصيانة الشهرية
  const monthlyMaintenanceData = [];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthMaintenance = vehicleMaintenance.filter(m => {
      const mDate = new Date(m.date);
      return mDate.getMonth() === date.getMonth() && mDate.getFullYear() === date.getFullYear();
    });
    const monthExpenses = vehicleExpenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === date.getMonth() && eDate.getFullYear() === date.getFullYear();
    });
    monthlyMaintenanceData.unshift({
      month: months[date.getMonth()],
      صيانة: monthMaintenance.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0),
      مصروفات: monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    });
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: FiTruck },
    { id: 'costs', label: 'التكاليف', icon: FiDollarSign },
    { id: 'maintenance', label: 'الصيانة', icon: FiTool },
    { id: 'documents', label: 'المستندات', icon: FiFileText },
  ];


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'maintenance': return 'في الصيانة';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header مع زر التعديل */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/vehicles')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowRight className="w-5 h-5" />
            <span>العودة للمركبات</span>
          </button>
          
          {/* زر التعديل المباشر */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiEdit2 className="w-5 h-5" />
            <span>تعديل المركبة</span>
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* صورة المركبة */}
          <div className="w-full md:w-48 h-48 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <FiTruck className="w-24 h-24 text-white" />
          </div>

          {/* معلومات المركبة */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.plate_number}</h1>
                <p className="text-lg text-gray-600">{vehicle.brand} {vehicle.model} - {vehicle.year}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FiActivity className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <p className="text-sm text-gray-500">عداد الكيلومترات</p>
                <p className="font-bold text-gray-900">{(vehicle.mileage || 0).toLocaleString()} كم</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FiUser className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <p className="text-sm text-gray-500">السائق</p>
                <p className="font-bold text-gray-900">{assignedDriver?.name || 'غير معين'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
                <p className="text-sm text-gray-500">إجمالي التكاليف</p>
                <p className="font-bold text-gray-900">{totalCosts.toLocaleString()} ر.س</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FiTool className="w-6 h-6 mx-auto text-red-600 mb-1" />
                <p className="text-sm text-gray-500">عمليات الصيانة</p>
                <p className="font-bold text-gray-900">{vehicleMaintenance.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* معلومات المركبة */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTruck className="text-primary-600" />
                  معلومات المركبة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-500">رقم اللوحة:</span><span className="font-medium">{vehicle.plate_number}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">الماركة:</span><span className="font-medium">{vehicle.brand}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">الموديل:</span><span className="font-medium">{vehicle.model}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">سنة الصنع:</span><span className="font-medium">{vehicle.year}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">اللون:</span><span className="font-medium">{vehicle.color || 'غير محدد'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">نوع الوقود:</span><span className="font-medium">{vehicle.fuel_type || 'بنزين'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">رقم الشاسيه:</span><span className="font-medium">{vehicle.vin || 'غير محدد'}</span></div>
                </div>
              </div>

              {/* حالة التأمين والترخيص */}
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${vehicleInsurance ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <FiShield className={`w-8 h-8 ${vehicleInsurance ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <h4 className="font-bold text-gray-900">التأمين</h4>
                      {vehicleInsurance ? (
                        <>
                          <p className="text-sm text-gray-600">ينتهي: {new Date(vehicleInsurance.end_date).toLocaleDateString('ar-SA')}</p>
                          <p className="text-sm text-gray-600">الشركة: {vehicleInsurance.company}</p>
                        </>
                      ) : (
                        <p className="text-sm text-red-600">لا يوجد تأمين</p>
                      )}
                    </div>
                    {vehicleInsurance ? <FiCheckCircle className="w-6 h-6 text-green-600 mr-auto" /> : <FiAlertCircle className="w-6 h-6 text-red-600 mr-auto" />}
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${vehicleLicense ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <FiFileText className={`w-8 h-8 ${vehicleLicense ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <h4 className="font-bold text-gray-900">الترخيص</h4>
                      {vehicleLicense ? (
                        <>
                          <p className="text-sm text-gray-600">ينتهي: {new Date(vehicleLicense.expiry_date).toLocaleDateString('ar-SA')}</p>
                          <p className="text-sm text-gray-600">النوع: {vehicleLicense.license_type}</p>
                        </>
                      ) : (
                        <p className="text-sm text-red-600">لا يوجد ترخيص</p>
                      )}
                    </div>
                    {vehicleLicense ? <FiCheckCircle className="w-6 h-6 text-green-600 mr-auto" /> : <FiAlertCircle className="w-6 h-6 text-red-600 mr-auto" />}
                  </div>
                </div>

                {vehicleOwnership && (
                  <div className="p-4 rounded-xl bg-blue-50">
                    <div className="flex items-center gap-3">
                      <FiSettings className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-gray-900">التمليك</h4>
                        <p className="text-sm text-gray-600">المبلغ: {parseFloat(vehicleOwnership.total_price || 0).toLocaleString()} ر.س</p>
                        <p className="text-sm text-gray-600">المتبقي: {parseFloat(vehicleOwnership.remaining_amount || 0).toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* تبويب التكاليف مع الرسم البياني */}
          {activeTab === 'costs' && (
            <div className="space-y-6">
              {/* ملخص التكاليف */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <FiTool className="w-8 h-8 mx-auto text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">الصيانة</p>
                  <p className="text-xl font-bold text-red-600">{totalMaintenanceCost.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl text-center">
                  <FiDroplet className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600">الوقود</p>
                  <p className="text-xl font-bold text-yellow-600">{fuelExpenses.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <FiShield className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">التأمين</p>
                  <p className="text-xl font-bold text-blue-600">{insuranceCost.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <FiFileText className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">الترخيص</p>
                  <p className="text-xl font-bold text-purple-600">{licenseCost.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl text-center">
                  <FiDollarSign className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-600">أخرى</p>
                  <p className="text-xl font-bold text-gray-600">{otherExpenses.toLocaleString()} ر.س</p>
                </div>
              </div>

              {/* الرسوم البيانية */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* رسم دائري لتوزيع التكاليف */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع التكاليف</h3>
                  {costChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {costChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      لا توجد تكاليف مسجلة
                    </div>
                  )}
                </div>

                {/* رسم بياني شهري */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">التكاليف الشهرية (آخر 6 أشهر)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyMaintenanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} ر.س`} />
                      <Legend />
                      <Bar dataKey="صيانة" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="مصروفات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* إجمالي التكاليف */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100">إجمالي التكاليف</p>
                    <p className="text-3xl font-bold">{totalCosts.toLocaleString()} ر.س</p>
                  </div>
                  <FiDollarSign className="w-16 h-16 text-primary-300" />
                </div>
              </div>
            </div>
          )}


          {/* تبويب الصيانة */}
          {activeTab === 'maintenance' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">سجل الصيانة</h3>
              {vehicleMaintenance.length > 0 ? (
                <div className="space-y-3">
                  {vehicleMaintenance.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          m.status === 'completed' ? 'bg-green-100' : m.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <FiTool className={`w-6 h-6 ${
                            m.status === 'completed' ? 'text-green-600' : m.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.type || m.description}</p>
                          <p className="text-sm text-gray-500">{new Date(m.date).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{parseFloat(m.cost || 0).toLocaleString()} ر.س</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          m.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          m.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {m.status === 'completed' ? 'مكتمل' : m.status === 'in_progress' ? 'قيد التنفيذ' : 'مجدول'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiTool className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد سجلات صيانة</p>
                </div>
              )}
            </div>
          )}

          {/* تبويب المستندات */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FiShield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-bold">وثيقة التأمين</h4>
                    <p className="text-sm text-gray-500">{vehicleInsurance ? 'متوفرة' : 'غير متوفرة'}</p>
                  </div>
                </div>
                {vehicleInsurance && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>الشركة: {vehicleInsurance.company}</p>
                    <p>رقم الوثيقة: {vehicleInsurance.policy_number}</p>
                    <p>تاريخ الانتهاء: {new Date(vehicleInsurance.end_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FiFileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <h4 className="font-bold">رخصة السير</h4>
                    <p className="text-sm text-gray-500">{vehicleLicense ? 'متوفرة' : 'غير متوفرة'}</p>
                  </div>
                </div>
                {vehicleLicense && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>رقم الرخصة: {vehicleLicense.license_number}</p>
                    <p>النوع: {vehicleLicense.license_type}</p>
                    <p>تاريخ الانتهاء: {new Date(vehicleLicense.expiry_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FiCalendar className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-bold">الفحص الدوري</h4>
                    <p className="text-sm text-gray-500">{vehicle.inspection_date ? 'محدد' : 'غير محدد'}</p>
                  </div>
                </div>
                {vehicle.inspection_date && (
                  <p className="text-sm text-gray-600">تاريخ الفحص: {new Date(vehicle.inspection_date).toLocaleDateString('ar-SA')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal تعديل المركبة */}
      <VehicleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        vehicle={vehicle}
        drivers={drivers}
      />
    </div>
  );
};

export default VehicleProfile;
