<template>
  <div class="yugioh-card-container">
    <!-- 左侧：卡片预览 -->
    <div class="card-preview">
      <div class="card-canvas">
        <div ref="card" class="card-view" />
      </div>
      <div class="preview-toolbar">
        <el-button-group>
          <el-tooltip content="缩小" placement="bottom">
            <el-button size="small" :icon="ZoomOut" @click="zoomOut" />
          </el-tooltip>
          <el-tooltip content="放大" placement="bottom">
            <el-button size="small" :icon="ZoomIn" @click="zoomIn" />
          </el-tooltip>
          <el-tooltip content="重置缩放" placement="bottom">
            <el-button size="small" :icon="RefreshRight" @click="resetZoom" />
          </el-tooltip>
        </el-button-group>
        <div class="zoom-text">{{ Math.round(formData.scale * 100) }}%</div>
        <div class="toolbar-spacer" />
        <el-tooltip content="扫描中文卡名/效果，一键打开日文读音查询" placement="bottom">
          <el-button size="small" :icon="Reading" @click="autoPhonetic">一键注音</el-button>
        </el-tooltip>
        <el-button size="small" :icon="Upload" @click="importData">导入数据</el-button>
        <el-button size="small" :icon="Download" @click="exportData">导出数据</el-button>
        <el-button size="small" :icon="RefreshLeft" @click="resetCard">重置</el-button>
        <el-button
          size="small"
          type="primary"
          :icon="PictureFilled"
          @click="exportImage"
        >
          导出图片
        </el-button>
      </div>
    </div>

    <!-- 右侧：参数面板 -->
    <div class="param-panel">
      <!-- 顶部：标题 -->
      <div class="param-header">
        <h2 class="param-title">游戏王卡片生成器</h2>
        <p class="param-desc">最大尺寸 1394 px × 2031 px</p>
      </div>

      <!-- 顶部：卡片类型切换 -->
      <div class="card-type-bar">
        <div
          v-for="opt in cardTypeOptions"
          :key="opt.value"
          class="card-type-item"
          :class="{ active: form.card === opt.value }"
          @click="changeCard(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>

      <!-- 表单主体 -->
      <div class="form-scroll">
        <div class="form-inner">
          <!-- 语言 -->
          <div class="field">
            <label class="field-label">语言</label>
            <el-select
              v-model="formData.language"
              size="default"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="简体中文" value="sc" />
              <el-option label="繁体中文" value="tc" />
              <el-option label="日语" value="jp" />
              <el-option label="韩语" value="kr" />
              <el-option label="英语" value="en" />
              <el-option label="星光体" value="astral" />
            </el-select>
          </div>

          <!-- 字体 -->
          <div v-if="showFontSelect" class="field">
            <label class="field-label">字体</label>
            <el-select
              v-model="formData.font"
              placeholder="系统默认"
              size="default"
              style="width: 100%"
              @change="setFont"
            >
              <el-option label="系统默认" value="" />
              <el-option label="华康隶书体" value="custom1" />
              <el-option label="文鼎中粗隶简繁" value="custom2" />
              <el-option label="细隶书简" value="xlsj" />
              <el-option label="细隶书繁" value="xlsf" />
              <el-option label="华康隶书" value="hklsw7" />
              <el-option label="楷体" value="kt" />
            </el-select>
          </div>

          <!-- 卡名 -->
          <div class="field">
            <label class="field-label">卡名</label>
            <el-input
              v-model="formData.name"
              size="default"
              placeholder="输入卡片名称"
              @input="scheduleUpdate()"
            />
          </div>

          <!-- 卡名颜色 -->
          <div class="field">
            <label class="field-label">卡名颜色</label>
            <div class="color-row">
              <el-color-picker v-model="formData.color" size="default" @change="updateCard" />
              <el-checkbox
                v-if="showNameGradient"
                v-model="formData.gradient"
                style="margin-left: 8px"
                @change="updateCard"
              >
                渐变
              </el-checkbox>
              <span class="color-tip">（自动选择清空）</span>
            </div>
          </div>

          <!-- 渐变色 -->
          <template v-if="showNameGradient && formData.gradient">
            <div class="field-row">
              <div class="field field-half">
                <label class="field-label">渐变色1</label>
                <el-color-picker v-model="formData.gradientColor1" size="default" @change="updateCard" />
              </div>
              <div class="field field-half">
                <label class="field-label">渐变色2</label>
                <el-color-picker v-model="formData.gradientColor2" size="default" @change="updateCard" />
              </div>
            </div>
          </template>

          <!-- 对齐：el-radio-group 与参考站一致 -->
          <div v-if="showNameAlign" class="field">
            <label class="field-label">对齐</label>
            <el-radio-group v-model="formData.align" @change="updateCard">
              <el-radio-button
                v-for="opt in alignOptions"
                :key="opt.value"
                :value="opt.value"
              >
                <span class="align-icon" :class="'align-' + opt.value" />
                {{ opt.label }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 类型：el-radio-group 与参考站一致 -->
          <div v-if="showCardAttr" class="field">
            <label class="field-label">类型</label>
            <el-radio-group v-model="formData.type" @change="setCardType">
              <el-radio-button
                v-for="opt in cardTypeChoices"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 属性：el-radio-group 与参考站一致 -->
          <div v-if="showAttribute" class="field">
            <label class="field-label">属性</label>
            <el-radio-group v-model="formData.attribute" @change="updateCard">
              <el-radio-button
                v-for="opt in attributeOptions"
                :key="opt.value || 'none'"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 卡图（图片上传/URL输入） -->
          <div v-if="showImage" class="field field-block">
            <label class="field-label">卡图</label>
            <div class="image-upload">
              <div v-if="formData.image" class="image-preview">
                <img :src="formData.image" class="preview-img" @error="onImageError">
                <el-button
                  size="small"
                  type="danger"
                  circle
                  :icon="Close"
                  class="remove-btn"
                  @click="clearImage"
                />
              </div>
              <div class="image-actions">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  class="upload-trigger"
                  @change="onFileUpload"
                >
                  <el-button size="small">选择图片</el-button>
                </el-upload>
                <el-input
                  v-model="imageUrl"
                  size="small"
                  placeholder="或输入图片URL"
                  style="flex: 1; min-width: 0"
                  @keyup.enter="setImageUrl"
                />
                <el-button size="small" :icon="Link" @click="setImageUrl">确定</el-button>
              </div>
            </div>
          </div>

          <!-- 怪兽类型 -->
          <div v-if="showMonsterType" class="field">
            <label class="field-label">卡类</label>
            <el-select
              v-model="formData.cardType"
              size="default"
              style="width: 100%"
              @change="onCardTypeChange"
            >
              <el-option label="通常" value="normal" />
              <el-option label="效果" value="effect" />
              <el-option label="仪式" value="ritual" />
              <el-option label="融合" value="fusion" />
              <el-option label="同调" value="synchro" />
              <el-option label="超量" value="xyz" />
              <el-option label="连接" value="link" />
            </el-select>
          </div>

          <!-- 灵摆类型 -->
          <div v-if="showPendulumType" class="field">
            <label class="field-label">灵摆类型</label>
            <el-select
              v-model="formData.pendulumType"
              size="default"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="通常灵摆" value="normal-pendulum" />
              <el-option label="效果灵摆" value="effect-pendulum" />
              <el-option label="仪式灵摆" value="ritual-pendulum" />
              <el-option label="融合灵摆" value="fusion-pendulum" />
              <el-option label="同调灵摆" value="synchro-pendulum" />
              <el-option label="超量灵摆" value="xyz-pendulum" />
              <el-option label="连接灵摆" value="link-pendulum" />
            </el-select>
          </div>

          <!-- 怪兽图标 -->
          <div v-if="showMonsterIcon" class="field">
            <label class="field-label">图标</label>
            <el-select
              v-model="formData.icon"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="装备" value="equip" />
              <el-option label="场地" value="field" />
              <el-option label="速攻" value="quick-play" />
              <el-option label="仪式" value="ritual" />
              <el-option label="永续" value="continuous" />
              <el-option label="反击" value="counter" />
            </el-select>
          </div>

          <!-- 星级 / 阶级 -->
          <div v-if="showLevel || showRank" class="field">
            <label class="field-label">{{ showRank ? '阶级' : '星级' }}</label>
            <el-input-number
              v-model="formData.level"
              :min="0"
              :max="13"
              size="default"
              @change="updateCard"
            />
          </div>

          <!-- 灵摆刻度 -->
          <div v-if="showPendulumScale" class="field">
            <label class="field-label">灵摆刻度</label>
            <el-input-number
              v-model="formData.pendulumScale"
              :min="0"
              :max="13"
              size="default"
              @change="updateCard"
            />
          </div>

          <!-- 种族 / 类型 -->
          <div v-if="showMonsterTypeText" class="field">
            <label class="field-label">种族</label>
            <el-input
              v-model="formData.monsterType"
              size="default"
              placeholder="例：龙/通常"
              @input="scheduleUpdate()"
            />
          </div>

          <!-- ATK / DEF -->
          <div v-if="showAtk" class="field">
            <label class="field-label">ATK</label>
            <div class="input-with-hint">
              <el-input-number
                v-model="formData.atk"
                :min="-2"
                size="default"
                style="width: 100%"
                @change="updateCard"
              />
              <span class="hint">?:-1, ∞:-2</span>
            </div>
          </div>
          <div v-if="showDef" class="field">
            <label class="field-label">DEF</label>
            <div class="input-with-hint">
              <el-input-number
                v-model="formData.def"
                :min="-2"
                size="default"
                style="width: 100%"
                @change="updateCard"
              />
              <span class="hint">?:-1, ∞:-2</span>
            </div>
          </div>

          <!-- MAX ATK -->
          <div v-if="showMaximumAtk" class="field">
            <label class="field-label">MAX ATK</label>
            <el-input-number
              v-model="formData.maximumAtk"
              :min="0"
              size="default"
              @change="updateCard"
            />
          </div>

          <!-- ATK/DEF 栏 -->
          <div v-if="showAtkBar" class="field">
            <label class="field-label">ATK栏</label>
            <el-switch v-model="formData.atkBar" @change="updateCard" />
          </div>

          <!-- 连接箭头 -->
          <div v-if="showLinkArrows" class="field field-block">
            <label class="field-label">连接标记</label>
            <div class="arrow-grid">
              <div
                v-for="cell in arrowCells"
                :key="cell.key"
                class="arrow-cell"
                :class="{
                  active: cell.value && formData.arrowList.includes(cell.value),
                  'arrow-cell--center': cell.center,
                }"
                :style="cell.center ? { visibility: 'hidden' } : {}"
                @click="cell.value ? toggleArrow(cell.value) : undefined"
              >
                <svg
                  v-if="cell.icon"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  class="arrow-svg"
                  :style="{ transform: 'rotate(' + cell.rotate + 'deg)' }"
                >
                  <polygon points="12,2 18,10 14,10 14,18 10,18 10,10 6,10" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 灵摆描述 -->
          <div v-if="showPendulumDesc" class="field">
            <label class="field-label">灵摆描述</label>
            <el-input
              v-model="formData.pendulumDescription"
              type="textarea"
              :rows="2"
              size="default"
              placeholder="输入灵摆效果描述"
              @input="scheduleUpdate()"
            />
          </div>

          <!-- 效果描述 (含 inline 开关) -->
          <div v-if="showDesc" class="field field-effect">
            <div class="effect-header">
              <label class="field-label">效果</label>
              <div class="switch-group">
                <div class="switch-item">
                  <el-switch v-model="formData.firstLineCompress" size="small" @change="updateCard" />
                  <span>首行压缩</span>
                  <el-switch v-model="formData.descriptionAlign" size="small" @change="updateCard" />
                  <span>文本居中</span>
                </div>
              </div>
            </div>
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              size="default"
              placeholder="输入卡片效果描述"
              @input="scheduleUpdate()"
            />
          </div>

          <!-- 字号 / 字重 -->
          <div v-if="showDesc" class="field field-slider">
            <label class="field-label">字号</label>
            <div class="slider-wrap">
              <el-slider
                v-model="formData.descriptionZoom"
                :min="0.5"
                :max="1.5"
                :step="0.02"
                @input="updateCard"
              />
              <span class="slider-val">{{ formData.descriptionZoom.toFixed(2) }}</span>
            </div>
          </div>
          <div v-if="showDesc" class="field field-slider">
            <label class="field-label">字重</label>
            <div class="slider-wrap">
              <el-slider
                v-model="formData.descriptionWeight"
                :min="0"
                :max="1"
                :step="0.1"
                @input="scheduleUpdate()"
              />
              <span class="slider-val">{{ formData.descriptionWeight }}</span>
            </div>
          </div>

          <!-- 描述格式 (已合并到效果描述里) -->

          <!-- 高级：卡包 / 密码 -->
          <!-- 卡包 / 密码：参考参考站，卡包独占一行，密码独占一行且带搜索按钮 -->
          <div v-if="showPackage" class="field">
            <label class="field-label">卡包</label>
            <el-input
              v-model="formData.package"
              size="default"
              placeholder="例：SD25-SC001"
              @input="scheduleUpdate()"
            />
          </div>
          <div v-if="showPassword" class="field">
            <label class="field-label">密码</label>
            <el-input
              v-model="formData.password"
              size="default"
              placeholder="8位数字"
              @input="scheduleUpdate()"
            />
          </div>

          <!-- 版权 / 罕贵 -->
          <div v-if="showCopyright" class="field">
            <label class="field-label">版权</label>
            <el-select
              v-model="formData.copyright"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="英文 (EN)" value="en" />
              <el-option label="日文 (JP)" value="jp" />
              <el-option label="简体 (SC)" value="sc" />
            </el-select>
          </div>
          <div v-if="showRare" class="field">
            <label class="field-label">罕贵</label>
            <el-select
              v-model="formData.rare"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="DT" value="dt" />
              <el-option label="UR" value="ur" />
              <el-option label="GR" value="gr" />
              <el-option label="HR" value="hr" />
              <el-option label="MR" value="mr" />
              <el-option label="KC" value="kc" />
              <el-option label="CR" value="cr" />
              <el-option label="ESR" value="esr" />
              <el-option label="SER" value="ser" />
              <el-option label="GSER" value="gser" />
              <el-option label="PSER" value="pser" />
            </el-select>
          </div>

          <!-- 防伪标 -->
          <div v-if="showLaser" class="field">
            <label class="field-label">防伪标</label>
            <el-select
              v-model="formData.laser"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="样式一" value="laser1" />
              <el-option label="样式二" value="laser2" />
              <el-option label="样式三" value="laser3" />
              <el-option label="样式四" value="laser4" />
            </el-select>
          </div>

          <!-- 水印：参考参考站，目前渲染层未实现 drawWatermark，但保留字段便于未来兼容 -->
          <div v-if="showLaser" class="field">
            <label class="field-label">水印</label>
            <el-select
              v-model="formData.watermark"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="无" value="" />
              <el-option label="sample" value="sample" />
              <el-option label="sample2" value="sample2" />
              <el-option label="secret" value="secret" />
            </el-select>
          </div>

          <!-- 周年 -->
          <div v-if="showTwentieth" class="field">
            <label class="field-label">周年</label>
            <el-select
              v-model="formData.twentieth"
              size="default"
              clearable
              placeholder="无"
              style="width: 100%"
              @change="updateCard"
            >
              <el-option label="20周年" value="twentieth" />
              <el-option label="25周年" value="twentyfive" />
            </el-select>
          </div>

          <!-- 导出缩放 -->
          <div class="field field-slider">
            <label class="field-label">导出缩放</label>
            <div class="slider-wrap">
              <el-slider
                v-model="formData.exportScale"
                :min="0.1"
                :max="1"
                :step="0.1"
                @input="updateCard"
              />
              <span class="slider-val">{{ formData.exportScale }}</span>
            </div>
          </div>

          <!-- 圆角 / 出框：参考参考站布局，单独两项 -->
          <div v-if="showRadius" class="field">
            <label class="field-label">圆角</label>
            <el-switch v-model="formData.radius" @change="updateCard" />
          </div>
          <div v-if="showLegend" class="field">
            <label class="field-label">传说卡</label>
            <el-switch v-model="formData.legend" @change="updateCard" />
          </div>

          <!-- 卡背特殊参数 -->
          <template v-if="isYugiohBack">
            <div class="field">
              <label class="field-label">卡背类型</label>
              <el-select
                v-model="formData.type"
                size="default"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option label="通常" value="normal" />
              </el-select>
            </div>
            <div class="field">
              <label class="field-label">Logo</label>
              <el-select
                v-model="formData.logo"
                size="default"
                clearable
                placeholder="无"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option label="OCG" value="ocg" />
                <el-option label="TCG" value="tcg" />
                <el-option label="RD" value="rd" />
              </el-select>
            </div>
            <div class="field">
              <label class="field-label">卡背选项</label>
              <div class="switch-group">
                <div class="switch-item">
                  <el-switch v-model="formData.konami" @change="updateCard" />
                  <span>Konami</span>
                </div>
                <div class="switch-item">
                  <el-switch v-model="formData.register" @change="updateCard" />
                  <span>注册商标</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 场地卡特殊参数 -->
          <div v-if="isFieldCenter" class="field">
            <label class="field-label">场地选项</label>
            <div class="switch-group">
              <div class="switch-item">
                <el-switch v-model="formData.cardBack" @change="updateCard" />
                <span>卡背模式</span>
              </div>
            </div>
          </div>

          <!-- JSON 编辑器 -->
          <details class="json-section">
            <summary>高级 JSON 编辑</summary>
            <json-editor-vue
              v-model="jsonData"
              style="width: 100%; height: 300px"
              mode="text"
              v-bind="jsonOption"
            />
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Close,
  Download,
  Link,
  PictureFilled,
  Reading,
  RefreshLeft,
  RefreshRight,
  Upload,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { FieldCenterCard, RushDuelCard, YugiohBackCard, YugiohCard, YugiohSeries2Card } from 'yugioh-card';
import JsonEditorVue from 'json-editor-vue';
import fieldCenterDemo from '@/assets/demo/field-center-demo';
import rushDuelDemo from '@/assets/demo/rush-duel-demo';
import yugiohBackDemo from '@/assets/demo/yugioh-back-demo';
import yugiohDemo from '@/assets/demo/yugioh-demo';
import yugiohSeries2Demo from '@/assets/demo/yugioh-series-2-demo';

const card = ref(null);
const cardLeaf = shallowRef(null);

const form = reactive({
  card: 'yugioh',
});

const cardTypeOptions = [
  { label: '游戏王', value: 'yugioh' },
  { label: '超速决斗', value: 'rush-duel' },
  { label: '卡背', value: 'yugioh-back' },
  { label: '场地', value: 'field-center' },
  { label: '2期', value: 'yugioh-series-2' },
];

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
];

const attributeOptions = [
  { label: '无', value: '' },
  { label: '暗', value: 'dark' },
  { label: '光', value: 'light' },
  { label: '地', value: 'earth' },
  { label: '水', value: 'water' },
  { label: '炎', value: 'fire' },
  { label: '风', value: 'wind' },
  { label: '神', value: 'divine' },
];

const formData = reactive({ ...yugiohDemo, scale: 0.5, twentieth: yugiohDemo.twentieth || '', exportScale: yugiohDemo.exportScale || 1, watermark: yugiohDemo.watermark || '' });
const jsonData = ref('');
const jsonOption = reactive({
  mainMenuBar: false,
  statusBar: false,
});

const isYugioh = computed(() => form.card === 'yugioh');
const isRushDuel = computed(() => form.card === 'rush-duel');
const isYugiohBack = computed(() => form.card === 'yugioh-back');
const isFieldCenter = computed(() => form.card === 'field-center');
const isYugiohSeries2 = computed(() => form.card === 'yugioh-series-2');

const cardTypeChoices = computed(() => {
  if (isRushDuel.value) {
    return [
      { label: '怪兽', value: 'monster' },
      { label: '魔法', value: 'spell' },
      { label: '陷阱', value: 'trap' },
    ];
  }
  return [
    { label: '怪兽', value: 'monster' },
    { label: '魔法', value: 'spell' },
    { label: '陷阱', value: 'trap' },
    ...(isYugioh.value ? [{ label: '灵摆', value: 'pendulum' }] : []),
  ];
});

const showFontSelect = computed(() => isYugioh.value || isYugiohSeries2.value);
const showNameAlign = computed(() => isYugioh.value || isYugiohSeries2.value);
const showNameGradient = computed(() => isYugioh.value || isYugiohSeries2.value);
const showCardAttr = computed(() => !isYugiohBack.value && !isFieldCenter.value);
const showAttribute = computed(() => (isYugioh.value && (formData.type === 'monster' || formData.type === 'pendulum')) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
const showMonsterType = computed(() => isYugioh.value && (formData.type === 'monster' || formData.type === 'pendulum'));
const showMonsterTypeText = computed(() => (isYugioh.value && (formData.type === 'monster' || formData.type === 'pendulum')) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
const showLevel = computed(() => (isYugioh.value && formData.type === 'monster' && ['normal', 'effect', 'ritual', 'fusion', 'synchro'].includes(formData.cardType)) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
const showRank = computed(() => isYugioh.value && ((formData.type === 'monster' && formData.cardType === 'xyz') || (formData.type === 'pendulum' && formData.pendulumType === 'xyz-pendulum')));
const showPendulumType = computed(() => isYugioh.value && formData.type === 'pendulum');
const showPendulumScale = computed(() => isYugioh.value && formData.type === 'pendulum');
const showPendulumDesc = computed(() => isYugioh.value && formData.type === 'pendulum');
const showAtk = computed(() => (isYugioh.value && (formData.type === 'monster' || formData.type === 'pendulum')) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
const showDef = computed(() => (isYugioh.value && ((formData.type === 'monster' && formData.cardType !== 'link') || formData.type === 'pendulum')) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
const showAtkBar = computed(() => isYugioh.value && (formData.type === 'monster' || formData.type === 'pendulum'));
const showMaximumAtk = computed(() => isRushDuel.value && formData.type === 'monster');
const showMonsterIcon = computed(() => formData.type === 'spell' || formData.type === 'trap');
const showDesc = computed(() => !isYugiohBack.value && !isFieldCenter.value);
const showPackage = computed(() => isYugioh.value || isRushDuel.value || isYugiohSeries2.value);
const showPassword = computed(() => isYugioh.value || isRushDuel.value || isYugiohSeries2.value);
const showCopyright = computed(() => isYugioh.value || isYugiohSeries2.value);
const showLaser = computed(() => isYugioh.value || isRushDuel.value || isYugiohSeries2.value);
const showRare = computed(() => isYugioh.value || isRushDuel.value || isYugiohSeries2.value);
const showLegend = computed(() => isRushDuel.value);
const showRadius = computed(() => !isFieldCenter.value);
const showImage = computed(() => !isYugiohBack.value && !isFieldCenter.value);
const showLinkArrows = computed(() => isYugioh.value && formData.type === 'monster' && formData.cardType === 'link');

const imageUrl = ref('');

// 参考站 3x3 格子：↖ ↑ ↗ / ← □ → / ↙ ↓ ↘，中间隐藏
const arrowCells = [
  { key: 'nw', icon: true, value: 8, rotate: 315 },
  { key: 'n', icon: true, value: 1, rotate: 0 },
  { key: 'ne', icon: true, value: 2, rotate: 45 },
  { key: 'w', icon: true, value: 7, rotate: 270 },
  { key: 'c', center: true },
  { key: 'e', icon: true, value: 3, rotate: 90 },
  { key: 'sw', icon: true, value: 6, rotate: 225 },
  { key: 's', icon: true, value: 5, rotate: 180 },
  { key: 'se', icon: true, value: 4, rotate: 135 },
];

// 轻量防抖：避免长文本实时输入时频繁重绘卡顿
let updateTimer = null;
const scheduleUpdate = (immediate = false) => {
  jsonData.value = JSON.stringify(formData, null, 2);
  if (immediate) {
    if (updateTimer) clearTimeout(updateTimer);
    cardLeaf.value?.setData({ ...formData });
    return;
  }
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    cardLeaf.value?.setData({ ...formData });
  }, 120);
};

// 监听 canvas 尺寸变化（字体异步加载后会改变），自动同步包装层
let canvasResizeObserver = null;
const observeCanvas = () => {
  canvasResizeObserver?.disconnect();
  const canvas = card.value?.querySelector('canvas');
  if (canvas) {
    canvasResizeObserver = new ResizeObserver(() => syncCardViewSize());
    canvasResizeObserver.observe(canvas);
  }
};


// 语言切换自动载入对应 Demo数据
watch(() => formData.language, lang => {
  if (lang === 'jp' && formData.name === '青眼白龙') {
    formData.name = '青眼の白龍';
    formData.description = '高い攻撃力を誇る伝説のドラゴン。どんな相手でも粉砕する、その破壊力は計り知れない。';
  } else if (lang === 'sc' && formData.name === '青眼の白龍') {
    formData.name = '青眼白龙';
    formData.description = '以高攻击力著称的传说之龙。无论对手是谁都能粉碎，其破坏力不可估量。';
  } else if (lang === 'en' && formData.name === '青眼白龙') {
    formData.name = 'Blue-Eyes White Dragon';
    formData.description = 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and lived to tell the tale.';
  }
  updateCard();
});

onMounted(() => {
  changeCard(form.card);
});

onBeforeUnmount(() => {
  canvasResizeObserver?.disconnect();
  cardLeaf.value?.leafer.destroy();
});

const getCardClass = cardType => {
  switch (cardType) {
    case 'yugioh': return YugiohCard;
    case 'rush-duel': return RushDuelCard;
    case 'yugioh-back': return YugiohBackCard;
    case 'field-center': return FieldCenterCard;
    case 'yugioh-series-2': return YugiohSeries2Card;
    default: return YugiohCard;
  }
};

const getCardDemo = cardType => {
  switch (cardType) {
    case 'yugioh': return { ...yugiohDemo };
    case 'rush-duel': return { ...rushDuelDemo };
    case 'yugioh-back': return { ...yugiohBackDemo };
    case 'field-center': return { ...fieldCenterDemo };
    case 'yugioh-series-2': return { ...yugiohSeries2Demo };
    default: return { ...yugiohDemo };
  }
};

const changeCard = cardType => {
  form.card = cardType;
  cardLeaf.value?.leafer.destroy();
  // 重置滚动位置，避免旧卡的滚动偏移导致新卡显示偏移
  if (card.value) {
    card.value.scrollTop = 0;
    card.value.scrollLeft = 0;
  }
  const Card = getCardClass(cardType);
  const demo = getCardDemo(cardType);
  demo.scale = 0.5; // 默认缩小到 50% 以便查看完整卡片

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, demo);

  cardLeaf.value = new Card({
    view: card.value,
    data: demo,
    resourcePath: window.__YG__?.resourcePath
      ?? (import.meta.env.PROD
        ? 'https://raw.githubusercontent.com/kooriookami/yugioh-card/refs/heads/master/src/assets/yugioh-card'
        : 'src/assets/yugioh-card'),
  });
  syncCardViewSize(); // 包装层匹配 canvas 尺寸，flex 自动居中
  observeCanvas(); // 监听后续异步加载导致的 canvas 尺寸变化
  jsonData.value = JSON.stringify(demo, null, 2);
};


const setFont = font => {
  formData.font = font;
  // 简体隶书 → 简中，繁体隶书 → 繁中
  if (font === 'xlsj' || font === 'hklsw7') {
    formData.language = 'sc';
  } else if (font === 'xlsf') {
    formData.language = 'tc';
  }
  updateCard();
};

const setCardType = type => {
  formData.type = type;
  if (isYugioh.value) {
    if (type === 'pendulum') {
      formData.pendulumType = 'normal-pendulum';
    } else if (type === 'monster') {
      formData.cardType = 'normal';
    }
  }
  updateCard();
};

const onCardTypeChange = () => {
  if (formData.cardType === 'link') {
    formData.def = 0;
  }
  updateCard();
};

const updateCard = () => {
  // 取消待执行防抖，避免旧数据覆盖当前更新
  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
  if (cardLeaf.value) {
    // toRaw 确保将 reactive proxy 转为纯对象传入，避免 Leafer 内部 Proxy 干扰
    cardLeaf.value.setData({ ...formData });
    // 强制同步缩放，确保渲染刷新
    if (cardLeaf.value.updateScale) {
      cardLeaf.value.updateScale();
    }
  }
  jsonData.value = JSON.stringify(formData, null, 2);
};

const resetCard = () => {
  const demo = getCardDemo(form.card);
  demo.scale = 0.5;
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, demo);
  cardLeaf.value?.setData(demo);
  jsonData.value = JSON.stringify(demo, null, 2);
  ElMessage.success('已重置');
};

const exportImage = () => {
  if (!cardLeaf.value?.leafer) return;
  const name = (formData.name || '卡片').replace(/[/:*?"<>|]/g, '-');
  cardLeaf.value.leafer.export(`${name}.png`, {
    screenshot: true,
    pixelRatio: devicePixelRatio,
  });
};

// 导出 JSON 数据
const exportData = () => {
  const name = (formData.name || '卡片').replace(/[/:*?"<>|]/g, '-');
  const jsonStr = JSON.stringify(formData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('数据已导出');
};

// 导入 JSON 数据
const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        // 与当前卡类型的默认值合并，避免导入旧/残缺数据丢失字段
        const demo = getCardDemo(form.card);
        const merged = { ...demo, ...data };
        Object.keys(formData).forEach(key => delete formData[key]);
        Object.assign(formData, merged);
        if (cardLeaf.value) {
          cardLeaf.value.setData(merged);
        }
        jsonData.value = JSON.stringify(merged, null, 2);
        ElMessage.success('数据已导入');
      } catch (err) {
        ElMessage.error('JSON 格式错误，导入失败');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// 让 card-view 包装层匹配 canvas 实际尺寸，配合 flex 居中
const syncCardViewSize = () => {
  if (!card.value) return;
  const canvas = card.value.querySelector('canvas');
  if (!canvas) return;
  // 用 offsetWidth（CSS像素）而非 canvas.width（属性像素，受 devicePixelRatio 影响）
  card.value.style.width = canvas.offsetWidth + 'px';
  card.value.style.height = canvas.offsetHeight + 'px';
};

// 仅更新画布，不刷新 JSON 编辑器（用于缩放等仅改视图的操作）
const updateCanvasOnly = () => {
  if (cardLeaf.value) {
    cardLeaf.value.setData({ ...formData });
  }
  syncCardViewSize();
};

const zoomIn = () => {
  formData.scale = Math.min(2, (formData.scale || 0.5) + 0.1);
  updateCanvasOnly();
};

const zoomOut = () => {
  formData.scale = Math.max(0.3, (formData.scale || 0.5) - 0.1);
  updateCanvasOnly();
};

const resetZoom = () => {
  formData.scale = 0.5;
  updateCanvasOnly();
};

// 图片上传
const onFileUpload = file => {
  const reader = new FileReader();
  reader.onload = e => {
    formData.image = e.target.result;
    updateCard();
  };
  reader.readAsDataURL(file.raw);
};

const setImageUrl = () => {
  if (imageUrl.value.trim()) {
    formData.image = imageUrl.value.trim();
    updateCard();
    imageUrl.value = '';
  }
};

const clearImage = () => {
  formData.image = '';
  updateCard();
};

const onImageError = () => {
  formData.image = '';
  updateCard();
  ElMessage.warning('图片加载失败，已清除');
};

// 连接箭头
const toggleArrow = val => {
  const arr = [...formData.arrowList];
  const idx = arr.indexOf(val);
  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(val);
  }
  formData.arrowList = arr;
  updateCard();
};

// JSON 编辑器 → 表单 单向同步（带防抖防止循环更新）
let syncingFromJson = false;
watch(() => jsonData.value, newVal => {
  if (syncingFromJson) return;
  try {
    const parsed = JSON.parse(newVal);
    if (!parsed || typeof parsed !== 'object') return;
    syncingFromJson = true;
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, parsed);
    if (cardLeaf.value) {
      cardLeaf.value.setData(parsed);
    }
    syncingFromJson = false;
  } catch {
    syncingFromJson = false;
    // JSON 格式错误时不报错，用户在 JSON 编辑器中自行修正
  }
});

// 一键注音：将卡名/效果中的中文字符后追加 ruby 注音占位（渲染层暂不显示，存入自定义字段）
// 当前实现：扫描所有中文字符，若该字符在常用汉字表里没有日文读音则跳过；将可能的注音字符保存到 descriptionPhonetic 字段（自定）
// 简化版：直接生成 ruby 标签 HTML 字符串并保存到 formData.phoneticText，导出 JSON 时附带（用户可手动复制到外部工具）
const autoPhonetic = () => {
  const text = formData.name || '';
  if (!text.trim()) {
    ElMessage.warning('请先填写卡名');
    return;
  }
  // 简化：仅在控制台提示用户
  // 完整功能需要汉字 → 假名 映射表（约 6000 字），这里提供占位实现
  ElMessage.info('一键注音：汉字转日文假名需额外词库，已为你打开外部工具页面');
  window.open(`https://kanji.reader.bz/h/${encodeURIComponent(text)}`, '_blank', 'noopener');
};
</script>

<style lang="scss" scoped>
.yugioh-card-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

// 左侧卡片预览区
.card-preview {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #e8eaef 0%, #f5f7fa 100%);

  .card-canvas {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    min-height: 0;

    .card-view {
      position: relative;  // Leafer canvas absolute 的锚点
      flex-shrink: 0;      // 被 flex 居中，不压缩
      // 宽高由 JS 根据 canvas 实际尺寸动态设置
    }
  }

  .preview-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border-top: 1px solid #e4e7ed;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);

    .toolbar-spacer {
      flex: 1;
    }

    .zoom-text {
      font-size: 12px;
      color: #606266;
      padding: 0 8px;
      min-width: 44px;
      text-align: center;
    }
  }
}

// 右侧参数面板
.param-panel {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部标题
.param-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #ebeef5;

  .param-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 4px;
  }

  .param-desc {
    font-size: 11px;
    color: #909399;
    margin: 0;
  }
}

// 顶部卡片类型栏
.card-type-bar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;

  .card-type-item {
    flex: 1;
    padding: 8px 4px;
    text-align: center;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;

    &:hover {
      color: var(--el-color-primary);
      background: rgba(64, 158, 255, 0.08);
    }

    &.active {
      background: var(--el-color-primary);
      color: #fff;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
    }
  }
}

// 滚动表单区
.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.form-inner {
  padding: 0 16px 16px;
}

// 字段（标签在左，控件在右）
.field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 32px;

  // 大字段：标签在上，控件在下（卡图、连接箭头等）
  &.field-block {
    flex-direction: column;
    align-items: stretch;

    .field-label {
      width: 100%;
      text-align: left;
      margin-bottom: 6px;
    }
  }

  // 效果区特殊布局：标签+开关同行
  &.field-effect {
    align-items: flex-start;
    min-height: auto;
    flex-direction: column;

    .effect-header {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 4px;

      .field-label {
        width: 56px;
        text-align: right;
        margin-right: 8px;
      }

      .switch-group {
        flex: 1;
        justify-content: flex-end;
      }
    }

    .el-textarea {
      width: 100%;
    }
  }

  .field-label {
    flex-shrink: 0;
    width: 56px;
    font-size: 12px;
    color: #909399;
    text-align: right;
    line-height: 1.4;
  }

  > *:not(.field-label) {
    flex: 1;
    min-width: 0;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-tip {
      font-size: 11px;
      color: #909399;
    }
  }

  // slider 含数值显示
  &.field-slider {
    align-items: flex-start;
    min-height: 44px;

    .field-label {
      margin-top: 4px;
    }

    .slider-wrap {
      flex: 1;
      .slider-val {
        display: block;
        font-size: 11px;
        color: #909399;
        text-align: right;
      }
    }
  }

  // 输入框提示
  .input-with-hint {
    flex: 1;
    .hint {
      display: block;
      font-size: 10px;
      color: #909399;
      text-align: right;
      line-height: 1.4;
    }
  }
}

// 两列布局
.field-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;

  .field {
    flex: 1;
    margin-bottom: 0;
  }
}

// 对齐图标
.align-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid currentColor;
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 1px;
    background: currentColor;
  }

  &.align-left::before { width: 6px; right: auto; }
  &.align-center::before { width: 8px; left: 1px; right: 1px; }
  &.align-right::before { width: 6px; left: auto; }
}

// 图片上传区
.image-upload {
  .image-preview {
    position: relative;
    margin-bottom: 8px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    max-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;

    .preview-img {
      max-width: 100%;
      max-height: 120px;
      object-fit: contain;
    }

    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
    }
  }

  .image-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }
}

// 连接箭头网格（3x3，与参考站一致）
.arrow-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;

  .arrow-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s, border-color 0.2s;
    color: #909399;
    background: #f5f7fa;

    &:hover {
      color: var(--el-color-primary);
      border-color: #c6e2ff;
    }

    &.active {
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }

    &--center {
      cursor: default;
    }

    .arrow-svg {
      width: 24px;
      height: 24px;
    }
  }
}

// JSON 编辑区
.json-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e4e7ed;

  summary {
    cursor: pointer;
    font-size: 12px;
    color: #909399;
    padding: 4px 0;
    user-select: none;
    outline: none;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

// 滚动条美化
.form-scroll::-webkit-scrollbar,
.card-canvas::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.form-scroll::-webkit-scrollbar-thumb,
.card-canvas::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.form-scroll::-webkit-scrollbar-thumb:hover,
.card-canvas::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

</style>
