# 拖拽功能使用指南 (Drag & Drop Feature Guide)

## 功能概述 (Feature Overview)

这个HTML编辑器现在支持完整的拖拽功能，包括：

- ✅ 5px防误触阈值
- ✅ 专用拖拽把手（drag handle）
- ✅ 视觉反馈（半透明效果和幽灵预览）
- ✅ 放置位置提示
- ✅ 撤销/重做支持
- ✅ AST同步

## 使用步骤 (How to Use)

### 1. 启动编辑器 (Start the Editor)

```bash
cd demo
npm install
npm run dev
```

然后在浏览器打开 http://localhost:3000

### 2. 识别拖拽把手 (Identify the Drag Handle)

每个HTML元素都有一个**蓝色的小方块**在左上角，这就是拖拽把手。

样式：

- **颜色**: 蓝色 (#007acc)
- **大小**: 16px × 16px
- **位置**: 左上角（距离顶部和左边各 2px）
- **图标**: 竖点图标 (⋮)

### 3. 执行拖拽操作 (Perform Drag Operation)

#### 步骤 A: 查看初始状态

- 打开编辑器，左边显示HTML代码，右边显示可视化画布
- 在画布中可以看到各个元素及其蓝色的拖拽把手

#### 步骤 B: 移动鼠标到拖拽把手

- 将鼠标指针移到任何元素的蓝色把手上
- 鼠标光标应该变成 "抓手" 形状 (grab cursor)

#### 步骤 C: 按下并拖拽

1. 按住鼠标左键
2. **移动至少 5px** 以激活拖拽模式（这是防误触机制）
3. 当移动超过 5px 时：
   - 被拖拽的元素变为 **半透明**（opacity: 0.5）
   - 光标变为 "抓住" 形状 (grabbing cursor)
   - 元素跟随光标移动

#### 步骤 D: 放置元素

1. 将元素拖动到目标位置
2. 系统会自动检测最近的元素作为放置目标
3. **松开鼠标**完成拖拽

### 4. 观察视觉反馈 (Observe Visual Feedback)

#### 拖拽中：

```
原始元素外观：
┌─────────────────┐
│■ Hello World    │  (■ = 蓝色把手)
└─────────────────┘

拖拽中的外观：
┌─────────────────┐
│■ Hello World    │  (半透明，opacity: 0.5)
│ (跟随光标移动)  │
└─────────────────┘
```

#### 拖拽完成后：

- 元素在新位置变为正常不透明度
- 左边的代码编辑器**自动更新**，反映新的HTML结构
- 元素在新位置有短暂的强调（可选的背景高亮）

### 5. 撤销/重做操作 (Undo/Redo)

每次拖拽操作都被记录为**一个撤销步骤**：

```
按住 Ctrl/Cmd + Z: 撤销（元素返回原处）
按住 Ctrl/Cmd + Shift + Z: 重做（重新应用拖拽）
```

## 实际例子 (Practical Examples)

### 例子 1: 重新排序列表项 (Reorder List Items)

```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

**操作：**

1. 在 "Item 3" 的把手上按下鼠标
2. 向上拖拽超过 5px
3. 拖拽到 "Item 1" 上方
4. 松开鼠标

**结果：** Item 3 现在排在最前面，代码自动更新

### 例子 2: 移动元素到其他容器 (Move Element to Another Container)

```html
<div id="source">
  <p>Move me!</p>
</div>

<div id="target">
  <!-- 放在这里 -->
</div>
```

**操作：**

1. 拖拽 `<p>` 的把手
2. 拖拽到 `#target` 容器内
3. 松开鼠标

**结果：** `<p>` 被移到 `#target` 中，HTML代码同步更新

### 例子 3: 撤销错误操作 (Undo Mistakes)

1. 执行任何拖拽操作
2. 按 Ctrl/Cmd + Z 撤销
3. 元素返回原位置，代码恢复

## 技术细节 (Technical Details)

### 阈值机制 (Threshold Mechanism)

- **5px阈值**: 防止在点击时意外触发拖拽
- 只有当鼠标移动距离 ≥ 5px 时，才激活拖拽模式
- 在此之前，可以像正常点击一样进行选择

### 放置位置检测 (Drop Position Detection)

系统通过以下方式确定放置位置：

1. 找到距离光标最近的元素
2. 比较光标与该元素的垂直中点位置
3. 如果光标在中点上方 → 放在该元素前
4. 如果光标在中点下方 → 放在该元素后

### AST 同步 (AST Synchronization)

拖拽操作通过以下步骤保持代码同步：

1. 从AST中移除被拖拽的节点
2. 在新位置重新插入节点
3. 自动序列化为HTML代码
4. 更新代码编辑器视图

## 故障排除 (Troubleshooting)

### 问题 1: 看不到蓝色把手

**解决方案：**

- 确保您正在查看画布右侧的可视化区域
- 把手只在元素上方悬停时显示（如果需要）
- 如果仍然看不到，检查CSS是否被正确加载

### 问题 2: 拖拽无法工作

**解决方案：**

- 确保您移动了**至少 5px**，否则不会触发拖拽模式
- 检查您是否按住了鼠标左键
- 尝试刷新页面重新加载

### 问题 3: 代码未更新

**解决方案：**

- 完全释放鼠标按钮以完成拖拽
- 检查浏览器控制台是否有错误
- 确保启用了JavaScript

### 问题 4: 无法撤销

**解决方案：**

- 确保没有其他地方拦截了Ctrl/Cmd+Z快捷键
- 在编辑器区域按下快捷键，不是在浏览器其他地方
- 检查是否已执行至少一个拖拽操作

## 高级功能 (Advanced Features)

### 链式拖拽 (Chained Drags)

您可以快速执行多个拖拽操作：

```
1. 拖拽元素A → 完成
2. 拖拽元素B → 完成
3. 拖拽元素C → 完成
4. 按 Ctrl+Z 三次 → 所有操作撤销
```

### 跨容器拖拽 (Cross-Container Dragging)

您可以将元素从一个容器拖到另一个容器：

- 嵌套的 `<div>` 之间
- `<ul>` 和其他列表容器之间
- 任何支持子元素的标签

## 性能考虑 (Performance)

- 拖拽操作对大型文档（100+ 节点）也很快响应
- 历史记录每次拖拽保存一个完整的AST快照
- 建议：如果执行大量拖拽，定期撤销以清理历史

## API 使用（开发者） (API Usage for Developers)

### 在React组件中使用

```typescript
import { useEditorStore } from '@html-editor/editor-ui';

function MyComponent() {
  const { isDragging, draggedNodeId, moveNode, undo, redo } = useEditorStore();

  // 检查当前是否正在拖拽
  if (isDragging) {
    console.log('Currently dragging node:', draggedNodeId);
  }

  // 以编程方式移动节点
  const handleMove = () => {
    moveNode('node-123', 'parent-node-id', 0);
  };

  // 撤销/重做
  const handleUndo = () => {
    undo();
  };

  return (
    <button onClick={handleMove}>Move Node</button>
  );
}
```

### 移动节点 (moveNode 函数)

```typescript
moveNode(
  nodeId: string,           // 要移动的节点ID
  parentId: string | null,  // 新父节点ID，null表示根节点
  index: number             // 在父节点中的位置（0-based）
)
```

## 总结 (Summary)

| 功能      | 状态 | 说明                 |
| --------- | ---- | -------------------- |
| 防误触    | ✅   | 5px阈值防止意外触发  |
| 拖拽把手  | ✅   | 蓝色把手在元素左上角 |
| 视觉反馈  | ✅   | 半透明效果+光标变化  |
| 放置提示  | ✅   | 自动检测目标位置     |
| AST同步   | ✅   | 代码自动更新         |
| 撤销/重做 | ✅   | 一次操作=一步撤销    |

现在您已准备好使用拖拽功能！祝您使用愉快！🎉
