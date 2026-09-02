export const MANDIS_BY_STATE = {
  Maharashtra:[
    {name:"Lasalgaon APMC",  district:"Nashik"},
    {name:"Nashik APMC",     district:"Nashik"},
    {name:"Pune Mandai",     district:"Pune"},
    {name:"Solapur APMC",    district:"Solapur"},
    {name:"Nagpur APMC",     district:"Nagpur"},
    {name:"Latur APMC",      district:"Latur"},
    {name:"Satara Mandi",    district:"Satara"},
    {name:"Kolhapur APMC",   district:"Kolhapur"},
    {name:"Aurangabad Mandi",district:"Aurangabad"},
  ],
  Karnataka:[
    {name:"Kolar APMC",   district:"Kolar"},
    {name:"Mysore APMC",  district:"Mysore"},
    {name:"Hassan Mandi", district:"Hassan"},
    {name:"Tumkur APMC",  district:"Tumkur"},
    {name:"Hubli APMC",   district:"Dharwad"},
  ],
  "Uttar Pradesh":[
    {name:"Agra APMC",     district:"Agra"},
    {name:"Kanpur Mandi",  district:"Kanpur"},
    {name:"Lucknow APMC",  district:"Lucknow"},
    {name:"Varanasi APMC", district:"Varanasi"},
    {name:"Mathura Mandi", district:"Mathura"},
  ],
  Rajasthan:[
    {name:"Jaipur Mandi", district:"Jaipur"},
    {name:"Jodhpur APMC", district:"Jodhpur"},
    {name:"Kota Mandi",   district:"Kota"},
  ],
  Punjab:[
    {name:"Amritsar Mandi",district:"Amritsar"},
    {name:"Ludhiana APMC", district:"Ludhiana"},
    {name:"Patiala Mandi", district:"Patiala"},
  ],
  "Madhya Pradesh":[
    {name:"Indore APMC",  district:"Indore"},
    {name:"Bhopal Mandi", district:"Bhopal"},
    {name:"Gwalior APMC", district:"Gwalior"},
  ],
  Gujarat:[
    {name:"Ahmedabad APMC",district:"Ahmedabad"},
    {name:"Surat Mandi",   district:"Surat"},
    {name:"Rajkot APMC",   district:"Rajkot"},
  ],
  "Tamil Nadu":[
    {name:"Chennai APMC",     district:"Chennai"},
    {name:"Coimbatore Mandi", district:"Coimbatore"},
    {name:"Madurai APMC",     district:"Madurai"},
  ],
  "Andhra Pradesh":[
    {name:"Kurnool APMC",    district:"Kurnool"},
    {name:"Vijayawada Mandi",district:"Krishna"},
    {name:"Guntur APMC",     district:"Guntur"},
  ],
  Telangana:[
    {name:"Hyderabad APMC", district:"Hyderabad"},
    {name:"Warangal Mandi", district:"Warangal"},
    {name:"Nizamabad APMC", district:"Nizamabad"},
  ],
};

export const getMandisByState = (state) =>
  MANDIS_BY_STATE[state] || MANDIS_BY_STATE["Maharashtra"];

export const getOrderedMandis = (profileMandi, state) => {
  const list = getMandisByState(state).map((m) => m.name);
  return [profileMandi, ...list.filter((n) => n !== profileMandi)];
};
