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
  IonCheckbox,
  IonList,
  IonBadge,
  IonSkeletonText,
  IonAlert,
  IonDatetime,
  IonPopover,
  IonInput,
} from '@ionic/react';
import {
  trash,
  document,
  analytics,
  warning,
  refresh,
  checkmark,
  calendar,
  time,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';
import { APIService } from '@/services/api';
import { formatRupiah } from '@/utils/currency';

const api = new APIService();

const DeleteData = () => {
  const { deleteCollections, getOrderStats } = usePOSStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState({
    products: false,
    orders: false
  });
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [generalStats, orderStatsData] = await Promise.all([
        api.getStats(),
        getOrderStats(dateRange.fromDate || dateRange.toDate ? dateRange : null)
      ]);
      setStats(generalStats);
      setOrderStats(orderStatsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCollectionToggle = (collection) => {
    setSelectedCollections(prev => ({
      ...prev,
      [collection]: !prev[collection]
    }));
  };

  const handleDateChange = (field, value) => {
    const newDateRange = {
      ...dateRange,
      [field]: value
    };
    setDateRange(newDateRange);
    
    // Refresh order stats when date changes
    if (selectedCollections.orders) {
      setTimeout(() => {
        getOrderStats(newDateRange.fromDate || newDateRange.toDate ? newDateRange : null)
          .then(setOrderStats)
          .catch(console.error);
      }, 500);
    }
  };

  const getSafetyDate = () => {
    const today = new Date();
    const safetyDate = new Date(today);
    safetyDate.setDate(today.getDate() - 7);
    return safetyDate.toISOString().split('T')[0];
  };

  const handleDelete = async () => {
    const collectionsToDelete = Object.keys(selectedCollections).filter(
      key => selectedCollections[key]
    );
    
    if (collectionsToDelete.length === 0) {
      setToastMessage('Please select at least one collection to delete.');
      setShowToast(true);
      return;
    }

    setIsDeleting(true);
    try {
      const deleteParams = collectionsToDelete.includes('orders') && (dateRange.fromDate || dateRange.toDate)
        ? dateRange
        : null;
        
      const result = await deleteCollections(collectionsToDelete, deleteParams);
      setDeleteResult(result);
      setToastMessage(`Successfully deleted ${result.totalDeleted} items from ${collectionsToDelete.length} collection(s)`);
      setShowToast(true);
      
      // Reset selections and refresh stats
      setSelectedCollections({ products: false, orders: false });
      setDateRange({ fromDate: '', toDate: '' });
      await fetchStats();
      
    } catch (error) {
      console.error('Delete error:', error);
      setToastMessage(`Failed to delete data: ${error.message}`);
      setShowToast(true);
    } finally {
      setIsDeleting(false);
      setShowConfirmAlert(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedCollections).filter(Boolean).length;
  };

  const getSelectedCollectionNames = () => {
    return Object.keys(selectedCollections).filter(key => selectedCollections[key]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItemsToDelete = () => {
    if (!stats) return 0;
    let total = 0;
    if (selectedCollections.products) total += stats.collections.products.count;
    if (selectedCollections.orders) {
      // Use deletable count from order stats if available
      total += orderStats?.deletable.count || 0;
    }
    return total;
  };

  return (
    <>
      <div className="pos-content">
        <div className="p-4">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IonIcon icon={trash} color="danger" />
                  Delete Data
                </div>
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={fetchStats}
                  disabled={isLoadingStats}
                >
                  <IonIcon icon={refresh} />
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              {/* Warning */}
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-start gap-2">
                  <IonIcon icon={warning} color="danger" className="mt-1" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">⚠️ DANGER ZONE</p>
                    <p className="mt-1">
                      This action will permanently delete all data from the selected collections. 
                      This cannot be undone. Please make sure you have a backup before proceeding.
                    </p>
                    <div className="mt-2 space-y-1">
                      <p><strong>Products:</strong> All products will be deleted immediately (no date restrictions)</p>
                      <p><strong>Orders:</strong> Only orders older than 7 days can be deleted (safety protection)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Select which collections you want to completely delete. All data in the selected 
                  collections will be permanently removed from the database.
                </p>
                
                <h4 className="font-semibold mb-3">Select Collections to Delete:</h4>
                
                <IonList>
                  <IonItem>
                    <IonCheckbox
                      checked={selectedCollections.products}
                      onIonChange={() => handleCollectionToggle('products')}
                      slot="start"
                    />
                    <IonIcon icon={document} slot="start" color="primary" className="ml-3" />
                    <IonLabel>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="flex items-center gap-2">
                            Products Collection
                            <IonBadge color="warning" className="text-xs">NO RESTRICTIONS</IonBadge>
                          </h3>
                          <IonNote>All products, prices, stock levels, and product metadata (NO DATE RESTRICTIONS)</IonNote>
                        </div>
                        <div className="text-right">
                          {isLoadingStats ? (
                            <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                          ) : (
                            <>
                              <IonBadge color={stats?.collections.products.count > 0 ? 'danger' : 'medium'}>
                                {stats?.collections.products.count || 0} items
                              </IonBadge>
                              <div className="text-xs text-gray-500 mt-1">
                                Updated: {formatDate(stats?.collections.products.lastUpdated)}
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                ⚡ Immediate deletion
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </IonLabel>
                  </IonItem>
                  
                  <IonItem>
                    <IonCheckbox
                      checked={selectedCollections.orders}
                      onIonChange={() => handleCollectionToggle('orders')}
                      slot="start"
                    />
                    <IonIcon icon={analytics} slot="start" color="success" className="ml-3" />
                    <IonLabel>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="flex items-center gap-2">
                            Orders Collection
                            <IonBadge color="tertiary" className="text-xs">7-DAY PROTECTION</IonBadge>
                          </h3>
                          <IonNote>All order history, transactions, and customer data (with safety restrictions)</IonNote>
                        </div>
                        <div className="text-right">
                          {isLoadingStats ? (
                            <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                          ) : (
                            <>
                              <IonBadge color={orderStats?.deletable.count > 0 ? 'danger' : 'medium'}>
                                {orderStats?.deletable.count || 0} deletable
                              </IonBadge>
                              <div className="text-xs text-gray-500 mt-1">
                                Total: {stats?.collections.orders.count || 0} orders
                              </div>
                              <div className="text-xs text-red-500">
                                Protected: {orderStats?.safetyPeriod.ordersInSafetyPeriod || 0} (last 7 days)
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </IonLabel>
                  </IonItem>
                </IonList>
                
                {/* Date Range Selection for Orders */}
                {selectedCollections.orders && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <IonIcon icon={calendar} color="warning" />
                      Order Date Range (Optional)
                    </h4>
                    
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <IonIcon icon={warning} color="danger" />
                        <span>
                          <strong>Safety Restriction:</strong> Orders from the last 7 days 
                          (since {getSafetyDate()}) cannot be deleted for safety reasons.
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <IonItem>
                          <IonLabel position="stacked">From Date</IonLabel>
                          <IonInput
                            type="date"
                            value={dateRange.fromDate}
                            max={getSafetyDate()}
                            onIonInput={(e) => handleDateChange('fromDate', e.detail.value)}
                            placeholder="Select start date"
                          />
                        </IonItem>
                      </div>
                      
                      <div>
                        <IonItem>
                          <IonLabel position="stacked">To Date</IonLabel>
                          <IonInput
                            type="date"
                            value={dateRange.toDate}
                            max={getSafetyDate()}
                            onIonInput={(e) => handleDateChange('toDate', e.detail.value)}
                            placeholder="Select end date"
                          />
                        </IonItem>
                      </div>
                    </div>
                    
                    {orderStats && (
                      <div className="mt-3 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="p-2 bg-blue-50 rounded">
                            <div className="font-medium text-blue-800">Deletable Orders</div>
                            <div className="text-blue-600">
                              {orderStats.deletable.count} orders
                            </div>
                            <div className="text-xs text-blue-500">
                              Revenue: {formatRupiah(orderStats.deletable.revenue)}
                            </div>
                          </div>
                          
                          <div className="p-2 bg-red-50 rounded">
                            <div className="font-medium text-red-800">Protected Orders</div>
                            <div className="text-red-600">
                              {orderStats.safetyPeriod.ordersInSafetyPeriod} orders
                            </div>
                            <div className="text-xs text-red-500">
                              (Last 7 days - Cannot delete)
                            </div>
                          </div>
                          
                          {(dateRange.fromDate || dateRange.toDate) && (
                            <div className="p-2 bg-gray-50 rounded">
                              <div className="font-medium text-gray-800">In Date Range</div>
                              <div className="text-gray-600">
                                {orderStats.dateRange.ordersInRange} orders
                              </div>
                              <div className="text-xs text-gray-500">
                                Revenue: {formatRupiah(orderStats.dateRange.revenueInRange)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {getSelectedCount() > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>⚠️ WARNING:</strong> You are about to delete <strong>{getTotalItemsToDelete()}</strong> items 
                      from <strong>{getSelectedCount()}</strong> collection(s)
                    </p>
                    {stats && (
                      <div className="mt-2 space-y-1 text-sm">
                        {selectedCollections.products && (
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600">⚡</span>
                            <span className="text-red-800">
                              <strong>{stats.collections.products.count} products</strong> will be deleted immediately (no restrictions)
                            </span>
                          </div>
                        )}
                        {selectedCollections.orders && orderStats && (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">🛡️</span>
                            <span className="text-red-800">
                              <strong>{orderStats.deletable.count} orders</strong> will be deleted (excluding {orderStats.safetyPeriod.ordersInSafetyPeriod} protected orders from last 7 days)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCollections.orders && orderStats && orderStats.deletable.count > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        Revenue impact: {formatRupiah(orderStats.deletable.revenue)} will be permanently lost
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <IonButton
                  expand="block"
                  color="danger"
                  onClick={() => setShowConfirmAlert(true)}
                  disabled={isDeleting || getSelectedCount() === 0 || getTotalItemsToDelete() === 0}
                  className="ion-margin-top"
                >
                  <IonIcon icon={trash} slot="start" />
                  {isDeleting ? 'Deleting...' : `Delete Selected Data (${getTotalItemsToDelete()} items)`}
                </IonButton>
                
                {getSelectedCount() > 0 && getTotalItemsToDelete() === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected collections are already empty
                  </p>
                )}
              </div>
              
              {/* Delete Result */}
              {deleteResult && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <IonIcon icon={checkmark} color="success" />
                    <span className="font-semibold text-green-800">Delete Completed</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>✅ Total deleted: {deleteResult.totalDeleted} items</p>
                    {deleteResult.results.products && (
                      <p>📦 Products: {deleteResult.results.products.deletedCount} deleted</p>
                    )}
                    {deleteResult.results.orders && (
                      <p>📋 Orders: {deleteResult.results.orders.deletedCount} deleted</p>
                    )}
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </div>
      
      {/* Confirmation Alert */}
      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header="⚠️ Confirm Deletion"
        message={`Are you absolutely sure you want to permanently delete ${getTotalItemsToDelete()} items from ${getSelectedCollectionNames().join(' and ')} collection(s)?${
          selectedCollections.products && stats
            ? `\n\n⚡ PRODUCTS: ${stats.collections.products.count} products will be deleted IMMEDIATELY (no restrictions)`
            : ''
        }${
          selectedCollections.orders && orderStats 
            ? `\n\n🛡️ ORDERS: ${orderStats.deletable.count} orders will be deleted (${orderStats.safetyPeriod.ordersInSafetyPeriod} recent orders are protected).${
                dateRange.fromDate || dateRange.toDate 
                  ? `\nDate range: ${dateRange.fromDate || 'Beginning'} to ${dateRange.toDate || getSafetyDate()}`
                  : ''
              }`
            : ''
        }\n\nThis action cannot be undone!`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Yes, Delete All',
            handler: handleDelete,
            cssClass: 'alert-button-confirm'
          },
        ]}
      />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="top"
        color={toastMessage.includes('Failed') || toastMessage.includes('failed') ? 'danger' : 'success'}
      />
    </>
  );
};

export default DeleteData;
