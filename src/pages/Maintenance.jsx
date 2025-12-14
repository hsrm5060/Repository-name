import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMaintenance, 
  createMaintenance, 
  modifyMaintenance, 
  removeMaintenance,
  fetchMaintenanceStats,
  fetchUpcomingMaintenance,
  fetchOverdueMaintenance,
  setSearchQuery,
  setFilterType,
  setFilterStatus,
  clearFilters
} from '../store/slices/maintenanceSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { FiPlus, FiSearch, FiFilter, FiTool, FiEdit2, FiTrash2, FiEye, FiAlertCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MaintenanceModal from '../components/Maintenance/MaintenanceModal';
import MaintenanceDetailsModal from '../components/Maintenance/MaintenanceDetailsModal';
import EmptyState from '../components/common/EmptyState';

const Maintenance = () => {
  const dispatch = useDispatch();
  const { maintenance, searchQuery, filterType, filterStatus, loading, upcoming, overdue } = useSelector(state => state.maintenance);
  const { vehicles } = useSelector(state => state.vehicles);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchMaintenance());
    dispatch(fetchVehicles());
    dispatch(fetchUpcomingMaintenance(30));
    dispatch(fetchOverdueMaintenance());
    loadStats();
  }, [dispatch]);

  const loadStats = async () => {
    const result = await dispatch(fetchMaintenanceStats({}));
    if (result.payload) {
      setStats(result.payload);
    }
  };

  const handleAddMaintenance = () => {
    setSelectedMaintenance(null);
    setIsModalOpen(true);
  };

  const handleEditMaintenance = (maint) => {
    setSelectedMaintenance(maint);
    setIsModalOpen(true);
  };

  const handleDeleteMaintenance = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        await dispatch(removeMaintenance(id)).unwrap();
        toast.success('تم حذف سجل الصيانة بنجاح');
        loadStats();
      } catch (error) {
        toast.error('فشل حذف سجل الصيانة');
      }
    }
  };

  const handleViewDetails = (maint) => {
    setSelectedMaintenance(maint);
    setIsDetailsModalOpen(true);
  };

  const handleSaveMaintenance = async (maintenanceData) => {
    try {
      if (selectedMaintenance) {
        await dispatch(modifyMaintenance({ id: selectedMaintenance.id, data: maintenanceData })).unwrap();
        toast.success('تم تحديث سجل الصيانة بنجاح');
      } else {
        await dispatch(createMaintenance(maintenanceData)).unwrap();
        toast.success('تم إضافة سجل الصيانة بنجاح');
      }
      setIsModalOpen(false);
      loadStats();
      dispatch(fetchUpcomingMaintenance(30));
      dispatch(fetchOverdueMaintenance());
    } catch (error) {
      toast.error('فشل حفظ سجل الصيانة');
    }
  };

  const typeLabels = {
    oil_change: 'تغيير زيت',
    tire_change: 'تغيير إطارات',
    brake_service: 'صيانة فرامل',
    engine_repair: 'إصلاح محرك',
    transmission: 'ناقل حركة',
    electrical: 'كهربائية',
    ac_service: 'صيانة مكيف',
    general_checkup: 'فحص عام',
    other: 'أخرى'
  };

  const statusLabels = {
    completed: 'مكتملة',
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ'
  };

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800'
  };

  const filteredMaintenance = maintenance.filter(maint => {
    const matchesSearch = 
      maint.maintenance_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maint.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maint.service_provider?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || maint.maintenance_type === filterType;
    const matchesStatus = filterStatus === 'all' || maint.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCost = filteredMaintenance.reduce((sum, maint) => sum + parseFloat(maint.cost || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الصيانة</h1>
          <p className="text-gray-600 mt-1">إدارة صيانة المركبات</p>
        </div>
        <button
          onClick={handleAddMaintenance}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FiPlus /> إضافة صيانة
        </button>
      </div>

      {/* Alerts */}
      {(upcoming.length > 0 || overdue.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {overdue.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-red-600 text-2xl" />
                <div>
                  <p className="font-bold text-red-800">صيانات متأخرة</p>
                  <p className="text-sm text-red-600">{overdue.length} مركبة تحتاج صيانة فورية</p>
                </div>
              </div>
            </div>
          )}
          
          {upcoming.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiClock className="text-orange-600 text-2xl" />
                <div>
                  <p className="font-bold text-orange-800">صيانات قادمة</p>
                  <p className="text-sm text-orange-600">{upcoming.length} مركبة تحتاج صيانة خلال 30 يوم</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي التكاليف</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCost?.toLocaleString()} ر.س</p>
              </div>
              <FiTool className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">عدد الصيانات</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCount}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">متوسط التكلفة</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalCount > 0 ? (stats.totalCost / stats.totalCount).toFixed(0) : 0} ر.س
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">أكثر نوع</p>
            <p className="text-xl font-bold text-gray-800 mt-2">
              {stats.byType?.[0] ? typeLabels[stats.byType[0].maintenance_type] : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم الصيانة، الوصف، المركبة..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => dispatch(setFilterType(e.target.value))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الأنواع</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <button
              onClick={() => dispatch(clearFilters())}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              مسح
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMaintenance.length === 0 ? (
        <EmptyState
          icon={FiTool}
          title="لا توجد سجلات صيانة"
          description="ابدأ بإضافة أول سجل صيانة"
          actionLabel="إضافة صيانة"
          onAction={handleAddMaintenance}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">رقم الصيانة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الصيانة القادمة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaintenance.map((maint) => (
                  <tr key={maint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{maint.maintenance_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{maint.plate_number}</p>
                        <p className="text-xs text-gray-500">{maint.make} {maint.model}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {typeLabels[maint.maintenance_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">{parseFloat(maint.cost).toLocaleString()} ر.س</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(maint.maintenance_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {maint.next_maintenance_date ? new Date(maint.next_maintenance_date).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[maint.status]}`}>
                        {statusLabels[maint.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(maint)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditMaintenance(maint)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="تعديل"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMaintenance(maint.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-700">الإجمالي:</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-blue-600">{totalCost.toLocaleString()} ر.س</span>
                  </td>
                  <td colSpan="4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <MaintenanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMaintenance}
          maintenance={selectedMaintenance}
          vehicles={vehicles}
        />
      )}

      {isDetailsModalOpen && selectedMaintenance && (
        <MaintenanceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          maintenance={selectedMaintenance}
        />
      )}
    </div>
  );
};

export default Maintenance;
