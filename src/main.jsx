// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { GOOGLE_AUTH_CONFIGURED, GOOGLE_CLIENT_ID } from "./config/google.js";

// Client ID yoksa sağlayıcı hiç kurulmaz; giriş paneli bunu kullanıcıya kibarca bildirir.
const app = <App />;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {GOOGLE_AUTH_CONFIGURED ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </StrictMode>,
);