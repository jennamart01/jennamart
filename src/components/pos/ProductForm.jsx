import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import usePOSStore from '@/stores/posStore';
import { formatRupiah, parseRupiah, formatRupiahInput } from '@/utils/currency';

const ProductForm = ({ product = null, onClose = () => {} }) => {
  const { addProduct, updateProduct } = usePOSStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price ? formatRupiah(product.price, false) : '',
    description: product?.description || '',
    category: product?.category || 'general',
    stock: product?.stock || '',
  });

  const handleInputChange = (field, value) => {
    if (field === 'price') {
      // Format price input for Rupiah
      const formattedValue = formatRupiahInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setToastMessage('Product name is required');
      setShowToast(true);
      return false;
    }
    const priceValue = parseRupiah(formData.price);
    if (!formData.price || priceValue <= 0) {
      setToastMessage('Valid price is required');
      setShowToast(true);
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setToastMessage('Valid stock quantity is required');
      setShowToast(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        price: parseRupiah(formData.price),
        description: formData.description.trim(),
        category: formData.category,
        stock: parseInt(formData.stock),
      };

      if (product) {
        await updateProduct(product._id, productData);
        setToastMessage('Product updated successfully!');
      } else {
        await addProduct(productData);
        setToastMessage('Product added successfully!');
        // Reset form for new product
        setFormData({
          name: '',
          price: '',
          description: '',
          category: 'general',
          stock: '',
        });
      }
      
      setShowToast(true);
      if (product) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToastMessage('Error saving product. Please try again.');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books & Media' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
  ];

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </IonCardTitle>
        </IonCardHeader>
        
        <IonCardContent>
          <form onSubmit={handleSubmit}>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Product Name *</IonLabel>
                    <IonInput
                      value={formData.name}
                      onIonInput={(e) => handleInputChange('name', e.detail.value)}
                      placeholder="Enter product name"
                      className="mobile-input"
                      required
                    />
                  </IonItem>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Price (Rp.) *</IonLabel>
                    <IonInput
                      type="text"
                      inputmode="numeric"
                      value={formData.price}
                      onIonInput={(e) => handleInputChange('price', e.detail.value)}
                      placeholder="0"
                      className="mobile-input"
                      required
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonItem>
                    <IonLabel position="stacked">Category</IonLabel>
                    <IonSelect
                      value={formData.category}
                      onSelectionChange={(e) => handleInputChange('category', e.detail.value)}
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
                    <IonLabel position="stacked">Stock Quantity *</IonLabel>
                    <IonInput
                      type="number"
                      inputmode="numeric"
                      min="0"
                      value={formData.stock}
                      onIonInput={(e) => handleInputChange('stock', e.detail.value)}
                      placeholder="0"
                      className="mobile-input"
                      required
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12">
                  <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonTextarea
                      value={formData.description}
                      onIonInput={(e) => handleInputChange('description', e.detail.value)}
                      placeholder="Enter product description (optional)"
                      rows={3}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow className="ion-margin-top">
                <IonCol size="12" sizeMd="6">
                  <IonButton 
                    expand="block" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                  </IonButton>
                </IonCol>
                {product && (
                  <IonCol size="12" sizeMd="6">
                    <IonButton 
                      expand="block" 
                      fill="outline" 
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </IonButton>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          </form>
        </IonCardContent>
      </IonCard>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
        color={toastMessage.includes('Error') ? 'danger' : 'success'}
      />
    </>
  );
};

export default ProductForm;