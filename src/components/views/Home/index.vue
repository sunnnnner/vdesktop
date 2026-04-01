<template>
  <div class="home-container">
    <section class="hero-panel">
      <div class="hero-main">
        <p class="hero-kicker">VDesktop Console</p>
        <h1>虚拟机控制台</h1>
        <p class="hero-subtitle">统一管理开机、关机、锁定与远程连接操作。</p>
      </div>

      <div class="hero-metrics">
        <n-statistic label="虚拟机总数" :value="tableData.length" />
        <n-statistic label="已锁定" :value="lockedCount" />
        <div class="refresh-box">
          <n-button type="primary" secondary :loading="refreshing" @click="handleManualRefresh">
            立即刷新
          </n-button>
          <p>最近刷新：{{ lastRefreshTime }}</p>
        </div>
      </div>
    </section>

    <n-card :bordered="false" class="server-panel">
      <template #header>
        <div class="panel-title">
          <span>目标服务器</span>
          <n-tag round type="success">{{ currentServerLabel }}</n-tag>
        </div>
      </template>

      <n-radio-group v-model:value="currentServer" @update:value="handleServerChange">
        <n-space>
          <n-radio-button v-for="server in servers" :key="server.value" :value="server.value">
            {{ server.label }}
          </n-radio-button>
        </n-space>
      </n-radio-group>
    </n-card>

    <n-card :bordered="false" class="table-panel">
      <template #header>
        <div class="panel-title">
          <span>{{ title }}</span>
          <n-text depth="3">仅手动刷新</n-text>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="tableData"
        :bordered="false"
        :striped="true"
        :loading="tableLoading"
      />
    </n-card>

    <VmOperationDrawer
      v-model:show="drawerVisible"
      :vm-name="selectedVm"
      @refresh="refreshVmList"
    />
  </div>
</template>

<script lang="ts" setup>
import { invoke } from '@tauri-apps/api/core'
import { useMessage } from 'naive-ui'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import type { Machine, VmTableData } from '@/types/vm'
import { createVmColumns } from './composables/useVmColumns'

const VmOperationDrawer = defineAsyncComponent(() => import('./components/VmOperationDrawer.vue'))
const message = useMessage()

const title = ref('虚拟机列表')
const drawerVisible = ref(false)
const selectedVm = ref('')
const currentServer = ref('beijing')
const tableData = ref<VmTableData[]>([])
const tableLoading = ref(false)
const refreshing = ref(false)
const lastRefreshTime = ref('--')

const servers = [
  { label: '北京', value: 'beijing' },
  { label: '天津', value: 'tianjing' }
]

const columns = createVmColumns((row: VmTableData) => {
  drawerVisible.value = true
  selectedVm.value = row.name
})

const currentServerLabel = computed(() => {
  return servers.find(server => server.value === currentServer.value)?.label ?? '未选择'
})

const lockedCount = computed(() => {
  return tableData.value.filter(item => Boolean(item.locked)).length
})

const updateRefreshTimestamp = () => {
  lastRefreshTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

const refreshVmList = async () => {
  tableLoading.value = true
  try {
    const res = await invoke<Machine[]>('get_vms')
    tableData.value = res.map(item => ({
      no: item.id,
      name: item.name,
      locked: item.locked_by?.name || null
    }))
    updateRefreshTimestamp()
  } catch (e: unknown) {
    message.error(String(e))
  } finally {
    tableLoading.value = false
  }
}

const getServerConfig = async () => {
  try {
    const res = await invoke<{ server?: string }>('get_config')
    if (res.server) {
      currentServer.value = res.server
    }
  } catch (e: unknown) {
    message.error(String(e))
  }
}

const refreshAll = async () => {
  await Promise.all([refreshVmList(), getServerConfig()])
}

const handleServerChange = async (value: string) => {
  currentServer.value = value
  refreshing.value = true
  try {
    await invoke('switch_server', { server: value })
    await refreshAll()
    message.success(`已切换到 ${currentServerLabel.value}`)
  } catch (e: unknown) {
    message.error(String(e))
  } finally {
    refreshing.value = false
  }
}

const handleManualRefresh = async () => {
  refreshing.value = true
  await refreshAll()
  refreshing.value = false
}

onMounted(async () => {
  await refreshAll()
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border-radius: 20px;
  background:
    linear-gradient(140deg, rgba(13, 111, 209, 0.93), rgba(10, 150, 116, 0.88));
  color: #eff6ff;
  box-shadow: 0 20px 32px rgba(14, 45, 87, 0.2);
}

.hero-main h1 {
  margin: 6px 0 2px;
  font-size: 30px;
  line-height: 1.2;
}

.hero-kicker {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  opacity: 0.9;
}

.hero-subtitle {
  margin: 0;
  color: rgba(240, 248, 255, 0.84);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  gap: 12px 16px;
  min-width: 280px;
}

.refresh-box {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refresh-box p {
  margin: 0;
  font-size: 13px;
  color: rgba(240, 248, 255, 0.86);
}

.server-panel,
.table-panel {
  border-radius: 16px;
  background: var(--surface-elevated);
  backdrop-filter: blur(6px);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .hero-panel {
    flex-direction: column;
    padding: 18px 16px;
  }

  .hero-main h1 {
    font-size: 26px;
  }

  .hero-metrics {
    min-width: 0;
  }
}
</style>
