// src/auth/googleAuth.js
import { jwtDecode } from "jwt-decode";
import { GOOGLE_CLIENT_ID } from "../config/google.js";

const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
export function profileFromCredential(credential) {
  if (typeof credential !== "string" || !credential) throw new Error("missing-credential");

  const claims = jwtDecode(credential); // geçersiz token'da hata fırlatır

  if (!GOOGLE_ISSUERS.includes(claims.iss)) throw new Error("bad-issuer");

  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience.includes(GOOGLE_CLIENT_ID)) throw new Error("bad-audience");

  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) throw new Error("expired");

  if (!claims.email || claims.email_verified === false || claims.email_verified === "false") {
    throw new Error("unverified-email");
  }

  const email = String(claims.email).trim().toLowerCase();
  const name = String(claims.name || claims.given_name || email.split("@")[0])
    .replace(/\s+/g, " ")
    .trim();

  return { name, email };
}