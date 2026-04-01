<script setup lang="ts">
import { computed } from 'vue'
import { lightTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useRoute } from 'vue-router'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0d6fd1',
    primaryColorHover: '#2f86dc',
    primaryColorPressed: '#095cab',
    primaryColorSuppl: '#0d6fd1',
    borderRadius: '12px',
    borderColor: '#d5deea',
    fontFamily: '"Lato", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontFamilyMono: '"Fira Code", "SFMono-Regular", Menlo, monospace'
  }
}

const route = useRoute()

const pageTitle = computed(() => {
  const title = route.meta?.title
  if (typeof title === 'string' && title.trim().length > 0) {
    return title
  }
  return '系统页面'
})
</script>

<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="app-shell">
        <header class="app-statusbar">
          <div class="status-drag-rail" data-tauri-drag-region />
          <div class="status-inner" data-tauri-drag-region>
            <div class="status-title" data-tauri-drag-region>内网控制台</div>
            <div class="status-page" data-tauri-drag-region>{{ pageTitle }}</div>
          </div>
        </header>

        <main class="app-main">
          <router-view />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
:root {
  --app-bg:
    radial-gradient(circle at 10% 12%, rgba(13, 111, 209, 0.14), transparent 35%),
    radial-gradient(circle at 88% 80%, rgba(11, 153, 120, 0.12), transparent 34%),
    linear-gradient(180deg, #f5f9ff 0%, #eef4fb 100%);
  --surface-elevated: rgba(255, 255, 255, 0.86);
  --text-main: #1f2a3d;
  --text-subtle: #5c6a80;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  color: var(--text-main);
  background: var(--app-bg);
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-statusbar {
  width: min(1220px, calc(100% - 16px));
  margin: 8px auto;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #d9e2ee;
  border-top: 2px solid #c8d4e5;
  color: #1f2a3d;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.status-drag-rail {
  height: 12px;
  border-bottom: 1px solid #dfe8f3;
  cursor: grab;
}

.status-drag-rail:active {
  cursor: grabbing;
}

.status-inner {
  height: 30px;
  padding: 0 10px 0 84px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
}

.status-inner:active {
  cursor: grabbing;
}

.status-page {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #627188;
  font-weight: 500;
}

.status-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #233349;
}

.status-page {
  border-left: 1px solid #e1e8f1;
  padding-left: 10px;
}

.app-main {
  width: min(1220px, 100%);
  margin: 0 auto;
  padding: 0 clamp(14px, 2.5vw, 30px) 20px;
  flex: 1;
}

@media (max-width: 900px) {
  .app-statusbar {
    width: calc(100% - 12px);
    height: 42px;
  }

  .status-page {
    display: none;
  }

  .status-inner {
    justify-content: center;
    padding: 0 8px 0 82px;
  }

  .status-title {
    font-size: 12px;
  }

  .app-main {
    padding: 0 12px 20px;
  }
}
</style>
