<h1 align="center">🎉 遊戯王カード - YuGiOh-Card 🎉</h1>

<div align="center">
  <p><a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a> | 日本語</p>
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

<p align="center">Canvasベースの遊戯王カードメーカー。OCGカード検索、ランダム生成、高画質カード画像、デスクトップEXE対応</p>

<p align="center">
  <img src="src/assets/image/banner.jpg">
</p>

## ✨ 主な機能

| 機能 | 説明 |
| ---- | ---- |
| 🔍 **OCGカード検索** | パスワード・カード名で検索、全フィールド自動入力 |
| 🎲 **ランダムカード** | 全カードデータベースからランダムに実在カードを取得 |
| 🌐 **多言語カード名** | YGOPro / 公式簡体字 / Master Duel / NWBBS / CNOCG |
| 🖼️ **高画質カード画像** | 1200×1200 WebP アートワーク |
| 🎨 **フルカスタマイズ** | カード名の色/グラデーション、種別/属性/レベル/攻守、リンクマーカー、ホログラム、レアリティ |
| 🖋️ **マルチフォント** | 簡体字/繁体字/日本語/英語 20以上内蔵フォント + カスタムフォントインポート（woff2/ttf/otf） |
| 📦 **ワンクリック出力** | JSONインポート/エクスポート、高解像度PNG（最大5倍） |
| 🖥️ **デスクトップアプリ** | Windows EXE、スタンドアロン動作 |

> **カードデータソース**
>
> | データ | ソース |
> | ---- | ---- |
> | カード情報と翻訳（中国語/日本語/韓国語） | [ygocdb.com](https://ygocdb.com/) |
> | 英語カード名/説明/種族 | [ygoprodeck.com](https://ygoprodeck.com/) |
> | カード画像（1200×1200 WebP、全言語） | [ygotoken.com](http://www.ygotoken.com/) |

現在5種類のカードに対応：

- 1️⃣ 遊戯王OCG
- 2️⃣ ラッシュデュエル
- 3️⃣ カード裏面
- 4️⃣ フィールドセンターカード
- 5️⃣ 遊戯王 第2期

## 🫡 謝辞

- [LeaferJS](https://www.leaferjs.com/) - 強力なグラフィックレンダリング
- [白羽幸鳥](https://tieba.baidu.com/home/main?id=tb.1.d6c63ffd.3YV5T6Q9Z7uIeVVhPlo8hg%3Ft%3D1654573649) - 高画質カードテンプレート
- [kooriookami/yugioh-card](https://github.com/kooriookami/yugioh-card) - 本プロジェクトのベース

## 🚩 オンラインデモ

[オンラインデモ](https://iloveaimer.github.io/YuGiOh-Card/)

## ⚡ クイックスタート

開発環境: Node.js 22+、pnpm。

`pnpm add yugioh-card`

### リポジトリ開発

```bash
pnpm install
pnpm dev            # Web開発
pnpm dev:electron   # Electronデスクトップアプリ
pnpm build:exe      # Windows EXEビルド → release/
```

### ブラウザ

```js
import { YugiohCard } from 'yugioh-card';

const card = new YugiohCard({
  view: 'xxx', // divコンテナ
  data: {
    /* パラメータはData属性を参照 */
  },
  resourcePath: 'xxx', // 静的リソースパス、src/assets/yugioh-card をプロジェクトにコピー
});
// エクスポート: card.leafer.export('xxx.png', { screenshot: true, pixelRatio: devicePixelRatio, scale: 3 });
```

````

### Node.js

Node.js 22以上が必要です。

`pnpm add skia-canvas@2`

```js
import http from 'http';
import path from 'path';
import skia from 'skia-canvas';
import { YugiohCard } from 'yugioh-card';

http.createServer((req, res) => {
  const card = new YugiohCard({
    data: { /* パラメータはData属性を参照 */ },
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

## 🔎 サンプルコード

[サンプルコード](src/components/YugiohCard.vue)

## 📖 Data 属性

### 遊戯王OCG

| 属性名 | 説明 | 型 | 選択肢 | 備考 | デフォルト |
| ------ | ---- | ---- | ------ | ---- | ---------- |
| language | 言語 | enum | 'sc' / 'tc' / 'jp' / 'kr' / 'en' / 'astral' | 簡体字/繁体字/日本語/韓国語/英語/アストラル | 'sc' |
| font | フォント | enum | '' / 'xlsj' / 'xlsf' / 'hklsw7' / 'hklsw5' / 'kt' / 'custom1' / 'custom2' / 'fzlb' / 'hktfw5' / 'dfgls4' / 'dfgls5' / 'rodin' / 'custom' | デフォルト/各種内蔵フォント/カスタム | '' |
| name | カード名 | string | — | — | '' |
| color | カード名の色 | string | — | — | '' |
| align | カード名の位置 | enum | 'left' / 'center' / 'right' | 左揃え/中央/右揃え | 'left' |
| gradient | グラデーション | boolean | — | — | false |
| gradientColor1 | グラデ色1 | string | — | — | '#999999' |
| gradientColor2 | グラデ色2 | string | — | — | '#ffffff' |
| type | 種類 | enum | 'monster' / 'spell' / 'trap' / 'pendulum' | モンスター/魔法/罠/ペンデュラム | 'monster' |
| attribute | 属性 | enum | 'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / '' | 闇/光/地/水/炎/風/神/なし | 'dark' |
| icon | 魔法・罠アイコン | enum | 'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter' | 装備/フィールド/速攻/儀式/永続/カウンター | '' |
| image | カード画像 | string | — | — | '' |
| cardType | カードタイプ | enum | 'normal' / 'effect' / 'ritual' / 'fusion' / 'synchro' / 'xyz' / 'link' / 'token' | 通常/効果/儀式/融合/シンクロ/エクシーズ/リンク/トークン | 'normal' |
| pendulumType | Pタイプ | enum | 'normal-pendulum' / 'effect-pendulum' / 'ritual-pendulum' / 'fusion-pendulum' / 'synchro-pendulum' / 'xyz-pendulum' / 'link-pendulum' | 通常P/効果P/儀式P/融合P/シンクロP/エクシーズP/リンクP | 'normal-pendulum' |
| level | レベル | number | — | — | 0 |
| rank | ランク | number | — | — | 0 |
| pendulumScale | Pスケール | number | — | — | 0 |
| pendulumDescription | P効果 | string | — | — | '' |
| monsterType | 種族 | string | — | — | '' |
| atkBar | ATKバー | boolean | — | — | true |
| atk | 攻撃力 | number | — | ?：-1、∞：-2 | 0 |
| def | 守備力 | number | — | ?：-1、∞：-2 | 0 |
| arrowList | リンクマーカー | array | [1, 2, 3, 4, 5, 6, 7, 8] | [上, 右上, 右, 右下, 下, 左下, 左, 左上] | [] |
| description | 効果テキスト | string | — | — | '' |
| firstLineCompress | 先頭行圧縮 | boolean | — | — | false |
| descriptionAlign | テキスト中央揃え | boolean | — | — | false |
| descriptionZoom | テキスト拡大 | number | — | — | 1 |
| descriptionWeight | テキスト太さ | number | — | — | 0 |
| package | パック番号 | string | — | — | '' |
| password | パスワード | string | — | — | '' |
| copyright | 著作権表記 | enum | '' / 'en' / 'jp' / 'sc' | なし/英語/日本語/簡体字 | '' |
| laser | ホログラム | enum | '' / 'laser1' / 'laser2' / 'laser3' / 'laser4' | スタイル1/2/3/4 | '' |
| rare | レアリティ | enum | 'dt' / 'ur' / 'gr' / 'hr' / 'ser' / 'gser' / 'pser' | DT/UR/GR/HR/SER/GSER/PSER | '' |
| twentieth | 周年 | string | '' / 'twentieth' / 'twentyfive' | なし/20周年/25周年 | '' |
| radius | 角丸 | boolean | — | — | true |
| scale | 拡大率 | number | — | — | 1 |

### ラッシュデュエル

| 属性名 | 説明 | 型 | 選択肢 | 備考 | デフォルト |
| ------ | ---- | ---- | ------ | ---- | ---------- |
| language | 言語 | enum | 'sc' / 'jp' | 簡体字/日本語 | 'sc' |
| name | カード名 | string | — | — | '' |
| color | カード名の色 | string | — | — | '' |
| type | 種類 | enum | 'monster' / 'spell' / 'trap' | モンスター/魔法/罠 | 'monster' |
| attribute | 属性 | enum | 'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / '' | 闇/光/地/水/炎/風/神/なし | 'dark' |
| icon | 魔法・罠アイコン | enum | 'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter' | 装備/フィールド/速攻/儀式/永続/カウンター | '' |
| image | カード画像 | string | — | — | '' |
| cardType | カードタイプ | enum | 'normal' / 'effect' / 'ritual' / 'fusion' | 通常/効果/儀式/融合 | 'normal' |
| level | レベル | number | — | — | 0 |
| monsterType | 種族 | string | — | — | '' |
| maximumAtk | マキシマム攻撃力 | number | — | — | 0 |
| atk | 攻撃力 | number | — | ?：-1 | 0 |
| def | 守備力 | number | — | ?：-1 | 0 |
| description | 効果テキスト | string | — | — | '' |
| firstLineCompress | 先頭行圧縮 | boolean | — | — | false |
| descriptionAlign | テキスト中央揃え | boolean | — | — | false |
| descriptionZoom | テキスト拡大 | number | — | — | 1 |
| descriptionWeight | テキスト太さ | number | — | — | 0 |
| package | パック番号 | string | — | — | '' |
| password | パスワード | string | — | — | '' |
| legend | レジェンド | boolean | — | — | false |
| laser | ホログラム | enum | '' / 'laser1' / 'laser2' / 'laser3' / 'laser4' | スタイル1/2/3/4 | '' |
| rare | レアリティ | enum | 'dt' / 'ur' / 'gr' / 'hr' / 'mr' / 'kc' / 'cr' / 'esr' / 'ser' / 'gser' / 'pser' | DT/UR/GR/HR/MR/KC/CR/ESR/SER/GSER/PSER | '' |
| radius | 角丸 | boolean | — | — | true |
| scale | 拡大率 | number | — | — | 1 |

### カード裏面

| 属性名 | 説明 | 型 | 選択肢 | 備考 | デフォルト |
| ------ | ---- | ---- | ------ | ---- | ---------- |
| type | 裏面タイプ | enum | 'normal' / 'tormentor' / 'sky-dragon' / 'winged-dragon' | 通常/巨神兵/天空龍/翼神龍 | 'normal' |
| logo | ロゴ | enum | 'ocg' / 'tcg' / 'rd' | OCG/TCG/RD | 'ocg' |
| konami | Kマーク | boolean | — | — | true |
| register | Rマーク | boolean | — | — | true |
| radius | 角丸 | boolean | — | — | true |
| scale | 拡大率 | number | — | — | 1 |

### フィールドセンターカード

| 属性名 | 説明 | 型 | 選択肢 | 備考 | デフォルト |
| ------ | ---- | ---- | ------ | ---- | ---------- |
| image | フィールド画像 | string | — | — | '' |
| cardBack | 裏面モード | boolean | — | — | false |
| radius | 角丸 | boolean | — | — | true |
| scale | 拡大率 | number | — | — | 1 |

### 遊戯王 第2期

| 属性名 | 説明 | 型 | 選択肢 | 備考 | デフォルト |
| ------ | ---- | ---- | ------ | ---- | ---------- |
| language | 言語 | enum | 'jp' | 日本語 | 'jp' |
| font | フォント | enum | '' / 'xlsj' / 'xlsf' / 'hklsw7' / 'hklsw5' / 'kt' / 'custom1' / 'custom2' / 'fzlb' / 'hktfw5' / 'dfgls4' / 'dfgls5' / 'rodin' | デフォルト/各種内蔵フォント | '' |
| name | カード名 | string | — | — | '' |
| color | カード名の色 | string | — | — | '' |
| align | カード名の位置 | enum | 'left' / 'center' / 'right' | 左揃え/中央/右揃え | 'left' |
| gradient | グラデーション | boolean | — | — | false |
| gradientColor1 | グラデ色1 | string | — | — | '#999999' |
| gradientColor2 | グラデ色2 | string | — | — | '#ffffff' |
| type | 種類 | enum | 'monster' / 'spell' / 'trap' | モンスター/魔法/罠 | 'monster' |
| attribute | 属性 | enum | 'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / '' | 闇/光/地/水/炎/風/神/なし | 'dark' |
| icon | 魔法・罠アイコン | enum | 'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter' | 装備/フィールド/速攻/儀式/永続/カウンター | '' |
| image | カード画像 | string | — | — | '' |
| cardType | カードタイプ | enum | 'normal' / 'effect' / 'ritual' / 'fusion' / 'tormentor' / 'sky-dragon' / 'winged-dragon' | 通常/効果/儀式/融合/巨神兵/天空龍/翼神龍 | 'normal' |
| level | レベル | number | — | — | 0 |
| monsterType | 種族 | string | — | — | '' |
| atk | 攻撃力 | number | — | ????：-1、X000：-2 | 0 |
| def | 守備力 | number | — | ????：-1、X000：-2 | 0 |
| description | 効果テキスト | string | — | — | '' |
| firstLineCompress | 先頭行圧縮 | boolean | — | — | false |
| descriptionAlign | テキスト中央揃え | boolean | — | — | false |
| descriptionZoom | テキスト拡大 | number | — | — | 1 |
| descriptionWeight | テキスト太さ | number | — | — | 0 |
| package | パック番号 | string | — | — | '' |
| password | パスワード | string | — | — | '' |
| copyright | 著作権表記 | enum | '' / 'en' / 'jp' / 'sc' | なし/英語/日本語/簡体字 | '' |
| laser | ホログラム | enum | '' / 'laser1' / 'laser2' / 'laser3' / 'laser4' | スタイル1/2/3/4 | '' |
| radius | 角丸 | boolean | — | — | true |
| scale | 拡大率 | number | — | — | 1 |

## ⚖️ フォント著作権について

本プロジェクトに内蔵されているフォントファイル（`src/assets/yugioh-card/` 以下）は複数のフォントベンダーに帰属し、**著作権および商標は各権利者に帰属**します：

- 華康（DynaComware / DynaLab）
- 文鼎（Arphic）
- Emigre Graphics
- Adobe Systems
- Sandoll
- TypeBank / Fontworks / TypeBank
- 王漢宗博士（HtWang Fonts）

これらのフォントは技術デモ・学習目的のみで使用され、**本プロジェクトを通じて第三者への商用利用許諾を行うものではありません**。商用利用の際は各フォントベンダーから正式なライセンスを取得してください。権利者の方で侵害と思われる場合はご連絡ください。速やかに対応いたします。