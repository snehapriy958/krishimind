export const CROP_DATA = {
  tomato:{ base:18,  pred:15.2, conf:71, adv:"SELL", pct:-15.6 },
  onion: { base:22,  pred:26.5, conf:89, adv:"HOLD", pct:+20.5 },
  potato:{ base:11,  pred:12.8, conf:76, adv:"HOLD", pct:+16.4 },
  wheat: { base:21,  pred:22.4, conf:82, adv:"HOLD", pct: +6.7 },
  rice:  { base:24,  pred:25.1, conf:78, adv:"HOLD", pct: +4.6 },
};
export const getCropData = (cropId) => CROP_DATA[cropId] || CROP_DATA["onion"];
