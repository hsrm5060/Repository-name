import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiPlus,
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPrinter,
  FiCalendar,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
  FiBell,
  FiList,
  FiBarChart2,
  FiLink
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  fetchOwnershipVehicles,
  removeOwnershipVehicle,
  setOwnershipFilterStatus,
  setOwnershipSearchQuery
} from '../store/slices/ownershipVehiclesSlice';
import OwnershipVehicleModal from '../components/OwnershipVehicles/OwnershipVehicleModal';
import OwnershipDetailsModal from '../components/OwnershipVehicles/OwnershipDetailsModal';
import PayOwnershipInstallmentModal from '../components/OwnershipVehicles/PayOwnershipInstallmentModal';
import PaymentChart from '../components/OwnershipVehicles/PaymentChart';
import InstallmentsCalendar from '../components/OwnershipVehicles/InstallmentsCalendar';
import EditInstallmentsModal from '../components/OwnershipVehicles/EditInstallmentsModal';
import EmptyState from '../components/common/EmptyState';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';
import api from '../services/api';

const OwnershipVehicles = () => {
  const dispatch = useDispatch();
  const { ownershipVehicles, filterStatus, searchQuery, loading } = useSelector((state) => state.ownershipVehicles);

  // States للفلاتر المتقدمة
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [exportFormat, setExportFormat] = useState('json');
  const [showAlerts, setShowAlerts] = useState(true);

  // States للنوافذ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEditInstallmentsOpen, setIsEditInstallmentsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeView, setActiveView] = useState('cards'); // cards, chart, calendar

  useEffect(() => {
    dispatch(fetchOwnershipVehicles());
  }, [dispatch]);

  // استخراج قائمة السائقين الفريدة
  const uniqueDrivers = useMemo(() => {
    const drivers = [...new Set(ownershipVehicles.map(v => v.driver_name).filter(Boolean))];
    return drivers.sort();
  }, [ownershipVehicles]);

  // حساب الأقساط المتأخرة والقريبة
  const alerts = useMemo(() => {
    const today = new Date();
    const overdueInstallments = [];
    const upcomingInstallments = [];

    ownershipVehicles.forEach(vehicle => {
      if (vehicle.status === 'completed') return;

      if (vehicle.installments) {
        vehicle.installments.forEach(inst => {
          if (inst.status === 'pending') {
            const dueDate = new Date(inst.due_date);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              overdueInstallments.push({
                ...inst,
                vehicle_plate: vehicle.vehicle_plate,
                driver_name: vehicle.driver_name,
                contract_number: vehicle.contract_number,
                days_overdue: Math.abs(diffDays)
              });
            } else if (diffDays <= 7) {
              upcomingInstallments.push({
                ...inst,
                vehicle_plate: vehicle.vehicle_plate,
                driver_name: vehicle.driver_name,
                contract_number: vehicle.contract_number,
                days_remaining: diffDays
              });
            }
          }
        });
      }
    });

    return { overdueInstallments, upcomingInstallments };
  }, [ownershipVehicles]);


  // تصفية وبحث وترتيب
  const filteredAndSortedVehicles = useMemo(() => {
    let result = ownershipVehicles.filter(vehicle => {
      // فلتر الحالة
      const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;

      // فلتر البحث
      const matchesSearch = (vehicle.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.vehicle_plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.vehicle_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.contract_number || '').toLowerCase().includes(searchQuery.toLowerCase());

      // فلتر السائق
      const matchesDriver = filterDriver === 'all' || vehicle.driver_name === filterDriver;

      // فلتر التاريخ
      let matchesDate = true;
      if (filterDateFrom) {
        matchesDate = matchesDate && new Date(vehicle.start_date) >= new Date(filterDateFrom);
      }
      if (filterDateTo) {
        matchesDate = matchesDate && new Date(vehicle.start_date) <= new Date(filterDateTo);
      }

      return matchesStatus && matchesSearch && matchesDriver && matchesDate;
    });

    // الترتيب
    result.sort((a, b) => {
      let valueA, valueB;
      switch (sortBy) {
        case 'total_price':
          valueA = parseFloat(a.total_price) || 0;
          valueB = parseFloat(b.total_price) || 0;
          break;
        case 'remaining_amount':
          valueA = parseFloat(a.remaining_amount) || 0;
          valueB = parseFloat(b.remaining_amount) || 0;
          break;
        case 'completion_percentage':
          valueA = parseFloat(a.completion_percentage) || 0;
          valueB = parseFloat(b.completion_percentage) || 0;
          break;
        case 'start_date':
          valueA = new Date(a.start_date).getTime();
          valueB = new Date(b.start_date).getTime();
          break;
        case 'end_date':
          valueA = new Date(a.end_date).getTime();
          valueB = new Date(b.end_date).getTime();
          break;
        default:
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return result;
  }, [ownershipVehicles, filterStatus, searchQuery, filterDriver, filterDateFrom, filterDateTo, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredAndSortedVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // إعادة تعيين الصفحة عند تغيير الفلاتر
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, filterDriver, filterDateFrom, filterDateTo, sortBy, sortOrder]);

  // حساب الإحصائيات
  const stats = {
    total: ownershipVehicles.length,
    active: ownershipVehicles.filter(v => v.status === 'active').length,
    completed: ownershipVehicles.filter(v => v.status === 'completed').length,
    defaulted: ownershipVehicles.filter(v => v.status === 'defaulted').length,
    totalValue: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.total_price || 0), 0),
    totalPaid: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.paid_amount || 0) + parseFloat(v.down_payment || 0), 0),
    totalRemaining: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.remaining_amount || 0), 0)
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العقد؟')) {
      try {
        await dispatch(removeOwnershipVehicle(vehicleId)).unwrap();
        toast.success('تم حذف العقد بنجاح');
        dispatch(fetchOwnershipVehicles());
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف العقد');
      }
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsModalOpen(true);
  };

  const handlePayInstallment = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsPayModalOpen(true);
  };

  const handleEditInstallments = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditInstallmentsOpen(true);
  };

  // إنشاء دين تلقائي عند التعثر
  const handleCreateDebt = async (vehicle) => {
    if (!window.confirm(`هل تريد إنشاء دين للسائق ${vehicle.driver_name} بقيمة ${vehicle.remaining_amount?.toLocaleString()} ر.س؟`)) {
      return;
    }
    try {
      const response = await api.post(`/ownership/${vehicle.id}/create-debt`);
      toast.success('تم إنشاء الدين وربطه بصفحة الديون بنجاح');
      dispatch(fetchOwnershipVehicles());
    } catch (error) {
      if (error.response?.data?.debtId) {
        toast.info('يوجد دين مسجل مسبقاً لهذا العقد');
      } else {
        toast.error('حدث خطأ أثناء إنشاء الدين');
      }
    }
  };

  // طباعة العقد
  const handlePrint = (vehicle) => {
    const printContent = `
      <html dir="rtl">
        <head>
          <title>عقد تمليك - ${vehicle.contract_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { color: #666; }
            .value { font-weight: bold; }
            .progress-bar { background: #eee; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 10px; }
            .progress-fill { background: #3b82f6; height: 100%; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>عقد تمليك مركبة</h1>
            <p>رقم العقد: ${vehicle.contract_number}</p>
          </div>
          <div class="section">
            <div class="section-title">معلومات المركبة</div>
            <div class="row"><span class="label">رقم اللوحة:</span><span class="value">${vehicle.vehicle_plate}</span></div>
            <div class="row"><span class="label">نوع المركبة:</span><span class="value">${vehicle.vehicle_type}</span></div>
          </div>
          <div class="section">
            <div class="section-title">معلومات السائق</div>
            <div class="row"><span class="label">اسم السائق:</span><span class="value">${vehicle.driver_name}</span></div>
          </div>
          <div class="section">
            <div class="section-title">المعلومات المالية</div>
            <div class="row"><span class="label">قيمة المركبة:</span><span class="value">${(vehicle.total_price || 0).toLocaleString()} ر.س</span></div>
            <div class="row"><span class="label">الدفعة المقدمة:</span><span class="value">${(vehicle.down_payment || 0).toLocaleString()} ر.س</span></div>
            <div class="row"><span class="label">المبلغ المسدد:</span><span class="value">${(vehicle.paid_amount || 0).toLocaleString()} ر.س</span></div>
            <div class="row"><span class="label">المبلغ المتبقي:</span><span class="value">${(vehicle.remaining_amount || 0).toLocaleString()} ر.س</span></div>
            <div class="row"><span class="label">القسط الشهري:</span><span class="value">${(vehicle.monthly_installment || 0).toLocaleString()} ر.س</span></div>
          </div>
          <div class="section">
            <div class="section-title">فترة العقد</div>
            <div class="row"><span class="label">تاريخ البدء:</span><span class="value">${new Date(vehicle.start_date).toLocaleDateString('ar-SA')}</span></div>
            <div class="row"><span class="label">تاريخ الانتهاء:</span><span class="value">${new Date(vehicle.end_date).toLocaleDateString('ar-SA')}</span></div>
            <div class="row"><span class="label">المدة:</span><span class="value">${vehicle.installment_period} شهر</span></div>
          </div>
          <div class="section">
            <div class="section-title">نسبة الإنجاز: ${vehicle.completion_percentage || 0}%</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${vehicle.completion_percentage || 0}%"></div></div>
          </div>
          <div class="footer">
            <p>تم الطباعة بتاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'active': return 'نشط';
      case 'defaulted': return 'متعثر';
      default: return 'غير معروف';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="w-5 h-5" />;
      case 'active': return <FiClock className="w-5 h-5" />;
      case 'defaulted': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiTruck className="w-5 h-5" />;
    }
  };

  // دالة تصدير البيانات
  const handleExport = () => {
    const dataForExport = filteredAndSortedVehicles.map(vehicle => ({
      'رقم_العقد': vehicle.contract_number,
      'رقم_اللوحة': vehicle.vehicle_plate,
      'نوع_المركبة': vehicle.vehicle_type,
      'السائق': vehicle.driver_name,
      'قيمة_المركبة': vehicle.total_price,
      'الدفعة_المقدمة': vehicle.down_payment,
      'المبلغ_المسدد': vehicle.paid_amount,
      'المبلغ_المتبقي': vehicle.remaining_amount,
      'القسط_الشهري': vehicle.monthly_installment,
      'عدد_الأشهر': vehicle.installment_period,
      'تاريخ_البدء': vehicle.start_date,
      'تاريخ_الانتهاء': vehicle.end_date,
      'نسبة_الإنجاز': `${vehicle.completion_percentage}%`,
      'الحالة': getStatusText(vehicle.status),
      'ملاحظات': vehicle.notes || '-'
    }));

    if (exportFormat === 'csv') {
      exportToCSV(dataForExport, 'عقود_التمليك');
    } else {
      exportToJSON(dataForExport, 'عقود_التمليك');
    }
    toast.success('تم تصدير البيانات بنجاح');
  };

  // تبديل ترتيب العمود
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* تنبيهات الأقساط */}
      {showAlerts && (alerts.overdueInstallments.length > 0 || alerts.upcomingInstallments.length > 0) && (
        <div className="space-y-3">
          {alerts.overdueInstallments.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-red-800">
                  <FiAlertCircle className="w-5 h-5" />
                  <span className="font-semibold">أقساط متأخرة ({alerts.overdueInstallments.length})</span>
                </div>
                <button onClick={() => setShowAlerts(false)} className="text-red-600 hover:text-red-800 text-sm">
                  إخفاء
                </button>
              </div>
              <div className="space-y-2">
                {alerts.overdueInstallments.slice(0, 3).map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-red-100">
                    <div>
                      <span className="font-medium">{inst.vehicle_plate}</span>
                      <span className="text-gray-600 mx-2">-</span>
                      <span className="text-gray-600">{inst.driver_name}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-red-600 font-semibold">{(inst.amount || 0).toLocaleString()} ر.س</span>
                      <span className="text-red-500 text-sm mr-2">متأخر {inst.days_overdue} يوم</span>
                    </div>
                  </div>
                ))}
                {alerts.overdueInstallments.length > 3 && (
                  <p className="text-sm text-red-600">و {alerts.overdueInstallments.length - 3} أقساط أخرى...</p>
                )}
              </div>
            </div>
          )}

          {alerts.upcomingInstallments.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <FiBell className="w-5 h-5" />
                  <span className="font-semibold">أقساط قريبة الاستحقاق ({alerts.upcomingInstallments.length})</span>
                </div>
              </div>
              <div className="space-y-2">
                {alerts.upcomingInstallments.slice(0, 3).map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-100">
                    <div>
                      <span className="font-medium">{inst.vehicle_plate}</span>
                      <span className="text-gray-600 mx-2">-</span>
                      <span className="text-gray-600">{inst.driver_name}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-yellow-700 font-semibold">{(inst.amount || 0).toLocaleString()} ر.س</span>
                      <span className="text-yellow-600 text-sm mr-2">
                        {inst.days_remaining === 0 ? 'اليوم' : `خلال ${inst.days_remaining} يوم`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي العقود</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عقود نشطة</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عقود مكتملة</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عقود متعثرة</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.defaulted}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات مالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className="w-6 h-6" />
            <p className="text-sm opacity-90">إجمالي قيمة العقود</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalValue.toLocaleString()} ر.س</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FiCheckCircle className="w-6 h-6" />
            <p className="text-sm opacity-90">إجمالي المبالغ المسددة</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalPaid.toLocaleString()} ر.س</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="w-6 h-6" />
            <p className="text-sm opacity-90">إجمالي المبالغ المتبقية</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalRemaining.toLocaleString()} ر.س</p>
        </div>
      </div>

      {/* شريط الأدوات والفلاتر */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* الصف الأول: البحث والأزرار الرئيسية */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن سائق، مركبة، أو رقم عقد..."
                value={searchQuery}
                onChange={(e) => dispatch(setOwnershipSearchQuery(e.target.value))}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => dispatch(setOwnershipFilterStatus(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="defaulted">متعثر</option>
            </select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            {/* أزرار تبديل العرض */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveView('cards')}
                className={`px-3 py-2 ${activeView === 'cards' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                title="عرض البطاقات"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('chart')}
                className={`px-3 py-2 border-x ${activeView === 'chart' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                title="الرسم البياني"
              >
                <FiBarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-2 ${activeView === 'calendar' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                title="التقويم"
              >
                <FiCalendar className="w-4 h-4" />
              </button>
            </div>

            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">تصدير</span>
            </button>
            <button
              onClick={() => {
                setSelectedVehicle(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">إضافة عقد</span>
            </button>
          </div>
        </div>

        {/* الصف الثاني: الفلاتر المتقدمة */}
        <div className="flex flex-wrap gap-3 pt-3 border-t">
          {/* فلتر السائق */}
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4 text-gray-500" />
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع السائقين</option>
              {uniqueDrivers.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>

          {/* فلتر التاريخ */}
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              placeholder="من"
            />
            <span className="text-gray-500">إلى</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              placeholder="إلى"
            />
          </div>

          {/* الترتيب */}
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm text-gray-600">ترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="created_at">تاريخ الإنشاء</option>
              <option value="total_price">قيمة المركبة</option>
              <option value="remaining_amount">المبلغ المتبقي</option>
              <option value="completion_percentage">نسبة الإنجاز</option>
              <option value="start_date">تاريخ البدء</option>
              <option value="end_date">تاريخ الانتهاء</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>


      {/* عرض الرسم البياني */}
      {activeView === 'chart' && (
        <PaymentChart vehicles={ownershipVehicles} />
      )}

      {/* عرض التقويم */}
      {activeView === 'calendar' && (
        <InstallmentsCalendar vehicles={ownershipVehicles} />
      )}

      {/* قائمة المركبات */}
      {activeView === 'cards' && loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
        </div>
      ) : activeView === 'cards' && filteredAndSortedVehicles.length === 0 ? (
        <EmptyState
          icon={FiTruck}
          title="لا توجد عقود تمليك"
          description={searchQuery || filterStatus !== 'all' || filterDriver !== 'all'
            ? "لم يتم العثور على نتائج مطابقة للبحث"
            : "ابدأ بإضافة عقد تمليك جديد"}
          actionLabel="إضافة عقد"
          onAction={() => setIsModalOpen(true)}
        />
      ) : activeView === 'cards' && (
        <>
          {/* معلومات النتائج */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedVehicles.length)} من {filteredAndSortedVehicles.length} عقد
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={6}>6 لكل صفحة</option>
              <option value={9}>9 لكل صفحة</option>
              <option value={12}>12 لكل صفحة</option>
              <option value={24}>24 لكل صفحة</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* رأس البطاقة */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(vehicle.status)}`}>
                        {getStatusIcon(vehicle.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.vehicle_plate}</h3>
                        <p className="text-sm text-gray-600">{vehicle.vehicle_type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>

                  {/* معلومات السائق */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">السائق:</span>
                      <span className="font-semibold text-gray-900">{vehicle.driver_name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">رقم العقد:</span>
                      <span className="font-mono text-sm text-blue-600">{vehicle.contract_number}</span>
                    </div>
                  </div>

                  {/* المبالغ */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">قيمة المركبة:</span>
                      <span className="font-semibold text-gray-900">{(vehicle.total_price || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">الدفعة المقدمة:</span>
                      <span className="font-semibold text-blue-600">{(vehicle.down_payment || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">المبلغ المسدد:</span>
                      <span className="font-semibold text-green-600">{(vehicle.paid_amount || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">المبلغ المتبقي:</span>
                      <span className="font-semibold text-orange-600">{(vehicle.remaining_amount || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-gray-600">القسط الشهري:</span>
                      <span className="font-bold text-gray-900">{(vehicle.monthly_installment || 0).toLocaleString()} ر.س</span>
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>نسبة الإنجاز</span>
                      <span className="font-semibold">{vehicle.completion_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${vehicle.status === 'completed' ? 'bg-green-600' :
                          vehicle.status === 'defaulted' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        style={{ width: `${vehicle.completion_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* الفترة */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">تاريخ البدء</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(vehicle.start_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">تاريخ الانتهاء</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(vehicle.end_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-xs text-gray-600">
                        المدة: {vehicle.installment_period || 0} شهر
                      </p>
                    </div>
                  </div>

                  {/* الأزرار */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleViewDetails(vehicle)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm"
                    >
                      <FiEye className="w-4 h-4" />
                      التفاصيل
                    </button>
                    {vehicle.status !== 'completed' && (
                      <button
                        onClick={() => handlePayInstallment(vehicle)}
                        className="flex-1 min-w-[80px] px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm"
                      >
                        <FiDollarSign className="w-4 h-4" />
                        دفع
                      </button>
                    )}
                    <button
                      onClick={() => handleEditInstallments(vehicle)}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      title="تعديل جدول الأقساط"
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                    {vehicle.status === 'defaulted' && (
                      <button
                        onClick={() => handleCreateDebt(vehicle)}
                        className="px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                        title="ربط بالديون"
                      >
                        <FiLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handlePrint(vehicle)}
                      className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                      title="طباعة العقد"
                    >
                      <FiPrinter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                      title="تعديل العقد"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      title="حذف العقد"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}


      {/* النوافذ المنبثقة */}
      {isModalOpen && (
        <OwnershipVehicleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {isDetailsModalOpen && (
        <OwnershipDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {isPayModalOpen && (
        <PayOwnershipInstallmentModal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      {isEditInstallmentsOpen && (
        <EditInstallmentsModal
          isOpen={isEditInstallmentsOpen}
          onClose={() => {
            setIsEditInstallmentsOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
          onUpdate={() => dispatch(fetchOwnershipVehicles())}
        />
      )}
    </div>
  );
};

export default OwnershipVehicles;
