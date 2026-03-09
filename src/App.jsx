import { useState, useMemo, useEffect } from "react";

// ─── Airtable config ──────────────────────────────────────────────────────────
const AIRTABLE_TOKEN   = "patCNeFtCZwEr5CFG.c1a69a42b3f5ab88c5eacc93ec886e654b2b83920a2413104b876b9b0ab977a6";
const AIRTABLE_BASE_ID = "appkITT5RMqzvvJ37";
const AIRTABLE_TABLE   = "Locations";

// ─── Fallback data (always works, even before Airtable is populated) ──────────
const FALLBACK_LOCATIONS = [
  { id:"f1",  name:"Ritual Urban Retreat",           address:"689 Denman St",           lat:49.2923, lng:-123.1344, category:"studio",     description:"Full-spectrum wellness studio — yoga, pilates, sound baths, breathwork, sauna & cold plunge.",                                    price:"$$",  city:"Vancouver",          hours:"Mon–Sun 6:45am–9pm",  moods:["wired","anxious","overstimulated"], archetypes:["cortisol","disconnector"],         vibes:["slow","solo","grounding"],    color:"#7A1A5A" },
  { id:"f2",  name:"The Good Sauna",                 address:"1216 Franklin St",         lat:49.2822, lng:-123.0784, category:"sauna",      description:"Wood-fired sauna + 3 cold plunge pools. No wellness fluff — just heat, cold, and real people.",                                  price:"$$",  city:"Vancouver",          hours:"Tue–Sun 4pm–late",    moods:["wired","flat","overstimulated"],    archetypes:["cortisol","optimizer"],           vibes:["social","grounding","sensory"],color:"#5080C0" },
  { id:"f3",  name:"Gatherwell Mount Pleasant",      address:"316 W 5th Ave",            lat:49.2664, lng:-123.1113, category:"sauna",      description:"Outdoor saunas, cold plunge pools, fire pit, and strong community vibe.",                                                        price:"$$",  city:"Vancouver",          hours:"Mon–Sun (see schedule)",moods:["isolated","numb","depleted"],       archetypes:["dopamine","disconnector"],        vibes:["social","grounding","warm"], color:"#5080C0" },
  { id:"f4",  name:"Under the Rose Club",            address:"1024 Main St",             lat:49.2753, lng:-123.0996, category:"sauna",      description:"Private sauna club with infrared and traditional options. Bookable by the hour.",                                                price:"$$",  city:"Vancouver",          hours:"Mon–Sun 10am–10pm",   moods:["wired","overstimulated","anxious"], archetypes:["cortisol","optimizer"],           vibes:["solo","deep","warm"],         color:"#5080C0" },
  { id:"f5",  name:"Transcend Breathwork",           address:"2678 W Broadway",          lat:49.2638, lng:-123.1659, category:"breathwork", description:"Guided breathwork targeting nervous system reset and emotional release. Group and 1:1 available.",                               price:"$$",  city:"Vancouver",          hours:"By appointment",      moods:["anxious","numb","stuck"],           archetypes:["cortisol","emotionalcarrier"],    vibes:["deep","solo","grounding"],   color:"#9040A0" },
  { id:"f6",  name:"The Stretch Space",              address:"2188 York Ave",            lat:49.2716, lng:-123.1548, category:"studio",     description:"Stretch and mobility studio with small group classes. Slow and intentional — built for recovery.",                               price:"$",   city:"Vancouver",          hours:"Mon–Sun 8am–8pm",     moods:["wired","depleted","overstimulated"],archetypes:["cortisol","optimizer"],           vibes:["slow","solo","grounding"],   color:"#7A1A5A" },
  { id:"f7",  name:"The Prana Lounge",               address:"658 Homer St #410",        lat:49.2812, lng:-123.1140, category:"studio",     description:"Rooftop yoga studio in Yaletown with city views. Morning classes — rare stillness before the day starts.",                      price:"$$",  city:"Vancouver",          hours:"Mon–Sun 6:30am–8pm",  moods:["wired","anxious","flat"],           archetypes:["cortisol","dopamine"],            vibes:["slow","solo","warm"],        color:"#7A1A5A" },
  { id:"f8",  name:"Casa Copal Yoga",                address:"2291 W Broadway",          lat:49.2642, lng:-123.1570, category:"studio",     description:"Intimate yoga studio with cacao ceremonies and sound-enhanced classes. Strong community feel.",                                  price:"$",   city:"Vancouver",          hours:"Mon–Sun 7am–9pm",     moods:["isolated","anxious","depleted"],    archetypes:["emotionalcarrier","disconnector"],vibes:["social","slow","deep"],      color:"#7A1A5A" },
  { id:"f9",  name:"Fleur Choy – Vibrant Soul",      address:"3234 W 8th Ave",           lat:49.2649, lng:-123.1768, category:"breathwork", description:"Somatic breathwork and nervous system healing. One of Vancouver's most trusted breathwork facilitators.",                        price:"$$",  city:"Vancouver",          hours:"By appointment",      moods:["stuck","numb","anxious"],           archetypes:["disconnector","emotionalcarrier"],vibes:["deep","solo","grounding"],  color:"#9040A0" },
  { id:"f10", name:"Pacific Spirit Regional Park",   address:"5495 Chancellor Blvd",     lat:49.2533, lng:-123.2156, category:"nature",     description:"400 hectares of old-growth forest in the city. The most accessible free forest reset in Vancouver.",                            price:"Free",city:"Vancouver",          hours:"Daily dawn–dusk",     moods:["wired","overstimulated","depleted"],archetypes:["cortisol","optimizer","dopamine"],vibes:["outdoors","solo","grounding"],color:"#4A8800"},
  { id:"f11", name:"Gatherwell Ambleside",           address:"1150 Marine Dr",           lat:49.3248, lng:-123.1508, category:"sauna",      description:"Waterfront sauna and cold plunge with mountain views. Most scenic reset spot in Greater Vancouver.",                           price:"$$",  city:"North/West Vancouver", hours:"Tue–Sun 10am–10pm",  moods:["depleted","flat","numb"],           archetypes:["dopamine","disconnector"],        vibes:["warm","sensory","slow"],     color:"#5080C0" },
  { id:"f12", name:"Lower Seymour Conservation",     address:"2369 Lillooet Rd",         lat:49.3505, lng:-123.0163, category:"nature",     description:"Vast forest trails with river access and near-zero crowds. Full nervous system downregulation.",                                price:"Free",city:"North/West Vancouver", hours:"Daily dawn–dusk",    moods:["wired","anxious","overstimulated"], archetypes:["cortisol","optimizer"],           vibes:["outdoors","solo","grounding"],color:"#4A8800"},
  { id:"f13", name:"Parker Rooftop",                 address:"1379 Howe St 9th Fl",      lat:49.2762, lng:-123.1302, category:"lounge",     description:"Rooftop bar with panoramic city views. Best for slow connection — not a party venue. Sunset golden hour.",                    price:"$$",  city:"Vancouver",          hours:"Mon–Sun 4pm–late",    moods:["isolated","flat","depleted"],       archetypes:["dopamine","disconnector"],        vibes:["social","warm","slow"],      color:"#A06080" },
  { id:"f14", name:"Float House",                    address:"70 W Cordova St",          lat:49.2827, lng:-123.1064, category:"sauna",      description:"Sensory deprivation float tanks plus infrared sauna and cold plunge. Deep nervous system off-switch.",                         price:"$$$", city:"Vancouver",          hours:"Mon–Sun 9am–9pm",     moods:["wired","overstimulated","anxious"], archetypes:["cortisol","optimizer"],           vibes:["solo","deep","sensory"],     color:"#5080C0" },
  { id:"f15", name:"Tality Wellness",                address:"125 Victory Ship Way",     lat:49.3101, lng:-123.0790, category:"sauna",      description:"North Shore wellness hub with infrared sauna, cold plunge and recovery tools. Clean modern space.",                            price:"$$",  city:"North/West Vancouver", hours:"Mon–Sun 10am–8pm",   moods:["depleted","flat","stuck"],          archetypes:["dopamine","optimizer"],           vibes:["warm","grounding","slow"],   color:"#5080C0" },
  { id:"f16", name:"AetherHaus",                     address:"1768 Davie St",            lat:49.2869, lng:-123.1415, category:"sauna",      description:"Guided heat ritual experiences with scent and sound integration. Intentional sauna sessions.",                                 price:"$$",  city:"Vancouver",          hours:"By appointment",      moods:["numb","flat","depleted"],           archetypes:["disconnector","dopamine"],        vibes:["sensory","deep","slow"],     color:"#5080C0" },
  { id:"f17", name:"Kolm Kontrast",                  address:"525 W 8th Ave",            lat:49.2644, lng:-123.1156, category:"sauna",      description:"Nordic contrast therapy with sound healing integration. Cold and heat cycles guided by practitioners.",                         price:"$$",  city:"Vancouver",          hours:"Mon–Sun 10am–9pm",    moods:["wired","anxious","overstimulated"], archetypes:["cortisol","emotionalcarrier"],    vibes:["sensory","deep","grounding"],color:"#5080C0" },
  { id:"f18", name:"Regen Recovery",                 address:"1433 Cedar Cottage Mews",  lat:49.2494, lng:-123.0750, category:"longevity",  description:"Red light therapy, hyperbaric oxygen and DEXA body composition scanning. Evidence-based longevity tools.",                      price:"$$$", city:"Vancouver",          hours:"Mon–Fri 8am–6pm",     moods:["stuck","depleted"],                 archetypes:["optimizer"],                      vibes:["solo","deep","grounding"],   color:"#6EC800" },
  { id:"f19", name:"YYOGA Downtown Flow",             address:"888 Burrard St",           lat:49.2822, lng:-123.1240, category:"studio",     description:"Large well-programmed yoga studio in the heart of downtown. Wide class variety — accessible entry point.",                     price:"$",   city:"Vancouver",          hours:"Mon–Sun 6am–9pm",     moods:["wired","depleted","anxious"],       archetypes:["cortisol","dopamine"],            vibes:["slow","social","grounding"],color:"#7A1A5A" },
  { id:"f20", name:"Modo Yoga Olympic Village",      address:"121 W 2nd Ave",            lat:49.2695, lng:-123.1073, category:"studio",     description:"Hot yoga studio with strong community culture. Heated classes for detox and deep muscle release.",                              price:"$",   city:"Vancouver",          hours:"Mon–Sun 6am–9pm",     moods:["depleted","flat","stuck"],          archetypes:["dopamine","disconnector"],        vibes:["warm","social","slow"],      color:"#7A1A5A" },
  { id:"f21", name:"Jaybird Studio",                 address:"1232 Richards St",         lat:49.2755, lng:-123.1246, category:"studio",     description:"Boutique movement and yoga studio in Yaletown. Intimate class sizes and skilled instructors.",                                  price:"$",   city:"Vancouver",          hours:"Mon–Sun 7am–8pm",     moods:["wired","anxious","depleted"],       archetypes:["cortisol","optimizer"],           vibes:["slow","solo","grounding"],   color:"#7A1A5A" },
  { id:"f22", name:"Fairmont Spa Pacific Rim",       address:"1038 Canada Pl",           lat:49.2882, lng:-123.1164, category:"luxury",     description:"Five-star spa with full treatment menu. The highest-end reset in Vancouver — for when you need the full thing.",               price:"$$$", city:"Vancouver",          hours:"Daily 9am–9pm",       moods:["depleted","numb","flat"],           archetypes:["emotionalcarrier","disconnector"],vibes:["deep","warm","sensory"],    color:"#C04880" },
  { id:"f23", name:"Sense, A Rosewood Spa",          address:"801 W Georgia St",         lat:49.2836, lng:-123.1187, category:"luxury",     description:"Luxury spa inside Hotel Georgia. Refined treatment menu focused on restoration and deep relaxation.",                           price:"$$$", city:"Vancouver",          hours:"Daily 10am–8pm",      moods:["depleted","flat","isolated"],       archetypes:["emotionalcarrier","disconnector"],vibes:["deep","warm","solo"],       color:"#C04880" },
  { id:"f24", name:"WEWELL Studios",                 address:"662 Leg in Boot Square",   lat:49.2673, lng:-123.1191, category:"longevity",  description:"Functional wellness studio with longevity protocols, red light therapy and breathwork integration.",                            price:"$$",  city:"Vancouver",          hours:"Mon–Fri 7am–7pm",     moods:["stuck","flat","depleted"],          archetypes:["optimizer","disconnector"],       vibes:["solo","deep","grounding"],   color:"#6EC800" },
];

function parseRecord(r, i) {
  return {
    id:          r.id || String(i),
    name:        r.fields.name        || "",
    address:     r.fields.address     || "",
    lat:         parseFloat(r.fields.lat)  || 0,
    lng:         parseFloat(r.fields.lng)  || 0,
    category:    r.fields.category    || "studio",
    description: r.fields.description || "",
    price:       r.fields.price       || "$",
    city:        r.fields.city        || "Vancouver",
    hours:       r.fields.hours       || "",
    moods:       (r.fields.moods      || "").split(";").map(s => s.trim()).filter(Boolean),
    archetypes:  (r.fields.archetypes || "").split(";").map(s => s.trim()).filter(Boolean),
    vibes:       (r.fields.vibes      || "").split(";").map(s => s.trim()).filter(Boolean),
    color:       r.fields.color       || "#7A1A5A",
  };
}

async function fetchLocations() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}?maxRecords=200`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
  if (!res.ok) throw new Error(`Airtable ${res.status}`);
  const data = await res.json();
  // If Airtable returns records, use them — otherwise fall back to hardcoded data
  if (!data.records || data.records.length === 0) return FALLBACK_LOCATIONS;
  return data.records.map(parseRecord);
}

const PALETTE = {
  bg:          "#F8F2FF",   // warm lavender-cream — main background
  surface:     "#F0E8FF",   // slightly deeper lavender — filter bar, sidebar
  card:        "#FFFFFF",
  border:      "#E0CFF0",   // soft lavender border
  accent:      "#7A1A5A",   // deep berry — primary CTAs, active states
  accentLight: "#F0E0FF",   // light berry tint — active pill backgrounds
  accentDark:  "#541040",   // dark berry — hover states
  clay:        "#9B4080",   // mid berry — star ratings, mood tags
  clayLight:   "#F5E8FF",   // palest berry — mood tag backgrounds
  text:        "#1E0830",   // near-black with plum depth
  muted:       "#5A3070",   // muted plum — body text, descriptions
  subtle:      "#B090C8",   // medium lavender — placeholders, secondary labels
  lime:        "#6EC800",   // sharp lime — nature, free badges, highlights
  limeDark:    "#4A8800",   // dark lime — lime text on white
  limeLight:   "#EDFFC0",   // pale lime — lime tag backgrounds
  white:       "#FFFFFF",
};


const CATEGORIES = [
  { id: "all",        label: "All",                  color: "#7A1A5A" },
  { id: "sauna",      label: "Sauna & Cold",          color: "#5080C0" },
  { id: "studio",     label: "Studio & Yoga",         color: "#7A1A5A" },
  { id: "breathwork", label: "Breathwork & Healing",  color: "#9040A0" },
  { id: "nature",     label: "Nature",                color: "#4A8800" },
  { id: "luxury",     label: "Luxury Spa",            color: "#C04880" },
  { id: "longevity",  label: "Longevity",             color: "#6EC800" },
  { id: "lounge",     label: "Lounge & Views",        color: "#A06080" },
];

const MOODS = [
  { id: "wired", label: "Wired & can't stop", emoji: "⚡" },
  { id: "depleted", label: "Flat & depleted", emoji: "🪫" },
  { id: "anxious", label: "Anxious", emoji: "🌀" },
  { id: "numb", label: "Numb / disconnected", emoji: "🌫️" },
  { id: "overstimulated", label: "Overstimulated", emoji: "📵" },
  { id: "isolated", label: "Isolated & low", emoji: "🫧" },
  { id: "stuck", label: "Stuck", emoji: "🧱" },
  { id: "flat", label: "Joyless & flat", emoji: "🩶" },
];

const ARCHETYPES = [
  { id: "cortisol", label: "Cortisol Commander", emoji: "🔴" },
  { id: "dopamine", label: "Dopamine Depleted", emoji: "🟡" },
  { id: "emotionalcarrier", label: "Emotional Load Carrier", emoji: "🟣" },
  { id: "optimizer", label: "Optimization Addict", emoji: "🔵" },
  { id: "disconnector", label: "Functional Disconnector", emoji: "⚪" },
];

const VIBES = [
  { id: "solo", label: "Solo reset", emoji: "🌙" },
  { id: "social", label: "Social energy", emoji: "🤝" },
  { id: "slow", label: "Slow & still", emoji: "🍃" },
  { id: "sensory", label: "Sensory / body-based", emoji: "🫀" },
  { id: "outdoors", label: "Outdoors", emoji: "🌲" },
  { id: "deep", label: "Deep inner work", emoji: "🔮" },
  { id: "grounding", label: "Grounding", emoji: "🪨" },
  { id: "warm", label: "Warm & welcoming", emoji: "🕯️" },
];

const CITIES = ["All Cities", "Vancouver", "North/West Vancouver"];

function Tag({ label, bg, color }) {
  return (
    <span style={{
      background: bg || PALETTE.accentLight, color: color || PALETTE.accentDark,
      fontSize: 10, padding: "3px 9px", borderRadius: 20,
      fontFamily: "sans-serif", letterSpacing: "0.04em", whiteSpace: "nowrap", fontWeight: 500,
    }}>{label}</span>
  );
}

function FilterPill({ label, emoji, active, onClick, activeColor }) {
  return (
    <button onClick={onClick} style={{
      background: active ? (activeColor ? activeColor + "22" : PALETTE.accentLight) : PALETTE.white,
      border: `1.5px solid ${active ? (activeColor || PALETTE.accent) : PALETTE.border}`,
      borderRadius: 20, padding: "7px 14px",
      color: active ? (activeColor || PALETTE.accentDark) : PALETTE.muted,
      fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap: 6,
      whiteSpace: "nowrap", fontWeight: active ? 600 : 400,
    }}>
      {emoji && <span style={{ fontSize: 13 }}>{emoji}</span>}
      {label}
    </button>
  );
}

function LocationCard({ loc, selected, onClick }) {
  const cat = CATEGORIES.find(c => c.id === loc.category);
  return (
    <div onClick={onClick} style={{
      background: selected ? PALETTE.accentLight : PALETTE.white,
      border: `1.5px solid ${selected ? PALETTE.accent : PALETTE.border}`,
      borderLeft: `4px solid ${selected ? PALETTE.accent : loc.color}`,
      borderRadius: 10, padding: "15px 17px", cursor: "pointer", transition: "all 0.15s",
      boxShadow: selected ? `0 2px 12px rgba(122,26,90,0.10)` : "0 1px 3px rgba(0,0,0,0.04)",
    }}
    onMouseEnter={e => { if (!selected) { e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = PALETTE.subtle; }}}
    onMouseLeave={e => { if (!selected) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = PALETTE.border; }}}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 14, color: PALETTE.text, marginBottom: 2, lineHeight: 1.3 }}>{loc.name}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 10, color: PALETTE.subtle }}>{loc.type}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: PALETTE.clay, fontWeight: 600 }}>★ {loc.rating}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 10, color: PALETTE.subtle }}>{loc.price}</div>
        </div>
      </div>
      <p style={{ margin: "0 0 9px", fontFamily: "sans-serif", fontSize: 11, color: PALETTE.muted, lineHeight: 1.6 }}>
        {loc.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {loc.tags.slice(0, 3).map(t => <Tag key={t} label={t} />)}
        {cat && <Tag label={cat.label} bg={loc.color + "22"} color={loc.color} />}
      </div>
    </div>
  );
}

function MapDot({ loc, selected, onClick }) {
  const minLat = 49.20, maxLat = 49.38, minLng = -123.26, maxLng = -123.03;
  const x = ((loc.lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - loc.lat) / (maxLat - minLat)) * 100;
  return (
    <div onClick={onClick} title={loc.name} style={{
      position: "absolute", left: `${x}%`, top: `${y}%`,
      transform: "translate(-50%, -50%)", zIndex: selected ? 10 : 2, cursor: "pointer",
    }}>
      <div style={{
        width: selected ? 18 : 11, height: selected ? 18 : 11, borderRadius: "50%",
        background: selected ? PALETTE.accentDark : loc.color,
        border: `2px solid ${PALETTE.white}`,
        boxShadow: selected ? `0 0 0 4px rgba(122,26,90,0.18), 0 2px 8px rgba(0,0,0,0.12)` : "0 1px 4px rgba(0,0,0,0.15)",
        transition: "all 0.2s",
      }} />
      {selected && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 7px)", left: "50%",
          transform: "translateX(-50%)",
          background: PALETTE.white, border: `1px solid ${PALETTE.border}`,
          borderRadius: 6, padding: "4px 10px", whiteSpace: "nowrap",
          fontFamily: "sans-serif", fontSize: 11, color: PALETTE.text, fontWeight: 600,
          zIndex: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        }}>
          {loc.name}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: `5px solid ${PALETTE.border}`,
          }} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [locations, setLocations]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedMoods, setSelectedMoods]   = useState([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState([]);
  const [selectedVibes, setSelectedVibes]   = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity]     = useState("All Cities");
  const [selectedLoc, setSelectedLoc]       = useState(null);
  const [activeSection, setActiveSection]   = useState("category");

  useEffect(() => {
    fetchLocations()
      .then(data => { setLocations(data); setLoading(false); })
      .catch(() => { setLocations(FALLBACK_LOCATIONS); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F8F2FF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid #E0CFF0", borderTop:"3px solid #7A1A5A", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontFamily:"Georgia,serif", fontSize:15, color:"#7A1A5A" }}>Loading reset spots…</div>
      <div style={{ fontFamily:"sans-serif", fontSize:11, color:"#B090C8" }}>Fetching from Airtable</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#F8F2FF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:40 }}>
      <div style={{ fontSize:32 }}>⚠️</div>
      <div style={{ fontFamily:"Georgia,serif", fontSize:16, color:"#7A1A5A", textAlign:"center" }}>Couldn't load locations</div>
      <div style={{ fontFamily:"sans-serif", fontSize:12, color:"#B090C8", textAlign:"center", maxWidth:360 }}>{error}</div>
      <div style={{ fontFamily:"sans-serif", fontSize:11, color:"#B090C8", textAlign:"center", maxWidth:400 }}>
        Make sure your Airtable base has a table named <strong>Locations</strong> and your token has <strong>data.records:read</strong> scope.
      </div>
      <button onClick={() => window.location.reload()} style={{ marginTop:8, padding:"8px 20px", background:"#7A1A5A", color:"white", border:"none", borderRadius:6, fontFamily:"sans-serif", fontSize:13, cursor:"pointer" }}>
        Retry
      </button>
    </div>
  );

  const toggle = (arr, setArr, id) =>
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  const clearAll = () => {
    setSelectedMoods([]); setSelectedArchetypes([]); setSelectedVibes([]);
    setSelectedCategory("all"); setSelectedCity("All Cities");
  };

  const filtered = useMemo(() => locations.filter(loc => {
    if (selectedCity !== "All Cities" && loc.city !== selectedCity) return false;
    if (selectedCategory !== "all" && loc.category !== selectedCategory) return false;
    if (selectedMoods.length && !selectedMoods.some(m => loc.moods.includes(m))) return false;
    if (selectedArchetypes.length && !selectedArchetypes.some(a => loc.archetypes.includes(a))) return false;
    if (selectedVibes.length && !selectedVibes.some(v => loc.vibes.includes(v))) return false;
    return true;
  }), [locations, selectedMoods, selectedArchetypes, selectedVibes, selectedCategory, selectedCity]);

  const activeFilters = selectedMoods.length + selectedArchetypes.length + selectedVibes.length + (selectedCategory !== "all" ? 1 : 0);
  const selectedLocData = selectedLoc ? locations.find(l => l.id === selectedLoc) : null;

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.text, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        background: PALETTE.white, padding: "20px 28px 16px",
        borderBottom: `1px solid ${PALETTE.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: PALETTE.subtle, fontFamily: "sans-serif", marginBottom: 4, textTransform: "uppercase" }}>Unfx Collective</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "normal", color: PALETTE.text, letterSpacing: "-0.01em" }}>The Reset Map</h1>
          <p style={{ margin: "3px 0 0", fontStyle: "italic", color: PALETTE.muted, fontSize: 12 }}>
            Find what your nervous system actually needs — not what the algorithm shows you.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: PALETTE.subtle, fontWeight: 600 }}>
            {locations.length} places
          </div>
          {CITIES.map(c => (
            <button key={c} onClick={() => setSelectedCity(c)} style={{
              background: selectedCity === c ? PALETTE.accentLight : "transparent",
              border: `1.5px solid ${selectedCity === c ? PALETTE.accent : PALETTE.border}`,
              borderRadius: 20, padding: "5px 14px",
              color: selectedCity === c ? PALETTE.accentDark : PALETTE.muted,
              fontSize: 11, fontFamily: "sans-serif", cursor: "pointer",
              fontWeight: selectedCity === c ? 600 : 400, transition: "all 0.15s",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: PALETTE.white, borderBottom: `1px solid ${PALETTE.border}`, padding: "0 28px" }}>
        <div style={{ display: "flex" }}>
          {[
            { id: "category", label: "Category" },
            { id: "mood", label: "How I Feel" },
            { id: "archetype", label: "My Archetype" },
            { id: "vibe", label: "What I Need" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "12px 18px", fontSize: 11, fontFamily: "sans-serif",
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: activeSection === tab.id ? PALETTE.accentDark : PALETTE.subtle,
              borderBottom: `2px solid ${activeSection === tab.id ? PALETTE.accent : "transparent"}`,
              fontWeight: activeSection === tab.id ? 600 : 400, transition: "all 0.15s",
            }}>{tab.label}</button>
          ))}
          {activeFilters > 0 && (
            <button onClick={clearAll} style={{
              marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontFamily: "sans-serif", color: PALETTE.clay, padding: "12px 0", fontWeight: 500,
            }}>Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""} ×</button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ background: PALETTE.surface, padding: "10px 28px 12px", borderBottom: `1px solid ${PALETTE.border}`, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {activeSection === "category" && CATEGORIES.map(c => (
            <FilterPill key={c.id} label={c.label}
              active={selectedCategory === c.id}
              activeColor={c.color}
              onClick={() => setSelectedCategory(c.id)} />
          ))}
          {activeSection === "mood" && MOODS.map(m => (
            <FilterPill key={m.id} label={m.label} emoji={m.emoji}
              active={selectedMoods.includes(m.id)}
              onClick={() => toggle(selectedMoods, setSelectedMoods, m.id)} />
          ))}
          {activeSection === "archetype" && ARCHETYPES.map(a => (
            <FilterPill key={a.id} label={a.label} emoji={a.emoji}
              active={selectedArchetypes.includes(a.id)}
              onClick={() => toggle(selectedArchetypes, setSelectedArchetypes, a.id)} />
          ))}
          {activeSection === "vibe" && VIBES.map(v => (
            <FilterPill key={v.id} label={v.label} emoji={v.emoji}
              active={selectedVibes.includes(v.id)}
              onClick={() => toggle(selectedVibes, setSelectedVibes, v.id)} />
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 480 }}>

        {/* List */}
        <div style={{
          width: "38%", minWidth: 270, borderRight: `1px solid ${PALETTE.border}`,
          overflowY: "auto", padding: "16px 14px", background: PALETTE.bg,
          display: "flex", flexDirection: "column", gap: 9,
        }}>
          <div style={{ fontFamily: "sans-serif", fontSize: 10, color: PALETTE.subtle, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
            {filtered.length} place{filtered.length !== 1 ? "s" : ""} {activeFilters > 0 ? "matched" : "in your area"}
          </div>
          {filtered.length === 0 && (
            <div style={{
              padding: "28px 18px", textAlign: "center", color: PALETTE.subtle,
              fontFamily: "sans-serif", fontSize: 12,
              border: `1.5px dashed ${PALETTE.border}`, borderRadius: 10, background: PALETTE.white,
            }}>
              No places match your filters.<br />
              <span style={{ fontSize: 11, marginTop: 5, display: "block" }}>Try removing a filter or changing city.</span>
            </div>
          )}
          {filtered.map(loc => (
            <LocationCard key={loc.id} loc={loc}
              selected={selectedLoc === loc.id}
              onClick={() => setSelectedLoc(selectedLoc === loc.id ? null : loc.id)} />
          ))}
        </div>

        {/* Map + detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{
            flex: 1, minHeight: 280, position: "relative", overflow: "hidden",
            background: "linear-gradient(155deg, #F5EEFF 0%, #EDE0FF 45%, #F0EAFF 100%)",
          }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }}>
              <defs>
                <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30 Q15 22 30 30 Q45 38 60 30" fill="none" stroke="#B090C8" strokeWidth="1"/>
                  <path d="M0 50 Q15 42 30 50 Q45 58 60 50" fill="none" stroke="#B090C8" strokeWidth="1"/>
                  <path d="M0 10 Q15 2 30 10 Q45 18 60 10" fill="none" stroke="#B090C8" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo)" />
            </svg>
            <div style={{
              position: "absolute", bottom: -40, left: -20, width: "38%", height: "60%",
              background: "radial-gradient(ellipse at bottom left, rgba(110,200,0,0.10) 0%, transparent 65%)",
            }} />
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>
              <div style={{
                background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)",
                border: `1px solid ${PALETTE.border}`, borderRadius: 6,
                padding: "5px 10px", fontFamily: "sans-serif", fontSize: 9,
                letterSpacing: "0.15em", color: PALETTE.muted, textTransform: "uppercase",
              }}>Metro Vancouver · {filtered.length} shown</div>
            </div>
            <div style={{ position: "absolute", inset: 0 }}>
              {filtered.map(loc => (
                <MapDot key={loc.id} loc={loc}
                  selected={selectedLoc === loc.id}
                  onClick={() => setSelectedLoc(selectedLoc === loc.id ? null : loc.id)} />
              ))}
            </div>
            {/* Legend */}
            <div style={{
              position: "absolute", bottom: 12, right: 12, zIndex: 5,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
              border: `1px solid ${PALETTE.border}`, borderRadius: 8,
              padding: "9px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.15em", color: PALETTE.subtle, marginBottom: 6, textTransform: "uppercase" }}>Category</div>
              {CATEGORIES.filter(c => c.id !== "all").map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, border: "1.5px solid #fff", flexShrink: 0 }} />
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, color: PALETTE.muted }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selectedLocData ? (
            <div style={{
              background: PALETTE.white, borderTop: `2px solid ${selectedLocData.color}`,
              padding: "16px 24px", maxHeight: 220, overflowY: "auto",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: "normal", color: PALETTE.text }}>{selectedLocData.name}</h3>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: PALETTE.subtle, marginTop: 2 }}>
                    📍 {selectedLocData.address} · {selectedLocData.hours}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: PALETTE.clay, fontWeight: 600 }}>★ {selectedLocData.rating}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: PALETTE.subtle }}>{selectedLocData.price}</div>
                  <button onClick={() => setSelectedLoc(null)} style={{
                    background: PALETTE.surface, border: `1px solid ${PALETTE.border}`,
                    borderRadius: "50%", width: 24, height: 24, cursor: "pointer",
                    color: PALETTE.muted, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                </div>
              </div>
              <p style={{ margin: "0 0 10px", fontFamily: "sans-serif", fontSize: 12, color: PALETTE.muted, lineHeight: 1.7 }}>
                {selectedLocData.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                {selectedLocData.moods.map(m => {
                  const mood = MOODS.find(x => x.id === m);
                  return mood ? <Tag key={m} label={`${mood.emoji} ${mood.label}`} bg={PALETTE.clayLight} color={PALETTE.clay} /> : null;
                })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {selectedLocData.tags.map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
          ) : (
            <div style={{
              background: PALETTE.white, borderTop: `1px solid ${PALETTE.border}`,
              padding: "16px 24px", fontFamily: "sans-serif", fontSize: 12,
              color: PALETTE.subtle, fontStyle: "italic",
            }}>
              Select a location to see details — or filter by how you're feeling right now.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: PALETTE.white, borderTop: `1px solid ${PALETTE.border}`,
        padding: "12px 28px", display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontFamily: "sans-serif", fontSize: 9, color: PALETTE.subtle, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Unfx Collective · The Reset Map · Vancouver 2026
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 10, color: PALETTE.subtle, fontStyle: "italic" }}>
          Curated by Maya Ruppajjai. These are real places she actually recommends.
        </div>
      </div>
    </div>
  );
}
