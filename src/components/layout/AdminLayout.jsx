'use client';

import React, { useRef } from 'react';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenu,
  IonMenuButton,
  IonSplitPane,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import {
  storefront,
  analytics,
  download,
  cloudUpload,
  trash,
  add,
  arrowBack,
} from 'ionicons/icons';
import { setupIonicReact } from '@ionic/react';
import { useRouter } from 'next/navigation';
import usePOSStore from '@/stores/posStore';
import ProductList from '@/components/pos/ProductList';
import SalesReports from '@/components/pos/SalesReports';
import ExportData from '@/components/pos/ExportData';
import ImportProducts from '@/components/pos/ImportProducts';
import DeleteData from '@/components/pos/DeleteData';

// Initialize Ionic only on client side
if (typeof window !== 'undefined') {
  setupIonicReact();
}

const AdminLayout = () => {
  const { activeTab, setActiveTab } = usePOSStore();
  const productListRef = useRef(null);
  const router = useRouter();

  const handleMenuNavigation = async (action) => {
    if (action === 'back-to-pos') {
      router.push('/');
    } else {
      setActiveTab(action);
    }
    await menuController.close('admin-menu');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList ref={productListRef} />;
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
      case 'reports':
        return 'Sales Reports';
      case 'export':
        return 'Export Data';
      case 'import':
        return 'Import Products';
      case 'delete':
        return 'Delete Data';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <IonApp>
      <IonSplitPane contentId="admin-content" when="lg">
        <IonMenu side="start" menuId="admin-menu" contentId="admin-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Admin Menu</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem button onClick={() => handleMenuNavigation('back-to-pos')}>
                <IonIcon icon={arrowBack} slot="start" color="primary" />
                <IonLabel>Kembali ke POS</IonLabel>
              </IonItem>
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
        
        <div className="pos-container ion-page" id="admin-content">
          <IonHeader className="safe-area-top">
            <IonToolbar>
              <IonMenuButton slot="start" />
              <IonTitle>{getPageTitle()}</IonTitle>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="pos-content" padding={0}>
            <div className="mobile-content-wrapper">
              {renderContent()}
            </div>
          </IonContent>
          
          {/* Add Product Button - Only on products page */}
          {activeTab === 'products' && (
            <div className="add-product-button-container safe-area-bottom">
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
      </IonSplitPane>
    </IonApp>
  );
};

export default AdminLayout;