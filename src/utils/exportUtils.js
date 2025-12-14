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
export const exportToPDF = (data, title, filename) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  // إنشاء نافذة جديدة للطباعة كـ PDF
  const printWindow = window.open('', '', 'height=800,width=1000');
  
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<meta charset="utf-8">');
  printWindow.document.write('<style>');
  printWindow.document.write('@page { size: A4; margin: 20mm; }');
  printWindow.document.write('body { font-family: Arial, sans-serif; direction: rtl; margin: 0; padding: 20px; }');
  printWindow.document.write('.header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0ea5e9; padding-bottom: 15px; }');
  printWindow.document.write('.header h1 { color: #0ea5e9; margin: 0; font-size: 28px; }');
  printWindow.document.write('.header p { color: #666; margin: 5px 0; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }');
  printWindow.document.write('th { background-color: #0ea5e9; color: white; font-weight: bold; }');
  printWindow.document.write('tr:nth-child(even) { background-color: #f9f9f9; }');
  printWindow.document.write('.footer { margin-top: 30px; text-align: center; color: #666; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px; }');
  printWindow.document.write('@media print { .no-print { display: none; } }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  
  // الرأس
  printWindow.document.write('<div class="header">');
  printWindow.document.write('<h1>' + title + '</h1>');
  printWindow.document.write('<p>تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>');
  printWindow.document.write('</div>');
  
  // الجدول
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
        printWindow.document.write('<td>' + (value || '-') + '</td>');
      });
      printWindow.document.write('</tr>');
    });
    
    printWindow.document.write('</tbody></table>');
  }
  
  // التذييل
  printWindow.document.write('<div class="footer">');
  printWindow.document.write('<p>نظام إدارة السائقين - تم الإنشاء بواسطة النظام</p>');
  printWindow.document.write('</div>');
  
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  // الانتظار قليلاً ثم فتح نافذة الطباعة
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
