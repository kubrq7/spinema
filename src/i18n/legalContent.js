// src/i18n/legalContent.js
// DİKKAT: Bu metin bir ŞABLONDUR, hukuki tavsiye değildir.

export const POLICY_LAST_UPDATED = "24.11.2026";
export const OPERATOR_NAME = "[Kübra Aktaş]";
export const CONTACT_EMAIL = "[codelucid.contact@gmail.com]";
export const GOOGLE_OAUTH_LIVE = true;

export const TMDB_ATTRIBUTION = "This product uses the TMDB API but is not endorsed or certified by TMDB.";

export const LEGAL_LINKS = [
  {
    id: "tmdb-privacy",
    href: "https://www.themoviedb.org/privacy-policy",
    label: { tr: "TMDB Gizlilik Politikası", en: "TMDB Privacy Policy" },
  },
  {
    id: "tmdb-terms",
    href: "https://www.themoviedb.org/api-terms-of-use",
    label: { tr: "TMDB API Kullanım Şartları", en: "TMDB API Terms of Use" },
  },
  {
    id: "youtube-terms",
    href: "https://www.youtube.com/t/terms",
    label: { tr: "YouTube Hizmet Şartları", en: "YouTube Terms of Service" },
  },
  {
    id: "google-privacy",
    href: "https://policies.google.com/privacy",
    label: { tr: "Google Gizlilik Politikası", en: "Google Privacy Policy" },
  },
  {
    id: "google-api-policy",
    href: "https://developers.google.com/terms/api-services-user-data-policy",
    label: {
      tr: "Google API Hizmetleri Kullanıcı Verileri Politikası",
      en: "Google API Services User Data Policy",
    },
  },
  {
    id: "google-fonts",
    href: "https://developers.google.com/fonts/faq/privacy",
    label: { tr: "Google Fonts Gizlilik SSS", en: "Google Fonts Privacy FAQ" },
  },
];

function sectionsTr() {
  const loginParagraphs = GOOGLE_OAUTH_LIVE
    ? [
        "Google ile giriş, Google OAuth 2.0 üzerinden yapılır. Yalnızca temel profil bilgileriniz (ad ve e-posta adresi) istenir; Google şifrenize erişmeyiz.",
        "Google'dan aldığımız veriler yalnızca sizi tanımak ve oturumunuzu yönetmek için kullanılır; reklam amacıyla kullanılmaz, satılmaz ve yasal zorunluluk dışında üçüncü taraflarla paylaşılmaz. SPINEMA'nın Google API Hizmetleri'nden aldığı bilgileri kullanması ve başka uygulamalara aktarması, Sınırlı Kullanım gereklilikleri dahil olmak üzere Google API Hizmetleri Kullanıcı Verileri Politikası'na uygundur.",
      ]
    : [
        "Şu anda giriş penceresi, adınızı ve e-posta adresinizi sizin yazdığınız ve yalnızca cihazınızda saklanan bir yerel profil sistemidir. Google hesabınıza bağlanılmaz ve kimlik doğrulaması yapılmaz.",
        "Google OAuth ile giriş etkinleştirildiğinde yalnızca temel profil bilgileriniz (ad ve e-posta adresi) istenecek ve bu politika buna göre güncellenecektir.",
      ];

  return [
    {
      id: "intro",
      title: "Giriş",
      paragraphs: [
        "SPINEMA, film, dizi ve YouTube içerikleri arasından seçim yapmanıza yardımcı olan bir çark uygulamasıdır. Bu politika hangi verileri işlediğimizi, neden işlediğimizi ve haklarınızı açıklar.",
        `İşletmeci / veri sorumlusu: ${OPERATOR_NAME}. İletişim: ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "data",
      title: "İşlediğimiz veriler",
      bullets: [
        "Hesap bilgileri: giriş yaptığınızda adınız ve e-posta adresiniz.",
        "Kullanıcı içeriği: kaydettikleriniz, çark geçmişiniz, \"Özel Çark\" listeniz (yazdığınız seçenekler ve isteğe bağlı bağlantılar) ve dil tercihiniz.",
        "Teknik veriler: siteyi barındıran sağlayıcı, güvenlik ve işleyiş için IP adresi ve tarayıcı bilgisi gibi standart sunucu kayıtları tutabilir.",
      ],
      paragraphs: ["Şifrenizi veya ödeme bilgilerinizi toplamayız."],
    },
    {
      id: "login",
      title: "Google ile giriş",
      paragraphs: loginParagraphs,
    },
    {
      id: "third",
      title: "Üçüncü taraf hizmetler",
      bullets: [
        "TMDB: film ve dizi afişleri ile bazı açıklamalar TMDB'den gelir. Afişler tarayıcınızdan doğrudan TMDB'nin görsel sunucusundan yüklenir; bu nedenle TMDB IP adresinizi görebilir ve kendi gizlilik politikası ile çerez uygulamaları geçerli olabilir.",
        "YouTube: video bilgileri YouTube API Hizmetleri kullanılarak sağlanır. Video kapakları YouTube'un görsel sunucusundan yüklenir ve bir videoya gittiğinizde YouTube'a yönlendirilirsiniz. YouTube'un kullanımı YouTube Hizmet Şartları'na ve Google Gizlilik Politikası'na tabidir.",
        "Google Fonts: yazı tipleri Google Fonts'tan yüklenir; bu istek Google'a IP adresinizi iletir.",
        "Dış bağlantılar: Netflix, Prime Video, YouTube gibi sitelere giden bağlantılar o sitelerin kendi politikalarına tabidir. Bazı \"ŞİMDİ İZLE\" bağlantıları ortaklık (affiliate) bağlantısı olabilir; bu bağlantılardan yapılan işlemlerde SPINEMA komisyon kazanabilir. Ödeyeceğiniz tutar değişmez.",
      ],
    },
    {
      id: "cookies",
      title: "Çerezler ve yerel depolama",
      paragraphs: [
        "SPINEMA izleme veya reklam çerezi kullanmaz. Oturum bilginizi, listelerinizi, Özel Çark seçeneklerinizi ve dil tercihinizi tarayıcınızın yerel depolamasında (localStorage) saklarız; bu veriler sunucularımıza gönderilmez.",
        "Yukarıdaki üçüncü taraf hizmetler, içeriklerini yüklerken kendi çerezlerini veya benzeri teknolojilerini kullanabilir.",
      ],
    },
    {
      id: "use",
      title: "Verilerin kullanımı ve paylaşımı",
      paragraphs: [
        "Verilerinizi yalnızca hesabınızı tanımak, listelerinizi göstermek ve hizmeti sunmak için kullanırız. Verilerinizi satmayız ve yasal bir zorunluluk olmadıkça üçüncü taraflarla paylaşmayız.",
      ],
    },
    {
      id: "retention",
      title: "Saklama ve silme",
      paragraphs: [
        `Çıkış yaptığınızda oturum kaydınız silinir; kaydedilenleriniz ve geçmişiniz aynı e-postayla tekrar giriş yapmanız için bu cihazda kalır. Tüm verilerinizi tarayıcınızın site verilerini temizleyerek silebilirsiniz. Ayrıca ${CONTACT_EMAIL} adresinden talepte bulunabilirsiniz.`,
      ],
    },
    {
      id: "rights",
      title: "Haklarınız",
      paragraphs: [
        `Yürürlükteki veri koruma mevzuatı (KVKK ve uygulanabildiği ölçüde GDPR) kapsamında verilerinize erişme, düzeltme, silme, işlenmesine itiraz etme ve taşınabilirlik haklarına sahip olabilirsiniz. Taleplerinizi ${CONTACT_EMAIL} adresine iletebilirsiniz.`,
      ],
    },
    {
      id: "children",
      title: "Çocuklar",
      paragraphs: ["SPINEMA 13 yaşın altındaki çocuklara yönelik değildir ve bilerek onlardan veri toplamayız."],
    },
    {
      id: "changes",
      title: "Değişiklikler",
      paragraphs: [
        "Bu politikayı zaman zaman güncelleyebiliriz; güncel sürüm her zaman bu sayfada yer alır.",
      ],
    },
  ];
}

function sectionsEn() {
  const loginParagraphs = GOOGLE_OAUTH_LIVE
    ? [
        "Sign-in with Google uses Google OAuth 2.0. We only request your basic profile information (name and email address); we never have access to your Google password.",
        "Data we receive from Google is used only to recognise you and manage your session. It is not used for advertising, is not sold, and is not shared with third parties except where required by law. SPINEMA's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
      ]
    : [
        "Currently, the sign-in window is a local profile system where you type your own name and email address, which are stored only on your device. It does not connect to your Google account and performs no identity verification.",
        "When sign-in with Google OAuth is enabled, only your basic profile information (name and email address) will be requested and this policy will be updated accordingly.",
      ];

  return [
    {
      id: "intro",
      title: "Introduction",
      paragraphs: [
        "SPINEMA is a wheel app that helps you choose among movies, series and YouTube videos. This policy explains what data we process, why, and what rights you have.",
        `Operator / data controller: ${OPERATOR_NAME}. Contact: ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "data",
      title: "Data we process",
      bullets: [
        "Account details: your name and email address when you sign in.",
        "User content: your saved items, wheel history, your \"Custom Wheel\" list (the options and optional links you type) and your language preference.",
        "Technical data: the hosting provider of the site may keep standard server logs such as IP address and browser information for security and operation.",
      ],
      paragraphs: ["We do not collect your password or payment details."],
    },
    {
      id: "login",
      title: "Sign-in with Google",
      paragraphs: loginParagraphs,
    },
    {
      id: "third",
      title: "Third-party services",
      bullets: [
        "TMDB: movie and series posters and some descriptions come from TMDB. Posters are loaded by your browser directly from TMDB's image servers, so TMDB may see your IP address and its own privacy policy and cookie practices may apply.",
        "YouTube: video information is provided using YouTube API Services. Video thumbnails are loaded from YouTube's image servers and when you open a video you are redirected to YouTube. Use of YouTube is subject to the YouTube Terms of Service and the Google Privacy Policy.",
        "Google Fonts: fonts are loaded from Google Fonts; this request sends your IP address to Google.",
        "External links: links to sites such as Netflix, Prime Video and YouTube are subject to those sites' own policies. Some \"WATCH NOW\" links may be affiliate links; SPINEMA may earn a commission on transactions made through them. The price you pay does not change.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and local storage",
      paragraphs: [
        "SPINEMA does not use tracking or advertising cookies. We store your session, lists, Custom Wheel options and language preference in your browser's local storage (localStorage); this data is not sent to our servers.",
        "The third-party services above may use their own cookies or similar technologies when their content loads.",
      ],
    },
    {
      id: "use",
      title: "How we use and share data",
      paragraphs: [
        "We use your data only to recognise your account, show your lists and provide the service. We do not sell your data and do not share it with third parties unless required by law.",
      ],
    },
    {
      id: "retention",
      title: "Retention and deletion",
      paragraphs: [
        `When you sign out, your session record is deleted; your saved items and history stay on this device so they can be restored if you sign in again with the same email. You can delete all your data by clearing your browser's site data. You can also make a request at ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: [
        `Under applicable data protection law (KVKK and, where applicable, GDPR) you may have the right to access, correct, delete, object to the processing of, and port your data. You can send your requests to ${CONTACT_EMAIL}.`,
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: ["SPINEMA is not directed at children under 13 and we do not knowingly collect data from them."],
    },
    {
      id: "changes",
      title: "Changes",
      paragraphs: ["We may update this policy from time to time; the current version is always available on this page."],
    },
  ];
}

export function getPrivacySections(lang) {
  return lang === "en" ? sectionsEn() : sectionsTr();
}