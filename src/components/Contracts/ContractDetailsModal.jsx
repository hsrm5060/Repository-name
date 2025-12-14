import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiUser, FiTruck, FiDollarSign, FiCalendar, FiPrinter,
  FiCheckCircle, FiClock, FiAlertCircle, FiPercent
} from 'react-icons/fi';

const ContractDetailsModal = ({ isOpen, onClose, contract, payments = [] }) => {
  const printRef = useRef();

  if (!contract) return null;

  const isOwnership = contract.type === 'ownership';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'completed': case 'paid': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'defaulted': case 'overdue': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'paid': return 'مدفوع';
      case 'defaulted': return 'متعثر';
      case 'overdue': return 'متأخر';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>عقد ${isOwnership ? 'تمليك' : 'إيجار'} - ${contract.driver_name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 10px; }
          .header p { color: #6b7280; }
          .contract-type { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .ownership { background: #f3e8ff; color: #7c3aed; }
          .rental { background: #d1fae5; color: #059669; }
          .section { margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 10px; }
          .section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .info-item { padding: 10px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
          .info-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; color: #1f2937; }
          .financial-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }
          .financial-item { text-align: center; padding: 15px; border-radius: 10px; }
          .financial-item.total { background: #dbeafe; }
          .financial-item.paid { background: #d1fae5; }
          .financial-item.remaining { background: #fef3c7; }
          .financial-value { font-size: 24px; font-weight: bold; }
          .progress-bar { height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin-top: 20px; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .signature-area { display: grid; grid-template-columns: repeat(2, 1fr); gap: 50px; margin-top: 50px; }
          .signature-box { text-align: center; padding-top: 60px; border-top: 2px solid #374151; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // حساب المدفوعات للإيجار
  const contractPayments = payments.filter(p => p.driver_id === contract.driver_id);
  const paidPayments = contractPayments.filter(p => p.status === 'paid' || p.status === 'completed');
  const pendingPayments = contractPayments.filter(p => p.status === 'pending');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <div className={`px-6 py-4 flex items-center justify-between text-white ${isOwnership ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
              <h2 className="text-xl font-bold">تفاصيل عقد {isOwnership ? 'التمليك' : 'الإيجار'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="p-2 hover:bg-white/20 rounded-lg" title="طباعة">
                  <FiPrinter className="text-xl" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* محتوى الطباعة */}
              <div ref={printRef}>
                <div className="header hidden print:block">
                  <h1>نظام إدارة السائقين</h1>
                  <p>عقد {isOwnership ? 'تمليك مركبة' : 'إيجار'}</p>
                  <span className={`contract-type ${isOwnership ? 'ownership' : 'rental'}`}>
                    {isOwnership ? 'عقد تمليك' : 'عقد إيجار'}
                  </span>
                </div>

                {/* نوع العقد والحالة */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${isOwnership ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {isOwnership ? '🚗 عقد تمليك' : '📅 عقد إيجار'}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(contract.status)}`}>
                    {getStatusText(contract.status)}
                  </span>
                </div>

                {/* معلومات السائق والمركبة */}
                <div className="section bg-gray-50 rounded-xl p-5 mb-4">
                  <h3 className="section-title text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiUser className="text-blue-600" /> معلومات العقد
                  </h3>
                  <div className="info-grid grid grid-cols-2 gap-4">
                    <div className="info-item bg-white p-3 rounded-lg border">
                      <p className="info-label text-sm text-gray-500">اسم السائق</p>
                      <p className="info-value font-bold text-gray-800">{contract.driver_name}</p>
                    </div>
                    <div className="info-item bg-white p-3 rounded-lg border">
                      <p className="info-label text-sm text-gray-500">المركبة</p>
                      <p className="info-value font-bold text-gray-800">{contract.vehicle || 'غير محدد'}</p>
                    </div>
                    {isOwnership && (
                      <>
                        <div className="info-item bg-white p-3 rounded-lg border">
                          <p className="info-label text-sm text-gray-500">تاريخ البدء</p>
                          <p className="info-value font-bold text-gray-800">{contract.start_date || '-'}</p>
                        </div>
                        <div className="info-item bg-white p-3 rounded-lg border">
                          <p className="info-label text-sm text-gray-500">تاريخ الانتهاء</p>
                          <p className="info-value font-bold text-gray-800">{contract.end_date || '-'}</p>
                        </div>
                        <div className="info-item bg-white p-3 rounded-lg border">
                          <p className="info-label text-sm text-gray-500">القسط الشهري</p>
                          <p className="info-value font-bold text-blue-600">{parseFloat(contract.monthly || 0).toLocaleString()} ر.س</p>
                        </div>
                      </>
                    )}
                    {!isOwnership && (
                      <>
                        <div className="info-item bg-white p-3 rounded-lg border">
                          <p className="info-label text-sm text-gray-500">خطة الدفع</p>
                          <p className="info-value font-bold text-gray-800">
                            {contract.plan === 'daily' ? 'يومي' : contract.plan === 'weekly' ? 'أسبوعي' : contract.plan === 'monthly' ? 'شهري' : 'سنوي'}
                          </p>
                        </div>
                        <div className="info-item bg-white p-3 rounded-lg border">
                          <p className="info-label text-sm text-gray-500">عدد الدفعات</p>
                          <p className="info-value font-bold text-gray-800">{contract.payments_count || contractPayments.length}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* الملخص المالي */}
                <div className="section bg-gray-50 rounded-xl p-5 mb-4">
                  <h3 className="section-title text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiDollarSign className="text-green-600" /> الملخص المالي
                  </h3>
                  <div className="financial-summary grid grid-cols-3 gap-4">
                    <div className="financial-item total bg-blue-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-blue-600 mb-1">إجمالي المبلغ</p>
                      <p className="financial-value text-2xl font-bold text-blue-700">
                        {parseFloat(contract.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-500">ر.س</p>
                    </div>
                    <div className="financial-item paid bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-green-600 mb-1">المدفوع</p>
                      <p className="financial-value text-2xl font-bold text-green-700">
                        {parseFloat(contract.paid || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-green-500">ر.س</p>
                    </div>
                    <div className="financial-item remaining bg-orange-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-orange-600 mb-1">المتبقي</p>
                      <p className="financial-value text-2xl font-bold text-orange-700">
                        {parseFloat(contract.remaining || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-orange-500">ر.س</p>
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  {isOwnership && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">نسبة الإنجاز</span>
                        <span className="font-bold text-primary-600">{contract.completion || 0}%</span>
                      </div>
                      <div className="progress-bar h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="progress-fill h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${contract.completion || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* سجل الدفعات للإيجار */}
                {!isOwnership && contractPayments.length > 0 && (
                  <div className="section bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="section-title text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiCalendar className="text-purple-600" /> سجل الدفعات
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {contractPayments.slice(0, 10).map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            {payment.status === 'paid' || payment.status === 'completed' ? (
                              <FiCheckCircle className="text-green-500" />
                            ) : payment.status === 'overdue' ? (
                              <FiAlertCircle className="text-red-500" />
                            ) : (
                              <FiClock className="text-yellow-500" />
                            )}
                            <span className="text-gray-700">{payment.due_date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{parseFloat(payment.amount || 0).toLocaleString()} ر.س</span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                              {getStatusText(payment.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* منطقة التوقيع للطباعة */}
                <div className="signature-area hidden print:grid grid-cols-2 gap-12 mt-12">
                  <div className="signature-box text-center pt-16 border-t-2 border-gray-800">
                    <p className="font-bold">توقيع المؤجر</p>
                  </div>
                  <div className="signature-box text-center pt-16 border-t-2 border-gray-800">
                    <p className="font-bold">توقيع المستأجر</p>
                  </div>
                </div>

                <div className="footer hidden print:block mt-10 text-center text-gray-400 text-sm border-t pt-4">
                  <p>تم إنشاء هذا العقد بواسطة نظام إدارة السائقين</p>
                  <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 mt-6 print:hidden">
                <button onClick={handlePrint} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                  <FiPrinter /> طباعة العقد
                </button>
                <button onClick={onClose} className="flex-1 btn-secondary py-3">
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContractDetailsModal;
