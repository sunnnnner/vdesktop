import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getErrorMessage,
  isConfigPresent,
  saveConnectionConfig,
  SERVER_OPTIONS,
  type ConnectionConfig,
} from "../lib/tauri";
import { useToast } from "../components/ToastProvider";

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
      success("保存成功");
      navigate("/home/index", { replace: true });
    } catch (saveError) {
      error(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-page">
      <section aria-labelledby="login-title" className="login-panel">
        <div className="login-header">
          <p className="section-eyebrow">VDesktop</p>
          <h1 id="login-title">连接配置</h1>
          <p>填写凭据并选择区域，然后进入虚拟机控制台。</p>
        </div>

        <form noValidate onSubmit={(event) => void handleSubmit(event)}>
          <label className="form-field" htmlFor="appid">
            <span>APPID</span>
            <input
              aria-describedby={fieldErrors.appid ? "appid-error" : undefined}
              aria-invalid={Boolean(fieldErrors.appid)}
              autoComplete="username"
              id="appid"
              onChange={(event) => updateField("appid", event.currentTarget.value)}
              placeholder="输入 APPID"
              type="text"
              value={config.appid}
            />
            {fieldErrors.appid && (
              <span className="form-error" id="appid-error" role="alert">
                {fieldErrors.appid}
              </span>
            )}
          </label>

          <label className="form-field" htmlFor="appsecret">
            <span>SECRET</span>
            <span className="password-field">
              <input
                aria-describedby={fieldErrors.appsecret ? "appsecret-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appsecret)}
                autoComplete="current-password"
                id="appsecret"
                onChange={(event) => updateField("appsecret", event.currentTarget.value)}
                placeholder="输入 APP Secret"
                type={passwordVisible ? "text" : "password"}
                value={config.appsecret}
              />
              <button
                className="input-action"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? "隐藏" : "显示"}
              </button>
            </span>
            {fieldErrors.appsecret && (
              <span className="form-error" id="appsecret-error" role="alert">
                {fieldErrors.appsecret}
              </span>
            )}
          </label>

          <label className="form-field" htmlFor="name">
            <span>姓名</span>
            <input
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              id="name"
              onChange={(event) => updateField("name", event.currentTarget.value)}
              placeholder="例如：zhangsan"
              type="text"
              value={config.name}
            />
            {fieldErrors.name && (
              <span className="form-error" id="name-error" role="alert">
                {fieldErrors.name}
              </span>
            )}
          </label>

          <fieldset className="server-field">
            <legend>指定区域</legend>
            <div className="server-options" role="radiogroup">
              {SERVER_OPTIONS.map((server) => (
                <label className="server-option" key={server.value}>
                  <input
                    checked={config.server === server.value}
                    name="server"
                    onChange={() => selectServer(server.value)}
                    type="radio"
                    value={server.value}
                  />
                  <span>{server.label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.server && (
              <span className="form-error" role="alert">
                {fieldErrors.server}
              </span>
            )}
          </fieldset>

          <button className="primary-button submit-button" disabled={saving} type="submit">
            {saving ? "保存中..." : "保存并进入"}
          </button>
        </form>
      </section>
    </div>
  );
}
