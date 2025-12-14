import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
  renewLicense,
  fetchLicenseStats,
  setActiveTab,
  setFilters,
  clearFilters
} from '../store/slices/licensesSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { FiPlus, FiSearch, FiFilter, FiCreditCard, FiEdit2, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import EmptyState from '../components/common/EmptyState';
import LicenseModal from '../components/Licenses/LicenseModal';
import LicenseDetailsModal from '../components/Licenses/LicenseDetailsModal';
import RenewLicenseModal from '../components/Licenses/RenewLicenseModal';

const Licenses = () => {
  const dispatch = useDispatch();
  const { driverLicenses, vehicleLicenses, activeTab, filters, loading, stats } = useSelector(state => state.licenses);
  const { vehicles } = useSelector(state => state.vehicles);
  const { drivers } = useSelector(state => state.drivers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  useEffect(() => {
    dispatch(fetchLicenses());
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchLicenseStats());
  }, [dispatch]);

  const handleAddLicense = () => {
    setSelectedLicense(null);
    setIsModalOpen(true);
  };

  const handleEditLicense = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const handleDeleteLicense = async (id, category) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرخصة؟')) {
      try {
        await dispatch(deleteLicense({ id, category })).unwrap();
        toast.success('تم حذف الرخصة بنجاح');
        dispatch(fetchLicenseStats());
      } catch (error) {
        toast.error('فشل حذف الرخصة');
      }
    }
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setIsDetailsModalOpen(true);
  };

  const handleRenewLicense = (license) => {
    setSelectedLicense(license);
    setIsRenewModalOpen(true);
  };

  const handleSaveLicense = async (licenseData) => {
    try {
      if (selectedLicense) {
        await dispatch(updateLicense({ id: selectedLicense.id, data: licenseData })).unwrap();
        toast.success('تم تحديث الرخصة بنجاح');
      } else {
        await dispatch(createLicense(licenseData)).unwrap();
        toast.success('تم إضافة الرخصة بنجاح');
      }
      setIsModalOpen(false);
      dispatch(fetchLicenseStats());
    } catch (error) {
      toast.error(error.message || 'فشل حفظ الرخصة');
    }
  };

  const handleRenew = async (id, renewData) => {
    try {
      await dispatch(renewLicense({ id, data: renewData })).unwrap();
      toast.success('تم تجديد الرخصة بنجاح');
      setIsRenewModalOpen(false);
      dispatch(fetchLicenseStats());
    } catch (error) {
      toast.error(error.message || 'فشل تجديد الرخصة');
    }
  };

  const licenseTypeLabels = {
    private: 'خاصة',
    public: 'عامة',
    heavy: 'نقل ثقيل',
    motorcycle: 'دراجة نارية'
  };

  const statusConfig = {
    active: {
      label: 'سارية',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    warning: {
      label: 'قريبة من الانتهاء',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    urgent: {
      label: 'عاجل',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800'
    },
    expired: {
      label: 'منتهية',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    }
  };

  const currentLicenses = activeTab === 'driver' ? driverLicenses : vehicleLicenses;
  const currentStats = activeTab === 'driver' ? stats.driver : stats.vehicle;

  const filteredLicenses = currentLicenses.filter(license => {
    const matchesSearch =
      license.license_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      (activeTab === 'driver' ? license.driver_name?.toLowerCase().includes(filters.search.toLowerCase()) : 
       license.plate_number?.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesStatus = filters.status === 'all' || license.computed_status === filters.status;
    const matchesType = filters.licenseType === 'all' || license.license_type === filters.licenseType;

    return matchesSearch && matchesStatus && (activeTab === 'vehicle' || matchesType);
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الرخص</h1>
          <p className="text-gray-600 mt-1">إدارة رخص القيادة ورخص المركبات</p>
        </div>
        <button
          onClick={handleAddLicense}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FiPlus /> إضافة رخصة
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => dispatch(setActiveTab('driver'))}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'driver'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            رخص القيادة ({stats.driver.total})
          </button>
          <button
            onClick={() => dispatch(setActiveTab('vehicle'))}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'vehicle'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            رخص المركبات ({stats.vehicle.total})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي الرخص</p>
              <p className="text-3xl font-bold mt-2">{currentStats.total}</p>
            </div>
            <FiCreditCard className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-green-500">
          <p className="text-gray-600 text-sm">سارية</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{currentStats.active}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-yellow-500">
          <p className="text-gray-600 text-sm">تحذير</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{currentStats.warning}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-orange-500">
          <p className="text-gray-600 text-sm">عاجل</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{currentStats.urgent}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-r-4 border-red-500">
          <p className="text-gray-600 text-sm">منتهية</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{currentStats.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'driver' ? 'بحث برقم الرخصة أو اسم السائق...' : 'بحث برقم الرخصة أو رقم المركبة...'}
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">سارية</option>
              <option value="warning">تحذير</option>
              <option value="urgent">عاجل</option>
              <option value="expired">منتهية</option>
            </select>
          </div>

          {activeTab === 'driver' && (
            <div className="relative">
              <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filters.licenseType}
                onChange={(e) => dispatch(setFilters({ licenseType: e.target.value }))}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">جميع الأنواع</option>
                <option value="private">خاصة</option>
                <option value="public">عامة</option>
                <option value="heavy">نقل ثقيل</option>
                <option value="motorcycle">دراجة نارية</option>
              </select>
            </div>
          )}
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

      {/* Licenses Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredLicenses.length === 0 ? (
        <EmptyState
          icon={FiCreditCard}
          title="لا توجد رخص"
          description={`ابدأ بإضافة أول ${activeTab === 'driver' ? 'رخصة قيادة' : 'رخصة مركبة'}`}
          actionLabel="إضافة رخصة"
          onAction={handleAddLicense}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">رقم الرخصة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'driver' ? 'السائق' : 'المركبة'}
                  </th>
                  {activeTab === 'driver' && (
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإصدار</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الأيام المتبقية</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLicenses.map((license) => {
                  const statusInfo = statusConfig[license.computed_status] || statusConfig.active;
                  return (
                    <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{license.license_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {activeTab === 'driver' ? (
                            <>
                              <div className="font-medium text-gray-900">{license.driver_name}</div>
                              <div className="text-gray-500">{license.driver_phone}</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-gray-900">{license.plate_number}</div>
                              <div className="text-gray-500">{license.make} {license.model}</div>
                            </>
                          )}
                        </div>
                      </td>
                      {activeTab === 'driver' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {licenseTypeLabels[license.license_type]}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(license.issue_date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(license.expiry_date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          license.days_until_expiry < 0 ? 'text-red-600' :
                          license.days_until_expiry <= 7 ? 'text-orange-600' :
                          license.days_until_expiry <= 30 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {license.days_until_expiry < 0
                            ? `منتهية منذ ${Math.abs(license.days_until_expiry)} يوم`
                            : `${license.days_until_expiry} يوم`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(license)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleRenewLicense(license)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="تجديد"
                          >
                            <FiRefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleEditLicense(license)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="تعديل"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLicense(license.id, license.license_category)}
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
        <LicenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLicense}
          license={selectedLicense}
          licenseCategory={activeTab}
          drivers={drivers}
          vehicles={vehicles}
        />
      )}

      {isDetailsModalOpen && selectedLicense && (
        <LicenseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          license={selectedLicense}
          onEdit={handleEditLicense}
          onRenew={handleRenewLicense}
          onDelete={handleDeleteLicense}
        />
      )}

      {isRenewModalOpen && selectedLicense && (
        <RenewLicenseModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          onRenew={handleRenew}
          license={selectedLicense}
        />
      )}
    </div>
  );
};

export default Licenses;
