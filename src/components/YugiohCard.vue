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
                {{ uiLocale === 'zh-CN' ? '简体中文' : 'EN' }}
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-CN" :disabled="uiLocale === 'zh-CN'">简体中文</el-dropdown-item>
                  <el-dropdown-item command="en-US" :disabled="uiLocale === 'en-US'">English</el-dropdown-item>
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
                :placeholder="t('fontDefault')"
                size="default"
                style="width: 100%"
                @change="setFont"
              >
                <el-option :label="t('fontDefault')" value="" />
                <el-option :label="t('fontCustom1')" value="custom1" />
                <el-option :label="t('fontCustom2')" value="custom2" />
                <el-option :label="t('fontXlsj')" value="xlsj" />
                <el-option :label="t('fontXlsf')" value="xlsf" />
                <el-option :label="t('fontHklsw7')" value="hklsw7" />
                <el-option :label="t('fontHklsw5')" value="hklsw5" />
                <el-option :label="t('fontKt')" value="kt" />
              </el-select>
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
                  @input="updateCard"
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
                  @input="scheduleUpdate()"
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
                <el-option :label="t('twentieth20')" value="twentieth" />
                <el-option :label="t('twentieth25')" value="twentyfive" />
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
            <details class="json-section">
              <summary>{{ t('advanced') }}</summary>
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
  Link,
  PictureFilled,
  Reading,
  RefreshLeft,
  RefreshRight,
  Upload,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, toRaw, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { FieldCenterCard, RushDuelCard, YugiohBackCard, YugiohCard, YugiohSeries2Card } from 'yugioh-card';
import JsonEditorVue from 'json-editor-vue';
import { t, setLocale, useUiLocale } from '@/i18n';
import { version } from '../../package.json';
import fieldCenterDemo from '@/assets/demo/field-center-demo';
import rushDuelDemo from '@/assets/demo/rush-duel-demo';
import yugiohBackDemo from '@/assets/demo/yugioh-back-demo';
import yugiohDemo from '@/assets/demo/yugioh-demo';
import yugiohSeries2Demo from '@/assets/demo/yugioh-series-2-demo';

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
const searchLoading = ref(false);
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
        ? './assets/src/assets/yugioh-card'
        : 'src/assets/yugioh-card'),
  });
  syncCardViewSize(); // 包装层匹配 canvas 尺寸，flex 自动居中
  observeCanvas(); // 监听后续异步加载导致的 canvas 尺寸变化
  jsonData.value = JSON.stringify(demo, null, 2);
};


// 选择字体：只改字体并重绘（语言与字体完全解耦，互不影响）
const setFont = () => {
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
    cardLeaf.value.setData({ ...toRaw(formData) });
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
  ElMessage.success(t('resetSuccess'));
};

const exportImage = () => {
  if (!cardLeaf.value?.leafer) return;
  const name = (formData.name || '卡片').replace(/[/:*?"<>|]/g, '-');
  cardLeaf.value.leafer.export(`${name}.png`, {
    screenshot: true,
    pixelRatio: devicePixelRatio,
    scale: exportScale.value,
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
    cardLeaf.value.setData({ ...toRaw(formData) });
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
      const resp = await fetch('./card-ids.json');
      cardIdCache = await resp.json();
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
const RACE_MAP = {
  sc: { 1: '战士族', 2: '魔法师族', 4: '天使族', 8: '恶魔族', 16: '不死族', 32: '机械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鸟兽族', 1024: '植物族', 2048: '昆虫族', 4096: '雷族', 8192: '龙族', 16384: '兽族', 32768: '兽战士族', 65536: '恐龙族', 131072: '鱼族', 262144: '海龙族', 524288: '爬虫类族', 1048576: '念动力族', 2097152: '幻龙族', 4194304: '电子界族', 8388608: '幻神兽族', 16777216: '创造神族' },
  tc: { 1: '戰士族', 2: '魔法師族', 4: '天使族', 8: '惡魔族', 16: '不死族', 32: '機械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鳥獸族', 1024: '植物族', 2048: '昆蟲族', 4096: '雷族', 8192: '龍族', 16384: '獸族', 32768: '獸戰士族', 65536: '恐龍族', 131072: '魚族', 262144: '海龍族', 524288: '爬蟲類族', 1048576: '念動力族', 2097152: '幻龍族', 4194304: '電子界族', 8388608: '幻神獸族', 16777216: '創造神族' },
  jp: { 1: '戦士族', 2: '魔法使い族', 4: '天使族', 8: '悪魔族', 16: 'アンデット族', 32: '機械族', 64: '水族', 128: '炎族', 256: '岩石族', 512: '鳥獣族', 1024: '植物族', 2048: '昆虫族', 4096: '雷族', 8192: 'ドラゴン族', 16384: '獣族', 32768: '獣戦士族', 65536: '恐竜族', 131072: '魚族', 262144: '海竜族', 524288: '爬虫類族', 1048576: 'サイキック族', 2097152: '幻竜族', 4194304: 'サイバース族', 8388608: '幻神獣族', 16777216: '創造神族' },
  en: { 1: 'Warrior', 2: 'Spellcaster', 4: 'Fairy', 8: 'Fiend', 16: 'Zombie', 32: 'Machine', 64: 'Aqua', 128: 'Pyro', 256: 'Rock', 512: 'Winged Beast', 1024: 'Plant', 2048: 'Insect', 4096: 'Thunder', 8192: 'Dragon', 16384: 'Beast', 32768: 'Beast-Warrior', 65536: 'Dinosaur', 131072: 'Fish', 262144: 'Sea Serpent', 524288: 'Reptile', 1048576: 'Psychic', 2097152: 'Wyrm', 4194304: 'Cyberse', 8388608: 'Divine-Beast', 16777216: 'Creator God' },
  kr: { 1: '전사족', 2: '마법사족', 4: '천사족', 8: '악마족', 16: '언데드족', 32: '기계족', 64: '물족', 128: '화염족', 256: '암석족', 512: '비행야수족', 1024: '식물족', 2048: '곤충족', 4096: '번개족', 8192: '드래곤족', 16384: '야수족', 32768: '야수전사족', 65536: '공룡족', 131072: '어류족', 262144: '해룡족', 524288: '파충류족', 1048576: '사이킥족', 2097152: '환룡족', 4194304: '사이버스족', 8388608: '환신야수족', 16777216: '창조신족' },
};

// 类型标签多语言映射（怪兽子类型/效果分类）
const TYPE_LABELS = {
  sc: { tuner: '协调', spirit: '灵魂', union: '同盟', gemini: '二重', toon: '卡通', flip: '反转', link: '连接', xyz: '超量', synchro: '同调', fusion: '融合', ritual: '仪式', effect: '效果', normal: '通常', pendulum: '灵摆' },
  tc: { tuner: '協調', spirit: '靈魂', union: '同盟', gemini: '二重', toon: '卡通', flip: '反轉', link: '連接', xyz: '超量', synchro: '同步', fusion: '融合', ritual: '儀式', effect: '效果', normal: '通常', pendulum: '靈擺' },
  jp: { tuner: 'チューナー', spirit: 'スピリット', union: 'ユニオン', gemini: 'デュアル', toon: 'トゥーン', flip: 'リバース', link: 'リンク', xyz: 'エクシーズ', synchro: 'シンクロ', fusion: '融合', ritual: '儀式', effect: '効果', normal: '通常', pendulum: 'ペンデュラム' },
  en: { tuner: 'Tuner', spirit: 'Spirit', union: 'Union', gemini: 'Gemini', toon: 'Toon', flip: 'Flip', link: 'Link', xyz: 'Xyz', synchro: 'Synchro', fusion: 'Fusion', ritual: 'Ritual', effect: 'Effect', normal: 'Normal', pendulum: 'Pendulum' },
  kr: { tuner: '튜너', spirit: '스피릿', union: '유니온', gemini: '듀얼', toon: '툰', flip: '리버스', link: '링크', xyz: '엑시즈', synchro: '싱크로', fusion: '융합', ritual: '의식', effect: '효과', normal: '일반', pendulum: '펜듈럼' },
};

const ATTR_KEY = { 1: 'earth', 2: 'water', 4: 'fire', 8: 'wind', 16: 'light', 32: 'dark', 64: 'divine' };

// ygoprodeck 英文数据源字段映射（用于英文描述的完整数据）
const YGOPRODECK_ATTR = { LIGHT: 'light', DARK: 'dark', EARTH: 'earth', WATER: 'water', FIRE: 'fire', WIND: 'wind', DIVINE: 'divine' };
// ygoprodeck linkmarkers → 项目 arrowList 数字（1上 2右上 3右 4右下 5下 6左下 7左 8左上）
const YGOPRODECK_MARKERS = { Top: 1, 'Top-Right': 2, Right: 3, 'Bottom-Right': 4, Bottom: 5, 'Bottom-Left': 6, Left: 7, 'Top-Left': 8 };
// ygoprodeck frameType → [主类型, 卡类]
const YGOPRODECK_FRAME = {
  normal: ['monster', 'normal'],
  effect: ['monster', 'effect'],
  ritual: ['monster', 'ritual'],
  fusion: ['monster', 'fusion'],
  synchro: ['monster', 'synchro'],
  xyz: ['monster', 'xyz'],
  link: ['monster', 'link'],
  spell: ['spell', 'normal'],
  trap: ['trap', 'normal'],
  normal_pendulum: ['pendulum', 'normal-pendulum'],
  effect_pendulum: ['pendulum', 'effect-pendulum'],
  ritual_pendulum: ['pendulum', 'ritual-pendulum'],
  fusion_pendulum: ['pendulum', 'fusion-pendulum'],
  synchro_pendulum: ['pendulum', 'synchro-pendulum'],
  xyz_pendulum: ['pendulum', 'xyz-pendulum'],
};
// ygoprodeck 魔法/陷阱 race → 项目 icon
const YGOPRODECK_ICON = { Field: 'field', Equip: 'equip', Continuous: 'continuous', 'Quick-Play': 'quick-play', Ritual: 'ritual', Counter: 'counter', Normal: '' };

const getRaceName = (raceCode, lang) => {
  const map = RACE_MAP[lang] || RACE_MAP.sc;
  return map[raceCode] || '';
};

const getTypeLabels = lang => TYPE_LABELS[lang] || TYPE_LABELS.sc;

const parseOcgType = (code, lang = 'sc') => {
  const L = getTypeLabels(lang);
  if (code & 0x2) return { type: 'spell', labels: [] };
  if (code & 0x4) return { type: 'trap', labels: [] };
  const result = { type: 'monster', labels: [], cardType: '' };
  if (code & 0x1000000) result.type = 'pendulum';
  if (code & 0x1000) result.labels.push(L.tuner);
  if (code & 0x200) result.labels.push(L.spirit);
  if (code & 0x400) result.labels.push(L.union);
  if (code & 0x800) result.labels.push(L.gemini);
  if (code & 0x8000) result.labels.push(L.toon);
  if (code & 0x200000) result.labels.push(L.flip);
  if (code & 0x4000000) { result.labels.push(L.link); result.cardType = 'link'; }
  else if (code & 0x800000) { result.labels.push(L.xyz); result.cardType = 'xyz'; }
  else if (code & 0x2000) { result.labels.push(L.synchro); result.cardType = 'synchro'; }
  else if (code & 0x40) { result.labels.push(L.fusion); result.cardType = 'fusion'; }
  else if (code & 0x80) { result.labels.push(L.ritual); result.cardType = 'ritual'; }
  if (code & 0x20 || result.labels.length) { result.labels.push(L.effect); result.cardType = result.cardType || 'effect'; }
  else { result.labels.push(L.normal); result.cardType = 'normal'; }
  return result;
};

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
const loadYgotokenCache = async () => {
  if (ygotokenCache) return ygotokenCache;
  try {
    // ygotoken 站点仅支持 http；HTTPS 静态页无法直连（主路径 ygocdb 已提供 cid，此处仅兜底）
    const url = import.meta.env.DEV
      ? '/ygotoken-api/api/cards'
      : (window.location.protocol === 'https:'
        ? 'https://www.ygotoken.com/api/cards'
        : 'http://www.ygotoken.com/api/cards');
    const resp = await fetch(url);
    ygotokenCache = await resp.json();
    return ygotokenCache;
  } catch {
    ygotokenCache = [];
    return [];
  }
};

// 英文卡片数据搜索：使用 ygoprodeck 公开 API（含英文名、英文描述、英文种族、卡图）
const searchPasswordEn = async (pwd, silent = false) => {
  try {
    const resp = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${pwd}`, { cache: 'no-cache' });
    const result = await resp.json();
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
      const ygocdbResp = await fetch(`https://ygocdb.com/api/v0/card/${pwd}?show=all`, { cache: 'no-cache' });
      const ygocdb = await ygocdbResp.json();
      cid = ygocdb?.cid || null;
      if (!cid) {
        const cache = await loadYgotokenCache();
        const ygocard = cache.find(c => String(c.id) === pwd);
        if (ygocard) cid = ygocard.cid || null;
      }
    } catch { /* 忽略 cid 查找失败 */ }

    if (cid) {
      formData.image = getYgotokenImageUrl(cid);
    } else {
      formData.image = '';
      if (!silent) ElMessage.warning(t('noImage'));
    }

    updateCard();
    if (!silent) ElMessage.success(`${t('randomOne')}: ${formData.name}`);
  } catch {
    if (!silent) ElMessage.error(t('networkError'));
  } finally {
    searchLoading.value = false;
  }
};

const searchPassword = async (silent = false) => {
  const pwd = (formData.password || '').trim();
  if (!pwd) { if (!silent) ElMessage.warning(t('pleaseInputPassword')); return; }
  if (!/^\d{6,8}$/.test(pwd)) { if (!silent) ElMessage.warning(t('passwordInvalid')); return; }
  if (!silent) searchLoading.value = true;
  try {
    const lang = formData.language || 'sc';

    // 英文模式：使用 ygoprodeck 公开英文数据源（含英文描述）
    if (lang === 'en') {
      await searchPasswordEn(pwd, silent);
      return;
    }

    // 主数据源：百鸽 API ?show=all（顶层含全译名 + text.types 含箭头）
    const ygocdbResp = await fetch(`https://ygocdb.com/api/v0/card/${pwd}?show=all`, { cache: 'no-cache' });
    const ygocdb = await ygocdbResp.json();
    if (!ygocdb?.data) { ElMessage.warning(t('passwordNotFound')); return; }

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
      formData.pendulumType = `${subType !== 'normal' ? subType : 'effect'}-pendulum`;
    }

    // 卡图：ygotoken 的 WebP 高清艺术插画（1200×1200）
    if (cardCid.value) {
      formData.image = getYgotokenImageUrl(cardCid.value);
    } else {
      formData.image = '';
      ElMessage.warning(t('noImage'));
    }

    updateCard();
    if (!silent) ElMessage.success(`${t('randomOne')}: ${formData.name}`);
  } catch (e) {
    if (!silent) ElMessage.error(t('networkError'));
    cardCid.value = null;
  } finally {
    if (!silent) searchLoading.value = false;
  }
};

// 卡名搜索（百鸽 API）
const searchByName = async () => {
  const kw = nameSearchKeyword.value.trim();
  if (!kw) { ElMessage.warning(t('pleaseInputName')); return; }
  nameSearchLoading.value = true;
  try {
    const resp = await fetch(`https://ygocdb.com/api/v0/?search=${encodeURIComponent(kw)}`);
    const result = await resp.json();
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
    ElMessage.warning(t('pleaseInputCardName'));
    return;
  }
  // 简化：仅在控制台提示用户
  // 完整功能需要汉字 → 假名 映射表（约 6000 字），这里提供占位实现
  ElMessage.info(t('phoneticInfo'));
  window.open(`https://kanji.reader.bz/h/${encodeURIComponent(text)}`, '_blank', 'noopener');
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
