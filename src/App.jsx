// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { googleLogout } from "@react-oauth/google";
import Header from "./components/Header.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import FilterScreen from "./components/FilterScreen.jsx";
import CustomWheelSetup from "./components/CustomWheelSetup.jsx";
import WheelScreen from "./components/WheelScreen.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import PrivacyModal from "./components/PrivacyModal.jsx";
import Footer from "./components/Footer.jsx";
import { profileFromCredential } from "./auth/googleAuth.js";
import { EMPTY_FILTERS, createCustomItem, getPool } from "./data/mockData.js";
import { MIN_CUSTOM_OPTIONS, loadCustomOptions, saveCustomOptions } from "./data/customWheel.js";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext.jsx";

const USER_KEY = "spinema:user";
const listsKey = (email) => `spinema:lists:${email}`;
const EMPTY_LISTS = { email: null, saved: [], history: [] };
const HISTORY_LIMIT = 50;
const PRIVACY_HASH = "#privacy";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama dolu veya gizli modda: sessizce geç.
  }
}

// Google profil fotoğrafı saklanmaz; ada göre altın gradyanlı, baş harfli bir SVG üretilir.
function makeAvatar(name) {
  const first = (name || "").trim().charAt(0).toUpperCase();
  const initial = /[\p{L}\p{N}]/u.test(first) ? first : "S";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#f5e6a8"/><stop offset="1" stop-color="#8a6d1a"/>' +
    "</linearGradient></defs>" +
    '<rect width="96" height="96" fill="url(#g)"/>' +
    `<text x="48" y="64" font-family="Georgia, serif" font-size="48" font-weight="700" text-anchor="middle" fill="#09090b">${initial}</text>` +
    "</svg>";
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Yalnızca GERÇEK Google girişiyle oluşturulmuş oturumlar kabul edilir.
// Eski sahte (provider: "google-sim") oturumlar bilerek geçersiz sayılır; kullanıcı gerçek girişle yeniden girer.
function normalizeUser(stored) {
  if (!stored || typeof stored.email !== "string" || !stored.email) return null;
  if (stored.provider !== "google") return null;
  const name = typeof stored.name === "string" && stored.name ? stored.name : stored.email.split("@")[0];
  const avatar = typeof stored.avatar === "string" && stored.avatar ? stored.avatar : makeAvatar(name);
  return {
    name,
    email: stored.email,
    avatar,
    provider: "google",
    loggedAt: stored.loggedAt || Date.now(),
  };
}

// OTOMATİK OTURUM: uygulama açılırken tarayıcı hafızası kontrol edilir.
// Not: Google ID token'ı saklanmaz; yalnızca ad ve e-posta tutulur.
function readStoredUser() {
  return normalizeUser(readJSON(USER_KEY, null));
}

// Kayıtlı bir içeriği güncel veri havuzuyla tazeler (görseller, açıklamalar, rozetler).
// Havuzda bulunmayan kayıtlar (ör. Özel Çark öğeleri, eski kayıtlar) olduğu gibi korunur.
function refreshItem(item) {
  if (!item || typeof item !== "object" || !item.id) return null;
  const fresh = getPool(item.type).find((entry) => entry.id === item.id);
  return fresh ? { ...item, ...fresh } : item;
}

function loadLists(email) {
  const stored = readJSON(listsKey(email), {});
  const clean = (list) => (Array.isArray(list) ? list.map(refreshItem).filter(Boolean) : []);
  return { email, saved: clean(stored.saved), history: clean(stored.history) };
}

function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 -top-40 h-[34rem] w-[34rem] animate-pulse rounded-full bg-[#d4af37]/25 [animation-duration:7s]"
        animate={{ x: [0, 140, -40, 0], y: [0, 90, 160, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -right-32 h-[38rem] w-[38rem] animate-pulse rounded-full bg-[#881337]/35 [animation-duration:9s]"
        animate={{ x: [0, -150, 30, 0], y: [0, -100, -170, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-[22rem] w-[22rem] animate-pulse rounded-full bg-[#d4af37]/10 [animation-duration:11s]"
        animate={{ x: [-80, 120, -80], y: [0, 70, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,9,11,0.75)_100%)]" />
    </div>
  );
}

function AppContent() {
  const { t } = useLanguage();

  const [screen, setScreen] = useState("home");
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [profileOpen, setProfileOpen] = useState(false);
  // Dil değişince metin de değişsin diye metin değil, çeviri anahtarı saklanır.
  const [profileHintKey, setProfileHintKey] = useState("");
  const [loginErrorKey, setLoginErrorKey] = useState("");

  // Gizlilik Politikası: footer, profil penceresi veya doğrudan #privacy adresiyle açılır.
  const [privacyOpen, setPrivacyOpen] = useState(
    () => typeof window !== "undefined" && window.location.hash === PRIVACY_HASH,
  );

  // Özel Çark seçenekleri: sayfa yenilense bile kaybolmaz (localStorage).
  const [customOptions, setCustomOptions] = useState(loadCustomOptions);
  const customItems = useMemo(() => customOptions.map(createCustomItem), [customOptions]);

  // Sayfa açılır açılmaz kayıtlı oturum varsa kullanıcı doğrudan giriş yapmış olur.
  const [user, setUser] = useState(readStoredUser);
  const [lists, setLists] = useState(() => {
    const stored = readStoredUser();
    return stored ? loadLists(stored.email) : EMPTY_LISTS;
  });

  // Listeleri yalnızca ilgili kullanıcıya yüklendikten sonra localStorage'a mühürle.
  useEffect(() => {
    if (user && lists.email === user.email) {
      writeJSON(listsKey(user.email), { saved: lists.saved, history: lists.history });
    }
  }, [user, lists]);

  useEffect(() => {
    saveCustomOptions(customOptions);
  }, [customOptions]);

  useEffect(() => {
    const onHashChange = () => setPrivacyOpen(window.location.hash === PRIVACY_HASH);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openPrivacy = () => {
    setPrivacyOpen(true);
    try {
      window.history.replaceState(null, "", PRIVACY_HASH);
    } catch {
      // yoksay
    }
  };

  const closePrivacy = () => {
    setPrivacyOpen(false);
    try {
      if (window.location.hash === PRIVACY_HASH) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    } catch {
      // yoksay
    }
  };

  const goHome = () => {
    setScreen("home");
    setCategory(null);
    setFilters(EMPTY_FILTERS);
  };

  const handleSelectCategory = (key) => {
    setCategory(key);
    setFilters(EMPTY_FILTERS);
    // Özel Çark filtre matrisi yerine kişisel seçenek ekleme ekranını açar.
    setScreen(key === "custom" ? "customSetup" : "filter");
  };

  const handleContinueCustom = () => {
    if (customOptions.length >= MIN_CUSTOM_OPTIONS) setScreen("wheel");
  };

  const openProfile = () => {
    setProfileHintKey("");
    setLoginErrorKey("");
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setProfileHintKey("");
    setLoginErrorKey("");
  };

  // Oturumu mühürler: yalnızca ad ve e-posta localStorage'a yazılır (token saklanmaz).
  const finishLogin = (profile) => {
    const email = profile.email.trim().toLowerCase();
    const name = (profile.name || "").replace(/\s+/g, " ").trim() || email.split("@")[0];
    const session = {
      name,
      email,
      avatar: makeAvatar(name),
      provider: "google",
      loggedAt: Date.now(),
    };
    writeJSON(USER_KEY, session);
    setUser(session);
    setLists(loadLists(email));
    setProfileHintKey("");
    setLoginErrorKey("");
  };

  // GERÇEK Google girişi: GoogleLogin bileşeni başarılı olunca credential (JWT) ile buraya gelir.
  const handleGoogleCredential = (credentialResponse) => {
    try {
      const profile = profileFromCredential(credentialResponse && credentialResponse.credential);
      finishLogin(profile);
    } catch {
      setLoginErrorKey("login.errToken");
    }
  };

  // Kullanıcı pencereyi kapattı, açılır pencere engellendi vb.
  const handleGoogleError = () => {
    setLoginErrorKey("login.errGoogle");
  };

  const handleLogout = () => {
    try {
      // Google'ın bu tarayıcıdaki otomatik giriş seçimini kapatır.
      googleLogout();
    } catch {
      // yoksay
    }
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // yoksay
    }
    setUser(null);
    setLists(EMPTY_LISTS);
  };

  const isSaved = (id) => lists.saved.some((item) => item.id === id);

  const handleToggleSave = (item) => {
    if (!user) {
      setProfileHintKey("hint.saveLogin");
      setProfileOpen(true);
      return;
    }
    setLists((prev) => {
      const exists = prev.saved.some((s) => s.id === item.id);
      return {
        ...prev,
        saved: exists
          ? prev.saved.filter((s) => s.id !== item.id)
          : [{ ...item, savedAt: Date.now() }, ...prev.saved],
      };
    });
  };

  const handleRemoveSaved = (id) => {
    setLists((prev) => ({ ...prev, saved: prev.saved.filter((s) => s.id !== id) }));
  };

  const handleResult = (item) => {
    if (!user) return;
    setLists((prev) => ({
      ...prev,
      history: [{ ...item, watchedAt: Date.now() }, ...prev.history.filter((h) => h.id !== item.id)].slice(
        0,
        HISTORY_LIMIT,
      ),
    }));
  };

  const handleClearHistory = () => {
    setLists((prev) => ({ ...prev, history: [] }));
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#09090b] font-sans text-zinc-100 supports-[height:100dvh]:h-dvh">
      <AmbientBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Header user={user} onHome={goHome} onProfile={openProfile} />

        <main className="flex min-h-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            {screen === "home" && (
              <HomeScreen key="home" onSelect={handleSelectCategory} customCount={customOptions.length} />
            )}

            {screen === "filter" && category && (
              <FilterScreen
                key="filter"
                category={category}
                filters={filters}
                onChange={setFilters}
                onBack={goHome}
                onContinue={() => setScreen("wheel")}
              />
            )}

            {screen === "customSetup" && (
              <CustomWheelSetup
                key="customSetup"
                options={customOptions}
                onChange={setCustomOptions}
                onBack={goHome}
                onContinue={handleContinueCustom}
              />
            )}

            {screen === "wheel" && category && (
              <WheelScreen
                key="wheel"
                category={category}
                filters={filters}
                customItems={customItems}
                isSaved={isSaved}
                onBack={() => setScreen(category === "custom" ? "customSetup" : "filter")}
                onResult={handleResult}
                onSave={handleToggleSave}
              />
            )}
          </AnimatePresence>
        </main>

        <Footer onOpenPrivacy={openPrivacy} />
      </div>

      <ProfileModal
        open={profileOpen}
        hint={profileHintKey ? t(profileHintKey) : ""}
        error={loginErrorKey ? t(loginErrorKey) : ""}
        user={user}
        saved={lists.saved}
        history={lists.history}
        onClose={closeProfile}
        onGoogleCredential={handleGoogleCredential}
        onGoogleError={handleGoogleError}
        onLogout={handleLogout}
        onRemoveSaved={handleRemoveSaved}
        onClearHistory={handleClearHistory}
        onOpenPrivacy={openPrivacy}
      />

      <PrivacyModal open={privacyOpen} onClose={closePrivacy} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}