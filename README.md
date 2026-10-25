# LayoutSee 官网

[LayoutSee](https://github.com/IQQcode/LayoutSee) 的官方网站：一个纯静态、零依赖的双页站点
## 页面

| 页面 | 文件 | 内容 |
| --- | --- | --- |
| 首页 | `index.html` | Hero 字母网格背景与幕布交互、双卡片、快速上手、能力总览（感知 / 定位 / 触摸 / 诊断）、工作台截图、MCP 工具、更新日志、开源共建 |
| 下载页 | `download.html` | 打字机轮播 Hero、双架构 DMG 下载按钮（直连 GitHub Releases）、五个特性区块、安装三步、系统要求、从源码运行 |

## 交互与动效

- **幕布交互**（首页 Hero）：黑色圆随鼠标缓动跟随，圆内标题反白；鼠标移到底部或离开 Hero 时收成底部半圆，露出「向下探索」入口。
- **打字机轮播**（下载页 Hero）：感知 / 定位 / 触摸 / 验证 四词循环，英文小标同步。
- 滚动显现（IntersectionObserver）、编号行 hover 箭头位移、吸顶导航阴影、字母 / 字符纹理呼吸与视差。
- 全部动效在 `prefers-reduced-motion` 或触屏环境下自动降级。
- 版本号与 DMG 链接加载后从 GitHub API 同步最新 Release，失败时回退页面内硬编码版本。

## 本地预览

无需安装任何依赖，任意静态服务器指向仓库根目录即可：

```bash
python3 -m http.server 8742
# 打开 http://127.0.0.1:8742
```

## 部署

静态站，零构建零配置，可直接部署到 Vercel / Cloudflare Pages / GitHub Pages 等任意静态托管（框架预设选 Other，根目录即仓库根目录）。

## 目录结构

```text
├── index.html          # 首页
├── download.html       # 下载页
├── css/style.css       # 设计系统与全部样式
├── js/main.js          # 幕布、打字机、滚动显现、版本同步
└── assets/
    ├── logo/           # favicon 全套与品牌标志
    └── screenshots/    # 界面精修图（webp）
```

> App 界面截图（特性区块大图）托管在阿里云 OSS CDN，清单见 `图片远程资源链接.md`；产品本体与源码见主仓库 [IQQcode/LayoutSee](https://github.com/IQQcode/LayoutSee)。

## License

[MIT](./LICENSE)
