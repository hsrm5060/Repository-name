import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiTrendingUp, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiClock, FiSearch,
  FiFilter, FiDownload, FiEye, FiTruck, FiPercent,
  FiPlus, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { 
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';
import { fetchOwnershipVehicles, createOwnershipVehicle, modifyOwnershipVehicle, removeOwnershipVehicle } from '../store/slices/ownershipVehiclesSlice';
import { fetchPayments, createPayment, modifyPayment, removePayment } from '../store/slices/paymentsSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { exportToCSV } from '../utils/exportUtils';
import Pagination from '../components/common/Pagination';
import ContractTypeModal from '../components/Contracts/ContractTypeModal';
import RentalContractModal from '../components/Contracts/RentalContractModal';
import ContractDetailsModal from '../components/Contracts/ContractDetailsModal';
import ContractAlerts from '../components/Contracts/ContractAlerts';
import OwnershipVehicleModal from '../components/OwnershipVehicles/OwnershipVehicleModal';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const DriversContracts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const { ownershipVehicles, loading: ownershipLoading } = useSelector(state => state.ownershipVehicles);
  const { payments, loading: paymentsLoading } = useSelector(state => state.payments);
  const { drivers } = useSelector(state => state.drivers);
  const { vehicles } = useSelector(state => state.vehicles);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isOwnershipModalOpen, setIsOwnershipModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    dispatch(fetchOwnershipVehicles());
    dispatch(fetchPayments());
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // تحديد سائقي التمليك
  const ownershipDriverIds = useMemo(() => 
    ownershipVehicles.map(o => o.driver_id), [ownershipVehicles]);

  // تحديد سائقي الإيجار (لديهم مدفوعات وليسوا في التمليك)
  const rentalDriverIds = useMemo(() => {
    const paymentDriverIds = [...new Set(payments.map(p => p.driver_id))];
    return paymentDriverIds.filter(id => !ownershipDriverIds.includes(id));
  }, [payments, ownershipDriverIds]);

  // إحصائيات التمليك
  const ownershipStats = useMemo(() => {
    const active = ownershipVehicles.filter(v => v.status === 'active');
    const completed = ownershipVehicles.filter(v => v.status === 'completed');
    const defaulted = ownershipVehicles.filter(v => v.status === 'defaulted');
    
    return {
      total: ownershipVehicles.length,
      active: active.length,
      completed: completed.length,
      defaulted: defaulted.length,
      totalValue: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.total_price || 0), 0),
      totalPaid: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.paid_amount || 0) + parseFloat(v.down_payment || 0), 0),
      totalRemaining: ownershipVehicles.reduce((sum, v) => sum + parseFloat(v.remaining_amount || 0), 0),
      monthlyExpected: active.reduce((sum, v) => sum + parseFloat(v.monthly_installment || 0), 0),
    };
  }, [ownershipVehicles]);

  // إحصائيات الإيجار
  const rentalStats = useMemo(() => {
    const rentalPayments = payments.filter(p => !ownershipDriverIds.includes(p.driver_id));
    
    return {
      total: rentalPayments.length,
      totalAmount: rentalPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      paid: rentalPayments.filter(p => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      pending: rentalPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      overdue: rentalPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      paidCount: rentalPayments.filter(p => p.status === 'paid' || p.status === 'completed').length,
      pendingCount: rentalPayments.filter(p => p.status === 'pending').length,
      overdueCount: rentalPayments.filter(p => p.status === 'overdue').length,
      uniqueDrivers: rentalDriverIds.length,
      byPlan: {
        daily: rentalPayments.filter(p => p.plan === 'daily').length,
        weekly: rentalPayments.filter(p => p.plan === 'weekly').length,
        monthly: rentalPayments.filter(p => p.plan === 'monthly').length,
        yearly: rentalPayments.filter(p => p.plan === 'yearly').length,
      }
    };
  }, [payments, ownershipDriverIds, rentalDriverIds]);

  // إحصائيات السائقين
  const driversStats = useMemo(() => ({
    totalDrivers: drivers.length,
    ownershipDrivers: ownershipDriverIds.length,
    rentalDrivers: rentalDriverIds.length,
    activeDrivers: drivers.filter(d => d.status === 'active').length,
    noContract: drivers.length - ownershipDriverIds.length - rentalDriverIds.length,
  }), [drivers, ownershipDriverIds, rentalDriverIds]);

  // بيانات الرسوم البيانية
  const contractTypeData = [
    { name: 'تمليك', value: ownershipDriverIds.length, color: '#8b5cf6' },
    { name: 'إيجار', value: rentalDriverIds.length, color: '#10b981' },
    { name: 'بدون عقد', value: driversStats.noContract, color: '#9ca3af' },
  ].filter(d => d.value > 0);

  const ownershipStatusData = [
    { name: 'نشط', value: ownershipStats.active, color: '#10b981' },
    { name: 'مكتمل', value: ownershipStats.completed, color: '#3b82f6' },
    { name: 'متعثر', value: ownershipStats.defaulted, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const rentalPlanData = [
    { name: 'يومي', value: rentalStats.byPlan.daily, color: '#8b5cf6' },
    { name: 'أسبوعي', value: rentalStats.byPlan.weekly, color: '#3b82f6' },
    { name: 'شهري', value: rentalStats.byPlan.monthly, color: '#10b981' },
    { name: 'سنوي', value: rentalStats.byPlan.yearly, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // قائمة العقود المدمجة
  const allContracts = useMemo(() => {
    const ownership = ownershipVehicles.map(o => ({
      id: `ownership-${o.id}`,
      type: 'ownership',
      driver_id: o.driver_id,
      driver_name: o.driver_name,
      vehicle: o.vehicle_plate,
      amount: o.total_price,
      paid: parseFloat(o.paid_amount || 0) + parseFloat(o.down_payment || 0),
      remaining: o.remaining_amount,
      status: o.status,
      start_date: o.start_date,
      end_date: o.end_date,
      completion: o.completion_percentage || 0,
      monthly: o.monthly_installment,
    }));

    const rental = rentalDriverIds.map(driverId => {
      const driverPayments = payments.filter(p => p.driver_id === driverId);
      const driver = drivers.find(d => d.id === driverId);
      const totalPaid = driverPayments.filter(p => p.status === 'paid' || p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalPending = driverPayments.filter(p => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const hasOverdue = driverPayments.some(p => p.status === 'overdue');
      
      return {
        id: `rental-${driverId}`,
        type: 'rental',
        driver_id: driverId,
        driver_name: driver?.name || driverPayments[0]?.driver_name || 'غير معروف',
        vehicle: driver?.vehicle || '-',
        amount: totalPaid + totalPending,
        paid: totalPaid,
        remaining: totalPending,
        status: hasOverdue ? 'overdue' : totalPending > 0 ? 'active' : 'paid',
        payments_count: driverPayments.length,
        plan: driverPayments[0]?.plan || 'monthly',
      };
    });

    return [...ownership, ...rental];
  }, [ownershipVehicles, payments, drivers, rentalDriverIds]);

  // فلترة العقود
  const filteredContracts = useMemo(() => {
    return allContracts.filter(contract => {
      const matchesTab = activeTab === 'all' || contract.type === activeTab;
      const matchesSearch = searchQuery === '' || 
        contract.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.vehicle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
      
      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [allContracts, activeTab, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': case 'paid': return 'bg-blue-100 text-blue-700';
      case 'defaulted': case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'paid': return 'مدفوع';
      case 'defaulted': return 'متعثر';
      case 'overdue': return 'متأخر';
      default: return status;
    }
  };

  const handleExport = () => {
    const data = filteredContracts.map(c => ({
      'النوع': c.type === 'ownership' ? 'تمليك' : 'إيجار',
      'السائق': c.driver_name,
      'المركبة': c.vehicle,
      'إجمالي المبلغ': c.amount,
      'المدفوع': c.paid,
      'المتبقي': c.remaining,
      'الحالة': getStatusText(c.status),
    }));
    exportToCSV(data, 'drivers-contracts');
    toast.success('تم تصدير البيانات');
  };

  const isLoading = ownershipLoading || paymentsLoading;

  const handleSelectContractType = (type) => {
    setIsTypeModalOpen(false);
    setSelectedContract(null);
    if (type === 'ownership') {
      setIsOwnershipModalOpen(true);
    } else {
      setIsRentalModalOpen(true);
    }
  };

  const handleEditContract = (contract) => {
    if (contract.type === 'ownership') {
      const ownershipData = ownershipVehicles.find(o => o.id === parseInt(contract.id.replace('ownership-', '')));
      setSelectedContract(ownershipData);
      setIsOwnershipModalOpen(true);
    } else {
      const driverPayments = payments.filter(p => p.driver_id === contract.driver_id);
      if (driverPayments.length > 0) {
        setSelectedContract(driverPayments[0]);
        setIsRentalModalOpen(true);
      }
    }
  };

  const handleDeleteContract = async (contract) => {
    const confirmMsg = contract.type === 'ownership' 
      ? 'هل أنت متأكد من حذف عقد التمليك؟ سيتم حذف جميع الأقساط المرتبطة.'
      : 'هل أنت متأكد من حذف عقد الإيجار؟';
    
    if (window.confirm(confirmMsg)) {
      try {
        if (contract.type === 'ownership') {
          const ownershipId = parseInt(contract.id.replace('ownership-', ''));
          await dispatch(removeOwnershipVehicle(ownershipId)).unwrap();
        } else {
          // حذف جميع مدفوعات السائق
          const driverPayments = payments.filter(p => p.driver_id === contract.driver_id);
          for (const payment of driverPayments) {
            await dispatch(removePayment(payment.id)).unwrap();
          }
        }
        toast.success('تم حذف العقد بنجاح');
        dispatch(fetchOwnershipVehicles());
        dispatch(fetchPayments());
      } catch (error) {
        toast.error('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleSaveOwnership = async (data) => {
    try {
      if (selectedContract) {
        await dispatch(modifyOwnershipVehicle({ id: selectedContract.id, data })).unwrap();
        toast.success('تم تحديث عقد التمليك');
      } else {
        await dispatch(createOwnershipVehicle(data)).unwrap();
        toast.success('تم إنشاء عقد التمليك');
      }
      setIsOwnershipModalOpen(false);
      setSelectedContract(null);
      dispatch(fetchOwnershipVehicles());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleSaveRental = async (data) => {
    try {
      if (selectedContract) {
        await dispatch(modifyPayment({ id: selectedContract.id, data })).unwrap();
        toast.success('تم تحديث عقد الإيجار');
      } else {
        await dispatch(createPayment(data)).unwrap();
        toast.success('تم إنشاء عقد الإيجار');
      }
      setIsRentalModalOpen(false);
      setSelectedContract(null);
      dispatch(fetchPayments());
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">عقود السائقين</h1>
          <p className="text-gray-600 mt-1">نظرة شاملة على جميع عقود التمليك والإيجار</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <FiDownload /> تصدير
          </button>
          <button onClick={() => setIsTypeModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> إضافة عقد جديد
          </button>
        </div>
      </div>

      {/* تنبيهات العقود */}
      <ContractAlerts 
        ownershipVehicles={ownershipVehicles} 
        payments={payments}
        onDismiss={handleDismissAlert}
      />

      {/* إحصائيات السائقين */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
          <FiUsers className="text-3xl text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">إجمالي السائقين</p>
          <p className="text-2xl font-bold text-gray-800">{driversStats.totalDrivers}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card text-center bg-purple-50">
          <FiTruck className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-purple-600">سائقي التمليك</p>
          <p className="text-2xl font-bold text-purple-700">{driversStats.ownershipDrivers}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card text-center bg-green-50">
          <FiCalendar className="text-3xl text-green-500 mx-auto mb-2" />
          <p className="text-sm text-green-600">سائقي الإيجار</p>
          <p className="text-2xl font-bold text-green-700">{driversStats.rentalDrivers}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card text-center bg-blue-50">
          <FiCheckCircle className="text-3xl text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-blue-600">سائقين نشطين</p>
          <p className="text-2xl font-bold text-blue-700">{driversStats.activeDrivers}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card text-center bg-gray-50">
          <FiAlertCircle className="text-3xl text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">بدون عقد</p>
          <p className="text-2xl font-bold text-gray-700">{driversStats.noContract}</p>
        </motion.div>
      </div>

      {/* إحصائيات مالية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إحصائيات التمليك */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiTruck className="text-purple-600" /> عقود التمليك
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">إجمالي القيمة</p>
              <p className="text-xl font-bold text-purple-700">{ownershipStats.totalValue.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">المحصل</p>
              <p className="text-xl font-bold text-green-700">{ownershipStats.totalPaid.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">المتبقي</p>
              <p className="text-xl font-bold text-orange-700">{ownershipStats.totalRemaining.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">الأقساط الشهرية</p>
              <p className="text-xl font-bold text-blue-700">{ownershipStats.monthlyExpected.toLocaleString()} ر.س</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">نشط: {ownershipStats.active}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">مكتمل: {ownershipStats.completed}</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">متعثر: {ownershipStats.defaulted}</span>
          </div>
        </motion.div>

        {/* إحصائيات الإيجار */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiCalendar className="text-green-600" /> عقود الإيجار
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
              <p className="text-xl font-bold text-green-700">{rentalStats.totalAmount.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">المحصل</p>
              <p className="text-xl font-bold text-blue-700">{rentalStats.paid.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">المعلق</p>
              <p className="text-xl font-bold text-yellow-700">{rentalStats.pending.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">المتأخر</p>
              <p className="text-xl font-bold text-red-700">{rentalStats.overdue.toLocaleString()} ر.س</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">يومي: {rentalStats.byPlan.daily}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">أسبوعي: {rentalStats.byPlan.weekly}</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">شهري: {rentalStats.byPlan.monthly}</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">سنوي: {rentalStats.byPlan.yearly}</span>
          </div>
        </motion.div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">توزيع السائقين</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={contractTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {contractTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">حالة عقود التمليك</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ownershipStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {ownershipStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">خطط الإيجار</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rentalPlanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {rentalPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* جدول العقود */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* التبويبات */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'الكل', count: allContracts.length },
              { key: 'ownership', label: 'تمليك', count: ownershipVehicles.length },
              { key: 'rental', label: 'إيجار', count: rentalDriverIds.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* البحث */}
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="البحث بالاسم أو المركبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pr-10 w-full"
            />
          </div>

          {/* فلتر الحالة */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="paid">مدفوع</option>
            <option value="overdue">متأخر</option>
            <option value="defaulted">متعثر</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : paginatedContracts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUsers className="text-5xl mx-auto mb-4 opacity-50" />
            <p>لا توجد عقود مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السائق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المركبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجمالي المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المدفوع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المتبقي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التقدم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contract.type === 'ownership' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {contract.type === 'ownership' ? 'تمليك' : 'إيجار'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">{contract.driver_name}</td>
                    <td className="px-4 py-4 text-gray-600">{contract.vehicle || '-'}</td>
                    <td className="px-4 py-4 font-bold text-gray-800">{parseFloat(contract.amount || 0).toLocaleString()} ر.س</td>
                    <td className="px-4 py-4 text-green-600">{parseFloat(contract.paid || 0).toLocaleString()} ر.س</td>
                    <td className="px-4 py-4 text-orange-600">{parseFloat(contract.remaining || 0).toLocaleString()} ر.س</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {contract.type === 'ownership' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${contract.completion}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-600">{contract.completion}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{contract.payments_count} دفعة</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(contract)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="عرض التفاصيل"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleEditContract(contract)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="تعديل"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            totalItems={filteredContracts.length}
          />
        )}
      </div>

      {/* Modals */}
      <ContractTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelectType={handleSelectContractType}
      />

      <RentalContractModal
        isOpen={isRentalModalOpen}
        onClose={() => { setIsRentalModalOpen(false); setSelectedContract(null); }}
        onSave={handleSaveRental}
        contract={selectedContract}
        drivers={drivers}
        vehicles={vehicles}
      />

      <OwnershipVehicleModal
        isOpen={isOwnershipModalOpen}
        onClose={() => { setIsOwnershipModalOpen(false); setSelectedContract(null); }}
        onSave={handleSaveOwnership}
        ownership={selectedContract}
        drivers={drivers}
        vehicles={vehicles}
      />

      <ContractDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedContract(null); }}
        contract={selectedContract}
        payments={payments}
      />
    </div>
  );
};

export default DriversContracts;
