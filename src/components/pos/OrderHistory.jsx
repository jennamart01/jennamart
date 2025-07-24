import React, { useEffect, useState, useCallback } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {
  print,
  calendar,
  receipt,
  search,
  funnel,
} from 'ionicons/icons';
import { APIService } from '@/services/api';
import usePOSStore from '@/stores/posStore';
import { formatRupiah } from '@/utils/currency';

const OrderHistory = () => {
  const { printReceipt } = usePOSStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = new APIService();
      const orderList = await api.getOrders();
      setOrders(orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async (event) => {
    await fetchOrders();
    event.detail.complete();
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                           (order.customerName && order.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
                           order.items.some(item => 
                             item.name.toLowerCase().includes(searchText.toLowerCase())
                           );
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'total-high':
          return b.total - a.total;
        case 'total-low':
          return a.total - b.total;
        default:
          return 0;
      }
    });

  const handlePrintReceipt = (order) => {
    printReceipt(order);
  };

  const OrderCard = ({ order }) => (
    <IonCard key={order._id}>
      <IonCardHeader>
        <div className="flex justify-between items-start">
          <div>
            <IonCardTitle className="text-lg">
              Order #{order.orderNumber}
            </IonCardTitle>
            <div className="space-y-1 mt-1">
              <div className="flex items-center gap-2">
                <IonIcon icon={calendar} className="text-sm" />
                <span className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {order.customerName && (
                <div className="text-sm text-gray-600">
                  Customer: <span className="font-medium">{order.customerName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatRupiah(order.total)}
            </div>
            <IonBadge color="success">
              {order.status || 'completed'}
            </IonBadge>
          </div>
        </div>
      </IonCardHeader>
      
      <IonCardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Items ({order.items.length}):</h4>
          <IonList>
            {order.items.map((item, index) => (
              <IonItem key={index}>
                <div className="w-full py-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRupiah(item.price)} each
                  </div>
                </div>
              </IonItem>
            ))}
          </IonList>
        </div>
        
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handlePrintReceipt(order)}
              >
                <IonIcon icon={print} slot="start" />
                Print Receipt
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );

  const SkeletonCard = () => (
    <IonCard>
      <IonCardHeader>
        <IonSkeletonText animated style={{ width: '70%' }} />
        <IonSkeletonText animated style={{ width: '40%' }} />
      </IonCardHeader>
      <IonCardContent>
        <IonSkeletonText animated style={{ width: '100%' }} />
        <IonSkeletonText animated style={{ width: '80%' }} />
        <IonSkeletonText animated style={{ width: '60%' }} />
      </IonCardContent>
    </IonCard>
  );

  return (
    <div className="pos-content">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      {/* Search and Filters */}
      <div className="p-4 bg-white border-b">
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value)}
          placeholder="Search orders by number, customer name, or items..."
          showClearButton="focus"
        />
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonItem>
                <IonIcon icon={funnel} slot="start" />
                <IonLabel>Sort by</IonLabel>
                <IonSelect
                  value={sortBy}
                  onSelectionChange={(e) => setSortBy(e.detail.value)}
                >
                  <IonSelectOption value="newest">Newest First</IonSelectOption>
                  <IonSelectOption value="oldest">Oldest First</IonSelectOption>
                  <IonSelectOption value="total-high">Highest Total</IonSelectOption>
                  <IonSelectOption value="total-low">Lowest Total</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>

      {/* Orders List */}
      <div className="p-4">
        {isLoading ? (
          <IonGrid>
            <IonRow>
              {[1, 2, 3].map(i => (
                <IonCol key={i} size="12" sizeMd="6" sizeLg="4">
                  <SkeletonCard />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <IonIcon icon={receipt} className="text-6xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {searchText ? 'No orders found' : 'No orders yet'}
            </h2>
            <p className="text-gray-500 mb-4">
              {searchText 
                ? 'Try adjusting your search terms' 
                : 'Orders will appear here after checkout'}
            </p>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {filteredOrders.map(order => (
                <IonCol key={order._id} size="12" sizeMd="6" sizeLg="4">
                  <OrderCard order={order} />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;