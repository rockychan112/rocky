#CODING Sketch Library share with RSS
本项目主要用于将 CODING Sketch Library 通过 Sketch 的 RSS 方式分享给无 Abstract 编辑权限的同事使用。
CODING Sketch Library 文件和 Sketch RSS 所需的 XML 文件会存在本仓库中，并且使用 Abstract Webhook 与 CODING CI 来实现 Library 的自动更新。

## 如何使用 Library
点击或复制下方的 sketch://... 链接到浏览器地址栏中打开，即可自动调用 Sketch 并添加相应的 Library。

### 1. CODING Icons Library
![avatar](Coding-Icons-Library-Avatar.png)

[sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Fcoding-icons-rss.xml](sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Fcoding-icons-rss.xml)

<br>

### 2. CODING Web UIKit Library
![avatar](Coding-Web-UIKit-Library-Avatar.png)

[sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Fcoding-web-uikit-rss.xml](sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Fcoding-web-uikit-rss.xml)

<br>

### 3. CODING OA Web UIKit Library
[sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Foa-coding-web-uikit-rss.xml](sketch://add-library?url=https%3A%2F%2Fcodingcorp.coding.net%2Fp%2FDesign-Center%2Fd%2Fcoding-sketch-library-share%2Fgit%2Fraw%2Fmaster%2Foa-coding-web-uikit-rss.xml)

等 Library 下载完后，在 Sketch 文件中**按字母 C 键**打开插入 Symbol 的面板，里面就可以看到刚添加的 Library。

Library 有更新的时候 Sketch 右上角的小铃铛会出现 Library 升级提示，点击跳到 Library 设置面板后下载更新。

## 项目原理
本项目除了 Abstract 和 Sketch 外还用到了 CODING Repo（分享），CODING CI（更新） 和 pipedream.com（触发）。

### 1. Library 托管和分享
Sketch 提供了一种 RSS 的 Library 分享方式，通过 xml 文件来引导 Sketch 安装和更新 Library。文档参见 https://www.sketch.com/docs/designing/libraries/sharing-a-library/
CODING 代码仓库的开源功能正好可以满足 Sketch RSS 的要求，并且在国内下载文件速度较快，是用于 Library 文件托管的不二之选（也试过用制品库托管，但制品库的文件链接 Sketch 不识别）。

在本项目的代码仓库中可以看到 xxx-rss.xml、xxx.sketch、xxx-Avatar.png 的文件，这些就是与 Library 托管和分享相关的文件。xml 中会引用到 .sketch 和 Avatar.png 的链接，要新增或修改 Library 文件信息的时候可参考现有的 xml 来修改。

### 2. 自动更新 Library 文件
解决了 Library 托管和分享问题就要思考如何让 Library 文件一直与 Abstract 中最新的 Library 保持一致，并且最好可以自动的完成同步过程，避免手动操作。

Abstract 支持 webhook 功能，我们一直在用 pipedream.com 来监听 Abstract 最新的 commit 事件。在监听到 Abstract 中 Design System 项目有更新的时候就可以给某个接口发请求，触发一个自动下载和更新代码仓库的流程。

既然文件都托管在 CODING 仓库里，那用 CODING CI 来实现自动更新肯定是最合适的方案。CODING Design Center 项目中的 Sketch-Library-Sync CI 就是用来执行 Library 文件自动更新的任务。在 pipedream 监听到 Abstract Design System 项目的 master 分支有更新时，通过 API 触发的方式通知 CODING CI 来执行更新脚本。

Sketch-Library-Sync CI 会拉取本仓库代码，执行代码中 script.js 脚本，脚本会读取 libraries-data.json 中的最新 sha 和 library 文件 id。如果脚本发现 json 中记录的 library 文件有更新的话就会使用 Abstract SDK 下载最新的 library 文件，同时更新 library 的 xml 文件和 json 中的版本号。然后 CI 会将最新的文件推送到本仓库，为了避免仓库提及过大影响后续拉取速度，每次推送之前都会删掉历史 git 记录。

## 添加或移除 Library 文件
添加或移除 Library 文件的时候只需要修改本仓库中的文件即可，pipedream 没涉及到 library 文件匹配逻辑，所以不用修改。

1. 添加或删除 xxx-rss.xml，xxx.sketch，xxx-Avatar.pn 文件
2. 在 libraries-data.json 中添加或删除 library 信息


-------

本项目主要维护者 @tankxu