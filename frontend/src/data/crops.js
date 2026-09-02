export const ALL_CROPS = [
  { id:"tomato", emoji:"🍅", label:"Tomato", hi:"टमाटर",  kn:"ಟೊಮೇಟೊ"   },
  { id:"onion",  emoji:"🧅", label:"Onion",  hi:"प्याज",  kn:"ಈರುಳ್ಳಿ"    },
  { id:"potato", emoji:"🥔", label:"Potato", hi:"आलू",    kn:"ಆಲೂಗಡ್ಡೆ"  },
  { id:"wheat",  emoji:"🌾", label:"Wheat",  hi:"गेहूं",  kn:"ಗೋಧಿ"       },
  { id:"rice",   emoji:"🌾", label:"Rice",   hi:"चावल",   kn:"ಅಕ್ಕಿ"       },
];

export const STATES = [
  "Maharashtra","Karnataka","Uttar Pradesh","Rajasthan",
  "Punjab","Madhya Pradesh","Gujarat","Tamil Nadu",
  "Andhra Pradesh","Telangana",
];

export const cropName = (crop, lang) =>
  lang === "hi" ? crop.hi : lang === "kn" ? crop.kn : crop.label;
