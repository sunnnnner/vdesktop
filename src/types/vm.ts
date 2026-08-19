// 类型定义
export interface User {
  id: number
  name: string
}

export interface Node {
  id: number
  ip: string
  name: string
}

export interface Machine {
  id: number
  name: string
  vmid: string
  node: Node
  locked_by: User | null
}

export interface VmTableData {
  no: number
  name: string
  locked: string | null
} 
