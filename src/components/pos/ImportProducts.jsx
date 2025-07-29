import React, { useState, useRef } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonNote,
  IonProgressBar,
  IonAlert,
} from '@ionic/react';
import {
  cloudUpload,
  document,
  checkmark,
  warning,
  folder,
} from 'ionicons/icons';
import usePOSStore from '@/stores/posStore';

const ImportProducts = () => {
  const { importProducts } = usePOSStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        setToastMessage('Please select a valid JSON file.');
        setShowToast(true);
        event.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setToastMessage('Please select a file first.');
      setShowToast(true);
      return;
    }

    setIsImporting(true);
    try {
      const result = await importProducts(selectedFile);
      setImportResult(result);
      
      let message = `Successfully imported ${result.imported} products`;
      if (result.skipped > 0) {
        message += ` (${result.skipped} skipped)`;
      }
      
      setToastMessage(message);
      setShowToast(true);
      
      // Clear file selection
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setToastMessage(`Import failed: ${error.message}`);
      setShowToast(true);
    } finally {
      setIsImporting(false);
      setShowConfirmAlert(false);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="pos-content">
        <div className="p-4">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="flex items-center gap-2">
                <IonIcon icon={cloudUpload} />
                Import Products
              </IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Import products from a JSON file. The file should contain an array of products 
                  or be in the export format from this system.
                </p>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Supported formats:</h4>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12">
                        <IonItem>
                          <IonIcon icon={document} slot="start" color="primary" />
                          <IonLabel>
                            <h3>Direct Array</h3>
                            <IonNote>[{"{"}"name": "Product", "price": 1000, "stock": 10{"}"}]</IonNote>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                      
                      <IonCol size="12">
                        <IonItem>
                          <IonIcon icon={document} slot="start" color="success" />
                          <IonLabel>
                            <h3>Export Format</h3>
                            <IonNote>{"{"}"data": {"{"}"products": [...]{"}"}{"}"}</IonNote>
                          </IonLabel>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
              </div>
              
              {/* File Selection */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleBrowseFiles}
                  disabled={isImporting}
                >
                  <IonIcon icon={folder} slot="start" />
                  Select JSON File
                </IonButton>
                
                {selectedFile && (
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <IonIcon icon={document} color="primary" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Import Button */}
              <div className="text-center">
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={() => setShowConfirmAlert(true)}
                  disabled={!selectedFile || isImporting}
                  className="ion-margin-top"
                >
                  <IonIcon icon={cloudUpload} slot="start" />
                  {isImporting ? 'Importing...' : 'Import Products'}
                </IonButton>
                
                {isImporting && (
                  <div className="mt-2">
                    <IonProgressBar type="indeterminate" />
                  </div>
                )}
              </div>
              
              {/* Import Result */}
              {importResult && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <IonIcon icon={checkmark} color="success" />
                    <span className="font-semibold text-green-800">Import Completed</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>✅ Imported: {importResult.imported} products</p>
                    {importResult.skipped > 0 && (
                      <p>⚠️ Skipped: {importResult.skipped} products</p>
                    )}
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {importResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                          {importResult.errors.length > 5 && (
                            <li className="text-xs">... and {importResult.errors.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Warning */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-start gap-2">
                  <IonIcon icon={warning} color="warning" className="mt-1" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>This will add new products to your existing inventory</li>
                      <li>Duplicate products (same name) may be created</li>
                      <li>Invalid products will be skipped</li>
                      <li>Required fields: name, price</li>
                    </ul>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </div>
      
      {/* Confirmation Alert */}
      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header="Confirm Import"
        message={`Are you sure you want to import products from "${selectedFile?.name}"? This will add new products to your inventory.`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Import',
            handler: handleImport,
          },
        ]}
      />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="top"
        color={toastMessage.includes('Failed') || toastMessage.includes('failed') ? 'danger' : 'success'}
      />
    </>
  );
};

export default ImportProducts;
