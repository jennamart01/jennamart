import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonToast,
  IonItem,
  IonLabel,
  IonNote,
  IonList,
  IonBadge,
  IonSkeletonText,
  IonSegment,
  IonSegmentButton,
  IonDatetime,
  IonPopover,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonProgressBar,
} from '@ionic/react';
import {
  analytics,
  calendar,
  download,
  refresh,
  trendingUp,
  trendingDown,
  cash,
  receipt,
  time,
  statsChart,
  barChart,
  pieChart,
  listOutline,
  filterOutline,
} from 'ionicons/icons';
import { APIService } from '@/services/api';
import { formatRupiah } from '@/utils/currency';

const api = new APIService();

const SalesReports = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [reportPeriod, setReportPeriod] = useState('today');
  
  // Data states
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchReportsData();
  }, [reportPeriod, dateRange]);

  const showToastMessage = (message, color = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      const [salesStats, topProductsData, dailyData, monthlyData, ordersData] = await Promise.all([
        api.getSalesStats(dateFilter),
        api.getTopProducts(dateFilter),
        api.getDailySales(dateFilter),
        api.getMonthlySales(),
        api.getRecentOrders(10)
      ]);

      setSalesData(salesStats);
      setTopProducts(topProductsData);
      setDailySales(dailyData);
      setMonthlySales(monthlyData);
      setRecentOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
      showToastMessage('Failed to load reports data', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateFilter = () => {
    const today = new Date();
    let fromDate, toDate;

    switch (reportPeriod) {
      case 'today':
        fromDate = new Date(today);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setDate(today.getDate() - 1);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        if (dateRange.fromDate && dateRange.toDate) {
          fromDate = new Date(dateRange.fromDate);
          toDate = new Date(dateRange.toDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        return null;
    }

    return fromDate && toDate ? { fromDate, toDate } : null;
  };

  const exportReport = async () => {
    try {
      const dateFilter = getDateFilter();
      await api.exportSalesReport(dateFilter, activeReport);
      showToastMessage('Report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToastMessage('Failed to export report', 'danger');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case 'today': return 'Hari Ini';
      case 'yesterday': return 'Kemarin';
      case 'week': return '7 Hari Terakhir';
      case 'month': return 'Bulan Ini';
      case 'custom': return 'Periode Kustom';
      default: return 'Semua Waktu';
    }
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const renderOverviewReport = () => (
    <div className="space-y-4">
      {/* Key Metrics Cards - Mobile Optimized */}
      <div className="metrics-grid">
        <IonCard className="metric-card">
          <IonCardContent className="metric-content">
            <div className="metric-header">
              <IonIcon icon={cash} className="metric-icon text-green-500" />
              <div className="metric-info">
                <p className="metric-label">Total Penjualan</p>
                {isLoading ? (
                  <IonSkeletonText animated style={{ width: '80px', height: '24px' }} />
                ) : (
                  <h3 className="metric-value text-green-600">
                    {formatRupiah(salesData?.totalRevenue || 0)}
                  </h3>
                )}
                {salesData?.revenueGrowth && (
                  <div className={`metric-growth ${
                    salesData.revenueGrowth >= 0 ? 'growth-positive' : 'growth-negative'
                  }`}>
                    <IonIcon 
                      icon={salesData.revenueGrowth >= 0 ? trendingUp : trendingDown} 
                    />
                    <span>{Math.abs(salesData.revenueGrowth)}%</span>
                  </div>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>
        
        <IonCard className="metric-card">
          <IonCardContent className="metric-content">
            <div className="metric-header">
              <IonIcon icon={receipt} className="metric-icon text-blue-500" />
              <div className="metric-info">
                <p className="metric-label">Total Transaksi</p>
                {isLoading ? (
                  <IonSkeletonText animated style={{ width: '60px', height: '24px' }} />
                ) : (
                  <h3 className="metric-value text-blue-600">
                    {salesData?.totalOrders || 0}
                  </h3>
                )}
                {salesData?.ordersGrowth && (
                  <div className={`metric-growth ${
                    salesData.ordersGrowth >= 0 ? 'growth-positive' : 'growth-negative'
                  }`}>
                    <IonIcon 
                      icon={salesData.ordersGrowth >= 0 ? trendingUp : trendingDown} 
                    />
                    <span>{Math.abs(salesData.ordersGrowth)}%</span>
                  </div>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>
        
        <IonCard className="metric-card">
          <IonCardContent className="metric-content">
            <div className="metric-header">
              <IonIcon icon={statsChart} className="metric-icon text-purple-500" />
              <div className="metric-info">
                <p className="metric-label">Rata-rata/Transaksi</p>
                {isLoading ? (
                  <IonSkeletonText animated style={{ width: '80px', height: '24px' }} />
                ) : (
                  <h3 className="metric-value text-purple-600">
                    {formatRupiah(salesData?.averageOrderValue || 0)}
                  </h3>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>
        
        <IonCard className="metric-card">
          <IonCardContent className="metric-content">
            <div className="metric-header">
              <IonIcon icon={barChart} className="metric-icon text-orange-500" />
              <div className="metric-info">
                <p className="metric-label">Produk Terjual</p>
                {isLoading ? (
                  <IonSkeletonText animated style={{ width: '60px', height: '24px' }} />
                ) : (
                  <h3 className="metric-value text-orange-600">
                    {salesData?.totalItemsSold || 0}
                  </h3>
                )}
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      {/* Sales Trend Chart - Mobile Optimized */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="card-title">
            <IonIcon icon={trendingUp} />
            <span>Tren Penjualan Harian</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <div className="space-y-2">
              <IonSkeletonText animated style={{ height: '200px' }} />
            </div>
          ) : (
            <div className="sales-chart-mobile">
              {dailySales.length > 0 ? (
                <div className="daily-sales-list">
                  {dailySales.map((day, index) => (
                    <div key={index} className="daily-sales-item">
                      <div className="daily-sales-info">
                        <p className="daily-date">{formatDate(day.date)}</p>
                        <p className="daily-orders">{day.orders} transaksi</p>
                      </div>
                      <div className="daily-revenue">
                        <p className="revenue-amount">{formatRupiah(day.revenue)}</p>
                        <div className="revenue-bar">
                          <div 
                            className="revenue-fill" 
                            style={{ 
                              width: `${Math.min((day.revenue / Math.max(...dailySales.map(d => d.revenue))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={barChart} />
                  <p>Tidak ada data penjualan untuk periode ini</p>
                </div>
              )}
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );
  const renderProductAnalysis = () => (
    <div className="space-y-4">
      {/* Top Products - Mobile Optimized */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="card-title">
            <IonIcon icon={pieChart} />
            <span>Produk Terlaris</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-product-item">
                  <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                  <IonSkeletonText animated style={{ width: '30%', height: '16px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="top-products-mobile">
              {topProducts.length > 0 ? (
                <>
                  {/* Mobile Card View */}
                  <div className="mobile-products-list">
                    {topProducts.map((product, index) => (
                      <div key={index} className="product-card-mobile">
                        <div className="product-header">
                          <div className="product-rank">
                            <div className={`rank-badge ${
                              index === 0 ? 'rank-gold' : 
                              index === 1 ? 'rank-silver' : 
                              index === 2 ? 'rank-bronze' : 'rank-other'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="product-info">
                              <h4 className="product-name">{product.name}</h4>
                              <p className="product-meta">
                                {formatRupiah(product.price)} • {product.orderCount} transaksi
                              </p>
                            </div>
                          </div>
                          <div className="product-revenue">
                            <span className="revenue-amount">{formatRupiah(product.totalRevenue)}</span>
                            <span className="revenue-percentage">
                              {((product.totalRevenue / salesData?.totalRevenue || 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="product-stats">
                          <div className="stat-item">
                            <span className="stat-label">Terjual</span>
                            <span className="stat-value">{product.quantitySold}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Rata-rata</span>
                            <span className="stat-value">{product.averageQuantityPerOrder}</span>
                          </div>
                          <div className="stat-item performance-stat">
                            <span className="stat-label">Performa</span>
                            <div className="performance-bar-mobile">
                              <div 
                                className="performance-fill-mobile" 
                                style={{ 
                                  width: `${Math.min((product.quantitySold / Math.max(...topProducts.map(p => p.quantitySold))) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="desktop-products-table">
                    <div className="overflow-x-auto">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Produk</th>
                            <th className="hide-mobile">Harga</th>
                            <th>Terjual</th>
                            <th>Pendapatan</th>
                            <th className="hide-mobile">Performa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((product, index) => (
                            <tr key={index}>
                              <td>
                                <div className={`rank-badge ${
                                  index === 0 ? 'rank-gold' : 
                                  index === 1 ? 'rank-silver' : 
                                  index === 2 ? 'rank-bronze' : 'rank-other'
                                }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td>
                                <div className="product-cell">
                                  <p className="product-name">{product.name}</p>
                                  <p className="product-meta">{product.orderCount} transaksi</p>
                                </div>
                              </td>
                              <td className="hide-mobile text-center">
                                <span className="price-text">{formatRupiah(product.price)}</span>
                              </td>
                              <td className="text-center">
                                <div className="quantity-cell">
                                  <span className="quantity-main">{product.quantitySold}</span>
                                  <span className="quantity-avg">{product.averageQuantityPerOrder} avg</span>
                                </div>
                              </td>
                              <td className="text-right">
                                <div className="revenue-cell">
                                  <span className="revenue-main">{formatRupiah(product.totalRevenue)}</span>
                                  <span className="revenue-percent">
                                    {((product.totalRevenue / salesData?.totalRevenue || 1) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="hide-mobile text-center">
                                <div className="performance-cell">
                                  <div className="performance-bar">
                                    <div 
                                      className="performance-fill" 
                                      style={{ 
                                        width: `${Math.min((product.quantitySold / Math.max(...topProducts.map(p => p.quantitySold))) * 100, 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="performance-percent">
                                    {Math.round((product.quantitySold / Math.max(...topProducts.map(p => p.quantitySold))) * 100)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="products-summary">
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-value">{topProducts.length}</span>
                        <span className="summary-label">Produk</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">{topProducts.reduce((sum, p) => sum + p.quantitySold, 0)}</span>
                        <span className="summary-label">Terjual</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">{formatRupiah(topProducts.reduce((sum, p) => sum + p.totalRevenue, 0))}</span>
                        <span className="summary-label">Pendapatan</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">{formatRupiah(topProducts.reduce((sum, p) => sum + p.price, 0) / topProducts.length || 0)}</span>
                        <span className="summary-label">Rata-rata Harga</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={pieChart} />
                  <p>Tidak ada data produk untuk periode ini</p>
                </div>
              )}
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Product Performance Summary - Mobile Optimized */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="card-title">
            <IonIcon icon={analytics} />
            <span>Ringkasan Performa</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <IonSkeletonText animated style={{ height: '100px' }} />
          ) : (
            <div className="performance-summary-grid">
              <div className="summary-card">
                <div className="summary-icon bg-blue-100">
                  <IonIcon icon={barChart} className="text-blue-600" />
                </div>
                <div className="summary-content">
                  <span className="summary-number text-blue-600">{salesData?.uniqueProductsSold || 0}</span>
                  <span className="summary-text">Produk Terjual</span>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon bg-green-100">
                  <IonIcon icon={trendingUp} className="text-green-600" />
                </div>
                <div className="summary-content">
                  <span className="summary-number text-green-600">{salesData?.bestSellingProduct?.name || '-'}</span>
                  <span className="summary-text">Terlaris</span>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon bg-purple-100">
                  <IonIcon icon={cash} className="text-purple-600" />
                </div>
                <div className="summary-content">
                  <span className="summary-number text-purple-600">{formatRupiah(salesData?.highestRevenueProduct?.revenue || 0)}</span>
                  <span className="summary-text">Pendapatan Tertinggi</span>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon bg-orange-100">
                  <IonIcon icon={statsChart} className="text-orange-600" />
                </div>
                <div className="summary-content">
                  <span className="summary-number text-orange-600">{salesData?.averageItemsPerOrder?.toFixed(1) || '0.0'}</span>
                  <span className="summary-text">Rata-rata Item/Transaksi</span>
                </div>
              </div>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderDetailedReport = () => (
    <div className="space-y-4">
      {/* Recent Orders - Mobile Optimized */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="card-title">
            <IonIcon icon={listOutline} />
            <span>Transaksi Terbaru</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-order-item">
                  <IonSkeletonText animated style={{ width: '100%', height: '20px' }} />
                  <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="recent-orders-mobile">
              {recentOrders.length > 0 ? (
                <div className="orders-list">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="order-card-mobile">
                      <div className="order-header">
                        <div className="order-info">
                          <h4 className="order-number">#{order.orderNumber || `ORD-${order._id?.slice(-6)}`}</h4>
                          <p className="order-meta">
                            {formatDateTime(order.createdAt)}
                          </p>
                          <p className="order-customer">
                            {order.customerName || 'Guest'} • {order.items?.length || 0} item
                          </p>
                        </div>
                        <div className="order-amount">
                          <span className="amount-value">{formatRupiah(order.total)}</span>
                          <IonBadge color="success" className="order-badge">
                            Selesai
                          </IonBadge>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        <div className="items-preview">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="item-preview">
                              {item.name} ({item.quantity}x)
                              {idx < Math.min(order.items.length, 3) - 1 && ', '}
                            </span>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="items-more"> +{order.items.length - 3} lainnya</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={receipt} />
                  <p>Tidak ada transaksi untuk periode ini</p>
                </div>
              )}
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Monthly Comparison - Mobile Optimized */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="card-title">
            <IonIcon icon={barChart} />
            <span>Perbandingan Bulanan</span>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <IonSkeletonText animated style={{ height: '200px' }} />
          ) : (
            <div className="monthly-comparison-mobile">
              {monthlySales.length > 0 ? (
                <div className="monthly-list">
                  {monthlySales.map((month, index) => (
                    <div key={index} className="month-card-mobile">
                      <div className="month-header">
                        <div className="month-info">
                          <h4 className="month-name">{month.monthName} {month.year}</h4>
                          <p className="month-orders">{month.orders} transaksi</p>
                        </div>
                        <div className="month-revenue">
                          <span className="revenue-amount">{formatRupiah(month.revenue)}</span>
                          {month.revenueGrowth && (
                            <div className={`growth-indicator ${
                              month.revenueGrowth >= 0 ? 'growth-positive' : 'growth-negative'
                            }`}>
                              <IonIcon 
                                icon={month.revenueGrowth >= 0 ? trendingUp : trendingDown} 
                              />
                              <span>{Math.abs(month.revenueGrowth)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="month-stats">
                        <div className="stat-row">
                          <div className="stat-item">
                            <span className="stat-label">Item Terjual</span>
                            <span className="stat-value">{month.totalItems}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Rata-rata Order</span>
                            <span className="stat-value">{formatRupiah(month.averageOrderValue)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Customer Unik</span>
                            <span className="stat-value">{month.uniqueCustomers}</span>
                          </div>
                        </div>
                        
                        <div className="month-progress">
                          <div className="progress-bar-mobile">
                            <div 
                              className="progress-fill-mobile" 
                              style={{ 
                                width: `${Math.min((month.revenue / Math.max(...monthlySales.map(m => m.revenue))) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="progress-label">
                            {Math.round((month.revenue / Math.max(...monthlySales.map(m => m.revenue))) * 100)}% dari tertinggi
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <IonIcon icon={barChart} />
                  <p>Tidak ada data bulanan tersedia</p>
                </div>
              )}
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );

  return (
    <>
      <div className="pos-content">
        <div className="p-4">
          {/* Header */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IonIcon icon={analytics} color="primary" />
                  Laporan Penjualan
                </div>
                <div className="flex gap-2">
                  <IonButton 
                    fill="clear" 
                    size="small" 
                    onClick={fetchReportsData}
                    disabled={isLoading}
                  >
                    <IonIcon icon={refresh} />
                  </IonButton>
                  <IonButton 
                    fill="clear" 
                    size="small" 
                    onClick={exportReport}
                    disabled={isLoading}
                  >
                    <IonIcon icon={download} />
                  </IonButton>
                </div>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {/* Period Selection */}
              <div className="mb-4">
                <IonLabel className="font-medium mb-2 block">Periode Laporan:</IonLabel>
                <IonSegment 
                  value={reportPeriod} 
                  onIonChange={e => setReportPeriod(e.detail.value)}
                  className="mb-3"
                >
                  <IonSegmentButton value="today">
                    <IonLabel>Hari Ini</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="yesterday">
                    <IonLabel>Kemarin</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="week">
                    <IonLabel>7 Hari</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="month">
                    <IonLabel>Bulan Ini</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="custom">
                    <IonLabel>Kustom</IonLabel>
                  </IonSegmentButton>
                </IonSegment>

                {/* Custom Date Range */}
                {reportPeriod === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <IonItem>
                      <IonLabel position="stacked">Dari Tanggal</IonLabel>
                      <IonInput
                        type="date"
                        value={dateRange.fromDate}
                        onIonInput={(e) => setDateRange(prev => ({ ...prev, fromDate: e.detail.value }))}
                        placeholder="Pilih tanggal mulai"
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Sampai Tanggal</IonLabel>
                      <IonInput
                        type="date"
                        value={dateRange.toDate}
                        onIonInput={(e) => setDateRange(prev => ({ ...prev, toDate: e.detail.value }))}
                        placeholder="Pilih tanggal akhir"
                      />
                    </IonItem>
                  </div>
                )}

                <div className="mt-3">
                  <IonChip color="primary">
                    <IonIcon icon={calendar} />
                    <IonLabel>{getPeriodLabel()}</IonLabel>
                  </IonChip>
                </div>
              </div>

              {/* Report Type Selection */}
              <div className="mb-4">
                <IonLabel className="font-medium mb-2 block">Jenis Laporan:</IonLabel>
                <IonSegment 
                  value={activeReport} 
                  onIonChange={e => setActiveReport(e.detail.value)}
                >
                  <IonSegmentButton value="overview">
                    <IonLabel>Ringkasan</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="products">
                    <IonLabel>Produk</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="detailed">
                    <IonLabel>Detail</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Report Content */}
          {activeReport === 'overview' && renderOverviewReport()}
          {activeReport === 'products' && renderProductAnalysis()}
          {activeReport === 'detailed' && renderDetailedReport()}
        </div>
      </div>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="top"
        color={toastColor}
      />
    </>
  );
};

export default SalesReports;
