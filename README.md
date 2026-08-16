<h1 align="center">🎉 游戏王卡片 - YuGiOh-Card 🎉</h1>

<div align="center">
  <p>简体中文 | <a href="./README.en.md">English</a></p>
</div>

<p align="center">
  <a href="https://www.npmjs.org/package/yugioh-card">
    <img src="https://img.shields.io/npm/v/yugioh-card.svg">
  </a>
  <a href="https://www.npmjs.org/package/yugioh-card">
    <img src="https://img.shields.io/npm/dt/yugioh-card.svg">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>

<p align="center">基于 Canvas 的游戏王可视化制卡器，支持 OCG 卡库检索、随机生成、高清卡图与桌面 EXE 打包</p>

<p align="center">
  <img src="src/assets/image/banner.jpg">
</p>

## ✨ 特色功能

| 功能                | 说明                                                        |
| ------------------- | ----------------------------------------------------------- |
| 🔍 **OCG 卡库检索** | 按卡密/卡名搜索，自动填充全部字段                           |
| 🎲 **随机一卡**     | 全卡库随机抽取真实卡片                                      |
| 🌐 **多译名**       | YGOPro / 简中官方 / Master Duel / NWBBS / CNOCG             |
| 🖼️ **高清卡图**     | 1200×1200 WebP 艺术插画                                     |
| 🎨 **完整自定义**   | 颜色/渐变/字体、类型/属性/星级/攻防、连接箭头、防伪标、罕贵 |
| 📦 **一键导出**     | JSON 导入/导出、高清 PNG（最高 5x）                         |
| 🖥️ **桌面应用**     | Windows EXE，独立运行                                       |

> **卡片数据来源**
>
> | 数据 | 来源 |
> | ---- | ---- |
> | 卡片信息与译名（中文 / 日文 / 韩文） | [ygocdb.com](https://ygocdb.com/) |
> | 英文卡名 / 描述 / 种族 | [ygoprodeck.com](https://ygoprodeck.com/) |
> | 卡图（1200×1200 WebP 高清插画，全语言） | [ygotoken.com](http://www.ygotoken.com/) |

目前有 5 种卡片：

- 1️⃣ 游戏王
- 2️⃣ 超速决斗
- 3️⃣ 游戏王卡背
- 4️⃣ 场地中心卡
- 5️⃣ 游戏王 2 期

## 🫡 特别感谢

- [LeaferJS](https://www.leaferjs.com/) 提供的强大图形渲染功能
- [白羽幸鳥](https://tieba.baidu.com/home/main?id=tb.1.d6c63ffd.3YV5T6Q9Z7uIeVVhPlo8hg%3Ft%3D1654573649) 提供的高清卡模
- [kooriookami/yugioh-card](https://github.com/kooriookami/yugioh-card) 本项目基于该项目二创

## 🚩 在线演示

[在线演示](https://iloveaimer.github.io/YuGiOh-Card/)

## ⚡ 快速开始

开发环境要求：Node.js 22+，pnpm。

`pnpm add yugioh-card`

### 仓库开发

```bash
pnpm install
pnpm dev            # Web 开发
pnpm dev:electron   # Electron 桌面应用
pnpm build:exe      # 打包 Windows EXE → release/
```

### 浏览器

```js
import { YugiohCard } from 'yugioh-card';

const card = new YugiohCard({
  view: 'xxx', // div 容器
  data: {
    /* 参数见 Data 属性 */
  },
  resourcePath: 'xxx', // 静态资源路径，复制 src/assets/yugioh-card 到项目或服务器
});
// 导出：card.leafer.export('xxx.png', { screenshot: true, pixelRatio: devicePixelRatio, scale: 3 });
```

````

### Node.js

运行 Node.js 示例前，请先确保本地 Node.js 版本为 22 或更高。

`pnpm add skia-canvas@2`

```js
import http from 'http';
import path from 'path';
import skia from 'skia-canvas';
import { YugiohCard } from 'yugioh-card';

http.createServer((req, res) => {
  const card = new YugiohCard({
    data: { /* 参数见下方 Data 属性 */ },
    resourcePath: path.resolve('./src/assets/yugioh-card'),
    skia: skia,
  });
  card.leafer.export('png', { screenshot: true }).then(result => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<img src="${result.data}" />`);
    res.end();
  });
}).listen(3000, () => {
  console.log('server is running at http://localhost:3000');
});
````

## 🔎 示例代码

[示例代码](src/components/YugiohCard.vue)

## 📖 Data 属性

### 游戏王

|       属性名        |       说明       |  类型   |                                                                可选值                                                                 |                                    备注                                    |      默认值       |
| :-----------------: | :--------------: | :-----: | :-----------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------: | :---------------: |
|      language       |       语言       |  enum   |                                              'sc' / 'tc' / 'jp' / 'kr' / 'en' / 'astral'                                              |            简体中文 / 繁体中文 / 日文 / 韩文 / 英文 / 星光界文             |       'sc'        |
|        font         |       字体       |  enum   |                             '' / 'xlsj' / 'xlsf' / 'hklsw7' / 'hklsw5' / 'kt' / 'custom1' / 'custom2'                             | 华康楷体A Std W5 / 经典细隶书简 / 经典细隶书繁 / 华康隶书体W7 / 华康隶书体W5 / 楷体 / 华康隶书体 / 文鼎中粗隶简繁 |        ''         |
|        name         |       卡名       | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|        color        |     卡名颜色     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|        align        |     卡名对齐     |  enum   |                                                      'left' / 'center' / 'right'                                                      |                           左对齐 / 居中 / 右对齐                           |      'left'       |
|      gradient       |  卡名是否渐变色  | boolean |                                                                   —                                                                   |                                     —                                      |       false       |
|   gradientColor1    |     渐变色 1     | string  |                                                                   —                                                                   |                                     —                                      |     '#999999'     |
|   gradientColor2    |     渐变色 2     | string  |                                                                   —                                                                   |                                     —                                      |     '#ffffff'     |
|        type         |       类型       |  enum   |                                               'monster' / 'spell' / 'trap' / 'pendulum'                                               |                         怪兽 / 魔法 / 陷阱 / 灵摆                          |     'monster'     |
|      attribute      |       属性       |  enum   |                                'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / ''                                 |                   暗 / 光 / 地 / 水 / 炎 / 风 / 神 / 无                    |      'dark'       |
|        icon         |     魔陷图标     |  enum   |                                'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter'                                 |                  装备 / 场地 / 速攻 / 仪式 / 永续 / 反击                   |        ''         |
|        image        |     中间卡图     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|      cardType       |     卡片类型     |  enum   |                           'normal' / 'effect' / 'ritual' / 'fusion' / 'synchro' / 'xyz' / 'link' / 'token'                            |          通常 / 效果 / 仪式 / 融合 / 同调 / 超量 / 连接 / 衍生物           |     'normal'      |
|    pendulumType     |     灵摆类型     |  enum   | 'normal-pendulum' / 'effect-pendulum' / 'ritual-pendulum' / 'fusion-pendulum' / 'synchro-pendulum' / 'xyz-pendulum' / 'link-pendulum' | 通常灵摆 / 效果灵摆 / 仪式灵摆 / 融合灵摆 / 同调灵摆 / 超量灵摆 / 连接灵摆 | 'normal-pendulum' |
|        level        |       星级       | number  |                                                                   —                                                                   |                                     —                                      |         0         |
|        rank         |       阶级       | number  |                                                                   —                                                                   |                                     —                                      |         0         |
|    pendulumScale    |     灵摆刻度     | number  |                                                                   —                                                                   |                                     —                                      |         0         |
| pendulumDescription |     灵摆效果     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|     monsterType     |     怪兽类型     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|       atkBar        |      攻守条      | boolean |                                                                   —                                                                   |                                     —                                      |       true        |
|         atk         |      攻击力      | number  |                                                                   —                                                                   |                                ?：-1，∞：-2                                |         0         |
|         def         |      防御力      | number  |                                                                   —                                                                   |                                ?：-1，∞：-2                                |         0         |
|      arrowList      |     连接箭头     |  array  |                                                       [1, 2, 3, 4, 5, 6, 7, 8]                                                        |                  [上, 右上, 右, 右下, 下, 左下, 左, 左上]                  |        []         |
|     description     |     效果描述     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|  firstLineCompress  |   是否首行压缩   | boolean |                                                                   —                                                                   |                                     —                                      |       false       |
|  descriptionAlign   | 是否效果描述居中 | boolean |                                                                   —                                                                   |                                     —                                      |       false       |
|   descriptionZoom   |   效果描述缩放   | number  |                                                                   —                                                                   |                                     —                                      |         1         |
|  descriptionWeight  |   效果描述字重   | number  |                                                                   —                                                                   |                                     —                                      |         0         |
|       package       |       卡包       | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|      password       |     卡片密码     | string  |                                                                   —                                                                   |                                     —                                      |        ''         |
|      copyright      |       版权       |  enum   |                                                        '' / 'en' / 'jp' / 'sc'                                                        |                          无 / 英文 / 日文 / 简中                           |        ''         |
|        laser        |       角标       |  enum   |                                            '' / 'laser1' / 'laser2' / 'laser3' / 'laser4'                                             |                           样式一 / 二 / 三 / 四                            |        ''         |
|        rare         |       罕贵       |  enum   |                                          'dt' / 'ur' / 'gr' / 'hr' / 'ser' / 'gser' / 'pser'                                          |                   DT / UR / GR / HR / SER / GSER / PSER                    |        ''         |
|      twentieth      |       周年       | string  |                                                    '' / 'twentieth' / 'twentyfive'                                                    |                            无 / 20周年 / 25周年                            |        ''         |
|       radius        |    是否是圆角    | boolean |                                                                   —                                                                   |                                     —                                      |       true        |
|        scale        |     卡片缩放     | number  |                                                                   —                                                                   |                                     —                                      |         1         |

### 超速决斗

|      属性名       |       说明       |  类型   |                                      可选值                                      |                            备注                            |  默认值   |
| :---------------: | :--------------: | :-----: | :------------------------------------------------------------------------------: | :--------------------------------------------------------: | :-------: |
|     language      |       语言       |  enum   |                                   'sc' / 'jp'                                    |                      简体中文 / 日文                       |   'sc'    |
|       name        |       卡名       | string  |                                        —                                         |                             —                              |    ''     |
|       color       |     卡名颜色     | string  |                                        —                                         |                             —                              |    ''     |
|       type        |       类型       |  enum   |                           'monster' / 'spell' / 'trap'                           |                     怪兽 / 魔法 / 陷阱                     | 'monster' |
|     attribute     |       属性       |  enum   |      'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / ''      |           暗 / 光 / 地 / 水 / 炎 / 风 / 神 / 无            |  'dark'   |
|       icon        |     魔陷图标     |  enum   |      'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter'      |          装备 / 场地 / 速攻 / 仪式 / 永续 / 反击           |    ''     |
|       image       |     中间卡图     | string  |                                        —                                         |                             —                              |    ''     |
|     cardType      |     卡片类型     |  enum   |                    'normal' / 'effect' / 'ritual' / 'fusion'                     |                 通常 / 效果 / 仪式 / 融合                  | 'normal'  |
|       level       |       星级       | number  |                                        —                                         |                             —                              |     0     |
|    monsterType    |     怪兽类型     | string  |                                        —                                         |                             —                              |    ''     |
|    maximumAtk     |    极限攻击力    | number  |                                        —                                         |                             —                              |     0     |
|        atk        |      攻击力      | number  |                                        —                                         |                           ?：-1                            |     0     |
|        def        |      防御力      | number  |                                        —                                         |                           ?：-1                            |     0     |
|    description    |     效果描述     | string  |                                        —                                         |                             —                              |    ''     |
| firstLineCompress |   是否首行压缩   | boolean |                                        —                                         |                             —                              |   false   |
| descriptionAlign  | 是否效果描述居中 | boolean |                                        —                                         |                             —                              |   false   |
|  descriptionZoom  |   效果描述缩放   | number  |                                        —                                         |                             —                              |     1     |
| descriptionWeight |   效果描述字重   | number  |                                        —                                         |                             —                              |     0     |
|      package      |       卡包       | string  |                                        —                                         |                             —                              |    ''     |
|     password      |     卡片密码     | string  |                                        —                                         |                             —                              |    ''     |
|      legend       |    是否是传说    | boolean |                                        —                                         |                             —                              |   false   |
|       laser       |       角标       |  enum   |                  '' / 'laser1' / 'laser2' / 'laser3' / 'laser4'                  |                   样式一 / 二 / 三 / 四                    |    ''     |
|       rare        |       罕贵       |  enum   | 'dt' / 'ur' / 'gr' / 'hr' / 'mr' / 'kc' / 'cr' / 'esr' / 'ser' / 'gser' / 'pser' | DT / UR / GR / HR / MR / KC / CR / ESR / SER / GSER / PSER |    ''     |
|      radius       |    是否是圆角    | boolean |                                        —                                         |                             —                              |   true    |
|       scale       |     卡片缩放     | number  |                                        —                                         |                             —                              |     1     |

### 游戏王卡背

|  属性名  |    说明     |  类型   |                         可选值                          |              备注               |  默认值  |
| :------: | :---------: | :-----: | :-----------------------------------------------------: | :-----------------------------: | :------: |
|   type   |  卡背类型   |  enum   | 'normal' / 'tormentor' / 'sky-dragon' / 'winged-dragon' | 通常 / 巨神兵 / 天空龙 / 翼神龙 | 'normal' |
|   logo   |    标志     |  enum   |                  'ocg' / 'tcg' / 'rd'                   |         OCG / TCG / RD          |  'ocg'   |
|  konami  | 是否有 K 标 | boolean |                            —                            |                —                |   true   |
| register | 是否有 R 标 | boolean |                            —                            |                —                |   true   |
|  radius  | 是否是圆角  | boolean |                            —                            |                —                |   true   |
|  scale   |  卡片缩放   | number  |                            —                            |                —                |    1     |

### 场地中心卡

|  属性名  |    说明    |  类型   | 可选值 | 备注 | 默认值 |
| :------: | :--------: | :-----: | :----: | :--: | :----: |
|  image   |  场地图片  | string  |   —    |  —   |   ''   |
| cardBack | 是否是卡背 | boolean |   —    |  —   | false  |
|  radius  | 是否是圆角 | boolean |   —    |  —   |  true  |
|  scale   |  卡片缩放  | number  |   —    |  —   |   1    |

### 游戏王 2 期

|      属性名       |       说明       |  类型   |                                          可选值                                          |                                    备注                                    |  默认值   |
| :---------------: | :--------------: | :-----: | :--------------------------------------------------------------------------------------: | :------------------------------------------------------------------------: | :-------: |
|     language      |       语言       |  enum   |                                           'jp'                                           |                                    日文                                    |   'jp'    |
|       font        |       字体       |  enum   |        '' / 'xlsj' / 'xlsf' / 'hklsw7' / 'hklsw5' / 'kt' / 'custom1' / 'custom2'        | 华康楷体A Std W5 / 经典细隶书简 / 经典细隶书繁 / 华康隶书体W7 / 华康隶书体W5 / 楷体 / 华康隶书体 / 文鼎中粗隶简繁 |    ''     |
|       name        |       卡名       | string  |                                            —                                             |                                     —                                      |    ''     |
|       color       |     卡名颜色     | string  |                                            —                                             |                                     —                                      |    ''     |
|       align       |     卡名对齐     |  enum   |                               'left' / 'center' / 'right'                                |                           左对齐 / 居中 / 右对齐                           |  'left'   |
|     gradient      |  卡名是否渐变色  | boolean |                                            —                                             |                                     —                                      |   false   |
|  gradientColor1   |     渐变色 1     | string  |                                            —                                             |                                     —                                      | '#999999' |
|  gradientColor2   |     渐变色 2     | string  |                                            —                                             |                                     —                                      | '#ffffff' |
|       type        |       类型       |  enum   |                               'monster' / 'spell' / 'trap'                               |                             怪兽 / 魔法 / 陷阱                             | 'monster' |
|     attribute     |       属性       |  enum   |          'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / ''          |                   暗 / 光 / 地 / 水 / 炎 / 风 / 神 / 无                    |  'dark'   |
|       icon        |     魔陷图标     |  enum   |          'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter'          |                  装备 / 场地 / 速攻 / 仪式 / 永续 / 反击                   |    ''     |
|       image       |     中间卡图     | string  |                                            —                                             |                                     —                                      |    ''     |
|     cardType      |     卡片类型     |  enum   | 'normal' / 'effect' / 'ritual' / 'fusion' / 'tormentor' / 'sky-dragon' / 'winged-dragon' |            通常 / 效果 / 仪式 / 融合 / 巨神兵 / 天空龙 / 翼神龙            | 'normal'  |
|       level       |       星级       | number  |                                            —                                             |                                     —                                      |     0     |
|    monsterType    |     怪兽类型     | string  |                                            —                                             |                                     —                                      |    ''     |
|        atk        |      攻击力      | number  |                                            —                                             |                             ????：-1，X000：-2                             |     0     |
|        def        |      防御力      | number  |                                            —                                             |                             ????：-1，X000：-2                             |     0     |
|    description    |     效果描述     | string  |                                            —                                             |                                     —                                      |    ''     |
| firstLineCompress |   是否首行压缩   | boolean |                                            —                                             |                                     —                                      |   false   |
| descriptionAlign  | 是否效果描述居中 | boolean |                                            —                                             |                                     —                                      |   false   |
|  descriptionZoom  |   效果描述缩放   | number  |                                            —                                             |                                     —                                      |     1     |
| descriptionWeight |   效果描述字重   | number  |                                            —                                             |                                     —                                      |     0     |
|      package      |       卡包       | string  |                                            —                                             |                                     —                                      |    ''     |
|     password      |     卡片密码     | string  |                                            —                                             |                                     —                                      |    ''     |
|     copyright     |       版权       |  enum   |                                 '' / 'en' / 'jp' / 'sc'                                  |                          无 / 英文 / 日文 / 简中                           |    ''     |
|       laser       |       角标       |  enum   |                      '' / 'laser1' / 'laser2' / 'laser3' / 'laser4'                      |                           样式一 / 二 / 三 / 四                            |    ''     |
|      radius       |    是否是圆角    | boolean |                                            —                                             |                                     —                                      |   true    |
|       scale       |     卡片缩放     | number  |                                            —                                             |                                     —                                      |     1     |

## ⚖️ 字体版权声明

本项目内置的字体文件（位于 `src/assets/yugioh-card/` 下）来自多家字型厂商，**字体的版权及商标均归各自原厂商所有**，包括但不限于：

- 华康字型（DynaComware / DynaLab）
- 文鼎字库（Arphic）
- Emigre Graphics
- Adobe Systems
- SandollTypeBank / Fontworks / TypeBank
- 王汉宗博士（HtWang Fonts）

这些字体仅用于技术演示与学习交流，**不随本项目授权给任何第三方商用**。如果你计划将本项目或其中的字体用于商业用途，请自行联系相应字型厂商获取正式授权。若你是字体版权方且认为本项目侵犯了你的权益，请联系我们，我们将立即移除相关字体文件。
