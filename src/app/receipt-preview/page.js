'use client';

import React from 'react';
import { formatRupiah } from '@/utils/currency';

const ReceiptPreview = () => {
  // Sample order data for preview
  const sampleOrder = {
    orderNumber: 'ORD-1692123456789',
    customerName: 'John Doe',
    createdAt: new Date(),
    items: [
      { name: 'Nasi Gudeg Yogya', quantity: 2, price: 15000 },
      { name: 'Es Teh Manis', quantity: 1, price: 5000 },
      { name: 'Kerupuk Udang', quantity: 3, price: 3000 },
    ],
    total: 44000
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Thermal Receipt Preview (58mm x 40mm)</h1>
        <button 
          onClick={printReceipt}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Print Preview
        </button>
      </div>

      <div className="thermal-receipt" style={{
        width: '58mm',
        maxWidth: '58mm',
        margin: '0 auto',
        padding: '5px',
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: '8px',
        lineHeight: '1.1',
        color: '#000',
        background: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <div className="receipt-header" style={{
          textAlign: 'center',
          marginBottom: '2mm',
          borderBottom: '1px dashed #000',
          paddingBottom: '1mm'
        }}>
          <img 
            src="/icons/logo-print.png" 
            alt="Jennamart Logo" 
            style={{
              width: '25mm',
              height: '25mm',
              margin: '0 auto 2mm auto',
              display: 'block'
            }}
          />
          <div style={{
            fontSize: '9px',
            margin: '0.5mm 0',
            lineHeight: '1.1',
            textAlign: 'center'
          }}>
            Order #{sampleOrder.orderNumber}
          </div>
          <div style={{
            fontSize: '9px',
            margin: '0.5mm 0',
            lineHeight: '1.1',
            textAlign: 'center'
          }}>
            {new Date(sampleOrder.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            })} {new Date(sampleOrder.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div style={{
            fontSize: '9px',
            margin: '0.5mm 0',
            lineHeight: '1.1',
            textAlign: 'center'
          }}>
            Customer: {sampleOrder.customerName}
          </div>
        </div>
        
        <div style={{
          borderTop: '1px dashed #000',
          margin: '1.5mm 0',
          height: '0'
        }}></div>
        
        <div className="receipt-items" style={{ margin: '1mm 0' }}>
          {sampleOrder.items.map((item, index) => (
            <div key={index} style={{
              margin: '0.5mm 0',
              fontSize: '7px',
              lineHeight: '1.1'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                margin: '0.3mm 0'
              }}>
                <div style={{
                  flex: 1,
                  marginRight: '2mm',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}>
                  {item.name}
                </div>
                <div style={{
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  fontSize: '6px'
                }}>
                  {item.quantity}x {formatRupiah(item.price)}
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                margin: '0.3mm 0'
              }}>
                <div style={{
                  flex: 1,
                  marginRight: '2mm'
                }}></div>
                <div style={{
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}>
                  {formatRupiah(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          borderTop: '1px dashed #000',
          margin: '1.5mm 0',
          height: '0'
        }}></div>
        
        <div style={{
          margin: '1mm 0',
          fontWeight: 'bold'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            fontWeight: 'bold',
            margin: '0.5mm 0'
          }}>
            <span>TOTAL:</span>
            <span>{formatRupiah(sampleOrder.total)}</span>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '2mm',
          borderTop: '1px dashed #000',
          paddingTop: '1mm',
          fontSize: '7px'
        }}>
          <div style={{
            fontWeight: 'bold',
            margin: '0.5mm 0',
            lineHeight: '1.1'
          }}>
            Terima kasih sudah berbelanja
          </div>
          <div style={{
            fontWeight: 'bold',
            margin: '0.5mm 0',
            lineHeight: '1.1'
          }}>
            di Jennamart
          </div>
        </div>
      </div>

      <style jsx>{`
        .thermal-receipt {
          position: relative;
        }
        
        .thermal-receipt::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/icons/icon-192x192.png');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: 40mm 40mm;
          opacity: 0.2;
          z-index: -1;
          pointer-events: none;
        }
        
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .thermal-receipt {
            width: 58mm !important;
            max-width: 58mm !important;
            min-width: 58mm !important;
            margin: 0 !important;
            padding: 5px !important;
            font-family: 'Courier New', 'Consolas', monospace !important;
            font-size: 10px !important;
            line-height: 1.1 !important;
            color: #000 !important;
            background: white !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            position: relative !important;
          }
          
          .thermal-receipt::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-image: url('/icons/icon-192x192.png') !important;
            background-repeat: no-repeat !important;
            background-position: center center !important;
            background-size: 40mm 40mm !important;
            opacity: 0.2 !important;
            z-index: -1 !important;
            pointer-events: none !important;
          }
          
          @page {
            size: 58mm auto;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPreview;
