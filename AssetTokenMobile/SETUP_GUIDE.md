# 🚀 AssetToken Mobile App - Complete Setup & Configuration Guide

## 📋 Overview

This is a **production-ready React Native mobile application** built with:
- ✅ React Native (Expo)
- ✅ TypeScript
- ✅ WalletConnect v2
- ✅ ethers.js v6
- ✅ Zustand (State Management)
- ✅ React Navigation
- ✅ Reanimated & Gesture Handler
- ✅ Full Backend & Smart Contract Integration

---

## 🔧 Configuration Steps

### 1️⃣ Configure Smart Contract Addresses

Edit `src/constants/index.ts` and update contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  ASSET_TOKEN: '0xYOUR_ASSET_TOKEN_ADDRESS',
  ASSET_REGISTRY: '0xYOUR_REGISTRY_ADDRESS',
  PRIMARY_SALE: '0xYOUR_SALE_ADDRESS',
  AMM_POOL: '0xYOUR_POOL_ADDRESS',
  ORACLE_PRICE_FEED: '0xYOUR_ORACLE_ADDRESS',
  PROOF_OF_RESERVE: '0xYOUR_RESERVE_ADDRESS',
  PLATFORM_FEE_CONTROLLER: '0xYOUR_FEE_ADDRESS',
};
```

### 2️⃣ Configure Network

Update network configuration in `src/constants/index.ts`:

```typescript
export const NETWORK_CONFIG = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // ⚠️ Replace with your key
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};
```

### 3️⃣ Configure Backend API

Update API base URL in `src/constants/index.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_IP:3000', // ⚠️ Replace with your backend URL
  TIMEOUT: 30000,
  // ... endpoints are already configured
};
```

**For Android Emulator:**
- Use `http://10.0.2.2:3000` to access localhost on your computer
- Or use your computer's local IP (e.g., `http://192.168.1.100:3000`)

### 4️⃣ Configure WalletConnect

Get your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com):

1. Sign up at https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Update `src/constants/index.ts`:

```typescript
export const WALLET_CONNECT_CONFIG = {
  PROJECT_ID: 'YOUR_WALLETCONNECT_PROJECT_ID', // ⚠️ Replace this
  METADATA: {
    name: 'AssetToken Mobile',
    description: 'Real-World Asset Tokenization Platform',
    url: 'https://assettokenmobile.app',
    icons: ['https://assettokenmobile.app/icon.png'],
    redirect: {
      native: 'assettokenmobile://',
    },
  },
};
```

---

## 🏃‍♂️ Running the App

### Start Development Server

```bash
cd AssetTokenMobile
npx expo start
```

### Run on Android Emulator

```bash
npx expo start --android
```

Or press `a` after running `npx expo start`

### Run on Physical Device

1. Install Expo Go app from Play Store
2. Scan QR code shown in terminal
3. App will load on your device

---

## 📱 App Features

### ✅ Implemented Features

1. **Wallet Integration**
   - WalletConnect v2
   - Connect/Disconnect
   - Balance display
   - Network detection

2. **Smart Contract Integration**
   - Token balance reading
   - Transfer tokens
   - Approve tokens
   - AMM Pool interactions (swap, add/remove liquidity)
   - All read/write functions

3. **Swap Functionality**
   - ETH ↔ Token swaps
   - Slippage control
   - Price impact calculation
   - Minimum received calculation

4. **Dashboard**
   - Portfolio overview
   - Quick actions
   - Asset list
   - Stats display

5. **UI Components**
   - Buttons (multiple variants)
   - Cards
   - Inputs
   - Modals
   - Loading states
   - Toast notifications
   - Animations

---

## 🧪 Testing the App

### Test Wallet Connection

1. Open app
2. Tap "Connect Wallet"
3. Scan QR with MetaMask mobile
4. Approve connection
5. Should see Dashboard with your balance

### Test Swap

1. Go to Swap tab
2. Enter amount
3. Tap settings to adjust slippage
4. Tap "Swap"
5. Confirm in wallet

---

## 🐛 Common Errors & Fixes

### Error: "Metro bundler not starting"

```bash
# Clear cache and restart
npx expo start -c
```

### Error: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Error: "WalletConnect not connecting"

1. Check PROJECT_ID is correct
2. Ensure MetaMask is installed on phone
3. Try clearing WalletConnect cache in MetaMask settings

### Error: "Contract call failing"

1. Verify contract addresses are correct
2. Check you're on correct network
3. Ensure wallet has enough ETH for gas

### Error: "Backend API not responding"

1. Check backend is running
2. Verify API_CONFIG.BASE_URL is correct
3. Use `10.0.2.2` for Android Emulator
4. Check firewall settings

---

## 🗂️ Project Structure

```
AssetTokenMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── AssetCard.tsx
│   │
│   ├── screens/            # All app screens
│   │   ├── SplashScreen.tsx
│   │   ├── WalletConnectScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── SwapScreen.tsx
│   │
│   ├── navigation/         # Navigation setup
│   │   └── index.tsx
│   │
│   ├── services/           # Business logic
│   │   ├── api/           # Backend API client
│   │   ├── blockchain/    # Smart contract interactions
│   │   └── wallet/        # Wallet management
│   │
│   ├── store/             # Zustand state management
│   │   └── index.ts
│   │
│   ├── hooks/             # Custom React hooks
│   │   └── index.ts
│   │
│   ├── utils/             # Helper functions
│   │   └── index.ts
│   │
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── constants/         # Configuration
│   │   └── index.ts
│   │
│   ├── theme/             # Theme & styling
│   │   └── index.ts
│   │
│   └── App.tsx            # Root component
│
├── app/                   # Expo Router (redirects to src/App.tsx)
├── assets/               # Images, fonts, etc.
└── package.json
```

---

## 🔑 Key Files to Configure

| File | What to Configure |
|------|------------------|
| `src/constants/index.ts` | Contract addresses, API URL, WalletConnect ID, Network settings |
| `src/services/blockchain/abis.ts` | Contract ABIs (already done) |
| `app.json` | App name, bundle ID, icons |

---

## 🎨 Customization

### Change App Colors

Edit `src/theme/index.ts`:

```typescript
export const Colors = {
  light: {
    primary: '#3B82F6', // Change this
    secondary: '#8B5CF6',
    // ... other colors
  },
};
```

### Add New Screen

1. Create file in `src/screens/YourScreen.tsx`
2. Add to navigation in `src/navigation/index.tsx`
3. Create route in tab or stack navigator

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [WalletConnect](https://docs.walletconnect.com/)
- [ethers.js](https://docs.ethers.org/v6/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## ✅ Verification Checklist

Before running, verify:

- [ ] All dependencies installed (`npm install` completed)
- [ ] Contract addresses updated in `src/constants/index.ts`
- [ ] Backend API URL configured correctly
- [ ] WalletConnect Project ID added
- [ ] Network RPC URL configured
- [ ] Android Emulator is running
- [ ] Backend server is running

---

## 🚀 Next Steps

After basic setup works:

1. ✅ Test wallet connection
2. ✅ Test swap functionality
3. ⏭️ Implement remaining screens:
   - Assets List Screen
   - Asset Details Screen
   - Liquidity Screen
   - Transactions Screen
   - Profile/Settings Screen
4. ⏭️ Add more animations with Lottie
5. ⏭️ Implement push notifications
6. ⏭️ Add biometric authentication
7. ⏭️ Build production APK

---

## 💡 Pro Tips

1. **Use Console Logs**: Check Metro bundler console for errors
2. **React DevTools**: Install for debugging
3. **Reload App**: Shake device or press `R` in terminal
4. **Clear Cache**: Use `npx expo start -c` if issues persist
5. **Check Network**: Ensure emulator has internet access

---

## 🎉 You're Ready!

Your app is now fully configured and ready to run. Start the development server and begin testing!

```bash
cd AssetTokenMobile
npx expo start
```

**Need help?** Check the common errors section above or review the code comments for detailed explanations.
