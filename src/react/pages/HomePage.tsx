import { useCallback, useEffect, useMemo, useState } from "react";

import type { VmTableData } from "../../types/vm";
import { VmOperationDrawer } from "../components/VmOperationDrawer";
import { useToast } from "../components/ToastProvider";
import {
  getConnectionConfig,
  getErrorMessage,
  getVirtualMachines,
  SERVER_OPTIONS,
  switchConnectionServer,
} from "../lib/tauri";

function formatRefreshTime(): string {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

function serverLabel(server: string): string {
  return SERVER_OPTIONS.find((item) => item.value === server)?.label ?? "未选择";
}

export function HomePage() {
  const { error, success } = useToast();
  const [currentServer, setCurrentServer] = useState("beijing");
  const [lastRefreshTime, setLastRefreshTime] = useState("--");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVm, setSelectedVm] = useState<string | null>(null);
  const [tableData, setTableData] = useState<VmTableData[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const refreshVmList = useCallback(async () => {
    setTableLoading(true);
    try {
      const machines = await getVirtualMachines();
      setTableData(
        machines.map((machine) => ({
          locked: machine.locked_by?.name ?? null,
          name: machine.name,
          no: machine.id,
        })),
      );
      setLastRefreshTime(formatRefreshTime());
    } catch (refreshError) {
      error(getErrorMessage(refreshError));
    } finally {
      setTableLoading(false);
    }
  }, [error]);

  const loadServerConfig = useCallback(async () => {
    try {
      const config = await getConnectionConfig();
      if (config.server) {
        setCurrentServer(config.server);
      }
    } catch (configError) {
      error(getErrorMessage(configError));
    }
  }, [error]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshVmList(), loadServerConfig()]);
  }, [loadServerConfig, refreshVmList]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const lockedCount = useMemo(
    () => tableData.filter((machine) => machine.locked !== null).length,
    [tableData],
  );
  const currentServerLabel = serverLabel(currentServer);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  const handleServerChange = async (nextServer: string) => {
    if (nextServer === currentServer || refreshing) {
      return;
    }

    setRefreshing(true);
    try {
      await switchConnectionServer(nextServer);
      setCurrentServer(nextServer);
      await refreshAll();
      success(`已切换到 ${serverLabel(nextServer)}`);
    } catch (switchError) {
      error(getErrorMessage(switchError));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="home-container">
      <section aria-labelledby="home-title" className="hero-panel">
        <div className="hero-main">
          <p className="section-eyebrow">VDesktop Console</p>
          <h1 id="home-title">虚拟机控制台</h1>
          <p>统一管理开机、关机、锁定与远程连接操作。</p>
        </div>

        <div className="hero-metrics">
          <div className="metric">
            <span>虚拟机总数</span>
            <strong>{tableData.length}</strong>
          </div>
          <div className="metric">
            <span>已锁定</span>
            <strong>{lockedCount}</strong>
          </div>
          <div className="refresh-box">
            <button
              className="secondary-button"
              disabled={refreshing}
              onClick={() => void handleManualRefresh()}
              type="button"
            >
              {refreshing ? "刷新中..." : "立即刷新"}
            </button>
            <span>最近刷新：{lastRefreshTime}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="server-title" className="content-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">连接目标</p>
            <h2 id="server-title">目标服务器</h2>
          </div>
          <span className="status-tag status-tag--ready">{currentServerLabel}</span>
        </div>

        <div aria-label="选择目标服务器" className="server-switcher" role="group">
          {SERVER_OPTIONS.map((server) => (
            <button
              aria-pressed={currentServer === server.value}
              className={
                currentServer === server.value
                  ? "server-switcher-button server-switcher-button--selected"
                  : "server-switcher-button"
              }
              disabled={refreshing}
              key={server.value}
              onClick={() => void handleServerChange(server.value)}
              type="button"
            >
              {server.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="vm-table-title" className="content-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">资源状态</p>
            <h2 id="vm-table-title">虚拟机列表</h2>
          </div>
          <span className="muted-text">仅手动刷新</span>
        </div>

        <div className="table-wrap" tabIndex={0}>
          <table aria-busy={tableLoading}>
            <thead>
              <tr>
                <th scope="col">序号</th>
                <th scope="col">虚拟机名称</th>
                <th scope="col">是否锁定</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td className="table-state" colSpan={4}>
                    正在加载虚拟机...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td className="table-state" colSpan={4}>
                    暂无虚拟机
                  </td>
                </tr>
              ) : (
                tableData.map((machine) => (
                  <tr key={`${machine.no}-${machine.name}`}>
                    <td>{machine.no}</td>
                    <td>{machine.name}</td>
                    <td>
                      {machine.locked ? (
                        <span className="status-tag status-tag--locked">
                          已锁定 · {machine.locked}
                        </span>
                      ) : (
                        <span className="status-tag status-tag--ready">可操作</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => setSelectedVm(machine.name)}
                        type="button"
                      >
                        操作
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedVm && (
        <VmOperationDrawer
          onClose={() => setSelectedVm(null)}
          onOperationCompleted={() => void refreshVmList()}
          vmName={selectedVm}
        />
      )}
    </div>
  );
}
