import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchVehicles, createVehicle, modifyVehicle, removeVehicle, unassignVehicle, setVehicleSearchQuery, setVehicleFilterStatus } from '../store/slices/vehiclesSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchInsurances } from '../store/slices/insuranceSlice';
import { fetchLicenses } from '../store/slices/licensesSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiTruck, FiUser, FiCalendar, 
  FiDownload, FiPrinter, FiEye, FiGrid, FiList, FiTool, FiShield,
  FiAlertTriangle, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import VehicleModal from '../components/Vehicles/VehicleModal';
import AssignVehicleModal from '../components/Vehicles/AssignVehicleModal';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { exportToCSV, exportToJSON, printData } from '../utils/exportUtils';

const Vehicles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicles, searchQuery, filterStatus, loading } = useSelector((state) => state.vehicles);
  const { drivers } = useSelector((state) => state.drivers);
  const { insurances } = useSelector((state) => state.insurance);
  const { vehicleLicenses } = useSelector((state) => state.licenses);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchInsurances());
    dispatch(fetchLicenses('vehicle'));
  }, [dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('make');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [makeFilter, setMakeFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');


  // حساب الإحصائيات
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // التأمينات المنتهية/قريبة الانتهاء
    const expiredInsurance = insurances.filter(i => new Date(i.expiry_date) <= today).length;
    const expiringInsurance = insurances.filter(i => {
      const expiry = new Date(i.expiry_date);
      return expiry > today && expiry <= thirtyDaysLater;
    }).length;
    
    // الرخص المنتهية/قريبة الانتهاء
    const expiredLicense = vehicleLicenses.filter(l => new Date(l.expiry_date) <= today).length;
    const expiringLicense = vehicleLicenses.filter(l => {
      const expiry = new Date(l.expiry_date);
      return expiry > today && expiry <= thirtyDaysLater;
    }).length;

    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      inactive: vehicles.filter(v => v.status === 'inactive').length,
      assigned: vehicles.filter(v => v.assigned_driver).length,
      unassigned: vehicles.filter(v => !v.assigned_driver && v.status === 'active').length,
      expiredInsurance,
      expiringInsurance,
      expiredLicense,
      expiringLicense,
    };
  }, [vehicles, insurances, vehicleLicenses]);

  // قائمة الماركات الفريدة
  const uniqueMakes = useMemo(() => {
    const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
    return makes.sort();
  }, [vehicles]);

  // دالة للتحقق من حالة التأمين/الرخصة
  const getDocumentStatus = (vehicleId) => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const insurance = insurances.find(i => i.vehicle_id === vehicleId);
    const license = vehicleLicenses.find(l => l.vehicle_id === vehicleId);
    
    let insuranceStatus = 'none';
    let licenseStatus = 'none';
    
    if (insurance) {
      const expiry = new Date(insurance.expiry_date);
      if (expiry <= today) insuranceStatus = 'expired';
      else if (expiry <= thirtyDaysLater) insuranceStatus = 'expiring';
      else insuranceStatus = 'valid';
    }
    
    if (license) {
      const expiry = new Date(license.expiry_date);
      if (expiry <= today) licenseStatus = 'expired';
      else if (expiry <= thirtyDaysLater) licenseStatus = 'expiring';
      else licenseStatus = 'valid';
    }
    
    return { insuranceStatus, licenseStatus };
  };

  const filteredAndSortedVehicles = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = (vehicle.make && vehicle.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (vehicle.model && vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (vehicle.plate_number && vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (vehicle.assigned_driver_name && vehicle.assigned_driver_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
      const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
      
      // فلتر الوثائق
      let matchesDocument = true;
      if (documentFilter !== 'all') {
        const { insuranceStatus, licenseStatus } = getDocumentStatus(vehicle.id);
        if (documentFilter === 'insurance_expired') matchesDocument = insuranceStatus === 'expired';
        else if (documentFilter === 'insurance_expiring') matchesDocument = insuranceStatus === 'expiring';
        else if (documentFilter === 'license_expired') matchesDocument = licenseStatus === 'expired';
        else if (documentFilter === 'license_expiring') matchesDocument = licenseStatus === 'expiring';
        else if (documentFilter === 'all_valid') matchesDocument = insuranceStatus === 'valid' && licenseStatus === 'valid';
      }
      
      return matchesSearch && matchesStatus && matchesMake && matchesDocument;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [vehicles, searchQuery, filterStatus, sortBy, sortOrder, makeFilter, documentFilter, insurances, vehicleLicenses]);

  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredAndSortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'maintenance': return 'صيانة';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
      try {
        await dispatch(removeVehicle(id)).unwrap();
        toast.success('تم حذف المركبة بنجاح');
        dispatch(fetchVehicles());
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف المركبة');
      }
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (selectedVehicle) {
        await dispatch(modifyVehicle({ id: selectedVehicle.id, data: vehicleData })).unwrap();
        toast.success('تم تحديث بيانات المركبة');
      } else {
        await dispatch(createVehicle(vehicleData)).unwrap();
        toast.success('تم إضافة المركبة بنجاح');
      }
      setIsModalOpen(false);
      dispatch(fetchVehicles());
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ المركبة');
    }
  };

  const handleAssignVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  const handleUnassignVehicle = (id) => {
    if (window.confirm('هل تريد إلغاء تخصيص هذه المركبة؟')) {
      dispatch(unassignVehicle(id));
      toast.success('تم إلغاء تخصيص المركبة');
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredAndSortedVehicles.map(v => ({
      'الماركة': v.make,
      'الموديل': v.model,
      'السنة': v.year,
      'رقم اللوحة': v.plate_number,
      'اللون': v.color,
      'الحالة': getStatusText(v.status),
      'السائق': v.assigned_driver_name || '-',
      'المسافة': v.mileage,
    }));
    exportToCSV(exportData, 'vehicles');
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handleExportJSON = () => {
    exportToJSON(filteredAndSortedVehicles, 'vehicles');
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handlePrint = () => {
    const dataForPrint = filteredAndSortedVehicles.map(v => ({
      'الماركة': v.make,
      'الموديل': v.model,
      'اللوحة': v.plate_number,
      'الحالة': getStatusText(v.status),
      'السائق': v.assigned_driver_name || '-'
    }));
    printData(dataForPrint, 'قائمة المركبات');
  };

  return (
    <div className="space-y-6">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي المركبات</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FiTruck className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">نشط</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
            <FiCheckCircle className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">صيانة</p>
              <p className="text-3xl font-bold mt-1">{stats.maintenance}</p>
            </div>
            <FiTool className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl"
          onClick={() => setDocumentFilter('insurance_expiring')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تأمين قريب الانتهاء</p>
              <p className="text-3xl font-bold mt-1">{stats.expiringInsurance}</p>
            </div>
            <FiShield className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl"
          onClick={() => setDocumentFilter('insurance_expired')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تأمين منتهي</p>
              <p className="text-3xl font-bold mt-1">{stats.expiredInsurance}</p>
            </div>
            <FiAlertTriangle className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl"
          onClick={() => setDocumentFilter('license_expired')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">رخص منتهية</p>
              <p className="text-3xl font-bold mt-1">{stats.expiredLicense}</p>
            </div>
            <FiClock className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>
      </div>


      {/* العنوان وأزرار التصدير */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المركبات</h1>
          <p className="text-gray-600 mt-1">عرض: {filteredAndSortedVehicles.length} مركبة</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload /> CSV
          </button>
          <button onClick={handleExportJSON} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload /> JSON
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
            <FiPrinter />
          </button>
          <button onClick={handleAddVehicle} className="btn-primary flex items-center gap-2">
            <FiPlus /> إضافة مركبة
          </button>
        </div>
      </div>

      {/* شريط الفلاتر */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="البحث بالماركة، الموديل، اللوحة، أو السائق..."
              value={searchQuery}
              onChange={(e) => dispatch(setVehicleSearchQuery(e.target.value))}
              className="input-field pr-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setVehicleFilterStatus(e.target.value))}
            className="input-field lg:w-32"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="maintenance">صيانة</option>
            <option value="inactive">غير نشط</option>
          </select>

          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="input-field lg:w-36"
          >
            <option value="all">جميع الماركات</option>
            {uniqueMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>

          <select
            value={documentFilter}
            onChange={(e) => setDocumentFilter(e.target.value)}
            className="input-field lg:w-44"
          >
            <option value="all">جميع الوثائق</option>
            <option value="all_valid">وثائق سارية</option>
            <option value="insurance_expiring">تأمين قريب الانتهاء</option>
            <option value="insurance_expired">تأمين منتهي</option>
            <option value="license_expiring">رخصة قريبة الانتهاء</option>
            <option value="license_expired">رخصة منتهية</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field lg:w-32"
          >
            <option value="make">الماركة</option>
            <option value="model">الموديل</option>
            <option value="year">السنة</option>
            <option value="mileage">المسافة</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="input-field lg:w-24"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>

          {/* أزرار تبديل العرض */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {paginatedVehicles.length === 0 ? (
          <EmptyState
            icon={FiTruck}
            title="لا توجد مركبات"
            description="لم يتم العثور على مركبات مطابقة للبحث"
            action={{ label: 'إضافة مركبة', onClick: handleAddVehicle }}
          />
        ) : viewMode === 'grid' ? (
          /* عرض Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {paginatedVehicles.map((vehicle) => {
                const { insuranceStatus, licenseStatus } = getDocumentStatus(vehicle.id);
                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <img 
                        src={vehicle.image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                      {/* مؤشرات الوثائق */}
                      <div className="absolute top-3 left-3 flex gap-1">
                        {insuranceStatus === 'expired' && (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">تأمين منتهي</span>
                        )}
                        {insuranceStatus === 'expiring' && (
                          <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs">تأمين قريب</span>
                        )}
                        {licenseStatus === 'expired' && (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">رخصة منتهية</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{vehicle.make} {vehicle.model}</h3>
                          <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.plate_number}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="عرض">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditVehicle(vehicle)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="تعديل">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="حذف">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm mb-3">
                        <p className="text-gray-600">اللون: <span className="font-medium">{vehicle.color}</span></p>
                        <p className="text-gray-600">المسافة: <span className="font-medium">{(vehicle.mileage || 0).toLocaleString()} كم</span></p>
                        {vehicle.assigned_driver_name && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <FiUser className="text-green-600" />
                            <span className="font-medium">{vehicle.assigned_driver_name}</span>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                      >
                        <FiEye /> عرض التفاصيل
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* عرض الجدول */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المركبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اللوحة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السائق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المسافة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التأمين</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الرخصة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedVehicles.map((vehicle) => {
                  const { insuranceStatus, licenseStatus } = getDocumentStatus(vehicle.id);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={vehicle.image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'} 
                            alt="" className="w-12 h-12 rounded-lg object-cover" 
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{vehicle.make} {vehicle.model}</p>
                            <p className="text-xs text-gray-500">{vehicle.year} • {vehicle.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">{vehicle.plate_number}</td>
                      <td className="px-4 py-3 text-gray-700">{vehicle.assigned_driver_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{(vehicle.mileage || 0).toLocaleString()} كم</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insuranceStatus === 'valid' ? 'bg-green-100 text-green-700' :
                          insuranceStatus === 'expiring' ? 'bg-orange-100 text-orange-700' :
                          insuranceStatus === 'expired' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {insuranceStatus === 'valid' ? 'ساري' : insuranceStatus === 'expiring' ? 'قريب' : insuranceStatus === 'expired' ? 'منتهي' : 'غير مسجل'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          licenseStatus === 'valid' ? 'bg-green-100 text-green-700' :
                          licenseStatus === 'expiring' ? 'bg-orange-100 text-orange-700' :
                          licenseStatus === 'expired' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {licenseStatus === 'valid' ? 'سارية' : licenseStatus === 'expiring' ? 'قريبة' : licenseStatus === 'expired' ? 'منتهية' : 'غير مسجلة'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {getStatusText(vehicle.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="p-2 hover:bg-green-50 rounded text-green-600" title="عرض">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditVehicle(vehicle)} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="تعديل">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-2 hover:bg-red-50 rounded text-red-600" title="حذف">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedVehicles.length}
          />
        )}
      </div>

      <VehicleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveVehicle} vehicle={selectedVehicle} drivers={drivers} />
      <AssignVehicleModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} vehicle={selectedVehicle} />
    </div>
  );
};

export default Vehicles;
