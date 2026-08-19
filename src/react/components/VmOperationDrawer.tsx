import { useEffect, useState } from "react";

import {
  getErrorMessage,
  runVmOperation,
  type VmOperation,
  VM_OPERATIONS,
} from "../lib/tauri";
import { useToast } from "./ToastProvider";

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
      success(`${operation.label}成功`);
      onOperationCompleted();
    } catch (operationError) {
      error(getErrorMessage(operationError));
    } finally {
      setRunningCommand(null);
    }
  };

  return (
    <div className="drawer-backdrop" onMouseDown={onClose} role="presentation">
      <aside
        aria-label={`虚拟机 ${vmName} 的操作`}
        aria-modal="true"
        className="operation-drawer"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="drawer-header">
          <div>
            <p className="section-eyebrow">虚拟机操作</p>
            <h2>{vmName}</h2>
          </div>
          <button
            aria-label="关闭操作面板"
            className="icon-button"
            onClick={onClose}
            title="关闭"
            type="button"
          >
            x
          </button>
        </header>

        <p className="drawer-tip">操作将立即作用于当前虚拟机，请确认后执行。</p>

        <div className="operation-grid">
          {VM_OPERATIONS.map((operation) => {
            const isRunning = runningCommand === operation.command;
            const className = operation.danger
              ? "operation-button operation-button--danger"
              : "operation-button";

            return (
              <button
                className={className}
                disabled={operation.disabled || runningCommand !== null}
                key={operation.command}
                onClick={() => void handleOperation(operation)}
                title={operation.tooltip}
                type="button"
              >
                {isRunning ? "处理中..." : operation.label}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
