import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, 
  Package, MessageSquare, Calendar, Download, Loader,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  avgOrderValue: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface ChartData {
  name: string;
  users?: number;
  revenue?: number;
  orders?: number;
  value?: number;
}

interface ProductStat {
  id: string;
  name: string;
  total_revenue: number;
  total_quantity_sold: number;
  times_ordered: number;
}

interface RoleDistribution {
  role_name: string;
  display_name: string;
  color: string;
  user_count: number;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    avgOrderValue: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<ChartData[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewStats(),
        loadRevenueData(),
        loadUserGrowthData(),
        loadProductStats(),
        loadRoleDistribution()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // New users today
      const { count: newUsersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      // Orders stats
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, status');

      const totalOrders = ordersData?.length || 0;
      const completedOrders = ordersData?.filter(o => o.status === 'completed').length || 0;
      const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Growth calculations (compare to previous period)
      const daysAgo = getDaysFromRange(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { count: recentUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startDate.toISOString());

      const recentRevenue = recentOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      // Previous period
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysAgo);

      const { count: prevUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const { data: prevOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const prevRevenue = prevOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      const userGrowth = prevUsers ? ((recentUsers! - prevUsers) / prevUsers) * 100 : 0;
      const revenueGrowth = prevRevenue ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalOrders,
        totalRevenue,
        completedOrders,
        avgOrderValue,
        userGrowth,
        revenueGrowth
      });

    } catch (error) {
      console.error('Error loading overview stats:', error);
    }
  };

  const loadRevenueData = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_revenue')
        .select('*')
        .order('date', { ascending: true })
        .limit(getDaysFromRange(dateRange));

      if (error) throw error;

      const chartData = (data || []).map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: d.completed_revenue || 0,
        orders: d.completed_orders || 0
      })).reverse();

      setRevenueData(chartData);

    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const loadUserGrowthData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_growth_stats')
        .select('*')
        .order('date', { ascending: true })
        .limit(getDaysFromRange(dateRange));

      if (error) throw error;

      const chartData = (data || []).map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: d.new_users || 0
      })).reverse();

      setUserGrowthData(chartData);

    } catch (error) {
      console.error('Error loading user growth data:', error);
    }
  };

  const loadProductStats = async () => {
    try {
      const { data, error } = await supabase
        .from('product_performance')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(10);

      if (error) throw error;

      setProductStats(data || []);

    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  const loadRoleDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role_distribution')
        .select('*')
        .order('user_count', { ascending: false });

      if (error) throw error;

      setRoleDistribution(data || []);

    } catch (error) {
      console.error('Error loading role distribution:', error);
    }
  };

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case 'all': return 365;
      default: return 30;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const formatted = Math.abs(value).toFixed(1);
    
    return (
      <span className={`flex items-center gap-1 ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
      }`}>
        {isPositive && <ArrowUpRight className="w-4 h-4" />}
        {isNegative && <ArrowDownRight className="w-4 h-4" />}
        {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
        {formatted}%
      </span>
    );
  };

  const exportToCSV = () => {
    // Create CSV content
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', stats.totalUsers],
      ['New Users Today', stats.newUsersToday],
      ['Total Orders', stats.totalOrders],
      ['Total Revenue', stats.totalRevenue],
      ['Completed Orders', stats.completedOrders],
      ['Average Order Value', stats.avgOrderValue],
      ['User Growth (%)', stats.userGrowth.toFixed(2)],
      ['Revenue Growth (%)', stats.revenueGrowth.toFixed(2)]
    ].map(row => row.join(',')).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const roleChartData = roleDistribution.map(r => ({
    name: r.display_name || r.role_name,
    value: r.user_count,
    color: r.color
  }));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your platform's performance and growth</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {formatPercent(stats.userGrowth)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-gray-500 mt-1">+{stats.newUsersToday} today</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {formatPercent(stats.revenueGrowth)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xs text-gray-500 mt-1">{stats.completedOrders} completed orders</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}% completion rate
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelStyle={{ color: '#000' }} />
                <Legend />
                <Bar dataKey="users" fill="#3B82F6" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Role Distribution */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {roleDistribution.map(role => (
                <div key={role.role_name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: role.color }}
                    ></div>
                    <span className="text-gray-700">{role.display_name || role.role_name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{role.user_count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {productStats.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No product sales yet</p>
                </div>
              ) : (
                productStats.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">
                          {product.total_quantity_sold || 0} sold • {product.times_ordered || 0} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">
                      {formatCurrency(product.total_revenue || 0)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
