import React, { useEffect, useState } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonTabs,
  IonTabBar,
  IonRouterOutlet,
  IonButton,
  IonIcon,
  IonBadge,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  menu,
  cart,
  close,
} from 'ionicons/icons';
import { setupIonicReact } from '@ionic/react';
import usePOSStore from '@/stores/posStore';
import TabBar from '@/components/ui/TabBar';
import ProductList from '@/components/pos/ProductList';
import OrderProductList from '@/components/pos/OrderProductList';
import Cart from '@/components/pos/Cart';
import OrderHistory from '@/components/pos/OrderHistory';

const Layout = () => {
  const { activeTab, currentOrder, setActiveTab } = usePOSStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize Ionic only on client side
    if (typeof window !== 'undefined') {
      setupIonicReact();
    }
  }, []);

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
      default:
        return <ProductList />;
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
      default:
        return 'FreePos';
    }
  };

  return (
    <IonApp>
      <div className="pos-container">
        <IonHeader>
          <IonToolbar>
            <IonButton 
              fill="clear" 
              slot="start"
              onClick={() => setIsMenuOpen(true)}
              className="header-menu-btn"
            >
              <IonIcon icon={menu} />
            </IonButton>
            
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
                  {currentOrder.items.length} items
                </IonBadge>
              )}
            </IonButton>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="pos-content">
          {renderContent()}
        </IonContent>
        
        <TabBar />
        
        {/* Product Menu Overlay */}
        <IonPopover 
          isOpen={isMenuOpen} 
          onDidDismiss={() => setIsMenuOpen(false)}
          showBackdrop={true}
          side="start"
          alignment="start"
        >
          <div className="menu-overlay">
            <div className="menu-header">
              <h3>All Products</h3>
              <IonButton 
                fill="clear" 
                onClick={() => setIsMenuOpen(false)}
              >
                <IonIcon icon={close} />
              </IonButton>
            </div>
            <IonList>
              <IonItem button onClick={() => {
                setActiveTab('products');
                setIsMenuOpen(false);
              }}>
                <IonLabel>All Products</IonLabel>
              </IonItem>
              <IonItem button onClick={() => {
                setActiveTab('products');
                setIsMenuOpen(false);
              }}>
                <IonLabel>Add New Product</IonLabel>
              </IonItem>
              <IonItem button onClick={() => {
                setActiveTab('products');
                setIsMenuOpen(false);
              }}>
                <IonLabel>Categories</IonLabel>
              </IonItem>
            </IonList>
          </div>
        </IonPopover>
      </div>
    </IonApp>
  );
};

export default Layout;