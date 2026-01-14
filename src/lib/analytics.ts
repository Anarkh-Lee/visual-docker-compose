import ReactGA from 'react-ga4';

// 从环境变量读取衡量 ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * 初始化 Google Analytics 4
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA Measurement ID not found');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    // 可选配置
    gaOptions: {
      // cookieFlags: 'SameSite=None;Secure', // 如果需要跨域
    },
  });

  console.log('Google Analytics initialized');
};

/**
 * 跟踪页面浏览
 */
export const trackPageView = (path: string, title?: string) => {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: path,
    title: title || document.title
  });
};

/**
 * 跟踪自定义事件
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * 跟踪具体功能事件（针对你的项目）
 */
export const trackDockerEvent = {
  // 添加服务到画布
  addService: (serviceName: string) => {
    trackEvent('Canvas', 'Add Service', serviceName);
  },
  
  // 删除服务
  removeService: (serviceName: string) => {
    trackEvent('Canvas', 'Remove Service', serviceName);
  },
  
  // 导出 YAML
  exportYaml: () => {
    trackEvent('Export', 'Download YAML');
  },
  
  // 复制 YAML
  copyYaml: () => {
    trackEvent('Export', 'Copy YAML');
  },
  
  // 导入 YAML
  importYaml: () => {
    trackEvent('Import', 'Import YAML');
  },
  
  // 使用快速模板
  useTemplate: (templateName: string) => {
    trackEvent('Template', 'Use Template', templateName);
  },
  
  // 创建服务连接
  createConnection: () => {
    trackEvent('Canvas', 'Create Connection');
  },
  
  // 复制节点
  duplicateNode: (serviceName: string) => {
    trackEvent('Canvas', 'Duplicate Node', serviceName);
  },
  
  // 清空画布
  clearCanvas: () => {
    trackEvent('Canvas', 'Clear All');
  },
};
