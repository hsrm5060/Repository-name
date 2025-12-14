/**
 * تحويل القيمة إلى رقم وتنسيقها
 * @param {any} value - القيمة المراد تنسيقها
 * @returns {string} - الرقم المنسق
 */
export const formatNumber = (value) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('en-US');
};

/**
 * تحويل القيمة إلى رقم وتنسيقها مع العملة
 * @param {any} value - القيمة المراد تنسيقها
 * @returns {string} - الرقم المنسق مع ر.س
 */
export const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `${num.toLocaleString('en-US')} ر.س`;
};

/**
 * جمع مصفوفة من الأرقام بشكل آمن
 * @param {Array} arr - المصفوفة
 * @param {string} key - اسم الحقل
 * @returns {number} - المجموع
 */
export const safeSum = (arr, key) => {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
};
