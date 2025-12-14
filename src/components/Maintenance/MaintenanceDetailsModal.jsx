import { FiX, FiTool, FiCalendar, FiTruck, FiDollarSign, FiSettings, FiAlertCircle } from 'react-icons/fi';

const MaintenanceDetailsModal = ({ isOpen, onClose, maintenance }) => {
  if (!isOpen || !maintenance) return null;

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

  const priorityLabels = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FiTool className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">تفاصيل الصيانة</h2>
                <p className="text-blue-100 text-sm mt-1">{maintenance.maintenance_number}</p>
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
          {/* Cost Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="text-center">
              <p className="text-blue-600 text-sm font-medium mb-2">التكلفة الإجمالية</p>
              <p className="text-4xl font-bold text-blue-700">
                {parseFloat(maintenance.cost).toLocaleString()} ر.س
              </p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <FiTruck className="text-gray-600 text-xl" />
              <p className="text-sm text-gray-600 font-medium">معلومات المركبة</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">رقم اللوحة</p>
                <p className="text-lg font-semibold text-gray-800">{maintenance.plate_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">الطراز</p>
                <p className="text-lg font-semibold text-gray-800">{maintenance.make} {maintenance.model}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Type */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiSettings className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">نوع الصيانة</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {typeLabels[maintenance.maintenance_type]}
              </p>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiCalendar className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">تاريخ الصيانة</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(maintenance.maintenance_date).toLocaleDateString('ar-SA')}
              </p>
            </div>

            {/* Next Maintenance */}
            {maintenance.next_maintenance_date && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <FiCalendar className="text-orange-600" />
                  <p className="text-sm text-orange-600 font-medium">الصيانة القادمة</p>
                </div>
                <p className="text-lg font-semibold text-orange-800">
                  {new Date(maintenance.next_maintenance_date).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}

            {/* Status & Priority */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiAlertCircle className="text-gray-600" />
                <p className="text-sm text-gray-600 font-medium">الحالة والأولوية</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {statusLabels[maintenance.status]}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${priorityColors[maintenance.priority]}`}>
                  {priorityLabels[maintenance.priority]}
                </span>
              </div>
            </div>

            {/* Mileage */}
            {maintenance.mileage && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-2">الكيلومترات</p>
                <p className="text-lg font-semibold text-gray-800">
                  {parseInt(maintenance.mileage).toLocaleString()} كم
                </p>
                {maintenance.next_maintenance_mileage && (
                  <p className="text-xs text-gray-500 mt-1">
                    القادمة: {parseInt(maintenance.next_maintenance_mileage).toLocaleString()} كم
                  </p>
                )}
              </div>
            )}

            {/* Service Provider */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium mb-2">مزود الخدمة</p>
              <p className="text-lg font-semibold text-gray-800">{maintenance.service_provider}</p>
            </div>

            {/* Warranty */}
            {maintenance.warranty_until && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 md:col-span-2">
                <p className="text-sm text-green-600 font-medium mb-2">الضمان ساري حتى</p>
                <p className="text-lg font-semibold text-green-800">
                  {new Date(maintenance.warranty_until).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 font-medium mb-2">الوصف</p>
            <p className="text-gray-800 leading-relaxed">{maintenance.description}</p>
          </div>

          {/* Parts Replaced */}
          {maintenance.parts_replaced && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-2">القطع المستبدلة</p>
              <p className="text-blue-900 leading-relaxed">{maintenance.parts_replaced}</p>
            </div>
          )}

          {/* Notes */}
          {maintenance.notes && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium mb-2">ملاحظات</p>
              <p className="text-yellow-900 leading-relaxed">{maintenance.notes}</p>
            </div>
          )}

          {/* Created By */}
          {maintenance.created_by_name && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                تم الإضافة بواسطة: <span className="font-medium">{maintenance.created_by_name}</span>
              </p>
              {maintenance.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  في: {new Date(maintenance.created_at).toLocaleString('ar-SA')}
                </p>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetailsModal;
