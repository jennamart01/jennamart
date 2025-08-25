'use client';

import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonButtons,
} from '@ionic/react';
import { lockClosed, close } from 'ionicons/icons';
import { useRouter } from 'next/navigation';

const LoginModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === 'tebusmurah') {
      setToastMessage('Login berhasil! Redirecting to admin...');
      setShowToast(true);
      setTimeout(() => {
        router.push('/admin');
        onClose();
        setPassword('');
      }, 1000);
    } else {
      setToastMessage('Password salah!');
      setShowToast(true);
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Admin Login</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="ion-padding">
          <div className="login-container">
            <div className="login-icon">
              <IonIcon icon={lockClosed} size="large" color="primary" />
            </div>
            
            <h2 className="ion-text-center">Masuk ke Admin Panel</h2>
            
            <IonItem className="ion-margin-top">
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value)}
                placeholder="Masukkan password admin"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </IonItem>
            
            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleLogin}
              disabled={!password}
            >
              Login
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={password === 'tebusmurah' ? 'success' : 'danger'}
      />
    </>
  );
};

export default LoginModal;