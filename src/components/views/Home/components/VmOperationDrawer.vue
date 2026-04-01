<template>
  <n-drawer
    v-model:show="visible"
    :default-width="360"
    placement="right"
    resizable
  >
    <n-drawer-content :title="`操作 · ${vmName || '未选择虚拟机'}`">
      <p class="drawer-tip">操作将立即作用于当前虚拟机，请确认后执行。</p>
      <n-grid cols="2" x-gap="10" y-gap="10">
        <n-grid-item v-for="operation in operations" :key="operation.key">
          <n-popover trigger="hover">
            <template #trigger>
              <n-button
                type="primary"
                :disabled="operation.disabled"
                block
                @click="handleOperation(operation.key)"
              >
                {{ operation.label }}
              </n-button>
            </template>
            <span>{{ operation.tooltip }}</span>
          </n-popover>
        </n-grid-item>
      </n-grid>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useVmOperations } from '../composables/useVmOperations'

const props = defineProps<{
  show: boolean
  vmName: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'refresh'): void
}>()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})


const { operations, handleVmOperation } = useVmOperations(computed(() => props.vmName))

const handleOperation = async (key: string) => {
  await handleVmOperation(key)
  emit('refresh')
}
</script>

<style scoped>
.drawer-tip {
  margin: 0 0 12px;
  color: #5f6f86;
}
</style>
