import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BrandingContext = createContext();

const defaultBranding = {
  company_name: 'نظام إدارة السائقين',
  company_name_en: 'Driver Management System',
  company_slogan: 'إدارة احترافية لأسطولك',
  logo: '',
  logo_dark: '',
  favicon: '',
  stamp: '',
  watermark: '',
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  accent_color: '#10b981',
  print_header: '',
  print_footer: 'شكراً لتعاملكم معنا',
  show_watermark: true,
  show_stamp: true,
  watermark_opacity: 0.1,
  dark_mode: false,
  font_size: 'medium',
  sidebar_style: 'default',
  report_template: 'modern',
  receipt_template: 'default',
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding();
  }, []);

  useEffect(() => {
    applyBranding(branding);
  }, [branding]);

  const loadBranding = async () => {
    try {
      // أولاً من localStorage
      const saved = localStorage.getItem('branding');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBranding(prev => ({ ...prev, ...parsed }));
      }

      // ثم من السيرفر
      try {
        const response = await api.get('/settings/branding');
        if (response.data) {
          setBranding(prev => ({ ...prev, ...response.data }));
          localStorage.setItem('branding', JSON.stringify(response.data));
        }
      } catch (e) {
        console.log('Using local branding settings');
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (settings) => {
    const root = document.documentElement;
    
    // تطبيق الألوان
    root.style.setProperty('--color-primary', settings.primary_color);
    root.style.setProperty('--color-secondary', settings.secondary_color);
    root.style.setProperty('--color-accent', settings.accent_color);
    
    // تحويل اللون الرئيسي لـ RGB للاستخدام مع opacity
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '37, 99, 235';
    };
    
    root.style.setProperty('--color-primary-rgb', hexToRgb(settings.primary_color));
    
    // تطبيق حجم الخط
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizes[settings.font_size] || '16px');
    
    // تطبيق الوضع الليلي
    if (settings.dark_mode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // تحديث favicon
    if (settings.favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // تحديث عنوان الصفحة
    if (settings.company_name) {
      document.title = settings.company_name;
    }
  };

  const updateBranding = async (newSettings) => {
    const updated = { ...branding, ...newSettings };
    setBranding(updated);
    localStorage.setItem('branding', JSON.stringify(updated));
    
    // حفظ في السيرفر
    try {
      await api.put('/settings/branding', updated);
    } catch (e) {
      console.log('Saved locally only');
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading, loadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};

export default BrandingContext;
