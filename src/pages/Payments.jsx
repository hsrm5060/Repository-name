import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPayments, createPayment, modifyPayment, removePayment, markPaymentAsPaid, setPaymentFilterStatus, setPaymentFilterPlan } from '../store/slices/paymentsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiDownload, FiPrinter, FiSearch, FiFilter, FiUsers, FiTrendingUp, FiGrid, FiList, FiEye, FiEdit2, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PaymentModal from '../components/Payments/PaymentModal';
import MarkAsPaidModal from '../components/Payments/MarkAsPaidModal';
import PaymentDetailsModal from '../components/Payments/PaymentDetailsModal';
import PaymentReceipt from '../components/Payments/PaymentReceipt';
import PaymentAlerts from '../components/Payments/PaymentAlerts';
import PaymentCalendar from '../components/Payments/PaymentCalendar';
import PaymentCharts from '../components/Payments/PaymentCharts';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { exportToCSV, printData } from '../utils/exportUtils';

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, filterStatus, filterPlan, loading } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table, calendar, charts
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('due_date'); // due_date, amount, driver_name
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      // فلتر البحث
      const matchesSearch = searchQuery === '' || 
        (payment.driver_name && payment.driver_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.driver_phone && payment.driver_phone.includes(searchQuery)) ||
        (payment.id && payment.id.toString().includes(searchQuery));
      
      // فلتر الحالة
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      
      // فلتر الخطة
      const matchesPlan = filterPlan === 'all' || payment.plan === filterPlan;
      
      // فلتر التاريخ
      let matchesDate = true;
      if (dateFilter !== 'all' && payment.due_date) {
        const dueDate = new Date(payment.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today') {
          matchesDate = dueDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          matchesDate = dueDate >= today && dueDate <= weekFromNow;
        } else if (dateFilter === 'month') {
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);
          matchesDate = dueDate >= today && dueDate <= monthFromNow;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPlan && matchesDate;
    });

    // الفرز
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'due_date') {
        aValue = new Date(aValue || '9999-12-31');
        bValue = new Date(bValue || '9999-12-31');
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [payments, filterStatus, filterPlan, searchQuery, dateFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // حساب الإحصائيات الشاملة
  const stats = useMemo(() => {
    const allPayments = {
      total: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      paid: payments.filter(p => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      count: payments.length,
      paidCount: payments.filter(p => p.status === 'paid' || p.status === 'completed').length,
      pendingCount: payments.filter(p => p.status === 'pending').length,
      overdueCount: payments.filter(p => p.status === 'overdue').length,
    };

    // إحصائيات حسب الخطة
    const byPlan = {
      daily: {
        total: payments.filter(p => p.plan === 'daily').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        count: payments.filter(p => p.plan === 'daily').length,
        paid: payments.filter(p => p.plan === 'daily' && (p.status === 'paid' || p.status === 'completed')).length,
      },
      weekly: {
        total: payments.filter(p => p.plan === 'weekly').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        count: payments.filter(p => p.plan === 'weekly').length,
        paid: payments.filter(p => p.plan === 'weekly' && (p.status === 'paid' || p.status === 'completed')).length,
      },
      monthly: {
        total: payments.filter(p => p.plan === 'monthly').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        count: payments.filter(p => p.plan === 'monthly').length,
        paid: payments.filter(p => p.plan === 'monthly' && (p.status === 'paid' || p.status === 'completed')).length,
      },
      yearly: {
        total: payments.filter(p => p.plan === 'yearly').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        count: payments.filter(p => p.plan === 'yearly').length,
        paid: payments.filter(p => p.plan === 'yearly' && (p.status === 'paid' || p.status === 'completed')).length,
      },
    };

    return { ...allPayments, byPlan };
  }, [payments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'معلق';
      case 'overdue': return 'متأخر';
      default: return status;
    }
  };

  const getPlanText = (plan) => {
    switch (plan) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      case 'yearly': return 'سنوي';
      default: return plan;
    }
  };

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handlePrintReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدفع؟')) {
      try {
        await dispatch(removePayment(id)).unwrap();
        toast.success('تم حذف الدفع بنجاح');
        dispatch(fetchPayments());
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الدفع');
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (selectedPayment) {
        await dispatch(modifyPayment({ id: selectedPayment.id, data: paymentData })).unwrap();
        toast.success('تم تحديث بيانات الدفع');
      } else {
        await dispatch(createPayment(paymentData)).unwrap();
        toast.success('تم إضافة الدفع بنجاح');
      }
      setIsModalOpen(false);
      dispatch(fetchPayments());
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الدفع');
    }
  };

  const handleMarkAsPaid = (payment) => {
    setSelectedPayment(payment);
    setIsPaidModalOpen(true);
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedPayments.length === 0) {
      toast.warning('الرجاء اختيار مدفوعات أولاً');
      return;
    }
    
    if (window.confirm(`هل تريد تحديد ${selectedPayments.length} مدفوعات كمدفوعة؟`)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        for (const id of selectedPayments) {
          await dispatch(markPaymentAsPaid({ id, data: { paid_date: today, payment_method: 'cash' } })).unwrap();
        }
        toast.success(`تم تحديد ${selectedPayments.length} مدفوعات كمدفوعة`);
        setSelectedPayments([]);
        dispatch(fetchPayments());
      } catch (error) {
        toast.error('حدث خطأ أثناء تحديث المدفوعات');
      }
    }
  };

  const handleSelectPayment = (id) => {
    setSelectedPayments(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === paginatedPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(paginatedPayments.map(p => p.id));
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredPayments.map(p => ({
      'السائق': p.driver_name,
      'المبلغ': p.amount,
      'الخطة': getPlanText(p.plan),
      'الحالة': getStatusText(p.status),
      'تاريخ الاستحقاق': p.due_date,
      'تاريخ الدفع': p.paid_date || '-',
      'طريقة الدفع': p.payment_method || '-',
      'ملاحظات': p.notes || '-'
    }));
    exportToCSV(exportData, 'payments');
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handlePrint = () => {
    const dataForPrint = filteredPayments.map(p => ({
      'السائق': p.driver_name,
      'المبلغ': `${p.amount} ر.س`,
      'الخطة': getPlanText(p.plan),
      'الحالة': getStatusText(p.status),
      'الاستحقاق': p.due_date
    }));
    printData(dataForPrint, 'قائمة المدفوعات');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المدفوعات</h1>
          <p className="text-gray-600 mt-1">إجمالي المدفوعات: {filteredPayments.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* أزرار تبديل العرض */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 flex items-center gap-1 ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiList /> جدول
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 flex items-center gap-1 ${viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiCalendar /> تقويم
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`px-3 py-2 flex items-center gap-1 ${viewMode === 'charts' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <FiBarChart2 /> رسوم بيانية
            </button>
          </div>
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
            <FiDownload /> CSV
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <FiPrinter />
          </button>
          <button onClick={handleAddPayment} className="btn-primary flex items-center gap-2">
            <FiPlus /> إضافة دفعة
          </button>
        </div>
      </div>

      {/* تنبيهات المدفوعات */}
      {showAlerts && (
        <PaymentAlerts 
          payments={payments} 
          onClose={() => setShowAlerts(false)}
          onPaymentClick={handleViewDetails}
        />
      )}

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي المدفوعات</p>
              <p className="text-3xl font-bold">{stats.total.toLocaleString()} ر.س</p>
            </div>
            <FiDollarSign className="text-4xl text-blue-200" />
          </div>
          <div className="text-sm text-blue-100">
            <FiUsers className="inline ml-1" /> {stats.count} سائق
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-sm mb-1">المدفوع</p>
              <p className="text-3xl font-bold">{stats.paid.toLocaleString()} ر.س</p>
            </div>
            <FiCheckCircle className="text-4xl text-green-200" />
          </div>
          <div className="text-sm text-green-100">
            {stats.paidCount} مدفوعة ({((stats.paidCount / stats.count) * 100 || 0).toFixed(0)}%)
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-yellow-100 text-sm mb-1">المعلق</p>
              <p className="text-3xl font-bold">{stats.pending.toLocaleString()} ر.س</p>
            </div>
            <FiClock className="text-4xl text-yellow-200" />
          </div>
          <div className="text-sm text-yellow-100">
            {stats.pendingCount} معلقة
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-red-500 to-red-600 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-red-100 text-sm mb-1">المتأخر</p>
              <p className="text-3xl font-bold">{stats.overdue.toLocaleString()} ر.س</p>
            </div>
            <FiAlertCircle className="text-4xl text-red-200" />
          </div>
          <div className="text-sm text-red-100">
            {stats.overdueCount} متأخرة - يحتاج متابعة!
          </div>
        </motion.div>
      </div>

      {/* إحصائيات حسب الخطة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-primary-600" />
          إحصائيات حسب الخطة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border-r-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">يومي</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byPlan.daily.total.toLocaleString()} ر.س</p>
            <p className="text-xs text-gray-500 mt-1">{stats.byPlan.daily.count} سائق | مدفوع: {stats.byPlan.daily.paid}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-r-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">أسبوعي</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byPlan.weekly.total.toLocaleString()} ر.س</p>
            <p className="text-xs text-gray-500 mt-1">{stats.byPlan.weekly.count} سائق | مدفوع: {stats.byPlan.weekly.paid}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-r-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">شهري</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byPlan.monthly.total.toLocaleString()} ر.س</p>
            <p className="text-xs text-gray-500 mt-1">{stats.byPlan.monthly.count} سائق | مدفوع: {stats.byPlan.monthly.paid}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-r-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">سنوي</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byPlan.yearly.total.toLocaleString()} ر.س</p>
            <p className="text-xs text-gray-500 mt-1">{stats.byPlan.yearly.count} سائق | مدفوع: {stats.byPlan.yearly.paid}</p>
          </div>
        </div>
      </motion.div>

      {/* عرض التقويم */}
      {viewMode === 'calendar' && (
        <PaymentCalendar 
          payments={filteredPayments} 
          onPaymentClick={handleViewDetails}
        />
      )}

      {/* عرض الرسوم البيانية */}
      {viewMode === 'charts' && (
        <PaymentCharts payments={payments} />
      )}

      {/* عرض الجدول */}
      {viewMode === 'table' && (
      <div className="card">
        {/* شريط البحث والفلاتر */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* البحث */}
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم، الرقم، أو رقم الدفعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10 w-full"
              />
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`btn-secondary flex items-center gap-2 ${showAdvancedFilters ? 'bg-primary-100 text-primary-700' : ''}`}
              >
                <FiFilter /> فلاتر متقدمة
              </button>
              {selectedPayments.length > 0 && (
                <button
                  onClick={handleBulkMarkAsPaid}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiCheckCircle /> تحديد كمدفوع ({selectedPayments.length})
                </button>
              )}
            </div>
          </div>

          {/* الفلاتر المتقدمة */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <select
                value={filterStatus}
                onChange={(e) => dispatch(setPaymentFilterStatus(e.target.value))}
                className="input-field"
              >
                <option value="all">جميع الحالات</option>
                <option value="paid">مدفوع</option>
                <option value="pending">معلق</option>
                <option value="overdue">متأخر</option>
              </select>

              <select
                value={filterPlan}
                onChange={(e) => dispatch(setPaymentFilterPlan(e.target.value))}
                className="input-field"
              >
                <option value="all">جميع الخطط</option>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">جميع التواريخ</option>
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="due_date">تاريخ الاستحقاق</option>
                <option value="amount">المبلغ</option>
                <option value="driver_name">اسم السائق</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field"
              >
                <option value="asc">تصاعدي</option>
                <option value="desc">تنازلي</option>
              </select>
            </motion.div>
          )}

          {/* معلومات النتائج */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              عرض {paginatedPayments.length} من {filteredPayments.length} مدفوعات
              {searchQuery && ` (نتائج البحث عن "${searchQuery}")`}
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input-field w-32"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>

        {paginatedPayments.length === 0 ? (
          <EmptyState
            icon={FiDollarSign}
            title="لا توجد مدفوعات"
            description="لم يتم إضافة أي مدفوعات بعد. ابدأ بإضافة دفعة جديدة للنظام."
            action={{
              label: 'إضافة دفعة',
              onClick: handleAddPayment
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === paginatedPayments.length && paginatedPayments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السائق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الخطة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الدفع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedPayments.includes(payment.id) ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelectPayment(payment.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{payment.driver_name}</p>
                          {payment.driver_phone && (
                            <p className="text-xs text-gray-500">{payment.driver_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 font-bold">
                        {parseFloat(payment.amount || 0).toLocaleString()} ر.س
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          payment.plan === 'daily' ? 'bg-purple-100 text-purple-700' :
                          payment.plan === 'weekly' ? 'bg-blue-100 text-blue-700' :
                          payment.plan === 'monthly' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {getPlanText(payment.plan)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" />
                          {payment.due_date}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {payment.paid_date ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <FiCheckCircle />
                            {payment.paid_date}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="عرض التفاصيل"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="تعديل"
                          >
                            <FiEdit2 />
                          </button>
                          {(payment.status === 'paid' || payment.status === 'completed') && (
                            <button
                              onClick={() => handlePrintReceipt(payment)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                              title="طباعة إيصال"
                            >
                              <FiPrinter />
                            </button>
                          )}
                          {payment.status !== 'paid' && payment.status !== 'completed' && (
                            <button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="تحديد كمدفوع"
                            >
                              <FiCheckCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
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
            totalItems={filteredPayments.length}
          />
        )}
      </div>
      )}

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePayment}
        payment={selectedPayment}
      />

      <MarkAsPaidModal
        isOpen={isPaidModalOpen}
        onClose={() => {
          setIsPaidModalOpen(false);
          dispatch(fetchPayments());
        }}
        payment={selectedPayment}
      />

      <PaymentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        payment={selectedPayment}
        onEdit={(p) => {
          setIsDetailsModalOpen(false);
          handleEditPayment(p);
        }}
        onMarkAsPaid={(p) => {
          setIsDetailsModalOpen(false);
          handleMarkAsPaid(p);
        }}
        onPrint={(p) => {
          setIsDetailsModalOpen(false);
          handlePrintReceipt(p);
        }}
      />

      <PaymentReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default Payments;
