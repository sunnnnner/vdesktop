import { invoke } from "@tauri-apps/api/core";

import type { Machine } from "../../types/vm";

export interface ConnectionConfig {
  appid: string;
  appsecret: string;
  url: string;
  name: string;
  server: string;
}

interface SuccessMessage {
  message: string;
}

export const SERVER_OPTIONS = [
  { label: "北京", value: "beijing", url: "https://vdesk.knd.io" },
  { label: "天津", value: "tianjing", url: "https://vdesk-tj.knd.io" },
] as const;

export type VmOperationCommand =
  | "start_vms"
  | "stop_vms"
  | "spice_viewer"
  | "force_stop_vms"
  | "lock_vms"
  | "unlock_vms";

export interface VmOperation {
  command: VmOperationCommand | "file_copy";
  danger?: boolean;
  disabled?: boolean;
  label: string;
  tooltip: string;
}

export const VM_OPERATIONS: readonly VmOperation[] = [
  { command: "start_vms", label: "开机", tooltip: "开启虚拟机" },
  { command: "stop_vms", label: "关机", tooltip: "关闭虚拟机" },
  {
    command: "spice_viewer",
    label: "启动界面",
    tooltip: "启动 Remote Viewer 并锁定虚拟机",
  },
  {
    command: "force_stop_vms",
    label: "强制关机",
    tooltip: "立即关闭虚拟机，可能丢失未保存的数据",
    danger: true,
  },
  { command: "lock_vms", label: "锁定", tooltip: "锁定虚拟机" },
  { command: "unlock_vms", label: "解锁", tooltip: "解锁虚拟机" },
  {
    command: "file_copy",
    label: "文件复制",
    tooltip: "复制文本或文件到虚拟机剪贴板目录",
    disabled: true,
  },
];

export function isConfigPresent(): Promise<boolean> {
  return invoke<boolean>("is_exist_config");
}

export function saveConnectionConfig(config: ConnectionConfig): Promise<SuccessMessage> {
  return invoke<SuccessMessage>("save_config", { config });
}

export function getConnectionConfig(): Promise<ConnectionConfig> {
  return invoke<ConnectionConfig>("get_config");
}

export function switchConnectionServer(server: string): Promise<SuccessMessage> {
  return invoke<SuccessMessage>("switch_server", { server });
}

export function getVirtualMachines(): Promise<Machine[]> {
  return invoke<Machine[]>("get_vms");
}

export function runVmOperation(
  command: VmOperationCommand,
  name: string,
): Promise<SuccessMessage> {
  return invoke<SuccessMessage>(command, { name });
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "操作失败，请稍后重试";
}
