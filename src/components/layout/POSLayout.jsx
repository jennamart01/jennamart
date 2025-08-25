'use client';

import React, { useState } from 'react';
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
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { cart, lockClosed } from 'ionicons/icons';
import { setupIonicReact } from '@ionic/react';
import usePOSStore from '@/stores/posStore';
import TabBar from '@/components/ui/TabBar';
import OrderProductList from '@/components/pos/OrderProductList';
import Cart from '@/components/pos/Cart';
import OrderHistory from '@/components/pos/OrderHistory';
import LoginModal from '@/components/auth/LoginModal';

// Initialize Ionic only on client side
if (typeof window !== 'undefined') {
  setupIonicReact();
}

const POSLayout = () => {
  const { activeTab, currentOrder, setActiveTab } = usePOSStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleMenuNavigation = async (action) => {
    if (action === 'login') {
      setShowLoginModal(true);
    }
    await menuController.close('pos-menu');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cart':
        return <Cart />;
      case 'orders':
        return <OrderHistory />;
      default:
        return <OrderProductList />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'cart':
        return 'Shopping Cart';
      case 'orders':
        return 'Order History';
      default:
        return 'Order Items';
    }
  };

  return (
    <IonApp>
      <IonSplitPane contentId="pos-content" when="lg">
        <IonMenu side="start" menuId="pos-menu" contentId="pos-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Jennamart Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem button onClick={() => handleMenuNavigation('login')}>
                <IonIcon icon={lockClosed} slot="start" />
                <IonLabel>Admin Login</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>

        <div className="pos-container ion-page" id="pos-content">
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
          </div>
        </div>
      </IonSplitPane>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </IonApp>
  );
};

export default POSLayout;