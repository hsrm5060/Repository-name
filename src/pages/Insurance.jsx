import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInsurances,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  renewInsurance,
  fetchInsuranceStats,
  setFilters,
  clearFilters
} from '../store/slices/insuranceSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { FiPlus, FiSearch, FiFilter, FiShield, FiEdit2, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';
import InsuranceModal from '../components/Insurance/InsuranceModal';
import InsuranceDetailsModal from '../components/Insurance/InsuranceDetailsModal';
import RenewInsuranceModal from '../components/Insurance/RenewInsuranceModal';

const Insurance = () => {
  const dispatch = useDispatch();
  const { insurances, filters, loading, stats } = useSelector(state => state.insurance);
  const { vehicles } = useSelector(state => state.vehicles);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  useEffect(() => {
    dispatch(fetchInsurances());
    dispatch(fetchVehicles());
    dispatch(fetchInsuranceStats());
  }, [dispatch]);

  const handleAddInsurance = () => {
    setSelectedInsurance(null);
    setIsModalOpen(true);
  };

  const handleEditInsurance = (insurance) => {
    setSelectedInsurance(insurance);
    setIsModalOpen(true);
  };

  const handleDeleteInsurance = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه البوليصة؟')) {
      try {
        await dispatch(deleteInsurance(id)).unwrap();
        toast.success('تم حذف البوليصة بنجاح');
        dispatch(fetchInsuranceStats());
      } catch (error) {
        toast.error('فشل حذف البوليصة');
      }
    }
  };

  const handleViewDetails = (insurance) => {
    setSelectedInsurance(insurance);
    setIsDetailsModalOpen(true);
  };

  const handleRenewInsurance = (insurance) => {
    setSelectedInsurance(insurance);
    setIsRenewModalOpen(true);
  };

  const handleSaveInsurance = async (insuranceData) => {
    try {
      if (selectedInsurance) {
        await dispatch(updateInsurance({ id: selectedInsurance.id, data: insuranceData })).unwrap();
        toast.success('تم تحديث البوليصة بنجاح');
      } else {
        await dispatch(createInsurance(insuranceData)).unwrap();
        toast.success('تم إضافة البوليصة بنجاح');
      }
      setIsModalOpen(false);
      dispatch(fetchInsuranceStats());
    } catch (error) {
      toast.error(error.message || 'فشل حفظ البوليصة');
    }
  };

  const handleRenew = async (id, renewData) => {
    try {
      await dispatch(renewInsurance({ id, data: renewData })).unwrap();
      toast.success('تم تجديد البوليصة بنجاح');
      setIsRenewModalOpen(false);
      dispatch(fetchInsuranceStats());
    } catch (error) {
      toast.error(error.message || 'فشل تجديد البوليصة');
    }
  };

  const insuranceTypeLabels = {
    comprehensive: 'شامل',
    third_party: 'ضد الغير'
  };

  const statusConfig = {
    active: {
      label: 'سارية',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    warning: {
      label: 'قريبة من الانتهاء',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    urgent: {
      label: 'عاجل',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    expired: {
      label: 'منتهية',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    }
  };

  const filteredInsurances = insurances.filter(insurance => {
    const matchesSearch =
      insurance.policy_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      insurance.insurance_company?.toLowerCase().includes(filters.search.toLowerCase()) ||
      insurance.plate_number?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = filters.type === 'all' || insurance.insurance_type === filters.type;
    const matchesStatus = filters.status === 'all' || insurance.computed_status === filters.status;
    const matchesCompany = filters.company === 'all' || insurance.insurance_company === filters.company;

    return matchesSearch && matchesType && matchesStatus && matchesCompany;
  });

  const companies = [...new Set(insurances.map(i => i.insurance_company))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">تأمين المركبات</h1>
          <p className="text-gray-600 mt-1">إدارة بوالص التأمين وتتبع تواريخ الانتهاء</p>
        </div>
        <button
          onClick={handleAddInsurance}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FiPlus /> إضافة بوليصة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي التأمينات</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FiShield className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-green-500">
          <p className="text-gray-600 text-sm">سارية</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-yellow-500">
          <p className="text-gray-600 text-sm">تحذير</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.warning}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-orange-500">
          <p className="text-gray-600 text-sm">عاجل</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.urgent}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-red-500">
          <p className="text-gray-600 text-sm">منتهية</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم البوليصة، الشركة، أو المركبة..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => dispatch(setFilters({ type: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الأنواع</option>
              <option value="comprehensive">شامل</option>
              <option value="third_party">ضد الغير</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">سارية</option>
              <option value="warning">تحذير</option>
              <option value="urgent">عاجل</option>
              <option value="expired">منتهية</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.company}
              onChange={(e) => dispatch(setFilters({ company: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الشركات</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => dispatch(clearFilters())}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            مسح الفلاتر
          </button>
        </div>
      </div>

      {/* Insurance Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInsurances.length === 0 ? (
        <EmptyState
          icon={FiShield}
          title="لا توجد بوالص تأمين"
          description="ابدأ بإضافة أول بوليصة تأمين"
          actionLabel="إضافة بوليصة"
          onAction={handleAddInsurance}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">رقم البوليصة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الأيام المتبقية</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">القسط</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInsurances.map((insurance) => {
                  const statusInfo = statusConfig[insurance.computed_status] || statusConfig.active;
                  return (
                    <tr key={insurance.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{insurance.policy_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{insurance.plate_number}</div>
                          <div className="text-gray-500">{insurance.make} {insurance.model}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {insuranceTypeLabels[insurance.insurance_type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {insurance.insurance_company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(insurance.expiry_date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          insurance.days_until_expiry < 0 ? 'text-red-600' :
                          insurance.days_until_expiry <= 7 ? 'text-orange-600' :
                          insurance.days_until_expiry <= 30 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {insurance.days_until_expiry < 0 
                            ? `منتهية منذ ${Math.abs(insurance.days_until_expiry)} يوم`
                            : `${insurance.days_until_expiry} يوم`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600">
                          {parseFloat(insurance.premium_amount).toLocaleString()} ر.س
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(insurance)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleRenewInsurance(insurance)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="تجديد"
                          >
                            <FiRefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleEditInsurance(insurance)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="تعديل"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteInsurance(insurance.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="حذف"
                          >
                            <FiTrash2 size={18} />
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
      )}

      {/* Modals */}
      {isModalOpen && (
        <InsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInsurance}
          insurance={selectedInsurance}
          vehicles={vehicles}
        />
      )}

      {isDetailsModalOpen && selectedInsurance && (
        <InsuranceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          insurance={selectedInsurance}
          onEdit={handleEditInsurance}
          onRenew={handleRenewInsurance}
          onDelete={handleDeleteInsurance}
        />
      )}

      {isRenewModalOpen && selectedInsurance && (
        <RenewInsuranceModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          onRenew={handleRenew}
          insurance={selectedInsurance}
        />
      )}
    </div>
  );
};

export default Insurance;
