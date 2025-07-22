# PWA Icons

This directory contains the Progressive Web App (PWA) icons for FreePos.

## Required Icon Sizes

The following icon sizes are needed for optimal PWA support:

- **72x72**: icon-72x72.png
- **96x96**: icon-96x96.png  
- **128x128**: icon-128x128.png
- **144x144**: icon-144x144.png
- **152x152**: icon-152x152.png
- **192x192**: icon-192x192.png
- **384x384**: icon-384x384.png
- **512x512**: icon-512x512.png

## Shortcut Icons

Additional icons for app shortcuts:

- **shortcut-order.png** (96x96): New Order shortcut
- **shortcut-cart.png** (96x96): View Cart shortcut  
- **shortcut-history.png** (96x96): Order History shortcut

## Icon Requirements

- Format: PNG
- Purpose: "maskable any" (supports both maskable and regular icons)
- Background: Should work on any background color
- Design: Simple, recognizable icon representing a POS system

## Generation Tips

You can generate these icons from a single high-resolution source (1024x1024) using tools like:
- Online PWA icon generators
- ImageMagick: `convert source.png -resize 192x192 icon-192x192.png`
- Photoshop or other image editing software

Place all generated icons in this directory to complete PWA setup.