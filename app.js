import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;
const STORAGE_KEY = "unifilar-react-v2-example";

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
    title: "DIAGRAMA UNIFILAR - EJEMPLO COMPLETO",
    projectName: "Oficina y almacen - ejemplo didactico",
    location: "Av. Ejemplo 123, Ciudad de Mexico",
    date: new Date().toISOString().slice(0, 10),
    preparedBy: "Area tecnica",
    reviewedBy: "Responsable electrico por designar",
    drawingNumber: "DU-EJ-001",
    revision: "A",
    notes: "Ejemplo didactico para captura. Todos los datos deben verificarse en campo antes de usarse como documento tecnico.",
    standards: "Base de captura: NOM-001-SEDE aplicable a instalaciones electricas; NOM-029-STPS para mantenimiento electrico; NOM-002-STPS para prevencion y proteccion contra incendios cuando aplique. No sustituye memoria de calculo, dictamen, UVIE ni responsiva profesional."
  },
  service: {
    label: "Acometida CFE",
    utility: "CFE",
    serviceType: "Baja tension, 1F+N+T, servicio comercial",
    meter: "Medidor autocontenido por confirmar",
    mainBreaker: "2x70 A",
    mainBreakerPoles: "2",
    mainBreakerAmps: "70",
    mainBreakerAicCurve: "10 kAIC, termomagnetico, curva/tipo por confirmar",
    feeder: "2 cal.8 Cu THW-LS, 1 cal.8 N, 1 cal.12 T",
    feederLength: "18 m",
    conductorTypeInsulation: "Cobre THW-LS 75 C, calibre a confirmar por memoria",
    conduitTypeDiameter: "Tuberia EMT 1 pulg, diametro a confirmar",
    panelBusServiceData: "Acometida a tablero TG; barras 100 A; gabinete NEMA 1; montaje sobre muro; datos sujetos a levantamiento."
  },
  system: {
    voltage: "127/220 V",
    phases: "1 fase",
    wires: "3 hilos (L1, N, T)",
    frequency: "60 Hz",
    groundingSystem: "Sistema puesto a tierra con barra de tierra en TG",
    availableShortCircuit: "10 kA presumido; calcular y confirmar en campo",
    demandFactor: "Por calcular en memoria",
    powerFactor: "0.90 ejemplo",
    maxDemand: "9.80 kVA ejemplo; no validado"
  },
  panel: {
    id: "TG",
    name: "Tablero General",
    location: "Cuarto electrico / acceso de servicio",
    voltage: "127/220 V",
    phases: "1F+N+T",
    busAmps: "100 A",
    busMaterial: "Cobre o aluminio por confirmar",
    bars: "2 fases, neutro y tierra",
    enclosure: "Gabinete metalico NEMA 1",
    mounting: "Sobrepuesto en muro",
    nema: "NEMA 1 interior",
    interruptingRating: "10 kAIC por confirmar",
    mainDevice: "Interruptor principal 2x70 A",
    neutralBar: "Barra de neutro aislada",
    groundBar: "Barra de tierra bonded al gabinete segun diseño"
  },
  grounding: {
    electrode: "Electrodo tipo varilla copperweld 5/8 pulg x 2.4 m, por confirmar",
    groundingConductor: "Conductor de puesta a tierra cal.12 Cu en derivados, principal por confirmar",
    bonding: "Union equipotencial de gabinete, canalizaciones metalicas y barra de tierra",
    resistance: "25 ohm max como referencia; medir en campo",
    notes: "Verificar continuidad, aprietes, identificacion verde/desnuda y conexion a barra de tierra."
  },
  stps: {
    workRisk: "Riesgo electrico bajo/medio por confirmar durante mantenimiento",
    loto: "Aplicar bloqueo y etiquetado antes de intervenir tablero o circuitos",
    ppe: "Guantes dielectricos, lentes, calzado dielectrico y herramienta aislada segun analisis de riesgo",
    arcFlashLabel: "Rotulado de tablero pendiente de estudio de arco electrico",
    fireRiskArea: "Area ordinaria sin atmosfera peligrosa aparente; confirmar almacenamiento y extintores",
    emergencyNotes: "Mantener libre acceso a tablero, senalizacion visible y directorio de emergencia."
  },
  circuits: [
    filledCircuit("Contacto Administracion", "1x20 A", "2 cal.12 Cu THW-LS, 1 cal.12 N, 1 cal.12 T", {
      origin: "TG", destination: "Oficina administracion", poles: "1", amps: "20", breakerType: "Termomagnetico enchufable", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.12 Cu", neutralConductor: "1 cal.12 Cu", groundConductor: "1 cal.12 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 3/4 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "22 m", load: "Contactos generales administracion", voltageDrop: "Por calcular", status: "Ejemplo; verificar campo", loadSchedule: { phase: "L1-N", loadType: "Contactos", installedVa: "1800", demandedVa: "1260", currentA: "9.92", powerFactor: "0.90", notes: "Carga estimada de ejemplo" }
    }),
    filledCircuit("Contacto Almacen", "1x20 A", "2 cal.12 Cu THW-LS, 1 cal.12 N, 1 cal.12 T", {
      origin: "TG", destination: "Almacen", poles: "1", amps: "20", breakerType: "Termomagnetico enchufable", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.12 Cu", neutralConductor: "1 cal.12 Cu", groundConductor: "1 cal.12 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 3/4 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "28 m", load: "Contactos almacen", voltageDrop: "Por calcular", status: "Ejemplo; verificar campo", loadSchedule: { phase: "L1-N", loadType: "Contactos", installedVa: "1500", demandedVa: "1050", currentA: "8.27", powerFactor: "0.90", notes: "Carga estimada de ejemplo" }
    }),
    filledCircuit("Contactos exteriores", "1x20 A GFCI", "2 cal.12 Cu THW-LS, 1 cal.12 N, 1 cal.12 T", {
      origin: "TG", destination: "Fachada y patio", poles: "1", amps: "20", breakerType: "Termomagnetico/GFCI o contacto GFCI por definir", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.12 Cu", neutralConductor: "1 cal.12 Cu", groundConductor: "1 cal.12 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "PVC pesado/EMT 3/4 pulg", conduitMaterial: "Segun intemperie", conduitFill: "Por verificar", length: "35 m", load: "Contactos exteriores con proteccion por falla a tierra", voltageDrop: "Por calcular", status: "Ejemplo; verificar IP/NEMA", loadSchedule: { phase: "L1-N", loadType: "Contactos exteriores", installedVa: "1200", demandedVa: "840", currentA: "6.61", powerFactor: "0.90", notes: "Requiere proteccion y cubierta intemperie" }
    }),
    filledCircuit("Iluminacion oficinas", "1x15 A", "2 cal.14 Cu THW-LS, 1 cal.14 N, 1 cal.14 T", {
      origin: "TG", destination: "Area oficinas", poles: "1", amps: "15", breakerType: "Termomagnetico enchufable", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.14 Cu", neutralConductor: "1 cal.14 Cu", groundConductor: "1 cal.14 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 1/2 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "31 m", load: "Luminarias LED oficinas", voltageDrop: "Por calcular", status: "Ejemplo; verificar niveles de iluminacion", loadSchedule: { phase: "L1-N", loadType: "Iluminacion LED", installedVa: "900", demandedVa: "900", currentA: "7.09", powerFactor: "0.95", notes: "Carga continua a revisar" }
    }),
    filledCircuit("Servidor / TI", "1x20 A", "2 cal.12 Cu THW-LS, 1 cal.12 N, 1 cal.12 T", {
      origin: "TG", destination: "Rack TI", poles: "1", amps: "20", breakerType: "Termomagnetico dedicado", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.12 Cu", neutralConductor: "1 cal.12 Cu", groundConductor: "1 cal.12 Cu aislado por confirmar", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 3/4 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "16 m", load: "Servidor, switch y UPS", voltageDrop: "Por calcular", status: "Ejemplo; circuito dedicado", loadSchedule: { phase: "L1-N", loadType: "Equipo TI", installedVa: "1500", demandedVa: "1500", currentA: "11.81", powerFactor: "0.95", notes: "Considerar UPS y autonomia" }
    }),
    filledCircuit("Iluminacion almacen", "1x15 A", "2 cal.14 Cu THW-LS, 1 cal.14 N, 1 cal.14 T", {
      origin: "TG", destination: "Almacen", poles: "1", amps: "15", breakerType: "Termomagnetico enchufable", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "1 cal.14 Cu", neutralConductor: "1 cal.14 Cu", groundConductor: "1 cal.14 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 1/2 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "26 m", load: "Luminarias LED almacen", voltageDrop: "Por calcular", status: "Ejemplo; verificar altura y controles", loadSchedule: { phase: "L1-N", loadType: "Iluminacion LED", installedVa: "750", demandedVa: "750", currentA: "5.91", powerFactor: "0.95", notes: "Carga continua a revisar" }
    }),
    filledCircuit("Aire acondicionado", "2x50 A", "2 cal.8 Cu THW-LS, 1 cal.12 T", {
      origin: "TG", destination: "Condensadora minisplit", poles: "2", amps: "50", breakerType: "Termomagnetico bipolar", breakerAicCurve: "10 kAIC por confirmar", phaseConductor: "2 cal.8 Cu", neutralConductor: "No aplica si equipo 220 V", groundConductor: "1 cal.12 Cu", material: "Cobre", insulation: "THW-LS 75 C", conductorTypeInsulation: "Cu THW-LS", conduitTypeDiameter: "EMT 1 pulg", conduitMaterial: "Acero galvanizado", conduitFill: "Por verificar", length: "24 m", load: "Equipo HVAC 220 V", voltageDrop: "Por calcular", status: "Ejemplo; confirmar placa del equipo", loadSchedule: { phase: "L1-L2", loadType: "Aire acondicionado", installedVa: "5000", demandedVa: "5000", currentA: "22.73", powerFactor: "0.90", notes: "Confirmar MCA/MOCP de placa" }
    }),
    filledCircuit("Reserva futura", "1x20 A", "Por definir", {
      origin: "TG", destination: "Reserva", poles: "1", amps: "20", breakerType: "Espacio disponible", breakerAicCurve: "Por definir", phaseConductor: "Por definir", neutralConductor: "Por definir", groundConductor: "Por definir", material: "Por definir", insulation: "Por definir", conductorTypeInsulation: "Por definir", conduitTypeDiameter: "Por definir", conduitMaterial: "Por definir", conduitFill: "Por verificar", length: "Por definir", load: "Reserva", voltageDrop: "Por calcular", status: "Reserva sin conectar", loadSchedule: { phase: "Por definir", loadType: "Reserva", installedVa: "0", demandedVa: "0", currentA: "0", powerFactor: "", notes: "Espacio para crecimiento" }
    })
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


function filledCircuit(name, breaker, conductor, details = {}) {
  const base = circuit(name, breaker, conductor);
  return {
    ...base,
    ...details,
    name: details.name || name,
    displayName: details.displayName || name,
    loadSchedule: { ...BLANK_LOAD, ...(details.loadSchedule || {}) }
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
function emptyData() {
  const base = clone(DEFAULT_DATA);
  base.project = Object.fromEntries(Object.keys(base.project).map(key => [key, ""]));
  base.project.title = "DIAGRAMA UNIFILAR";
  base.project.date = new Date().toISOString().slice(0, 10);
  base.service = Object.fromEntries(Object.keys(base.service).map(key => [key, ""]));
  base.system = Object.fromEntries(Object.keys(base.system).map(key => [key, ""]));
  base.panel = Object.fromEntries(Object.keys(base.panel).map(key => [key, ""]));
  base.grounding = Object.fromEntries(Object.keys(base.grounding).map(key => [key, ""]));
  base.stps = Object.fromEntries(Object.keys(base.stps).map(key => [key, ""]));
  base.circuits = [];
  return base;
}
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

function LoadSchedule({ data, setData, editable = false }) {
  const circuits = data.circuits;
  const columns = [
    ["phase", "Fase", "text"],
    ["loadType", "Tipo de carga", "text"],
    ["installedVa", "VA instalado", "number"],
    ["demandedVa", "VA demandado", "number"],
    ["currentA", "Corriente A", "number"],
    ["powerFactor", "FP", "text"],
    ["notes", "Observaciones", "text"]
  ];
  const updateLoad = (id, key, value) => {
    if (!editable || !setData) return;
    setData(d => ({
      ...d,
      circuits: d.circuits.map(c => c.id === id ? {
        ...c,
        loadSchedule: { ...c.loadSchedule, [key]: value }
      } : c)
    }));
  };
  return h("section", { className: editable ? "panel load-editor-panel" : "panel" },
    h("div", { className: "section-title-row" },
      h("div", null,
        h("h2", null, editable ? "Captura del cuadro de cargas" : "Cuadro de cargas"),
        editable ? h("p", { className: "section-help" }, "Estos campos alimentan directamente el UnifilarScript. Los totales son suma simple de valores numericos capturados.") : null
      ),
      editable ? h("button", { onClick: () => setData(d => ({ ...d, circuits: [...d.circuits, circuit()] })) }, "+ Circuito") : null
    ),
    h("div", { className: "table-wrap" }, h("table", { className: editable ? "editable-load-table" : "" },
      h("thead", null, h("tr", null,
        h("th", null, "Circuito"),
        columns.map(([, label]) => h("th", { key: label }, label))
      )),
      h("tbody", null, circuits.map((c, i) => h("tr", { key: c.id },
        h("td", { className: "load-circuit-name" }, `${i + 1}. ${c.displayName || c.name}`),
        columns.map(([key, label, type]) => h("td", { key }, editable
          ? h("input", {
              "aria-label": `${label} - ${c.displayName || c.name}`,
              type,
              min: type === "number" ? "0" : undefined,
              step: type === "number" ? "0.01" : undefined,
              value: c.loadSchedule[key] || "",
              placeholder: "Por definir",
              onChange: event => updateLoad(c.id, key, event.target.value)
            })
          : valueOrPending(c.loadSchedule[key])
        ))
      ))),
      h("tfoot", null, h("tr", null,
        h("th", { colSpan: 3 }, "Totales capturados"),
        h("td", null, total(circuits, "installedVa")),
        h("td", null, total(circuits, "demandedVa")),
        h("td", null, total(circuits, "currentA")),
        h("td", { colSpan: 2 }, "Suma simple; no sustituye calculo de demanda ni memoria tecnica.")
      ))
    ))
  );
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


function MobileSchematic({ data, generatedScript, undo, canUndo, restore }) {
  const circuits = data.circuits || [];
  const width = 390;
  const row = 86;
  const height = 250 + Math.max(circuits.length, 1) * row;
  const circuitY = i => 230 + i * row;
  return h("section", { className: "mobile-schematic" },
    h("div", { className: "mobile-hero" },
      h("div", null,
        h("span", { className: "mobile-kicker" }, "Modo movil"),
        h("h1", null, "Diagrama unifilar esquematico"),
        h("p", null, valueOrPending(data.project.projectName))
      ),
      h("div", { className: "mobile-badge" }, `${circuits.length} circuitos`)
    ),
    h("div", { className: "mobile-actions" },
      h("button", { onClick: undo, disabled: !canUndo }, "Deshacer"),
      h("button", { onClick: () => window.print() }, "Imprimir"),
      h("button", { onClick: () => downloadPdf(data, "simple") }, "PDF"),
      h("button", { onClick: () => downloadText("diagrama.unifilar", generatedScript) }, "Script"),
      h("button", { onClick: restore }, "Restaurar")
    ),
    h("div", { className: "mobile-summary" },
      h("div", null, h("span", null, "Tension"), h("strong", null, valueOrPending(data.system.voltage))),
      h("div", null, h("span", null, "Sistema"), h("strong", null, `${valueOrPending(data.system.phases)} / ${valueOrPending(data.system.wires)}`)),
      h("div", null, h("span", null, "Principal"), h("strong", null, valueOrPending(data.service.mainBreaker))),
      h("div", null, h("span", null, "Tablero"), h("strong", null, valueOrPending(data.panel.id || data.panel.name)))
    ),
    h("div", { className: "phone-canvas", role: "img", "aria-label": "Diagrama unifilar esquematico movil" },
      h("svg", { viewBox: `0 0 ${width} ${height}`, className: "mobile-svg" },
        h("rect", { width, height, rx: 0, fill: "#ffffff" }),
        h("text", { x: 195, y: 34, textAnchor: "middle", className: "m-title" }, data.project.title || "DIAGRAMA UNIFILAR"),
        h("rect", { x: 116, y: 58, width: 158, height: 36, rx: 3, className: "m-box" }),
        h("text", { x: 195, y: 81, textAnchor: "middle", className: "m-label" }, valueOrPending(data.service.label)),
        h("line", { x1: 195, y1: 94, x2: 195, y2: 132, className: "m-line" }),
        h("path", { d: "M177 162 C165 148 166 134 181 124", className: "m-line" }),
        h("text", { x: 207, y: 151, className: "m-breaker" }, valueOrPending(data.service.mainBreaker)),
        h("line", { x1: 195, y1: 166, x2: 195, y2: 188, className: "m-line" }),
        h("rect", { x: 120, y: 188, width: 150, height: 34, rx: 3, className: "m-box m-dashed" }),
        h("text", { x: 195, y: 209, textAnchor: "middle", className: "m-label" }, valueOrPending(data.panel.name)),
        circuits.map((c, i) => {
          const y = circuitY(i);
          return h("g", { key: c.id },
            h("line", { x1: 195, y1: i === 0 ? 222 : circuitY(i - 1) + 48, x2: 195, y2: y, className: "m-bus" }),
            h("circle", { cx: 195, cy: y, r: 4, className: "m-node" }),
            h("line", { x1: 195, y1: y, x2: 78, y2: y, className: "m-line" }),
            h("path", { d: `M94 ${y + 30} C82 ${y + 18} 83 ${y + 4} 97 ${y - 4}`, className: "m-line" }),
            h("text", { x: 104, y: y + 22, className: "m-breaker" }, c.breaker || "P/D"),
            h("rect", { x: 216, y: y - 24, width: 140, height: 48, rx: 4, className: "m-load" }),
            h("text", { x: 226, y: y - 4, className: "m-circuit" }, `${i + 1}. ${c.displayName || c.name}`.slice(0, 26)),
            h("text", { x: 226, y: y + 14, className: "m-meta" }, `${valueOrPending(c.loadSchedule?.phase)}  ${valueOrPending(c.loadSchedule?.demandedVa)} VA`.slice(0, 30))
          );
        })
      )
    ),
    h("div", { className: "mobile-circuit-list" }, circuits.map((c, i) => h("article", { key: c.id },
      h("strong", null, `${i + 1}. ${c.displayName || c.name}`),
      h("span", null, `${valueOrPending(c.breaker)} | ${valueOrPending(c.conductor)}`),
      h("small", null, `${valueOrPending(c.loadSchedule?.phase)} | ${valueOrPending(c.loadSchedule?.demandedVa)} VA | ${valueOrPending(c.loadSchedule?.currentA)} A`)
    )))
  );
}

function ScriptPanel({ script, setScript, apply, sync, download }) {
  return h("section", { className: "panel script-panel" },
    h("div", { className: "section-title-row" }, h("h2", null, "UnifilarScript"), h("div", { className: "button-row" }, h("button", { onClick: sync }, "Sincronizar"), h("button", { onClick: apply }, "Aplicar codigo"), h("button", { onClick: download }, "Descargar .unifilar"))),
    h("textarea", { className: "script-editor", value: script, onChange: e => setScript(e.target.value), spellCheck: false })
  );
}

function downloadText(name, text, type="text/plain") { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

function pdfSafe(value) {
  return safe(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfDocument(current, mode = "simple") {
  const pages = [];
  const makePage = () => [];
  const text = (cmds, value, x, y, size = 9, font = "F1") => cmds.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfSafe(value)}) Tj ET`);
  const line = (cmds, x1, y1, x2, y2) => cmds.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  const rect = (cmds, x, y, w, h) => cmds.push(`${x} ${y} ${w} ${h} re S`);
  const cell = (cmds, value, x, y, w, h, size = 6.5, font = "F1") => {
    rect(cmds, x, y, w, h);
    const max = Math.max(8, Math.floor(w / (size * 0.48)));
    const words = valueOrPending(value).split(/\s+/);
    const rows = [];
    let row = "";
    words.forEach(word => {
      const next = `${row} ${word}`.trim();
      if (next.length > max && row) { rows.push(row); row = word; } else row = next;
    });
    if (row) rows.push(row);
    rows.slice(0, 2).forEach((part, index) => text(cmds, part, x + 3, y + h - 9 - index * (size + 2), size, font));
  };

  const p1 = makePage();
  p1.push("0.8 w");
  text(p1, current.project.title || "DIAGRAMA UNIFILAR", 42, 570, 18, "F2");
  text(p1, `Proyecto: ${valueOrPending(current.project.projectName)}`, 42, 550, 9);
  text(p1, `Ubicacion: ${valueOrPending(current.project.location)}`, 42, 536, 8);
  text(p1, `Fecha: ${valueOrPending(current.project.date)}  Plano: ${valueOrPending(current.project.drawingNumber)}  Rev: ${valueOrPending(current.project.revision)}`, 42, 522, 8);
  text(p1, "Datos principales", 42, 498, 11, "F2");
  const serviceRows = [
    ["Acometida", current.service.label], ["Compania", current.service.utility], ["Servicio", current.service.serviceType],
    ["Interruptor principal", current.service.mainBreaker], ["AIC/curva", current.service.mainBreakerAicCurve], ["Alimentador", current.service.feeder],
    ["Tension", current.system.voltage], ["Fases/hilos", `${valueOrPending(current.system.phases)} / ${valueOrPending(current.system.wires)}`],
    ["Tablero", `${valueOrPending(current.panel.id)} ${valueOrPending(current.panel.name)}`], ["Puesta a tierra", current.system.groundingSystem]
  ];
  let y = 476;
  serviceRows.forEach(([label, value]) => { cell(p1, label, 42, y, 125, 18, 7, "F2"); cell(p1, value, 167, y, 265, 18, 7); y -= 18; });
  text(p1, "Diagrama unifilar simplificado", 470, 498, 11, "F2");
  const centerX = 610;
  rect(p1, centerX - 54, 452, 108, 24); text(p1, current.service.label || "Acometida", centerX - 38, 461, 7);
  line(p1, centerX, 452, centerX, 420); text(p1, current.service.mainBreaker || "P/D", centerX + 8, 430, 8, "F2");
  line(p1, 470, 400, 744, 400);
  const circuits = current.circuits.slice(0, 10);
  const gap = circuits.length > 1 ? 274 / (circuits.length - 1) : 0;
  circuits.forEach((c, i) => {
    const x = circuits.length > 1 ? 470 + gap * i : centerX;
    line(p1, x, 400, x, 354);
    text(p1, c.breaker || "P/D", x - 8, 374, 6, "F2");
    rect(p1, x - 24, 322, 48, 24);
    text(p1, `${i + 1}`, x - 3, 332, 6, "F2");
  });
  text(p1, circuits.length < current.circuits.length ? `Se muestran 10 de ${current.circuits.length} circuitos.` : `Circuitos: ${current.circuits.length}`, 470, 300, 7);
  text(p1, "Notas: PDF generado desde captura. No sustituye memoria de calculo ni validacion profesional.", 42, 42, 7);
  pages.push(p1);

  const p2 = makePage();
  p2.push("0.6 w");
  text(p2, "Circuitos y cuadro de cargas", 42, 570, 16, "F2");
  const cols = [34, 108, 58, 105, 48, 54, 54, 48, 44, 165];
  const headers = ["No", "Circuito", "Interruptor", "Conductores", "Fase", "VA inst", "VA dem", "A", "FP", "Observaciones"];
  let x = 36; y = 542;
  headers.forEach((header, i) => { cell(p2, header, x, y, cols[i], 20, 6, "F2"); x += cols[i]; });
  y -= 20;
  current.circuits.slice(0, 18).forEach((c, index) => {
    x = 36;
    const load = c.loadSchedule || {};
    [index + 1, c.displayName || c.name, c.breaker, c.conductor, load.phase, load.installedVa, load.demandedVa, load.currentA, load.powerFactor, load.notes]
      .forEach((value, i) => { cell(p2, value, x, y, cols[i], 24, 5.7); x += cols[i]; });
    y -= 24;
  });
  text(p2, `Total VA instalado: ${total(current.circuits, "installedVa")}`, 42, 78, 8, "F2");
  text(p2, `Total VA demandado: ${total(current.circuits, "demandedVa")}`, 220, 78, 8, "F2");
  text(p2, `Total corriente A: ${total(current.circuits, "currentA")}`, 410, 78, 8, "F2");
  text(p2, "Totales por suma simple de valores capturados.", 42, 58, 7);
  pages.push(p2);


  if (mode === "complete") {
    const addSectionPage = (title, rows) => {
      let page = makePage();
      let pageIndex = 0;
      let y = 542;
      const beginPage = () => {
        page = makePage();
        page.push("0.6 w");
        text(page, pageIndex ? `${title} (cont.)` : title, 42, 570, 16, "F2");
        y = 542;
        pageIndex += 1;
      };
      beginPage();
      rows.forEach(([label, value]) => {
        if (y < 54) {
          pages.push(page);
          beginPage();
        }
        cell(page, label, 42, y, 190, 22, 6.5, "F2");
        cell(page, value, 232, y, 510, 22, 6.5);
        y -= 22;
      });
      pages.push(page);
    };

    addSectionPage("Datos completos - proyecto", [
      ["Titulo", current.project.title], ["Proyecto", current.project.projectName], ["Ubicacion", current.project.location],
      ["Fecha", current.project.date], ["Elaboro", current.project.preparedBy], ["Reviso", current.project.reviewedBy],
      ["No. plano", current.project.drawingNumber], ["Revision", current.project.revision], ["Normas/base", current.project.standards],
      ["Notas", current.project.notes]
    ]);
    addSectionPage("Datos completos - acometida y sistema", [
      ["Etiqueta acometida", current.service.label], ["Compania", current.service.utility], ["Tipo servicio", current.service.serviceType],
      ["Medicion", current.service.meter], ["Interruptor principal", current.service.mainBreaker], ["Polos", current.service.mainBreakerPoles],
      ["Amperes", current.service.mainBreakerAmps], ["AIC/curva", current.service.mainBreakerAicCurve], ["Alimentador", current.service.feeder],
      ["Longitud alimentador", current.service.feederLength], ["Conductor/aislamiento", current.service.conductorTypeInsulation],
      ["Canalizacion", current.service.conduitTypeDiameter], ["Datos acometida/tablero", current.service.panelBusServiceData],
      ["Tension", current.system.voltage], ["Fases", current.system.phases], ["Hilos", current.system.wires], ["Frecuencia", current.system.frequency],
      ["Sistema puesta a tierra", current.system.groundingSystem], ["Cortocircuito disponible", current.system.availableShortCircuit],
      ["Factor demanda", current.system.demandFactor], ["Factor potencia", current.system.powerFactor], ["Demanda maxima", current.system.maxDemand]
    ]);
    addSectionPage("Datos completos - tablero, tierra y STPS", [
      ["ID tablero", current.panel.id], ["Nombre tablero", current.panel.name], ["Ubicacion", current.panel.location], ["Tension", current.panel.voltage],
      ["Fases/hilos", current.panel.phases], ["Capacidad barras", current.panel.busAmps], ["Material barras", current.panel.busMaterial],
      ["No. barras", current.panel.bars], ["Gabinete", current.panel.enclosure], ["Montaje", current.panel.mounting], ["NEMA/IP", current.panel.nema],
      ["Capacidad interruptiva", current.panel.interruptingRating], ["Dispositivo principal", current.panel.mainDevice],
      ["Barra neutro", current.panel.neutralBar], ["Barra tierra", current.panel.groundBar],
      ["Electrodo tierra", current.grounding.electrode], ["Conductor tierra", current.grounding.groundingConductor],
      ["Union/equipotencialidad", current.grounding.bonding], ["Resistencia medida", current.grounding.resistance], ["Notas tierra", current.grounding.notes],
      ["Riesgo trabajo/area", current.stps.workRisk], ["Bloqueo y etiquetado", current.stps.loto], ["EPP", current.stps.ppe],
      ["Rotulado/arc flash", current.stps.arcFlashLabel], ["Riesgo incendio/area", current.stps.fireRiskArea], ["Notas emergencia", current.stps.emergencyNotes]
    ]);

    current.circuits.forEach((c, index) => {
      const load = c.loadSchedule || {};
      addSectionPage(`Circuito ${index + 1} - ${valueOrPending(c.displayName || c.name)}`, [
        ["Nombre visible", c.displayName], ["Origen", c.origin], ["Destino", c.destination], ["Interruptor", c.breaker],
        ["Polos", c.poles], ["Amperes", c.amps], ["Tipo interruptor", c.breakerType], ["AIC/curva", c.breakerAicCurve],
        ["Conductores", c.conductor], ["Conductor fase", c.phaseConductor], ["Neutro", c.neutralConductor], ["Tierra", c.groundConductor],
        ["Material", c.material], ["Aislamiento", c.insulation], ["Canalizacion", c.conduitTypeDiameter], ["Material canalizacion", c.conduitMaterial],
        ["Longitud", c.length], ["Carga/descripcion", c.load], ["Caida tension", c.voltageDrop], ["Estatus", c.status],
        ["Fase cuadro cargas", load.phase], ["Tipo carga", load.loadType], ["VA instalado", load.installedVa], ["VA demandado", load.demandedVa],
        ["Corriente A", load.currentA], ["FP", load.powerFactor], ["Observaciones", load.notes]
      ]);
    });
  }

  const streams = pages.map(page => page.join("\n"));
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${streams.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${streams.length} >>`
  ];
  streams.forEach((stream, i) => {
    const pageObj = 3 + i * 2;
    const contentObj = pageObj + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 ${3 + streams.length * 2} 0 R /F2 ${4 + streams.length * 2} 0 R >> >> /Contents ${contentObj} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array([...pdf].map(char => char.charCodeAt(0)));
}

function downloadPdf(current, mode = "simple") {
  const pdf = buildPdfDocument(current, mode);
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = mode === "complete" ? "diagrama-unifilar-completo.pdf" : "diagrama-unifilar-simplificado.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [data, setData] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(DEFAULT_DATA); } catch { return clone(DEFAULT_DATA); } });
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState("project");
  const [script, setScript] = useState(() => generateScript(data));
  const [status, setStatus] = useState("Listo");
  const generatedScript = useMemo(() => generateScript(data), [data]);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => setScript(generatedScript), [generatedScript]);
  const commitData = updater => {
    setData(previous => {
      const next = typeof updater === "function" ? updater(previous) : updater;
      if (JSON.stringify(previous) === JSON.stringify(next)) return previous;
      setHistory(items => [...items.slice(-49), clone(previous)]);
      return next;
    });
  };
  const undoLastChange = () => {
    setHistory(items => {
      if (!items.length) {
        setStatus("No hay cambios para deshacer.");
        return items;
      }
      const previous = items[items.length - 1];
      setData(previous);
      setStatus("Ultimo cambio deshecho.");
      return items.slice(0, -1);
    });
  };
  const applyScript = () => { try { const parsed = parseScript(script); commitData(parsed); setStatus(`Plano reconstruido: ${parsed.circuits.length} circuito(s).`); } catch (e) { setStatus(e.message); } };
  const syncScript = () => { setScript(generatedScript); setStatus("Codigo sincronizado desde formulario."); };
  const mainPanel = active === "circuits" ? h(CircuitsEditor, { data, setData: commitData }) : active === "loads" ? h(LoadSchedule, { data, setData: commitData, editable: true }) : active === "script" ? h(ScriptPanel, { script, setScript, apply: applyScript, sync: syncScript, download: () => downloadText("diagrama.unifilar", script) }) : h(SectionForm, { title: nav.find(n => n[0] === active)?.[1], group: active, fields: forms[active], data, setData: commitData });
  const restoreExample = () => { localStorage.removeItem(STORAGE_KEY); commitData(clone(DEFAULT_DATA)); setStatus("Datos de ejemplo restaurados."); };
  return h("div", { className: "app-shell" },
    h("header", { className: "topbar" }, h("div", { className: "brand" }, h("span", { className: "brand-icon" }, "DU"), h("div", null, h("strong", null, "Generador de Diagrama Unifilar Dinamico"), h("span", null, "React + UnifilarScript"))), h("div", { className: "top-actions" }, h("button", { onClick: undoLastChange, disabled: !history.length, title: "Deshacer ultimo cambio" }, "Deshacer"), h("button", { onClick: () => window.print() }, "Imprimir"), h("button", { onClick: () => downloadPdf(data, "simple") }, "PDF simplificado"), h("button", { onClick: () => downloadPdf(data, "complete") }, "PDF completo"), h("button", { onClick: () => downloadText("diagrama.unifilar", generatedScript) }, "Exportar script"), h("button", { onClick: restoreExample }, "Restaurar"), h("button", { className: "danger-button", onClick: () => { if (window.confirm("Esto borrara todos los campos y circuitos capturados. ¿Deseas continuar?")) { localStorage.removeItem(STORAGE_KEY); commitData(emptyData()); setStatus("Todos los campos fueron borrados."); } } }, "Borrar todo"))),
    h(MobileSchematic, { data, generatedScript, undo: undoLastChange, canUndo: !!history.length, restore: restoreExample }),
    h("div", { className: "main-grid desktop-layout" },
      h("aside", { className: "sidebar" }, nav.map(([id, label]) => h("button", { key: id, className: active === id ? "active" : "", onClick: () => setActive(id) }, label)), h("div", { className: "norm-note" }, "Campos de captura para NOM-001-SEDE y seguridad STPS. Validar por responsable electrico.")),
      h("main", { className: "workarea" }, h("div", { className: "form-column" }, mainPanel), h("section", { className: "preview-column" }, h("div", { className: "preview-head" }, h("h2", null, "Vista del diagrama unifilar"), h("span", null, status)), h("div", { className: "diagram-scroll" }, h(Diagram, { data })), h(LoadSchedule, { data, editable: false }), h(ScriptPanel, { script, setScript, apply: applyScript, sync: syncScript, download: () => downloadText("diagrama.unifilar", script) })))
    ),
    h("footer", null, "La app no sustituye memoria de calculo, dictamen, UVIE o responsiva profesional. Los valores deben confirmarse en campo.")
  );
}

createRoot(document.getElementById("root")).render(h(App));
