import { FiX, FiCreditCard, FiCalendar, FiFileText, FiAlertCircle, FiUser, FiTruck } from 'react-icons/fi';

const LicenseDetailsModal = ({ isOpen, onClose, license, onEdit, onRenew, onDelete }) => {
  if (!isOpen || !license) return null;

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
      textColor: 'text-green-800',
      icon: '✓'
    },
    warning: {
      label: 'قريبة من الانتهاء',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '⚠'
    },
    urgent: {
      label: 'عاجل',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      icon: '!'
    },
    expired: {
      label: 'منتهية',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '✕'
    }
  };

  const statusInfo = statusConfig[license.computed_status] || statusConfig.active;
  const isDriverLicense = license.license_category === 'driver';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiCreditCard className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  تفاصيل {isDriverLicense ? 'رخصة القيادة' : 'رخصة المركبة'}
                </h2>
                <p className="text-purple-100 text-sm mt-1">رقم الرخصة: {license.license_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Alert */}
          {license.computed_status !== 'active' && (
            <div className={`${statusInfo.bgColor} ${statusInfo.textColor} p-4 rounded-lg mb-6 flex items-center gap-3`}>
              <FiAlertCircle size={24} />
              <div>
                <p className="font-bold">{statusInfo.label}</p>
                <p className="text-sm">
                  {license.days_until_expiry < 0
                    ? `منتهية منذ ${Math.abs(license.days_until_expiry)} يوم`
                    : `تنتهي خلال ${license.days_until_expiry} يوم`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Owner Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              {isDriverLicense ? <FiUser /> : <FiTruck />}
              {isDriverLicense ? 'معلومات السائق' : 'معلومات المركبة'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {isDriverLicense ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">اسم السائق</p>
                    <p className="font-bold text-gray-900">{license.driver_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-bold text-gray-900">{license.driver_phone}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600">رقم اللوحة</p>
                    <p className="font-bold text-gray-900">{license.plate_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الطراز</p>
                    <p className="font-bold text-gray-900">{license.make} {license.model}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* License Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="text-purple-600" size={20} />
                <p className="text-sm text-gray-600">رقم الرخصة</p>
              </div>
              <p className="font-bold text-gray-900">{license.license_number}</p>
            </div>

            {isDriverLicense && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiFileText className="text-purple-600" size={20} />
                  <p className="text-sm text-gray-600">نوع الرخصة</p>
                </div>
                <p className="font-bold text-gray-900">{licenseTypeLabels[license.license_type]}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCalendar className="text-purple-600" size={20} />
                <p className="text-sm text-gray-600">تاريخ الإصدار</p>
              </div>
              <p className="font-bold text-gray-900">
                {new Date(license.issue_date).toLocaleDateString('ar-SA')}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCalendar className="text-purple-600" size={20} />
                <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
              </div>
              <p className="font-bold text-gray-900">
                {new Date(license.expiry_date).toLocaleDateString('ar-SA')}
              </p>
            </div>

            {license.issuing_authority && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <FiFileText className="text-purple-600" size={20} />
                  <p className="text-sm text-gray-600">الجهة المصدرة</p>
                </div>
                <p className="font-bold text-gray-900">{license.issuing_authority}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {license.notes && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">ملاحظات</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{license.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">تاريخ الإضافة:</span>{' '}
                {new Date(license.created_at).toLocaleString('ar-SA')}
              </div>
              <div>
                <span className="font-medium">آخر تحديث:</span>{' '}
                {new Date(license.updated_at).toLocaleString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-4 p-6 bg-gray-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
          >
            إغلاق
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                onRenew(license);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              تجديد
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(license);
              }}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              تعديل
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(license.id, license.license_category);
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseDetailsModal;
