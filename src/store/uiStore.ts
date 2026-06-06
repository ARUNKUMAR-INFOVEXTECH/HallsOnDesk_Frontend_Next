import { create } from 'zustand';
import Cookies from 'js-cookie';
import { ProductContext } from '@/constants';

interface UIState {
  sidebarOpen: boolean;
  activeProduct: ProductContext;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveProduct: (product: ProductContext) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false, // hidden on mobile by default
  activeProduct: (Cookies.get('active_product') as ProductContext) || 'halls',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setActiveProduct: (product) => {
    Cookies.set('active_product', product, { expires: 365, secure: true, sameSite: 'strict' });
    
    // In a multi-tenant client, updating the DOM body class changes theme variables
    if (typeof document !== 'undefined') {
      const rootClasses = document.documentElement.classList;
      // Remove all theme classes first
      rootClasses.remove('theme-schools', 'theme-rooms', 'theme-leads');
      if (product !== 'halls') {
        rootClasses.add(`theme-${product}`);
      }
    }

    set({ activeProduct: product });
  },
}));
