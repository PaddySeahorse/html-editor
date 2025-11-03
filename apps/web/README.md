# Visual HTML Editor

一个现代、直观的可视化HTML编辑器，支持双向实时同步编辑。在画布上拖拽设计，或直接在代码中调整，变化实时呈现。

**在线体验**: [https://2e4b7e2c.html-editor-9a2.pages.dev](https://2e4b7e2c.html-editor-9a2.pages.dev)

![Editor Screenshot](https://storage-repository.pages.dev/IMG_7720.jpeg)

## ✨ 核心特性

- **🎨 可视化画布编辑**
  - 直观的拖放式界面构建
  - 实时组件选择与操作
  - 简洁的工具栏快速操作

- **💻 智能代码同步**
  - 集成 Monaco Editor (VS Code 核心)
  - 代码与画布双向实时同步
  - 语法高亮与自动格式化

- **📋 强大的内容导入**
  - **完美支持 Microsoft Word 粘贴** - 保持格式 fidelity
  - 从 Word 复制内容，一键粘贴保持样式结构

- **⚡ 现代技术栈**
  - 基于 React + TypeScript + Vite
  - 状态管理采用 Zustand
  - 模块化 monorepo 架构

## 📖 使用指南

### 基本编辑
1. 在左侧画布区域拖拽组件进行布局
2. 在右侧代码视图直接编辑 HTML
3. 所有更改在两个视图间实时同步

### Word 内容导入
1. 在 Microsoft Word 中复制内容 (Ctrl+C)
2. 在编辑器的画布或代码区域粘贴 (Ctrl+V)  
3. 格式、样式、列表等将自动保持

### 组件操作
- **添加**: 使用工具栏按钮插入新元素
- **移动**: 在画布中直接拖拽调整位置
- **编辑**: 点击元素进行内容修改

## 🗺 开发路线

### V1 (当前)
- [x] 基础编辑器框架
- [x] 画布-代码双向同步
- [x] Word 粘贴支持
- [x] 基础组件库

### V1.2 (进行中)
- [ ] 增强拖拽体验
- [ ] 丰富组件库
- [ ] 代码下载功能

### V2 (规划中)  
- [ ] 样式面板与属性编辑
- [ ] CSS/Script 代码区块
- [ ] 画布缩放与对齐工具 