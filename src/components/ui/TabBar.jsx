import React from 'react';
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
} from '@ionic/react';
import {
  storefront,
  cart,
  receipt,
  bag,
  settings,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';

const TabBar = () => {
  const { activeTab, setActiveTab, currentOrder } = usePOSStore();

  const tabs = [
    {
      id: 'order',
      label: 'Order',
      icon: bag,
    },
    {
      id: 'orders',
      label: 'History',
      icon: receipt,
    },
  ];

  return (
    <IonTabBar 
      slot="bottom" 
      className="pos-tabs"
      selectedTab={activeTab}
    >
      {tabs.map(tab => (
        <IonTabButton
          key={tab.id}
          tab={tab.id}
          selected={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        >
          <IonIcon icon={tab.icon} />
          <IonLabel>{tab.label}</IonLabel>
          {tab.badge && (
            <IonBadge color="danger">{tab.badge}</IonBadge>
          )}
        </IonTabButton>
      ))}
    </IonTabBar>
  );
};

export default TabBar;