# 🛡️ Bulletproof RPC Blocker Fix

The previous attempts to `unset` variables might be failing if your WSL environment is inheriting variables from Windows or if Forge is auto-loading them from `.env` files in subdirectories.

### 🚀 The Definitive "Local Only" Command

Run this exact command in WSL. It uses `env` to ensure Forge starts with **zero** RPC-related environment variables, regardless of your shell settings:

```bash
cd /mnt/c/AssetToken && \
env -u ETH_RPC_URL -u SEPOLIA_RPC_URL -u MAINNET_RPC_URL -u BASE_RPC_URL -u ALCHEMY_API_KEY -u INFURA_API_KEY \
forge test --match-contract "ProtocolFuzz|ProtocolInvariant" -vv
```

### Why this works:
1. **`env -u VARIABLE`**: This specifically "unsets" the variable just for the duration of the `forge test` command. Even if it's set in your Windows System variables, it won't reach Forge.
2. **`isolate = true`**: Added to `foundry.toml` to tell Forge NOT to use any shared state or remote backend.
3. **`no_storage_caching = true`**: Prevents Forge from trying to look up or store RPC data on disk.

### Verification
If it works, you will see `console.log` working normally. The address `0x000000000000000000636F6e736F6c652e6c6f67` (which was causing the 429 error) will be handled entirely in local memory.

### If you still see errors:
Please run `env | grep RPC` and share the output. We might need to block a specific provider-named variable (like `ALCHEMY_URL`).
