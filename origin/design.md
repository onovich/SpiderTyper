🕸️ 项目交接文档 (Handover Document)
一、 项目英文名 (Project Name)
Web Weaver: Typist's Prey
(注：项目代号可简称为 Web Weaver 或 Spider Typer)

二、 需求设计文档 (Requirement & Design)
1. 核心玩法循环 (Core Loop)
生成 (Spawn)：系统随机在蜘蛛网的可用节点（非蜘蛛当前位置）生成猎物（飞虫）。

识别 (Identify)：玩家观察飞虫停留的节点及其悬挂字母。

消除歧义 (Disambiguation)：

玩家通过虚拟拟物键盘或实体键盘输入该字母。

若全网存在多个同名字母，则触发“歧义状态”（匹配节点高亮）。

玩家需顺着目标节点在网上的物理连线，继续输入相邻节点的字母，拼写出一条连续路径。

捕猎 (Hunt)：当输入的字符串在全网拓扑图中唯一确定一条起始路径时，目标锁定。蜘蛛自动寻路前往目标节点捕食。

重置 (Reset)：捕食成功获得积分（+100），或飞虫停留超时逃跑，随后进入下一个生成循环。

2. 体验目标 (Experience Goals)
心流与禅意 (Zen & Flow)：结合物理仿真的柔性视觉反馈与机械键盘的干脆敲击感，营造一种冷峻但专注的打字狩猎体验。

视觉风格：极简主义（Minimalist）、几何构成、略带复古拟物感（打字机键盘）。

三、 开发文档 (Development Guide)
1. 技术栈与架构 (Tech Stack & Architecture)
运行环境：纯前端 (Vanilla HTML5 / JS / CSS3)。

文件结构：单文件架构 (index.html)，零外部依赖（无图片、无第三方库），代码所见即所得。

渲染层：Canvas 2D API（主游戏区） + DOM/CSS3（虚拟键盘与UI）。

范式：单向数据流、显式代码执行 (Explicit Code Execution)。主循环清晰分为 updatePhysics(), updateLogic(), draw() 三个独立阶段。

2. 核心模块与算法 (Core Modules)
物理引擎 (Physics Engine)：

采用轻量级 Verlet Integration (韦尔莱积分)。

实体由 Point（质点）和 Stick（弹簧约束）构成，通过多次迭代求解约束，实现无须刚体引擎的绳索弹性与重力悬垂效果。高度确定性。

网格生成 (Web Generation)：

极坐标生成同心圆与放射线，注入随机噪波（Noise）打破绝对对称。

动态计算屏幕最短边限制最大半径，确保响应式完美圆形。

图匹配算法 (Graph Matching)：

深度优先搜索 (DFS)：findMatchingPaths 函数。将输入的字符串作为路径特征，在无向图中遍历所有可能的候选起点和连接线。

寻路算法 (Pathfinding)：

广度优先搜索 (BFS)：triggerSpiderAttack 函数。当目标唯一时，计算蜘蛛当前节点到目标节点的最短拓扑路径。

3. 移动端适配处理 (Mobile Optimization)
ResizeObserver：监听 DOM 布局稳定后的精确尺寸，重置 Canvas 的内部像素分辨率，搭配 devicePixelRatio 解决高分屏模糊及拉伸形变问题。

交互降级与穿透防范：虚拟键盘使用 touchstart 并 preventDefault()，彻底消除移动端 300ms 点击延迟；全屏禁用 user-select 与手势缩放。

四、 美术约束 (Art & Aesthetic Constraints)
1. 视觉规范
调色板 (Color Palette)：

深邃冷峻背景：#111115 到 #0a0a0d 的径向渐变。

高亮与交互反馈：预警态为琥珀色 rgba(255, 200, 50, 0.9)，锁定态为纯白辉光。

UI字体：强复古感的 Courier New，等宽字体强化代码/打字机隐喻。

渲染约束：

全几何绘制：游戏内所有实体（蜘蛛、飞虫、网）必须通过 Canvas arc, ellipse, quadraticCurveTo 纯代码实时绘制。

物理下垂拟合：网的连线必须使用贝塞尔曲线，其控制点需根据中点坐标附加一个向下的 y 轴偏移量（基于 textScale 自适应），以配合物理引擎在视觉上放大柔性和重力感。

五、 TODO / 后续演进方向
[ ] CRT/冷战复古视觉强化：考虑在 Canvas 上方覆盖一层 CSS 扫描线（Scanline）或使用 WebGL Shader 增加轻微的屏幕色散（Chromatic Aberration）与边缘暗角，强化 90s 工作站的美学（Vibe）。

[ ] 流体/风场干扰：可以引入一个极简的计算场（例如简化的 Navier-Stokes 甚至是单纯的 Sine Wave 风场），让悬挂的字母在待机时产生更自然、非同期的摇摆。

[ ] SDF 辉光优化：飞虫和锁定节点的发光目前依赖 Canvas原生 shadowBlur（性能开销较大），后续若迁移至 WebGL/Three.js，可使用 SDF（符号距离场）实现更硬核、性能更好的泛光效果。

[ ] 难度动态曲线：随分数增加，引入更密集的蜘蛛网（更多环/辐条）、缩短飞虫停留的 TTL (Time to Live)，或增加飞虫的随机移动逻辑。

[ ] 音效系统：接入 Web Audio API，添加机械打字机清脆的“咔哒”声，以及达成唯一匹配时的“叮”声反馈。

六、 项目启动方式 (How to Start)
本项目追求极简运行，没有任何复杂的构建管线（Webpack/Vite/Node.js）：

直接运行 (Local File)：

直接在任意现代浏览器（Chrome/Edge/Safari）中双击打开 index.html 即可运行。

本地服务器 (Localhost) - 推荐：

由于后续可能会扩展加载音效文件或分离拆分模块，建议通过本地 Server 运行以避免浏览器的跨域/CORS限制。

VS Code: 右键点击 index.html -> 选择 Open with Live Server。

Python: 在当前目录终端运行 python -m http.server 8000，浏览器访问 http://localhost:8000。