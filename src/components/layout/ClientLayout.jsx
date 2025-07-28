'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonBadge,
  IonMenu,
  IonMenuButton,
  IonSplitPane,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import {
  menu,
  cart,
  storefront,
  analytics,
  add,
} from 'ionicons/icons';
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
  const { activeTab, currentOrder, setActiveTab } = usePOSStore();
  const productListRef = useRef(null);

  const handleMenuNavigation = async (tab) => {
    setActiveTab(tab);
    await menuController.close('main-menu');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList ref={productListRef} />;
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
        return <ProductList ref={productListRef} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'products':
        return 'Manage Products';
      case 'order':
        return 'Order Items';
      case 'cart':
        return 'Shopping Cart';
      case 'orders':
        return 'Order History';
      case 'reports':
        return 'Reports';
      default:
        return 'Jennamart';
    }
  };

  return (
    <IonApp>
      <IonSplitPane contentId="main-content" when="lg">
        <IonMenu side="start" menuId="main-menu" contentId="main-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Jennamart Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem button onClick={() => handleMenuNavigation('products')}>
                <IonIcon icon={storefront} slot="start" />
                <IonLabel>Manage Products</IonLabel>
              </IonItem>
              <IonItem button onClick={() => handleMenuNavigation('reports')}>
                <IonIcon icon={analytics} slot="start" />
                <IonLabel>Report Products</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>
        
        <div className="pos-container ion-page" id="main-content">
        <IonHeader className="safe-area-top">
          <IonToolbar>
            <IonMenuButton slot="start" />
            
            <IonTitle>{getPageTitle()}</IonTitle>
            
            <IonButton 
              fill="clear" 
              slot="end"
              onClick={() => setActiveTab('cart')}
              className="header-cart-btn"
            >
              <IonIcon icon={cart} />
              {currentOrder.items.length > 0 && (
                <IonBadge color="danger" className="cart-badge">
                  {currentOrder.items.length}
                </IonBadge>
              )}
            </IonButton>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="pos-content" padding={0}>
          <div className="mobile-content-wrapper">
            {renderContent()}
          </div>
        </IonContent>
        
        <div className="safe-area-bottom">
          <TabBar />
          
          {/* Add Product Button - Only on products page */}
          {activeTab === 'products' && (
            <div className="add-product-button-container">
              <IonButton 
                fill="clear" 
                className="add-product-btn"
                onClick={() => {
                  if (productListRef.current) {
                    productListRef.current.openAddProduct();
                  }
                }}
              >
                <IonIcon icon={add} slot="start" />
                Add Product
              </IonButton>
            </div>
          )}
        </div>
        </div>
      </IonSplitPane>
    </IonApp>
  );
};

export default ClientLayout;