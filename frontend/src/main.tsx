import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#13131f",
          color: "#e2e8f0",
          border: "1px solid #1e1e30",
          fontFamily: "Inter, sans-serif",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#13131f" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#13131f" } },
      }}
    />
  </React.StrictMode>,
);
