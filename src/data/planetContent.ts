// 各星球展開後顯示的內容資料
// 之後要修改作品內容只需編輯這個檔案

import { asset } from "@/lib/asset";

export type PlanetId =
  | "projects"
  | "drawings"
  | "profile"
  | "contact"
  | "stickers"
  | "illustrations";

// ===== 共用型別 =====

export type WorkImage = {
  src: string;
  alt: string;
  caption?: string;
  /** placeholder：開啟後該圖會顯示「待補充」覆蓋層 */
  placeholder?: boolean;
};

export type ContentCard = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  href?: string;
  download?: boolean;
  external?: boolean;
  comingSoon?: boolean;
};

export type CTA = {
  text: string;
  href: string;
  type: "email" | "external" | "download";
};

// ===== 敘事型章節（如願の神社） =====

export type Chapter = {
  id: string;
  number: string;
  title: string;
  description: string;
  images: WorkImage[];
  layout?: "single" | "grid-2" | "grid-3" | "grid-4";
};

// ===== Series（貼圖系列） =====

export type SeriesItem = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  images: WorkImage[];
};

// ===== Portfolio Featured（珧幽多視圖） =====

export type FeaturedWork = {
  title: string;
  subtitle?: string;
  description: string;
  views: WorkImage[]; // 多視角（如三視圖）
};

// ===== Profile 結構 =====

export type ProfileSection = {
  id: string;
  title: string;
  /** 內容用陣列方便分段；每項一行 */
  items: string[];
  /** placeholder：顯示「待補充」灰框 */
  placeholder?: boolean;
};

export type ExperienceItem = {
  time: string;
  role: string;
  org: string;
  description?: string;
  placeholder?: boolean;
};

// ===== 星球資料 discriminated union =====

export type PlanetData =
  | {
      type: "narrative";
      hero: WorkImage;
      intro: string;
      chapters: Chapter[];
      endingCTA?: CTA;
    }
  | {
      type: "info";
      cards: ContentCard[];
    }
  | {
      type: "gallery";
      intro?: string;
      images: WorkImage[];
    }
  | {
      type: "series";
      intro?: string;
      series: SeriesItem[];
    }
  | {
      type: "portfolio";
      intro?: string;
      featured?: FeaturedWork[];
      otherWorks?: WorkImage[];
    }
  | {
      type: "profile";
      bio: string;
      bioPlaceholder?: boolean;
      skills?: ProfileSection[];
      experience?: ExperienceItem[];
      cv?: { href: string; download?: boolean };
    };

// ===== 內容資料本體 =====

export const PLANET_CONTENT: Record<PlanetId, PlanetData> = {
  // ─── HAMAL 專題作品：願の神社 case study ───
  projects: {
    type: "narrative",
    hero: {
      src: asset("/works/projects/IMG_1379.jpg"),
      alt: "願の神社主視覺 — 嶺東科技大學 DCD 數位媒體設計學系專題",
    },
    intro:
      "在動亂不堪、民不聊生的時代，匯集所有人願望所誕生的虛擬角色「新輝」，傾聽並實現所有人的願望，卻因人性的貪婪，趕不上實現願望的速度，被人們質疑或遺忘，逐漸喪失信仰的力量。",
    chapters: [
      {
        id: "world",
        number: "Chapter 01",
        title: "世界觀設定",
        description:
          "願の神社是承載眾人願望的所在。在這座神社裡，新輝聆聽每一個渴望，為失落的人們點亮一盞燈。然而當人性過度依賴神祇，信仰本身也成了負擔。",
        images: [
          {
            src: asset("/works/projects/IMG_0631.png"),
            alt: "願の神社主場景 — 鳥居與光球，Q 版新輝奉上願望",
          },
        ],
        layout: "single",
      },
      {
        id: "character",
        number: "Chapter 02",
        title: "角色核心 · 第一版設計",
        description:
          "新輝是這個世界的核心，兩條設定撐起角色：許願神不能為自己許願，只能傾盡所有實現他人；頭頂的鈴鐺是新輝本身的狀態指示，當信仰枯竭，鈴鐺也將失去聲響。第一版 2D Live 採黃色和服 + 鈴鐺髮飾，定下角色基礎輪廓。",
        images: [
          {
            src: asset("/works/projects/IMG_0630.png"),
            alt: "新輝第一版 2D Live 立繪 — 黃色和服與鈴鐺髮飾",
          },
        ],
        layout: "single",
      },
      {
        id: "v2",
        number: "Chapter 03",
        title: "第二版進化",
        description:
          "第二版將角色外型修改成較成熟的版本，在細節上多了許多變化，將部件拆得更細緻，使直播中的動態效果更流暢。配色由黃轉紅，氣質從稚嫩走向沉穩。",
        images: [
          {
            src: asset("/works/projects/IMG_1259.png"),
            alt: "新輝第二版正面立繪 — 紅色和服與精緻配件",
          },
          {
            src: asset("/works/projects/IMG_1357.gif"),
            alt: "新輝 2D Live 動畫展示",
          },
        ],
        layout: "grid-2",
      },
      {
        id: "live-covers",
        number: "Chapter 04",
        title: "直播應用 · 遊戲封面",
        description:
          "為不同直播主題繪製專屬封面：結合廚師元素的「Overcooked2」、嘗試多角度神情的「你畫我猜」、取俏皮神情的「七日殺」，以及變換姿態的「野獸派對」。每張封面強化角色不同面向。",
        images: [
          {
            src: asset("/works/projects/IMG_0595.png"),
            alt: "Overcooked2 直播封面 — 廚師帽元素，喜悅大笑",
            caption: "Overcooked2 · 結合廚師元素",
          },
          {
            src: asset("/works/projects/IMG_0596.png"),
            alt: "你畫我猜直播封面 — 不同角度與神情",
            caption: "你畫我猜 · 嘗試不同角度",
          },
          {
            src: asset("/works/projects/IMG_0601.png"),
            alt: "七日殺直播封面 — 俏皮露齒神情",
            caption: "七日殺 · 俏皮神情",
          },
          {
            src: asset("/works/projects/IMG_0603.png"),
            alt: "野獸派對直播封面 — 側臉淺笑",
            caption: "野獸派對 · 動態姿態",
          },
        ],
        layout: "grid-4",
      },
      {
        id: "team",
        number: "Chapter 05",
        title: "製作團隊",
        description:
          "由五位組員的個人特質與形象化所繪製的 Q 版組員介紹圖，每位組員都有專屬的吉祥動物。組員五人的 Q 版人物立繪，參考本人外型特質設計而成。",
        images: [
          {
            src: asset("/works/projects/IMG_1350.png"),
            alt: "五位組員的吉祥動物形象化合圖",
            caption: "組員形象化吉祥物",
          },
          {
            src: asset("/works/projects/IMG_1351.png"),
            alt: "組員 Q 版立繪 1 — 青蛙吉祥動物",
          },
          {
            src: asset("/works/projects/IMG_1352.png"),
            alt: "組員 Q 版立繪 2 — 太陽吉祥動物",
          },
          {
            src: asset("/works/projects/IMG_1353.png"),
            alt: "組員 Q 版立繪 3 — 熊貓吉祥動物",
          },
          {
            src: asset("/works/projects/IMG_1354.png"),
            alt: "組員 Q 版立繪 4 — 魚吉祥動物",
          },
          {
            src: asset("/works/projects/IMG_1355.png"),
            alt: "組員 Q 版立繪 5 — 羊吉祥動物",
          },
          {
            src: asset("/works/projects/IMG_1378.png"),
            alt: "組員雙人 Q 版插畫",
          },
        ],
        layout: "grid-4",
      },
    ],
    endingCTA: {
      text: "想了解製作細節，歡迎來信",
      href: "mailto:xiaovip2002@gmail.com",
      type: "email",
    },
  },

  // ─── MESARTHIM 個人資料（擴充版） ───
  profile: {
    type: "profile",
    bio: `我從小就喜歡畫圖，也喜歡天馬行空地發想，一路從振聲高中多媒科念到嶺東科大數媒系，走的都是設計這條路。這段過程養成了兩個習慣：做事前喜歡先把流程想清楚，以及對自己做出來的東西很難滿意，總覺得還可以更好。我相信沒有完美的版本，但每次都能比昨天再修得好一點，這樣就夠了。

當兵這一年，我負責單位的文宣與美術工作，從活動宣傳到文宣品設計都實際做過，也讓我習慣在時間與規範內把事情交出來。也是在這一年，我慢慢想清楚——比起單純把東西「做出來」，我更感興趣的是去理解整體的運作方式、邏輯、哪裡卡住、哪裡可以更順，甚至如何呈現更好的視覺體驗。

我對遊戲一直很有興趣，不只擅長的美術，還有比較少接觸的後台——儲值、交易、平台這些玩家看不到的地方怎麼串起來、怎麼維持穩定。這也是我想往企劃走的原因。我知道自己在這塊算新手，但擅長拆解問題、願意花時間把細節一個個弄懂，是我比較有把握的地方。

我的想法有時候比較跳躍，好處是能從不同角度看問題；但我也不是想到就算了的人，發現的事情會盡量追到底。比起一份做完就結束的工作，我更希望待在一個能持續累積、也能不斷把東西做得更好的地方。`,
    skills: [
      {
        id: "planning",
        title: "企劃與思維",
        items: [
          "流程規劃 · 凡事先想清楚再做",
          "問題拆解 · 細節追到底",
          "機制觀察與系統思考",
          "對遊戲後台 / 平台運作的好奇",
        ],
      },
      {
        id: "design",
        title: "視覺與美術",
        items: [
          "2D 插畫（日漫風格）",
          "角色設計與多視圖",
          "版面排版 · 編輯設計",
          "表情包 · 系列創作",
        ],
      },
      {
        id: "tool",
        title: "工具與證照",
        items: [
          "Adobe Illustrator",
          "Adobe Photoshop",
          "Procreate",
          "廣告設計 乙級 / 丙級證照",
        ],
      },
    ],
    experience: [
      {
        time: "2024/9 - 仍在職（屆退 2026/7）",
        role: "文書兵 · 志願役",
        org: "中華民國陸軍",
        description:
          "負責單位文宣與美術工作，活動宣傳到文宣品設計實際執行；習慣在時間與規範內交件、與長官來回確認細節。工具：Illustrator / Photoshop / Procreate。",
      },
      {
        time: "2020/9 - 2024/6",
        role: "學士 · 數位媒體設計系",
        org: "嶺東科技大學",
        description:
          "畢業製作《願の神社》— Vtuber 角色製作與經營（詳見 α LOS HAMAL 星球）。",
      },
    ],
    cv: {
      href: asset("/cv.pdf"),
      download: true,
    },
  },

  // ─── BOTEIN 聯絡方式 ───
  contact: {
    type: "info",
    cards: [
      {
        id: "ig",
        title: "Instagram",
        subtitle: "@Lostar.0404",
        description: "日常作品 / 創作過程分享",
        href: "https://instagram.com/Lostar.0404",
        external: true,
      },
      {
        id: "email",
        title: "Email",
        subtitle: "xiaovip2002@gmail.com",
        description: "工作邀約、合作洽詢",
        href: "mailto:xiaovip2002@gmail.com",
        external: true,
      },
    ],
  },

  // ─── SHERATAN 繪圖專案 portfolio ───
  drawings: {
    type: "portfolio",
    intro:
      "這裡收錄日常的個人練習與原創角色開發，沒有交付壓力，只有想畫的東西。",
    featured: [
      {
        title: "珧幽",
        subtitle: "ORIGINAL CHARACTER · 三視圖",
        description: `曾用於「元宇宙創作競賽」參賽角色。

角色設定：惡魔的女兒，整天在地獄無所事事、遊手好閒，因而被趕來人間歷練。沒有工作過的她什麼都不會，沒有公司要她，最後流落街頭——在街邊獨自唱著歌的她被星探發掘，來到了餐酒館獻唱，自此歌聲逐漸出名，成為了一名歌手。`,
        views: [
          {
            src: asset("/works/drawings/yaoyou-front.png"),
            alt: "珧幽 — 正面視圖",
            caption: "FRONT · 正視圖",
          },
          {
            src: asset("/works/drawings/yaoyou-side.png"),
            alt: "珧幽 — 側面視圖",
            caption: "SIDE · 側視圖",
          },
          {
            src: asset("/works/drawings/yaoyou-back.png"),
            alt: "珧幽 — 背面視圖",
            caption: "BACK · 後視圖",
          },
        ],
      },
      {
        title: "魚人族角色",
        subtitle: "COLLAB · 2D LIVE 設計嘗試",
        description: `與大學專題組員嘗試合作的虛擬角色設計，目標繪製全身 2D Live，後續可用於直播與動圖製作，是嘗試性的合作、非商業案。

創作理念：朋友的綽號叫「魚」，便以魚人族為元素，結合喜歡的服飾風格、標準色等發想，進而誕生此角色。`,
        views: [
          {
            src: asset("/works/drawings/IMG_1256.png"),
            alt: "魚人族角色 — Q 版概念",
            caption: "Q 版 · 概念探索",
          },
          {
            src: asset("/works/drawings/IMG_1257.jpg"),
            alt: "魚人族角色 — 半身嘗試",
            caption: "半身 · 設定試畫",
          },
          {
            src: asset("/works/drawings/IMG_1380.png"),
            alt: "魚人族角色 — 全身 2D Live 立繪",
            caption: "全身 · 2D Live 立繪",
          },
        ],
      },
    ],
  },

  // ─── ILLUS 插圖合輯 gallery ───
  illustrations: {
    type: "gallery",
    intro:
      "跨越題材的繪圖練習，從同人致敬到原創構圖。每張都是一次新嘗試，純展示繪畫能力，無商業使用意圖。",
    images: [
      {
        src: asset("/works/illustrations/harry.png"),
        alt: "哈利波特同人 — 妙麗與哈利 Q 版",
        caption: "哈利波特同人",
      },
      {
        src: asset("/works/illustrations/IMG_1346.png"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
      {
        src: asset("/works/illustrations/IMG_1347.png"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
      {
        src: asset("/works/illustrations/IMG_1348.jpg"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
      {
        src: asset("/works/illustrations/IMG_1349.jpg"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
      {
        src: asset("/works/illustrations/IMG_1377.jpg"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
      {
        src: asset("/works/illustrations/5763728D-B279-45B6-9AED-51962ED90D3E.jpeg"),
        alt: "插圖作品",
        caption: "待補充 · 作品說明",
        placeholder: true,
      },
    ],
  },

  // ─── STICKER 貼圖創作 series ───
  stickers: {
    type: "series",
    intro:
      "為日常對話設計的表情包系列，每組角色都帶有獨特個性與情緒表達。",
    series: [
      {
        id: "jiguagua",
        title: "吉呱呱",
        subtitle: "STICKER SERIES · 06",
        description:
          "靈感來源是朋友養的「饅頭蛙」，結合凸眼顯得很呆萌，配上搞怪的情境，顯得很無俚頭。",
        images: [
          { src: asset("/works/stickers/jiguagua/IMG_1340.png"), alt: "吉呱呱貼圖 1" },
          { src: asset("/works/stickers/jiguagua/IMG_1341.png"), alt: "吉呱呱貼圖 2" },
          { src: asset("/works/stickers/jiguagua/IMG_1342.png"), alt: "吉呱呱貼圖 3" },
          { src: asset("/works/stickers/jiguagua/IMG_1343.png"), alt: "吉呱呱貼圖 4" },
          { src: asset("/works/stickers/jiguagua/IMG_1344.png"), alt: "吉呱呱貼圖 5" },
          { src: asset("/works/stickers/jiguagua/IMG_1345.png"), alt: "吉呱呱貼圖 6" },
        ],
      },
      {
        id: "qiuqiuyang",
        title: "邱邱羊",
        subtitle: "STICKER SERIES · 18",
        description:
          "角色靈感來自於大學時期的一個朋友還有他的貓，常常有好多奇怪的口頭禪跟用語，覺得很好笑很有趣。",
        images: [
          { src: asset("/works/stickers/qiuqiuyang/IMG_1358.png"), alt: "邱邱羊貼圖 1" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1359.png"), alt: "邱邱羊貼圖 2" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1360.png"), alt: "邱邱羊貼圖 3" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1361.png"), alt: "邱邱羊貼圖 4" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1362.png"), alt: "邱邱羊貼圖 5" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1363.png"), alt: "邱邱羊貼圖 6" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1364.png"), alt: "邱邱羊貼圖 7" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1365.png"), alt: "邱邱羊貼圖 8" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1366.png"), alt: "邱邱羊貼圖 9" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1367.png"), alt: "邱邱羊貼圖 10" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1368.png"), alt: "邱邱羊貼圖 11" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1369.png"), alt: "邱邱羊貼圖 12" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1370.png"), alt: "邱邱羊貼圖 13" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1371.png"), alt: "邱邱羊貼圖 14" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1372.png"), alt: "邱邱羊貼圖 15" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1373.png"), alt: "邱邱羊貼圖 16" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1374.png"), alt: "邱邱羊貼圖 17" },
          { src: asset("/works/stickers/qiuqiuyang/IMG_1375.png"), alt: "邱邱羊貼圖 18" },
        ],
      },
    ],
  },
};
