import { useRef } from 'react';
import { FiPrinter, FiX, FiCheckCircle } from 'react-icons/fi';

const PaymentReceipt = ({ isOpen, onClose, payment }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !payment) return null;

  const getPlanText = (plan) => {
    switch (plan) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      case 'yearly': return 'سنوي';
      default: return plan;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'card': return 'بطاقة ائتمان';
      case 'check': return 'شيك';
      default: return method || 'نقدي';
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const printWindow = window.open('', '', 'width=400,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إيصال دفع #${payment.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
            padding: 20px;
            background: white;
            direction: rtl;
          }
          .receipt {
            max-width: 350px;
            margin: 0 auto;
            border: 2px dashed #ccc;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #ccc;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .title {
            font-size: 18px;
            color: #333;
            margin-top: 10px;
          }
          .receipt-number {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .section {
            margin: 15px 0;
            padding: 10px 0;
            border-bottom: 1px dashed #ddd;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .label { color: #666; }
          .value { font-weight: 600; color: #333; }
          .amount-section {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 15px 0;
          }
          .amount-label { font-size: 14px; color: #666; }
          .amount-value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #059669;
            margin-top: 5px;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .status-paid {
            background: #d1fae5;
            color: #059669;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #ccc;
            font-size: 12px;
            color: #666;
          }
          .checkmark {
            font-size: 40px;
            color: #059669;
            margin-bottom: 10px;
          }
          @media print {
            body { padding: 0; }
            .receipt { border: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">إيصال الدفع</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-4">
          <div ref={receiptRef} className="receipt bg-white">
            {/* Header */}
            <div className="header">
              <div className="logo">🚗 نظام إدارة السائقين</div>
              <div className="title">إيصال دفع</div>
              <div className="receipt-number">رقم الإيصال: #{payment.id}</div>
              <div style={{ marginTop: '10px' }}>
                <span className="status status-paid">✓ تم الدفع</span>
              </div>
            </div>

            {/* Driver Info */}
            <div className="section">
              <div className="row">
                <span className="label">اسم السائق:</span>
                <span className="value">{payment.driver_name}</span>
              </div>
              {payment.driver_phone && (
                <div className="row">
                  <span className="label">رقم الهاتف:</span>
                  <span className="value" style={{ direction: 'ltr' }}>{payment.driver_phone}</span>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="section">
              <div className="row">
                <span className="label">نوع الدفع:</span>
                <span className="value">{getPlanText(payment.plan)}</span>
              </div>
              <div className="row">
                <span className="label">تاريخ الاستحقاق:</span>
                <span className="value">{payment.due_date}</span>
              </div>
              <div className="row">
                <span className="label">تاريخ الدفع:</span>
                <span className="value">{payment.paid_date || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="row">
                <span className="label">طريقة الدفع:</span>
                <span className="value">{getPaymentMethodText(payment.payment_method)}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="amount-section">
              <div className="amount-label">المبلغ المدفوع</div>
              <div className="amount-value">{parseFloat(payment.amount).toLocaleString()} ر.س</div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p>شكراً لتعاملكم معنا</p>
              <p style={{ marginTop: '5px' }}>
                تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <FiPrinter /> طباعة الإيصال
          </button>
          <button onClick={onClose} className="btn-secondary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
