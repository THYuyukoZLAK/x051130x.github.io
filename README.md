# uuz's Aerohakugyokurou

## 本地构建（Windows）

使用 Ruby 3.3（与 GitHub Actions 一致）、RubyInstaller DevKit/MSYS2、Bundler 2.7.2
和 Node.js。Node.js 为 `jekyll-autoprefixer-v2` 提供 JavaScript 运行环境；本项目没有
`package.json`，不需要运行 `npm install`。

本机已验证：Ruby 3.3.12、Bundler 2.7.2、Node.js 26.13.1、Jekyll 3.10.0。
安装或更新 PATH 后，请重新打开终端。

首次安装项目依赖：

```powershell
cd D:\hachiroku\x051130x.github.io
gem install bundler -v 2.7.2 --no-document
bundle config set --local path vendor/bundle
bundle install
```

生成静态站点（输出至 `_site/`）：

```powershell
$env:JEKYLL_ENV = 'production'
bundle exec jekyll build
```

本地预览（支持文件变更后自动重建，按 Ctrl+C 停止）：

```powershell
$env:JEKYLL_ENV = 'development'
bundle exec jekyll serve --host 127.0.0.1
```

打开 <http://127.0.0.1:4000/>。Windows 文件监听使用轮询时可能出现安装 `wdm` 的
性能建议，不影响预览。`vendor/`、`.bundle/` 和 `_site/` 已被 Git 忽略。
重新搭建 Windows 环境时，请安装带 DevKit 的 RubyInstaller，并执行 `ridk install 1 3`
初始化 MSYS2 和编译工具。Windows 时区数据库由 Gemfile 中的 `tzinfo-data` 提供。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `index.html` | 首页，使用 Liquid 遍历 `site.posts` 生成文章列表 |
| `_posts/` | Markdown 文章；文件顶部的 front matter 指定标题、布局和封面 |
| `_layouts/default.html` | 全站 HTML 骨架、导航、页脚及公共脚本 |
| `_layouts/post.html` | 文章页面布局，继承 default，包含侧栏和目录 |
| `_includes/` | 时间显示、社交图标等可复用片段 |
| `css/main.scss` | 样式入口，构建为 `css/main.css` |
| `_sass/` | 自定义样式及 Bootstrap SCSS；`stylesvar.scss` 定义颜色、字体等变量 |
| `img/`、`font/` | 图片和本地 JetBrains Mono 字体 |
| `SCEX server.html` | SCEX 服务器介绍页，固定地址 `/scex/` |
| `docs/` | 独立 Docsify 文档入口和 Markdown 文档 |
| `_config.yml` | 站点名称、URL、包含/排除规则及默认文章目录配置 |
| `Gemfile`、`Gemfile.lock` | 实际使用的 Ruby 依赖和锁定版本；`Gemfile_b` 是未被默认构建使用的备用文件 |
| `.github/workflows/jekyll.yml` | main 分支推送后，使用 Ruby 3.3 构建并部署 GitHub Pages |
| `CNAME` | 自定义域名记录；当前 `_config.yml` 将其排除在生成结果之外 |
| `state.php` | 独立的 Minecraft Bedrock 状态查询脚本，不由 Jekyll 执行 |
| `visits.php` | 月访问量统计接口，供首页侧栏「月访问」调用；需 PHP 环境 |
| `_includes/identity.html` | 头像 + 三行署名的共享片段（Hero 与侧栏卡片共用） |
| `_sass/home-blocks.scss` | 首页区块样式：身份卡、数据卡、区块标题、项目格与装饰条 |
| `js/site-stats.js` | 侧栏数据卡的前端取数逻辑（GitHub 仓库数、月访问量） |

构建流程为 Markdown/Liquid → HTML，SCSS → CSS → Autoprefixer，结果写入 `_site/`。
页面中的 CDN 脚本、Google Fonts 和服务器状态 API 仍需要网络；Jekyll 预览不执行 PHP。

## 首页侧栏数据卡

侧栏卡片显示三项数据，取值方式各不相同：

| 指标 | 来源 | 说明 |
| --- | --- | --- |
| 文章 | `site.posts.size` | 构建时由 Liquid 写入，无需网络 |
| repo | GitHub API | 浏览器向 `api.github.com/users/<github_username>` 取 `public_repos`，账号见 `_config.yml` |
| 月访问 | `visits.php` | 自建计数接口，按「IP + UA」6 小时内去重，按月累计 |

`visits.php` 需部署到支持 PHP 的主机（与 `state.php` 相同）。它把计数写入同目录的
`data/visits.json`（首次访问自动创建，需该目录可写），返回
`{"code":200,"month":"2026-11","monthly":123,"total":456,"day":7}`。
若接口与站点不同源，请在 `_config.yml` 中改为完整地址：

```yaml
visits_api: "https://example.infinityfree.me/visits.php"
```

GitHub Pages 不执行 PHP，因此线上若未配置该接口，「月访问」保持 `—`（悬停有提示）。
调试计数可直接访问 `visits.php?peek=1`，只读不计数。该文件已加入 `_config.yml` 的
`exclude`，不会随静态站点发布源码，需手动上传到 PHP 主机。

时间卡片下方的一言取自 `https://v1.hitokoto.cn/`，前端缓存 10 分钟；接口不可用时显示内置句子。
首页导航栏为透明样式（Hero 图铺到导航栏下方），页面向下滚动后自动恢复为实色，其他页面不受影响。

## 幻想乡纪年

时间卡片中的「第 xxx 季 X与X与X之年」由 `_includes/time.html` 计算，不再写死：

| 要素 | 取值 | 周期 |
| --- | --- | --- |
| 第一位 | 日 / 月 / 星 | 3 年 |
| 第二位 | 春 / 夏 / 秋 / 冬 | 4 年 |
| 第三位 | 火 / 水 / 木 / 金 / 土 | 5 年 |

三者独立循环，最小公倍数 60 年为一轮。基准为 **2010 年 = 第 125 季 星与夏与土之年**，
记 `n = 年份 − 2010`，则季节号为 `125 + n`，三个下标分别为
`(n+2) mod 3`、`(n+1) mod 4`、`(n+4) mod 5`。
构建时用 `site.time` 由 Liquid 渲染静态文本（无 JS 也正确），
再由 `js/gensokyo-era.js` 按访客当前年份刷新，站点长期未重建也不会显示过期年份。

首页「项目」栏目的两张 16:9 图目前是占位图（`img/proj-placeholder-1.png`、
`img/proj-placeholder-2.png`），替换图片并修改 `index.html` 中两个链接的 `href` 即可。
头像占位图为 `img/avatar-placeholder.png`。

## Building

首页使用 `jekyll-paginate` 静态分页，`_config.yml` 中的 `paginate: 10` 控制每页数量。
后续页面位于 `/page/2/`、`/page/3/` 等地址，只在访问相应页时加载该页文章列表。
未设置 `banner` 的文章自动使用透明默认封面 `img/default-post-banner.png`。
桌面端侧栏在列表左侧；最宽断点（1400px 及以上）的封面列缩小为原来的 2/3。
首屏与文章区之间双向滚轮过渡的时长为 400ms，阈值与时长可在 `js/home-scroll.js` 顶部调整。

As of [protobuf/#11935](https://github.com/protocolbuffers/protobuf/issues/11935), you may need build google-protobuf with `-fno-lto`:

```
gem install google-protobuf --version <VERSION> --  --with-cflags="-fno-lto"
```

Which `<VERSION>` depends on `Gemfile.lock`.

And it is advised to use `bundler exec jekyll` instead of `jekyll`.
