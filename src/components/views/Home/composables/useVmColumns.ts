import { h } from 'vue'
import { NButton, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { VmTableData } from '@/types/vm'


export function createVmColumns(onOperation: (row: VmTableData) => void): DataTableColumns<VmTableData> {
  return [
    {
      title: '序号',
      key: 'no',
      width: 100,
      align: 'center'
    },
    {
      title: '虚拟机名称',
      key: 'name',
      width: 200,
      align: 'center'
    },
    {
      title: '是否锁定',
      key: 'locked',
      width: 200,
      align: 'center',
      render: (row) => {
        if (row.locked) {
          return h(
            NTag,
            { type: 'warning', round: true, bordered: false },
            { default: () => `已锁定 · ${row.locked}` }
          )
        }
        return h(
          NTag,
          { type: 'success', round: true, bordered: false },
          { default: () => '可操作' }
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (row) => h(
        NButton,
        {
          strong: true,
          secondary: true,
          size: 'small',
          type: 'primary',
          onClick: () => onOperation(row)
        },
        { default: () => '操作' }
      )
    }
  ]
} 
