import React, { useState, useEffect, useCallback } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonBadge,
  IonToast,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  add,
  heart,
  heartOutline,
  refresh,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';
import { formatRupiah } from '@/utils/currency';

const OrderProductList = React.memo(() => {
  const {
    products,
    fetchProducts,
    addToCart,
  } = usePOSStore();

  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const loadProductsData = async () => {
      setIsLoading(true);
      try {
        await fetchProducts();
      } catch (error) {
        console.error('Failed to load products:', error);
        setToastMessage('Failed to load products');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductsData();
  }, [fetchProducts]);

  const handleRefresh = useCallback(async (event) => {
    try {
      await fetchProducts();
      setToastMessage('Products refreshed');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to refresh products');
      setShowToast(true);
    } finally {
      event.detail.complete();
    }
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product) => {
    try {
      addToCart(product);
      setToastMessage(`${product.name} added to cart`);
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to add item to cart');
      setShowToast(true);
    }
  }, [addToCart]);

  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStockBadgeColor = (stock) => {
    if (stock <= 0) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
  };

  const getStockText = (stock) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return `Low Stock: ${stock}`;
    return `In Stock: ${stock}`;
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <IonSpinner name="circular" />
      </div>
    );
  }

  return (
    <div className="order-product-list">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon={refresh}
          pullingText="Pull to refresh products..."
          refreshingSpinner="circular"
          refreshingText="Refreshing products..."
        />
      </IonRefresher>

      <div className="p-4">
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value)}
          placeholder="Search products by name..."
          className="mobile-input"
          showClearButton="focus"
          debounce={300}
        />
      </div>

      <IonGrid className="pb-16">
        <IonRow>
          {filteredProducts.length === 0 ? (
            <IonCol size="12">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchText ? 'No products found matching your search.' : 'No products available.'}
                </p>
              </div>
            </IonCol>
          ) : (
            filteredProducts.map((product) => (
              <IonCol size="12" sizeMd="6" sizeLg="4" key={product._id}>
                <IonCard className="product-order-card">
                  <IonCardHeader>
                    <div className="flex justify-between items-start">
                      <IonCardTitle className="text-lg font-semibold">
                        {product.name}
                      </IonCardTitle>
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => toggleFavorite(product._id)}
                      >
                        <IonIcon
                          icon={favorites.has(product._id) ? heart : heartOutline}
                          color={favorites.has(product._id) ? 'danger' : 'medium'}
                        />
                      </IonButton>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-2xl font-bold text-primary">
                        {formatRupiah(product.price)}
                      </div>
                      <IonBadge color={getStockBadgeColor(product.stock)}>
                        {getStockText(product.stock)}
                      </IonBadge>
                    </div>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonButton
                      expand="block"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="touch-target"
                    >
                      <IonIcon icon={add} slot="start" />
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))
          )}
        </IonRow>
      </IonGrid>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastMessage.includes('Failed') ? 'danger' : 'success'}
      />
    </div>
  );
});

OrderProductList.displayName = 'OrderProductList';

export default OrderProductList;