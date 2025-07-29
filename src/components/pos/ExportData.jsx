import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonNote,
  IonCheckbox,
  IonList,
  IonBadge,
  IonSkeletonText,
} from '@ionic/react';
import {
  download,
  document,
  analytics,
  checkboxOutline,
  checkbox,
  refresh,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';
import { APIService } from '@/services/api';
import { formatRupiah } from '@/utils/currency';

const api = new APIService();

const ExportData = () => {
  const { exportAllData } = usePOSStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState({
    products: true,
    orders: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getStats();
      setStats(data);
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

  const handleExport = async () => {
    const collectionsToExport = Object.keys(selectedCollections).filter(
      key => selectedCollections[key]
    );
    
    if (collectionsToExport.length === 0) {
      setToastMessage('Please select at least one collection to export.');
      setShowToast(true);
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportAllData(collectionsToExport);
      setToastMessage(`Data exported successfully! File: ${result.filename}`);
      setShowToast(true);
    } catch (error) {
      console.error('Export error:', error);
      setToastMessage('Failed to export data. Please try again.');
      setShowToast(true);
    } finally {
      setIsExporting(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedCollections).filter(Boolean).length;
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

  return (
    <>
      <div className="pos-content">
        <div className="p-4">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IonIcon icon={download} />
                  Export Data
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
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Select which collections you want to export. The data will be saved as a JSON file 
                  that can be used for backup or importing to another system.
                </p>
                
                <h4 className="font-semibold mb-3">Select Collections to Export:</h4>
                
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
                          <h3>Products Collection</h3>
                          <IonNote>All product information including names, prices, and stock levels</IonNote>
                        </div>
                        <div className="text-right">
                          {isLoadingStats ? (
                            <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                          ) : (
                            <>
                              <IonBadge color="primary">
                                {stats?.collections.products.count || 0} items
                              </IonBadge>
                              <div className="text-xs text-gray-500 mt-1">
                                Updated: {formatDate(stats?.collections.products.lastUpdated)}
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
                          <h3>Orders Collection</h3>
                          <IonNote>Complete order history, transaction data, and customer information</IonNote>
                        </div>
                        <div className="text-right">
                          {isLoadingStats ? (
                            <IonSkeletonText animated style={{ width: '60px', height: '20px' }} />
                          ) : (
                            <>
                              <IonBadge color="success">
                                {stats?.collections.orders.count || 0} orders
                              </IonBadge>
                              <div className="text-xs text-gray-500 mt-1">
                                Revenue: {formatRupiah(stats?.collections.orders.totalRevenue || 0)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Updated: {formatDate(stats?.collections.orders.lastUpdated)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </IonLabel>
                  </IonItem>
                </IonList>
                
                {getSelectedCount() > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>{getSelectedCount()}</strong> collection(s) selected for export
                      {stats && (
                        <>
                          {selectedCollections.products && (
                            <span> • {stats.collections.products.count} products</span>
                          )}
                          {selectedCollections.orders && (
                            <span> • {stats.collections.orders.count} orders</span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={handleExport}
                  disabled={isExporting || getSelectedCount() === 0}
                  className="ion-margin-top"
                >
                  <IonIcon icon={download} slot="start" />
                  {isExporting ? 'Exporting...' : `Export Selected Data (${getSelectedCount()})`}
                </IonButton>
                
                <p className="text-sm text-gray-500 mt-2">
                  File will be saved as: jennamart-{Object.keys(selectedCollections).filter(k => selectedCollections[k]).join('-')}-{new Date().toISOString().split('T')[0]}.json
                </p>
              </div>
              
              {/* Export Preview */}
              {getSelectedCount() > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Export Preview:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre className="text-xs overflow-x-auto">
{`{
  "metadata": {
    "exportDate": "${new Date().toISOString()}",
    "version": "1.0",
    "source": "Jennamart POS",
    "collections": [${Object.keys(selectedCollections).filter(k => selectedCollections[k]).map(c => `"${c}"`).join(', ')}]
  },
  "data": {${selectedCollections.products ? `\n    "products": [...] // ${stats?.collections.products.count || 0} items` : ''}${selectedCollections.orders ? `\n    "orders": [...] // ${stats?.collections.orders.count || 0} orders` : ''}
  },
  "statistics": {${selectedCollections.products ? `\n    "totalProducts": ${stats?.collections.products.count || 0},` : ''}${selectedCollections.orders ? `\n    "totalOrders": ${stats?.collections.orders.count || 0},\n    "totalRevenue": ${stats?.collections.orders.totalRevenue || 0}` : ''}
  }
}`}
                    </pre>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </div>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="top"
        color={toastMessage.includes('Failed') ? 'danger' : 'success'}
      />
    </>
  );
};

export default ExportData;
