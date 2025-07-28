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
  const [customerName, setCustomerName] = useState('');

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

    if (!customerName.trim()) {
      setToastMessage('Customer name is required');
      setShowToast(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processOrder({
        customerName: customerName.trim()
      });
      setToastMessage('Order processed successfully!');
      setShowToast(true);
      setShowCheckoutAlert(false);
      setCustomerName(''); // Clear customer name after successful order
    } catch (error) {
      console.error('Error processing order:', error);
      setToastMessage('Error processing order. Please try again.');
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const CartItem = ({ item }) => (
    <IonItem 
      key={item.productId}
      className="cart-item"
      style={{
        '--inner-padding-end': '16px',
        '--inner-padding-start': '16px',
        '--inner-padding-top': '12px',
        '--inner-padding-bottom': '12px',
        '--border-width': '0 0 1px 0',
        '--border-color': '#e5e5e5',
        margin: '0 0 8px 0'
      }}
    >
      <div className="w-full">
        {/* Header: Product Name, Price, Total, Delete */}
        <div 
          className="flex justify-between items-start"
          style={{ marginBottom: '12px' }}
        >
          <div className="flex-1" style={{ paddingRight: '16px' }}>
            <h3 
              className="font-semibold text-lg"
              style={{ 
                margin: '0 0 4px 0',
                lineHeight: '1.3',
                fontSize: '18px'
              }}
            >
              {item.name}
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{ 
                margin: '0',
                fontSize: '13px',
                color: '#666'
              }}
            >
              {formatRupiah(item.price)} each
            </p>
          </div>
          <div 
            className="text-right flex items-center"
            style={{ gap: '12px' }}
          >
            <div 
              className="text-lg font-bold"
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#2563eb',
                minWidth: '80px',
                textAlign: 'right'
              }}
            >
              {formatRupiah(item.price * item.quantity)}
            </div>
            <IonButton
              fill="clear"
              size="small"
              color="danger"
              onClick={() => removeFromCart(item.productId)}
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                margin: '0',
                minHeight: '36px',
                minWidth: '36px'
              }}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>
        </div>
        
        {/* Footer: Quantity Controls and Badge */}
        <div 
          className="flex items-center justify-between"
          style={{ paddingTop: '8px' }}
        >
          <div 
            className="flex items-center"
            style={{ gap: '8px' }}
          >
            <IonButton
              fill="outline"
              size="small"
              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
              style={{
                '--padding-start': '12px',
                '--padding-end': '12px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                margin: '0',
                minHeight: '36px',
                minWidth: '36px'
              }}
            >
              <IonIcon icon={remove} />
            </IonButton>
            
            <IonInput
              type="number"
              inputmode="numeric"
              min="1"
              value={item.quantity}
              onIonInput={(e) => handleQuantityChange(item.productId, parseInt(e.detail.value) || 1)}
              className="quantity-input"
              style={{
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '6px',
                '--padding-bottom': '6px',
                width: '64px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                margin: '0 4px'
              }}
            />
            
            <IonButton
              fill="outline"
              size="small"
              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
              style={{
                '--padding-start': '12px',
                '--padding-end': '12px',
                '--padding-top': '8px',
                '--padding-bottom': '8px',
                margin: '0',
                minHeight: '36px',
                minWidth: '36px'
              }}
            >
              <IonIcon icon={add} />
            </IonButton>
          </div>
          
          <IonBadge 
            color="primary"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px 12px',
              borderRadius: '12px',
              minWidth: '60px',
              textAlign: 'center',
              margin: '0'
            }}
          >
            Qty: {item.quantity}
          </IonBadge>
        </div>
      </div>
    </IonItem>
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
            {/* Customer Name Input */}
            <IonItem className="mb-4 customer-input-card">
              <IonInput
                label="Customer Name"
                labelPlacement="floating"
                value={customerName}
                onIonInput={(e) => setCustomerName(e.detail.value)}
                placeholder="Enter customer name"
              ></IonInput>
            </IonItem>

            {/* Cart Items */}
            <IonList className="mb-6">
              {currentOrder.items.map(item => (
                <CartItem key={item.productId} item={item} />
              ))}
            </IonList>

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
                    <span className="2xl font-bold text-primary">
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
                    disabled={isProcessing || !customerName.trim()}
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
        message={`Process order for ${formatRupiah(currentOrder.total)}?\n\nCustomer: ${customerName.trim()}`}
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