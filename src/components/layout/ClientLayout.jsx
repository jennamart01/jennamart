'use client';

import React, { useEffect } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { setupIonicReact } from '@ionic/react';
import usePOSStore from '@/stores/posStore';
import TabBar from '@/components/ui/TabBar';
import ProductList from '@/components/pos/ProductList';
import OrderProductList from '@/components/pos/OrderProductList';
import Cart from '@/components/pos/Cart';
import OrderHistory from '@/components/pos/OrderHistory';

// Initialize Ionic only on client side
if (typeof window !== 'undefined') {
  setupIonicReact();
}

const ClientLayout = () => {
  const { activeTab } = usePOSStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList />;
      case 'order':
        return <OrderProductList />;
      case 'cart':
        return <Cart />;
      case 'orders':
        return <OrderHistory />;
      case 'reports':
        return (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Sales Reports
              </h2>
              <p className="text-gray-500">
                Coming soon - Analytics and reporting
              </p>
            </div>
          </div>
        );
      default:
        return <ProductList />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'products':
        return 'Products';
      case 'order':
        return 'Order Items';
      case 'cart':
        return 'Shopping Cart';
      case 'orders':
        return 'Orders';
      case 'reports':
        return 'Reports';
      default:
        return 'FreePos';
    }
  };

  return (
    <IonApp>
      <div className="pos-container">
        <IonHeader className="safe-area-top">
          <IonToolbar>
            <IonTitle>{getPageTitle()}</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="pos-content">
          {renderContent()}
        </IonContent>
        
        <div className="safe-area-bottom">
          <TabBar />
        </div>
      </div>
    </IonApp>
  );
};

export default ClientLayout;