<template>
  <div class="yugioh-card-container">
    <!-- 左侧：卡片预览 -->
    <div class="card-preview">
      <div ref="card" class="card-canvas" />
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
        <el-button size="small" :icon="RefreshLeft" @click="resetCard">重置</el-button>
        <el-button size="small" type="primary" :icon="Download" @click="exportImage">导出图片</el-button>
      </div>
    </div>

    <!-- 右侧：参数面板 -->
    <div class="param-panel">
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
            <el-select v-model="formData.language" size="default" @change="updateCard" style="width: 100%">
              <el-option label="简体中文" value="sc" />
              <el-option label="繁体中文" value="tc" />
              <el-option label="日语" value="jp" />
              <el-option label="韩语" value="kr" />
              <el-option label="英语" value="en" />
              <el-option label="星光体" value="astral" />
            </el-select>
          </div>

          <!-- 卡名 -->
          <div class="field">
            <label class="field-label">卡名</label>
            <el-input v-model="formData.name" size="default" @input="updateCard" placeholder="输入卡片名称" />
          </div>

          <!-- 卡名颜色 -->
          <div class="field">
            <label class="field-label">卡名颜色</label>
            <div class="color-row">
              <el-color-picker v-model="formData.color" @change="updateCard" size="default" />
              <el-checkbox v-if="showNameGradient" v-model="formData.gradient" @change="updateCard" style="margin-left: 8px">
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
                <el-color-picker v-model="formData.gradientColor1" @change="updateCard" size="default" />
              </div>
              <div class="field field-half">
                <label class="field-label">渐变色2</label>
                <el-color-picker v-model="formData.gradientColor2" @change="updateCard" size="default" />
              </div>
            </div>
          </template>

          <!-- 字体 -->
          <div class="field" v-if="showFontSelect">
            <label class="field-label">字体</label>
            <div class="seg-group seg-group-wrap">
              <div
                v-for="opt in fontOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: formData.font === opt.value }"
                @click="setFont(opt.value)"
              >
                {{ opt.label }}
              </div>
            </div>
          </div>

          <!-- 对齐 -->
          <div class="field" v-if="showNameAlign">
            <label class="field-label">对齐</label>
            <div class="seg-group seg-group-3">
              <div
                v-for="opt in alignOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: formData.align === opt.value }"
                @click="formData.align = opt.value; updateCard()"
              >
                <span class="align-icon" :class="'align-' + opt.value"></span>
                <span>{{ opt.label }}</span>
              </div>
            </div>
          </div>

          <!-- 卡图（图片上传/URL输入） -->
          <div class="field" v-if="showImage">
            <label class="field-label">卡图</label>
            <div class="image-upload">
              <div class="image-preview" v-if="formData.image">
                <img :src="formData.image" class="preview-img" @error="onImageError" />
                <el-button size="small" type="danger" circle :icon="Close" @click="clearImage" class="remove-btn" />
              </div>
              <div class="image-actions">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  @change="onFileUpload"
                  class="upload-trigger"
                >
                  <el-button size="small">选择图片</el-button>
                </el-upload>
                <el-input
                  v-model="imageUrl"
                  size="small"
                  placeholder="或输入图片URL"
                  @keyup.enter="setImageUrl"
                  style="flex: 1; min-width: 0"
                />
                <el-button size="small" @click="setImageUrl" :icon="Link">确定</el-button>
              </div>
            </div>
          </div>

          <!-- 类型 -->
          <div class="field" v-if="showCardAttr">
            <label class="field-label">类型</label>
            <div class="seg-group">
              <div
                v-for="opt in cardTypeChoices"
                :key="opt.value"
                class="seg-item"
                :class="{ active: formData.type === opt.value }"
                @click="setCardType(opt.value)"
              >
                {{ opt.label }}
              </div>
            </div>
          </div>

          <!-- 属性 -->
          <div class="field" v-if="showAttribute">
            <label class="field-label">属性</label>
            <div class="seg-group seg-group-wrap">
              <div
                v-for="opt in attributeOptions"
                :key="opt.value"
                class="seg-item"
                :class="{ active: formData.attribute === opt.value }"
                @click="formData.attribute = opt.value; updateCard()"
              >
                {{ opt.label }}
              </div>
            </div>
          </div>

          <!-- 怪兽类型 -->
          <div class="field" v-if="showMonsterType">
            <label class="field-label">卡类</label>
            <el-select v-model="formData.cardType" size="default" @change="onCardTypeChange" style="width: 100%">
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
          <div class="field" v-if="showPendulumType">
            <label class="field-label">灵摆类型</label>
            <el-select v-model="formData.pendulumType" size="default" @change="updateCard" style="width: 100%">
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
          <div class="field" v-if="showMonsterIcon">
            <label class="field-label">图标</label>
            <el-select v-model="formData.icon" size="default" @change="updateCard" clearable placeholder="无" style="width: 100%">
              <el-option label="装备" value="equip" />
              <el-option label="场地" value="field" />
              <el-option label="速攻" value="quick-play" />
              <el-option label="仪式" value="ritual" />
              <el-option label="永续" value="continuous" />
              <el-option label="反击" value="counter" />
            </el-select>
          </div>

          <!-- 星级 / 阶级 -->
          <div class="field" v-if="showLevel || showRank">
            <label class="field-label">{{ showRank ? '阶级' : '星级' }}</label>
            <el-input-number v-model="formData.level" :min="0" :max="13" size="default" @change="updateCard" />
          </div>

          <!-- 灵摆刻度 -->
          <div class="field" v-if="showPendulumScale">
            <label class="field-label">灵摆刻度</label>
            <el-input-number v-model="formData.pendulumScale" :min="0" :max="13" size="default" @change="updateCard" />
          </div>

          <!-- 种族 / 类型 -->
          <div class="field" v-if="showMonsterTypeText">
            <label class="field-label">种族</label>
            <el-input v-model="formData.monsterType" size="default" @input="updateCard" placeholder="例：龙/通常" />
          </div>

          <!-- ATK / DEF -->
          <div class="field-row" v-if="showAtk || showDef">
            <div class="field field-half" v-if="showAtk">
              <label class="field-label">ATK</label>
              <el-input-number v-model="formData.atk" :min="-2" size="default" @change="updateCard" style="width: 100%" />
            </div>
            <div class="field field-half" v-if="showDef">
              <label class="field-label">DEF</label>
              <el-input-number v-model="formData.def" :min="-2" size="default" @change="updateCard" style="width: 100%" />
            </div>
          </div>

          <!-- MAX ATK -->
          <div class="field" v-if="showMaximumAtk">
            <label class="field-label">MAX ATK</label>
            <el-input-number v-model="formData.maximumAtk" :min="0" size="default" @change="updateCard" />
          </div>

          <!-- ATK/DEF 栏 -->
          <div class="field" v-if="showAtkBar">
            <label class="field-label">ATK/DEF栏</label>
            <el-switch v-model="formData.atkBar" @change="updateCard" />
          </div>

          <!-- 连接箭头 -->
          <div class="field" v-if="showLinkArrows">
            <label class="field-label">连接标记</label>
            <div class="arrow-grid">
              <div
                v-for="(arrow, i) in arrowDirections"
                :key="arrow.value"
                class="arrow-item"
                :class="{ active: formData.arrowList.includes(arrow.value) }"
                @click="toggleArrow(arrow.value)"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" class="arrow-svg" :style="{ transform: 'rotate(' + arrow.rotate + 'deg)' }">
                  <polygon points="12,2 18,10 14,10 14,18 10,18 10,10 6,10" fill="currentColor" />
                </svg>
                <span class="arrow-label">{{ arrow.label }}</span>
              </div>
            </div>
          </div>

          <!-- 灵摆描述 -->
          <div class="field" v-if="showPendulumDesc">
            <label class="field-label">灵摆描述</label>
            <el-input
              v-model="formData.pendulumDescription"
              type="textarea"
              :rows="2"
              size="default"
              @input="updateCard"
              placeholder="输入灵摆效果描述"
            />
          </div>

          <!-- 效果描述 -->
          <div class="field" v-if="showDesc">
            <label class="field-label">效果描述</label>
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              size="default"
              @input="updateCard"
              placeholder="输入卡片效果描述"
            />
          </div>

          <!-- 字号 / 字重 -->
          <div class="field-row" v-if="showDesc">
            <div class="field field-half">
              <label class="field-label">字号</label>
              <el-slider v-model="formData.descriptionZoom" :min="0.5" :max="2" :step="0.05" @change="updateCard" />
            </div>
            <div class="field field-half">
              <label class="field-label">字重</label>
              <el-slider v-model="formData.descriptionWeight" :min="0" :max="10" @change="updateCard" />
            </div>
          </div>

          <!-- 描述格式 -->
          <div class="field" v-if="showDesc">
            <label class="field-label">描述格式</label>
            <div class="checkbox-group">
              <el-checkbox v-model="formData.firstLineCompress" @change="updateCard">首行压缩</el-checkbox>
              <el-checkbox v-model="formData.descriptionAlign" @change="updateCard">居中</el-checkbox>
            </div>
          </div>

          <!-- 高级：卡包 / 密码 -->
          <div class="field-row" v-if="showPackage || showPassword">
            <div class="field field-half" v-if="showPackage">
              <label class="field-label">卡包</label>
              <el-input v-model="formData.package" size="default" @input="updateCard" placeholder="例：SD25-SC001" />
            </div>
            <div class="field field-half" v-if="showPassword">
              <label class="field-label">密码</label>
              <el-input v-model="formData.password" size="default" @input="updateCard" placeholder="8位数字" />
            </div>
          </div>

          <!-- 版权 / 罕贵 -->
          <div class="field-row" v-if="showCopyright || showRare">
            <div class="field field-half" v-if="showCopyright">
              <label class="field-label">版权</label>
              <el-select v-model="formData.copyright" size="default" @change="updateCard" clearable placeholder="无" style="width: 100%">
                <el-option label="OCG" value="ocg" />
              </el-select>
            </div>
            <div class="field field-half" v-if="showRare">
              <label class="field-label">罕贵</label>
              <el-select v-model="formData.rare" size="default" @change="updateCard" clearable placeholder="无" style="width: 100%">
                <el-option label="HR" value="hr" />
                <el-option label="SER" value="ser" />
                <el-option label="GSER" value="gser" />
                <el-option label="PSER" value="pser" />
                <el-option label="UR" value="ur" />
                <el-option label="SR" value="sr" />
                <el-option label="R" value="r" />
                <el-option label="N" value="n" />
                <el-option label="NPR" value="npr" />
              </el-select>
            </div>
          </div>

          <!-- 防伪 -->
          <div class="field" v-if="showLaser">
            <label class="field-label">防伪标</label>
            <el-select v-model="formData.laser" size="default" @change="updateCard" clearable placeholder="无" style="width: 100%">
              <el-option label="金标" value="laser-gold" />
              <el-option label="银标" value="laser-silver" />
            </el-select>
          </div>

          <!-- 开关组 -->
          <div class="field">
            <label class="field-label">卡片外观</label>
            <div class="switch-group">
              <div class="switch-item" v-if="showTwentieth">
                <el-switch v-model="formData.twentieth" @change="updateCard" />
                <span>20周年</span>
              </div>
              <div class="switch-item" v-if="showLegend">
                <el-switch v-model="formData.legend" @change="updateCard" />
                <span>传说卡</span>
              </div>
              <div class="switch-item" v-if="showRadius">
                <el-switch v-model="formData.radius" @change="updateCard" />
                <span>圆角</span>
              </div>
            </div>
          </div>

          <!-- 卡背特殊参数 -->
          <template v-if="isYugiohBack">
            <div class="field">
              <label class="field-label">卡背类型</label>
              <el-select v-model="formData.type" size="default" @change="updateCard" style="width: 100%">
                <el-option label="通常" value="normal" />
              </el-select>
            </div>
            <div class="field">
              <label class="field-label">Logo</label>
              <el-select v-model="formData.logo" size="default" @change="updateCard" clearable placeholder="无" style="width: 100%">
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
          <div class="field" v-if="isFieldCenter">
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
  RefreshLeft,
  RefreshRight,
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

const fontOptions = [
  { label: '系统默认', value: '' },
  { label: '细隶书简', value: 'xlsj' },
  { label: '细隶书繁', value: 'xlsf' },
  { label: '华康隶书', value: 'hklsw7' },
  { label: '楷体', value: 'kt' },
];

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
];

const attributeOptions = [
  { label: '暗', value: 'dark' },
  { label: '光', value: 'light' },
  { label: '地', value: 'earth' },
  { label: '水', value: 'water' },
  { label: '炎', value: 'fire' },
  { label: '风', value: 'wind' },
  { label: '神', value: 'divine' },
];

const formData = reactive({ ...yugiohDemo, scale: 0.5 });
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
const showLevel = computed(() => (isYugioh.value && formData.type === 'monster' && ['normal', 'effect', 'ritual', 'fusion', 'synchro', 'token'].includes(formData.cardType)) || (isRushDuel.value && formData.type === 'monster') || (isYugiohSeries2.value && formData.type === 'monster'));
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
const showTwentieth = computed(() => isYugioh.value);
const showLegend = computed(() => isRushDuel.value);
const showRadius = computed(() => !isFieldCenter.value);
const showImage = computed(() => !isYugiohBack.value && !isFieldCenter.value);
const showLinkArrows = computed(() => isYugioh.value && formData.type === 'monster' && formData.cardType === 'link');

const imageUrl = ref('');

const arrowDirections = [
  { label: '上', value: 1, rotate: 0 },
  { label: '右上', value: 2, rotate: 45 },
  { label: '右', value: 3, rotate: 90 },
  { label: '右下', value: 4, rotate: 135 },
  { label: '下', value: 5, rotate: 180 },
  { label: '左下', value: 6, rotate: 225 },
  { label: '左', value: 7, rotate: 270 },
  { label: '左上', value: 8, rotate: 315 },
];

onMounted(() => {
  changeCard(form.card);
});

onBeforeUnmount(() => {
  cardLeaf.value?.leafer.destroy();
});

const getCardClass = (cardType) => {
  switch (cardType) {
    case 'yugioh': return YugiohCard;
    case 'rush-duel': return RushDuelCard;
    case 'yugioh-back': return YugiohBackCard;
    case 'field-center': return FieldCenterCard;
    case 'yugioh-series-2': return YugiohSeries2Card;
    default: return YugiohCard;
  }
};

const getCardDemo = (cardType) => {
  switch (cardType) {
    case 'yugioh': return { ...yugiohDemo };
    case 'rush-duel': return { ...rushDuelDemo };
    case 'yugioh-back': return { ...yugiohBackDemo };
    case 'field-center': return { ...fieldCenterDemo };
    case 'yugioh-series-2': return { ...yugiohSeries2Demo };
    default: return { ...yugiohDemo };
  }
};

const changeCard = (cardType) => {
  form.card = cardType;
  cardLeaf.value?.leafer.destroy();
  const Card = getCardClass(cardType);
  const demo = getCardDemo(cardType);
  demo.scale = 0.5; // 默认缩小到 50% 以便查看完整卡片

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, demo);

  cardLeaf.value = new Card({
    view: card.value,
    data: demo,
    resourcePath: process.env.NODE_ENV === 'production'
      ? 'https://raw.githubusercontent.com/kooriookami/yugioh-card/refs/heads/master/src/assets/yugioh-card'
      : 'src/assets/yugioh-card',
  });
  jsonData.value = JSON.stringify(demo, null, 2);
};

const setFont = (font) => {
  formData.font = font;
  // 字体简繁联动
  if (font === 'xlsj' || font === 'hklsw7') {
    formData.language = 'sc';
  } else if (font === 'xlsf') {
    formData.language = 'tc';
  }
  updateCard();
};

const setCardType = (type) => {
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
  if (cardLeaf.value) {
    cardLeaf.value.setData({ ...formData });
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
  cardLeaf.value.leafer.export('yugioh-card.png', {
    screenshot: true,
    pixelRatio: devicePixelRatio,
  });
};

const zoomIn = () => {
  formData.scale = Math.min(2, (formData.scale || 0.5) + 0.1);
  updateCard();
};

const zoomOut = () => {
  formData.scale = Math.max(0.3, (formData.scale || 0.5) - 0.1);
  updateCard();
};

const resetZoom = () => {
  formData.scale = 0.5;
  updateCard();
};

// 图片上传
const onFileUpload = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
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
};

// 连接箭头
const toggleArrow = (val) => {
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

// JSON 双向绑定（加防抖防止循环更新）
let syncingFromJson = false;
watch(() => jsonData.value, () => {
  if (syncingFromJson) return;
  try {
    const parsed = JSON.parse(jsonData.value);
    syncingFromJson = true;
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, parsed);
    if (cardLeaf.value) {
      cardLeaf.value.setData(parsed);
    }
    syncingFromJson = false;
  } catch (e) {
    syncingFromJson = false;
  }
});
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

// 字段（标签在上）
.field {
  margin-bottom: 14px;

  .field-label {
    display: block;
    font-size: 12px;
    color: #606266;
    margin-bottom: 6px;
    font-weight: 500;
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

  .checkbox-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 13px;
  }

  .switch-group {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .switch-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #606266;
    }
  }
}

// 两列布局
.field-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;

  .field {
    flex: 1;
    margin-bottom: 0;
  }
}

// 单选按钮组
.seg-group {
  display: flex;
  gap: 4px;
  width: 100%;

  &.seg-group-wrap {
    flex-wrap: wrap;
  }

  &.seg-group-3 {
    .seg-item {
      flex: 1;
    }
  }

  .seg-item {
    flex: none;
    padding: 6px 12px;
    font-size: 13px;
    color: #606266;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    &:hover {
      color: var(--el-color-primary);
      border-color: #c6e2ff;
    }

    &.active {
      background: var(--el-color-primary);
      color: #fff;
      border-color: var(--el-color-primary);
      box-shadow: 0 1px 2px rgba(64, 158, 255, 0.3);
    }
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

// 连接箭头网格
.arrow-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;

  .arrow-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 2px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
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
      box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
    }

    .arrow-svg {
      width: 20px;
      height: 20px;
    }

    .arrow-label {
      font-size: 10px;
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