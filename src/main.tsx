import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./react/App";
import "./react/styles.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("未找到应用挂载节点");
}

createRoot(container).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
