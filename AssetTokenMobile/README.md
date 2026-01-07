# 🎯 QUICK START GUIDE - AssetToken Mobile

## ⚡ 3 Steps to Run

### 1. Configure Settings

Open `src/constants/index.ts` and update:

```typescript
// Line 60: Add your WalletConnect Project ID
PROJECT_ID: 'GET_FROM_https://cloud.walletconnect.com',

// Line 72: Update API URL for your backend
BASE_URL: 'http://10.0.2.2:3000', // For Android Emulator

// Line 39-45: Add your deployed contract addresses
CONTRACT_ADDRESSES: {
  ASSET_TOKEN: '0xYOUR_ADDRESS_HERE',
  AMM_POOL: '0xYOUR_ADDRESS_HERE',
  // ... update all addresses
}
```

### 2. Start the App

```bash
cd AssetTokenMobile
npx expo start
```

### 3. Run on Emulator

Press `a` for Android or scan QR code with Expo Go

---

## ✅ Features Implemented

✅ WalletConnect v2 Integration  
✅ Smart Contract Interactions (ethers.js)  
✅ Backend API Integration (Axios)  
✅ State Management (Zustand)  
✅ Navigation (React Navigation)  
✅ Animations (Reanimated)  
✅ Swap Functionality (AMM)  
✅ Dashboard & Portfolio  
✅ Dark Mode Support  
✅ Toast Notifications  
✅ Loading States  
✅ Error Handling  

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/constants/index.ts` | **⚠️ CONFIGURE THIS FIRST** |
| `src/App.tsx` | Main app component |
| `src/navigation/index.tsx` | Navigation setup |
| `src/screens/*` | All app screens |
| `src/services/*` | Wallet, blockchain, API |
| `src/store/index.ts` | State management |

---

## 🐛 Troubleshooting

**App won't start?**
```bash
npx expo start -c
```

**WalletConnect not working?**
- Get Project ID from https://cloud.walletconnect.com
- Update in `src/constants/index.ts` line 60

**Backend not connecting?**
- Use `http://10.0.2.2:3000` for Android Emulator
- Or your computer's IP: `http://192.168.1.X:3000`

---

## 📖 Full Documentation

See `SETUP_GUIDE.md` for complete documentation.

---

**Ready!** Start the dev server and connect your wallet! 🚀

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
