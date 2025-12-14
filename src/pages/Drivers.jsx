import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDrivers, createDriver, modifyDriver, removeDriver, setSearchQuery, setFilterStatus } from '../store/slices/driversSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiDownload, FiPrinter, 
  FiEye, FiGrid, FiList, FiUsers, FiUserCheck, FiUserX, FiAlertTriangle,
  FiCalendar, FiClock
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import DriverModal from '../components/Drivers/DriverModal';
import Pagination from '../components/common/Pagination';
import { exportToCSV, exportToJSON, printData } from '../utils/exportUtils';

const Drivers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drivers, searchQuery, filterStatus, loading } = useSelector((state) => state.drivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [licenseFilter, setLicenseFilter] = useState('all'); // all, valid, expiring, expired

  useEffect(() => {
    dispatch(fetchDrivers()).unwrap().catch((error) => {
      console.error('خطأ في جلب السائقين:', error);
      toast.error('حدث خطأ في جلب بيانات السائقين');
    });
  }, [dispatch]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: drivers.length,
      active: drivers.filter(d => d.status === 'active').length,
      inactive: drivers.filter(d => d.status === 'inactive').length,
      suspended: drivers.filter(d => d.status === 'suspended').length,
      expiringLicenses: drivers.filter(d => {
        if (!d.license_expiry && !d.licenseExpiry) return false;
        const expiry = new Date(d.license_expiry || d.licenseExpiry);
        return expiry > today && expiry <= thirtyDaysLater;
      }).length,
      expiredLicenses: drivers.filter(d => {
        if (!d.license_expiry && !d.licenseExpiry) return false;
        const expiry = new Date(d.license_expiry || d.licenseExpiry);
        return expiry <= today;
      }).length,
    };
  }, [drivers]);

  const filteredAndSortedDrivers = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    let filtered = drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           driver.phone.includes(searchQuery) ||
                           (driver.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || driver.status === filterStatus;
      
      // فلتر الرخصة
      let matchesLicense = true;
      if (licenseFilter !== 'all') {
        const expiry = new Date(driver.license_expiry || driver.licenseExpiry);
        if (licenseFilter === 'valid') {
          matchesLicense = expiry > thirtyDaysLater;
        } else if (licenseFilter === 'expiring') {
          matchesLicense = expiry > today && expiry <= thirtyDaysLater;
        } else if (licenseFilter === 'expired') {
          matchesLicense = expiry <= today;
        }
      }
      
      return matchesSearch && matchesFilter && matchesLicense;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [drivers, searchQuery, filterStatus, sortBy, sortOrder, licenseFilter]);

  const totalPages = Math.ceil(filteredAndSortedDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredAndSortedDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السائق؟')) {
      try {
        await dispatch(removeDriver(id)).unwrap();
        toast.success('تم حذف السائق بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف السائق');
      }
    }
  };

  const handleSaveDriver = async (driverData) => {
    try {
      if (selectedDriver) {
        await dispatch(modifyDriver({ id: selectedDriver.id, data: driverData })).unwrap();
        toast.success('تم تحديث بيانات السائق');
      } else {
        await dispatch(createDriver(driverData)).unwrap();
        toast.success('تم إضافة السائق بنجاح');
        dispatch(fetchDrivers());
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const getLicenseStatus = (driver) => {
    const expiry = new Date(driver.license_expiry || driver.licenseExpiry);
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= today) return { status: 'expired', color: 'bg-red-100 text-red-700', text: 'منتهية' };
    if (expiry <= thirtyDaysLater) return { status: 'expiring', color: 'bg-orange-100 text-orange-700', text: 'قريبة الانتهاء' };
    return { status: 'valid', color: 'bg-green-100 text-green-700', text: 'سارية' };
  };

  const handleExportCSV = () => {
    const exportData = filteredAndSortedDrivers.map(d => ({
      'الاسم': d.name,
      'الهاتف': d.phone,
      'البريد': d.email,
      'رقم الرخصة': d.license_number || d.licenseNumber,
      'انتهاء الرخصة': d.license_expiry || d.licenseExpiry,
      'الحالة': d.status === 'active' ? 'نشط' : d.status === 'inactive' ? 'غير نشط' : 'موقوف',
      'المركبة': d.vehicle,
      'التقييم': d.rating,
    }));
    exportToCSV(exportData, 'drivers');
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handleExportJSON = () => {
    exportToJSON(filteredAndSortedDrivers, 'drivers');
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handlePrint = () => {
    const dataForPrint = filteredAndSortedDrivers.map(d => ({
      'الاسم': d.name,
      'الهاتف': d.phone,
      'الحالة': d.status === 'active' ? 'نشط' : 'غير نشط',
      'المركبة': d.vehicle,
      'التقييم': d.rating
    }));
    printData(dataForPrint, 'قائمة السائقين');
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
              <p className="text-sm opacity-90">إجمالي السائقين</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FiUsers className="w-10 h-10 opacity-80" />
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
            <FiUserCheck className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">غير نشط</p>
              <p className="text-3xl font-bold mt-1">{stats.inactive}</p>
            </div>
            <FiUserX className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">موقوف</p>
              <p className="text-3xl font-bold mt-1">{stats.suspended}</p>
            </div>
            <FiUserX className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setLicenseFilter('expiring')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">رخص قريبة الانتهاء</p>
              <p className="text-3xl font-bold mt-1">{stats.expiringLicenses}</p>
            </div>
            <FiClock className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setLicenseFilter('expired')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">رخص منتهية</p>
              <p className="text-3xl font-bold mt-1">{stats.expiredLicenses}</p>
            </div>
            <FiAlertTriangle className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* العنوان وأزرار التصدير */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة السائقين</h1>
          <p className="text-gray-600 mt-1">عرض: {filteredAndSortedDrivers.length} سائق</p>
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
          <button onClick={handleAddDriver} className="btn-primary flex items-center gap-2">
            <FiPlus /> إضافة سائق
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
              placeholder="البحث بالاسم، الهاتف، أو البريد..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="input-field pr-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className="input-field lg:w-36"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="suspended">موقوف</option>
          </select>

          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="input-field lg:w-44"
          >
            <option value="all">جميع الرخص</option>
            <option value="valid">رخص سارية</option>
            <option value="expiring">قريبة الانتهاء (30 يوم)</option>
            <option value="expired">رخص منتهية</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field lg:w-36"
          >
            <option value="name">الاسم</option>
            <option value="rating">التقييم</option>
            <option value="license_expiry">انتهاء الرخصة</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-field lg:w-28"
          >
            <option value="asc">تصاعدي</option>
            <option value="desc">تنازلي</option>
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
            <option value="100">100</option>
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

        {/* عرض Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {paginatedDrivers.map((driver) => {
                const licenseStatus = getLicenseStatus(driver);
                return (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={driver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} 
                          alt={driver.name} 
                          className="w-14 h-14 rounded-full shadow-md object-cover" 
                        />
                        <div>
                          <h3 className="font-bold text-gray-800">{driver.name}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            driver.status === 'active' ? 'bg-green-100 text-green-700' : 
                            driver.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {driver.status === 'active' ? 'نشط' : driver.status === 'suspended' ? 'موقوف' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/drivers/${driver.id}`)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                          title="عرض"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="تعديل"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="حذف"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="text-primary-600 w-4 h-4" />
                        <span>{driver.phone}</span>
                      </div>
                      {driver.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiMail className="text-primary-600 w-4 h-4" />
                          <span className="truncate">{driver.email}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">الرخصة:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${licenseStatus.color}`}>
                            {licenseStatus.text}
                          </span>
                        </div>
                        <p className="text-gray-600">المركبة: <span className="font-medium text-gray-800">{driver.vehicle || '-'}</span></p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-bold text-gray-800">{driver.rating || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/drivers/${driver.id}`)}
                        className="w-full mt-3 btn-primary py-2 text-sm flex items-center justify-center gap-2"
                      >
                        <FiEye /> عرض الملف الكامل
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* عرض الجدول */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السائق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الهاتف</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">البريد</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المركبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الرخصة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التقييم</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDrivers.map((driver) => {
                  const licenseStatus = getLicenseStatus(driver);
                  return (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={driver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=random`} 
                            alt={driver.name} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{driver.name}</p>
                            <p className="text-xs text-gray-500">{driver.national_id || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{driver.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{driver.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{driver.vehicle || '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${licenseStatus.color}`}>
                            {licenseStatus.text}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {driver.license_expiry || driver.licenseExpiry || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.status === 'active' ? 'bg-green-100 text-green-700' : 
                          driver.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {driver.status === 'active' ? 'نشط' : driver.status === 'suspended' ? 'موقوف' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-bold">{driver.rating || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/drivers/${driver.id}`)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                            title="عرض"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditDriver(driver)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="تعديل"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="حذف"
                          >
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedDrivers.length}
          />
        )}
      </div>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDriver}
        driver={selectedDriver}
      />
    </div>
  );
};

export default Drivers;
