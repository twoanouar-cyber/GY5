import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  UserPlus,
  FileText,
  Settings,
  Tag,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'لوحة التحكم',
      exact: true
    },
    {
      path: '/dashboard/categories',
      icon: Tag,
      label: 'الفئات'
    },
    {
      path: '/dashboard/products',
      icon: Package,
      label: 'المنتجات'
    },
    {
      path: '/dashboard/purchases',
      icon: ShoppingCart,
      label: 'المشتريات'
    },
    {
      path: '/dashboard/sales',
      icon: CreditCard,
      label: 'المبيعات'
    },
    {
      path: '/dashboard/subscriptions',
      icon: FileText,
      label: 'الاشتراكات'
    },
    {
      path: '/dashboard/subscribers',
      icon: Users,
      label: 'المشتركين'
    },
    {
      path: '/dashboard/internal-sales',
      icon: UserPlus,
      label: 'القائمة البيضاء'
    },
    {
      path: '/dashboard/customers',
      icon: UserCheck,
      label: 'العملاء'
    },
    {
      path: '/dashboard/users',
      icon: Users,
      label: 'المستخدمين'
    },
    {
      path: '/dashboard/settings',
      icon: Settings,
      label: 'الإعدادات'
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-l border-gray-200">
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 arabic-text">
            نظام إدارة النادي
          </h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item-ar arabic-text ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon-ar" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;