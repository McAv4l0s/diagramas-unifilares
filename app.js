import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;
const STORAGE_KEY = "unifilar-react-v1";

const BLANK_LOAD = {
  phase: "",
  loadType: "",
  installedVa: "",
  demandedVa: "",
  currentA: "",
  powerFactor: "",
  notes: ""
};

const DEFAULT_DATA = {
  project: {
    title: "DIAGRAMA UNIFILAR",
    projectName: "Levantamiento en campo",
    location: "",
    date: new Date().toISOString().slice(0, 10),
    preparedBy: "",
    reviewedBy: "",
    drawingNumber: "DU-001",
    revision: "0",
    notes: "Informacion sujeta a verificacion en campo.",
    standards: "NOM-001-SEDE aplicable; NOM-029-STPS para mantenimiento electrico; NOM-002-STPS para prevencion/proteccion contra incendios cuando aplique."
  },
  service: {
    label: "Acometida CFE",
    utility: "CFE",
    serviceType: "Por definir",
    meter: "Por definir",
    mainBreaker: "2x70",
    mainBreakerPoles: "2",
    mainBreakerAmps: "70",
    mainBreakerAicCurve: "Por definir",
    feeder: "2 cal.8, 1 cal. 8 N, 1 cal. 12 T",
    feederLength: "",
    conductorTypeInsulation: "",
    conduitTypeDiameter: "",
    panelBusServiceData: ""
  },
  system: {
    voltage: "",
    phases: "",
    wires: "",
    frequency: "60 Hz",
    groundingSystem: "",
    availableShortCircuit: "",
    demandFactor: "",
    powerFactor: "",
    maxDemand: ""
  },
  panel: {
    id: "TG",
    name: "Tablero General",
    location: "",
    voltage: "",
    phases: "",
    busAmps: "",
    busMaterial: "",
    bars: "",
    enclosure: "",
    mounting: "",
    nema: "",
    interruptingRating: "",
    mainDevice: "",
    neutralBar: "Por definir",
    groundBar: "Por definir"
  },
  grounding: {
    electrode: "",
    groundingConductor: "",
    bonding: "",
    resistance: "",
    notes: ""
  },
  stps: {
    workRisk: "Por definir",
    loto: "Por definir",
    ppe: "Por definir",
    arcFlashLabel: "Por definir",
    fireRiskArea: "Por definir",
    emergencyNotes: ""
  },
  circuits: [
    circuit("Contacto Administracion", "1x30", "2 cal.10, 1 cal. 10 N, 1 cal. 12 T"),
    circuit("Contacto Almacen", "1x30", "2 cal.10, 1 cal. 10 N, 1 cal. 12 T"),
    circuit("Contactos exteriores", "1x30", "2 cal.10, 1 cal. 10 N, 1 cal. 12 T"),
    circuit("Iluminacion", "1x15", "2 cal.12, 1 cal. 12 N, 1 cal. 14 T"),
    circuit("Servidor", "1x10", "2 cal.12, 1 cal. 12 N, 1 cal. 14 T"),
    circuit("Disponible", "1x10", "2 cal.12, 1 cal. 12 N, 1 cal. 14 T"),
    circuit("Aire/A.", "2x50", "2 cal.8, 1 cal. 8 N, 1 cal. 12 T")
  ]
};

function circuit(name = "Nuevo circuito", breaker = "", conductor = "") {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random()}`,
    name,
    displayName: name,
    origin: "TG",
    destination: name,
    breaker,
    poles: "",
    amps: "",
    breakerType: "",
    breakerAicCurve: "",
    conductor,
    phaseConductor: "",
    neutralConductor: "",
    groundConductor: "",
    material: "",
    insulation: "",
    conductorTypeInsulation: "",
    conduitTypeDiameter: "",
    conduitMaterial: "",
    conduitFill: "",
    length: "",
    load: "",
    voltageDrop: "Por verificar",
    status: "Dato capturado o por verificar en campo",
    loadSchedule: { ...BLANK_LOAD }
  };
}

const nav = [
  ["project", "Proyecto"],
  ["service", "Acometida"],
  ["system", "Sistema"],
  ["panel", "Tablero"],
  ["grounding", "Puesta a tierra"],
  ["stps", "STPS / Seguridad"],
  ["circuits", "Circuitos"],
  ["loads", "Cuadro de cargas"],
  ["script", "UnifilarScript"]
];

const forms = {
  project: [
    ["projectName", "Nombre del proyecto"], ["location", "Ubicacion"], ["date", "Fecha", "date"],
    ["preparedBy", "Elaboro"], ["reviewedBy", "Reviso"], ["drawingNumber", "No. plano"],
    ["revision", "Revision"], ["standards", "Normas/base de revision", "textarea"], ["notes", "Notas generales", "textarea"]
  ],
  service: [
    ["label", "Etiqueta de acometida"], ["utility", "Compania suministradora"], ["serviceType", "Tipo de servicio/acometida"],
    ["meter", "Medicion"], ["mainBreaker", "Interruptor principal"], ["mainBreakerPoles", "Polos"],
    ["mainBreakerAmps", "Amperes"], ["mainBreakerAicCurve", "Capacidad interruptiva y curva/tipo"],
    ["feeder", "Alimentador"], ["feederLength", "Longitud del alimentador"],
    ["conductorTypeInsulation", "Tipo de conductor y aislamiento"], ["conduitTypeDiameter", "Tipo y diametro de canalizacion"],
    ["panelBusServiceData", "Datos de acometida/tablero", "textarea"]
  ],
  system: [
    ["voltage", "Tension del sistema"], ["phases", "Numero de fases"], ["wires", "Hilos"],
    ["frequency", "Frecuencia"], ["groundingSystem", "Sistema de puesta a tierra"],
    ["availableShortCircuit", "Nivel de cortocircuito disponible"], ["demandFactor", "Factor de demanda"],
    ["powerFactor", "Factor de potencia"], ["maxDemand", "Demanda maxima"]
  ],
  panel: [
    ["id", "Identificacion"], ["name", "Nombre del tablero"], ["location", "Ubicacion"],
    ["voltage", "Tension nominal"], ["phases", "Fases/hilos"], ["busAmps", "Capacidad de barras"],
    ["busMaterial", "Material de barras"], ["bars", "No. de barras"], ["enclosure", "Gabinete"],
    ["mounting", "Montaje"], ["nema", "NEMA/IP"], ["interruptingRating", "Capacidad interruptiva"],
    ["mainDevice", "Dispositivo principal"], ["neutralBar", "Barra de neutro"], ["groundBar", "Barra de tierra"]
  ],
  grounding: [
    ["electrode", "Electrodo/sistema de tierra"], ["groundingConductor", "Conductor de puesta a tierra"],
    ["bonding", "Union/equipotencialidad"], ["resistance", "Resistencia medida"], ["notes", "Notas", "textarea"]
  ],
  stps: [
    ["workRisk", "Riesgo del trabajo/area"], ["loto", "Bloqueo y etiquetado"], ["ppe", "EPP requerido"],
    ["arcFlashLabel", "Rotulado/arc flash"], ["fireRiskArea", "Riesgo de incendio/area"],
    ["emergencyNotes", "Notas de emergencia y seguridad", "textarea"]
  ]
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function safe(value) { return String(value ?? ""); }
function valueOrPending(value) { return safe(value).trim() || "Por definir"; }
function numeric(value) { const n = Number(safe(value).replace(/,/g, "")); return Number.isFinite(n) && safe(value).trim() ? n : null; }
function total(circuits, field) { let sum = 0, ok = false; circuits.forEach(c => { const n = numeric(c.loadSchedule[field]); if (n !== null) { sum += n; ok = true; }}); return ok ? sum.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : "Por definir"; }
function q(value) { return `"${safe(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " / ")}"`; }
function attrs(obj) { return Object.entries(obj).filter(([,v]) => safe(v).trim()).map(([k,v]) => `${k}=${q(v)}`).join(" "); }

function generateScript(data) {
  const lines = [
    "# UnifilarScript v2 - generado desde formulario React",
    `titulo ${q(data.project.title)}`,
    `proyecto ${attrs({ nombre: data.project.projectName, ubicacion: data.project.location, fecha: data.project.date, elaboro: data.project.preparedBy, revision: data.project.revision })}`,
    `acometida ${q(data.service.label)} ${attrs({ compania: data.service.utility, tipo: data.service.serviceType, medicion: data.service.meter })}`,
    `principal ${q(data.service.mainBreaker)} ${attrs({ polos: data.service.mainBreakerPoles, amperes: data.service.mainBreakerAmps, aic_curva: data.service.mainBreakerAicCurve })}`,
    `alimentador ${q(data.service.feeder)} ${attrs({ longitud: data.service.feederLength, conductor_aislamiento: data.service.conductorTypeInsulation, canalizacion: data.service.conduitTypeDiameter })}`,
    `sistema ${attrs({ tension: data.system.voltage, fases: data.system.phases, hilos: data.system.wires, frecuencia: data.system.frequency, tierra: data.system.groundingSystem, cortocircuito: data.system.availableShortCircuit, demanda: data.system.maxDemand })}`,
    `tablero ${q(data.panel.name)} ${attrs({ id: data.panel.id, ubicacion: data.panel.location, barras: data.panel.busAmps, material: data.panel.busMaterial, gabinete: data.panel.enclosure, nema: data.panel.nema, montaje: data.panel.mounting, interruptiva: data.panel.interruptingRating })}`,
    `puesta_tierra ${attrs(data.grounding)}`,
    `stps ${attrs(data.stps)}`,
    ""
  ];
  data.circuits.forEach((c, index) => {
    lines.push(`circuito ${q(c.displayName || c.name)} ${attrs({
      no: index + 1, origen: c.origin, destino: c.destination, interruptor: c.breaker, polos: c.poles,
      amperes: c.amps, tipo_interruptor: c.breakerType, aic_curva: c.breakerAicCurve,
      conductor: c.conductor, fase_conductor: c.phaseConductor, neutro: c.neutralConductor,
      tierra: c.groundConductor, material: c.material, aislamiento: c.insulation,
      canalizacion: c.conduitTypeDiameter, conduit_material: c.conduitMaterial, longitud: c.length,
      carga: c.load, caida_tension: c.voltageDrop, fase: c.loadSchedule.phase,
      tipo_carga: c.loadSchedule.loadType, va_instalado: c.loadSchedule.installedVa,
      va_demandado: c.loadSchedule.demandedVa, corriente: c.loadSchedule.currentA,
      fp: c.loadSchedule.powerFactor, observaciones: c.loadSchedule.notes
    })}`);
  });
  return `${lines.join("\n")}\n`;
}

function unquote(value) {
  const text = safe(value).trim();
  return text.startsWith('"') && text.endsWith('"') ? text.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\") : text;
}
function parseAttrs(text) {
  const out = {};
  const rx = /([A-Za-z_][A-Za-z0-9_]*)=("(?:\\.|[^"])*"|[^\s]+)/g;
  let m;
  while ((m = rx.exec(text))) out[m[1].toLowerCase()] = unquote(m[2]);
  return out;
}
function firstQuoted(text) { const m = text.match(/"((?:\\.|[^"])*)"/); return m ? unquote(`"${m[1]}"`) : ""; }
function pick(a, ...keys) { for (const k of keys) if (a[k] !== undefined) return a[k]; return ""; }
function parseScript(source) {
  const next = clone(DEFAULT_DATA); next.circuits = [];
  const errors = [];
  safe(source).split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim(); if (!line || line.startsWith("#") || line.startsWith("//")) return;
    const [, cmdRaw, rest = ""] = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\b(.*)$/) || [];
    if (!cmdRaw) { errors.push(`Linea ${i + 1}: instruccion no reconocida.`); return; }
    const cmd = cmdRaw.toLowerCase(), at = parseAttrs(rest), quoted = firstQuoted(rest);
    if (cmd === "titulo") next.project.title = quoted || next.project.title;
    else if (cmd === "proyecto") Object.assign(next.project, { projectName: pick(at,"nombre"), location: pick(at,"ubicacion"), date: pick(at,"fecha"), preparedBy: pick(at,"elaboro"), revision: pick(at,"revision") });
    else if (cmd === "acometida") Object.assign(next.service, { label: quoted || next.service.label, utility: pick(at,"compania"), serviceType: pick(at,"tipo"), meter: pick(at,"medicion") });
    else if (cmd === "principal") Object.assign(next.service, { mainBreaker: quoted || next.service.mainBreaker, mainBreakerPoles: pick(at,"polos"), mainBreakerAmps: pick(at,"amperes"), mainBreakerAicCurve: pick(at,"aic_curva") });
    else if (cmd === "alimentador") Object.assign(next.service, { feeder: quoted || next.service.feeder, feederLength: pick(at,"longitud"), conductorTypeInsulation: pick(at,"conductor_aislamiento"), conduitTypeDiameter: pick(at,"canalizacion") });
    else if (cmd === "sistema") Object.assign(next.system, { voltage: pick(at,"tension"), phases: pick(at,"fases"), wires: pick(at,"hilos"), frequency: pick(at,"frecuencia"), groundingSystem: pick(at,"tierra"), availableShortCircuit: pick(at,"cortocircuito"), maxDemand: pick(at,"demanda") });
    else if (cmd === "tablero") Object.assign(next.panel, { name: quoted || next.panel.name, id: pick(at,"id"), location: pick(at,"ubicacion"), busAmps: pick(at,"barras"), busMaterial: pick(at,"material"), enclosure: pick(at,"gabinete"), nema: pick(at,"nema"), mounting: pick(at,"montaje"), interruptingRating: pick(at,"interruptiva") });
    else if (cmd === "puesta_tierra") Object.assign(next.grounding, at);
    else if (cmd === "stps") Object.assign(next.stps, at);
    else if (cmd === "circuito") next.circuits.push({ ...circuit(quoted || `Circuito ${next.circuits.length + 1}`, pick(at,"interruptor"), pick(at,"conductor")), origin: pick(at,"origen"), destination: pick(at,"destino") || quoted, poles: pick(at,"polos"), amps: pick(at,"amperes"), breakerType: pick(at,"tipo_interruptor"), breakerAicCurve: pick(at,"aic_curva"), phaseConductor: pick(at,"fase_conductor"), neutralConductor: pick(at,"neutro"), groundConductor: pick(at,"tierra"), material: pick(at,"material"), insulation: pick(at,"aislamiento"), conduitTypeDiameter: pick(at,"canalizacion"), conduitMaterial: pick(at,"conduit_material"), length: pick(at,"longitud"), load: pick(at,"carga"), voltageDrop: pick(at,"caida_tension"), loadSchedule: { phase: pick(at,"fase"), loadType: pick(at,"tipo_carga"), installedVa: pick(at,"va_instalado"), demandedVa: pick(at,"va_demandado"), currentA: pick(at,"corriente"), powerFactor: pick(at,"fp"), notes: pick(at,"observaciones") } });
    else errors.push(`Linea ${i + 1}: comando '${cmd}' no soportado.`);
  });
  if (errors.length) throw new Error(errors.join("\n"));
  if (!next.circuits.length) throw new Error("Agregue al menos una linea circuito.");
  return next;
}

function Field({ value, onChange, label, type = "text" }) {
  const props = { value: value ?? "", onChange: e => onChange(e.target.value), placeholder: "Por definir" };
  return h("label", { className: type === "textarea" ? "field wide" : "field" },
    h("span", null, label),
    type === "textarea" ? h("textarea", { ...props, rows: 3 }) : h("input", { ...props, type })
  );
}

function SectionForm({ title, group, fields, data, setData }) {
  return h("section", { className: "form-section" },
    h("h2", null, title),
    h("div", { className: "field-grid" }, fields.map(([key, label, type]) =>
      h(Field, { key, label, type, value: data[group][key], onChange: value => setData(d => ({ ...d, [group]: { ...d[group], [key]: value } })) })
    ))
  );
}

function CircuitsEditor({ data, setData }) {
  const update = (id, key, value) => setData(d => ({ ...d, circuits: d.circuits.map(c => c.id === id ? { ...c, [key]: value } : c) }));
  const updateLoad = (id, key, value) => setData(d => ({ ...d, circuits: d.circuits.map(c => c.id === id ? { ...c, loadSchedule: { ...c.loadSchedule, [key]: value } } : c) }));
  return h("section", { className: "form-section" },
    h("div", { className: "section-title-row" }, h("h2", null, "Circuitos derivados"), h("button", { onClick: () => setData(d => ({ ...d, circuits: [...d.circuits, circuit()] })) }, "+ Agregar circuito")),
    h("div", { className: "circuit-list" }, data.circuits.map((c, index) => h("article", { className: "circuit-card", key: c.id },
      h("div", { className: "circuit-head" }, h("strong", null, `${index + 1}. ${c.displayName || c.name}`), h("button", { onClick: () => setData(d => ({ ...d, circuits: d.circuits.filter(x => x.id !== c.id) })) }, "Eliminar")),
      h("div", { className: "field-grid compact" }, [
        ["displayName", "Nombre visible"], ["origin", "Origen"], ["destination", "Destino"], ["breaker", "Interruptor"],
        ["poles", "Polos"], ["amps", "Amperes"], ["breakerType", "Tipo interruptor"], ["breakerAicCurve", "AIC/curva"],
        ["conductor", "Conductores"], ["phaseConductor", "Fase(s)"], ["neutralConductor", "Neutro"], ["groundConductor", "Tierra"],
        ["material", "Material"], ["insulation", "Aislamiento"], ["conduitTypeDiameter", "Canalizacion"], ["conduitMaterial", "Material canalizacion"],
        ["length", "Longitud"], ["load", "Carga/descripcion"], ["voltageDrop", "Caida tension"], ["status", "Estatus"]
      ].map(([key, label]) => h(Field, { key, label, value: c[key], onChange: value => update(c.id, key, value) }))),
      h("h3", null, "Cuadro de cargas del circuito"),
      h("div", { className: "field-grid compact" }, [
        ["phase", "Fase"], ["loadType", "Tipo carga"], ["installedVa", "VA instalado"], ["demandedVa", "VA demandado"], ["currentA", "Corriente A"], ["powerFactor", "FP"], ["notes", "Observaciones"]
      ].map(([key, label]) => h(Field, { key, label, value: c.loadSchedule[key], onChange: value => updateLoad(c.id, key, value), type: ["installedVa","demandedVa","currentA"].includes(key) ? "number" : "text" })))
    )))
  );
}

function LoadSummary({ circuits }) {
  return h("section", { className: "panel" }, h("h2", null, "Cuadro de cargas"), h("div", { className: "table-wrap" }, h("table", null,
    h("thead", null, h("tr", null, ["Circuito","Fase","Tipo","VA instalado","VA demandado","Corriente A","FP","Observaciones"].map(x => h("th", { key:x }, x)))),
    h("tbody", null, circuits.map((c, i) => h("tr", { key: c.id }, [c.displayName || c.name, c.loadSchedule.phase, c.loadSchedule.loadType, c.loadSchedule.installedVa, c.loadSchedule.demandedVa, c.loadSchedule.currentA, c.loadSchedule.powerFactor, c.loadSchedule.notes].map((v, idx) => h("td", { key: idx }, idx === 0 ? `${i+1}. ${v}` : valueOrPending(v)))))),
    h("tfoot", null, h("tr", null, h("th", { colSpan: 3 }, "Totales capturados"), h("td", null, total(circuits,"installedVa")), h("td", null, total(circuits,"demandedVa")), h("td", null, total(circuits,"currentA")), h("td", { colSpan: 2 }, "Suma simple de datos capturados")))
  )));
}

function Diagram({ data }) {
  const count = Math.max(data.circuits.length, 1), width = Math.max(1100, 260 + count * 150), center = width / 2, start = 120, end = width - 120, gap = data.circuits.length > 1 ? (end - start) / (data.circuits.length - 1) : 0;
  const textLines = (txt, x, y, cls="svg-small", anchor="middle") => safe(txt).split(" / ").join("\n").split("\n").map((line, i) => h("text", { key: `${line}-${i}`, x, y: y + i * 17, textAnchor: anchor, className: cls }, line));
  return h("svg", { className: "singleline", viewBox: `0 0 ${width} 720`, role: "img" },
    h("rect", { width, height: 720, fill: "white" }),
    h("text", { x: center, y: 55, textAnchor: "middle", className: "svg-title" }, data.project.title),
    h("rect", { x: center - 85, y: 85, width: 170, height: 44, className: "svg-box" }), textLines(data.service.label, center, 111),
    h("line", { x1: center, y1: 129, x2: center, y2: 184, className: "svg-line" }),
    h("path", { d: `M ${center-24} 218 C ${center-38} 202 ${center-37} 181 ${center-22} 168`, className: "svg-line" }),
    h("text", { x: center + 20, y: 205, className: "svg-bold" }, data.service.mainBreaker || "P/D"),
    h("line", { x1: center, y1: 228, x2: center, y2: 320, className: "svg-line" }),
    textLines(data.service.feeder || "Alimentador por definir", center + 34, 250, "svg-tiny svg-bold", "start"),
    h("rect", { x: center - 90, y: 330, width: 180, height: 45, className: "svg-box dashed" }), textLines(`${data.panel.name}\n${data.panel.id || ""}`, center, 350),
    h("line", { x1: start, y1: 395, x2: end, y2: 395, className: "svg-line" }),
    data.circuits.map((c, i) => { const x = data.circuits.length > 1 ? start + gap * i : center; return h("g", { key: c.id },
      h("line", { x1: x, y1: 395, x2: x, y2: 442, className: "svg-line" }),
      h("path", { d: `M ${x-24} 484 C ${x-38} 468 ${x-37} 447 ${x-22} 434`, className: "svg-line" }),
      h("text", { x: x + 18, y: 471, className: "svg-bold" }, c.breaker || "P/D"),
      textLines(c.conductor || "Conductor por definir", x + 20, 420, "svg-tiny", "start"),
      h("line", { x1: x, y1: 492, x2: x, y2: 590, className: "svg-line" }),
      h("rect", { x: x - 64, y: 590, width: 128, height: 52, className: "svg-box" }),
      h("text", { x, y: 610, textAnchor: "middle", className: "svg-small" }, i + 1),
      ...textLines(c.displayName || c.name, x, 628, "svg-tiny")
    ); })
  );
}

function ScriptPanel({ script, setScript, apply, sync, download }) {
  return h("section", { className: "panel script-panel" },
    h("div", { className: "section-title-row" }, h("h2", null, "UnifilarScript"), h("div", { className: "button-row" }, h("button", { onClick: sync }, "Sincronizar"), h("button", { onClick: apply }, "Aplicar codigo"), h("button", { onClick: download }, "Descargar .unifilar"))),
    h("textarea", { className: "script-editor", value: script, onChange: e => setScript(e.target.value), spellCheck: false })
  );
}

function downloadText(name, text, type="text/plain") { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

function App() {
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(DEFAULT_DATA); } catch { return clone(DEFAULT_DATA); } });
  const [active, setActive] = useState("project");
  const [script, setScript] = useState(() => generateScript(data));
  const [status, setStatus] = useState("Listo");
  const generatedScript = useMemo(() => generateScript(data), [data]);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => setScript(generatedScript), [generatedScript]);
  const applyScript = () => { try { const parsed = parseScript(script); setData(parsed); setStatus(`Plano reconstruido: ${parsed.circuits.length} circuito(s).`); } catch (e) { setStatus(e.message); } };
  const syncScript = () => { setScript(generatedScript); setStatus("Codigo sincronizado desde formulario."); };
  const mainPanel = active === "circuits" ? h(CircuitsEditor, { data, setData }) : active === "loads" ? h(LoadSummary, { circuits: data.circuits }) : active === "script" ? h(ScriptPanel, { script, setScript, apply: applyScript, sync: syncScript, download: () => downloadText("diagrama.unifilar", script) }) : h(SectionForm, { title: nav.find(n => n[0] === active)?.[1], group: active, fields: forms[active], data, setData });
  return h("div", { className: "app-shell" },
    h("header", { className: "topbar" }, h("div", { className: "brand" }, h("span", { className: "brand-icon" }, "DU"), h("div", null, h("strong", null, "Generador de Diagrama Unifilar Dinamico"), h("span", null, "React + UnifilarScript"))), h("div", { className: "top-actions" }, h("button", { onClick: () => window.print() }, "PDF"), h("button", { onClick: () => downloadText("diagrama.unifilar", generatedScript) }, "Exportar script"), h("button", { onClick: () => { localStorage.removeItem(STORAGE_KEY); setData(clone(DEFAULT_DATA)); } }, "Restaurar"))),
    h("div", { className: "main-grid" },
      h("aside", { className: "sidebar" }, nav.map(([id, label]) => h("button", { key: id, className: active === id ? "active" : "", onClick: () => setActive(id) }, label)), h("div", { className: "norm-note" }, "Campos de captura para NOM-001-SEDE y seguridad STPS. Validar por responsable electrico.")),
      h("main", { className: "workarea" }, h("div", { className: "form-column" }, mainPanel), h("section", { className: "preview-column" }, h("div", { className: "preview-head" }, h("h2", null, "Vista del diagrama unifilar"), h("span", null, status)), h("div", { className: "diagram-scroll" }, h(Diagram, { data })), h(LoadSummary, { circuits: data.circuits }), h(ScriptPanel, { script, setScript, apply: applyScript, sync: syncScript, download: () => downloadText("diagrama.unifilar", script) })))
    ),
    h("footer", null, "La app no sustituye memoria de calculo, dictamen, UVIE o responsiva profesional. Los valores deben confirmarse en campo.")
  );
}

createRoot(document.getElementById("root")).render(h(App));
