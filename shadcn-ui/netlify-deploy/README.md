# NutriLearn - Nutrition Tracking App

A comprehensive nutrition tracking application with subscription payments via Intasend.

## Features
- User authentication and meal tracking
- M-Pesa STK push payments
- Card payment processing
- 3-tier subscription model
- Real-time nutrition analysis

## Deployment Instructions

### Option 1: Drag & Drop to Netlify
1. Zip the contents of this folder
2. Go to https://app.netlify.com/drop
3. Drag and drop the zip file
4. Your app will be deployed instantly!

### Option 2: Connect GitHub Repository
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the "nutrilearn-app" repository
5. Set build command: `pnpm run build`
6. Set publish directory: `dist`
7. Click "Deploy site"

## Configuration
After deployment, update the following in your files:
- Add your Intasend API credentials in `payment.js`
- Update Supabase credentials in `script.js` if using database

## Live Demo
Your app will be available at: https://[your-site-name].netlify.app