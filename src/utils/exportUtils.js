// تصدير البيانات إلى CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// تصدير البيانات إلى JSON
export const exportToJSON = (data, filename) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// طباعة البيانات
export const printData = (data, title) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; direction: rtl; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }');
  printWindow.document.write('th { background-color: #0ea5e9; color: white; }');
  printWindow.document.write('h1 { text-align: center; color: #333; }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h1>' + title + '</h1>');
  
  if (data && data.length > 0) {
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    
    Object.keys(data[0]).forEach(key => {
      printWindow.document.write('<th>' + key + '</th>');
    });
    
    printWindow.document.write('</tr></thead><tbody>');
    
    data.forEach(row => {
      printWindow.document.write('<tr>');
      Object.values(row).forEach(value => {
        printWindow.document.write('<td>' + value + '</td>');
      });
      printWindow.document.write('</tr>');
    });
    
    printWindow.document.write('</tbody></table>');
  }
  
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

// تصدير البيانات إلى Excel (XLSX)
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // إنشاء محتوى HTML للجدول
  const headers = Object.keys(data[0]);
  let htmlContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  htmlContent += '<head><meta charset="utf-8"><style>table { border-collapse: collapse; width: 100%; direction: rtl; } th, td { border: 1px solid #ddd; padding: 8px; text-align: right; } th { background-color: #0ea5e9; color: white; font-weight: bold; }</style></head>';
  htmlContent += '<body><table>';
  
  // إضافة الرأس
  htmlContent += '<thead><tr>';
  headers.forEach(header => {
    htmlContent += `<th>${header}</th>`;
  });
  htmlContent += '</tr></thead>';
  
  // إضافة البيانات
  htmlContent += '<tbody>';
  data.forEach(row => {
    htmlContent += '<tr>';
    headers.forEach(header => {
      htmlContent += `<td>${row[header] || ''}</td>`;
    });
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table></body></html>';

  // إنشاء Blob وتنزيل الملف
  const blob = new Blob(['\ufeff' + htmlContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// تصدير البيانات إلى PDF
export const exportToPDF = (data, title, filename, options = {}) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const {
    companyName = 'مؤسسة ذوق الخيال للأجرة العامة',
    showLogo = true,
    logoUrl = '/logo.png'
  } = options;

  const printWindow = window.open('', '', 'height=900,width=1100');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لتصدير PDF');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
          direction: rtl; 
          margin: 0; 
          padding: 20px;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 25px; 
          border-bottom: 3px solid #0ea5e9; 
          padding-bottom: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 10px;
          padding: 20px;
        }
        .header img { 
          max-width: 80px; 
          max-height: 80px; 
          margin-bottom: 10px;
        }
        .header h1 { 
          color: #0ea5e9; 
          margin: 10px 0 5px; 
          font-size: 24px; 
        }
        .header h2 { 
          color: #333; 
          margin: 5px 0; 
          font-size: 18px;
          font-weight: normal;
        }
        .header .date { 
          color: #666; 
          font-size: 12px; 
          margin-top: 10px;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
          padding: 15px;
          background: #f1f5f9;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #0ea5e9;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px; 
          font-size: 11px; 
        }
        th, td { 
          border: 1px solid #e2e8f0; 
          padding: 8px 10px; 
          text-align: right; 
        }
        th { 
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white; 
          font-weight: bold; 
          font-size: 12px;
        }
        tr:nth-child(even) { background-color: #f8fafc; }
        tr:hover { background-color: #e0f2fe; }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #666; 
          font-size: 10px; 
          border-top: 2px solid #e2e8f0; 
          padding-top: 15px;
        }
        .footer .company { font-weight: bold; color: #0ea5e9; }
        .print-btn {
          position: fixed;
          top: 10px;
          left: 10px;
          padding: 10px 20px;
          background: #0ea5e9;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .print-btn:hover { background: #0284c7; }
        @media print { 
          .print-btn { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">طباعة / حفظ PDF</button>
      
      <div class="header">
        ${showLogo ? `<img src="${logoUrl}" alt="الشعار" onerror="this.style.display='none'">` : ''}
        <h1>${companyName}</h1>
        <h2>${title}</h2>
        <div class="date">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="value">${data.length}</div>
          <div class="label">إجمالي السجلات</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr>
              <td>${index + 1}</td>
              ${Object.values(row).map(value => `<td>${value || '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p class="company">${companyName}</p>
        <p>تم إنشاء هذا التقرير آلياً بواسطة نظام إدارة السائقين</p>
        <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

// تصدير فاتورة PDF
export const exportInvoicePDF = (invoice, options = {}) => {
  const {
    companyName = 'مؤسسة ذوق الخيال للأجرة العامة',
    companyPhone = '',
    companyAddress = '',
    logoUrl = '/logo.png'
  } = options;

  const printWindow = window.open('', '', 'height=900,width=800');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>فاتورة رقم ${invoice.id || ''}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { 
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
          direction: rtl; 
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #0ea5e9;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .company-info h1 { color: #0ea5e9; margin: 0; font-size: 22px; }
        .company-info p { margin: 5px 0; color: #666; font-size: 12px; }
        .invoice-info { text-align: left; }
        .invoice-info h2 { color: #333; margin: 0; }
        .invoice-info p { margin: 5px 0; font-size: 12px; }
        .client-info {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .client-info h3 { margin: 0 0 10px; color: #0ea5e9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; }
        th { background: #0ea5e9; color: white; }
        .total-row { font-weight: bold; background: #f1f5f9; }
        .total-row td { font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; }
        .print-btn {
          position: fixed;
          top: 10px;
          left: 10px;
          padding: 10px 20px;
          background: #0ea5e9;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">طباعة</button>
      
      <div class="invoice-header">
        <div class="company-info">
          <h1>${companyName}</h1>
          ${companyPhone ? `<p>هاتف: ${companyPhone}</p>` : ''}
          ${companyAddress ? `<p>${companyAddress}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h2>فاتورة</h2>
          <p>رقم: ${invoice.id || '-'}</p>
          <p>التاريخ: ${invoice.date || new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </div>

      <div class="client-info">
        <h3>معلومات العميل</h3>
        <p><strong>الاسم:</strong> ${invoice.clientName || '-'}</p>
        <p><strong>الهاتف:</strong> ${invoice.clientPhone || '-'}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>البيان</th>
            <th>المبلغ</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items ? invoice.items.map(item => `
            <tr>
              <td>${item.description || '-'}</td>
              <td>${item.amount || 0} ريال</td>
            </tr>
          `).join('') : `
            <tr>
              <td>${invoice.description || 'دفعة'}</td>
              <td>${invoice.amount || 0} ريال</td>
            </tr>
          `}
          <tr class="total-row">
            <td>الإجمالي</td>
            <td>${invoice.total || invoice.amount || 0} ريال</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>${companyName}</p>
        <p>شكراً لتعاملكم معنا</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};
