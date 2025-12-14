import { useState, useEffect } from 'react';
import { FiDatabase, FiDownload, FiTrash2, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/backup/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackups(response.data);
    } catch (error) {
      console.error('خطأ في جلب النسخ الاحتياطية:', error);
      toast.error('حدث خطأ في جلب النسخ الاحتياطية');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/backup/create`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchBackups();
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      toast.error('حدث خطأ في إنشاء النسخة الاحتياطية');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/backup/download/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('تم تحميل النسخة الاحتياطية');
    } catch (error) {
      console.error('خطأ في تحميل النسخة الاحتياطية:', error);
      toast.error('حدث خطأ في تحميل النسخة الاحتياطية');
    }
  };

  const deleteBackup = async (filename) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/backup/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم حذف النسخة الاحتياطية');
      fetchBackups();
    } catch (error) {
      console.error('خطأ في حذف النسخة الاحتياطية:', error);
      toast.error('حدث خطأ في حذف النسخة الاحتياطية');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiDatabase className="text-2xl text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">النسخ الاحتياطي</h2>
            <p className="text-sm text-gray-600">إدارة النسخ الاحتياطية لقاعدة البيانات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            تحديث
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FiDatabase />
            {creating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}
          </button>
        </div>
      </div>

      {/* تحذير */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">تنبيه مهم:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>يتم الاحتفاظ بآخر 10 نسخ احتياطية فقط</li>
            <li>يُنصح بإنشاء نسخة احتياطية قبل أي تحديث كبير</li>
            <li>قم بتحميل النسخ الاحتياطية وحفظها في مكان آمن</li>
          </ul>
        </div>
      </div>

      {/* قائمة النسخ الاحتياطية */}
      {loading ? (
        <div className="text-center py-12">
          <FiRefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12">
          <FiDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">لا توجد نسخ احتياطية</p>
          <button
            onClick={createBackup}
            className="btn-primary"
          >
            إنشاء أول نسخة احتياطية
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((backup, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiDatabase className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{backup.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>الحجم: {backup.size}</span>
                    <span>التاريخ: {backup.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadBackup(backup.name)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="تحميل"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteBackup(backup.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackupManager;
