import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonAlert,
} from '@ionic/react';
import {
  add,
  create,
  trash,
  cart,
  pricetag,
  storefront,
  search,
  funnel,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';
import ProductForm from './ProductForm';
import { formatRupiah } from '@/utils/currency';

const ProductList = () => {
  const {
    products,
    isLoading,
    productFilter,
    setProductFilter,
    fetchProducts,
    deleteProduct,
    addToCart,
  } = usePOSStore();

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = async (event) => {
    await fetchProducts();
    event.detail.complete();
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                             product.description?.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return a.price - b.price;
          case 'stock':
            return b.stock - a.stock;
          case 'category':
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
  }, [products, searchText, categoryFilter, sortBy]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books & Media' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
  ];

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product);
    setShowDeleteAlert(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete._id);
        setShowDeleteAlert(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddToCart = useCallback((product) => {
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  }, [addToCart]);

  const getCategoryColor = (category) => {
    const colors = {
      general: 'medium',
      food: 'success',
      electronics: 'primary',
      clothing: 'secondary',
      books: 'tertiary',
      health: 'warning',
      home: 'dark',
      sports: 'danger',
    };
    return colors[category] || 'medium';
  };

  const ProductCard = React.memo(function ProductCard({ product }) {
    return (
    <IonCard key={product._id}>
      <IonCardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <IonCardTitle className="text-lg">{product.name}</IonCardTitle>
            <div className="flex items-center gap-2 mt-1">
              <IonBadge color={getCategoryColor(product.category)}>
                {product.category}
              </IonBadge>
              <IonBadge color={product.stock > 0 ? 'success' : 'danger'}>
                Stock: {product.stock}
              </IonBadge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatRupiah(product.price)}
            </div>
          </div>
        </div>
      </IonCardHeader>
      
      <IonCardContent>
        {product.description && (
          <p className="text-gray-600 mb-4">{product.description}</p>
        )}
        
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonButton
                expand="block"
                fill="outline"
                size="small"
                className="touch-target"
                onClick={() => handleEditProduct(product)}
              >
                <IonIcon icon={create} slot="start" />
                Edit
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                size="small"
                className="touch-target"
                onClick={() => handleDeleteClick(product)}
              >
                <IonIcon icon={trash} slot="start" />
                Delete
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="block"
                color="success"
                className="touch-target"
                disabled={product.stock === 0}
                onClick={() => handleAddToCart(product)}
              >
                <IonIcon icon={cart} slot="start" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
    );
  });

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
    <>
      <div className="pos-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Search and Filters */}
        <div className="p-4 bg-white border-b">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value)}
            placeholder="Search products..."
            showClearButton="focus"
          />
          
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonItem>
                  <IonIcon icon={funnel} slot="start" />
                  <IonLabel>Category</IonLabel>
                  <IonSelect
                    value={categoryFilter}
                    onSelectionChange={(e) => setCategoryFilter(e.detail.value)}
                  >
                    {categories.map(cat => (
                      <IonSelectOption key={cat.value} value={cat.value}>
                        {cat.label}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              
              <IonCol size="12" sizeMd="6">
                <IonItem>
                  <IonIcon icon={storefront} slot="start" />
                  <IonLabel>Sort by</IonLabel>
                  <IonSelect
                    value={sortBy}
                    onSelectionChange={(e) => setSortBy(e.detail.value)}
                  >
                    <IonSelectOption value="name">Name</IonSelectOption>
                    <IonSelectOption value="price">Price</IonSelectOption>
                    <IonSelectOption value="stock">Stock</IonSelectOption>
                    <IonSelectOption value="category">Category</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Products Grid */}
        <div className="p-4">
          {isLoading ? (
            <IonGrid>
              <IonRow>
                {[1, 2, 3, 4].map(i => (
                  <IonCol key={i} size="12" sizeMd="6" sizeLg="4">
                    <SkeletonCard />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <IonIcon icon={storefront} className="text-6xl text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                {searchText || categoryFilter !== 'all' ? 'No products found' : 'No products yet'}
              </h2>
              <p className="text-gray-500 mb-4">
                {searchText || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add your first product to get started'}
              </p>
            </div>
          ) : (
            <IonGrid>
              <IonRow>
                {filteredProducts.map(product => (
                  <IonCol key={product._id} size="12" sizeMd="6" sizeLg="4">
                    <ProductCard product={product} />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setShowEditModal(true)}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      {/* Edit/Add Product Modal */}
      <IonModal 
        isOpen={showEditModal} 
        onDidDismiss={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        className="mobile-modal"
        breakpoints={[0, 0.5, 0.9]}
        initialBreakpoint={0.9}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}>
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="p-4">
            <ProductForm 
              product={editingProduct}
              onClose={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </IonContent>
      </IonModal>

      {/* Delete Confirmation Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirm Delete"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => setShowDeleteAlert(false)
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: handleDeleteConfirm
          }
        ]}
      />
    </>
  );
};

export default ProductList;