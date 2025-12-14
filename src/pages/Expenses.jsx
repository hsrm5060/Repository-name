import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchExpenses, 
  createExpense, 
  modifyExpense, 
  removeExpense,
  fetchExpenseStats,
  setSearchQuery,
  setFilterCategory,
  clearFilters
} from '../store/slices/expensesSlice';
import { fetchVehicles } from '../store/slices/vehiclesSlice';
import { fetchDrivers } from '../store/slices/driversSlice';
import { FiPlus, FiSearch, FiFilter, FiDollarSign, FiEdit2, FiTrash2, FiEye, FiDownload, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ExpenseModal from '../components/Expenses/ExpenseModal';
import ExpenseDetailsModal from '../components/Expenses/ExpenseDetailsModal';
import EmptyState from '../components/common/EmptyState';

const Expenses = () => {
  const dispatch = useDispatch();
  const { expenses, searchQuery, filterCategory, loading } = useSelector(state => state.expenses);
  const { vehicles } = useSelector(state => state.vehicles);
  const { drivers } = useSelector(state => state.drivers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    loadStats();
  }, [dispatch]);

  const loadStats = async () => {
    const result = await dispatch(fetchExpenseStats({}));
    if (result.payload) {
      setStats(result.payload);
    }
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        await dispatch(removeExpense(id)).unwrap();
        toast.success('تم حذف المصروف بنجاح');
        loadStats();
      } catch (error) {
        toast.error('فشل حذف المصروف');
      }
    }
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      if (selectedExpense) {
        await dispatch(modifyExpense({ id: selectedExpense.id, data: expenseData })).unwrap();
        toast.success('تم تحديث المصروف بنجاح');
      } else {
        await dispatch(createExpense(expenseData)).unwrap();
        toast.success('تم إضافة المصروف بنجاح');
      }
      setIsModalOpen(false);
      loadStats();
    } catch (error) {
      toast.error('فشل حفظ المصروف');
    }
  };

  const categoryLabels = {
    fuel: 'وقود',
    maintenance: 'صيانة',
    insurance: 'تأمين',
    license: 'رخص',
    fine: 'غرامات',
    salary: 'رواتب',
    rent: 'إيجار',
    other: 'أخرى'
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.expense_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.driver_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">المصروفات</h1>
          <p className="text-gray-600 mt-1">إدارة جميع مصروفات الشركة</p>
        </div>
        <button
          onClick={handleAddExpense}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FiPlus /> إضافة مصروف
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">إجمالي المصروفات</p>
                <p className="text-3xl font-bold mt-2">{stats.total?.toLocaleString()} ر.س</p>
              </div>
              <FiDollarSign className="text-5xl text-red-200 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">عدد المصروفات</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{expenses.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">متوسط المصروف</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {expenses.length > 0 ? (stats.total / expenses.length).toFixed(0) : 0} ر.س
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-sm">أكثر فئة</p>
            <p className="text-xl font-bold text-gray-800 mt-2">
              {stats.byCategory?.[0] ? categoryLabels[stats.byCategory[0].category] : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم المصروف، الوصف، المركبة، أو السائق..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => dispatch(setFilterCategory(e.target.value))}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
              >
                <option value="all">جميع الفئات</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => dispatch(clearFilters())}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title="لا توجد مصروفات"
          description="ابدأ بإضافة أول مصروف"
          actionLabel="إضافة مصروف"
          onAction={handleAddExpense}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">رقم المصروف</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">السائق</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{expense.expense_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {categoryLabels[expense.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-red-600">{parseFloat(expense.amount).toLocaleString()} ر.س</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(expense.expense_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.vehicle_plate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.driver_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(expense)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="تعديل"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-700">الإجمالي:</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-red-600">{totalExpenses.toLocaleString()} ر.س</span>
                  </td>
                  <td colSpan="5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveExpense}
          expense={selectedExpense}
          vehicles={vehicles}
          drivers={drivers}
        />
      )}

      {isDetailsModalOpen && selectedExpense && (
        <ExpenseDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          expense={selectedExpense}
        />
      )}
    </div>
  );
};

export default Expenses;
