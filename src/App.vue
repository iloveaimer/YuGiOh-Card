<template>
  <el-config-provider :locale="epLocale">
    <YugiohCard />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import YugiohCard from './components/YugiohCard.vue';
import { useUiLocale } from './i18n';

const locale = useUiLocale();
const epLocale = computed(() => (locale.value === 'en-US' ? en : zhCn));
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  overflow-wrap: break-word;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: var(--default-font-family);
  color: var(--main-color);
  font-size: 14px;
}
</style>
