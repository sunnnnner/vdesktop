<template>
  <div class="login-page">
    <div class="login-glow login-glow--left" />
    <div class="login-glow login-glow--right" />

    <n-card :bordered="false" class="login-card">
      <div class="login-header">
        <p class="login-kicker">VDesktop</p>
        <h2>连接配置</h2>
        <p class="login-subtitle">填写凭据并选择区域，然后进入虚拟机控制台。</p>
      </div>

      <n-form
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="top"
        :show-require-mark="false"
        size="large"
      >
        <n-form-item label="APPID" path="appid">
          <n-input v-model:value="model.appid" placeholder="输入 APPID" />
        </n-form-item>

        <n-form-item label="SECRET" path="appsecret">
          <n-input
            v-model:value="model.appsecret"
            type="password"
            show-password-on="click"
            placeholder="输入 APP Secret"
          />
        </n-form-item>

        <n-form-item label="姓名" path="name">
          <n-input v-model:value="model.name" placeholder="例如：zhangsan" />
        </n-form-item>

        <n-form-item label="指定区域" path="server">
          <n-radio-group
            v-model:value="checkedValue"
            class="server-selector"
            @update:value="handleServerChange"
          >
            <n-radio-button v-for="server in servers" :key="server.value" :value="server.value">
              {{ server.label }}
            </n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-button
          class="submit-button"
          type="primary"
          size="large"
          block
          :loading="saving"
          @click="saveConfig"
        >
          保存并进入
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Model {
  appid: string
  appsecret: string
  url: string
  name: string
  server: string
}

const rules: FormRules = {
  appid: [{ required: true, message: '请输入 APPID', trigger: 'blur' }],
  appsecret: [{ required: true, message: '请输入 SECRET', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  server: [{ required: true, message: '请选择区域', trigger: 'change' }]
}

const servers = [
  { label: '北京', value: 'beijing' },
  { label: '天津', value: 'tianjing' }
]

const serverMap: Record<string, string> = {
  beijing: 'https://vdesk.knd.io',
  tianjing: 'https://vdesk-tj.knd.io'
}

const checkedValue = ref('beijing')
const saving = ref(false)
const formRef = ref<FormInst | null>(null)
const router = useRouter()
const message = useMessage()

const model = ref<Model>({
  appid: '',
  appsecret: '',
  url: serverMap.beijing,
  name: '',
  server: 'beijing'
})

const updateConfig = (server: string) => {
  model.value.server = server
  model.value.url = serverMap[server] ?? serverMap.beijing
}

const saveConfig = async () => {
  if (!formRef.value) {
    return
  }

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  updateConfig(checkedValue.value)
  saving.value = true

  try {
    await invoke('save_config', { config: model.value })
    message.success('保存成功')
    router.push({ name: 'home' })
  } catch (e: unknown) {
    message.error(String(e))
  } finally {
    saving.value = false
  }
}

const handleServerChange = (value: string) => {
  checkedValue.value = value
  updateConfig(value)
}

onMounted(async () => {
  const isFileExist = await invoke<boolean>('is_exist_config')
  if (isFileExist) {
    router.push({ name: 'home' })
  }
})
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: calc(100vh - 118px);
  display: grid;
  place-items: center;
  padding: 12px 0;
  overflow: hidden;
}

.login-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  filter: blur(24px);
  pointer-events: none;
}

.login-glow--left {
  top: 8%;
  left: -60px;
  background: rgba(13, 111, 209, 0.2);
}

.login-glow--right {
  right: -70px;
  bottom: 4%;
  background: rgba(11, 153, 120, 0.18);
}

.login-card {
  width: min(100%, 560px);
  border-radius: 18px;
  background: var(--surface-elevated);
  backdrop-filter: blur(8px);
  box-shadow: 0 22px 40px rgba(18, 41, 84, 0.12);
}

.login-header {
  margin-bottom: 10px;
}

.login-kicker {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0d6fd1;
}

.login-header h2 {
  margin: 6px 0 4px;
  font-size: 28px;
  line-height: 1.2;
}

.login-subtitle {
  margin: 0;
  color: var(--text-subtle);
}

.server-selector {
  width: 100%;
}

.submit-button {
  margin-top: 4px;
}

@media (max-width: 640px) {
  .login-page {
    min-height: calc(100vh - 102px);
    place-items: start;
    padding-top: 24px;
  }

  .login-card {
    border-radius: 14px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>
  
