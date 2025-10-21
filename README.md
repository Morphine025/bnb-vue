# UniApp 民宿转让平台

## 项目简介

这是一个基于 UniApp + Vue3 开发的民宿转让微信小程序，支持多端运行（微信小程序、H5、App）。项目采用现代化的前端技术栈，提供完整的民宿信息展示、用户管理、社交互动等功能。

## 技术栈

- **前端框架**: Vue 3 + Composition API + `<script setup>`
- **UI组件库**: uview-plus (viewPlus)
- **开发语言**: JavaScript (ES6+)
- **状态管理**: Pinia (模块化Store)
- **路由管理**: 原生页面路由 (uniapp规范)
- **网络请求**: 统一API封装 + 错误处理
- **样式预处理**: SCSS
- **开发工具**: HBuilderX + 微信开发者工具
- **代码规范**: ESLint + Prettier

## 项目结构

```
uniapp-bnb-test/
├── api/                    # API接口模块
│   ├── core/              # 核心API类
│   │   ├── BaseAPI.js     # API基类
│   │   └── ErrorHandler.js # 错误处理
│   ├── modules/           # 业务API模块
│   │   ├── HomestayAPI.js # 民宿相关API
│   │   ├── UserAPI.js     # 用户相关API
│   │   ├── SearchAPI.js   # 搜索相关API
│   │   ├── RegionAPI.js   # 地区相关API
│   │   └── ChatAPI.js     # 聊天相关API
│   ├── config/            # API配置
│   ├── interceptors/      # 请求拦截器
│   └── index.js           # API统一入口
├── utils/                  # 工具函数目录
│   ├── apiUtils.js        # API相关工具函数
│   ├── cacheManager.js    # 缓存管理工具
│   ├── constants.js       # 常量定义
│   ├── dataValidator.js   # 数据验证工具
│   ├── debounce.js        # 防抖函数
│   ├── debugHelper.js     # 调试工具
│   ├── errorHandler.js    # 错误处理工具
│   ├── homestayStatus.js  # 民宿状态工具
│   ├── inputSanitizer.js  # 输入清理工具
│   ├── loadingManager.js  # 加载管理工具
│   ├── performanceMonitor.js # 性能监控工具
│   ├── priceFormatter.js  # 价格格式化工具
│   ├── shareUtils.js      # 分享工具
│   └── userInfo.js        # 用户信息工具
├── stores/                # Pinia状态管理
│   ├── modules/           # 模块化Store
│   │   ├── homestay/     # 民宿相关状态
│   │   ├── user/         # 用户相关状态
│   │   ├── search/       # 搜索相关状态
│   │   └── ui.js         # UI状态
│   └── index.js          # Store入口
├── pages/                 # 页面目录
│   ├── index/            # 首页（瀑布流展示）
│   ├── detail/           # 详情页
│   ├── my/               # 我的页面
│   ├── profile/          # 个人信息编辑
│   ├── publish/          # 发布页面
│   ├── follow/           # 关注页面
│   ├── follow-list/      # 关注列表
│   ├── fans-list/        # 粉丝列表
│   ├── collect/          # 收藏列表
│   ├── like/             # 喜欢列表
│   ├── history/          # 浏览历史
│   ├── search/           # 搜索页面
│   ├── chat/             # 聊天页面
│   └── user-profile/     # 用户资料页
├── utils/                 # 工具函数目录
│   ├── security/         # 安全相关工具
│   │   ├── inputSanitizer.js # 输入清理工具
│   │   └── dataValidator.js  # 数据验证工具
│   ├── performance/      # 性能相关工具
│   │   ├── performanceMonitor.js # 性能监控工具
│   │   └── debounce.js  # 防抖节流工具
│   ├── api/             # API相关工具
│   │   ├── apiUtils.js  # API工具函数
│   │   └── errorHandler.js # 统一错误处理
│   ├── cache/           # 缓存相关工具
│   │   └── cacheManager.js # 缓存管理器
│   ├── ui/              # UI相关工具
│   │   ├── loadingManager.js # Loading状态管理
│   │   └── shareUtils.js # 分享工具
│   ├── business/        # 业务相关工具
│   │   ├── homestayStatus.js # 民宿状态管理
│   │   ├── priceFormatter.js # 价格格式化工具
│   │   └── userInfo.js  # 用户信息管理
│   ├── debug/           # 调试相关工具
│   │   └── debugHelper.js # 调试辅助工具
│   ├── constants/       # 常量定义
│   │   └── constants.js # 应用常量定义
│   ├── index.js         # 统一入口文件
│   └── README.md        # 工具函数文档
├── static/               # 静态资源
├── uni_modules/          # uni-app模块
├── App.vue               # 应用根组件
├── main.js               # 应用入口
├── manifest.json         # 应用配置
├── pages.json            # 页面配置
└── package.json          # 依赖配置
```

## 功能特性

### 🎯 核心功能
- ✅ **首页展示**: 轮播图 + 瀑布流民宿列表 + 地区筛选
- ✅ **民宿详情**: 图片预览 + 基本信息 + 用户互动
- ✅ **用户系统**: 微信登录 + 个人信息管理 + 头像昵称设置
- ✅ **社交功能**: 关注/粉丝 + 收藏/点赞 + 浏览历史
- ✅ **内容发布**: 民宿信息发布 + 图片上传 + 草稿保存
- ✅ **搜索功能**: 关键词搜索 + 搜索历史 + 热门搜索
- ✅ **聊天系统**: 实时聊天 + 消息管理 + 用户联系

### 🔧 技术特性
- ✅ **响应式设计**: 支持双列瀑布流/单列列表切换
- ✅ **性能优化**: 图片懒加载 + 无限滚动 + 防抖处理 + 虚拟滚动
- ✅ **状态管理**: 模块化Pinia Store + 数据持久化 + 分层缓存
- ✅ **错误处理**: 统一错误处理 + 用户友好提示
- ✅ **API封装**: 统一接口管理 + 请求拦截 + 响应处理
- ✅ **缓存策略**: 分层缓存 + 智能缓存清理 + 离线数据同步

### 📱 用户体验
- ✅ **交互体验**: 流畅动画 + 加载状态 + 空状态处理
- ✅ **视觉设计**: 现代化UI + 渐变背景 + 卡片式布局
- ✅ **操作便捷**: 一键关注 + 快速收藏 + 智能搜索

### 🚧 待优化功能
- ⏳ 消息列表页面完善
- ⏳ 订单管理系统
- ⏳ 数据统计面板
- ⏳ 推送通知功能

## 开发规范

### 📝 代码规范
- **Vue 3**: 使用 Composition API + `<script setup>` 语法
- **命名规范**: camelCase (变量/函数) + PascalCase (组件) + kebab-case (选择器)
- **代码风格**: ESLint + Prettier 自动格式化
- **注释规范**: JSDoc 完整注释 + 功能说明

### 🔌 API规范
- **接口设计**: 统一BaseAPI基类 + 模块化API管理
- **错误处理**: 全局错误处理 + 用户友好提示
- **数据格式**: 统一响应格式 + 类型安全
- **缓存策略**: 分层缓存 + 智能缓存清理 + 离线数据同步

### 🧩 组件规范
- **组件设计**: 单一职责 + 可复用性
- **样式管理**: scoped样式 + CSS变量
- **状态管理**: Pinia模块化Store
- **性能优化**: 计算属性缓存 + 防抖处理

### 📁 项目规范
- **文件组织**: 按功能模块分目录
- **命名一致**: 描述性命名 + 统一约定
- **依赖管理**: 集中管理 + 版本控制
- **Git规范**: 语义化提交 + 分支管理

## 技术架构

### 🏗️ 架构设计
- **分层架构**: 页面层 → 组件层 → 服务层 → 数据层
- **模块化设计**: 按业务功能模块化组织代码
- **状态管理**: Pinia模块化Store，支持数据持久化
- **API设计**: 统一BaseAPI基类，支持拦截器和错误处理

### 🔧 核心模块
- **API模块**: 统一接口管理，支持缓存和离线数据
- **Store模块**: 模块化状态管理，分层缓存策略
- **Utils模块**: 工具函数集合，性能优化工具
- **Components**: 可复用组件库

### 📊 性能优化
- **图片优化**: 懒加载 + 压缩 + 错误处理
- **数据缓存**: 分层缓存策略 + 智能缓存清理 + 离线数据同步
- **请求优化**: 防抖 + 节流 + 去重 + 分页加载
- **渲染优化**: 计算属性缓存 + 虚拟滚动 + 性能监控

## 开发指南

### 🛠️ 环境要求
- **Node.js**: 16.0+ (推荐使用 LTS 版本)
- **HBuilderX**: 3.8.0+ (推荐使用最新版本)
- **微信开发者工具**: 最新稳定版
- **数据库**: MySQL 5.7+ (ruoyi数据库)

### 📦 安装依赖
```bash
# 安装项目依赖
npm install

# 或使用 yarn
yarn install
```

### 🚀 开发运行
```bash
# 1. 使用HBuilderX打开项目
# 2. 选择运行到微信小程序
# 3. 在微信开发者工具中预览

# 或者使用命令行
npm run dev:mp-weixin
```

### 📱 构建发布
```bash
# 构建微信小程序
npm run build:mp-weixin

# 构建H5版本
npm run build:h5

# 构建App版本
npm run build:app
```

### 🔧 开发工具
- **代码编辑器**: HBuilderX (推荐) / VS Code
- **调试工具**: 微信开发者工具 + 浏览器开发者工具
- **版本控制**: Git + GitHub/GitLab
- **API测试**: Postman / Apifox

## 📚 文档资源

### 📖 API文档
- **接口文档**: [api/README.md](api/README.md)
- **缓存策略**: 分层缓存 + 智能缓存清理
- **错误处理**: 统一错误处理机制

### 🧩 组件文档
- **工具函数**: [utils/README.md](utils/README.md)
- **状态管理**: [stores/README.md](stores/README.md)
- **使用示例**: 详细的组件使用说明

### 📋 开发规范
项目遵循严格的开发规范，详细内容请查看规则文件：
- **API规范**: 统一接口设计 + 错误处理
- **Vue规范**: 组件开发 + 代码风格
- **开发流程**: Git工作流 + 代码审查
- **项目规范**: 文件组织 + 命名约定

## 🤝 贡献指南

### 开发流程
1. **Fork项目** → 创建个人仓库
2. **创建分支** → `git checkout -b feature/新功能`
3. **提交代码** → `git commit -m "feat: 添加新功能"`
4. **推送分支** → `git push origin feature/新功能`
5. **发起PR** → 创建Pull Request

### 代码规范
- 遵循项目代码风格
- 添加必要的注释和文档
- 确保代码通过所有测试
- 提交信息要清晰明确

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议

## 📞 联系方式

- **项目维护者**: [项目维护者]
- **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- **技术交流**: [技术交流群]

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**

</div>
