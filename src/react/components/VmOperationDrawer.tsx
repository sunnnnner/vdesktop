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
      className="fixed inset-0 z-50 flex justify-end bg-[#8b919a]/35 backdrop-blur-[1px]"
      onMouseDown={onClose}
      role="presentation"
    >
      <aside
        aria-label={`虚拟机 ${vmName} 的操作面板`}
        aria-modal="true"
        className="w-full max-w-[380px] h-full bg-[#e0e5ec] border-0 p-6 overflow-y-auto shadow-[-8px_0px_20px_#b8bcc2,-0px_-0px_20px_#ffffff] flex flex-col justify-between"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div>
          {/* 头部标题与关闭 */}
          <header className="flex items-center justify-between pb-3.5 border-b border-[#cbd2db]/60">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-gray-800">
                实例控制台
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                Instance Control Session
              </p>
            </div>
            <button
              aria-label="关闭控制面板"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#e0e5ec] text-gray-500 hover:text-gray-800 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#b8bcc2,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 ease-in-out border-0"
              onClick={onClose}
              title="关闭"
              type="button"
            >
              <CloseIcon size={14} />
            </button>
          </header>

          {/* 目标虚拟机概况 */}
          <div className="flex items-center justify-between p-3.5 my-4 bg-[#e0e5ec] rounded-xl shadow-[inset_3px_3px_6px_#b8bcc2,inset_-3px_-3px_6px_#ffffff] border-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#e0e5ec] text-[#6d5dfc] shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff]">
                <VmIcon size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">{vmName}</div>
                <div className="text-[11px] text-gray-500">集群分配节点</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-[#e0e5ec] px-2.5 py-1 rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              已选定
            </span>
          </div>

          {/* 分组 1：运行控制与界面 */}
          <div className="space-y-2 mt-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              运行与控制台
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {VM_OPERATIONS.filter((op) => !op.danger && op.command !== "lock_vms" && op.command !== "unlock_vms").map((op) => {
                const isRunning = runningCommand === op.command;
                const isSpice = op.command === "spice_viewer";

                return (
                  <button
                    className={`flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium rounded-xl transition-all duration-300 ease-in-out border-0 ${
                      isSpice
                        ? "col-span-2 bg-[#6d5dfc] text-white shadow-[6px_6px_12px_#b8bcc2,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff]"
                        : "bg-[#e0e5ec] text-gray-700 shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#b8bcc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8bcc2,inset_-3px_-3px_6px_#ffffff]"
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
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              访问控制
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {VM_OPERATIONS.filter((op) => op.command === "lock_vms" || op.command === "unlock_vms").map((op) => {
                const isRunning = runningCommand === op.command;

                return (
                  <button
                    className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-gray-700 bg-[#e0e5ec] rounded-xl shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#b8bcc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8bcc2,inset_-3px_-3px_6px_#ffffff] transition-all duration-300 ease-in-out border-0 disabled:opacity-50"
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
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-600">
              维护与危险指令
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {VM_OPERATIONS.filter((op) => op.danger).map((op) => {
                const isRunning = runningCommand === op.command;

                return (
                  <button
                    className="flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-red-600 bg-[#e0e5ec] rounded-xl shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#b8bcc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8bcc2,inset_-3px_-3px_6px_#ffffff] transition-all duration-300 ease-in-out border-0 disabled:opacity-50"
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
        <div className="p-3.5 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] text-[11px] text-gray-500 leading-relaxed mt-6 border-0">
          提示：所有指令经由集群控制网直接调度，执行状态将实时同步至当前集群会话中。
        </div>
      </aside>
    </div>
  );
}
