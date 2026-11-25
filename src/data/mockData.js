// src/data/mockData.js
import artwork from "./artwork.js";
import summariesEn from "./summariesEn.js";

/* ===================== SABİTLER ===================== */
export const CATEGORY_LABELS = { dizi: "Dizi", film: "Film", youtube: "YouTube", custom: "Özel Çark" };

// [Dizi & Film] mood
export const MOOD_IMDB = "IMDb +8";
export const MOODS = [MOOD_IMDB, "Popüler/Güncel", "Nostalji kuşağı", "Kült klasikler", "Ödüllü Başyapıtlar"];

// [Dizi & Film] genre
export const GENRES = [
  "Aksiyon", "Macera", "Sci-Fi", "Siberpunk", "Gerilim", "Psikolojik Gizem", "Suç/Polisiye", "Sitcom",
  "Romantik", "Epik Fantastik", "Tarih", "Biyografi", "Anime", "Animasyon", "Korku", "Distopya",
];

// [Dizi & Film] platform
export const PLATFORMS = ["Netflix", "Prime Video", "Disney+", "Apple TV+", "HBO", "BluTV", "MUBI", "Gain", "Exxen"];

// [YouTube] culture (Kanal Kültürü / Tarz)
export const YT_CULTURES = [
  "Video Essay (Fikir Yazısı/Deneme Tarzı)",
  "Belgesel Sinema / Uzun Metraj Kalitesi",
  "Sesli Anlatım / Video-Podcast",
];

// [YouTube] category (Derinleşmiş Kategoriler)
export const YT_CATEGORIES = [
  "Uzay & Astrofizik",
  "Kuantum & Bilim",
  "Tarih & Savaşlar",
  "Yazılım & Teknoloji",
  "Finans & Ekonomi",
  "Psikoloji & Davranış Bilimleri",
  "Biyografi & İlham",
  "Suç & Gizem Analizleri",
  "Sinema & Sanat Teorisi",
  "Felsefe & Varoluşçuluk",
];

// Filtre durumunun tek kaynağı: Dönem ve Süre alanları YOKTUR.
export const EMPTY_FILTERS = { mood: [], genre: [], platform: [], culture: [], category: [] };

/* ===================== OTOMATİK GÖRSELLER (internet gerektirmez) ===================== */
const escapeXml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function wrapTitle(text, maxChars, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
  return kept;
}

function makeArt({ kind, title, subtitle, width, height }) {
  const hash = hashString(title);
  const warm = hash % 2 === 0;
  const glowA = warm ? "#d4af37" : "#881337";
  const glowB = warm ? "#881337" : "#d4af37";
  const ax = 15 + (hash % 55);
  const ay = 15 + ((hash >>> 4) % 45);
  const bx = 100 - ax;
  const by = 100 - ay;
  const isPoster = height > width;
  const fontSize = isPoster ? 56 : 64;
  const lineHeight = Math.round(fontSize * 1.2);
  const lines = wrapTitle(title, isPoster ? 15 : 24, isPoster ? 6 : 4);
  const firstBaseline = Math.round((height - lines.length * lineHeight) / 2 + fontSize * 0.85);
  const cx = width / 2;

  const titleSvg = lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${firstBaseline + i * lineHeight}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" fill="#f4e4a6">${escapeXml(line)}</text>`,
    )
    .join("");

  const subtitleSvg = subtitle
    ? `<text x="${cx}" y="${height - 56}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#a1a1aa">${escapeXml(subtitle)}</text>`
    : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0d12"/><stop offset="1" stop-color="#16090f"/></linearGradient>` +
    `<radialGradient id="ga" cx="${ax}%" cy="${ay}%" r="65%"><stop offset="0" stop-color="${glowA}" stop-opacity="0.45"/><stop offset="1" stop-color="${glowA}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="gb" cx="${bx}%" cy="${by}%" r="65%"><stop offset="0" stop-color="${glowB}" stop-opacity="0.4"/><stop offset="1" stop-color="${glowB}" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    `<rect width="${width}" height="${height}" fill="url(#ga)"/>` +
    `<rect width="${width}" height="${height}" fill="url(#gb)"/>` +
    `<rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="24" fill="none" stroke="#d4af37" stroke-opacity="0.35" stroke-width="2"/>` +
    `<text x="${cx}" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="8" fill="#d4af37">${escapeXml(kind)}</text>` +
    `<line x1="${cx - 60}" y1="94" x2="${cx + 60}" y2="94" stroke="#d4af37" stroke-opacity="0.6" stroke-width="2"/>` +
    titleSvg +
    subtitleSvg +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const wideImage = (kind, title, subtitle) => makeArt({ kind, title, subtitle, width: 1280, height: 720 });
const posterImage = (kind, title, subtitle) => makeArt({ kind, title, subtitle, width: 600, height: 900 });

/* ===================== YÖNLENDİRME (targetUrl) ===================== */
// Aşağıdaki bağlantıları kendi ortaklık (affiliate / ref) linklerinizle değiştirebilirsiniz.
const PLATFORM_LINKS = {
  Netflix: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  "Prime Video": (title) => `https://www.primevideo.com/search/?phrase=${encodeURIComponent(title)}`,
  "Disney+": () => "https://www.disneyplus.com",
  "Apple TV+": () => "https://tv.apple.com",
  HBO: () => "https://www.hbomax.com",
  BluTV: () => "https://www.blutv.com",
  MUBI: () => "https://mubi.com",
  Gain: () => "https://www.gain.tv",
  Exxen: () => "https://www.exxen.com",
};

function buildStreamingUrl(item) {
  const searchTitle = item.title.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const builder = PLATFORM_LINKS[item.platforms[0]];
  return builder ? builder(searchTitle) : "https://www.justwatch.com";
}

function buildYoutubeUrl(item) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.channel} ${item.title}`)}`;
}

/* ===================== FİLM (100) ===================== */
const FILMS_RAW = [
  { id: "film-01", title: "The Matrix", year: 1999, imdb: 8.7, director: "Lana & Lilly Wachowski",
    genres: ["Aksiyon", "Sci-Fi", "Siberpunk", "Distopya"], platforms: ["HBO"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Bir bilgisayar korsanı, gerçekliğin makinelerin kurduğu bir simülasyon olduğunu keşfeder." },
  { id: "film-02", title: "Blade Runner", year: 1982, imdb: 8.1, director: "Ridley Scott",
    genres: ["Sci-Fi", "Siberpunk", "Distopya", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Yağmurlu bir Los Angeles'ta bir avcı, kaçak replikantları izlerken insanlığın sınırını sorgular." },
  { id: "film-03", title: "Blade Runner 2049", year: 2017, imdb: 8.0, director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Siberpunk", "Distopya"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Yeni nesil bir replikant avcısı, geçmişi değiştirebilecek gömülü bir sırrın izini sürer." },
  { id: "film-04", title: "Inception", year: 2010, imdb: 8.8, director: "Christopher Nolan",
    genres: ["Sci-Fi", "Aksiyon", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel", "Kült klasikler"],
    summary: "Rüyalara girerek fikir çalan bir hırsız, bir zihne fikir yerleştirmeye çalışır." },
  { id: "film-05", title: "Interstellar", year: 2014, imdb: 8.7, director: "Christopher Nolan",
    genres: ["Sci-Fi", "Macera"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Bir grup astronot, yok olan Dünya'ya yeni bir yuva aramak için solucan deliğinden geçer." },
  { id: "film-06", title: "Dune", year: 2021, imdb: 8.0, director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Epik Fantastik", "Macera"], platforms: ["HBO"], moods: ["Popüler/Güncel"],
    summary: "Genç Paul Atreides, ailesi çöl gezegeni Arrakis'e yerleşince kaderiyle yüzleşir." },
  { id: "film-07", title: "Dune: Part Two", year: 2024, imdb: 8.5, director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Epik Fantastik", "Macera", "Aksiyon"], platforms: ["HBO"], moods: ["Popüler/Güncel"],
    summary: "Paul, Fremenlerle birleşip intikam ve çölün kaderi için savaşa girer." },
  { id: "film-08", title: "Ex Machina", year: 2014, imdb: 7.7, director: "Alex Garland",
    genres: ["Sci-Fi", "Psikolojik Gizem", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Genç bir programcı, bir yapay zekâ robotunun bilincini test etmekle görevlendirilir." },
  { id: "film-09", title: "Her", year: 2013, imdb: 8.0, director: "Spike Jonze",
    genres: ["Romantik", "Sci-Fi"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Yalnız bir yazar, gelişmiş bir yapay zekâ işletim sistemine âşık olur." },
  { id: "film-10", title: "Arrival", year: 2016, imdb: 7.9, director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Gerilim"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Bir dil bilimci, Dünya'ya inen uzaylılarla iletişim kurarken zamanın doğasını yeniden düşünür." },
  { id: "film-11", title: "Akira", year: 1988, imdb: 8.0, director: "Katsuhiro Otomo",
    genres: ["Anime", "Animasyon", "Siberpunk", "Distopya", "Aksiyon"], platforms: ["MUBI"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Neo-Tokyo'da bir motosiklet çetesi üyesi, yıkıcı psişik güçlerin ortasında kalır." },
  { id: "film-12", title: "Ghost in the Shell", year: 1995, imdb: 7.9, director: "Mamoru Oshii",
    genres: ["Anime", "Animasyon", "Siberpunk", "Sci-Fi"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Siber bir ajan, kimliğini sorgularken gizemli bir hacker'ın peşine düşer." },
  { id: "film-13", title: "Terminator 2: Judgment Day", year: 1991, imdb: 8.6, director: "James Cameron",
    genres: ["Aksiyon", "Sci-Fi"], platforms: ["Prime Video"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Geleceğin lideri olacak çocuğu korumak için bir makine, daha gelişmiş bir katile karşı savaşır." },
  { id: "film-14", title: "Alien", year: 1979, imdb: 8.5, director: "Ridley Scott",
    genres: ["Sci-Fi", "Korku"], platforms: ["Disney+"], moods: ["Kült klasikler"],
    summary: "Nostromo mürettebatı, gemiye sızan ölümcül bir yaratıkla baş etmeye çalışır." },
  { id: "film-15", title: "Back to the Future", year: 1985, imdb: 8.5, director: "Robert Zemeckis",
    genres: ["Sci-Fi", "Macera"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Marty McFly, zaman makinesiyle 1955'e düşer ve ailesinin geçmişini kazara değiştirir." },
  { id: "film-16", title: "Star Wars: Episode IV – A New Hope", year: 1977, imdb: 8.6, director: "George Lucas",
    genres: ["Sci-Fi", "Macera", "Epik Fantastik"], platforms: ["Disney+"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Genç bir çiftçi, galaksiyi tehdit eden İmparatorluğa karşı isyancılara katılır." },
  { id: "film-17", title: "2001: A Space Odyssey", year: 1968, imdb: 8.3, director: "Stanley Kubrick",
    genres: ["Sci-Fi", "Psikolojik Gizem"], platforms: ["HBO"], moods: ["Kült klasikler"],
    summary: "Bir uzay yolculuğu, insanlığın evrimini ve yapay zekânın tehlikesini sorgular." },
  { id: "film-18", title: "Mad Max: Fury Road", year: 2015, imdb: 8.1, director: "George Miller",
    genres: ["Aksiyon", "Sci-Fi", "Distopya"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Çölde bir kaçış, zalim bir hükümdara karşı amansız bir kovalamacaya dönüşür." },
  { id: "film-19", title: "Children of Men", year: 2006, imdb: 7.9, director: "Alfonso Cuarón",
    genres: ["Distopya", "Sci-Fi", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "İnsanlığın çocuk sahibi olamadığı bir dünyada, bir adam umudun son taşıyıcısını korur." },
  { id: "film-20", title: "Eternal Sunshine of the Spotless Mind", year: 2004, imdb: 8.3, director: "Michel Gondry",
    genres: ["Romantik", "Sci-Fi", "Psikolojik Gizem"], platforms: ["MUBI"], moods: ["Kült klasikler", "Ödüllü Başyapıtlar"],
    summary: "Eski sevgilisini hafızasından sildirmek isteyen adam, silinen anıların içinde aşkını yeniden keşfeder." },
  { id: "film-21", title: "Everything Everywhere All at Once", year: 2022, imdb: 7.8, director: "Daniel Kwan & Daniel Scheinert",
    genres: ["Sci-Fi", "Aksiyon", "Macera"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Sıradan bir kadın, çoklu evrenlerin kaderini değiştirecek bir göreve sürüklenir." },
  { id: "film-22", title: "The Truman Show", year: 1998, imdb: 8.2, director: "Peter Weir",
    genres: ["Psikolojik Gizem", "Distopya"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Hayatının bir televizyon programı olduğunu fark eden adam, sahte dünyasından kaçmaya çalışır." },
  { id: "film-23", title: "Jurassic Park", year: 1993, imdb: 8.2, director: "Steven Spielberg",
    genres: ["Macera", "Sci-Fi"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Genetik olarak yeniden yaratılan dinozorlar, bir tema parkında kontrolden çıkar." },
  { id: "film-24", title: "The Dark Knight", year: 2008, imdb: 9.0, director: "Christopher Nolan",
    genres: ["Aksiyon", "Suç/Polisiye", "Gerilim"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Batman, Gotham'ı kaosa sürükleyen Joker'in karşısında adalet ile ahlak arasında kalır." },
  { id: "film-25", title: "Gladiator", year: 2000, imdb: 8.5, director: "Ridley Scott",
    genres: ["Aksiyon", "Macera", "Tarih"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "İhanete uğrayan Romalı general, arenada intikam ve onur için savaşır." },
  { id: "film-26", title: "Raiders of the Lost Ark", year: 1981, imdb: 8.4, director: "Steven Spielberg",
    genres: ["Aksiyon", "Macera"], platforms: ["Prime Video"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Arkeolog Indiana Jones, Naziler'den önce Kayıp Hazine Sandığı'nı bulmaya çalışır." },
  { id: "film-27", title: "Die Hard", year: 1988, imdb: 8.2, director: "John McTiernan",
    genres: ["Aksiyon", "Gerilim"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Bir polis, Noel gecesi gökdelendeki rehine krizini tek başına çözmek zorunda kalır." },
  { id: "film-28", title: "Léon: The Professional", year: 1994, imdb: 8.5, director: "Luc Besson",
    genres: ["Aksiyon", "Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Yalnız bir tetikçi, ailesi öldürülen genç bir kızı himayesine alır." },
  { id: "film-29", title: "John Wick", year: 2014, imdb: 7.4, director: "Chad Stahelski",
    genres: ["Aksiyon", "Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Emekli bir tetikçi, köpeğinin ölümünün ardından suç dünyasına geri döner." },
  { id: "film-30", title: "Top Gun: Maverick", year: 2022, imdb: 8.2, director: "Joseph Kosinski",
    genres: ["Aksiyon", "Macera"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Efsanevi pilot, genç bir ekibi imkânsız bir göreve hazırlar." },
  { id: "film-31", title: "Spider-Man: Into the Spider-Verse", year: 2018, imdb: 8.4, director: "Bob Persichetti, Peter Ramsey & Rodney Rothman",
    genres: ["Animasyon", "Aksiyon", "Sci-Fi"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Miles Morales, farklı evrenlerden gelen Örümcek Adamlarla güçlerini keşfeder." },
  { id: "film-32", title: "Kill Bill: Vol. 1", year: 2003, imdb: 8.2, director: "Quentin Tarantino",
    genres: ["Aksiyon", "Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Düğününde ihanete uğrayan bir suikastçı, intikam listesindekileri tek tek avlar." },
  { id: "film-33", title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, imdb: 8.9, director: "Peter Jackson",
    genres: ["Epik Fantastik", "Macera"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Genç bir hobbit, Yüzük'ü yok etmek için dokuz kişilik bir yoldaşlıkla yola çıkar." },
  { id: "film-34", title: "The Lord of the Rings: The Return of the King", year: 2003, imdb: 9.0, director: "Peter Jackson",
    genres: ["Epik Fantastik", "Macera", "Aksiyon"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Orta Dünya'nın kaderi, Sauron'a karşı son büyük savaşta belirlenir." },
  { id: "film-35", title: "The Princess Bride", year: 1987, imdb: 8.0, director: "Rob Reiner",
    genres: ["Macera", "Romantik", "Epik Fantastik"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Bir çiftçi, sevdiği kadını kurtarmak için maceralar, düellolar ve entrikalardan geçer." },
  { id: "film-36", title: "Avengers: Endgame", year: 2019, imdb: 8.4, director: "Anthony & Joe Russo",
    genres: ["Aksiyon", "Sci-Fi", "Macera"], platforms: ["Disney+"], moods: ["Popüler/Güncel"],
    summary: "Kahramanlar, Thanos'un yok ettiği evreni geri getirmek için son bir plan yapar." },
  { id: "film-37", title: "Seven Samurai", year: 1954, imdb: 8.6, director: "Akira Kurosawa",
    genres: ["Aksiyon", "Macera", "Tarih"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Bir köyü haydutlardan korumak için yedi samuray bir araya gelir." },
  { id: "film-38", title: "Oldboy", year: 2003, imdb: 8.3, director: "Park Chan-wook",
    genres: ["Aksiyon", "Gerilim", "Psikolojik Gizem"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Yıllarca esir tutulan adam, serbest kalınca kendisine bunu yapanı arar." },
  { id: "film-39", title: "The Godfather", year: 1972, imdb: 9.2, director: "Francis Ford Coppola",
    genres: ["Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Bir mafya ailesinin patronu yaşlanırken, mirası isteksiz oğluna kalır." },
  { id: "film-40", title: "The Godfather Part II", year: 1974, imdb: 9.0, director: "Francis Ford Coppola",
    genres: ["Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Michael Corleone imparatorluğunu genişletirken, babasının gençlik yılları anlatılır." },
  { id: "film-41", title: "Goodfellas", year: 1990, imdb: 8.7, director: "Martin Scorsese",
    genres: ["Suç/Polisiye", "Biyografi"], platforms: ["HBO"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Genç bir adam, mafya dünyasındaki yükselişini ve çöküşünü anlatır." },
  { id: "film-42", title: "Pulp Fiction", year: 1994, imdb: 8.9, director: "Quentin Tarantino",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Disney+"], moods: ["Kült klasikler", "Ödüllü Başyapıtlar"],
    summary: "İç içe geçen hikâyelerde Los Angeles'ın tetikçileri ve soyguncuları kesişir." },
  { id: "film-43", title: "The Shawshank Redemption", year: 1994, imdb: 9.3, director: "Frank Darabont",
    genres: ["Suç/Polisiye"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Haksız yere hapse atılan bankacı, umut ve dostlukla yıllarca direnir." },
  { id: "film-44", title: "Se7en", year: 1995, imdb: 8.6, director: "David Fincher",
    genres: ["Suç/Polisiye", "Gerilim", "Psikolojik Gizem"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "İki dedektif, ölümcül günahlara göre cinayet işleyen bir seri katili avlar." },
  { id: "film-45", title: "The Silence of the Lambs", year: 1991, imdb: 8.6, director: "Jonathan Demme",
    genres: ["Suç/Polisiye", "Gerilim", "Psikolojik Gizem"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Genç bir FBI stajyeri, bir seri katili yakalamak için Hannibal Lecter'dan yardım ister." },
  { id: "film-46", title: "Fight Club", year: 1999, imdb: 8.8, director: "David Fincher",
    genres: ["Psikolojik Gizem", "Gerilim"], platforms: ["Disney+"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Uykusuz bir ofis çalışanı, karizmatik bir adamla yeraltı dövüş kulübü kurar." },
  { id: "film-47", title: "Memento", year: 2000, imdb: 8.4, director: "Christopher Nolan",
    genres: ["Psikolojik Gizem", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Kısa süreli hafıza kaybı yaşayan adam, karısının katilini ters kronolojiyle arar." },
  { id: "film-48", title: "The Prestige", year: 2006, imdb: 8.5, director: "Christopher Nolan",
    genres: ["Gerilim", "Psikolojik Gizem", "Sci-Fi"], platforms: ["HBO"], moods: ["Kült klasikler"],
    summary: "İki rakip sihirbazın takıntısı, tehlikeli bir sır uğruna her şeyi feda ettirir." },
  { id: "film-49", title: "Shutter Island", year: 2010, imdb: 8.2, director: "Martin Scorsese",
    genres: ["Psikolojik Gizem", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Bir federal şerif, ıssız bir akıl hastanesinde kaybolan hastayı ararken gerçekle yüzleşir." },
  { id: "film-50", title: "Gone Girl", year: 2014, imdb: 8.1, director: "David Fincher",
    genres: ["Gerilim", "Psikolojik Gizem", "Suç/Polisiye"], platforms: ["Disney+"], moods: ["Popüler/Güncel"],
    summary: "Karısı kaybolan adam, medyanın ve polisin şüphelisi hâline gelir." },
  { id: "film-51", title: "Prisoners", year: 2013, imdb: 8.2, director: "Denis Villeneuve",
    genres: ["Gerilim", "Suç/Polisiye"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Kızı kaybolan bir baba, polisin yavaşlığına katlanamayıp kendi yöntemlerine başvurur." },
  { id: "film-52", title: "No Country for Old Men", year: 2007, imdb: 8.2, director: "Joel & Ethan Coen",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Tesadüfen bulunan para çantası, acımasız bir katili adamın izine düşürür." },
  { id: "film-53", title: "Parasite (Parazit)", year: 2019, imdb: 8.5, director: "Bong Joon-ho",
    genres: ["Gerilim", "Suç/Polisiye"], platforms: ["MUBI"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Yoksul bir aile, zengin bir ailenin hayatına sızdıkça aradaki uçurum karanlığa dönüşür." },
  { id: "film-54", title: "Joker", year: 2019, imdb: 8.4, director: "Todd Phillips",
    genres: ["Psikolojik Gizem", "Suç/Polisiye", "Gerilim"], platforms: ["HBO"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Toplumdan dışlanan komedyen Arthur Fleck, Gotham'ın en korkulan suçlusuna dönüşür." },
  { id: "film-55", title: "Taxi Driver", year: 1976, imdb: 8.2, director: "Martin Scorsese",
    genres: ["Psikolojik Gizem", "Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Uykusuz bir taksi şoförü, New York'un çürümüşlüğü karşısında şiddete sürüklenir." },
  { id: "film-56", title: "Heat", year: 1995, imdb: 8.3, director: "Michael Mann",
    genres: ["Suç/Polisiye", "Aksiyon"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Usta bir soyguncu ile azimli bir dedektif, Los Angeles'ta amansız bir kedi-fare oyunu oynar." },
  { id: "film-57", title: "The Departed", year: 2006, imdb: 8.5, director: "Martin Scorsese",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Bir polis ve bir köstebek, birbirlerinin kimliğini ortaya çıkarmaya çalışır." },
  { id: "film-58", title: "Memories of Murder", year: 2003, imdb: 8.1, director: "Bong Joon-ho",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Taşra polisleri, 1980'lerdeki bir dizi cinayetin faillerini bulmaya çabalar." },
  { id: "film-59", title: "Black Swan", year: 2010, imdb: 8.0, director: "Darren Aronofsky",
    genres: ["Psikolojik Gizem", "Gerilim", "Korku"], platforms: ["Disney+"], moods: ["Kült klasikler"],
    summary: "Hırslı bir balerin, baş rolü kazanmak için zihninin karanlık sınırlarına iner." },
  { id: "film-60", title: "Mulholland Drive", year: 2001, imdb: 7.9, director: "David Lynch",
    genres: ["Psikolojik Gizem", "Gerilim"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Hollywood'da genç bir oyuncu, hafızasını kaybeden gizemli bir kadına yardım eder." },
  { id: "film-61", title: "Psycho", year: 1960, imdb: 8.5, director: "Alfred Hitchcock",
    genres: ["Korku", "Gerilim", "Psikolojik Gizem"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Kaçak bir kadın, ıssız bir motelin sessiz sahibi genç adama rastlar." },
  { id: "film-62", title: "Rear Window", year: 1954, imdb: 8.5, director: "Alfred Hitchcock",
    genres: ["Gerilim", "Suç/Polisiye"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bacağı kırık bir fotoğrafçı, pencereden komşusunda bir cinayet şüphesi keşfeder." },
  { id: "film-63", title: "Whiplash", year: 2014, imdb: 8.5, director: "Damien Chazelle",
    genres: ["Psikolojik Gizem", "Gerilim"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Hırslı bir davulcu, acımasız hocasının baskısı altında mükemmelliğe ulaşmaya çalışır." },
  { id: "film-64", title: "Bir Zamanlar Anadolu'da", year: 2011, imdb: 7.8, director: "Nuri Bilge Ceylan",
    genres: ["Suç/Polisiye", "Psikolojik Gizem"], platforms: ["MUBI"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Bir cinayet şüphelisinin gömdüğü cesedi bulmak için gece boyunca Anadolu bozkırında dolaşılır." },
  { id: "film-65", title: "The Shining", year: 1980, imdb: 8.4, director: "Stanley Kubrick",
    genres: ["Korku", "Psikolojik Gizem", "Gerilim"], platforms: ["HBO"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Issız bir otelde kışı geçiren yazar, otelin karanlık geçmişine ve kendi çöküşüne sürüklenir." },
  { id: "film-66", title: "Get Out", year: 2017, imdb: 7.7, director: "Jordan Peele",
    genres: ["Korku", "Gerilim"], platforms: ["Prime Video"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Genç bir adam, kız arkadaşının ailesini ziyaret edince ürkütücü bir sırra tanık olur." },
  { id: "film-67", title: "Hereditary", year: 2018, imdb: 7.3, director: "Ari Aster",
    genres: ["Korku", "Psikolojik Gizem"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Bir ailenin yası, büyükannenin ardından gelen doğaüstü olaylarla kâbusa dönüşür." },
  { id: "film-68", title: "The Exorcist", year: 1973, imdb: 8.1, director: "William Friedkin",
    genres: ["Korku"], platforms: ["HBO"], moods: ["Kült klasikler"],
    summary: "Bir annenin kızındaki değişimin ardından iki rahip şeytan çıkarma ayinine hazırlanır." },
  { id: "film-69", title: "The Thing", year: 1982, imdb: 8.2, director: "John Carpenter",
    genres: ["Korku", "Sci-Fi"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Antarktika'daki bir araştırma üssünde, şekil değiştiren bir yaratık mürettebatı avlar." },
  { id: "film-70", title: "A Quiet Place", year: 2018, imdb: 7.5, director: "John Krasinski",
    genres: ["Korku", "Gerilim", "Sci-Fi"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Sese tepki veren yaratıklardan korunmak için bir aile sessizce hayatta kalmaya çalışır." },
  { id: "film-71", title: "Spirited Away (Ruhların Kaçışı)", year: 2001, imdb: 8.6, director: "Hayao Miyazaki",
    genres: ["Anime", "Animasyon", "Macera", "Epik Fantastik"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Ruhlar âlemine düşen Chihiro, ailesini kurtarmak için gizemli bir hamamda çalışır." },
  { id: "film-72", title: "My Neighbor Totoro", year: 1988, imdb: 8.1, director: "Hayao Miyazaki",
    genres: ["Anime", "Animasyon", "Macera"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "İki kız kardeş, taşradaki yeni evlerinin yakınında sevimli orman ruhlarıyla tanışır." },
  { id: "film-73", title: "Princess Mononoke", year: 1997, imdb: 8.3, director: "Hayao Miyazaki",
    genres: ["Anime", "Animasyon", "Epik Fantastik", "Macera"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Genç bir savaşçı, doğa ile insanlar arasındaki kanlı savaşın ortasında kalır." },
  { id: "film-74", title: "Your Name", year: 2016, imdb: 8.4, director: "Makoto Shinkai",
    genres: ["Anime", "Animasyon", "Romantik"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Birbirinin bedenine geçen iki genç, kaderlerini değiştirecek bir bağ keşfeder." },
  { id: "film-75", title: "Grave of the Fireflies", year: 1988, imdb: 8.5, director: "Isao Takahata",
    genres: ["Anime", "Animasyon", "Tarih"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Savaş sırasında iki kardeş, açlık ve kayıplarla hayatta kalmaya çalışır." },
  { id: "film-76", title: "The Lion King", year: 1994, imdb: 8.5, director: "Roger Allers & Rob Minkoff",
    genres: ["Animasyon", "Macera"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Genç aslan Simba, babasının ölümünün ardından krallığına dönme cesaretini bulur." },
  { id: "film-77", title: "Toy Story", year: 1995, imdb: 8.3, director: "John Lasseter",
    genres: ["Animasyon", "Macera"], platforms: ["Disney+"], moods: ["Nostalji kuşağı"],
    summary: "Bir kovboy oyuncakla yeni bir uzay gemisi oyuncağın rekabeti dostluğa dönüşür." },
  { id: "film-78", title: "WALL·E", year: 2008, imdb: 8.4, director: "Andrew Stanton",
    genres: ["Animasyon", "Sci-Fi", "Romantik"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Yalnız bir temizlik robotu, bir keşif robotuna âşık olup insanlığın kaderini değiştirir." },
  { id: "film-79", title: "Up", year: 2009, imdb: 8.3, director: "Pete Docter",
    genres: ["Animasyon", "Macera"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Yaşlı bir adam, evini balonlarla uçurarak çocukluk hayalinin peşine düşer." },
  { id: "film-80", title: "Coco", year: 2017, imdb: 8.4, director: "Lee Unkrich",
    genres: ["Animasyon", "Macera"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Müzik hayali kuran bir çocuk, Ölüler Diyarı'nda ailesinin sırrını keşfeder." },
  { id: "film-81", title: "Perfect Blue", year: 1997, imdb: 8.0, director: "Satoshi Kon",
    genres: ["Anime", "Animasyon", "Psikolojik Gizem", "Gerilim"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Pop şarkıcılığını bırakıp oyuncu olan genç kadın, gerçekle kurgu arasında kaybolur." },
  { id: "film-82", title: "Titanic", year: 1997, imdb: 7.9, director: "James Cameron",
    genres: ["Romantik", "Tarih"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Ödüllü Başyapıtlar"],
    summary: "Farklı sınıflardan iki genç, batmakta olan bir transatlantikte yasak bir aşk yaşar." },
  { id: "film-83", title: "Casablanca", year: 1942, imdb: 8.5, director: "Michael Curtiz",
    genres: ["Romantik", "Tarih"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Ödüllü Başyapıtlar"],
    summary: "Savaş yıllarında Fas'ta bir kulüp sahibi, eski aşkı ve geçmişiyle yüzleşir." },
  { id: "film-84", title: "La La Land", year: 2016, imdb: 8.0, director: "Damien Chazelle",
    genres: ["Romantik"], platforms: ["Prime Video"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Bir caz piyanisti ile hevesli bir oyuncu, hayalleri ve aşk arasında seçim yapar." },
  { id: "film-85", title: "Amélie", year: 2001, imdb: 8.3, director: "Jean-Pierre Jeunet",
    genres: ["Romantik"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Paris'te hayalperest bir garson, çevresindekilerin hayatına gizlice dokunur." },
  { id: "film-86", title: "Before Sunrise", year: 1995, imdb: 8.1, director: "Richard Linklater",
    genres: ["Romantik"], platforms: ["MUBI"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Trende tanışan iki yabancı, Viyana'da bir gece boyunca yürüyüp konuşur." },
  { id: "film-87", title: "In the Mood for Love", year: 2000, imdb: 8.1, director: "Wong Kar-wai",
    genres: ["Romantik"], platforms: ["MUBI"], moods: ["Kült klasikler"],
    summary: "Komşu iki yalnız insan, eşlerinin ihanetini öğrendikten sonra birbirine yaklaşır." },
  { id: "film-88", title: "Schindler's List", year: 1993, imdb: 9.0, director: "Steven Spielberg",
    genres: ["Tarih", "Biyografi"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Bir iş insanı, Holokost sırasında yüzlerce Yahudi'yi kurtarmak için servetini harcar." },
  { id: "film-89", title: "Saving Private Ryan", year: 1998, imdb: 8.6, director: "Steven Spielberg",
    genres: ["Tarih", "Aksiyon"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "Bir müfreze, savaşın ortasında kardeşlerini kaybeden askeri bulup eve göndermeye çalışır." },
  { id: "film-90", title: "Braveheart", year: 1995, imdb: 8.3, director: "Mel Gibson",
    genres: ["Tarih", "Aksiyon", "Biyografi"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "İskoç bir savaşçı, İngiliz zulmüne karşı halkını özgürlüğe götürmeye çalışır." },
  { id: "film-91", title: "The Pianist", year: 2002, imdb: 8.5, director: "Roman Polanski",
    genres: ["Biyografi", "Tarih"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Varşova gettosunda hayatta kalmaya çalışan Yahudi bir piyanistin gerçek hikâyesi." },
  { id: "film-92", title: "Oppenheimer", year: 2023, imdb: 8.3, director: "Christopher Nolan",
    genres: ["Biyografi", "Tarih", "Gerilim"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Atom bombasının babası Oppenheimer'ın zaferi ve ardından gelen vicdani bedeli." },
  { id: "film-93", title: "The Social Network", year: 2010, imdb: 7.8, director: "David Fincher",
    genres: ["Biyografi"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Bir üniversite öğrencisi Facebook'u kurarken dostlukları ve davalarla yüzleşir." },
  { id: "film-94", title: "A Beautiful Mind", year: 2001, imdb: 8.2, director: "Ron Howard",
    genres: ["Biyografi", "Romantik"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Dahi bir matematikçi, şizofreniyle mücadele ederken büyük keşifler yapar." },
  { id: "film-95", title: "The Imitation Game", year: 2014, imdb: 8.0, director: "Morten Tyldum",
    genres: ["Biyografi", "Tarih", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Alan Turing, İkinci Dünya Savaşı'nda Enigma şifresini çözmek için çalışır." },
  { id: "film-96", title: "Amadeus", year: 1984, imdb: 8.4, director: "Miloš Forman",
    genres: ["Biyografi", "Tarih"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Rakip bir besteci, Mozart'ın dehasına duyduğu kıskançlığı anlatır." },
  { id: "film-97", title: "1917", year: 2019, imdb: 8.2, director: "Sam Mendes",
    genres: ["Tarih", "Aksiyon"], platforms: ["Netflix"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "İki asker, Birinci Dünya Savaşı'nda hayati bir mesajı cepheye ulaştırmak için yarışır." },
  { id: "film-98", title: "Apocalypse Now", year: 1979, imdb: 8.4, director: "Francis Ford Coppola",
    genres: ["Tarih", "Psikolojik Gizem"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir yüzbaşı, Vietnam'da çılgına dönen bir subayı bulup etkisiz hâle getirmekle görevlendirilir." },
  { id: "film-99", title: "Forrest Gump", year: 1994, imdb: 8.8, director: "Robert Zemeckis",
    genres: ["Romantik", "Tarih"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "Sade bir adam, tesadüfen Amerikan tarihinin büyük anlarına tanık olur." },
  { id: "film-100", title: "Killers of the Flower Moon", year: 2023, imdb: 7.6, director: "Martin Scorsese",
    genres: ["Tarih", "Suç/Polisiye", "Biyografi"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel"],
    summary: "1920'ler Oklahoma'sında Osage halkına yönelik cinayetler, bir iş birliğinin karanlık yüzünü açığa çıkarır." },
];

/* ===================== DİZİ (100) ===================== */
const SERIES_RAW = [
  { id: "dizi-01", title: "Friends", year: 1994, imdb: 8.9, creator: "David Crane & Marta Kauffman",
    genres: ["Sitcom", "Romantik"], platforms: ["HBO", "BluTV"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "New York'ta yaşayan altı arkadaşın aşk, kariyer ve dostluk arasında gelgitli günlük hayatı." },
  { id: "dizi-02", title: "The Office", year: 2005, imdb: 9.0, creator: "Greg Daniels",
    genres: ["Sitcom"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Bir kâğıt şirketinin ofis çalışanlarının sıradan ve komik günleri belgesel tarzında izlenir." },
  { id: "dizi-03", title: "Seinfeld", year: 1989, imdb: 8.9, creator: "Larry David & Jerry Seinfeld",
    genres: ["Sitcom"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Dört arkadaşın New York'taki ufak meseleleri, hiçbir şeyin dizisi olarak anlatılır." },
  { id: "dizi-04", title: "How I Met Your Mother", year: 2005, imdb: 8.3, creator: "Carter Bays & Craig Thomas",
    genres: ["Sitcom", "Romantik"], platforms: ["Disney+"], moods: ["Nostalji kuşağı"],
    summary: "Ted Mosby, çocuklarına eşiyle nasıl tanıştığını yıllar süren hikâyelerle anlatır." },
  { id: "dizi-05", title: "Brooklyn Nine-Nine", year: 2013, imdb: 8.4, creator: "Dan Goor & Michael Schur",
    genres: ["Sitcom", "Suç/Polisiye"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Neşeli bir dedektif ekibi, Brooklyn'de suçları çözerken hem komedi hem dostluk yaşar." },
  { id: "dizi-06", title: "Parks and Recreation", year: 2009, imdb: 8.6, creator: "Greg Daniels & Michael Schur",
    genres: ["Sitcom"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Hevesli bir belediye çalışanı, küçük bir kasabayı daha iyi hâle getirmeye çalışır." },
  { id: "dizi-07", title: "Arrested Development", year: 2003, imdb: 8.7, creator: "Mitchell Hurwitz",
    genres: ["Sitcom"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Zengin ve işlevsiz bir aile, iflasın ardından birbirine bağlı kalmaya çalışır." },
  { id: "dizi-08", title: "Ted Lasso", year: 2020, imdb: 8.8, creator: "Jason Sudeikis, Bill Lawrence, Brendan Hunt & Joe Kelly",
    genres: ["Sitcom"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Amerikalı bir futbol koçu, İngiltere'de bir kulübü iyimserliğiyle dönüştürür." },
  { id: "dizi-09", title: "Fleabag", year: 2016, imdb: 8.7, creator: "Phoebe Waller-Bridge",
    genres: ["Sitcom", "Romantik"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Dobra ve kusurlu bir genç kadın, kayıp ve aşk arasında kendi gerçeğini arar." },
  { id: "dizi-10", title: "Schitt's Creek", year: 2015, imdb: 8.5, creator: "Dan Levy & Eugene Levy",
    genres: ["Sitcom", "Romantik"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Zengin bir aile her şeyini kaybedip küçük bir kasabada yeni bir hayat kurar." },
  { id: "dizi-11", title: "The Big Bang Theory", year: 2007, imdb: 8.1, creator: "Chuck Lorre & Bill Prady",
    genres: ["Sitcom", "Romantik"], platforms: ["Netflix"], moods: ["Nostalji kuşağı"],
    summary: "Dâhi ama sosyal olarak beceriksiz fizikçiler, yeni komşuları sayesinde hayatı öğrenir." },
  { id: "dizi-12", title: "Modern Family", year: 2009, imdb: 8.5, creator: "Christopher Lloyd & Steven Levitan",
    genres: ["Sitcom"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "Üç farklı ailenin günlük komedileri, belgesel tarzı röportajlarla anlatılır." },
  { id: "dizi-13", title: "Breaking Bad", year: 2008, imdb: 9.5, creator: "Vince Gilligan",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Hasta bir lise kimya öğretmeni, ailesinin geleceği için suç dünyasına adım atar ve dönüşür." },
  { id: "dizi-14", title: "Better Call Saul", year: 2015, imdb: 9.0, creator: "Vince Gilligan & Peter Gould",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Ufak tefek bir avukat, Saul Goodman kimliğine giden yolda ahlaki seçimler yapar." },
  { id: "dizi-15", title: "The Sopranos", year: 1999, imdb: 9.2, creator: "David Chase",
    genres: ["Suç/Polisiye"], platforms: ["HBO", "BluTV"], moods: ["Ödüllü Başyapıtlar", "Kült klasikler"],
    summary: "Mafya babası Tony Soprano, aile ve organizasyon arasında sıkışıp terapiye başlar." },
  { id: "dizi-16", title: "The Wire", year: 2002, imdb: 9.3, creator: "David Simon",
    genres: ["Suç/Polisiye"], platforms: ["HBO", "BluTV"], moods: ["Kült klasikler"],
    summary: "Baltimore'da polis, uyuşturucu satıcıları ve kurumlar arasındaki ilişkiler katman katman işlenir." },
  { id: "dizi-17", title: "True Detective", year: 2014, imdb: 8.9, creator: "Nic Pizzolatto",
    genres: ["Suç/Polisiye", "Psikolojik Gizem", "Gerilim"], platforms: ["HBO"], moods: ["Kült klasikler"],
    summary: "İki dedektif, karanlık bir cinayet gizemine saplanıp kendi ruhlarını sorgular." },
  { id: "dizi-18", title: "Sherlock", year: 2010, imdb: 9.1, creator: "Steven Moffat & Mark Gatiss",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Kült klasikler", "Popüler/Güncel"],
    summary: "Modern Londra'da Sherlock Holmes ve Dr. Watson, kurnaz suçluların peşinden koşar." },
  { id: "dizi-19", title: "Mindhunter", year: 2017, imdb: 8.6, creator: "Joe Penhall",
    genres: ["Suç/Polisiye", "Psikolojik Gizem", "Gerilim"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "İki FBI ajanı, seri katillerle görüşerek suç psikolojisinin temellerini atar." },
  { id: "dizi-20", title: "Narcos", year: 2015, imdb: 8.8, creator: "Chris Brancato, Carlo Bernard & Doug Miro",
    genres: ["Suç/Polisiye", "Biyografi"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Pablo Escobar'ın yükselişi ve ona karşı yürütülen amansız mücadele anlatılır." },
  { id: "dizi-21", title: "Ozark", year: 2017, imdb: 8.4, creator: "Bill Dubuque & Mark Williams",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Bir mali danışman, ailesiyle Ozark'a taşınıp bir kartelin parasını aklamak zorunda kalır." },
  { id: "dizi-22", title: "Peaky Blinders", year: 2013, imdb: 8.7, creator: "Steven Knight",
    genres: ["Suç/Polisiye", "Tarih"], platforms: ["Netflix"], moods: ["Popüler/Güncel", "Kült klasikler"],
    summary: "Birmingham'daki Shelby ailesi, savaş sonrası yıllarda suç imparatorluğunu büyütür." },
  { id: "dizi-23", title: "Dexter", year: 2006, imdb: 8.6, creator: "James Manos Jr.",
    genres: ["Suç/Polisiye", "Psikolojik Gizem", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Gündüz kan analisti, gece seri katil avcısı olan adamın ikili hayatı anlatılır." },
  { id: "dizi-24", title: "Fargo", year: 2014, imdb: 8.9, creator: "Noah Hawley",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Antolojide sıradan insanlar, soğuk Midwest'te şiddet ve cinayetin kıyısına sürüklenir." },
  { id: "dizi-25", title: "Mare of Easttown", year: 2021, imdb: 8.4, creator: "Brad Ingelsby",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Küçük kasabanın dedektifi, genç bir kadının cinayetini çözerken kendi acılarıyla yüzleşir." },
  { id: "dizi-26", title: "Line of Duty", year: 2012, imdb: 8.6, creator: "Jed Mercurio",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Polis içindeki yolsuzlukları araştıran özel bir birim, güvenilir görünen isimleri izler." },
  { id: "dizi-27", title: "Broadchurch", year: 2013, imdb: 8.4, creator: "Chris Chibnall",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Küçük bir sahil kasabasında işlenen çocuk cinayeti, tüm topluluğun sırlarını ortaya döker." },
  { id: "dizi-28", title: "Money Heist (La Casa de Papel)", year: 2017, imdb: 8.2, creator: "Álex Pina",
    genres: ["Suç/Polisiye", "Aksiyon", "Gerilim"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Dâhi bir lider, Madrid'deki Darphane'ye yönelik tarihin en büyük soygununu planlar." },
  { id: "dizi-29", title: "Squid Game", year: 2021, imdb: 8.0, creator: "Hwang Dong-hyuk",
    genres: ["Gerilim", "Distopya"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Borçlu insanlar, büyük bir ödül için ölümcül çocuk oyunlarında yarışır." },
  { id: "dizi-30", title: "The Night Of", year: 2016, imdb: 8.4, creator: "Richard Price & Steven Zaillian",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["HBO"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Genç bir adam, bir gecelik kaderi yüzünden cinayet suçlamasıyla yargılanır." },
  { id: "dizi-31", title: "Behzat Ç. Bir Ankara Polisiyesi", year: 2010, imdb: 8.7, creator: "Emrah Serbes",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Gain"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Asi ve yetenekli müfettiş, Ankara'nın karanlık cinayet dosyalarını kendi usulüyle çözer." },
  { id: "dizi-32", title: "Kurtlar Vadisi", year: 2003, imdb: 7.6, creator: "Raci Şaşmaz & Bahadır Özdener",
    genres: ["Aksiyon", "Suç/Polisiye"], platforms: ["Exxen"], moods: ["Nostalji kuşağı"],
    summary: "Gizli görevdeki bir ajan, İstanbul'un yeraltı dünyasında çetelerle savaşır." },
  { id: "dizi-33", title: "Boardwalk Empire", year: 2010, imdb: 8.6, creator: "Terence Winter",
    genres: ["Suç/Polisiye", "Tarih"], platforms: ["HBO", "BluTV"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Yasaklar döneminde Atlantic City'nin hâkimi Nucky Thompson, suç dünyasında yükselir." },
  { id: "dizi-34", title: "Mr. Robot", year: 2015, imdb: 8.5, creator: "Sam Esmail",
    genres: ["Gerilim", "Psikolojik Gizem", "Siberpunk"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir siber güvenlik mühendisi, dünyanın en büyük şirketini çökertecek bir hacker grubuna katılır." },
  { id: "dizi-35", title: "Black Mirror", year: 2011, imdb: 8.7, creator: "Charlie Brooker",
    genres: ["Sci-Fi", "Distopya", "Gerilim"], platforms: ["Netflix"], moods: ["Kült klasikler", "Popüler/Güncel"],
    summary: "Teknolojinin insan doğasıyla çarpıştığı bağımsız bölümlerde yakın geleceğin karanlık aynası tutulur." },
  { id: "dizi-36", title: "Stranger Things", year: 2016, imdb: 8.7, creator: "Duffer Kardeşler",
    genres: ["Sci-Fi", "Korku", "Macera"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Popüler/Güncel"],
    summary: "Hawkins'te kaybolan bir çocuk, gizli bir deneyi ve Ters Dünya'yı ortaya çıkarır." },
  { id: "dizi-37", title: "Westworld", year: 2016, imdb: 8.5, creator: "Jonathan Nolan & Lisa Joy",
    genres: ["Sci-Fi", "Psikolojik Gizem", "Distopya"], platforms: ["HBO", "BluTV"], moods: ["Popüler/Güncel"],
    summary: "Gelişmiş robotlarla dolu bir tema parkında yapay zekâ bilinç kazanmaya başlar." },
  { id: "dizi-38", title: "Severance", year: 2022, imdb: 8.7, creator: "Dan Erickson",
    genres: ["Sci-Fi", "Psikolojik Gizem", "Gerilim", "Distopya"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "İş ve özel hayat anılarını ayıran şirketin çalışanları, iki yaşamın ardındaki gerçeği çözmeye çalışır." },
  { id: "dizi-39", title: "The X-Files", year: 1993, imdb: 8.6, creator: "Chris Carter",
    genres: ["Sci-Fi", "Gerilim", "Psikolojik Gizem"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "İki FBI ajanı, doğaüstü ve uzaylı komplolarının peşine düşer." },
  { id: "dizi-40", title: "Twin Peaks", year: 1990, imdb: 8.8, creator: "David Lynch & Mark Frost",
    genres: ["Psikolojik Gizem", "Suç/Polisiye", "Korku"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Genç bir kızın ölümü, FBI ajanı Cooper'ı kasabanın tuhaf sırlarına götürür." },
  { id: "dizi-41", title: "Star Trek: The Next Generation", year: 1987, imdb: 8.7, creator: "Gene Roddenberry",
    genres: ["Sci-Fi", "Macera"], platforms: ["Prime Video"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Kaptan Picard ve Enterprise-D mürettebatı, galakside keşif ve ahlaki ikilemlerle karşılaşır." },
  { id: "dizi-42", title: "The Expanse", year: 2015, imdb: 8.5, creator: "Mark Fergus & Hawk Ostby",
    genres: ["Sci-Fi", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Güneş sistemi gerginken, bir dedektif ve bir gemi mürettebatı büyük bir komployu keşfeder." },
  { id: "dizi-43", title: "Battlestar Galactica", year: 2004, imdb: 8.7, creator: "Ronald D. Moore",
    genres: ["Sci-Fi", "Distopya", "Aksiyon"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "İnsanlığın son kalıntıları, Cylon saldırısından kaçıp efsanevi Dünya'yı arar." },
  { id: "dizi-44", title: "Dark", year: 2017, imdb: 8.7, creator: "Baran bo Odar & Jantje Friese",
    genres: ["Sci-Fi", "Gerilim", "Psikolojik Gizem"], platforms: ["Netflix"], moods: ["Kült klasikler", "Popüler/Güncel"],
    summary: "Küçük bir Alman kasabasında kaybolan çocuklar, zamanlar arası bir sırrı ortaya çıkarır." },
  { id: "dizi-45", title: "The Mandalorian", year: 2019, imdb: 8.7, creator: "Jon Favreau",
    genres: ["Sci-Fi", "Macera", "Aksiyon"], platforms: ["Disney+"], moods: ["Popüler/Güncel"],
    summary: "Yalnız bir ödül avcısı, gizemli küçük bir çocuğu korumak için galakside dolaşır." },
  { id: "dizi-46", title: "Fringe", year: 2008, imdb: 8.4, creator: "J. J. Abrams, Alex Kurtzman & Roberto Orci",
    genres: ["Sci-Fi", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir FBI ajanı ve bilim insanları, paralel evrenlere uzanan tuhaf olayları araştırır." },
  { id: "dizi-47", title: "Silo", year: 2023, imdb: 8.1, creator: "Graham Yost",
    genres: ["Sci-Fi", "Distopya", "Gerilim"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel"],
    summary: "Yeraltında yaşayan insanlar, yüzeye çıkmanın yasak olduğu bir toplumda gerçeği sorgular." },
  { id: "dizi-48", title: "Altered Carbon", year: 2018, imdb: 7.9, creator: "Laeta Kalogridis",
    genres: ["Siberpunk", "Sci-Fi", "Aksiyon"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Bilincin bedenler arasında taşınabildiği bir gelecekte, bir savaşçı bir cinayeti çözer." },
  { id: "dizi-49", title: "The Handmaid's Tale", year: 2017, imdb: 8.4, creator: "Bruce Miller",
    genres: ["Distopya", "Gerilim"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Totaliter bir rejimde bir kadın, çocuk doğurmaya zorlanırken direnişi sürdürür." },
  { id: "dizi-50", title: "Fallout", year: 2024, imdb: 8.3, creator: "Graham Wagner & Geneva Robertson-Dworet",
    genres: ["Sci-Fi", "Distopya", "Aksiyon"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Nükleer savaş sonrası dünyada genç bir sığınak sakini, yüzeyin sırlarını keşfeder." },
  { id: "dizi-51", title: "Love, Death & Robots", year: 2019, imdb: 8.4, creator: "Tim Miller",
    genres: ["Animasyon", "Sci-Fi", "Siberpunk"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Siberpunktan korkuya uzanan bağımsız animasyon kısa filmleriyle bilimkurgu antolojisi." },
  { id: "dizi-52", title: "Rick and Morty", year: 2013, imdb: 9.1, creator: "Justin Roiland & Dan Harmon",
    genres: ["Animasyon", "Sci-Fi", "Sitcom"], platforms: ["HBO"], moods: ["Kült klasikler", "Popüler/Güncel"],
    summary: "Deli bilim insanı Rick ile torunu Morty, evrenler arası maceralara sürüklenir." },
  { id: "dizi-53", title: "The Last of Us", year: 2023, imdb: 8.7, creator: "Craig Mazin & Neil Druckmann",
    genres: ["Korku", "Distopya", "Aksiyon"], platforms: ["HBO"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Mantar salgınıyla yıkılan dünyada bir kaçakçı, genç bir kızı güvenli yere ulaştırır." },
  { id: "dizi-54", title: "The Walking Dead", year: 2010, imdb: 8.1, creator: "Frank Darabont",
    genres: ["Korku", "Distopya", "Aksiyon"], platforms: ["Disney+"], moods: ["Popüler/Güncel"],
    summary: "Zombi salgını sonrası bir şerif, hayatta kalanlarla yeni bir toplum kurmaya çalışır." },
  { id: "dizi-55", title: "Game of Thrones", year: 2011, imdb: 9.2, creator: "David Benioff & D. B. Weiss",
    genres: ["Epik Fantastik", "Aksiyon", "Macera"], platforms: ["HBO", "BluTV"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Yedi krallığın demir tahtı için soylu haneler arasında entrika ve savaş alevlenir." },
  { id: "dizi-56", title: "House of the Dragon", year: 2022, imdb: 8.4, creator: "Ryan Condal & George R. R. Martin",
    genres: ["Epik Fantastik", "Aksiyon"], platforms: ["HBO", "BluTV"], moods: ["Popüler/Güncel"],
    summary: "Targaryen hanesindeki taht kavgası, ejderhaların dansıyla krallığı iç savaşa sürükler." },
  { id: "dizi-57", title: "The Witcher", year: 2019, imdb: 8.0, creator: "Lauren Schmidt Hissrich",
    genres: ["Epik Fantastik", "Aksiyon", "Macera"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Canavar avcısı Geralt, kaderiyle bağlandığı bir prenses ve büyücüyle yolculuk eder." },
  { id: "dizi-58", title: "Arcane", year: 2021, imdb: 9.0, creator: "Christian Linke & Alex Yee",
    genres: ["Animasyon", "Epik Fantastik", "Aksiyon", "Distopya"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Zengin Piltover ile yeraltı Zaun arasındaki gerilimde iki kız kardeşin yolları ayrılır." },
  { id: "dizi-59", title: "Avatar: The Last Airbender", year: 2005, imdb: 9.3, creator: "Michael Dante DiMartino & Bryan Konietzko",
    genres: ["Animasyon", "Epik Fantastik", "Macera"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Genç Aang, dört ulus arasındaki savaşı sona erdirmek için elementleri öğrenir." },
  { id: "dizi-60", title: "Vikings", year: 2013, imdb: 8.5, creator: "Michael Hirst",
    genres: ["Tarih", "Aksiyon", "Macera"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Ragnar Lothbrok, Viking dünyasının efsanevi lideri olma yolunda akınlara çıkar." },
  { id: "dizi-61", title: "Shōgun", year: 2024, imdb: 8.6, creator: "Rachel Kondo & Justin Marks",
    genres: ["Tarih", "Macera"], platforms: ["Disney+"], moods: ["Ödüllü Başyapıtlar", "Popüler/Güncel"],
    summary: "Feodal Japonya'da bir İngiliz denizci, güçlü bir savaş ağasının siyasetine karışır." },
  { id: "dizi-62", title: "Chernobyl", year: 2019, imdb: 9.3, creator: "Craig Mazin",
    genres: ["Tarih", "Gerilim"], platforms: ["HBO", "BluTV"], moods: ["Ödüllü Başyapıtlar"],
    summary: "1986 Çernobil felaketini ve gerçeği örtbas etmeye çalışan sistemle savaşan insanları anlatır." },
  { id: "dizi-63", title: "The Crown", year: 2016, imdb: 8.6, creator: "Peter Morgan",
    genres: ["Tarih", "Biyografi"], platforms: ["Netflix"], moods: ["Ödüllü Başyapıtlar"],
    summary: "II. Elizabeth'in saltanatını, taht ile kişisel hayat arasındaki gerilimle onlarca yıl izler." },
  { id: "dizi-64", title: "Band of Brothers", year: 2001, imdb: 9.4, creator: "Tom Hanks & Steven Spielberg (yapımcı)",
    genres: ["Tarih", "Aksiyon"], platforms: ["HBO", "BluTV"], moods: ["Ödüllü Başyapıtlar", "Nostalji kuşağı"],
    summary: "Easy Company askerleri, İkinci Dünya Savaşı'nda eğitimden zafere kadar birlikte savaşır." },
  { id: "dizi-65", title: "Rome", year: 2005, imdb: 8.7, creator: "John Milius, William J. MacDonald & Bruno Heller",
    genres: ["Tarih", "Aksiyon"], platforms: ["HBO"], moods: ["Kült klasikler"],
    summary: "Roma Cumhuriyeti'nin son yıllarında iki askerin gözünden Sezar'ın yükselişi anlatılır." },
  { id: "dizi-66", title: "Downton Abbey", year: 2010, imdb: 8.7, creator: "Julian Fellowes",
    genres: ["Tarih", "Romantik"], platforms: ["Prime Video"], moods: ["Ödüllü Başyapıtlar"],
    summary: "Bir İngiliz aristokrat ailesi ve hizmetkârları, değişen çağın içinde hayatını sürdürür." },
  { id: "dizi-67", title: "The Last Kingdom", year: 2015, imdb: 8.0, creator: "Stephen Butchard",
    genres: ["Tarih", "Aksiyon"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Saksonlar tarafından yetiştirilen Uhtred, Danimarkalılar ve Saksonlar arasında kimliğini arar." },
  { id: "dizi-68", title: "Outlander", year: 2014, imdb: 8.4, creator: "Ronald D. Moore",
    genres: ["Tarih", "Romantik", "Macera"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Savaş hemşiresi Claire, 1743 İskoçya'sına düşerek yeni bir aşk ve tehlikeyle karşılaşır." },
  { id: "dizi-69", title: "Attack on Titan", year: 2013, imdb: 9.1, creator: "Hajime Isayama (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon", "Distopya", "Epik Fantastik"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Popüler/Güncel"],
    summary: "Devasa titanların insanlığı surların ardına hapsettiği dünyada Eren, gerçeğin peşine düşer." },
  { id: "dizi-70", title: "Death Note", year: 2006, imdb: 9.0, creator: "Tsugumi Ohba & Takeshi Obata (manga)",
    genres: ["Anime", "Animasyon", "Psikolojik Gizem", "Gerilim"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Bir lise öğrencisi, adını yazdığı kişileri öldüren bir defter bulur ve dedektif L ile karşılaşır." },
  { id: "dizi-71", title: "Fullmetal Alchemist: Brotherhood", year: 2009, imdb: 9.1, creator: "Hiromu Arakawa (manga)",
    genres: ["Anime", "Animasyon", "Macera", "Epik Fantastik", "Aksiyon"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "İki kardeş, annelerini geri getirme girişiminin bedelini ödemek için felsefe taşını arar." },
  { id: "dizi-72", title: "Cowboy Bebop", year: 1998, imdb: 8.9, creator: "Shinichirō Watanabe",
    genres: ["Anime", "Animasyon", "Sci-Fi", "Aksiyon"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Uzayda ödül avcıları, geçmişlerinin gölgesinde maceralı bir hayat sürer." },
  { id: "dizi-73", title: "Cyberpunk: Edgerunners", year: 2022, imdb: 8.6, creator: "Hiroyuki Imaishi",
    genres: ["Anime", "Animasyon", "Siberpunk", "Aksiyon"], platforms: ["Netflix"], moods: ["Popüler/Güncel", "Kült klasikler"],
    summary: "Night City'de her şeyini kaybeden David, implantlarla sokak savaşçılarının dünyasına katılır." },
  { id: "dizi-74", title: "Neon Genesis Evangelion", year: 1995, imdb: 8.5, creator: "Hideaki Anno",
    genres: ["Anime", "Animasyon", "Sci-Fi", "Psikolojik Gizem"], platforms: ["Netflix"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Genç Shinji, dev robotlarla melek adlı yaratıklara karşı insanlığı savunur." },
  { id: "dizi-75", title: "Steins;Gate", year: 2011, imdb: 8.8, creator: "Hiroshi Hamasaki & Takuya Satō (yönetmen)",
    genres: ["Anime", "Animasyon", "Sci-Fi", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir bilim meraklısı, mesajlarla geçmişe gönderim yapabildiğini keşfedip zaman çizelgesini değiştirir." },
  { id: "dizi-76", title: "Hunter x Hunter", year: 2011, imdb: 9.0, creator: "Yoshihiro Togashi (manga)",
    genres: ["Anime", "Animasyon", "Macera", "Aksiyon"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Genç Gon, kayıp babasını bulmak için Avcı sınavına girer ve tehlikeli maceralara atılır." },
  { id: "dizi-77", title: "One Piece", year: 1999, imdb: 8.9, creator: "Eiichiro Oda (manga)",
    genres: ["Anime", "Animasyon", "Macera", "Aksiyon"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Popüler/Güncel"],
    summary: "Monkey D. Luffy, korsanlar kralı olmak için tayfasıyla efsanevi hazineyi arar." },
  { id: "dizi-78", title: "Demon Slayer: Kimetsu no Yaiba", year: 2019, imdb: 8.6, creator: "Koyoharu Gotouge (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon", "Epik Fantastik"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Kız kardeşini insanlığa döndürmek isteyen genç, iblis avcılarına katılır." },
  { id: "dizi-79", title: "Jujutsu Kaisen", year: 2020, imdb: 8.6, creator: "Gege Akutami (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon", "Korku"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Lise öğrencisi Yuji, lanetli bir nesneyi yutarak büyücüler dünyasına girer." },
  { id: "dizi-80", title: "Vinland Saga", year: 2019, imdb: 8.8, creator: "Makoto Yukimura (manga)",
    genres: ["Anime", "Animasyon", "Tarih", "Aksiyon"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Viking savaşçı Thorfinn, babasının intikamı ile gerçek bir savaşçının anlamı arasında kalır." },
  { id: "dizi-81", title: "Monster", year: 2004, imdb: 8.8, creator: "Naoki Urasawa (manga)",
    genres: ["Anime", "Animasyon", "Psikolojik Gizem", "Gerilim"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir cerrah, hayatını kurtardığı çocuğun seri katile dönüştüğünü anlayınca peşine düşer." },
  { id: "dizi-82", title: "One-Punch Man", year: 2015, imdb: 8.7, creator: "ONE (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Tek yumrukla her düşmanı yenen kahraman, bu güç yüzünden sıkıcı bir hayat sürer." },
  { id: "dizi-83", title: "The Haunting of Hill House", year: 2018, imdb: 8.6, creator: "Mike Flanagan",
    genres: ["Korku", "Psikolojik Gizem"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Bir ailenin perili bir malikânedeki geçmişi, yetişkin kardeşlerin hayatını kuşatır." },
  { id: "dizi-84", title: "Hannibal", year: 2013, imdb: 8.5, creator: "Bryan Fuller",
    genres: ["Korku", "Suç/Polisiye", "Psikolojik Gizem"], platforms: ["Prime Video"], moods: ["Kült klasikler"],
    summary: "Bir FBI profilcisi, ünlü psikiyatrist Hannibal Lecter ile tehlikeli bir ilişki kurar." },
  { id: "dizi-85", title: "American Horror Story", year: 2011, imdb: 8.0, creator: "Ryan Murphy & Brad Falchuk",
    genres: ["Korku"], platforms: ["Disney+"], moods: ["Popüler/Güncel"],
    summary: "Her sezonda farklı bir korku hikâyesini anlatan antoloji dizisi." },
  { id: "dizi-86", title: "The Boys", year: 2019, imdb: 8.7, creator: "Eric Kripke",
    genres: ["Aksiyon", "Sci-Fi"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Sıradan insanlardan oluşan bir grup, yozlaşmış süper kahramanları ifşa etmeye çalışır." },
  { id: "dizi-87", title: "Invincible", year: 2021, imdb: 8.7, creator: "Robert Kirkman",
    genres: ["Animasyon", "Aksiyon", "Sci-Fi"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Süper kahraman bir babanın oğlu, güçlerini keşfederken ağır gerçeklerle yüzleşir." },
  { id: "dizi-88", title: "BoJack Horseman", year: 2014, imdb: 8.8, creator: "Raphael Bob-Waksberg",
    genres: ["Animasyon", "Sitcom"], platforms: ["Netflix"], moods: ["Kült klasikler"],
    summary: "Eski bir dizi yıldızı at, Hollywood'da kendi acılarıyla ve bağımlılıklarıyla boğuşur." },
  { id: "dizi-89", title: "The Simpsons", year: 1989, imdb: 8.7, creator: "Matt Groening",
    genres: ["Animasyon", "Sitcom"], platforms: ["Disney+"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Springfield'daki sarı bir ailenin sivri dilli hicivle anlatılan günlük hayatı." },
  { id: "dizi-90", title: "South Park", year: 1997, imdb: 8.7, creator: "Trey Parker & Matt Stone",
    genres: ["Animasyon", "Sitcom"], platforms: ["Prime Video"], moods: ["Kült klasikler", "Nostalji kuşağı"],
    summary: "Dört çocuk, Colorado'daki küçük kasabada siyaseti ve kültürü sert bir mizahla hicveder." },
  { id: "dizi-91", title: "Dragon Ball Z", year: 1989, imdb: 8.7, creator: "Akira Toriyama (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon", "Macera"], platforms: ["Netflix"], moods: ["Nostalji kuşağı", "Kült klasikler"],
    summary: "Goku ve arkadaşları, Dünya'yı tehdit eden güçlü düşmanlara karşı savaşır." },
  { id: "dizi-92", title: "Naruto", year: 2002, imdb: 8.4, creator: "Masashi Kishimoto (manga)",
    genres: ["Anime", "Animasyon", "Aksiyon", "Macera"], platforms: ["Netflix"], moods: ["Nostalji kuşağı"],
    summary: "Yalnız bir ninja çocuğu, köyünün lideri Hokage olmayı hayal eder." },
  { id: "dizi-93", title: "Chainsaw Man", year: 2022, imdb: 8.4, creator: "Tatsuki Fujimoto (manga)",
    genres: ["Anime", "Animasyon", "Korku", "Aksiyon"], platforms: ["Prime Video"], moods: ["Popüler/Güncel"],
    summary: "Borçlu bir genç, iblis köpeğiyle birleşerek şeytan avcısı olur." },
  { id: "dizi-94", title: "Lupin", year: 2021, imdb: 7.5, creator: "George Kay & François Uzan",
    genres: ["Suç/Polisiye", "Macera"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Dolandırıcı Assane Diop, babasının intikamını Arsène Lupin'den ilhamla alır." },
  { id: "dizi-95", title: "Bridgerton", year: 2020, imdb: 7.3, creator: "Chris Van Dusen",
    genres: ["Romantik", "Tarih"], platforms: ["Netflix"], moods: ["Popüler/Güncel"],
    summary: "Regency dönemi Londra'sında bir aristokrat ailenin evlilik ve aşk arayışı anlatılır." },
  { id: "dizi-96", title: "Normal People", year: 2020, imdb: 8.5, creator: "Sally Rooney & Alice Birch",
    genres: ["Romantik"], platforms: ["Disney+"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "İki gencin liseden üniversiteye süren karmaşık aşkı ve bağlılığı anlatılır." },
  { id: "dizi-97", title: "Andor", year: 2022, imdb: 8.4, creator: "Tony Gilroy",
    genres: ["Sci-Fi", "Aksiyon", "Gerilim"], platforms: ["Disney+"], moods: ["Popüler/Güncel", "Ödüllü Başyapıtlar"],
    summary: "Cassian Andor, İmparatorluğa karşı isyanın ilk kıvılcımlarına nasıl katıldığını yaşar." },
  { id: "dizi-98", title: "Foundation", year: 2021, imdb: 7.4, creator: "David S. Goyer & Josh Friedman",
    genres: ["Sci-Fi"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel"],
    summary: "Bir matematikçi, galaktik imparatorluğun çöküşünü öngörüp insanlığın bilgisini korumaya çalışır." },
  { id: "dizi-99", title: "Slow Horses", year: 2022, imdb: 8.2, creator: "Will Smith",
    genres: ["Suç/Polisiye", "Gerilim"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel"],
    summary: "Sürgün edilmiş MI5 ajanları, kaba lider Jackson Lamb yönetiminde tehlikeli görevlere düşer." },
  { id: "dizi-100", title: "For All Mankind", year: 2019, imdb: 7.9, creator: "Ronald D. Moore, Matt Wolpert & Ben Nedivi",
    genres: ["Sci-Fi", "Tarih"], platforms: ["Apple TV+"], moods: ["Popüler/Güncel"],
    summary: "Alternatif tarihte Sovyetler Ay'a ilk ayak basınca uzay yarışı hiç bitmez." },
];

/* ===================== YOUTUBE (100) ===================== */
// Kısaltmalar: yazım hatasını önler. Değerler YT_CULTURES / YT_CATEGORIES ile birebir aynıdır.
const ESSAY = "Video Essay (Fikir Yazısı/Deneme Tarzı)";
const BELGESEL = "Belgesel Sinema / Uzun Metraj Kalitesi";
const SESLI = "Sesli Anlatım / Video-Podcast";
const CAT = {
  uzay: "Uzay & Astrofizik",
  kuantum: "Kuantum & Bilim",
  tarih: "Tarih & Savaşlar",
  yazilim: "Yazılım & Teknoloji",
  finans: "Finans & Ekonomi",
  psikoloji: "Psikoloji & Davranış Bilimleri",
  biyografi: "Biyografi & İlham",
  suc: "Suç & Gizem Analizleri",
  sinema: "Sinema & Sanat Teorisi",
  felsefe: "Felsefe & Varoluşçuluk",
};

// Doğrudan video linki için ilgili öğeye targetUrl: "https://www.youtube.com/watch?v=..." ekleyin.
const YOUTUBE_RAW = [
  { id: "yt-01", title: "Jackie Chan – How to Do Action Comedy", channel: "Every Frame a Painting",
    views: "6.4M", likes: "210K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Jackie Chan'in kadraj, kurgu ve koreografi anlayışını kare kare inceleyen klasik bir video denemesi." },
  { id: "yt-02", title: "Edgar Wright – How to Do Visual Comedy", channel: "Every Frame a Painting",
    views: "5.2M", likes: "190K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Edgar Wright'ın görsel komedi için kurgu, kamera ve ses kullanımını inceler." },
  { id: "yt-03", title: "Michael Bay – What is Bayhem?", channel: "Every Frame a Painting",
    views: "3.8M", likes: "140K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Michael Bay'in imza görsel dilini ve aksiyon estetiğini ciddiyetle çözümler." },
  { id: "yt-04", title: "Martin Scorsese – The Art of Silence", channel: "Every Frame a Painting",
    views: "2.1M", likes: "85K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Scorsese'nin filmlerinde sessizliğin ve boşlukların dramatik gücünü gösterir." },
  { id: "yt-05", title: "Akira Kurosawa – Composing Movement", channel: "Every Frame a Painting",
    views: "4.6M", likes: "160K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Kurosawa'nın hareketi, rüzgârı ve kalabalığı kadrajda nasıl koreografiye çevirdiğini anlatır." },
  { id: "yt-06", title: "How Does an Editor Think and Feel?", channel: "Every Frame a Painting",
    views: "4.1M", likes: "150K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Kurgucunun karar anlarını, ritim ve duygu üzerinden görsel örneklerle açıklar." },
  { id: "yt-07", title: "Buster Keaton – The Wonder of Tracking Shots", channel: "Every Frame a Painting",
    views: "2.3M", likes: "92K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Buster Keaton'ın sessiz sinema döneminde takip çekimlerini nasıl yücelttiğini inceler." },
  { id: "yt-08", title: "Kubrick // One-Point Perspective", channel: "Kogonada",
    views: "2.4M", likes: "62K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Stanley Kubrick'in tek noktalı perspektif kullanımını görsel bir montajla ortaya koyan kısa inceleme." },
  { id: "yt-09", title: "Wes Anderson // Centered", channel: "Kogonada",
    views: "3.0M", likes: "72K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Wes Anderson'ın simetrik ve merkezi kadrajlarını bir montajda bir araya getirir." },
  { id: "yt-10", title: "Ozu // Passing Time", channel: "Kogonada",
    views: "0.6M", likes: "24K", culture: ESSAY, categories: [CAT.sinema],
    summary: "Yasujirō Ozu'nun sakin zaman anlatımını ve boş mekân planlarını derler." },
  { id: "yt-11", title: "Black Holes Explained – From Birth to Death", channel: "Kurzgesagt – In a Nutshell",
    views: "21M", likes: "780K", culture: ESSAY, categories: [CAT.uzay, CAT.kuantum],
    summary: "Bir yıldızın çöküşünden kara deliğin buharlaşmasına kadar evrenin en uç nesnesinin yaşam döngüsü." },
  { id: "yt-12", title: "The Fermi Paradox — Where Are All The Aliens? (1/2)", channel: "Kurzgesagt – In a Nutshell",
    views: "9.6M", likes: "320K", culture: ESSAY, categories: [CAT.uzay, CAT.suc],
    summary: "Evrende bu kadar gezegen varken neden hiçbir uzaylıyla karşılaşmadığımızı tartışır." },
  { id: "yt-13", title: "Why Alien Life Would be our Doom - The Great Filter", channel: "Kurzgesagt – In a Nutshell",
    views: "14M", likes: "520K", culture: ESSAY, categories: [CAT.uzay, CAT.felsefe],
    summary: "Büyük Filtre hipotezini ve insanlığın geleceği için ne anlama geldiğini sorgular." },
  { id: "yt-14", title: "The Last Human – A Glimpse Into The Far Future", channel: "Kurzgesagt – In a Nutshell",
    views: "12M", likes: "450K", culture: ESSAY, categories: [CAT.uzay, CAT.felsefe],
    summary: "İnsanlığın milyonlarca yıl sonraki olası evrimini ve sonunu hayal eder." },
  { id: "yt-15", title: "Timelapse of the Future: A Journey to the End of Time", channel: "melodysheep",
    views: "40M", likes: "1.0M", culture: BELGESEL, categories: [CAT.uzay, CAT.kuantum],
    summary: "Evrenin geleceğini, yıldızların ölümünden zamanın sonuna kadar sinematik bir yolculukla anlatır." },
  { id: "yt-16", title: "Timelapse of the Entire Universe", channel: "melodysheep",
    views: "20M", likes: "520K", culture: BELGESEL, categories: [CAT.uzay, CAT.kuantum],
    summary: "Büyük Patlama'dan bugüne evrenin tüm tarihini hızlandırılmış bir film olarak sunar." },
  { id: "yt-17", title: "A Glorious Dawn ft. Carl Sagan (Cosmos Remixed)", channel: "melodysheep",
    views: "25M", likes: "560K", culture: ESSAY, categories: [CAT.uzay, CAT.felsefe],
    summary: "Carl Sagan'ın sözlerini müzikle birleştiren, evrene hayranlık uyandıran bir remiks." },
  { id: "yt-18", title: "Why No One Has Measured The Speed Of Light", channel: "Veritasium",
    views: "24M", likes: "800K", culture: ESSAY, categories: [CAT.uzay, CAT.kuantum],
    summary: "Işık hızının tek yönlü ölçümünün neden mümkün olmadığını açıklar." },
  { id: "yt-19", title: "Neil deGrasse Tyson: Cosmology, Aliens, Death, Time, Humans & Rocket Launches", channel: "Lex Fridman",
    views: "2.5M", likes: "60K", culture: SESLI, categories: [CAT.uzay, CAT.kuantum],
    summary: "Evren, ölüm, zaman ve insan türünün geleceği üzerine uzun bir söyleşi." },
  { id: "yt-20", title: "Sean Carroll: General Relativity, Quantum Mechanics, Black Holes & Aliens", channel: "Lex Fridman",
    views: "1.4M", likes: "28K", culture: SESLI, categories: [CAT.uzay, CAT.kuantum],
    summary: "Genel görelilik, kuantum mekaniği ve kara delikler üzerine derin bir fizik sohbeti." },
  { id: "yt-21", title: "Stephen Hawking: Asking big questions about the universe", channel: "TED",
    views: "3.5M", likes: "45K", culture: SESLI, categories: [CAT.uzay, CAT.kuantum],
    summary: "Hawking, evrenin kökenine ve insanlığın uzaydaki yerine dair büyük sorular sorar." },
  { id: "yt-22", title: "The Most Misunderstood Concept in Physics", channel: "Veritasium",
    views: "9.5M", likes: "380K", culture: ESSAY, categories: [CAT.kuantum],
    summary: "Entropi neden fiziğin en yanlış anlaşılan kavramlarından biri? Düzensizliğin ardındaki gerçek hikâye." },
  { id: "yt-23", title: "Parallel Worlds Probably Exist. Here's Why", channel: "Veritasium",
    views: "8M", likes: "320K", culture: ESSAY, categories: [CAT.kuantum, CAT.felsefe],
    summary: "Kuantum mekaniğinin çok dünyalar yorumunu ve neden ciddiye alındığını açıklar." },
  { id: "yt-24", title: "The Bizarre Behavior of Rotating Bodies, Explained", channel: "Veritasium",
    views: "17M", likes: "480K", culture: ESSAY, categories: [CAT.kuantum],
    summary: "Dönen cisimlerin tuhaf takla atma davranışını fizik ve matematikle çözer." },
  { id: "yt-25", title: "Is Most Published Research Wrong?", channel: "Veritasium",
    views: "6M", likes: "210K", culture: ESSAY, categories: [CAT.kuantum],
    summary: "Bilimsel araştırmaların neden çoğu zaman yanlış çıkabildiğini istatistik üzerinden anlatır." },
  { id: "yt-26", title: "The Surprising Secret of Synchronization", channel: "Veritasium",
    views: "14M", likes: "420K", culture: ESSAY, categories: [CAT.kuantum],
    summary: "Kalp hücrelerinden ateşböceklerine senkronizasyonun doğadaki şaşırtıcı mekanizmasını anlatır." },
  { id: "yt-27", title: "The Most Powerful Computers You've Never Heard Of", channel: "Veritasium",
    views: "9M", likes: "300K", culture: ESSAY, categories: [CAT.kuantum, CAT.yazilim],
    summary: "Analog bilgisayarların geri dönüşünü ve yapay zekâdaki rolünü anlatır." },
  { id: "yt-28", title: "How To Count Past Infinity", channel: "Vsauce",
    views: "15M", likes: "500K", culture: ESSAY, categories: [CAT.kuantum, CAT.felsefe],
    summary: "Sonsuzluğun ötesinde saymayı sıra sayılar ve sonsuz sayılarla gösterir." },
  { id: "yt-29", title: "The Banach–Tarski Paradox", channel: "Vsauce",
    views: "17M", likes: "580K", culture: ESSAY, categories: [CAT.kuantum],
    summary: "Bir küreyi iki kopya küreye dönüştüren şaşırtıcı matematik paradoksunu açıklar." },
  { id: "yt-30", title: "But what is the Fourier Transform? A visual introduction.", channel: "3Blue1Brown",
    views: "8.5M", likes: "280K", culture: ESSAY, categories: [CAT.kuantum, CAT.yazilim],
    summary: "Fourier dönüşümünün ardındaki sezgiyi görsel bir dille anlatan klasik bir giriş." },
  { id: "yt-31", title: "The Origin of Consciousness – How Unaware Things Became Aware", channel: "Kurzgesagt – In a Nutshell",
    views: "5M", likes: "190K", culture: ESSAY, categories: [CAT.kuantum, CAT.psikoloji, CAT.felsefe],
    summary: "Bilincin cansız maddeden nasıl ortaya çıkmış olabileceğini evrim üzerinden anlatır." },
  { id: "yt-32", title: "Richard Feynman: Fun to Imagine", channel: "BBC Horizon",
    views: "3M", likes: "70K", culture: SESLI, categories: [CAT.kuantum],
    summary: "Nobel ödüllü Feynman, dünyanın nasıl işlediğini sade ve eğlenceli bir dille anlatır." },
  { id: "yt-33", title: "But what is a neural network? | Deep learning chapter 1", channel: "3Blue1Brown",
    views: "17M", likes: "530K", culture: ESSAY, categories: [CAT.yazilim],
    summary: "Sinir ağlarının temelini görsel ve sezgisel bir dille anlatan, derin öğrenmeye kusursuz giriş." },
  { id: "yt-34", title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5", channel: "3Blue1Brown",
    views: "7M", likes: "220K", culture: ESSAY, categories: [CAT.yazilim],
    summary: "GPT gibi büyük dil modellerinin temelindeki transformer mimarisini görsel olarak açıklar." },
  { id: "yt-35", title: "100+ Computer Science Concepts Explained", channel: "Fireship",
    views: "5.1M", likes: "190K", culture: ESSAY, categories: [CAT.yazilim],
    summary: "Algoritmalardan ağlara bilgisayar biliminin temel kavramlarını hızlı bir tempoda toparlar." },
  { id: "yt-36", title: "Let's build GPT: from scratch, in code, spelled out.", channel: "Andrej Karpathy",
    views: "5.5M", likes: "160K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Sıfırdan küçük bir GPT modeli yazarak dil modellerinin işleyişini kodla öğretir." },
  { id: "yt-37", title: "Intro to Large Language Models", channel: "Andrej Karpathy",
    views: "3.1M", likes: "100K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Büyük dil modellerinin ne olduğunu ve nasıl çalıştığını anlaşılır biçimde özetler." },
  { id: "yt-38", title: "Sam Altman: OpenAI, GPT-5, Sora, Board Saga, Elon Musk, Ilya, Power & AGI", channel: "Lex Fridman",
    views: "3.4M", likes: "58K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Yapay zekânın geleceği, güç ve AGI üzerine uzun soluklu, derinlemesine bir söyleşi." },
  { id: "yt-39", title: "Elon Musk: Neuralink, AI, Autopilot, and the Pale Blue Dot", channel: "Lex Fridman",
    views: "2.8M", likes: "52K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Beyin-bilgisayar arayüzleri, otonom sürüş ve yapay zekâ üzerine uzun bir sohbet." },
  { id: "yt-40", title: "Andrej Karpathy: Tesla AI, Self-Driving, Optimus, Aliens, and AGI", channel: "Lex Fridman",
    views: "1.5M", likes: "35K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Tesla'nın otonom sürüşünden Optimus'a yapay zekâ mühendisliğini konuşur." },
  { id: "yt-41", title: "Joe Rogan Experience #1169 - Elon Musk", channel: "PowerfulJRE",
    views: "48M", likes: "560K", culture: SESLI, categories: [CAT.yazilim, CAT.biyografi],
    summary: "Elon Musk ile teknoloji, uzay ve gelecek üzerine uzun ve popüler bir sohbet." },
  { id: "yt-42", title: "The Facebook Dilemma", channel: "FRONTLINE PBS",
    views: "3M", likes: "38K", culture: BELGESEL, categories: [CAT.yazilim],
    summary: "Facebook'un veri, gizlilik ve seçim müdahaleleri konusundaki sorumluluğunu inceleyen belgesel." },
  { id: "yt-43", title: "Can we build AI without losing control over it?", channel: "TED (Sam Harris)",
    views: "5.8M", likes: "100K", culture: SESLI, categories: [CAT.yazilim, CAT.felsefe],
    summary: "Süper zekânın kontrolden çıkma riskini ve buna hazırlık ihtiyacını tartışır." },
  { id: "yt-44", title: "Where's Google going next?", channel: "TED (Larry Page)",
    views: "5.6M", likes: "62K", culture: SESLI, categories: [CAT.yazilim],
    summary: "Google'ın kurucusu, teknolojinin geleceğini ve şirketin hedeflerini anlatır." },
  { id: "yt-45", title: "World War 2 – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "43M", likes: "1.3M", culture: ESSAY, categories: [CAT.tarih],
    summary: "İkinci Dünya Savaşı'nın nedenlerini ve ilk yıllarını mizahi, hızlı ve animasyonlu bir dille anlatır." },
  { id: "yt-46", title: "World War 2 – OverSimplified (Part 2)", channel: "OverSimplified",
    views: "36M", likes: "1.1M", culture: ESSAY, categories: [CAT.tarih],
    summary: "Savaşın ikinci yarısını, dönüm noktalarından teslimiyete animasyonlu olarak sunar." },
  { id: "yt-47", title: "WW1 – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "28M", likes: "850K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Birinci Dünya Savaşı'nın karmaşık nedenlerini ve ilk aşamalarını anlatır." },
  { id: "yt-48", title: "The Cold War – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "14M", likes: "500K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Soğuk Savaş'ın başlangıcını ve süper güçlerin gerilimini özetler." },
  { id: "yt-49", title: "The Vietnam War – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "17M", likes: "560K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Vietnam Savaşı'nın kökenlerini ve ABD'nin müdahalesini animasyonla anlatır." },
  { id: "yt-50", title: "Russian Revolution – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "15M", likes: "520K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Çarlık Rusya'sının çöküşünü ve devrimin ilk yıllarını anlatır." },
  { id: "yt-51", title: "The French Revolution – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "14M", likes: "480K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Fransız Devrimi'nin nedenlerini ve başlangıç sürecini anlatır." },
  { id: "yt-52", title: "The Napoleonic Wars – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "20M", likes: "650K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Napolyon'un yükselişini ve Avrupa'yı saran savaşları özetler." },
  { id: "yt-53", title: "Mongol Empire – OverSimplified (Part 1)", channel: "OverSimplified",
    views: "13M", likes: "450K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Cengiz Han'ın dünyanın en büyük kara imparatorluklarından birini kuruşunu anlatır." },
  { id: "yt-54", title: "Putin's Revenge", channel: "FRONTLINE PBS",
    views: "2.5M", likes: "30K", culture: BELGESEL, categories: [CAT.tarih],
    summary: "Rusya'nın 2016 ABD seçimlerine müdahalesini ve ardındaki siyasi hesapları inceler." },
  { id: "yt-55", title: "The Renaissance: Was it a Thing?: Crash Course World History #22", channel: "CrashCourse",
    views: "4M", likes: "110K", culture: ESSAY, categories: [CAT.tarih],
    summary: "Rönesans'ın gerçekten bir dönüm noktası olup olmadığını mizahi biçimde tartışır." },
  { id: "yt-56", title: "How The Economic Machine Works", channel: "Ray Dalio",
    views: "21M", likes: "460K", culture: ESSAY, categories: [CAT.finans],
    summary: "Kredi, borç ve verimlilik döngüleriyle ekonominin nasıl işlediğini sade bir animasyonla açıklar." },
  { id: "yt-57", title: "Principles for Success by Ray Dalio (In 30 Minutes)", channel: "Principles by Ray Dalio",
    views: "11M", likes: "270K", culture: ESSAY, categories: [CAT.finans, CAT.biyografi],
    summary: "Dalio'nun hayat ve iş prensiplerini kısa, animasyonlu bir anlatımla özetler." },
  { id: "yt-58", title: "The Madoff Affair", channel: "FRONTLINE PBS",
    views: "4M", likes: "40K", culture: BELGESEL, categories: [CAT.finans, CAT.suc],
    summary: "Tarihin en büyük Ponzi şemasının nasıl yürütüldüğünü ve çöktüğünü anlatır." },
  { id: "yt-59", title: "Inside the Meltdown", channel: "FRONTLINE PBS",
    views: "1.5M", likes: "15K", culture: BELGESEL, categories: [CAT.finans],
    summary: "2008 finans krizinin perde arkasını, karar vericilerin anlatımıyla inceler." },
  { id: "yt-60", title: "Amazon Empire: The Rise and Reign of Jeff Bezos", channel: "FRONTLINE PBS",
    views: "8M", likes: "75K", culture: BELGESEL, categories: [CAT.finans, CAT.yazilim, CAT.biyografi],
    summary: "Amazon'un yükselişini ve Jeff Bezos'un liderlik tarzını araştırır." },
  { id: "yt-61", title: "Money, Power and Wall Street", channel: "FRONTLINE PBS",
    views: "1M", likes: "10K", culture: BELGESEL, categories: [CAT.finans],
    summary: "Finans krizinin ardından Wall Street ile hükümetlerin ilişkisini bölüm bölüm inceler." },
  { id: "yt-62", title: "Universal Basic Income Explained – Free Money for Everybody? UBI", channel: "Kurzgesagt – In a Nutshell",
    views: "8M", likes: "280K", culture: ESSAY, categories: [CAT.finans],
    summary: "Evrensel temel gelirin artılarını ve eksilerini tarafsızca tartışır." },
  { id: "yt-63", title: "Humans Need Not Apply", channel: "CGP Grey",
    views: "16M", likes: "330K", culture: ESSAY, categories: [CAT.finans, CAT.yazilim],
    summary: "Otomasyonun işgücü piyasasını nasıl dönüştürebileceğini ele alır." },
  { id: "yt-64", title: "The best stats you've ever seen", channel: "TED (Hans Rosling)",
    views: "14M", likes: "270K", culture: SESLI, categories: [CAT.finans],
    summary: "Hans Rosling, dünya kalkınmasını veriyle canlı ve şaşırtıcı biçimde anlatır." },
  { id: "yt-65", title: "Hans Rosling's 200 Countries, 200 Years, 4 Minutes - The Joy of Stats", channel: "BBC",
    views: "9M", likes: "190K", culture: BELGESEL, categories: [CAT.finans, CAT.tarih],
    summary: "İki yüz ülkenin iki yüz yıllık gelişimini dört dakikada görselleştirir." },
  { id: "yt-66", title: "Introduction to Human Behavioral Biology", channel: "Stanford (Robert Sapolsky)",
    views: "6M", likes: "130K", culture: SESLI, categories: [CAT.psikoloji],
    summary: "Davranışı biyoloji, çevre ve evrim açısından birlikte ele alan Stanford dersinin açılış oturumu." },
  { id: "yt-67", title: "Dr. Matthew Walker: The Science & Practice of Perfecting Your Sleep", channel: "Huberman Lab",
    views: "6.5M", likes: "130K", culture: SESLI, categories: [CAT.psikoloji, CAT.kuantum],
    summary: "Uyku biliminin önde gelen isimlerinden biriyle uykunun beyin ve davranış üzerindeki etkilerini konuşur." },
  { id: "yt-68", title: "Loneliness", channel: "Kurzgesagt – In a Nutshell",
    views: "6.6M", likes: "240K", culture: ESSAY, categories: [CAT.psikoloji],
    summary: "Yalnızlığın zihne ve vücuda etkilerini ve onunla baş etme yollarını anlatır." },
  { id: "yt-69", title: "Your body language may shape who you are", channel: "TED (Amy Cuddy)",
    views: "23M", likes: "380K", culture: SESLI, categories: [CAT.psikoloji],
    summary: "Beden dilinin düşünce ve duygularımızı nasıl etkileyebileceğini araştırır." },
  { id: "yt-70", title: "The power of vulnerability", channel: "TED (Brené Brown)",
    views: "24M", likes: "420K", culture: SESLI, categories: [CAT.psikoloji, CAT.biyografi],
    summary: "Kırılganlığın bağ kurma ve cesaretle ilişkisini anlatır." },
  { id: "yt-71", title: "Grit: the power of passion and perseverance", channel: "TED (Angela Lee Duckworth)",
    views: "12M", likes: "230K", culture: SESLI, categories: [CAT.psikoloji, CAT.biyografi],
    summary: "Başarının tek belirleyicisinin yetenek değil, tutku ve azim olduğunu savunur." },
  { id: "yt-72", title: "Why You Will Marry the Wrong Person", channel: "The School of Life",
    views: "5M", likes: "190K", culture: ESSAY, categories: [CAT.psikoloji, CAT.felsefe],
    summary: "İlişkilerdeki uyumsuzluğun kaçınılmaz olduğunu ve onunla nasıl yaşanacağını tartışır." },
  { id: "yt-73", title: "Why Are Things Creepy?", channel: "Vsauce",
    views: "11M", likes: "380K", culture: ESSAY, categories: [CAT.psikoloji],
    summary: "Ürkütücülük hissinin psikolojik temelini ve evrimsel nedenlerini inceler." },
  { id: "yt-74", title: "The riddle of experience vs. memory", channel: "TED (Daniel Kahneman)",
    views: "4M", likes: "60K", culture: SESLI, categories: [CAT.psikoloji],
    summary: "Yaşadıklarımız ile anılarımız arasındaki farkı ve mutluluk üzerindeki etkisini açıklar." },
  { id: "yt-75", title: "The surprising science of happiness", channel: "TED (Dan Gilbert)",
    views: "21M", likes: "340K", culture: SESLI, categories: [CAT.psikoloji],
    summary: "İnsanın mutluluğu tahmin etme biçimindeki sistematik hataları gösterir." },
  { id: "yt-76", title: "The power of introverts", channel: "TED (Susan Cain)",
    views: "25M", likes: "460K", culture: SESLI, categories: [CAT.psikoloji],
    summary: "İçe dönüklerin toplumdaki değerini ve sessiz güçlerini savunur." },
  { id: "yt-77", title: "Inside the mind of a master procrastinator", channel: "TED (Tim Urban)",
    views: "58M", likes: "1.1M", culture: SESLI, categories: [CAT.psikoloji],
    summary: "Erteleme davranışının ardındaki zihinsel mekanizmaları mizahla anlatır." },
  { id: "yt-78", title: "Steve Jobs' 2005 Stanford Commencement Address", channel: "Stanford",
    views: "40M", likes: "520K", culture: SESLI, categories: [CAT.biyografi],
    summary: "Jobs'ın mezuniyet konuşmasında anlattığı üç hikâye: noktaları birleştirmek, aşk ve kayıp, ölüm." },
  { id: "yt-79", title: "How great leaders inspire action", channel: "TED (Simon Sinek)",
    views: "63M", likes: "1.0M", culture: SESLI, categories: [CAT.biyografi, CAT.psikoloji],
    summary: "Liderlerin neden sorusuyla başlayarak insanları nasıl harekete geçirdiğini anlatır." },
  { id: "yt-80", title: "Do schools kill creativity?", channel: "TED (Sir Ken Robinson)",
    views: "24M", likes: "500K", culture: SESLI, categories: [CAT.biyografi, CAT.psikoloji],
    summary: "Eğitim sisteminin yaratıcılığı nasıl bastırdığını esprili bir dille tartışır." },
  { id: "yt-81", title: "Randy Pausch Last Lecture: Achieving Your Childhood Dreams", channel: "Carnegie Mellon University",
    views: "21M", likes: "280K", culture: SESLI, categories: [CAT.biyografi],
    summary: "Ölümcül hastalıkla yaşayan bir profesörün çocukluk hayalleri üzerine veda dersi." },
  { id: "yt-82", title: "J.K. Rowling Speaks at Harvard Commencement", channel: "Harvard University",
    views: "15M", likes: "290K", culture: SESLI, categories: [CAT.biyografi],
    summary: "Rowling, başarısızlığın faydaları ve hayal gücünün önemi üzerine konuşur." },
  { id: "yt-83", title: "The future we're building -- and boring", channel: "TED (Elon Musk)",
    views: "15M", likes: "230K", culture: SESLI, categories: [CAT.biyografi, CAT.yazilim],
    summary: "Elon Musk, tünel projesi ve geleceğin ulaşımı hakkındaki vizyonunu paylaşır." },
  { id: "yt-84", title: "What If Money Was No Object?", channel: "Alan Watts",
    views: "9M", likes: "280K", culture: SESLI, categories: [CAT.biyografi, CAT.felsefe],
    summary: "Alan Watts, para engeli olmasa nasıl bir hayat yaşayacağımız sorusunu tartışır." },
  { id: "yt-85", title: "Arnold Schwarzenegger's Top 10 Rules For Success", channel: "Evan Carmichael",
    views: "9M", likes: "220K", culture: ESSAY, categories: [CAT.biyografi],
    summary: "Schwarzenegger'in başarı için sıraladığı on kuralı bir araya getiren motivasyon videosu." },
  { id: "yt-86", title: "Why we do what we do", channel: "TED (Tony Robbins)",
    views: "24M", likes: "410K", culture: SESLI, categories: [CAT.biyografi, CAT.psikoloji],
    summary: "Tony Robbins, davranışlarımızı yönlendiren görünmez güçleri anlatır." },
  { id: "yt-87", title: "Your elusive creative genius", channel: "TED (Elizabeth Gilbert)",
    views: "21M", likes: "340K", culture: SESLI, categories: [CAT.biyografi, CAT.psikoloji],
    summary: "Yaratıcılığa çağdaş bir bakış ve sanatçıların kaygılarını hafifletecek bir fikir sunar." },
  { id: "yt-88", title: "The Egg – A Short Story", channel: "Kurzgesagt – In a Nutshell",
    views: "26M", likes: "1.2M", culture: ESSAY, categories: [CAT.felsefe],
    summary: "Ölümden sonra karşılaşılan bir varlığın anlattığı, yaşam ve kimlik üzerine düşündüren kısa bir hikâye." },
  { id: "yt-89", title: "Optimistic Nihilism", channel: "Kurzgesagt – In a Nutshell",
    views: "14M", likes: "540K", culture: ESSAY, categories: [CAT.felsefe],
    summary: "Evrenin anlamsızlığı karşısında kendi anlamımızı yaratmayı savunan bir fikir denemesi." },
  { id: "yt-90", title: "Is Your Red The Same as My Red?", channel: "Vsauce",
    views: "16M", likes: "450K", culture: ESSAY, categories: [CAT.felsefe, CAT.psikoloji],
    summary: "Algı, bilinç ve qualia üzerine: başkasının gördüğü kırmızıyı asla bilemeyebilir miyiz?" },
  { id: "yt-91", title: "Existentialism: Crash Course Philosophy #16", channel: "CrashCourse",
    views: "3M", likes: "70K", culture: ESSAY, categories: [CAT.felsefe],
    summary: "Sartre, Kierkegaard ve Camus üzerinden varoluşçuluğun temel fikirlerini özetler." },
  { id: "yt-92", title: "Justice: What's The Right Thing To Do? Episode 01 – The Moral Side of Murder", channel: "Harvard University (Michael Sandel)",
    views: "8M", likes: "60K", culture: SESLI, categories: [CAT.felsefe],
    summary: "Michael Sandel, ahlaki ikilemler üzerinden adalet felsefesine giriş yapar." },
  { id: "yt-93", title: "What is Philosophy?: Crash Course Philosophy #1", channel: "CrashCourse",
    views: "4M", likes: "110K", culture: ESSAY, categories: [CAT.felsefe],
    summary: "Felsefenin ne olduğunu ve hangi soruları sorduğunu hızlı bir girişle anlatır." },
  { id: "yt-94", title: "The illusion of consciousness", channel: "TED (Dan Dennett)",
    views: "3M", likes: "60K", culture: SESLI, categories: [CAT.felsefe, CAT.psikoloji],
    summary: "Bilincin doğası üzerine, zihnin bizi nasıl kandırdığını anlatan bir konuşma." },
  { id: "yt-95", title: "The why and how of effective altruism", channel: "TED (Peter Singer)",
    views: "2.5M", likes: "45K", culture: SESLI, categories: [CAT.felsefe],
    summary: "Etkili bağış anlayışını ve ahlaki sorumluluğumuzu sorgular." },
  { id: "yt-96", title: "A kinder, gentler philosophy of success", channel: "TED (Alain de Botton)",
    views: "3.5M", likes: "60K", culture: SESLI, categories: [CAT.felsefe, CAT.biyografi],
    summary: "Başarı kavramına daha şefkatli bir felsefi bakış sunar." },
  { id: "yt-97", title: "Aristotle & Virtue Theory: Crash Course Philosophy #38", channel: "CrashCourse",
    views: "1.5M", likes: "25K", culture: ESSAY, categories: [CAT.felsefe],
    summary: "Aristoteles'in erdem etiği ve iyi yaşam anlayışını tanıtır." },
  { id: "yt-98", title: "Cicada 3301: An Internet Mystery", channel: "LEMMiNO",
    views: "11M", likes: "320K", culture: BELGESEL, categories: [CAT.suc],
    summary: "İnternetin en gizemli bulmacalarından birinin, şifreler ve ipuçlarıyla dolu sinematik anlatımı." },
  { id: "yt-99", title: "Flaw in the Enigma Code", channel: "Computerphile",
    views: "3M", likes: "120K", culture: ESSAY, categories: [CAT.suc, CAT.tarih, CAT.yazilim],
    summary: "Enigma'nın hiçbir harfi kendine şifrelememesinin kırılmasındaki rolünü açıklar." },
  { id: "yt-100", title: "Cracking Enigma in 2021", channel: "Computerphile",
    views: "1.2M", likes: "40K", culture: ESSAY, categories: [CAT.suc, CAT.tarih, CAT.yazilim],
    summary: "Enigma'yı modern bir bilgisayarla saniyeler içinde kırmanın nasıl yapıldığını gösterir." },
];

/* ===================== DIŞA AKTARIM ===================== */
// Gerçek görseller scripts/resolve-artwork.mjs ile src/data/artwork.js içine yazılır.
// Bir içerik için sonuç yoksa otomatik üretilen kapak görseli kullanılır.
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const KIND_LABELS = { film: "FİLM", dizi: "DİZİ", youtube: "YOUTUBE" };

function withTmdbArt(raw, type) {
  const art = artwork[raw.id] || {};
  const label = KIND_LABELS[type];
  const subtitle = String(raw.year);
  const hasCustomArt = Boolean(raw.imageUrl || raw.posterUrl);
  const hasTmdbArt = Boolean(art.backdrop || art.poster);

  return {
    ...raw,
    type,
    summaryEn: raw.summaryEn ?? art.overviewEn ?? null,
    imageUrl:
      raw.imageUrl ?? (art.backdrop ? `${TMDB_IMAGE_BASE}/w780${art.backdrop}` : wideImage(label, raw.title, subtitle)),
    posterUrl:
      raw.posterUrl ?? (art.poster ? `${TMDB_IMAGE_BASE}/w500${art.poster}` : posterImage(label, raw.title, subtitle)),
    artSource: hasCustomArt ? "custom" : hasTmdbArt ? "tmdb" : "generated",
    targetUrl: raw.targetUrl ?? buildStreamingUrl(raw),
  };
}

export const movies = FILMS_RAW.map((m) => withTmdbArt(m, "film"));
export const series = SERIES_RAW.map((s) => withTmdbArt(s, "dizi"));

export const youtubeVideos = YOUTUBE_RAW.map((v) => {
  const art = artwork[v.id] || {};
  const videoId = v.videoId ?? art.videoId ?? null;
  const thumb = art.thumb ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);
  const hasCustomArt = Boolean(v.imageUrl || v.posterUrl);

  return {
    ...v,
    type: "youtube",
    // Geriye dönük uyumluluk: sonuç modalı etiket olarak item.style okur; culture ile aynı değerdir.
    style: v.culture,
    summaryEn: v.summaryEn ?? summariesEn[v.id] ?? null,
    views: art.views ?? v.views,
    likes: art.likes ?? v.likes,
    imageUrl: v.imageUrl ?? thumb ?? wideImage("YOUTUBE", v.title, v.channel),
    posterUrl: v.posterUrl ?? thumb ?? posterImage("YOUTUBE", v.title, v.channel),
    artSource: hasCustomArt ? "custom" : thumb ? "youtube" : "generated",
    targetUrl: v.targetUrl ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : buildYoutubeUrl(v)),
  };
});

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Özel Çark seçeneğini, diğer içeriklerle aynı biçimde bir "item" nesnesine çevirir.
// Bağlantı varsa oraya, yoksa Google aramasına yönlendirir.
export function createCustomItem(option) {
  const host = option.url ? safeHost(option.url) : "";
  return {
    id: option.id,
    type: "custom",
    title: option.title,
    summary: "",
    summaryEn: null,
    host,
    hasLink: Boolean(option.url),
    imageUrl: wideImage("ÖZEL", option.title, host),
    posterUrl: posterImage("ÖZEL", option.title, host),
    artSource: "generated",
    targetUrl: option.url || `https://www.google.com/search?q=${encodeURIComponent(option.title)}`,
  };
}

// Gerçek görsel yüklenemezse bileşenler bu üretilmiş kapak görseline düşer.
export function getFallbackImage(item) {
  const subtitle = item.type === "youtube" ? item.channel : String(item.year);
  return wideImage(KIND_LABELS[item.type] || "SPINEMA", item.title, subtitle);
}

// Seçili dile göre açıklama: İngilizce yoksa Türkçe metne düşer.
export function localizeSummary(item, lang) {
  if (lang === "en" && item.summaryEn) return item.summaryEn;
  return item.summary;
}

// Yönetmen/yaratıcı satırındaki Türkçe notları İngilizceye çevirir.
export function localizeCredit(text, lang) {
  if (!text) return "";
  if (lang !== "en") return text;
  return String(text)
    .replace("Duffer Kardeşler", "The Duffer Brothers")
    .replace("(yapımcı)", "(producer)")
    .replace("(yönetmen)", "(director)");
}

export function getPool(category) {
  if (category === "film") return movies;
  if (category === "dizi") return series;
  if (category === "youtube") return youtubeVideos;
  return [];
}

// Aynı grup içinde VEYA, gruplar arasında VE mantığı. Boş grup kısıt getirmez.
export function filterContent(category, filters = {}) {
  const f = { ...EMPTY_FILTERS, ...filters };
  const any = (selected, values) => selected.length === 0 || selected.some((s) => values.includes(s));

  return getPool(category).filter((item) => {
    if (category === "youtube") {
      return any(f.culture, [item.culture]) && any(f.category, item.categories);
    }
    const moodValues = item.imdb >= 8 ? [MOOD_IMDB, ...item.moods] : item.moods;
    return any(f.mood, moodValues) && any(f.genre, item.genres) && any(f.platform, item.platforms);
  });
}

// Rozet metinleri.
// Film/Dizi : "IMDb 8.4"
// YouTube   : "👁️ 1.2M" ve "🔥 140K Beğeni" / "🔥 140K Likes" (yüzde veya yıldız ASLA kullanılmaz)
// Özel Çark : "🎡 Özel" / "🎡 Custom"
export function formatMetrics(item, lang = "tr") {
  if (item.type === "custom") {
    return [`🎡 ${lang === "en" ? "Custom" : "Özel"}`];
  }
  if (item.type === "youtube") {
    const badges = [`👁️ ${item.views}`];
    if (item.likes) badges.push(`🔥 ${item.likes} ${lang === "en" ? "Likes" : "Beğeni"}`);
    return badges;
  }
  return [`IMDb ${Number(item.imdb).toFixed(1)}`];
}

/* ===================== GELİŞTİRME MODU DOĞRULAMASI ===================== */
// Veri havuzundaki bir değer filtre listelerinde yoksa (yazım hatası vb.) konsolda uyarır.
if (import.meta.env && import.meta.env.DEV) {
  const unknown = [];
  const check = (item, field, values, allowed) => {
    values.forEach((value) => {
      if (!allowed.includes(value)) unknown.push(`${item.id}.${field} -> "${value}"`);
    });
  };

  [...movies, ...series].forEach((item) => {
    check(item, "genres", item.genres, GENRES);
    check(item, "platforms", item.platforms, PLATFORMS);
    check(item, "moods", item.moods, MOODS);
  });

  youtubeVideos.forEach((item) => {
    check(item, "culture", [item.culture], YT_CULTURES);
    check(item, "categories", item.categories, YT_CATEGORIES);
  });

  if (unknown.length > 0) {
    console.warn("[SPINEMA] mockData içinde filtre listelerinde bulunmayan değerler var:", unknown);
  }
}