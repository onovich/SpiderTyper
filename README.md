# SpiderTyper
A Vite + React reconstruction of the original SpiderTyper prototype, preserving the canvas-driven typing hunt loop while preparing the project for future Unity migration.<br/>**这是对原始 SpiderTyper 原型的 Vite + React 重构版本，在保留画布驱动打字狩猎循环的同时，为未来迁移到 Unity 做好了工程准备。**
## Overview
- SpiderTyper is a minimalist typing-action game where the player resolves letter ambiguity across a physical spider web and sends the spider along the uniquely identified path to catch prey.<br/>**SpiderTyper 是一款极简打字动作游戏，玩家需要在具有物理弹性的蜘蛛网上消除字母歧义，并让蜘蛛沿唯一确定的路径捕获猎物。**
- The original single-file prototype is preserved in [origin/index.html](origin/index.html), while the runnable app now lives in a layered Vite project.<br/>**原始单文件原型保留在 [origin/index.html](origin/index.html) 中，而当前可运行版本已经迁移到分层的 Vite 工程。**
## Architecture
- `src/data/` stores gameplay constants and keyboard layout data so configuration remains portable across rendering targets.<br/>**`src/data/` 保存玩法常量和键盘布局数据，使配置可以更容易迁移到不同渲染目标。**
- `src/logic/engine/` contains the Verlet web simulation, graph matching, shortest-path selection, and canvas rendering orchestration.<br/>**`src/logic/engine/` 包含韦尔莱蜘蛛网模拟、图匹配、最短路径选择以及画布渲染调度。**
- `src/logic/hooks/` bridges browser input, resize observation, and React lifecycle into the engine without embedding game rules into the view layer.<br/>**`src/logic/hooks/` 负责把浏览器输入、尺寸监听和 React 生命周期桥接到引擎中，而不是把游戏规则塞进视图层。**
- `src/view/screens/` and `src/view/components/` keep the HUD and typewriter keyboard as focused UI pieces around the canvas scene.<br/>**`src/view/screens/` 和 `src/view/components/` 将 HUD 与打字机键盘保持为围绕画布场景的纯 UI 组件。**
- The current state is an architecture-ready refactor rather than a full feature expansion; it keeps the existing gameplay loop and establishes a clean migration boundary for Unity-oriented engine reuse.<br/>**当前状态属于“架构准备完成”而不是“玩法全面扩展完成”；它保留了现有核心循环，并为面向 Unity 的引擎复用建立了清晰边界。**
## Scripts
- Install dependencies with `npm install`.<br/>**使用 `npm install` 安装依赖。**
- Start the local development server with `npm run dev`.<br/>**使用 `npm run dev` 启动本地开发服务器。**
- Verify the production bundle with `npm run build`.<br/>**使用 `npm run build` 验证生产构建。**
- Preview the built output locally with `npm run preview`.<br/>**使用 `npm run preview` 本地预览构建产物。**
## Deployment
- GitHub Pages deployment is configured through [.github/workflows/deploy.yml](.github/workflows/deploy.yml) and expects the repository name to remain `SpiderTyper` so the Vite base path stays aligned.<br/>**GitHub Pages 部署已通过 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 配置完成，并要求仓库名保持为 `SpiderTyper`，以确保 Vite 的 base 路径一致。**
- After pushing to GitHub, switch the repository Pages source to GitHub Actions in the repository settings.<br/>**推送到 GitHub 后，请在仓库设置中将 Pages Source 切换为 GitHub Actions。**
## Notes
- The remote repository URL and final online preview are intentionally pending because no GitHub remote has been provided yet.<br/>**由于当前尚未提供 GitHub 远端地址，因此远端仓库连接和最终线上预览仍处于待完成状态。**
