# 🔧 Troubleshooting Guide

## Quick Fixes for Common Issues

### 1. Metro Bundler Issues

**Error: "Metro bundler not starting" or "Cache issues"**

```bash
# Clear cache and restart
npx expo start -c

# Or manually clear
rm -rf node_modules/.cache
npx expo start
```

**Error: "Port 8081 already in use"**

```bash
# Kill the process
npx kill-port 8081

# Or use different port
npx expo start --port 8082
```

---

### 2. WalletConnect Issues

**Error: "Invalid project ID"**

1. Go to https://cloud.walletconnect.com
2. Sign up / Login
3. Create new project
4. Copy Project ID
5. Update in `src/constants/index.ts`:
```typescript
PROJECT_ID: 'YOUR_ACTUAL_PROJECT_ID_HERE'
```

**Error: "Connection rejected"**

- Ensure MetaMask/wallet app is installed on phone
- Try closing and reopening wallet app
- Clear WalletConnect sessions in wallet settings
- Try different wallet (Trust Wallet, Rainbow, etc.)

**Error: "No wallets available"**

- Install MetaMask mobile or another WalletConnect-compatible wallet
- Ensure phone and computer are on same network
- Check firewall settings

---

### 3. Smart Contract Issues

**Error: "Contract call failed"**

Check these in `src/constants/index.ts`:

1. **Contract addresses are correct**:
```typescript
CONTRACT_ADDRESSES: {
  ASSET_TOKEN: '0x...', // ⚠️ Must be valid deployed address
  AMM_POOL: '0x...', // ⚠️ Must be valid deployed address
}
```

2. **Network is correct**:
```typescript
DEFAULT_NETWORK = NETWORK_CONFIG.SEPOLIA; // Make sure it matches your contracts
```

3. **RPC URL is working**:
```typescript
rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY' // Test this URL in browser
```

**Error: "Insufficient funds for gas"**

- Ensure wallet has ETH for gas fees
- Try on testnet (Sepolia) first
- Get testnet ETH from faucet: https://sepoliafaucet.com

**Error: "Transaction rejected"**

- User manually rejected in wallet
- Gas price too low
- Nonce issues (try resetting account in MetaMask)

---

### 4. Backend API Issues

**Error: "Network request failed" or "API not responding"**

Update `src/constants/index.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3000', // ⚠️ For Android Emulator
  // OR
  BASE_URL: 'http://192.168.1.100:3000', // ⚠️ Your computer's local IP
}
```

**Find your local IP:**

Windows:
```bash
ipconfig
# Look for "IPv4 Address"
```

Mac/Linux:
```bash
ifconfig
# Look for "inet" under active connection
```

**Check backend is running:**
```bash
cd Backend
npm start
# Should see "Server running on port 3000"
```

**Test backend manually:**
```bash
# In terminal or browser
curl http://localhost:3000/api/token/info?address=0x123...
```

---

### 5. Build/Dependency Issues

**Error: "Module not found"**

```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# Or use Expo install
npx expo install --fix
```

**Error: "Incompatible dependencies"**

```bash
# Use Expo's version resolver
npx expo install --fix

# If still issues, check package.json versions match Expo SDK 54
```

**Error: "TypeScript errors"**

```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or ignore for now
# Add to tsconfig.json: "skipLibCheck": true
```

---

### 6. Android Emulator Issues

**Error: "Android emulator not detected"**

1. Start Android Studio
2. Open AVD Manager (Tools → Device Manager)
3. Start an emulator
4. Wait for it to fully boot
5. Run `npx expo start --android`

**Error: "Installation failed"**

```bash
# Clean install
npx expo start --clear
# Press 'a' for Android
```

**Error: "App crashes on startup"**

1. Check Metro bundler for errors
2. Clear app data:
   - Settings → Apps → Expo Go → Clear Data
3. Reinstall app
4. Check Android Logcat in Android Studio

---

### 7. Environment Issues

**Error: "Couldn't find Java/Android SDK"**

1. Install Android Studio
2. Install Java JDK 11+
3. Set environment variables:

Windows:
```bash
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-11
```

Mac/Linux:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home
```

---

### 8. Performance Issues

**App is slow/laggy**

1. **Enable Hermes** (should be enabled by default)
2. **Reduce debug mode overhead**:
   ```bash
   npx expo start --no-dev --minify
   ```
3. **Clear cache**:
   ```bash
   npx expo start -c
   ```

**Metro bundler slow**

```bash
# Use different packager
npx expo start --max-workers 4
```

---

### 9. Dark Mode Issues

**Dark mode not working**

Check in `src/store/index.ts`:
```typescript
const { isDark, toggleTheme } = useThemeStore();
```

Force dark mode for testing:
```typescript
// In src/store/index.ts, set initial state
isDark: true, // Force dark mode
```

---

### 10. Navigation Issues

**Error: "Navigation prop undefined"**

Make sure screen is inside Navigator:
```typescript
// Correct
<Stack.Screen name="MyScreen" component={MyScreen} />

// Incorrect
<MyScreen /> // Outside navigator
```

**Screen not showing**

1. Check navigation path is correct
2. Verify screen is registered in navigator
3. Check `headerShown` option
4. Look for errors in Metro bundler

---

## 🆘 Still Having Issues?

### Debug Steps:

1. **Check Metro Bundler Console**
   - Look for red errors
   - Check warnings
   - Read error messages carefully

2. **Check Android Logcat** (if on Android)
   - Open Android Studio
   - View → Tool Windows → Logcat
   - Filter by app package name

3. **Enable Debug Mode**
   ```typescript
   // Add to src/services/api/index.ts
   console.log('API Request:', config);
   console.log('API Response:', response);
   ```

4. **Test Components Individually**
   ```typescript
   // Comment out other screens to isolate issue
   ```

5. **Check Package Versions**
   ```bash
   npm list ethers zustand axios
   # Ensure versions match INSTALL_DEPENDENCIES.md
   ```

---

## 📞 Getting Help

### Check These First:
1. ✅ All dependencies installed?
2. ✅ Configuration updated in `src/constants/index.ts`?
3. ✅ Backend running?
4. ✅ Contract addresses correct?
5. ✅ WalletConnect Project ID set?
6. ✅ Android Emulator running?

### Useful Resources:
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [ethers.js Docs](https://docs.ethers.org/v6/)

### Debug Checklist:
```bash
# 1. Clear everything
npx expo start -c

# 2. Check logs
# Look for actual error messages in Metro console

# 3. Test API
curl http://10.0.2.2:3000/api/token/info?address=0x123

# 4. Test contract addresses
# Verify on Etherscan: https://sepolia.etherscan.io/address/0xYOUR_ADDRESS

# 5. Restart emulator
# Close and restart Android Emulator

# 6. Reinstall app
# In emulator: Long press app → Uninstall → Reinstall
```

---

## ✅ Quick Verification Script

Run this to check if everything is configured:

```typescript
// Add this to src/App.tsx temporarily
useEffect(() => {
  console.log('🔍 Configuration Check:');
  console.log('API URL:', API_CONFIG.BASE_URL);
  console.log('WC Project ID:', WALLET_CONNECT_CONFIG.PROJECT_ID);
  console.log('AMM Pool:', CONTRACT_ADDRESSES.AMM_POOL);
  console.log('Network:', DEFAULT_NETWORK.name);
}, []);
```

---

**Remember:** Most issues are configuration-related. Double-check `src/constants/index.ts`! 🎯
