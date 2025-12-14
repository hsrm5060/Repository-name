import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiPlus, 
  FiSearch, 
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiTruck,
  FiTag,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { 
  fetchDebts,
  removeDebt,
  setDebtFilterStatus, 
  setDebtSearchQuery
} from '../store/slices/debtsSlice';

// أنواع الديون
const DEBT_TYPES = {
  advance: { label: 'سلفة', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  loan: { label: 'قرض', color: 'bg-purple-100 text-purple-800', icon: '🏦' },
  violation: { label: 'مخالفات', color: 'bg-red-100 text-red-800', icon: '🚨' },
  maintenance: { label: 'صيانة', color: 'bg-orange-100 text-orange-800', icon: '🔧' },
  insurance: { label: 'تأمين', color: 'bg-green-100 text-green-800', icon: '🛡️' },
  fuel: { label: 'وقود', color: 'bg-yellow-100 text-yellow-800', icon: '⛽' },
  other: { label: 'أخرى', color: 'bg-gray-100 text-gray-800', icon: '📋' }
};
import DebtModal from '../components/Debts/DebtModal';
import DebtDetailsModal from '../components/Debts/DebtDetailsModal';
import PayInstallmentModal from '../components/Debts/PayInstallmentModal';
import DebtAlerts from '../components/Debts/DebtAlerts';
import EmptyState from '../components/common/EmptyState';
import { exportToJSON } from '../utils/exportUtils';

const Debts = () => {
  const dispatch = useDispatch();
  const { debts, filterStatus, searchQuery, loading, error } = useSelector((state) => state.debts);

  useEffect(() => {
    dispatch(fetchDebts()).catch(err => {
      console.error('خطأ في تحميل الديون:', err);
      toast.error('حدث خطأ في تحميل البيانات');
    });
  }, [dispatch]);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards or table
  const [filterType, setFilterType] = useState('all'); // فلتر نوع الدين

  // تصفية وبحث الديون
  const filteredDebts = debts.filter(debt => {
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    const matchesType = filterType === 'all' || debt.debt_type === filterType;
    const matchesSearch = (debt.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (debt.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (debt.vehicle_plate || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // حساب الإحصائيات
  const stats = {
    total: debts.reduce((sum, d) => sum + parseFloat(d.total_debt || 0), 0),
    paid: debts.reduce((sum, d) => sum + parseFloat(d.paid_amount || 0), 0),
    remaining: debts.reduce((sum, d) => sum + parseFloat(d.remaining_amount || 0), 0),
    overdue: debts.filter(d => d.status === 'overdue').length
  };

  const handleEdit = (debt) => {
    setSelectedDebt(debt);
    setIsDebtModalOpen(true);
  };

  const handleDelete = async (debtId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدين؟')) {
      try {
        await dispatch(removeDebt(debtId)).unwrap();
        toast.success('تم حذف الدين بنجاح');
        dispatch(fetchDebts());
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الدين');
      }
    }
  };

  const handleViewDetails = (debt) => {
    setSelectedDebt(debt);
    setIsDetailsModalOpen(true);
  };

  const handlePayInstallment = (debt) => {
    setSelectedDebt(debt);
    setIsPayModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'مسدد';
      case 'partial': return 'مسدد جزئياً';
      case 'overdue': return 'متأخر';
      default: return 'نشط';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-5 h-5" />;
      case 'partial': return <FiClock className="w-5 h-5" />;
      case 'overdue': return <FiAlertCircle className="w-5 h-5" />;
      default: return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const exportToExcel = () => {
    const dataForExport = filteredDebts.map(debt => {
      const debtType = DEBT_TYPES[debt.debt_type] || DEBT_TYPES.other;
      return {
        'السائق': debt.driver_name,
        'نوع_الدين': debtType.label,
        'المركبة': debt.vehicle_plate || '-',
        'إجمالي_الدين': debt.total_debt,
        'الدفعة_المقدمة': debt.down_payment || 0,
        'المبلغ_المسدد': debt.paid_amount,
        'المبلغ_المتبقي': debt.remaining_amount,
        'عدد_الأقساط': debt.installments?.length || 0,
        'أقساط_مسددة': debt.installments?.filter(i => i.status === 'paid').length || 0,
        'تاريخ_الإنشاء': debt.created_date,
        'تاريخ_الاستحقاق': debt.due_date,
        'الحالة': debt.status === 'paid' ? 'مسدد' : 
                  debt.status === 'partial' ? 'مسدد جزئياً' : 
                  debt.status === 'overdue' ? 'متأخر' : 'نشط',
        'ملاحظات': debt.notes || '-'
      };
    });

    exportToJSON(dataForExport, 'الديون');
    toast.success('تم تصدير البيانات بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* تنبيهات الأقساط */}
      <DebtAlerts onPayClick={handlePayInstallment} />

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الديون</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total.toLocaleString()} ر.س
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المبلغ المسدد</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.paid.toLocaleString()} ر.س
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المبلغ المتبقي</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.remaining.toLocaleString()} ر.س
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ديون متأخرة</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.overdue}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* شريط الأدوات */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن سائق أو ملاحظات..."
                value={searchQuery}
                onChange={(e) => dispatch(setDebtSearchQuery(e.target.value))}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => dispatch(setDebtFilterStatus(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="partial">مسدد جزئياً</option>
                <option value="paid">مسدد</option>
                <option value="overdue">متأخر</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأنواع</option>
                {Object.entries(DEBT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.icon} {type.label}</option>
                ))}
              </select>

              <button
                onClick={exportToExcel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              {/* أزرار تبديل العرض */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="عرض البطاقات"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  title="عرض الجدول"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDebt(null);
              setIsDebtModalOpen(true);
            }}
            className="w-full lg:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            إضافة دين جديد
          </button>
        </div>
      </div>

      {/* قائمة الديون */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">حدث خطأ</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => dispatch(fetchDebts())}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filteredDebts.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title="لا توجد ديون"
          description={searchQuery || filterStatus !== 'all' 
            ? "لم يتم العثور على نتائج مطابقة للبحث" 
            : "ابدأ بإضافة دين جديد"}
          actionLabel="إضافة دين"
          onAction={() => setIsDebtModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* عرض الجدول */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السائق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المركبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجمالي الدين</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المسدد</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المتبقي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الأقساط</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الاستحقاق</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDebts.map((debt) => {
                  const debtType = DEBT_TYPES[debt.debt_type] || DEBT_TYPES.other;
                  const paidInstallments = debt.installments?.filter(i => i.status === 'paid').length || 0;
                  const totalInstallments = debt.installments?.length || 0;
                  return (
                    <tr key={debt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{debt.driver_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${debtType.color}`}>
                          {debtType.icon} {debtType.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{debt.vehicle_plate || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {parseFloat(debt.total_debt || 0).toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        {parseFloat(debt.paid_amount || 0).toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-orange-600">
                        {parseFloat(debt.remaining_amount || 0).toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {paidInstallments} / {totalInstallments}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                          {getStatusIcon(debt.status)}
                          {getStatusText(debt.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(debt.due_date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(debt)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="التفاصيل"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {debt.status !== 'paid' && (
                            <button
                              onClick={() => handlePayInstallment(debt)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="دفع"
                            >
                              <FiDollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(debt)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="تعديل"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(debt.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
        </div>
      ) : (
        /* عرض البطاقات */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDebts.map((debt) => {
            const debtType = DEBT_TYPES[debt.debt_type] || DEBT_TYPES.other;
            return (
            <div key={debt.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* نوع الدين */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${debtType.color}`}>
                    <FiTag className="w-3 h-3" />
                    {debtType.label}
                  </span>
                  {debt.vehicle_plate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      <FiTruck className="w-3 h-3" />
                      {debt.vehicle_plate}
                    </span>
                  )}
                </div>

                {/* رأس البطاقة */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(debt.status)}`}>
                      {getStatusIcon(debt.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{debt.driver_name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(debt.status)}`}>
                        {getStatusText(debt.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* المبالغ */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">إجمالي الدين:</span>
                    <span className="font-semibold text-gray-900">{parseFloat(debt.total_debt || 0).toLocaleString()} ر.س</span>
                  </div>
                  {parseFloat(debt.down_payment || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الدفعة المقدمة:</span>
                      <span className="font-semibold text-blue-600">{parseFloat(debt.down_payment || 0).toLocaleString()} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المبلغ المسدد:</span>
                    <span className="font-semibold text-green-600">{parseFloat(debt.paid_amount || 0).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المبلغ المتبقي:</span>
                    <span className="font-semibold text-orange-600">{parseFloat(debt.remaining_amount || 0).toLocaleString()} ر.س</span>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>نسبة السداد</span>
                    <span>{Math.round(((debt.paid_amount || 0) / (debt.total_debt || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${((debt.paid_amount || 0) / (debt.total_debt || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* الأقساط */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الأقساط:</span>
                    <span className="font-medium">
                      {debt.installments?.filter(i => i.status === 'paid').length || 0} / {debt.installments?.length || 0}
                    </span>
                  </div>
                </div>

                {/* التواريخ */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الإنشاء:</span>
                    <span className="text-gray-900">{new Date(debt.created_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الاستحقاق:</span>
                    <span className={debt.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {new Date(debt.due_date).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>

                {/* الملاحظات */}
                {debt.notes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{debt.notes}</p>
                  </div>
                )}

                {/* الأزرار */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewDetails(debt)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <FiEye className="w-4 h-4" />
                    التفاصيل
                  </button>
                  {debt.status !== 'paid' && (
                    <button
                      onClick={() => handlePayInstallment(debt)}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm"
                    >
                      <FiDollarSign className="w-4 h-4" />
                      دفع
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(debt)}
                    className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* النوافذ المنبثقة */}
      {isDebtModalOpen && (
        <DebtModal
          isOpen={isDebtModalOpen}
          onClose={() => {
            setIsDebtModalOpen(false);
            setSelectedDebt(null);
          }}
          debt={selectedDebt}
        />
      )}

      {isDetailsModalOpen && (
        <DebtDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDebt(null);
          }}
          debt={selectedDebt}
        />
      )}

      {isPayModalOpen && (
        <PayInstallmentModal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedDebt(null);
          }}
          debt={selectedDebt}
        />
      )}
    </div>
  );
};

export default Debts;
