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
  download,
  cloudUpload,
  trash,
} from 'ionicons/icons';
import { setupIonicReact } from '@ionic/react';
import usePOSStore from '@/stores/posStore';
import TabBar from '@/components/ui/TabBar';
import ProductList from '@/components/pos/ProductList';
import OrderProductList from '@/components/pos/OrderProductList';
import Cart from '@/components/pos/Cart';
import OrderHistory from '@/components/pos/OrderHistory';
import ExportData from '@/components/pos/ExportData';
import ImportProducts from '@/components/pos/ImportProducts';
import DeleteData from '@/components/pos/DeleteData';
import SalesReports from '@/components/pos/SalesReports';

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
        return <SalesReports />;
      case 'export':
        return <ExportData />;
      case 'import':
        return <ImportProducts />;
      case 'delete':
        return <DeleteData />;
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
        return 'Sales Reports';
      case 'export':
        return 'Export Data';
      case 'import':
        return 'Import Products';
      case 'delete':
        return 'Delete Data';
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
                <IonLabel>Reports</IonLabel>
              </IonItem>
              <IonItem button onClick={() => handleMenuNavigation('export')}>
                <IonIcon icon={download} slot="start" />
                <IonLabel>Export Data</IonLabel>
              </IonItem>
              <IonItem button onClick={() => handleMenuNavigation('import')}>
                <IonIcon icon={cloudUpload} slot="start" />
                <IonLabel>Import Products</IonLabel>
              </IonItem>
              <IonItem button onClick={() => handleMenuNavigation('delete')}>
                <IonIcon icon={trash} slot="start" color="danger" />
                <IonLabel>Delete Data</IonLabel>
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
              <IonFab horizontal="end" vertical="bottom">
                <IonFabButton
                  color="secondary"
                  onClick={() => {
                    if (productListRef.current) {
                      productListRef.current.openAddProduct();
                    }
                  }}
                >
                  <IonIcon icon={add} />
                </IonFabButton>
              </IonFab>
            </div>
          )}
        </div>
        </div>
      </IonSplitPane>
    </IonApp>
  );
};

export default ClientLayout;