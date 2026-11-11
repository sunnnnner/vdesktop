import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyIcon,
  LockIcon,
  RefreshIcon,
  UserIcon,
  VDesktopLogoIcon,
} from "../components/Icons";
import { useToast } from "../components/ToastProvider";
import {
  getErrorMessage,
  isConfigPresent,
  saveConnectionConfig,
  SERVER_OPTIONS,
  type ConnectionConfig,
} from "../lib/tauri";

type EditableField = "appid" | "appsecret" | "name";
type FieldErrors = Partial<Record<EditableField | "server", string>>;

const defaultServer = SERVER_OPTIONS[0];

function createInitialConfig(): ConnectionConfig {
  return {
    appid: "",
    appsecret: "",
    name: "",
    server: defaultServer.value,
    url: defaultServer.url,
  };
}

function validateConfig(config: ConnectionConfig): FieldErrors {
  const errors: FieldErrors = {};

  if (!config.appid.trim()) {
    errors.appid = "请输入 APPID";
  }
  if (!config.appsecret.trim()) {
    errors.appsecret = "请输入 SECRET";
  }
  if (!config.name.trim()) {
    errors.name = "请输入姓名";
  }
  if (!SERVER_OPTIONS.some((server) => server.value === config.server)) {
    errors.server = "请选择有效区域";
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [config, setConfig] = useState<ConnectionConfig>(createInitialConfig);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    void isConfigPresent()
      .then((configExists) => {
        if (active && configExists) {
          navigate("/home/index", { replace: true });
        }
      })
      .catch((configError) => {
        if (active) {
          error(getErrorMessage(configError));
        }
      });

    return () => {
      active = false;
    };
  }, [error, navigate]);

  const updateField = (field: EditableField, value: string) => {
    setConfig((currentConfig) => ({ ...currentConfig, [field]: value }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const selectServer = (serverValue: string) => {
    const selectedServer = SERVER_OPTIONS.find((server) => server.value === serverValue);
    if (!selectedServer) {
      return;
    }

    setConfig((currentConfig) => ({
      ...currentConfig,
      server: selectedServer.value,
      url: selectedServer.url,
    }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, server: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateConfig(config);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await saveConnectionConfig(config);
      success("连接凭据配置成功，正在接入控制台");
      navigate("/home/index", { replace: true });
    } catch (saveError) {
      error(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-8">
      {/* M3 悬浮表面卡片 (Surface Container + 细线边框与微阴影) */}
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200/90 shadow-sm md:shadow-md p-6 sm:p-8"
      >
        {/* 卡片头部：Ant Design 结构排版 + M3 品牌表面色 */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mb-3 shadow-xs">
            <VDesktopLogoIcon size={24} />
          </div>
          <h1 id="login-title" className="font-semibold text-slate-900 text-xl md:text-2xl tracking-tight">
            连接凭据配置
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs">
            配置访问凭证与区域接入点，以安全接入内网计算集群
          </p>
        </div>

        {/* 配置表单：Ant Design 表单规范与输入体验 */}
        <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          {/* APPID */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="appid">
              APPID
            </label>
            <div
              className={`relative flex items-center bg-slate-50/60 hover:bg-slate-50 focus-within:bg-white rounded-lg border transition-all ${
                fieldErrors.appid
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-slate-400">
                <KeyIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appid ? "appid-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appid)}
                autoComplete="username"
                className="w-full h-9 pr-3 text-xs bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400 font-mono"
                id="appid"
                onChange={(event) => updateField("appid", event.currentTarget.value)}
                placeholder="例如: admin"
                type="text"
                value={config.appid}
              />
            </div>
            {fieldErrors.appid && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium" id="appid-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.appid}
              </p>
            )}
          </div>

          {/* SECRET */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="appsecret">
              SECRET 访问密钥
            </label>
            <div
              className={`relative flex items-center bg-slate-50/60 hover:bg-slate-50 focus-within:bg-white rounded-lg border transition-all ${
                fieldErrors.appsecret
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-slate-400">
                <LockIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appsecret ? "appsecret-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appsecret)}
                autoComplete="current-password"
                className="w-full h-9 text-xs bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400 font-mono"
                id="appsecret"
                onChange={(event) => updateField("appsecret", event.currentTarget.value)}
                placeholder="请输入访问密钥"
                type={passwordVisible ? "text" : "password"}
                value={config.appsecret}
              />
              <button
                aria-label={passwordVisible ? "隐藏密码" : "显示密码"}
                className="flex items-center justify-center h-full px-3 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>
            {fieldErrors.appsecret && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium" id="appsecret-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.appsecret}
              </p>
            )}
          </div>

          {/* 姓名 */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="name">
              用户标识 / 姓名
            </label>
            <div
              className={`relative flex items-center bg-slate-50/60 hover:bg-slate-50 focus-within:bg-white rounded-lg border transition-all ${
                fieldErrors.name
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-slate-400">
                <UserIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.name)}
                autoComplete="name"
                className="w-full h-9 pr-3 text-xs bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400"
                id="name"
                onChange={(event) => updateField("name", event.currentTarget.value)}
                placeholder="例如: zhangsan"
                type="text"
                value={config.name}
              />
            </div>
            {fieldErrors.name && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium" id="name-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* 目标节点区域 (M3 Segmented Pill Switcher) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              接入集群区域
            </label>
            <div
              className="flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 gap-1"
              role="radiogroup"
            >
              {SERVER_OPTIONS.map((server) => {
                const isSelected = config.server === server.value;
                return (
                  <button
                    aria-checked={isSelected}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? "bg-white text-blue-600 font-semibold shadow-xs border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                    key={server.value}
                    onClick={() => selectServer(server.value)}
                    role="radio"
                    type="button"
                  >
                    <GlobeIcon size={13} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                    <span>{server.label}节点</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.server && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.server}
              </p>
            )}
          </div>

          {/* 提交按钮 (M3 Filled Button + Ant Design 经典交互) */}
          <div className="pt-2">
            <button
              className="w-full flex items-center justify-center gap-2 h-10 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? (
                <>
                  <RefreshIcon className="animate-spin-fast" size={14} />
                  <span>正在保存凭据...</span>
                </>
              ) : (
                <span>保存并连接</span>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
