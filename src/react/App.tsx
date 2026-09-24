import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
  CloseIcon,
  MinusIcon,
  RestoreIcon,
  SquareIcon,
  VDesktopLogoIcon,
} from "./components/Icons";
import { ToastProvider } from "./components/ToastProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

const pageTitles: Record<string, string> = {
  "/home": "虚拟机控制台",
  "/home/index": "虚拟机控制台",
  "/login": "连接凭据配置",
};

function getAppWindow() {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      return getCurrentWindow();
    } catch {
      return null;
    }
  }
  return null;
}

function AppShell() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "连接凭据配置";
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    document.title = `${pageTitle} — VDesktop`;
  }, [pageTitle]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("zh-CN", { hour12: false }));
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const appWindow = getAppWindow();
    if (!appWindow) {
      return;
    }

    void appWindow.isMaximized().then(setIsMaximized).catch(() => {});
    const unlistenPromise = appWindow.onResized(() => {
      void appWindow.isMaximized().then(setIsMaximized).catch(() => {});
    });

    return () => {
      void unlistenPromise.then((unlisten) => unlisten()).catch(() => {});
    };
  }, []);

  const handleMinimize = () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      void appWindow.minimize();
    }
  };

  const handleToggleMaximize = async () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      await appWindow.toggleMaximize();
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleClose = () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      void appWindow.close();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] text-gray-800 selection:bg-[#6d5dfc] selection:text-white">
      {/* 新拟物派自定义窗口顶栏（融合标题栏、拖拽区与应用导航） */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 bg-[#e0e5ec] select-none shadow-[0_4px_10px_#b8bcc2,-0_-2px_6px_#ffffff] border-0"
        data-tauri-drag-region=""
      >
        {/* 左侧：品牌与工程环境 */}
        <div className="flex items-center gap-3" data-tauri-drag-region="">
          <div
            className="flex items-center justify-center w-8 h-8 bg-[#e0e5ec] text-[#6d5dfc] rounded-xl shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] border-0"
            data-tauri-drag-region=""
          >
            <VDesktopLogoIcon size={18} />
          </div>
          <div className="flex items-center gap-2 text-xs" data-tauri-drag-region="">
            <span className="font-semibold tracking-tight text-gray-800" data-tauri-drag-region="">
              VDesktop
            </span>
            <span className="text-gray-400" data-tauri-drag-region="">/</span>
            <span className="text-gray-600 font-medium font-mono" data-tauri-drag-region="">
              Cluster Console
            </span>
          </div>

          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 ml-2 text-xs font-medium text-emerald-700 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] border-0"
            data-tauri-drag-region=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>接入活跃</span>
          </div>
        </div>

        {/* 中间：可拖拽区域与窗口标题 "内网控制台" */}
        <div
          className="flex-1 flex items-center justify-center h-full px-4 cursor-default"
          data-tauri-drag-region=""
          onDoubleClick={() => void handleToggleMaximize()}
        >
          <div
            className="flex items-center gap-2 px-3.5 py-1 text-xs font-medium text-gray-700 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] border-0"
            data-tauri-drag-region=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6d5dfc]" />
            <span className="tracking-wide">内网控制台</span>
            <span className="text-gray-400 font-normal">·</span>
            <span className="text-gray-600">{pageTitle}</span>
          </div>
        </div>

        {/* 右侧：视图标识与新拟物派窗口控制按键 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* 最小化 */}
            <button
              aria-label="最小化窗口"
              className="flex items-center justify-center w-7 h-7 bg-[#e0e5ec] text-gray-600 hover:text-gray-900 rounded-xl shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#b8bcc2,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 ease-in-out border-0"
              onClick={handleMinimize}
              title="最小化"
              type="button"
            >
              <MinusIcon size={12} />
            </button>

            {/* 最大化 / 还原 */}
            <button
              aria-label={isMaximized ? "还原窗口" : "最大化窗口"}
              className="flex items-center justify-center w-7 h-7 bg-[#e0e5ec] text-gray-600 hover:text-gray-900 rounded-xl shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#b8bcc2,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 ease-in-out border-0"
              onClick={() => void handleToggleMaximize()}
              title={isMaximized ? "还原" : "最大化"}
              type="button"
            >
              {isMaximized ? <RestoreIcon size={12} /> : <SquareIcon size={11} />}
            </button>

            {/* 关闭 */}
            <button
              aria-label="关闭窗口"
              className="flex items-center justify-center w-7 h-7 bg-[#e0e5ec] text-red-500 hover:text-red-700 rounded-xl shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#b8bcc2,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 ease-in-out border-0"
              onClick={handleClose}
              title="关闭"
              type="button"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route element={<Navigate replace to="/login" />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<HomePage />} path="/home/index" />
          <Route element={<Navigate replace to="/login" />} path="*" />
        </Routes>
      </main>

      {/* 新拟物派底部状态栏 (沉浸底栏，同色系柔和内凹/浮凸光影) */}
      <footer className="sticky bottom-0 z-20 flex items-center justify-between h-9 px-5 bg-[#e0e5ec] select-none shadow-[0_-4px_10px_#b8bcc2,0_1px_3px_#ffffff] text-[11px] text-gray-500 font-mono border-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-gray-700 font-medium">内网集群网关已接通</span>
          </span>
          <span className="text-gray-400">|</span>
          <span>v1.5.7 · SPICE/TLS</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-gray-500">
          <span className="px-2.5 py-0.5 rounded-xl bg-[#e0e5ec] shadow-[inset_1px_1px_2px_#b8bcc2,inset_-1px_-1px_2px_#ffffff] border-0">
            Soft UI · Fixed Illuminant
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>{currentTime || "--:--:--"}</span>
          <span className="text-gray-400">|</span>
          <span className="text-emerald-700 font-medium">集群状态: 在线</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
