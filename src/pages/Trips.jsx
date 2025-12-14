import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrips, createTrip, modifyTrip, removeTrip, updateTripStatus, setTripFilterStatus } from '../store/slices/tripsSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiClock, FiSearch, FiDownload, FiPrinter, FiTruck, FiUser, FiDollarSign, FiCheckCircle, FiXCircle, FiPlay } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TripModal from '../components/Trips/TripModal';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { exportToCSV, printData } from '../utils/exportUtils';

const Trips = () => {
  const dispatch = useDispatch();
  const { trips, filterStatus, loading } = useSelector((state) => state.trips);
  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch = searchQuery === '' ||
        (trip.driver_name && trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.from_location && trip.from_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.to_location && trip.to_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.customer_name && trip.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [trips, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // إحصائيات
  const stats = useMemo(() => ({
    total: trips.length,
    completed: trips.filter(t => t.status === 'completed').length,
    inProgress: trips.filter(t => t.status === 'in-progress').length,
    pending: trips.filter(t => t.status === 'pending').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
    totalRevenue: trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.fare || 0), 0),
    totalDistance: trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0),
  }), [trips]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in-progress': return 'قيد التنفيذ';
      case 'pending': return 'معلقة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  const handleAddTrip = () => {
    setSelectedTrip(null);
    setIsModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
      try {
        await dispatch(removeTrip(id)).unwrap();
        toast.success('تم حذف الرحلة بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الرحلة');
      }
    }
  };

  const handleSaveTrip = async (tripData) => {
    try {
      if (selectedTrip) {
        await dispatch(modifyTrip({ id: selectedTrip.id, data: tripData })).unwrap();
        toast.success('تم تحديث بيانات الرحلة');
      } else {
        await dispatch(createTrip(tripData)).unwrap();
        toast.success('تم إضافة الرحلة بنجاح');
      }
      setIsModalOpen(false);
      dispatch(fetchTrips());
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الرحلة');
    }
  };

  const handleStatusChange = async (trip, newStatus) => {
    try {
      await dispatch(updateTripStatus({ id: trip.id, status: newStatus })).unwrap();
      toast.success('تم تحديث حالة الرحلة');
      dispatch(fetchTrips());
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredTrips.map(t => ({
      'السائق': t.driver_name,
      'من': t.from_location,
      'إلى': t.to_location,
      'التاريخ': t.trip_date,
      'الوقت': t.trip_time,
      'المسافة': t.distance,
      'الأجرة': t.fare,
      'الحالة': getStatusText(t.status),
      'العميل': t.customer_name || '-',
    }));
    exportToCSV(exportData, 'trips');
    toast.success('تم تصدير البيانات');
  };

  const handlePrint = () => {
    const dataForPrint = filteredTrips.map(t => ({
      'السائق': t.driver_name,
      'من': t.from_location,
      'إلى': t.to_location,
      'الأجرة': `${t.fare} ر.س`,
      'الحالة': getStatusText(t.status),
    }));
    printData(dataForPrint, 'قائمة الرحلات');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الرحلات</h1>
          <p className="text-gray-600 mt-1">إجمالي الرحلات: {filteredTrips.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
            <FiDownload /> CSV
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <FiPrinter />
          </button>
          <button onClick={handleAddTrip} className="btn-primary flex items-center gap-2">
            <FiPlus /> إضافة رحلة
          </button>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
          <p className="text-sm text-gray-600">الإجمالي</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card text-center bg-green-50">
          <p className="text-sm text-green-600">مكتملة</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card text-center bg-blue-50">
          <p className="text-sm text-blue-600">قيد التنفيذ</p>
          <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card text-center bg-orange-50">
          <p className="text-sm text-orange-600">معلقة</p>
          <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card text-center bg-red-50">
          <p className="text-sm text-red-600">ملغاة</p>
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card text-center bg-emerald-50">
          <p className="text-sm text-emerald-600">الإيرادات</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.totalRevenue.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card text-center bg-purple-50">
          <p className="text-sm text-purple-600">المسافة (كم)</p>
          <p className="text-2xl font-bold text-purple-700">{stats.totalDistance.toLocaleString()}</p>
        </motion.div>
      </div>

      <div className="card">
        {/* البحث والفلاتر */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="البحث بالسائق، الموقع، أو العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pr-10 w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => dispatch(setTripFilterStatus(status))}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'الكل' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : paginatedTrips.length === 0 ? (
          <EmptyState
            icon={FiMapPin}
            title="لا توجد رحلات"
            description="لم يتم إضافة أي رحلات بعد. ابدأ بإضافة رحلة جديدة."
            action={{ label: 'إضافة رحلة', onClick: handleAddTrip }}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {paginatedTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiUser className="text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{trip.driver_name || 'غير محدد'}</h3>
                          {trip.plate_number && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FiTruck className="text-xs" /> {trip.plate_number}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusText(trip.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiMapPin className="text-red-500" />
                          <span>من: <strong className="text-gray-800">{trip.from_location}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiMapPin className="text-green-500" />
                          <span>إلى: <strong className="text-gray-800">{trip.to_location}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiClock className="text-primary-600" />
                          <span>{trip.trip_date} - {trip.trip_time}</span>
                        </div>
                        <div className="text-gray-600">
                          <span>المسافة: <strong className="text-gray-800">{trip.distance} كم</strong></span>
                        </div>
                      </div>

                      {trip.customer_name && (
                        <div className="mt-2 text-sm text-gray-500">
                          العميل: {trip.customer_name} {trip.customer_phone && `- ${trip.customer_phone}`}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center px-4 py-2 bg-primary-50 rounded-lg">
                        <p className="text-xs text-gray-600">الأجرة</p>
                        <p className="text-xl font-bold text-primary-600">{parseFloat(trip.fare || 0).toLocaleString()} ر.س</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {/* أزرار تغيير الحالة */}
                        {trip.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(trip, 'in-progress')}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-600"
                            title="بدء الرحلة"
                          >
                            <FiPlay />
                          </button>
                        )}
                        {trip.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusChange(trip, 'completed')}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-green-600"
                            title="إكمال الرحلة"
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        {(trip.status === 'pending' || trip.status === 'in-progress') && (
                          <button
                            onClick={() => handleStatusChange(trip, 'cancelled')}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-red-600"
                            title="إلغاء الرحلة"
                          >
                            <FiXCircle />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTrip(trip)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTrips.length}
          />
        )}
      </div>

      <TripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrip}
        trip={selectedTrip}
        drivers={drivers}
        vehicles={vehicles}
      />
    </div>
  );
};

export default Trips;
