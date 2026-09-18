import { useEffect, useState } from "react";

import {
  AlertCircleIcon,
  CloseIcon,
  LockIcon,
  PlayIcon,
  PowerIcon,
  RefreshIcon,
  TerminalIcon,
  UnlockIcon,
  VmIcon,
} from "./Icons";
import { useToast } from "./ToastProvider";
import {
  getErrorMessage,
  runVmOperation,
  type VmOperation,
  VM_OPERATIONS,
} from "../lib/tauri";

interface VmOperationDrawerProps {
  onClose: () => void;
  onOperationCompleted: () => void;
  vmName: string;
}

export function VmOperationDrawer({
  onClose,
  onOperationCompleted,
  vmName,
}: VmOperationDrawerProps) {
  const { error, success } = useToast();
  const [runningCommand, setRunningCommand] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOperation = async (operation: VmOperation) => {
    if (operation.disabled || operation.command === "file_copy") {
      return;
    }

    if (
      operation.danger &&
      !window.confirm(`确定要强制关闭虚拟机“${vmName}”吗？未保存的数据可能丢失。`)
    ) {
      return;
    }

    setRunningCommand(operation.command);
    try {
      await runVmOperation(operation.command, vmName);
      success(`${operation.label}指令下发成功`);
      onOperationCompleted();
    } catch (operationError) {
      error(getErrorMessage(operationError));
    } finally {
      setRunningCommand(null);
    }
  };

  const getOperationIcon = (command: string) => {
    switch (command) {
      case "start_vms":
        return <PlayIcon size={14} />;
      case "stop_vms":
        return <PowerIcon size={14} />;
      case "spice_viewer":
        return <TerminalIcon size={14} />;
      case "lock_vms":
        return <LockIcon size={14} />;
      case "unlock_vms":
        return <UnlockIcon size={14} />;
      case "force_stop_vms":
        return <PowerIcon size={14} />;
      default:
        return <VmIcon size={14} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-900/30"
      onMouseDown={onClose}
      role="presentation"
    >
      <aside
        aria-label={`虚拟机 ${vmName} 的操作面板`}
        aria-modal="true"
        className="w-full max-w-[380px] h-full bg-white border-l border-zinc-200/90 p-5 overflow-y-auto shadow-overlay flex flex-col justify-between"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div>
          {/* 头部标题与关闭 */}
          <header className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                实例控制台
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                Instance Control Session
              </p>
            </div>
            <button
              aria-label="关闭控制面板"
              className="flex items-center justify-center w-7 h-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              onClick={onClose}
              title="关闭"
              type="button"
            >
              <CloseIcon size={15} />
            </button>
          </header>

          {/* 目标虚拟机概况 */}
          <div className="flex items-center justify-between p-3 my-4 bg-zinc-50 border border-zinc-200/70 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 text-white">
                <VmIcon size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900">{vmName}</div>
                <div className="text-[11px] text-zinc-500">集群分配节点</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              已选定
            </span>
          </div>

          {/* 分组 1：运行控制与界面 */}
          <div className="space-y-2 mt-5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              运行与控制台
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {VM_OPERATIONS.filter((op) => !op.danger && op.command !== "lock_vms" && op.command !== "unlock_vms").map((op) => {
                const isRunning = runningCommand === op.command;
                const isSpice = op.command === "spice_viewer";

                return (
                  <button
                    className={`flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg transition-colors shadow-xs ${
                      isSpice
                        ? "col-span-2 bg-zinc-900 text-white hover:bg-zinc-800"
                        : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                    disabled={op.disabled || runningCommand !== null}
                    key={op.command}
                    onClick={() => void handleOperation(op)}
                    title={op.tooltip}
                    type="button"
                  >
                    {isRunning ? (
                      <RefreshIcon className="animate-spin-fast" size={13} />
                    ) : (
                      getOperationIcon(op.command)
                    )}
                    <span>{isRunning ? "执行中..." : op.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分组 2：锁定与占用 */}
          <div className="space-y-2 mt-5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              访问控制
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {VM_OPERATIONS.filter((op) => op.command === "lock_vms" || op.command === "unlock_vms").map((op) => {
                const isRunning = runningCommand === op.command;

                return (
                  <button
                    className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg shadow-xs transition-colors"
                    disabled={op.disabled || runningCommand !== null}
                    key={op.command}
                    onClick={() => void handleOperation(op)}
                    title={op.tooltip}
                    type="button"
                  >
                    {isRunning ? (
                      <RefreshIcon className="animate-spin-fast" size={13} />
                    ) : (
                      getOperationIcon(op.command)
                    )}
                    <span>{isRunning ? "处理中..." : op.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分组 3：危险操作 */}
          <div className="space-y-2 mt-5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-red-500">
              维护与危险指令
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {VM_OPERATIONS.filter((op) => op.danger).map((op) => {
                const isRunning = runningCommand === op.command;

                return (
                  <button
                    className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-red-700 bg-red-50/70 border border-red-200/80 hover:bg-red-100/80 rounded-lg shadow-xs transition-colors"
                    disabled={op.disabled || runningCommand !== null}
                    key={op.command}
                    onClick={() => void handleOperation(op)}
                    title={op.tooltip}
                    type="button"
                  >
                    {isRunning ? (
                      <RefreshIcon className="animate-spin-fast text-red-600" size={13} />
                    ) : (
                      <AlertCircleIcon size={14} />
                    )}
                    <span>{isRunning ? "正在强制终止..." : op.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部小贴士 */}
        <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg text-[11px] text-zinc-500 leading-relaxed mt-6">
          提示：所有指令经由集群控制网直接调度，执行状态将实时同步至当前集群会话中。
        </div>
      </aside>
    </div>
  );
}
