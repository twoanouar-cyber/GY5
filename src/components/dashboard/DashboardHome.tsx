import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  UserPlus,
  Clock,
  Filter,
  CalendarDays
} from 'lucide-react';

interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  expiringSubscribers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  subscriptionRevenue: number;
  salesRevenue: number;
  salesProfit: number;
  totalSales: number;
  singleSessionRevenue: number;
  singleSessionCount: number;
  internalSalesRevenue: number;
  internalSalesProfit: number;
  customerDebts: number;
}

const DashboardHome: React.FC = () => {
  const { gymId, gymName, gymType } = useGym();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    expiringSubscribers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    subscriptionRevenue: 0,
    salesRevenue: 0,
    salesProfit: 0,
    totalSales: 0,
    singleSessionRevenue: 0,
    singleSessionCount: 0,
    internalSalesRevenue: 0,
    internalSalesProfit: 0,
    customerDebts: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Date filter states
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, [gymId, dateRange, startDate, endDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        // Open quick sale modal directly
        openQuickSale();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const openQuickSale = () => {
    // This will be handled by a global context or event
    window.dispatchEvent(new CustomEvent('openQuickSale'));
  };

  const getDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        const weekStart = today.getDate() - today.getDay();
        start = new Date(today.getFullYear(), today.getMonth(), weekStart);
        end = new Date(today.getFullYear(), today.getMonth(), weekStart + 6, 23, 59, 59);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate + ' 23:59:59');
        }
        break;
    }

    return { start, end };
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      let dateCondition = '';
      let dateParams: any[] = [];

      if (dateRange !== 'custom' || (startDate && endDate)) {
        dateCondition = "AND datetime(created_at) BETWEEN datetime(?) AND datetime(?)";
        dateParams = [start.toISOString(), end.toISOString()];
      }

      // Get subscribers stats
      const subscribersData = await window.electronAPI.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'expiring' THEN 1 ELSE 0 END) as expiring
        FROM subscribers 
        WHERE gym_id = ? ${dateCondition}
      `, [gymId, ...dateParams]);

      // Get products stats
      const productsData = await window.electronAPI.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN male_gym_quantity + female_gym_quantity < 5 THEN 1 ELSE 0 END) as low_stock
        FROM products
      `);

      // Get sales data (excluding single sessions)
      const salesData = await window.electronAPI.query(`
        SELECT 
          COUNT(DISTINCT i.id) as total_sales,
          COALESCE(SUM(i.total), 0) as revenue,
          COALESCE(SUM(i.profit), 0) as profit
        FROM invoices i
        WHERE i.gym_id = ? AND i.is_single_session = 0 ${dateCondition}
      `, [gymId, ...dateParams]);

      // Get single session data (separate from profits)
      const singleSessionData = await window.electronAPI.query(`
        SELECT 
          COUNT(*) as session_count,
          COALESCE(SUM(total), 0) as revenue
        FROM invoices 
        WHERE gym_id = ? AND is_single_session = 1 ${dateCondition}
      `, [gymId, ...dateParams]);

      // Get subscription revenue
      const subscriptionRevenue = await window.electronAPI.query(`
        SELECT COALESCE(SUM(price_paid), 0) as revenue
        FROM subscribers 
        WHERE gym_id = ? ${dateCondition}
      `, [gymId, ...dateParams]);

      // Get internal sales data
      const internalSalesData = await window.electronAPI.query(`
        SELECT 
          COALESCE(SUM(total_price), 0) as revenue,
          COALESCE(SUM(profit), 0) as profit
        FROM internal_sales i
        WHERE i.gym_id = ? ${dateCondition}
      `, [gymId, ...dateParams]);

      // Get customer debts
      const debtsData = await window.electronAPI.query(`
        SELECT COALESCE(SUM(total - paid_amount), 0) as total_debts
        FROM invoices 
        WHERE gym_id = ? AND is_credit = 1 AND total > paid_amount
      `, [gymId]);

      const totalProfit = (salesData[0]?.profit || 0) + (internalSalesData[0]?.profit || 0);
      const totalRevenue = (salesData[0]?.revenue || 0) + (subscriptionRevenue[0]?.revenue || 0) + 
                          (singleSessionData[0]?.revenue || 0) + (internalSalesData[0]?.revenue || 0);

      setStats({
        totalSubscribers: subscribersData[0]?.total || 0,
        activeSubscribers: subscribersData[0]?.active || 0,
        expiringSubscribers: subscribersData[0]?.expiring || 0,
        totalProducts: productsData[0]?.total || 0,
        lowStockProducts: productsData[0]?.low_stock || 0,
        totalRevenue: totalRevenue,
        subscriptionRevenue: subscriptionRevenue[0]?.revenue || 0,
        salesRevenue: salesData[0]?.revenue || 0,
        salesProfit: totalProfit,
        totalSales: salesData[0]?.total_sales || 0,
        singleSessionRevenue: singleSessionData[0]?.revenue || 0,
        singleSessionCount: singleSessionData[0]?.session_count || 0,
        internalSalesRevenue: internalSalesData[0]?.revenue || 0,
        internalSalesProfit: internalSalesData[0]?.profit || 0,
        customerDebts: debtsData[0]?.total_debts || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, subtitle, onClick }) => (
    <div 
      className={`card-ar ${onClick ? 'cursor-pointer hover:shadow-lg transition-all transform hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 arabic-text">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 arabic-text">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 arabic-text">
            لوحة التحكم - {gymName}
          </h1>
          <p className="text-gray-600 arabic-text">
            نظرة عامة على أداء النادي الرياضي
          </p>
        </div>
      </div>

      {/* Modern Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-blue-600 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900 arabic-text">فلترة الإحصائيات</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Date Buttons */}
          <div className="flex items-center gap-2">
            {[
              { key: 'today', label: 'اليوم', icon: Clock },
              { key: 'week', label: 'هذا الأسبوع', icon: Calendar },
              { key: 'month', label: 'هذا الشهر', icon: CalendarDays },
              { key: 'custom', label: 'فترة مخصصة', icon: Filter }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setDateRange(key as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all arabic-text ${
                  dateRange === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 ml-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-r border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 arabic-text">من:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 arabic-text">إلى:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
          subtitle="جميع المصادر"
        />
        
        <StatCard
          title="صافي الربح"
          value={formatCurrency(stats.salesProfit)}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          subtitle="من المبيعات والقائمة البيضاء"
        />
        
        <StatCard
          title="إيرادات الاشتراكات"
          value={formatCurrency(stats.subscriptionRevenue)}
          icon={<CreditCard className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle="اشتراكات شهرية وجلسات"
          onClick={() => navigate('/dashboard/subscribers')}
        />
        
        <StatCard
          title="إيرادات المبيعات"
          value={formatCurrency(stats.salesRevenue)}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          subtitle="مبيعات المنتجات"
          onClick={() => navigate('/dashboard/sales')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="الحصص المفردة"
          value={formatCurrency(stats.singleSessionRevenue)}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-cyan-500"
          subtitle={`${stats.singleSessionCount} حصة - منفصلة عن الأرباح`}
        />
        
        <StatCard
          title="القائمة البيضاء"
          value={formatCurrency(stats.internalSalesRevenue)}
          icon={<UserPlus className="w-6 h-6 text-white" />}
          color="bg-indigo-500"
          subtitle={`ربح: ${formatCurrency(stats.internalSalesProfit)}`}
          onClick={() => navigate('/dashboard/internal-sales')}
        />

        <StatCard
          title="ديون العملاء"
          value={formatCurrency(stats.customerDebts)}
          icon={<CreditCard className="w-6 h-6 text-white" />}
          color="bg-red-500"
          subtitle="مبالغ مستحقة"
          onClick={() => navigate('/dashboard/customers')}
        />
        
        <StatCard
          title="إجمالي المشتركين"
          value={stats.totalSubscribers}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-teal-500"
          subtitle={`${stats.activeSubscribers} نشط`}
          onClick={() => navigate('/dashboard/subscribers')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 arabic-text">
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={openQuickSale}
            className="btn-primary-ar arabic-text flex items-center justify-center py-3"
          >
            <CreditCard className="w-5 h-5 ml-2" />
            فاتورة سريعة (Space)
          </button>
          <button 
            onClick={() => navigate('/dashboard/subscribers')}
            className="btn-secondary-ar arabic-text flex items-center justify-center py-3"
          >
            <UserPlus className="w-5 h-5 ml-2" />
            إضافة مشترك
          </button>
          <button 
            onClick={() => navigate('/dashboard/products')}
            className="btn-secondary-ar arabic-text flex items-center justify-center py-3"
          >
            <Package className="w-5 h-5 ml-2" />
            إضافة منتج
          </button>
          <button 
            onClick={() => navigate('/dashboard/customers')}
            className="btn-secondary-ar arabic-text flex items-center justify-center py-3"
          >
            <Users className="w-5 h-5 ml-2" />
            إدارة العملاء
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 ml-2" />
            <h3 className="text-lg font-semibold text-gray-900 arabic-text">الأداء المالي</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">إجمالي الإيرادات</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">إيرادات الاشتراكات</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(stats.subscriptionRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">إيرادات المبيعات</span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(stats.salesRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">الحصص المفردة</span>
              <span className="font-semibold text-cyan-600">
                {formatCurrency(stats.singleSessionRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600 arabic-text">صافي الربح</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(stats.salesProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 ml-2" />
            <h3 className="text-lg font-semibold text-gray-900 arabic-text">حالة المشتركين</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">مشتركين نشطين</span>
              <span className="status-active">
                {stats.activeSubscribers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">اشتراكات منتهية الصلاحية قريباً</span>
              <span className="status-expiring">
                {stats.expiringSubscribers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 arabic-text">معدل التجديد</span>
              <span className="font-semibold text-indigo-600">
                {stats.totalSubscribers > 0 
                  ? `${((stats.activeSubscribers / stats.totalSubscribers) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600 arabic-text">ديون العملاء</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(stats.customerDebts)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;