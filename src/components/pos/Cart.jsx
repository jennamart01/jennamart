import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonInput,
  IonAlert,
  IonToast,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import {
  add,
  remove,
  trash,
  card,
  print,
  checkmark,
  cart,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';
import { formatRupiah } from '@/utils/currency';

const Cart = () => {
  const {
    currentOrder,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processOrder,
    printReceipt,
  } = usePOSStore();

  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showCheckoutAlert, setShowCheckoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, parseInt(newQuantity));
    }
  };

  const handleCheckout = async () => {
    if (currentOrder.items.length === 0) {
      setToastMessage('Cart is empty');
      setShowToast(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processOrder();
      setToastMessage('Order processed successfully!');
      setShowToast(true);
      setShowCheckoutAlert(false);
    } catch (error) {
      console.error('Error processing order:', error);
      setToastMessage('Error processing order. Please try again.');
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const CartItem = ({ item }) => (
    <IonItemSliding key={item.productId}>
      <IonItem>
        <div className="w-full py-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600">{formatRupiah(item.price)} each</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {formatRupiah(item.price * item.quantity)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IonButton
                fill="outline"
                size="small"
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
              >
                <IonIcon icon={remove} />
              </IonButton>
              
              <IonInput
                type="number"
                inputmode="numeric"
                min="1"
                value={item.quantity}
                onIonInput={(e) => handleQuantityChange(item.productId, parseInt(e.detail.value) || 1)}
                className="w-16 text-center mobile-input touch-target"
              />
              
              <IonButton
                fill="outline"
                size="small"
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
              >
                <IonIcon icon={add} />
              </IonButton>
            </div>
            
            <IonBadge color="primary">
              Qty: {item.quantity}
            </IonBadge>
          </div>
        </div>
      </IonItem>
      
      <IonItemOptions side="end">
        <IonItemOption 
          color="danger" 
          onClick={() => removeFromCart(item.productId)}
        >
          <IonIcon icon={trash} />
          Remove
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );

  return (
    <>
      <div className="pos-content">
        {currentOrder.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <IonIcon icon={cart} className="text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500">
              Add some products to get started
            </p>
          </div>
        ) : (
          <div className="p-4">
            {/* Cart Items */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Cart Items ({currentOrder.items.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {currentOrder.items.map(item => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Order Summary */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Order Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="space-y-2">
                  {currentOrder.items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <hr className="my-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatRupiah(currentOrder.total)}
                    </span>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Action Buttons */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="danger"
                    onClick={() => setShowClearAlert(true)}
                    disabled={isProcessing}
                  >
                    <IonIcon icon={trash} slot="start" />
                    Clear Cart
                  </IonButton>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <IonButton
                    expand="block"
                    color="success"
                    onClick={() => setShowCheckoutAlert(true)}
                    disabled={isProcessing}
                  >
                    <IonIcon icon={checkmark} slot="start" />
                    {isProcessing ? 'Processing...' : 'Checkout'}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        )}
      </div>

      {/* Clear Cart Alert */}
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header="Clear Cart"
        message="Are you sure you want to remove all items from the cart?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Clear',
            role: 'destructive',
            handler: () => {
              clearCart();
              setToastMessage('Cart cleared');
              setShowToast(true);
            }
          }
        ]}
      />

      {/* Checkout Confirmation Alert */}
      <IonAlert
        isOpen={showCheckoutAlert}
        onDidDismiss={() => setShowCheckoutAlert(false)}
        header="Confirm Order"
        message={`Process order for ${formatRupiah(currentOrder.total)}?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            handler: handleCheckout
          }
        ]}
      />

      {/* Toast Messages */}
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

export default Cart;