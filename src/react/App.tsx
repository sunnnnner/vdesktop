import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ToastProvider } from "./components/ToastProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

const pageTitles: Record<string, string> = {
  "/home": "虚拟机控制台",
  "/home/index": "虚拟机控制台",
  "/login": "登录配置",
};

function AppShell() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "登录配置";

  useEffect(() => {
    document.title = `${pageTitle} | VDesktop`;
  }, [pageTitle]);

  return (
    <div className="app-shell">
      <header className="app-statusbar">
        <div className="status-drag-rail" data-tauri-drag-region="" />
        <div className="status-inner" data-tauri-drag-region="">
          <span className="status-title" data-tauri-drag-region="">
            内网控制台
          </span>
          <span className="status-page" data-tauri-drag-region="">
            {pageTitle}
          </span>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route element={<Navigate replace to="/login" />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<HomePage />} path="/home/index" />
          <Route element={<Navigate replace to="/login" />} path="*" />
        </Routes>
      </main>
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
