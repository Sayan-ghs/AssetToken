// Contract ABIs (simplified versions - you should include full ABIs from compiled contracts)
export const AssetTokenABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

export const AssetRegistryABI = [
  "function registerAsset(address tokenAddress, string memory assetType, string memory location, bytes32 documentHash) returns (uint256)",
  "function getAsset(uint256 assetId) view returns (address, string, string, bytes32, bool)",
  "function verifyAsset(uint256 assetId) external",
  "function totalAssets() view returns (uint256)",
  "event AssetRegistered(uint256 indexed assetId, address indexed tokenAddress, string assetType)",
  "event AssetVerified(uint256 indexed assetId)",
]

export const PrimarySaleABI = [
  "function createSale(address tokenAddress, uint256 pricePerToken, uint256 totalSupply, uint256 startTime, uint256 endTime) returns (uint256)",
  "function buyTokens(uint256 saleId) payable",
  "function getSale(uint256 saleId) view returns (address, uint256, uint256, uint256, uint256, uint256, bool)",
  "function endSale(uint256 saleId)",
  "event SaleCreated(uint256 indexed saleId, address indexed tokenAddress, uint256 pricePerToken)",
  "event TokensPurchased(uint256 indexed saleId, address indexed buyer, uint256 amount, uint256 cost)",
]

export const AMMPoolABI = [
  "function addLiquidity(uint256 tokenAmount, uint256 ethAmount) payable returns (uint256)",
  "function removeLiquidity(uint256 lpTokenAmount) returns (uint256, uint256)",
  "function swapTokenForETH(uint256 tokenAmount, uint256 minETHOut) returns (uint256)",
  "function swapETHForToken(uint256 minTokenOut) payable returns (uint256)",
  "function getReserves() view returns (uint256, uint256)",
  "function getPrice() view returns (uint256)",
  "event LiquidityAdded(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 lpTokens)",
  "event LiquidityRemoved(address indexed provider, uint256 tokenAmount, uint256 ethAmount, uint256 lpTokens)",
  "event Swap(address indexed user, uint256 tokenIn, uint256 ethOut)",
]

export const OraclePriceFeedABI = [
  "function updatePrice(address asset, uint256 price) external",
  "function getPrice(address asset) view returns (uint256, uint256)",
  "function getLatestPrice(address asset) view returns (uint256)",
  "event PriceUpdated(address indexed asset, uint256 price, uint256 timestamp)",
]

export const ProofOfReserveABI = [
  "function updateReserve(uint256 amount, string memory proofHash) external",
  "function getReserve() view returns (uint256, uint256, string)",
  "function verifyReserve() view returns (bool)",
  "event ReserveUpdated(uint256 amount, uint256 timestamp, string proofHash)",
]

export const PlatformFeeControllerABI = [
  "function setFee(uint256 feePercent) external",
  "function getFee() view returns (uint256)",
  "function collectFees() external",
  "event FeeUpdated(uint256 newFee)",
  "event FeesCollected(address indexed collector, uint256 amount)",
]
