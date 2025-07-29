import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
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
              
              
              <IonRow className="ion-margin-top">
                <IonCol size="12" sizeMd="6">
                  <IonButton 
                    className="ion-color-primary-gradient"
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
                      className="ion-color-primary-gradient"
                      expand="block" 
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