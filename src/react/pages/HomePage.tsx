import { useCallback, useEffect, useMemo, useState } from "react";

import type { VmTableData } from "../../types/vm";
import {
  AlertCircleIcon,
  GlobeIcon,
  LockIcon,
  PlayIcon,
  PowerIcon,
  RefreshIcon,
  ServerIcon,
  TerminalIcon,
  UnlockIcon,
  VmIcon,
} from "../components/Icons";
import { useToast } from "../components/ToastProvider";
import {
  getConnectionConfig,
  getErrorMessage,
  getVirtualMachines,
  runVmOperation,
  SERVER_OPTIONS,
  switchConnectionServer,
  type VmOperationCommand,
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
  const [tableData, setTableData] = useState<VmTableData[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [runningOp, setRunningOp] = useState<{ vmName: string; command: VmOperationCommand } | null>(null);

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
      success("实例数据同步完成");
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
      success(`已切换集群至 ${serverLabel(nextServer)}`);
    } catch (switchError) {
      error(getErrorMessage(switchError));
    } finally {
      setRefreshing(false);
    }
  };

  const handleVmAction = async (
    vmName: string,
    command: VmOperationCommand,
    label: string,
    isDanger = false,
  ) => {
    if (runningOp !== null) {
      return;
    }

    if (
      isDanger &&
      !window.confirm(`确定要强制关闭虚拟机“${vmName}”吗？未保存的数据可能丢失。`)
    ) {
      return;
    }

    setRunningOp({ vmName, command });
    try {
      await runVmOperation(command, vmName);
      success(`${label}指令已下发`);
      await refreshVmList();
    } catch (opError) {
      error(getErrorMessage(opError));
    } finally {
      setRunningOp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部 Page Header：Ant Design 经典页面标题 + M3 柔和操作按钮 */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            虚拟机实例
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            实时监控集群内虚拟化计算资源的运行状态、会话锁定与远程访问
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 shadow-xs transition-all disabled:opacity-50"
            disabled={refreshing || tableLoading}
            onClick={() => void handleManualRefresh()}
            title="刷新集群虚拟机列表"
            type="button"
          >
            <RefreshIcon className={refreshing || tableLoading ? "animate-spin-fast text-blue-600" : "text-slate-500"} size={13} />
            <span>{refreshing || tableLoading ? "同步中..." : "同步数据"}</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {lastRefreshTime !== "--" ? `上次同步 ${lastRefreshTime}` : "尚未同步"}
          </span>
        </div>
      </section>

      {/* 统计指标卡片 (M3 表面容器 Surface Container + Ant Design 统计卡片布局) */}
      <section aria-label="集群资源概览" className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        {/* 卡片 1: 总分配实例 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">总分配实例</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <VmIcon size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {tableData.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">台虚拟机</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">资源节点就绪，支持一键远程连接</p>
        </div>

        {/* 卡片 2: 当前会话锁定 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">当前会话锁定</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <LockIcon size={16} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-600 font-mono">
              {lockedCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">已占用会话</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {lockedCount > 0 ? "已有用户独占远程桌面通道" : "暂无会话占用，全部空闲"}
          </p>
        </div>

        {/* 卡片 3: 活动接入集群 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">活动接入集群</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ServerIcon size={16} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-semibold tracking-tight text-slate-900">
              {currentServerLabel}节点
            </span>
            <span className="text-xs text-emerald-600 font-mono font-medium">(在线)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">TLS 加密直连通道正常握手</p>
        </div>
      </section>

      {/* 节点选择与列表主卡片 (Ant Design 企业级表格 + M3 胶囊分段控制器) */}
      <section aria-labelledby="cluster-instances-title" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* 卡片顶控制条 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/80 bg-slate-50/40">
          <div className="flex items-center gap-2.5">
            <h2 id="cluster-instances-title" className="text-sm font-semibold text-slate-900 tracking-tight">
              集群实例列表
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              共 {tableData.length} 台
            </span>
          </div>

          {/* 集群筛选 Tabs (M3 Segmented Pill Switcher) */}
          <div className="flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 gap-1 self-start sm:self-auto" role="group">
            {SERVER_OPTIONS.map((server) => {
              const isActive = currentServer === server.value;
              return (
                <button
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-blue-600 font-semibold shadow-xs border border-slate-200/40"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  disabled={refreshing}
                  key={server.value}
                  onClick={() => void handleServerChange(server.value)}
                  type="button"
                >
                  <GlobeIcon size={12} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  <span>{server.label}集群</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 表格容器：严格的 Ant Design 数据表格排版与交互体验 */}
        <div className="overflow-x-auto">
          <table aria-busy={tableLoading} className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="w-16 py-3 px-4 text-center">序号</th>
                <th className="py-3 px-4 min-w-[150px]">实例名称</th>
                <th className="py-3 px-4 min-w-[160px]">状态与占用者</th>
                <th className="py-3 px-4 text-right min-w-[340px]">快捷操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tableLoading ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshIcon className="animate-spin-fast text-blue-600" size={20} />
                      <span className="text-xs text-slate-600">正在从集群同步虚拟机数据...</span>
                    </div>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <VmIcon size={30} className="text-slate-300" />
                      <span className="text-xs text-slate-500">当前集群节点下暂无实例</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.map((machine) => {
                  const isLocked = Boolean(machine.locked);
                  const isBusy = runningOp !== null;
                  const isThisVmRunning = (cmd: VmOperationCommand) =>
                    runningOp?.vmName === machine.name && runningOp?.command === cmd;

                  return (
                    <tr
                      key={`${machine.no}-${machine.name}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* 序号 */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                        {String(machine.no).padStart(2, "0")}
                      </td>

                      {/* 实例名称 */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 font-medium text-slate-900">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/60">
                            <VmIcon size={14} />
                          </div>
                          <span className="font-medium text-sm text-slate-900">{machine.name}</span>
                        </div>
                      </td>

                      {/* 状态与占用者 (M3 Pill Badge + Ant Design Status Dot) */}
                      <td className="py-3 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 rounded-full border border-amber-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>已锁定 · {machine.locked}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>空闲就绪</span>
                          </span>
                        )}
                      </td>

                      {/* 快捷操作按钮组：Ant Design 严格层级 (Primary / Default / Danger) */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* 1. 启动远程连接 (核心 Primary 按钮) */}
                          <button
                            className="inline-flex items-center gap-1.5 h-7.5 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => void handleVmAction(machine.name, "spice_viewer", "启动界面")}
                            title="启动 Remote Viewer 远程桌面并锁定"
                            type="button"
                          >
                            {isThisVmRunning("spice_viewer") ? (
                              <RefreshIcon className="animate-spin-fast" size={12} />
                            ) : (
                              <TerminalIcon size={12} />
                            )}
                            <span>{isThisVmRunning("spice_viewer") ? "启动中" : "连接"}</span>
                          </button>

                          {/* 2. 开机 (Default 按钮) */}
                          <button
                            className="inline-flex items-center gap-1 h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 shadow-xs transition-all disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => void handleVmAction(machine.name, "start_vms", "开机")}
                            title="开启虚拟机"
                            type="button"
                          >
                            {isThisVmRunning("start_vms") ? (
                              <RefreshIcon className="animate-spin-fast" size={12} />
                            ) : (
                              <PlayIcon size={12} />
                            )}
                            <span>开机</span>
                          </button>

                          {/* 3. 关机 (Default 按钮) */}
                          <button
                            className="inline-flex items-center gap-1 h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 shadow-xs transition-all disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => void handleVmAction(machine.name, "stop_vms", "关机")}
                            title="正常关闭虚拟机"
                            type="button"
                          >
                            {isThisVmRunning("stop_vms") ? (
                              <RefreshIcon className="animate-spin-fast" size={12} />
                            ) : (
                              <PowerIcon size={12} />
                            )}
                            <span>关机</span>
                          </button>

                          {/* 4. 锁定 / 解锁 */}
                          {isLocked ? (
                            <button
                              className="inline-flex items-center gap-1 h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-amber-700 bg-white hover:bg-amber-50/50 active:bg-amber-50 rounded-lg border border-slate-200 hover:border-amber-300 shadow-xs transition-all disabled:opacity-50"
                              disabled={isBusy}
                              onClick={() => void handleVmAction(machine.name, "unlock_vms", "解锁")}
                              title="解除当前锁定"
                              type="button"
                            >
                              {isThisVmRunning("unlock_vms") ? (
                                <RefreshIcon className="animate-spin-fast" size={12} />
                              ) : (
                                <UnlockIcon size={12} />
                              )}
                              <span>解锁</span>
                            </button>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 h-7.5 px-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 shadow-xs transition-all disabled:opacity-50"
                              disabled={isBusy}
                              onClick={() => void handleVmAction(machine.name, "lock_vms", "锁定")}
                              title="锁定当前虚拟机"
                              type="button"
                            >
                              {isThisVmRunning("lock_vms") ? (
                                <RefreshIcon className="animate-spin-fast" size={12} />
                              ) : (
                                <LockIcon size={12} />
                              )}
                              <span>锁定</span>
                            </button>
                          )}

                          {/* 5. 强制关机 (Danger 红色幽灵/边框按钮) */}
                          <button
                            className="inline-flex items-center gap-1 h-7.5 px-2.5 text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 active:bg-red-100 rounded-lg border border-red-200/80 hover:border-red-300 shadow-xs transition-all disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => void handleVmAction(machine.name, "force_stop_vms", "强制关机", true)}
                            title="立即断电强制关闭"
                            type="button"
                          >
                            {isThisVmRunning("force_stop_vms") ? (
                              <RefreshIcon className="animate-spin-fast" size={12} />
                            ) : (
                              <AlertCircleIcon size={12} />
                            )}
                            <span>强关</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
