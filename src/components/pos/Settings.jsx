import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/react';
import usePOSStore from '@/stores/posStore';

const Settings = () => {
  const { autoPrint, setAutoPrint } = usePOSStore();

  return (
    <div className="p-4">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Print Settings</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem>
            <IonLabel>
              <h2>Auto Print Receipt</h2>
              <p>Automatically print receipt after checkout</p>
            </IonLabel>
            <IonToggle
              checked={autoPrint}
              onIonChange={(e) => setAutoPrint(e.detail.checked)}
            />
          </IonItem>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Settings;
