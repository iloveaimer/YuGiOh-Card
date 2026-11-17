<template>
  <div class="yugioh-card-container">
    <div class="main-row">
      <!-- 左侧：卡片预览 -->
      <div class="card-preview">
        <div class="card-canvas">
          <div ref="card" class="card-view" />
        </div>
        <div class="preview-toolbar">
          <el-button-group>
            <el-tooltip :content="t('zoomOut')" placement="bottom">
              <el-button size="small" :icon="ZoomOut" @click="zoomOut" />
            </el-tooltip>
            <el-tooltip :content="t('zoomIn')" placement="bottom">
              <el-button size="small" :icon="ZoomIn" @click="zoomIn" />
            </el-tooltip>
            <el-tooltip :content="t('resetZoom')" placement="bottom">
              <el-button size="small" :icon="RefreshRight" @click="resetZoom" />
            </el-tooltip>
          </el-button-group>
          <div class="zoom-text">{{ Math.round(formData.scale * 100) }}%</div>
          <div class="toolbar-spacer" />
          <el-tooltip :content="t('randomTip')" placement="bottom">
            <el-button
              size="small"
              :icon="Coin"
              :loading="randomLoading"
              @click="randomGenerate"
            >
              {{ t('randomOne') }}
            </el-button>
          </el-tooltip>
          <el-tooltip :content="t('phoneticTip')" placement="bottom">
            <el-button size="small" :icon="Reading" @click="autoPhonetic">{{ t('phonetic') }}</el-button>
          </el-tooltip>
          <el-tooltip :content="t('importTip')" placement="bottom">
            <el-button size="small" :icon="Upload" @click="importData">{{ t('import') }}</el-button>
          </el-tooltip>
          <el-tooltip :content="t('exportTip')" placement="bottom">
            <el-button size="small" :icon="Download" @click="exportData">{{ t('export') }}</el-button>
          </el-tooltip>
          <el-tooltip :content="t('batchExportTip')" placement="bottom">
            <el-button size="small" :icon="Files" :loading="batchLoading" @click="batchExport">{{ t('batchExport') }}</el-button>
          </el-tooltip>
          <input ref="batchInput" type="file" accept="application/json" multiple hidden @change="onBatchFiles" />
          <el-tooltip :content="t('resetTip')" placement="bottom">
            <el-button size="small" :icon="RefreshLeft" @click="resetCard">{{ t('reset') }}</el-button>
          </el-tooltip>
          <el-select
            v-model="exportScale"
            size="small"
            style="width: 58px"
            :title="t('exportScaleTitle')"
          >
            <el-option :value="0.5" label="0.5x" />
            <el-option :value="1" label="1x" />
            <el-option :value="2" label="2x" />
            <el-option :value="3" label="3x" />
            <el-option :value="4" label="4x" />
            <el-option :value="5" label="5x" />
          </el-select>
          <el-button
            size="small"
            type="primary"
            :icon="PictureFilled"
            @click="exportImage"
          >
            {{ t('exportImage') }}
          </el-button>
        </div>
      </div>

      <!-- 右侧：参数面板 -->
      <div class="param-panel">
        <!-- 顶部：标题 -->
        <div class="param-header">
          <div class="param-header-row">
            <h2 class="param-title">{{ t('title') }} <span class="version-tag">v{{ version }}</span></h2>
            <el-dropdown trigger="click" @command="onUiLangChange">
              <el-button size="small" text>
                <el-icon style="margin-right: 2px;">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <!-- 地球+经纬线，国际通用语言切换图标 -->
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <ellipse
                      cx="12"
                      cy="12"
                      rx="4"
                      ry="9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <line
                      x1="3"
                      y1="12"
                      x2="21"
                      y2="12"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M3 12 Q12 6 21 12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M3 12 Q12 18 21 12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                </el-icon>
                {{ uiLocale === 'zh-CN' ? '简体中文' : uiLocale === 'ja-JP' ? '日本語' : 'EN' }}
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-CN" :disabled="uiLocale === 'zh-CN'">简体中文</el-dropdown-item>
                  <el-dropdown-item command="en-US" :disabled="uiLocale === 'en-US'">English</el-dropdown-item>
                  <el-dropdown-item command="ja-JP" :disabled="uiLocale === 'ja-JP'">日本語</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <p class="param-desc">{{ t('desc') }}</p>
        </div>

        <!-- 顶部：卡片类型切换 -->
        <div class="card-type-bar">
          <div
            v-for="opt in cardTypeOptions"
            :key="opt.value"
            class="card-type-item"
            :class="{ active: form.card === opt.value }"
            role="button"
            tabindex="0"
            :aria-pressed="form.card === opt.value"
            @click="changeCard(opt.value)"
            @keydown.enter.prevent="changeCard(opt.value)"
            @keydown.space.prevent="changeCard(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>

        <!-- 表单主体 -->
        <div class="form-scroll">
          <div class="form-inner">
            <!-- 语言 -->
            <div class="field">
              <label class="field-label">{{ t('language') }}</label>
              <el-select
                v-model="formData.language"
                size="default"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option :label="t('langSC')" value="sc" />
                <el-option :label="t('langTC')" value="tc" />
                <el-option :label="t('langJP')" value="jp" />
                <el-option :label="t('langKR')" value="kr" />
                <el-option :label="t('langEN')" value="en" />
                <el-option :label="t('langAstral')" value="astral" />
              </el-select>
            </div>

            <!-- 字体 -->
            <div v-if="showFontSelect" class="field">
              <label class="field-label">{{ t('font') }}</label>
              <el-select
                v-model="formData.font"
                :placeholder="t(fontDefaultLabelKey)"
                size="default"
                style="width: 100%"
                @change="setFont"
              >
                <el-option :label="t(fontDefaultLabelKey)" value="" />
                <template v-if="isSC">
                  <el-option :label="t('fontCustom1')" value="custom1" />
                  <el-option :label="t('fontCustom2')" value="custom2" />
                  <el-option :label="t('fontXlsj')" value="xlsj" />
                  <el-option :label="t('fontFzlb')" value="fzlb" />
                  <el-option :label="t('fontHklsw7')" value="hklsw7" />
                  <el-option :label="t('fontKt')" value="kt" />
                </template>
                <template v-if="isTC">
                  <el-option :label="t('fontCustom2')" value="custom2" />
                  <el-option :label="t('fontXlsf')" value="xlsf" />
                  <el-option :label="t('fontHklsw5')" value="hklsw5" />
                  <el-option :label="t('fontHktfw5')" value="hktfw5" />
                </template>
                <template v-if="isJP">
                  <el-option :label="t('fontDfgls4')" value="dfgls4" />
                  <el-option :label="t('fontDfgls5')" value="dfgls5" />
                  <el-option :label="t('fontRodin')" value="rodin" />
                </template>
                <el-option v-if="isYugioh" :label="t('customFont')" value="custom" />
              </el-select>
            </div>

            <!-- 自定义字体（选中「自定义字体」后展开） -->
            <div v-if="isYugioh && formData.font === 'custom'" class="field field-block">
              <div class="custom-font-list">
                <div v-for="slot in CUSTOM_FONT_SLOTS" :key="slot" class="custom-font-row">
                  <span class="custom-font-label">{{ t(fontSlotLabelKeys[slot]) }}</span>
                  <span class="custom-font-name" :class="{ empty: !customFonts[slot] }" :title="customFonts[slot]?.fileName">
                    {{ customFonts[slot]?.fileName || t('fontSlotEmpty') }}
                  </span>
                  <div class="custom-font-btns">
                    <el-button size="small" @click="importFontSlot(slot)">{{ t('fontImport') }}</el-button>
                    <el-button
                      size="small"
                      text
                      type="danger"
                      :icon="Close"
                      :class="{ 'custom-font-remove': true, 'invisible': !customFonts[slot] }"
                      @click="removeFontSlot(slot)"
                    />
                  </div>
                </div>
                <div class="custom-font-hint">{{ t('fontFormatHint') }}</div>
              </div>
            </div>

            <!-- 卡名 -->
            <div class="field">
              <label class="field-label">{{ t('name') }}</label>
              <el-input
                v-model="formData.name"
                size="default"
                :placeholder="t('namePlaceholder')"
                clearable
                @input="scheduleUpdate()"
              />
            </div>

            <!-- 卡名颜色 -->
            <div class="field">
              <label class="field-label">{{ t('nameColor') }}</label>
              <div class="color-row">
                <el-color-picker v-model="formData.color" size="default" @change="updateCard" />
                <el-checkbox
                  v-if="showNameGradient"
                  v-model="formData.gradient"
                  style="margin-left: 8px"
                  @change="updateCard"
                >
                  {{ t('gradient') }}
                </el-checkbox>
                <span class="color-tip">{{ t('colorTip') }}</span>
              </div>
            </div>

            <!-- 渐变色 -->
            <template v-if="showNameGradient && formData.gradient">
              <div class="field-row">
                <div class="field field-half">
                  <label class="field-label">{{ t('gradientColor1') }}</label>
                  <el-color-picker v-model="formData.gradientColor1" size="default" @change="updateCard" />
                </div>
                <div class="field field-half">
                  <label class="field-label">{{ t('gradientColor2') }}</label>
                  <el-color-picker v-model="formData.gradientColor2" size="default" @change="updateCard" />
                </div>
              </div>
            </template>

            <!-- 对齐：el-radio-group 与参考站一致 -->
            <div v-if="showNameAlign" class="field">
              <label class="field-label">{{ t('nameAlign') }}</label>
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
              <label class="field-label">{{ t('type') }}</label>
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

            <!-- 属性：下拉选择（8项太多，radio-group放不下） -->
            <div v-if="showAttribute" class="field">
              <label class="field-label">{{ t('attribute') }}</label>
              <el-select
                v-model="formData.attribute"
                size="default"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option
                  v-for="opt in attributeOptions"
                  :key="opt.value || 'none'"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>

            <!-- 卡图（图片上传/URL输入） -->
            <div v-if="showImage" class="field field-block">
              <label class="field-label">{{ t('image') }}</label>
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
                    <el-button size="small">{{ t('chooseImage') }}</el-button>
                  </el-upload>
                  <el-input
                    v-model="imageUrl"
                    size="small"
                    :placeholder="t('imageUrlPlaceholder')"
                    clearable
                    style="flex: 1; min-width: 0"
                    @keyup.enter="setImageUrl"
                  />
                  <el-button size="small" :icon="Link" @click="setImageUrl">{{ t('confirm') }}</el-button>
                </div>
              </div>
            </div>

            <!-- 怪兽类型 -->
            <div v-if="showMonsterType" class="field">
              <label class="field-label">{{ t('cardType') }}</label>
              <el-select
                v-model="formData.cardType"
                size="default"
                style="width: 100%"
                @change="onCardTypeChange"
              >
                <el-option :label="t('normal')" value="normal" />
                <el-option :label="t('effect')" value="effect" />
                <el-option :label="t('ritual')" value="ritual" />
                <el-option :label="t('fusion')" value="fusion" />
                <el-option :label="t('synchro')" value="synchro" />
                <el-option :label="t('xyz')" value="xyz" />
                <el-option :label="t('link')" value="link" />
              </el-select>
            </div>

            <!-- 灵摆类型 -->
            <div v-if="showPendulumType" class="field">
              <label class="field-label">{{ t('pendulumType') }}</label>
              <el-select
                v-model="formData.pendulumType"
                size="default"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option :label="t('normalPendulum')" value="normal-pendulum" />
                <el-option :label="t('effectPendulum')" value="effect-pendulum" />
                <el-option :label="t('ritualPendulum')" value="ritual-pendulum" />
                <el-option :label="t('fusionPendulum')" value="fusion-pendulum" />
                <el-option :label="t('synchroPendulum')" value="synchro-pendulum" />
                <el-option :label="t('xyzPendulum')" value="xyz-pendulum" />
                <el-option :label="t('linkPendulum')" value="link-pendulum" />
              </el-select>
            </div>

            <!-- 怪兽图标 -->
            <div v-if="showMonsterIcon" class="field">
              <label class="field-label">{{ t('icon') }}</label>
              <el-select
                v-model="formData.icon"
                size="default"
                clearable
                :placeholder="t('none')"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option :label="t('equip')" value="equip" />
                <el-option :label="t('field')" value="field" />
                <el-option :label="t('quickPlay')" value="quick-play" />
                <el-option :label="t('ritual')" value="ritual" />
                <el-option :label="t('continuous')" value="continuous" />
                <el-option :label="t('counter')" value="counter" />
              </el-select>
            </div>

            <!-- 星级 / 阶级 -->
            <div v-if="showLevel || showRank" class="field">
              <label class="field-label">{{ showRank ? t('rank') : t('level') }}</label>
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
              <label class="field-label">{{ t('pendulumScale') }}</label>
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
              <label class="field-label">{{ t('race') }}</label>
              <el-input
                v-model="formData.monsterType"
                size="default"
                :placeholder="t('racePlaceholder')"
                clearable
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
              <label class="field-label">{{ t('atkBar') }}</label>
              <el-switch v-model="formData.atkBar" @change="updateCard" />
            </div>

            <!-- 连接箭头 -->
            <div v-if="showLinkArrows" class="field field-block">
              <label class="field-label">{{ t('linkMarker') }}</label>
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
                  :role="cell.value ? 'button' : undefined"
                  :tabindex="cell.value ? 0 : -1"
                  :aria-pressed="cell.value ? formData.arrowList.includes(cell.value) : undefined"
                  :aria-label="cell.value ? `${t('linkMarker')} ${cell.value}` : undefined"
                  @click="cell.value ? toggleArrow(cell.value) : undefined"
                  @keydown.enter.prevent="cell.value ? toggleArrow(cell.value) : undefined"
                  @keydown.space.prevent="cell.value ? toggleArrow(cell.value) : undefined"
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
              <label class="field-label">{{ t('pendulumDesc') }}</label>
              <el-input
                v-model="formData.pendulumDescription"
                type="textarea"
                :rows="2"
                size="default"
                :placeholder="t('pendulumDescPlaceholder')"
                clearable
                @input="scheduleUpdate()"
              />
            </div>

            <!-- 效果描述 (含 inline 开关) -->
            <div v-if="showDesc" class="field field-effect">
              <div class="effect-header">
                <label class="field-label">{{ t('effect') }}</label>
                <div class="switch-group">
                  <div class="switch-item">
                    <el-switch v-model="formData.firstLineCompress" size="small" @change="updateCard" />
                    <span>{{ t('firstLineCompress') }}</span>
                    <el-switch v-model="formData.descriptionAlign" size="small" @change="updateCard" />
                    <span>{{ t('textCenter') }}</span>
                  </div>
                </div>
              </div>
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                size="default"
                :placeholder="t('effectPlaceholder')"
                clearable
                @input="scheduleUpdate()"
              />
            </div>

            <!-- 字号 / 字重 -->
            <div v-if="showDesc" class="field field-slider">
              <label class="field-label">{{ t('fontSize') }}</label>
              <div class="slider-wrap">
                <el-slider
                  v-model="formData.descriptionZoom"
                  :min="0.5"
                  :max="1.5"
                  :step="0.02"
                  @input="onSliderInput"
                  @change="updateCard"
                />
                <span class="slider-val">{{ formData.descriptionZoom.toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="showDesc" class="field field-slider">
              <label class="field-label">{{ t('fontWeight') }}</label>
              <div class="slider-wrap">
                <el-slider
                  v-model="formData.descriptionWeight"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  @input="onSliderInput"
                  @change="updateCard"
                />
                <span class="slider-val">{{ formData.descriptionWeight }}</span>
              </div>
            </div>

            <!-- 描述格式 (已合并到效果描述里) -->

            <!-- 高级：卡包 / 密码 -->
            <!-- 卡包 / 密码：参考参考站，卡包独占一行，密码独占一行且带搜索按钮 -->
            <div v-if="showPackage" class="field">
              <label class="field-label">{{ t('package') }}</label>
              <el-input
                v-model="formData.package"
                size="default"
                :placeholder="t('packagePlaceholder')"
                clearable
                @input="scheduleUpdate()"
              />
            </div>
            <div v-if="showPassword" class="field">
              <label class="field-label">{{ t('password') }}</label>
              <div class="password-row">
                <el-input
                  v-model="formData.password"
                  size="default"
                  :placeholder="t('passwordPlaceholder')"
                  clearable
                  @input="scheduleUpdate()"
                  @keyup.enter="searchPassword"
                />
                <el-button
                  type="primary"
                  size="default"
                  :loading="searchLoading"
                  @click="searchPassword"
                >
                  {{ t('search') }}
                </el-button>
              </div>
            </div>
            <div v-if="showPassword" class="field">
              <label class="field-label">{{ t('translatedName') }}</label>
              <el-select
                v-model="nameSource"
                size="small"
                style="width: 100%"
              >
                <el-option :label="t('nameSourceCN')" value="cn" />
                <el-option :label="t('nameSourceSC')" value="sc" />
                <el-option :label="t('nameSourceMD')" value="md" />
                <el-option :label="t('nameSourceNWBBS')" value="nwbbs" />
                <el-option :label="t('nameSourceCNOCG')" value="cnocg" />
              </el-select>
            </div>
            <div v-if="showPassword" class="field">
              <label class="field-label">{{ t('nameSearch') }}</label>
              <div class="password-row">
                <el-input
                  v-model="nameSearchKeyword"
                  size="default"
                  :placeholder="t('nameSearchPlaceholder')"
                  clearable
                  @keyup.enter="searchByName"
                />
                <el-button
                  type="primary"
                  size="default"
                  :loading="nameSearchLoading"
                  @click="searchByName"
                >
                  {{ t('search') }}
                </el-button>
              </div>
            </div>

            <!-- 版权 / 罕贵 -->
            <div v-if="showCopyright" class="field">
              <label class="field-label">{{ t('copyright') }}</label>
              <el-select
                v-model="formData.copyright"
                size="default"
                clearable
                :placeholder="t('none')"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option :label="t('copyrightEN')" value="en" />
                <el-option :label="t('copyrightJP')" value="jp" />
                <el-option :label="t('copyrightSC')" value="sc" />
              </el-select>
            </div>
            <div v-if="showRare" class="field">
              <label class="field-label">{{ t('rare') }}</label>
              <el-select
                v-model="formData.rare"
                size="default"
                clearable
                :placeholder="t('none')"
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
              <label class="field-label">{{ t('laser') }}</label>
              <el-select
                v-model="formData.laser"
                size="default"
                clearable
                :placeholder="t('none')"
                style="width: 100%"
                @change="updateCard"
              >
                <el-option :label="t('laser1')" value="laser1" />
                <el-option :label="t('laser2')" value="laser2" />
                <el-option :label="t('laser3')" value="laser3" />
                <el-option :label="t('laser4')" value="laser4" />
              </el-select>
            </div>



            <!-- 周年 -->
            <div v-if="showTwentieth" class="field">
              <label class="field-label">{{ t('twentieth') }}</label>
              <el-select
                v-model="formData.twentieth"
                size="default"
                clearable
                :placeholder="t('none')"
                style="width: 100%"
                @change="updateCard"
              >
                <!-- 25周年需先放入 twentyfive.png，缺素材时选中不显示任何图案 -->
                <el-option :label="t('twentieth20')" value="twentieth" />
              </el-select>
            </div>

            <!-- 圆角 / 出框：参考参考站布局，单独两项 -->
            <div v-if="showRadius" class="field">
              <label class="field-label">{{ t('radius') }}</label>
              <el-switch v-model="formData.radius" @change="updateCard" />
            </div>
            <div v-if="showLegend" class="field">
              <label class="field-label">{{ t('legend') }}</label>
              <el-switch v-model="formData.legend" @change="updateCard" />
            </div>

            <!-- 卡背特殊参数 -->
            <template v-if="isYugiohBack">
              <div class="field">
                <label class="field-label">{{ t('backType') }}</label>
                <el-select
                  v-model="formData.type"
                  size="default"
                  style="width: 100%"
                  @change="updateCard"
                >
                  <el-option :label="t('normal')" value="normal" />
                </el-select>
              </div>
              <div class="field">
                <label class="field-label">{{ t('logo') }}</label>
                <el-select
                  v-model="formData.logo"
                  size="default"
                  clearable
                  :placeholder="t('none')"
                  style="width: 100%"
                  @change="updateCard"
                >
                  <el-option label="OCG" value="ocg" />
                  <el-option label="TCG" value="tcg" />
                  <el-option label="RD" value="rd" />
                </el-select>
              </div>
              <div class="field">
                <label class="field-label">{{ t('backOptions') }}</label>
                <div class="switch-group">
                  <div class="switch-item">
                    <el-switch v-model="formData.konami" @change="updateCard" />
                    <span>{{ t('konami') }}</span>
                  </div>
                  <div class="switch-item">
                    <el-switch v-model="formData.register" @change="updateCard" />
                    <span>{{ t('register') }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 场地卡特殊参数 -->
            <div v-if="isFieldCenter" class="field">
              <label class="field-label">{{ t('fieldOptions') }}</label>
              <div class="switch-group">
                <div class="switch-item">
                  <el-switch v-model="formData.cardBack" @change="updateCard" />
                  <span>{{ t('backMode') }}</span>
                </div>
              </div>
            </div>

            <!-- JSON 编辑器 -->
            <details class="json-section" @toggle="jsonEditorOpen = $event.target.open">
              <summary>{{ t('advanced') }}</summary>
              <json-editor-vue
                v-if="jsonEditorOpen"
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
    <footer class="site-footer">
      Powered by <a href="https://ygocdb.com/" target="_blank" rel="noopener">ygocdb.com</a> · <a href="https://ygoprodeck.com/" target="_blank" rel="noopener">ygoprodeck.com</a> · <a href="http://www.ygotoken.com/" target="_blank" rel="noopener">ygotoken.com</a> · <a href="https://github.com/iloveaimer/YuGiOh-Card" target="_blank" rel="noopener">GitHub</a>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowDown,
  Close,
  Coin,
  Download,
  Files,
  Link,
  PictureFilled,
  Reading,
  RefreshLeft,
  RefreshRight,
  Upload,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue';
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toRaw, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { FieldCenterCard, RushDuelCard, YugiohBackCard, YugiohCard, YugiohSeries2Card } from 'yugioh-card';
import { t, setLocale, useUiLocale } from '@/i18n';
import { version } from '../../package.json';
import fieldCenterDemo from '@/assets/demo/field-center-demo';
import rushDuelDemo from '@/assets/demo/rush-duel-demo';
import yugiohBackDemo from '@/assets/demo/yugioh-back-demo';
import yugiohDemo from '@/assets/demo/yugioh-demo';
import yugiohSeries2Demo from '@/assets/demo/yugioh-series-2-demo';
import {
  CUSTOM_FONT_SLOTS,
  CUSTOM_FONT_ACCEPT,
  importCustomFont,
  restoreCustomFont,
  removeCustomFont,
} from '@/utils/customFont';
import { isForeignCard, normalizeForeignCard } from '@/utils/card-format';
import { clampExportRatio } from '@/utils/export-size';
import { fetchJsonWithTimeout } from '@/utils/fetch-json';
import { hasRuby, toRubyText } from '@/utils/ruby';
import {
  ATTR_KEY,
  YGOPRODECK_ATTR,
  YGOPRODECK_FRAME,
  YGOPRODECK_ICON,
  YGOPRODECK_MARKERS,
  getRaceName,
  getTypeLabels,
  parseOcgType,
  toPendulumType,
} from '@/utils/ocgData';

const JsonEditorVue = defineAsyncComponent(() => import('json-editor-vue'));
const jsonEditorOpen = ref(false);

const card = ref(null);
const cardLeaf = shallowRef(null);
const exportScale = ref(3);
const uiLocale = useUiLocale();

const form = reactive({
  card: 'yugioh',
});

const onUiLangChange = lang => {
  setLocale(lang);
};

const cardTypeOptions = computed(() => [
  { label: t('cardYugioh'), value: 'yugioh' },
  { label: t('cardRushDuel'), value: 'rush-duel' },
  { label: t('cardBack'), value: 'yugioh-back' },
  { label: t('cardField'), value: 'field-center' },
  { label: t('cardSeries2'), value: 'yugioh-series-2' },
]);

const alignOptions = computed(() => [
  { label: t('alignLeft'), value: 'left' },
  { label: t('alignCenter'), value: 'center' },
  { label: t('alignRight'), value: 'right' },
]);

const attributeOptions = computed(() => [
  { label: t('attrNone'), value: '' },
  { label: t('attrDark'), value: 'dark' },
  { label: t('attrLight'), value: 'light' },
  { label: t('attrEarth'), value: 'earth' },
  { label: t('attrWater'), value: 'water' },
  { label: t('attrFire'), value: 'fire' },
  { label: t('attrWind'), value: 'wind' },
  { label: t('attrDivine'), value: 'divine' },
]);

const formData = reactive({ ...yugiohDemo, scale: 0.5, twentieth: yugiohDemo.twentieth || '' });
const jsonData = ref('');
const jsonOption = reactive({
  mainMenuBar: false,
  statusBar: false,
});

// 用户自定义字体（三槽位：卡名/正文/数值），独立于 formData（不进 JSON 编辑器/导出）
const customFonts = reactive({
  name: null,   // { family, fileName } | null
  body: null,
  number: null,
});

// 组装传给渲染层的数据：formData + 当前自定义字体槽位映射
const buildCardData = () => {
  const cf = {};
  CUSTOM_FONT_SLOTS.forEach(slot => {
    if (customFonts[slot]) {
      cf[slot] = customFonts[slot].family;
    }
  });
  return { ...toRaw(formData), customFonts: cf };
};

// 自定义字体槽位的 i18n 文案 key
const fontSlotLabelKeys = {
  name: 'fontSlotName',
  body: 'fontSlotBody',
  number: 'fontSlotNumber',
};

const isYugioh = computed(() => form.card === 'yugioh');
const isRushDuel = computed(() => form.card === 'rush-duel');
const isYugiohBack = computed(() => form.card === 'yugioh-back');
const isFieldCenter = computed(() => form.card === 'field-center');
const isYugiohSeries2 = computed(() => form.card === 'yugioh-series-2');

const cardTypeChoices = computed(() => {
  if (isRushDuel.value) {
    return [
      { label: t('monster'), value: 'monster' },
      { label: t('spell'), value: 'spell' },
      { label: t('trap'), value: 'trap' },
    ];
  }
  return [
    { label: t('monster'), value: 'monster' },
    { label: t('spell'), value: 'spell' },
    { label: t('trap'), value: 'trap' },
    ...(isYugioh.value ? [{ label: t('pendulum'), value: 'pendulum' }] : []),
  ];
});

// 字体下拉在游戏王/2期卡类下显示
const showFontSelect = computed(() => isYugioh.value || isYugiohSeries2.value);
// 是否中文语言：内置中文字体选项仅在简/繁中文下显示
const isSC = computed(() => formData.language === 'sc');
const isTC = computed(() => formData.language === 'tc');
// 是否日文：日文内置字体选项仅在日文下显示
const isJP = computed(() => formData.language === 'jp');
// 「系统默认」选项的 label 随卡片语言动态变化，准确展示当前语言的默认字体
const fontDefaultLabelKey = computed(() => {
  const map = {
    sc: 'fontDefaultSc',
    tc: 'fontDefaultTc',
    en: 'fontDefaultEn',
    jp: 'fontDefaultJp',
    kr: 'fontDefaultKr',
    astral: 'fontDefaultAstral',
  };
  return map[formData.language] || 'fontDefault';
});
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
const showTwentieth = computed(() => isYugioh.value);

const imageUrl = ref('');
const searchLoading = ref(false);
// 回包代次：只有最新一次搜索允许写入卡片数据；加载态按并发数计数，由最后一个完成者关闭。
let cardLoadToken = 0;
let searchLoadingCount = 0;
const startSearchLoading = () => {
  searchLoadingCount += 1;
  searchLoading.value = true;
};
const stopSearchLoading = () => {
  searchLoadingCount = Math.max(0, searchLoadingCount - 1);
  searchLoading.value = searchLoadingCount > 0;
};
const randomLoading = ref(false);
const nameSearchKeyword = ref('');
const nameSearchLoading = ref(false);
const cardCid = ref(null);
const nameSource = ref('cn'); // cn=YGOPro, sc=官方简中, md=Master Duel

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
// 最近一次由表单写出的 JSON 文本，用于区分「表单同步」与「用户在编辑器里改」
let jsonSnapshot = '';

// 把表单序列化写回编辑器。卡图是 base64，整段序列化按毫秒计，只在防抖回调里做一次
const setJsonText = () => {
  jsonData.value = JSON.stringify(formData, null, 2);
  jsonSnapshot = jsonData.value;
};

const scheduleUpdate = (immediate = false) => {
  if (immediate) {
    if (updateTimer) clearTimeout(updateTimer);
    setJsonText();
    cardLeaf.value?.setData(buildCardData());
    return;
  }
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    setJsonText();
    cardLeaf.value?.setData(buildCardData());
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


// 默认示例卡（青眼白龙）各语言的完整数据，切换语言时同步切换（避免中文文本用英文字体渲染乱码）
const DEFAULT_CARD_BY_LANG = {
  sc: {
    name: '青眼白龙',
    monsterType: '龙族/通常',
    description: '以高攻击力著称的传说之龙。任何对手都能将之粉碎，其破坏力不可估量。',
  },
  tc: {
    name: '青眼白龍',
    monsterType: '龍族/通常',
    description: '以高攻擊力著稱的傳說之龍。任何對手都能將之粉碎，其破壞力不可估量。',
  },
  jp: {
    name: '青眼の白龍',
    monsterType: 'ドラゴン族/通常',
    description: '高い攻撃力を誇る伝説のドラゴン。どんな相手でも粉砕する、その破壊力は計り知れない。',
  },
  en: {
    name: 'Blue-Eyes White Dragon',
    monsterType: 'Dragon/Normal',
    description: 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and lived to tell the tale.',
  },
  kr: {
    name: '푸른 눈의 백룡',
    monsterType: '드래곤족/일반',
    description: '높은 공격력을 자랑하는 전설의 드래곤. 어떤 상대든 박살내는, 그 파괴력은 이루 헤아릴 수 없다.',
  },
  astral: {
    name: 'ブルーアイズ・ホワイト・ドラゴン',
    monsterType: 'ドラゴン族/通常',
    description: '高い攻撃力を誇る伝説のドラゴン。どんな相手でも粉砕する、その破壊力は計り知れない。',
  },
};

// 语言切换：已检索到具体卡片（有有效卡密）时，自动用新语言静默重新检索，实现卡名/描述/种族随语言切换
watch(() => formData.language, lang => {
  const pwd = (formData.password || '').trim();
  // 有有效卡密：说明当前卡片来自检索，用新语言重新拉取对应数据（静默，不弹提示）
  if (/^\d{6,8}$/.test(pwd)) {
    searchPassword(true);
    return;
  }
  // 否则是默认示例卡（无有效卡密）：同步切换各语言完整数据，避免中文文本用英文字体渲染乱码
  const isDefaultName = ['青眼白龙', '青眼白龍', '青眼の白龍', 'Blue-Eyes White Dragon', '푸른 눈의 백룡', 'ブルーアイズ・ホワイト・ドラゴン'].includes(formData.name);
  if (isDefaultName && DEFAULT_CARD_BY_LANG[lang]) {
    const d = DEFAULT_CARD_BY_LANG[lang];
    formData.name = d.name;
    formData.monsterType = d.monsterType;
    formData.description = d.description;
  }
  // 切语言时，若当前字体不属于新语言的内置字体，重置为空
  // 「自定义字体」（custom）跨语言保留
  const builtinFont = formData.font;
  if (builtinFont && builtinFont !== 'custom') {
    const scFonts = ['custom1', 'custom2', 'xlsj', 'fzlb', 'hklsw7', 'kt'];
    const tcFonts = ['custom2', 'xlsf', 'hklsw5', 'hktfw5'];
    const jpFonts = ['dfgls4', 'dfgls5', 'rodin'];
    const valid =
      (lang === 'sc' && scFonts.includes(builtinFont)) ||
      (lang === 'tc' && tcFonts.includes(builtinFont)) ||
      (lang === 'jp' && jpFonts.includes(builtinFont));
    if (!valid) formData.font = '';
  }
  updateCard();
});

onMounted(async () => {
  changeCard(form.card);
  // 恢复用户自定义字体（跨会话持久化），三槽位并行加载
  await Promise.all(CUSTOM_FONT_SLOTS.map(async slot => {
    const res = await restoreCustomFont(slot);
    if (res) {
      customFonts[slot] = { family: res.family, fileName: res.fileName };
    }
  }));
  // 若当前为经典卡，用恢复的自定义字体重绘
  if (isYugioh.value && cardLeaf.value) {
    updateCard();
  }
});

onBeforeUnmount(() => {
  // 防抖定时器必须清理：卸载后回调仍会访问已 destroy 的 leafer
  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
  if (sliderFrame) {
    cancelAnimationFrame(sliderFrame);
    sliderFrame = 0;
  }
  cardLoadToken += 1;
  canvasResizeObserver?.disconnect();
  canvasResizeObserver = null;
  cardLeaf.value?.leafer.destroy();
});

// 卡类型 → 渲染类 + 示例数据；新增卡类型只需在此登记一处
const CARD_REGISTRY = {
  yugioh: { Card: YugiohCard, demo: yugiohDemo },
  'rush-duel': { Card: RushDuelCard, demo: rushDuelDemo },
  'yugioh-back': { Card: YugiohBackCard, demo: yugiohBackDemo },
  'field-center': { Card: FieldCenterCard, demo: fieldCenterDemo },
  'yugioh-series-2': { Card: YugiohSeries2Card, demo: yugiohSeries2Demo },
};

const getCardEntry = cardType => CARD_REGISTRY[cardType] || CARD_REGISTRY.yugioh;

const changeCard = cardType => {
  form.card = cardType;
  cardLeaf.value?.leafer.destroy();
  // 重置滚动位置，避免旧卡的滚动偏移导致新卡显示偏移
  if (card.value) {
    card.value.scrollTop = 0;
    card.value.scrollLeft = 0;
  }
  const { Card, demo: demoSource } = getCardEntry(cardType);
  // 拷贝一份再改，避免污染模块级示例数据
  const demo = { ...demoSource, scale: 0.5 }; // 默认缩小到 50% 以便查看完整卡片

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, demo);

  cardLeaf.value = new Card({
    view: card.value,
    data: buildCardData(),
    resourcePath: window.__YG__?.resourcePath
      ?? (import.meta.env.PROD
        ? './assets/src/assets/yugioh-card'
        : 'src/assets/yugioh-card'),
  });
  syncCardViewSize(); // 包装层匹配 canvas 尺寸，flex 自动居中
  observeCanvas(); // 监听后续异步加载导致的 canvas 尺寸变化
  setJsonText();
};


// 选择字体：只改字体并重绘（语言与字体完全解耦，互不影响）
const setFont = () => {
  updateCard();
};

// 导入自定义字体到指定槽位（卡名 name / 正文 body / 数值 number）
const importFontSlot = slot => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = CUSTOM_FONT_ACCEPT;
  input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { family, fileName } = await importCustomFont(slot, file);
      customFonts[slot] = { family, fileName };
      ElMessage.success(t('fontImportSuccess'));
      updateCard();
    } catch (err) {
      console.error(`[customFont] 导入槽位 ${slot} 失败:`, err);
      ElMessage.error(t('fontImportError'));
    }
  };
  input.click();
};

// 移除指定槽位的自定义字体
const removeFontSlot = async slot => {
  await removeCustomFont(slot);
  customFonts[slot] = null;
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
    // setData 内部会调用 draw()，而 draw() 最后一步已含 updateScale()，无需重复调用
    cardLeaf.value.setData(buildCardData());
  }
  setJsonText();
};

const resetCard = () => {
  const demo = { ...getCardEntry(form.card).demo, scale: 0.5 };
  Object.keys(formData).forEach(key => delete formData[key]);
  Object.assign(formData, demo);
  cardLeaf.value?.setData(buildCardData());
  setJsonText();
  ElMessage.success(t('resetSuccess'));
};

const exportImage = () => {
  if (!cardLeaf.value?.leafer) return;
  const name = (formData.name || '卡片').replace(/[/:*?"<>|]/g, '-');
  const leafer = cardLeaf.value.leafer;
  const pixelRatio = window.devicePixelRatio || 1;
  // 画布逻辑尺寸已按视图缩放与设备像素比折算过，倍率直接乘在此尺寸上
  const { ratio, downscaled } = clampExportRatio(leafer.width, leafer.height, exportScale.value, pixelRatio);
  leafer.export(`${name}.png`, {
    screenshot: true,
    pixelRatio: downscaled ? ratio : pixelRatio,
    scale: downscaled ? 1 : exportScale.value,
  }).then(() => {
    if (downscaled) ElMessage.warning(t('exportImageDownscaled'));
  }).catch(err => {
    // export 返回 Promise，不捕获会静默失败
    console.error('[exportImage] 导出失败:', err);
    ElMessage.error(t('exportImageError'));
  });
};

// 批量导出：读取一个或多个 JSON 文件（单张对象或数组），逐张渲染并下载 PNG。
// 每张之间留出渲染间隙，最后恢复用户当前正在编辑的卡片数据。
const batchInput = ref(null);
const batchLoading = ref(false);

const batchExport = () => {
  batchInput.value?.click();
};

const waitForRender = () => new Promise(resolve => {
  requestAnimationFrame(() => setTimeout(resolve, 150));
});

const onBatchFiles = async event => {
  const files = [...(event.target.files || [])];
  event.target.value = '';
  if (!files.length || !cardLeaf.value?.leafer) {
    return;
  }
  const snapshot = JSON.parse(JSON.stringify(toRaw(formData)));
  const baseData = getCardEntry(form.card).demo;
  batchLoading.value = true;
  let exported = 0;
  try {
    for (const file of files) {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const raw of list) {
        const data = isForeignCard(raw) ? normalizeForeignCard(raw) : raw;
        Object.keys(formData).forEach(key => delete formData[key]);
        Object.assign(formData, { ...baseData, ...data });
        cardLeaf.value.setData(buildCardData());
        await waitForRender();
        const name = (formData.name || `card-${exported + 1}`).replace(/[/:*?"<>|]/g, '-');
        await cardLeaf.value.leafer.export(`${name}.png`, {
          screenshot: true,
          pixelRatio: window.devicePixelRatio || 1,
          scale: exportScale.value,
        });
        exported += 1;
      }
    }
    ElMessage.success(`${t('batchExportDone')} ${exported}`);
  } catch (err) {
    console.error('[batchExport] 批量导出失败:', err);
    ElMessage.error(t('batchExportFail'));
  } finally {
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, snapshot);
    cardLeaf.value?.setData(buildCardData());
    setJsonText();
    batchLoading.value = false;
  }
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
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 立即 revoke 会让部分浏览器中断下载，延后释放
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  ElMessage.success(t('exportSuccess'));
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
        const parsed = JSON.parse(ev.target.result);
        // 外部工具的字段名不同，先归一化再合并；本项目导出数据走原路径
        const data = isForeignCard(parsed) ? normalizeForeignCard(parsed) : parsed;
        // 与当前卡类型的默认值合并，避免导入旧/残缺数据丢失字段
        const merged = { ...getCardEntry(form.card).demo, ...data };
        Object.keys(formData).forEach(key => delete formData[key]);
        Object.assign(formData, merged);
        if (cardLeaf.value) {
          cardLeaf.value.setData(buildCardData());
        }
        setJsonText();
        ElMessage.success(t('importSuccess'));
      } catch (err) {
        ElMessage.error(t('importError'));
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
    cardLeaf.value.setData(buildCardData());
  }
  syncCardViewSize();
};

// 排版滑杆拖动预览：每帧最多刷新一次画布，且不写 JSON 编辑器。
// 指针移动频率高于渲染帧率，逐次刷新会排队堆积成卡顿；写 JSON 又会序列化整张卡。
let sliderFrame = 0;
const onSliderInput = () => {
  if (sliderFrame) {
    return;
  }
  sliderFrame = requestAnimationFrame(() => {
    sliderFrame = 0;
    updateCanvasOnly();
  });
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

// 卡图边长上限：1200 已覆盖 5x 导出的清晰度需求，再大只会让 base64 字符串在
// 表单、JSON 编辑器、画布之间重复复制
const MAX_IMAGE_SIDE = 1200;
const MAX_ORIGINAL_BYTES = 400 * 1024;

// 读取用户上传的卡图：小图原样保留，大图缩放到上限并转 JPEG，避免几十 MB 的 base64 常驻
const readCardImage = file => new Promise((resolve, reject) => {
  if (file.size <= MAX_ORIGINAL_BYTES) {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
    return;
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext('2d');
    // JPEG 没有透明通道，先铺白底，避免透明区域变黑
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL('image/jpeg', 0.92));
  };
  image.onerror = err => {
    URL.revokeObjectURL(url);
    reject(err);
  };
  image.src = url;
});

// 图片上传
const onFileUpload = async file => {
  try {
    formData.image = await readCardImage(file.raw);
    updateCard();
  } catch {
    ElMessage.error(t('imageError'));
  }
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
  // 图片加载失败仅提示，不自动清空：网络抖动/临时失败时保留用户输入，由用户自行决定（可点移除按钮）
  ElMessage.warning(t('imageError'));
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

// ──────────────────────────────────────────────
// 随机生成（从本地全卡密列表真随机，卡密数据来自 ygotoken.com）
// ──────────────────────────────────────────────
let cardIdCache = null;

const randomGenerate = async () => {
  randomLoading.value = true;
  try {
    if (!cardIdCache) {
      cardIdCache = await fetchJsonWithTimeout('./card-ids.json');
    }
    const id = cardIdCache[Math.floor(Math.random() * cardIdCache.length)];
    formData.password = String(id);
    await searchPassword();
  } catch {
    ElMessage.error(t('randomFail'));
  } finally {
    randomLoading.value = false;
  }
};

// ──────────────────────────────────────────────
// 密码搜索：调用 ygocdb.com API 自动填充卡片数据
// ──────────────────────────────────────────────
// 构建 ygotoken 卡图 URL（三环境：DEV 代理 / HTTPS 用 weserv 桥接 / HTTP·EXE 直连）
const getYgotokenImageUrl = cid => {
  if (!cid) return '';
  if (import.meta.env.DEV) {
    // 开发环境：Vite 代理转发到 ygotoken，避免 CORS
    return `/ygotoken-img/webp/${cid}.webp`;
  }
  if (window.location.protocol === 'https:') {
    // GitHub Pages 等 HTTPS 静态托管：通过 weserv 代理桥接 HTTP 源，解决混合内容拦截
    return `https://images.weserv.nl/?url=www.ygotoken.com/images/webp/${cid}.webp`;
  }
  // EXE（file://）或 HTTP 环境：直连 ygotoken
  return `http://www.ygotoken.com/images/webp/${cid}.webp`;
};

// 加载 ygotoken 全量卡片缓存（仅用于 cid→卡图 和 补充译名）
let ygotokenCache = null;
let ygotokenCacheFailedAt = 0;
const loadYgotokenCache = async () => {
  if (ygotokenCache) return ygotokenCache;
  // 失败后 30 秒内不重复拉取全量卡表，超时后再试，避免一次瞬时故障使兜底永久失效
  if (Date.now() - ygotokenCacheFailedAt < 30000) return [];
  try {
    // ygotoken 站点仅支持 http；HTTPS 静态页无法直连（主路径 ygocdb 已提供 cid，此处仅兜底）
    const url = import.meta.env.DEV
      ? '/ygotoken-api/api/cards'
      : (window.location.protocol === 'https:'
        ? 'https://www.ygotoken.com/api/cards'
        : 'http://www.ygotoken.com/api/cards');
    ygotokenCache = await fetchJsonWithTimeout(url, {}, 20000);
    return ygotokenCache;
  } catch {
    ygotokenCacheFailedAt = Date.now();
    return [];
  }
};

// 英文卡片数据搜索：使用 ygoprodeck 公开 API（含英文名、英文描述、英文种族、卡图）
const searchPasswordEn = async (pwd, silent = false, requestToken) => {
  try {
    const result = await fetchJsonWithTimeout(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${pwd}`);
    if (requestToken !== cardLoadToken) return;
    const card = result?.data?.[0];
    if (!card) { if (!silent) ElMessage.warning(t('passwordNotFound')); return; }

    // frameType 映射主类型 + 卡类
    const [mainType, cardTypeOrPendulum] = YGOPRODECK_FRAME[card.frameType] || ['monster', 'normal'];
    formData.type = mainType;
    formData.attribute = YGOPRODECK_ATTR[card.attribute] || '';

    // 卡名：ygoprodeck 的 name 即英文名
    formData.name = card.name || '';

    // 种族/类型：模拟官方英文卡的卡框显示（Dragon/Normal、Dragon/Fusion/Effect、Dragon/Pendulum/Effect 等）
    // - type 字符串如 "Pendulum Effect Monster" / "Fusion Monster" / "Normal Spell"
    // - 去掉包框词 Monster/Spell/Trap，再按单词切分并转 Title Case（首字母大写，对齐官方英文卡）
    const englishType = (card.type || '').replace(/\b(Monster|Spell|Trap)\b/g, '').trim();
    const typeParts = englishType.split(' ').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
    formData.monsterType = [card.race, ...typeParts].filter(Boolean).join('/');

    // ATK/DEF/等级/阶级
    formData.atk = card.atk ?? 0;
    formData.def = card.def ?? 0;

    if (mainType === 'pendulum') {
      // 灵摆卡：cardTypeOrPendulum 是 pendulumType（如 normal-pendulum）
      formData.pendulumType = cardTypeOrPendulum;
      formData.cardType = cardTypeOrPendulum.replace('-pendulum', '');
      formData.pendulumScale = card.scale ?? 0;
      formData.level = card.level ?? 0;
      formData.rank = 0;
      formData.arrowList = [];
      // 灵摆卡：ygoprodeck 提供独立的 pend_desc / monster_desc 字段，直接使用
      formData.pendulumDescription = (card.pend_desc || '').trim();
      formData.description = (card.monster_desc || '').trim();
    } else if (mainType === 'monster') {
      formData.cardType = cardTypeOrPendulum;
      formData.pendulumScale = 0;
      formData.pendulumType = 'normal-pendulum';
      formData.pendulumDescription = '';
      formData.description = card.desc || '';
      if (cardTypeOrPendulum === 'xyz') {
        formData.rank = card.level ?? 0;
        formData.level = 0;
        formData.arrowList = [];
      } else if (cardTypeOrPendulum === 'link') {
        formData.level = card.linkval ?? 0;
        formData.rank = 0;
        formData.arrowList = (card.linkmarkers || []).map(m => YGOPRODECK_MARKERS[m]).filter(Boolean);
      } else {
        formData.level = card.level ?? 0;
        formData.rank = 0;
        formData.arrowList = [];
      }
    } else {
      // 魔法/陷阱
      formData.cardType = 'normal';
      formData.pendulumScale = 0;
      formData.pendulumType = 'normal-pendulum';
      formData.pendulumDescription = '';
      formData.description = card.desc || '';
      formData.level = 0;
      formData.rank = 0;
      formData.arrowList = [];
      formData.icon = YGOPRODECK_ICON[card.race] ?? '';
    }

    formData.atkBar = mainType === 'monster' || mainType === 'pendulum';

    // 卡图：统一走 ygotoken（与中文模式一致），需通过 ygocdb 拿 cid
    let cid = null;
    try {
      const ygocdb = await fetchJsonWithTimeout(`https://ygocdb.com/api/v0/card/${pwd}?show=all`);
      cid = ygocdb?.cid || null;
      if (!cid) {
        const cache = await loadYgotokenCache();
        const ygocard = cache.find(c => String(c.id) === pwd);
        if (ygocard) cid = ygocard.cid || null;
      }
    } catch { /* 忽略 cid 查找失败 */ }

    if (requestToken !== cardLoadToken) return;
    if (cid) {
      formData.image = getYgotokenImageUrl(cid);
    } else {
      formData.image = '';
      if (!silent) ElMessage.warning(t('noImage'));
    }

    updateCard();
    if (!silent) ElMessage.success(`${t('randomOne')}: ${formData.name}`);
  } catch {
    if (requestToken !== cardLoadToken) return;
    if (!silent) ElMessage.error(t('networkError'));
  }
};

const searchPassword = async (silent = false) => {
  const pwd = (formData.password || '').trim();
  if (!pwd) { if (!silent) ElMessage.warning(t('pleaseInputPassword')); return; }
  if (!/^\d{6,8}$/.test(pwd)) { if (!silent) ElMessage.warning(t('passwordInvalid')); return; }
  const requestToken = ++cardLoadToken;
  if (!silent) startSearchLoading();
  try {
    const lang = formData.language || 'sc';

    // 英文模式：使用 ygoprodeck 公开英文数据源（含英文描述）
    if (lang === 'en') {
      await searchPasswordEn(pwd, silent, requestToken);
      return;
    }

    // 主数据源：百鸽 API ?show=all（顶层含全译名 + text.types 含箭头）
    const ygocdb = await fetchJsonWithTimeout(`https://ygocdb.com/api/v0/card/${pwd}?show=all`);
    if (requestToken !== cardLoadToken) return;
    if (!ygocdb?.data) { if (!silent) ElMessage.warning(t('passwordNotFound')); return; }

    const ocgData = ygocdb.data;
    const textData = ygocdb.text || {};
    const { type: mainType, labels, cardType: subType } = parseOcgType(ocgData.type, lang);
    const raceName = getRaceName(ocgData.race, lang);
    const attrKey = ATTR_KEY[ocgData.attribute] || '';
    const hasPendulum = mainType === 'pendulum';
    const L = getTypeLabels(lang);
    const raceText = raceName ? (
      hasPendulum
        ? `${raceName}/${labels.filter(l => l !== L.effect && l !== L.normal).join('/')}${labels.some(l => l !== L.normal) ? `/${L.pendulum}/` : '/'}${labels.includes(L.normal) ? L.normal : L.effect}`.replace(/\/+/g, '/')
        : `${raceName}/${labels.join('/')}`
    ) : '';

    // 卡名：英文/日文直接取对应语言字段；韩文接口无字段回退英文；中文按译名来源取
    let cardName = '';
    if (lang === 'en') {
      cardName = ygocdb.en_name || '';
    } else if (lang === 'jp' || lang === 'astral') {
      cardName = ygocdb.jp_name || '';
    } else if (lang === 'kr') {
      cardName = ygocdb.en_name || ygocdb.cn_name || ygocdb.sc_name || '';
    } else {
      const nameMap = {
        cn: ygocdb.cn_name || ygocdb.cnocg_n || ygocdb.nwbbs_n,
        nwbbs: ygocdb.nwbbs_n,
        cnocg: ygocdb.cnocg_n,
        sc: ygocdb.sc_name,
        md: ygocdb.md_name,
      };
      cardName = nameMap[nameSource.value] || ygocdb.cn_name || ygocdb.sc_name || '';
    }
    formData.name = cardName;
    // 卡图：从 ygotoken 缓存获取 cid
    cardCid.value = ygocdb.cid || null;
    if (!cardCid.value) {
      try {
        const cache = await loadYgotokenCache();
        const ygocard = cache.find(c => String(c.id) === pwd);
        if (ygocard) cardCid.value = ygocard.cid || null;
      } catch { /* 忽略 */ }
    }
    if (requestToken !== cardLoadToken) return;
    formData.type = mainType;
    formData.cardType = subType;
    formData.attribute = attrKey;
    const rawLevel = ocgData.level;
    if (subType === 'xyz') {
      formData.rank = rawLevel;
      formData.level = 0;
    } else if (subType === 'link') {
      formData.level = rawLevel & 0xFF;
      formData.rank = 0;
      // 从 text.types 解析箭头标记，渲染层需要数字 1-8（顺序：上→右上→右→右下→下→左下→左→左上）
      const arrowMap = { '↑': 1, '↗': 2, '→': 3, '↘': 4, '↓': 5, '↙': 6, '←': 7, '↖': 8 };
      const typesStr = (textData.types || '');
      formData.arrowList = [];
      for (const [char, idx] of Object.entries(arrowMap)) {
        if (typesStr.includes(`[${char}]`)) formData.arrowList.push(idx);
      }
    } else {
      formData.level = rawLevel >= 0x10000 ? (rawLevel & 0xFF) : (rawLevel <= 13 ? rawLevel : 0);
      formData.rank = 0;
      formData.arrowList = [];
    }
    formData.monsterType = raceText;
    formData.atk = ocgData.atk ?? 0;
    formData.def = ocgData.def ?? 0;

    // 魔法/陷阱：设置 logo 图标
    const spellTrapIcons = { 0x80: 'ritual', 0x10000: 'quick-play', 0x20000: 'continuous', 0x40000: 'equip', 0x80000: 'field', 0x100000: 'counter' };
    const iconKey = Object.keys(spellTrapIcons).find(k => ocgData.type & Number(k));
    formData.icon = mainType === 'spell' || mainType === 'trap' ? (spellTrapIcons[iconKey] || '') : '';

    // 灵摆卡拆分：百鸽 API 中灵摆效果(pdesc)和怪兽效果(desc)是两个独立字段
    const rawDesc = (textData.desc || '').trim();
    if (mainType === 'pendulum') {
      formData.pendulumDescription = (textData.pdesc || '').trim();
      formData.description = rawDesc;
    } else {
      formData.pendulumDescription = '';
      formData.description = rawDesc;
    }
    formData.atkBar = mainType === 'monster' || mainType === 'pendulum';
    if (mainType === 'pendulum') {
      formData.pendulumScale = (rawLevel >> 16) & 0xFF;
      formData.pendulumType = toPendulumType(subType);
    }

    // 卡图：ygotoken 的 WebP 高清艺术插画（1200×1200）
    if (cardCid.value) {
      formData.image = getYgotokenImageUrl(cardCid.value);
    } else {
      formData.image = '';
      if (!silent) ElMessage.warning(t('noImage'));
    }

    updateCard();
    if (!silent) ElMessage.success(`${t('randomOne')}: ${formData.name}`);
  } catch (e) {
    if (requestToken !== cardLoadToken) return;
    if (!silent) ElMessage.error(t('networkError'));
    cardCid.value = null;
  } finally {
    if (!silent) stopSearchLoading();
  }
};

// 卡名搜索（百鸽 API）
const searchByName = async () => {
  const kw = nameSearchKeyword.value.trim();
  if (!kw) { ElMessage.warning(t('pleaseInputName')); return; }
  nameSearchLoading.value = true;
  try {
    const result = await fetchJsonWithTimeout(`https://ygocdb.com/api/v0/?search=${encodeURIComponent(kw)}`);
    if (!result?.result?.length) { ElMessage.warning(t('nameNotFound')); return; }
    formData.password = String(result.result[0].id);
    nameSearchKeyword.value = '';
    await searchPassword();
  } catch (e) {
    ElMessage.error(t('networkError'));
  } finally {
    nameSearchLoading.value = false;
  }
};

// JSON 编辑器 → 表单 单向同步
watch(() => jsonData.value, newVal => {
  // jsonData 由表单同步写入时与快照完全一致，直接跳过：
  // 否则每次输入都会 delete + assign 重建整个 formData，触发全量重算并打断输入框状态
  if (newVal === jsonSnapshot) {
    return;
  }
  try {
    const parsed = JSON.parse(newVal);
    if (!parsed || typeof parsed !== 'object') return;
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, parsed);
    if (cardLeaf.value) {
      cardLeaf.value.setData(buildCardData());
    }
  } catch {
    // JSON 格式错误时不报错，用户在 JSON 编辑器中自行修正
  }
});

// 一键注音：把卡名与描述转成 [汉字(假名)] 语法，渲染层直接显示注音。
// 读音来自常用词表与常用汉字表，专有名词仍需人工核对。
const PHONETIC_FIELDS = ['name', 'effect', 'description', 'pendulumDescription'];
const autoPhonetic = () => {
  let changed = 0;
  PHONETIC_FIELDS.forEach(key => {
    const raw = formData[key];
    if (!raw || typeof raw !== 'string' || hasRuby(raw)) {
      return;
    }
    const converted = toRubyText(raw);
    if (converted !== raw) {
      formData[key] = converted;
      changed += 1;
    }
  });
  if (!changed) {
    ElMessage.info(t('phoneticNothing'));
    return;
  }
  updateCard();
  ElMessage.success(t('phoneticApplied'));
};
</script>

<style lang="scss" scoped>
.yugioh-card-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.main-row {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
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

  .param-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .param-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 4px;

    .version-tag {
      font-size: 11px;
      font-weight: 400;
      color: #909399;
      margin-left: 6px;
    }
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
    font-size: 12px;
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
      font-weight: 600;
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

// 页面底部 API 来源声明
.site-footer {
  padding: 8px 16px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  border-top: 1px solid #e4e7ed;
  background: #fff;

  a {
    color: var(--el-color-primary);
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
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

  // 密码行：输入 + 搜索按钮
  .password-row {
    display: flex;
    gap: 6px;

    .el-input {
      flex: 1;
      min-width: 0;
    }

    .el-button {
      flex-shrink: 0;
    }
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

// 自定义字体导入
.custom-font-list {
  padding-top: 2px;
  padding-left: 12px;
}

.custom-font-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;

  .custom-font-label {
    flex-shrink: 0;
    width: 56px;
    color: #909399;
    text-align: right;
  }

  .custom-font-name {
    width: 0;
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    line-height: 24px;
    border-radius: 4px;
    background: #f5f7fa;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #606266;

    &.empty {
      color: #c0c4cc;
    }
  }

  .custom-font-btns {
    flex-shrink: 0;
    display: flex;
    gap: 0;

    .invisible {
      visibility: hidden;
    }
  }
}

.custom-font-hint {
  font-size: 11px;
  color: #c0c4cc;
  padding-left: 64px;
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

@media (max-width: 900px) {
  .yugioh-card-container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .main-row {
    flex-direction: column;
    overflow: visible;
  }

  .card-preview {
    width: 100%;
    min-width: 0;
    flex: none;
    overflow: visible;

    .card-canvas {
      max-height: 60vh;
      padding: 16px;
    }

    .preview-toolbar {
      flex-wrap: wrap;
      row-gap: 8px;

      .toolbar-spacer {
        display: none;
      }
    }
  }

  .param-panel {
    width: 100%;
    border-left: 0;
    border-top: 1px solid #e4e7ed;
    overflow: visible;
  }

  .form-scroll {
    overflow: visible;
  }
}

@media (max-width: 640px) {
  .preview-toolbar {
    justify-content: center;
  }

  .param-header-row {
    flex-wrap: wrap;
    gap: 8px;
  }
}

</style>
