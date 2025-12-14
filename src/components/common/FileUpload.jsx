import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const FileUpload = ({ 
  onUploadSuccess, 
  type = 'general', 
  multiple = false,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // التحقق من الحجم
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error(`بعض الملفات كبيرة جداً! الحد الأقصى ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('الرجاء اختيار ملف');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);

      if (multiple) {
        files.forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }

      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth') || '{}').token;
      
      const endpoint = multiple ? '/api/upload/multiple' : '/api/upload/single';
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      
      if (onUploadSuccess) {
        onUploadSuccess(multiple ? response.data.files : response.data.file);
      }

      // إعادة تعيين
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FiImage className="text-blue-500" />;
    }
    return <FiFile className="text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* منطقة اختيار الملف */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          multiple={multiple}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600 mb-1">
            اضغط لاختيار {multiple ? 'الملفات' : 'ملف'} أو اسحب وأفلت هنا
          </p>
          <p className="text-sm text-gray-400">
            الحد الأقصى: {maxSize / 1024 / 1024}MB
          </p>
        </label>
      </div>

      {/* قائمة الملفات المختارة */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">الملفات المختارة:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* زر الرفع */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {uploading ? 'جاري الرفع...' : `رفع ${files.length} ${files.length === 1 ? 'ملف' : 'ملفات'}`}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
