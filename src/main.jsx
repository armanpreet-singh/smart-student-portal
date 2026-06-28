import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Disable browser scroll restoration
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.onbeforeunload = () => {
  window.scrollTo(0, 0);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
<BrowserRouter basename={import.meta.env.BASE_URL}>
  <App />
</BrowserRouter>
  </React.StrictMode>
);