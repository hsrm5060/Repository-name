import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDrivers } from '../store/slices/driversSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchPayments } from '../store/slices/paymentsSlice';
import { fetchDebts } from '../store/slices/debtsSlice';
import { fetchOwnershipVehicles } from '../store/slices/ownershipVehiclesSlice';
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter,
  FiCalendar,
  FiFilter,
  FiUsers,
  FiTruck,
  FiDollarSign,
  FiCreditCard,
  FiAward,
  FiBarChart2
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { exportToExcel, exportToPDF, exportToCSV, exportToJSON } from '../utils/exportUtils';

const Reports = () => {
  const dispatch = useDispatch();
  const [selectedReport, setSelectedReport] = useState('drivers');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { drivers } = useSelector((state) => state.drivers);
  const { vehicles } = useSelector((state) => state.vehicles);
  const { payments } = useSelector((state) => state.payments);
  const { debts } = useSelector((state) => state.debts);
  const { ownershipVehicles } = useSelector((state) => state.ownershipVehicles);

  useEffect(() => {
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchPayments());
    dispatch(fetchDebts());
    dispatch(fetchOwnershipVehicles());
  }, [dispatch]);

  const reportTypes = [
    { id: 'drivers', label: 'تقرير السائقين', icon: FiUsers, color: 'blue' },
    { id: 'vehicles', label: 'تقرير المركبات', icon: FiTruck, color: 'green' },
    { id: 'payments', label: 'تقرير المدفوعات', icon: FiDollarSign, color: 'purple' },
    { id: 'debts', label: 'تقرير الديون', icon: FiCreditCard, color: 'orange' },
    { id: 'ownership', label: 'تقرير التمليك', icon: FiAward, color: 'indigo' },
    { id: 'summary', label: 'تقرير شامل', icon: FiBarChart2, color: 'red' }
  ];

  // إعداد البيانات حسب نوع التقرير
  const getReportData = () => {
    switch (selectedReport) {
      case 'drivers':
        return drivers
          .filter(d => filterStatus === 'all' || d.status === filterStatus)
          .map(d => ({
            'الرقم': d.id,
            'الاسم': d.name,
            'الهاتف': d.phone,
            'البريد': d.email,
            'الحالة': d.status === 'active' ? 'نشط' : d.status === 'inactive' ? 'غير نشط' : 'موقوف',
            'المركبة': d.vehicle || '-',
            'التقييم': d.rating || '-',
            'تاريخ_الانضمام': d.joinDate || '-'
          }));

      case 'vehicles':
        return vehicles
          .filter(v => filterStatus === 'all' || v.status === filterStatus)
          .map(v => ({
            'رقم_اللوحة': v.plate_number,
            'الماركة': v.make,
            'الموديل': v.model,
            'السنة': v.year,
            'الحالة': v.status === 'active' ? 'نشط' : v.status === 'maintenance' ? 'صيانة' : 'غير نشط',
            'السائق': v.assigned_driver_name || '-',
            'الكيلومترات': v.mileage || '-'
          }));

      case 'payments':
        return payments
          .filter(p => {
            if (filterStatus !== 'all' && p.status !== filterStatus) return false;
            if (dateFrom && p.due_date < dateFrom) return false;
            if (dateTo && p.due_date > dateTo) return false;
            return true;
          })
          .map(p => ({
            'الرقم': p.id,
            'السائق': p.driver_name,
            'المبلغ': `${p.amount || 0} ر.س`,
            'الخطة': p.plan === 'daily' ? 'يومي' : p.plan === 'weekly' ? 'أسبوعي' : 'شهري',
            'الحالة': p.status === 'paid' ? 'مدفوع' : p.status === 'pending' ? 'معلق' : 'متأخر',
            'تاريخ_الاستحقاق': p.due_date,
            'تاريخ_الدفع': p.paid_date || '-'
          }));

      case 'debts':
        return debts
          .filter(d => filterStatus === 'all' || d.status === filterStatus)
          .map(d => ({
            'السائق': d.driver_name,
            'إجمالي_الدين': `${d.total_debt || 0} ر.س`,
            'المبلغ_المسدد': `${d.paid_amount || 0} ر.س`,
            'المبلغ_المتبقي': `${d.remaining_amount || 0} ر.س`,
            'عدد_الأقساط': d.installments ? d.installments.length : 0,
            'أقساط_مسددة': d.installments ? d.installments.filter(i => i.status === 'paid').length : 0,
            'الحالة': d.status === 'paid' ? 'مسدد' : d.status === 'partial' ? 'جزئي' : d.status === 'overdue' ? 'متأخر' : 'نشط',
            'تاريخ_الإنشاء': d.created_date,
            'تاريخ_الاستحقاق': d.due_date
          }));

      case 'ownership':
        return ownershipVehicles
          .filter(v => filterStatus === 'all' || v.status === filterStatus)
          .map(v => ({
            'رقم_العقد': v.contract_number,
            'المركبة': v.vehicle_plate,
            'السائق': v.driver_name,
            'قيمة_المركبة': `${v.total_price || 0} ر.س`,
            'الدفعة_المقدمة': `${v.down_payment || 0} ر.س`,
            'المبلغ_المسدد': `${v.paid_amount || 0} ر.س`,
            'المبلغ_المتبقي': `${v.remaining_amount || 0} ر.س`,
            'القسط_الشهري': `${v.monthly_installment || 0} ر.س`,
            'نسبة_الإنجاز': `${v.completion_percentage || 0}%`,
            'الحالة': v.status === 'completed' ? 'مكتمل' : v.status === 'active' ? 'نشط' : 'متعثر',
            'تاريخ_البدء': v.start_date,
            'تاريخ_الانتهاء': v.end_date
          }));

      case 'summary':
        const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const paidPayments = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalDebts = debts.reduce((sum, d) => sum + (d.total_debt || 0), 0);
        const paidDebts = debts.reduce((sum, d) => sum + (d.paid_amount || 0), 0);
        const totalOwnership = ownershipVehicles.reduce((sum, v) => sum + (v.total_price || 0), 0);
        const paidOwnership = ownershipVehicles.reduce((sum, v) => sum + (v.paid_amount || 0) + (v.down_payment || 0), 0);
        
        return [
          {
            'البند': 'إجمالي السائقين',
            'العدد': drivers.length,
            'نشط': drivers.filter(d => d.status === 'active').length,
            'غير_نشط': drivers.filter(d => d.status !== 'active').length,
            'النسبة': `${drivers.length > 0 ? ((drivers.filter(d => d.status === 'active').length / drivers.length) * 100).toFixed(1) : 0}%`
          },
          {
            'البند': 'إجمالي المركبات',
            'العدد': vehicles.length,
            'نشط': vehicles.filter(v => v.status === 'active').length,
            'غير_نشط': vehicles.filter(v => v.status !== 'active').length,
            'النسبة': `${vehicles.length > 0 ? ((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100).toFixed(1) : 0}%`
          },
          {
            'البند': 'إجمالي المدفوعات',
            'العدد': payments.length,
            'المبلغ_الكلي': `${totalPayments.toLocaleString()} ر.س`,
            'المبلغ_المسدد': `${paidPayments.toLocaleString()} ر.س`,
            'النسبة': `${totalPayments > 0 ? ((paidPayments / totalPayments) * 100).toFixed(1) : 0}%`
          },
          {
            'البند': 'إجمالي الديون',
            'العدد': debts.length,
            'المبلغ_الكلي': `${totalDebts.toLocaleString()} ر.س`,
            'المبلغ_المسدد': `${paidDebts.toLocaleString()} ر.س`,
            'النسبة': `${totalDebts > 0 ? ((paidDebts / totalDebts) * 100).toFixed(1) : 0}%`
          },
          {
            'البند': 'عقود التمليك',
            'العدد': ownershipVehicles.length,
            'المبلغ_الكلي': `${totalOwnership.toLocaleString()} ر.س`,
            'المبلغ_المسدد': `${paidOwnership.toLocaleString()} ر.س`,
            'النسبة': `${totalOwnership > 0 ? ((paidOwnership / totalOwnership) * 100).toFixed(1) : 0}%`
          }
        ];

      default:
        return [];
    }
  };

  const getReportTitle = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    return report ? report.label : 'تقرير';
  };

  const handleExportExcel = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    exportToExcel(data, getReportTitle());
    toast.success('تم تصدير التقرير إلى Excel بنجاح');
  };

  const handleExportPDF = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    exportToPDF(data, getReportTitle(), getReportTitle());
    toast.success('تم فتح نافذة الطباعة - اختر حفظ كـ PDF');
  };

  const handleExportCSV = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    exportToCSV(data, getReportTitle());
    toast.success('تم تصدير التقرير إلى CSV بنجاح');
  };

  const handleExportJSON = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    exportToJSON(data, getReportTitle());
    toast.success('تم تصدير التقرير إلى JSON بنجاح');
  };

  const reportData = getReportData();

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiFileText className="w-8 h-8 text-blue-600" />
            التقارير
          </h1>
          <p className="text-gray-600 mt-2">إنشاء وتصدير التقارير المختلفة</p>
        </div>
      </div>

      {/* اختيار نوع التقرير */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">اختر نوع التقرير</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedReport === report.id
                  ? `border-${report.color}-600 bg-${report.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <report.icon className={`w-8 h-8 mx-auto mb-2 ${
                selectedReport === report.id ? `text-${report.color}-600` : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium text-center ${
                selectedReport === report.id ? `text-${report.color}-900` : 'text-gray-700'
              }`}>
                {report.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiFilter className="w-5 h-5" />
          خيارات التصفية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedReport === 'payments' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          
          {selectedReport !== 'summary' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">الكل</option>
                {selectedReport === 'drivers' && (
                  <>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">موقوف</option>
                  </>
                )}
                {selectedReport === 'vehicles' && (
                  <>
                    <option value="active">نشط</option>
                    <option value="maintenance">صيانة</option>
                    <option value="inactive">غير نشط</option>
                  </>
                )}
                {selectedReport === 'payments' && (
                  <>
                    <option value="paid">مدفوع</option>
                    <option value="pending">معلق</option>
                    <option value="overdue">متأخر</option>
                  </>
                )}
                {selectedReport === 'debts' && (
                  <>
                    <option value="active">نشط</option>
                    <option value="partial">جزئي</option>
                    <option value="paid">مسدد</option>
                    <option value="overdue">متأخر</option>
                  </>
                )}
                {selectedReport === 'ownership' && (
                  <>
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="defaulted">متعثر</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* أزرار التصدير */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border-2 border-blue-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiDownload className="w-5 h-5 text-blue-600" />
          تصدير التقرير
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <FiFileText className="w-5 h-5" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            JSON
          </button>
        </div>
      </div>

      {/* معاينة البيانات */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            معاينة التقرير ({reportData.length} سجل)
          </h2>
        </div>
        
        {reportData.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد بيانات لعرضها</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-4 py-3 text-sm text-gray-900">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                عرض 10 من {reportData.length} سجل (سيتم تصدير جميع السجلات)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
