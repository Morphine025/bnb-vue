/**
 * Pinia Store 类型定义
 * 功能描述：定义所有store模块的TypeScript类型
 * 主要功能：类型安全、代码提示、接口规范
 */

// 应用配置类型
export const AppConfig = {
  version: String,
  name: String,
  apiBaseUrl: String,
  isDebug: Boolean
}

// 全局UI状态类型
export const GlobalUI = {
  isOnline: Boolean,
  networkType: String,
  systemInfo: Object,
  statusBarHeight: Number,
  navigationBarHeight: Number
}

// 用户信息类型
export const UserInfo = {
  id: String,
  username: String,
  avatar: String,
  nickname: String,
  phone: String,
  email: String,
  isVip: Boolean,
  level: Number
}

// 民宿数据类型
export const Homestay = {
  id: String,
  title: String,
  description: String,
  price: Number,
  location: String,
  images: Array,
  facilities: Array,
  rating: Number,
  reviewCount: Number,
  host: Object,
  coordinates: Object,
  roomType: String,
  maxGuests: Number,
  amenities: Array,
  policies: Object,
  availability: Object
}

// 筛选条件类型
export const FilterConditions = {
  location: String,
  priceRange: Array,
  roomType: String,
  facilities: Array,
  rating: Number,
  sortBy: String,
  checkInDate: String,
  checkOutDate: String,
  guests: Number
}

// 搜索相关类型
export const SearchResult = {
  id: String,
  title: String,
  type: String,
  description: String,
  image: String,
  price: Number,
  location: String,
  rating: Number
}

export const SearchStats = {
  totalResults: Number,
  searchTime: Number,
  lastSearchTime: String
}

// UI状态类型
export const UIState = {
  globalLoading: Boolean,
  loadingText: String,
  loadingMask: Boolean,
  globalError: Object,
  errorVisible: Boolean,
  errorTitle: String,
  errorMessage: String,
  errorActions: Array,
  successVisible: Boolean,
  successMessage: String,
  successDuration: Number,
  theme: String,
  primaryColor: String,
  fontSize: String,
  language: String
}

// 缓存配置类型
export const CacheConfig = {
  maxSize: Number,
  maxAge: Number,
  enableOffline: Boolean,
  enableCompression: Boolean
}

// 离线操作类型
export const OfflineAction = {
  id: String,
  type: String,
  data: Object,
  timestamp: Number,
  retryCount: Number
}

// 同步状态类型
export const SyncStatus = {
  isSyncing: Boolean,
  lastSyncTime: String,
  syncErrors: Array,
  pendingCount: Number
}

// 主题颜色类型
export const ThemeColors = {
  primary: String,
  background: String,
  surface: String,
  text: String,
  textSecondary: String,
  border: String,
  error: String,
  warning: String,
  success: String,
  info: String
}

// 弹窗动作类型
export const ModalAction = {
  text: String,
  style: String,
  handler: Function
}

// 网络状态类型
export const NetworkStatus = {
  isConnected: Boolean,
  networkType: String,
  signalStrength: Number
}

// 系统信息类型
export const SystemInfo = {
  platform: String,
  system: String,
  version: String,
  model: String,
  brand: String,
  pixelRatio: Number,
  screenWidth: Number,
  screenHeight: Number,
  statusBarHeight: Number,
  safeArea: Object,
  safeAreaInsets: Object
}

// 缓存信息类型
export const CacheInfo = {
  totalSize: Number,
  keyCount: Number,
  expiredCount: Number,
  offlineDataCount: Number,
  pendingSyncCount: Number
}

// 分页信息类型
export const Pagination = {
  currentPage: Number,
  pageSize: Number,
  total: Number,
  hasMore: Boolean
}

// API响应类型
export const ApiResponse = {
  code: Number,
  message: String,
  data: Object,
  success: Boolean,
  timestamp: Number
}

// 错误信息类型
export const ErrorInfo = {
  code: String,
  message: String,
  stack: String,
  timestamp: Number,
  context: Object
}

// 地理位置类型
export const Location = {
  latitude: Number,
  longitude: Number,
  address: String,
  city: String,
  province: String,
  country: String
}

// 图片信息类型
export const ImageInfo = {
  url: String,
  width: Number,
  height: Number,
  size: Number,
  format: String,
  thumbnail: String
}

// 时间范围类型
export const TimeRange = {
  start: String,
  end: String,
  duration: Number
}

// 价格信息类型
export const PriceInfo = {
  amount: Number,
  currency: String,
  originalAmount: Number,
  discount: Number,
  tax: Number,
  fees: Array
}

// 评价信息类型
export const Review = {
  id: String,
  userId: String,
  userName: String,
  userAvatar: String,
  rating: Number,
  content: String,
  images: Array,
  timestamp: Number,
  helpful: Number,
  response: Object
}

// 设施信息类型
export const Facility = {
  id: String,
  name: String,
  icon: String,
  category: String,
  description: String,
  isAvailable: Boolean
}

// 政策信息类型
export const Policy = {
  checkIn: String,
  checkOut: String,
  cancellation: String,
  smoking: String,
  pets: String,
  parties: String,
  ageRestriction: String
}

// 可用性信息类型
export const Availability = {
  date: String,
  isAvailable: Boolean,
  price: Number,
  minStay: Number,
  maxStay: Number
}

// 预订信息类型
export const Booking = {
  id: String,
  homestayId: String,
  userId: String,
  checkIn: String,
  checkOut: String,
  guests: Number,
  totalPrice: Number,
  status: String,
  paymentStatus: String,
  createdAt: String,
  updatedAt: String
}

// 消息类型
export const Message = {
  id: String,
  type: String,
  title: String,
  content: String,
  sender: String,
  receiver: String,
  timestamp: Number,
  isRead: Boolean,
  attachments: Array
}

// 通知类型
export const Notification = {
  id: String,
  type: String,
  title: String,
  content: String,
  data: Object,
  timestamp: Number,
  isRead: Boolean,
  priority: String
}

// 导出所有类型
export default {
  AppConfig,
  GlobalUI,
  UserInfo,
  Homestay,
  FilterConditions,
  SearchResult,
  SearchStats,
  UIState,
  CacheConfig,
  OfflineAction,
  SyncStatus,
  ThemeColors,
  ModalAction,
  NetworkStatus,
  SystemInfo,
  CacheInfo,
  Pagination,
  ApiResponse,
  ErrorInfo,
  Location,
  ImageInfo,
  TimeRange,
  PriceInfo,
  Review,
  Facility,
  Policy,
  Availability,
  Booking,
  Message,
  Notification
}
