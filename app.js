const DEFAULT_DATA = {
  project: {
    title: "DIAGRAMA UNIFILAR",
    source: "Transcripcion de imagen proporcionada por el usuario",
    standardNotes: [
      "Documento de apoyo tecnico. No sustituye memoria de calculo, dictamen, responsiva profesional ni verificacion por UVIE/perito.",
      "Los calibres se transcriben como aparecen en la imagen; confirmar si corresponden a AWG, tipo de conductor, aislamiento y canalizacion.",
      "No se calculan capacidad de conduccion, caida de tension, corriente de cortocircuito, canalizacion, puesta a tierra ni coordinacion de protecciones porque la imagen no proporciona tension, fases, carga, longitud, temperatura, agrupamiento ni material.",
      "Para instalaciones electricas en Mexico, revisar NOM-001-SEDE vigente aplicable al proyecto. La NOM-002-STPS aplica a prevencion y proteccion contra incendios en centros de trabajo cuando corresponda."
    ],
    missingData: [
      "Tension del sistema",
      "Numero de fases y sistema de puesta a tierra",
      "Carga instalada o demandada por circuito",
      "Longitudes de alimentadores y derivados",
      "Tipo de conductor y aislamiento",
      "Tipo y diametro de canalizacion",
      "Capacidad interruptiva y curva/tipo de interruptores",
      "Tablero, barras, gabinete y datos de acometida"
    ]
  },
  service: {
    label: "Acometida CFE",
    mainBreaker: "2x70",
    feeder: "2 cal.8, 1 cal. 8 N, 1 cal. 12 T",
    systemVoltage: "",
    phasesGrounding: "",
    feederLength: "",
    conductorTypeInsulation: "",
    conduitTypeDiameter: "",
    mainBreakerAicCurve: "",
    panelBusServiceData: ""
  },
  circuits: [
    { id: "c1", name: "Contacto Administracion", displayName: "Contacto\nAdministracion", breaker: "1x30", conductor: "2 cal.10, 1 cal. 10 N, 1 cal. 12 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c2", name: "Contacto Almacen", displayName: "Contacto\nAlmacen", breaker: "1x30", conductor: "2 cal.10, 1 cal. 10 N, 1 cal. 12 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c3", name: "Contactos exteriores", displayName: "Contactos\nexteriores", breaker: "1x30", conductor: "2 cal.10, 1 cal. 10 N, 1 cal. 12 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c4", name: "Iluminacion", displayName: "Iluminacion", breaker: "1x15", conductor: "2 cal.12, 1 cal. 12 N, 1 cal. 14 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c5", name: "Servidor", displayName: "Servidor", breaker: "1x10", conductor: "2 cal.12, 1 cal. 12 N, 1 cal. 14 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c6", name: "Disponible", displayName: "Disponible", breaker: "1x10", conductor: "2 cal.12, 1 cal. 12 N, 1 cal. 14 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" },
    { id: "c7", name: "Aire/A.", displayName: "Aire/A.", breaker: "2x50", conductor: "2 cal.8, 1 cal. 8 N, 1 cal. 12 T", load: "", length: "", conductorTypeInsulation: "", conduitTypeDiameter: "", breakerAicCurve: "", panelBusServiceData: "", loadSchedule: { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" }, status: "Dato visible en imagen" }
  ]
};

const STORAGE_KEY = "unifilar-dinamico-v1";
const SVG_NS = "http://www.w3.org/2000/svg";
let data = loadState();
let selectedCircuitId = data.circuits[0]?.id || null;

const svg = document.getElementById("diagramSvg");
const circuitList = document.getElementById("circuitList");
const summaryRows = document.getElementById("summaryRows");
const loadScheduleRows = document.getElementById("loadScheduleRows");
const totalInstalledVa = document.getElementById("totalInstalledVa");
const totalDemandedVa = document.getElementById("totalDemandedVa");
const totalCurrentA = document.getElementById("totalCurrentA");
const statusText = document.getElementById("statusText");
const dslEditor = document.getElementById("dslEditor");
const dslStatus = document.getElementById("dslStatus");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function blankLoadSchedule() {
  return { phase: "", loadType: "", installedVa: "", demandedVa: "", currentA: "", powerFactor: "", notes: "" };
}

function createCircuit(input = {}, index = 0) {
  const name = input.name || input.displayName || `Circuito ${index + 1}`;
  const displayName = input.displayName || String(name).replace(/\s+\/\s+/g, "\n");
  return {
    id: input.id || `c${index + 1}`,
    name: String(input.name || displayName).replace(/\n/g, " "),
    displayName,
    breaker: input.breaker || "",
    conductor: input.conductor || "",
    load: input.load || "",
    length: input.length || "",
    conductorTypeInsulation: input.conductorTypeInsulation || "",
    conduitTypeDiameter: input.conduitTypeDiameter || "",
    breakerAicCurve: input.breakerAicCurve || "",
    panelBusServiceData: input.panelBusServiceData || "",
    loadSchedule: { ...blankLoadSchedule(), ...(input.loadSchedule || {}) },
    status: input.status || "Dato capturado o por confirmar en campo"
  };
}

function loadState() {
  const defaults = clone(DEFAULT_DATA);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaults;
  try {
    const parsed = JSON.parse(stored);
    const merged = {
      ...defaults,
      ...parsed,
      project: { ...defaults.project, ...(parsed.project || {}) },
      service: { ...defaults.service, ...(parsed.service || {}) }
    };
    const parsedCircuits = Array.isArray(parsed.circuits) ? parsed.circuits : [];
    const sourceCircuits = parsedCircuits.length ? parsedCircuits : defaults.circuits;
    merged.circuits = sourceCircuits.map((circuit, index) => createCircuit(circuit, index));
    return merged;
  } catch {
    return defaults;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setStatus("Cambios guardados");
}

function setStatus(text) {
  statusText.value = text;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusText.value = "Listo";
  }, 2200);
}

function makeSvg(tag, attrs = {}, text = "") {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  if (text) el.textContent = text;
  return el;
}

function addText(parent, text, x, y, options = {}) {
  const t = makeSvg("text", {
    x,
    y,
    "text-anchor": options.anchor || "middle",
    class: ["svg-text", options.className || ""].join(" ").trim()
  });
  const lines = String(text).split("\n");
  lines.forEach((line, index) => {
    const span = makeSvg("tspan", {
      x,
      dy: index === 0 ? 0 : options.lineHeight || 21
    }, line);
    t.appendChild(span);
  });
  parent.appendChild(t);
  return t;
}

function wrapText(value, maxChars) {
  const words = String(value).replace(/\n/g, " ").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = `${current} ${word}`.trim();
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.join("\n");
}

function drawBox(parent, x, y, w, h, label, className = "") {
  parent.appendChild(makeSvg("rect", { x, y, width: w, height: h, class: `svg-box ${className}`.trim() }));
  const lines = String(label).split("\n");
  const firstY = y + h / 2 - ((lines.length - 1) * 10) + 6;
  addText(parent, label, x + w / 2, firstY, { className: "svg-small", lineHeight: 20 });
}

function drawBreaker(parent, x, y, label) {
  parent.appendChild(makeSvg("path", { d: `M ${x - 24} ${y + 18} C ${x - 38} ${y + 2}, ${x - 37} ${y - 19}, ${x - 22} ${y - 32}`, class: "svg-line" }));
  addText(parent, label, x + 14, y, { className: "svg-bold" });
}

function drawDiagram() {
  const branchCount = Math.max(data.circuits.length, 1);
  const svgWidth = Math.max(1150, 240 + branchCount * 145);
  const centerX = svgWidth / 2;
  svg.setAttribute("viewBox", `0 0 ${svgWidth} 760`);
  svg.style.minWidth = `${Math.min(svgWidth, 1800)}px`;
  svg.innerHTML = "";
  svg.appendChild(makeSvg("rect", { x: 0, y: 0, width: svgWidth, height: 760, fill: "#fff" }));

  addText(svg, data.project.title, centerX, 78, { className: "diagram-title" });
  drawBox(svg, centerX - 83, 108, 166, 42, data.service.label, "");
  svg.appendChild(makeSvg("line", { x1: centerX, y1: 150, x2: centerX, y2: 195, class: "svg-line" }));
  drawBreaker(svg, centerX - 5, 222, data.service.mainBreaker);
  svg.appendChild(makeSvg("line", { x1: centerX, y1: 252, x2: centerX, y2: 350, class: "svg-line" }));
  addText(svg, wrapText(data.service.feeder || "Alimentador por definir", 25), centerX + 25, 260, { anchor: "start", className: "svg-small svg-bold", lineHeight: 17 });

  const busY = 350;
  const startX = 120;
  const endX = svgWidth - 120;
  svg.appendChild(makeSvg("line", { x1: startX, y1: busY, x2: endX, y2: busY, class: "svg-line" }));

  if (!data.circuits.length) {
    addText(svg, "Sin circuitos definidos", centerX, 455, { className: "svg-bold" });
    return;
  }

  const gap = data.circuits.length > 1 ? (endX - startX) / (data.circuits.length - 1) : 0;
  data.circuits.forEach((circuit, index) => {
    const x = data.circuits.length > 1 ? startX + gap * index : centerX;
    const group = makeSvg("g", { class: circuit.id === selectedCircuitId ? "branch-selected" : "" });
    group.dataset.id = circuit.id;
    svg.appendChild(group);

    group.appendChild(makeSvg("line", { x1: x, y1: busY, x2: x, y2: 396, class: "svg-line" }));
    addText(group, wrapText(circuit.conductor || "Conductor por definir", 16), x + 19, 395, { anchor: "start", className: "svg-tiny svg-bold", lineHeight: 15 });
    drawBreaker(group, x - 3, 450, circuit.breaker || "P/D");
    group.appendChild(makeSvg("line", { x1: x, y1: 472, x2: x + 7, y2: 618, class: "svg-line" }));

    const labelText = circuit.displayName || circuit.name || `Circuito ${index + 1}`;
    const wider = labelText.length > 14 || labelText.includes("\n");
    const boxW = wider ? 150 : 118;
    const boxH = wider ? 58 : 34;
    drawBox(group, x - boxW / 2 + 7, 618, boxW, boxH, labelText);
    group.appendChild(makeSvg("rect", { x: x - 72, y: 360, width: 158, height: 320, class: "branch-hotspot" }));
    group.addEventListener("click", () => {
      selectedCircuitId = circuit.id;
      renderAll();
      document.getElementById(`name-${circuit.id}`)?.focus();
    });
  });
}

function renderEditor() {
  document.getElementById("serviceLabel").value = data.service.label;
  document.getElementById("mainBreaker").value = data.service.mainBreaker;
  document.getElementById("mainFeeder").value = data.service.feeder;
  document.getElementById("systemVoltage").value = data.service.systemVoltage || "";
  document.getElementById("phasesGrounding").value = data.service.phasesGrounding || "";
  document.getElementById("feederLength").value = data.service.feederLength || "";
  document.getElementById("serviceConductorTypeInsulation").value = data.service.conductorTypeInsulation || "";
  document.getElementById("serviceConduitTypeDiameter").value = data.service.conduitTypeDiameter || "";
  document.getElementById("mainBreakerAicCurve").value = data.service.mainBreakerAicCurve || "";
  document.getElementById("panelBusServiceData").value = data.service.panelBusServiceData || "";

  circuitList.innerHTML = "";
  data.circuits.forEach((circuit, index) => {
    const card = document.createElement("article");
    card.className = "circuit-card";
    card.innerHTML = `
      <h3>Circuito ${index + 1}<small>${circuit.breaker}</small></h3>
      <label>Nombre visible<input id="name-${circuit.id}" type="text" value="${escapeHtml(circuit.displayName.replace(/\n/g, " / "))}"></label>
      <label>Interruptor<input id="breaker-${circuit.id}" type="text" value="${escapeHtml(circuit.breaker)}"></label>
      <label>Conductores<textarea id="conductor-${circuit.id}" rows="3">${escapeHtml(circuit.conductor)}</textarea></label>
      <label>Carga instalada o demandada<input id="load-${circuit.id}" type="text" value="${escapeHtml(circuit.load || "")}" placeholder="Por definir"></label>
      <label>Longitud del derivado<input id="length-${circuit.id}" type="text" value="${escapeHtml(circuit.length || "")}" placeholder="Por definir"></label>
      <label>Tipo de conductor y aislamiento<input id="ctype-${circuit.id}" type="text" value="${escapeHtml(circuit.conductorTypeInsulation || "")}" placeholder="Por definir"></label>
      <label>Tipo y diametro de canalizacion<input id="conduit-${circuit.id}" type="text" value="${escapeHtml(circuit.conduitTypeDiameter || "")}" placeholder="Por definir"></label>
      <label>Capacidad interruptiva y curva/tipo<input id="aic-${circuit.id}" type="text" value="${escapeHtml(circuit.breakerAicCurve || "")}" placeholder="Por definir"></label>
      <label>Tablero, barras, gabinete y acometida<textarea id="panel-${circuit.id}" rows="2" placeholder="Por definir">${escapeHtml(circuit.panelBusServiceData || "")}</textarea></label>
    `;
    circuitList.appendChild(card);

    card.querySelector(`#name-${circuit.id}`).addEventListener("input", (event) => {
      circuit.displayName = event.target.value.replace(/\s+\/\s+/g, "\n");
      circuit.name = circuit.displayName.replace(/\n/g, " ");
      selectedCircuitId = circuit.id;
      renderAll(false);
    });
    card.querySelector(`#breaker-${circuit.id}`).addEventListener("input", (event) => {
      circuit.breaker = event.target.value;
      selectedCircuitId = circuit.id;
      renderAll(false);
    });
    card.querySelector(`#conductor-${circuit.id}`).addEventListener("input", (event) => {
      circuit.conductor = event.target.value;
      selectedCircuitId = circuit.id;
      renderAll(false);
    });
    [
      ["load", `#load-${circuit.id}`],
      ["length", `#length-${circuit.id}`],
      ["conductorTypeInsulation", `#ctype-${circuit.id}`],
      ["conduitTypeDiameter", `#conduit-${circuit.id}`],
      ["breakerAicCurve", `#aic-${circuit.id}`],
      ["panelBusServiceData", `#panel-${circuit.id}`]
    ].forEach(([key, selector]) => {
      card.querySelector(selector).addEventListener("input", (event) => {
        circuit[key] = event.target.value;
        selectedCircuitId = circuit.id;
        renderAll(false);
      });
    });
  });
}

function renderSummary() {
  summaryRows.innerHTML = "";
  data.circuits.forEach((circuit) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(circuit.name)}</td>
      <td>${escapeHtml(circuit.breaker)}</td>
      <td>${escapeHtml(circuit.conductor)}</td>
      <td>${escapeHtml(valueOrPending(circuit.load))}</td>
      <td>${escapeHtml(valueOrPending(circuit.length))}</td>
      <td>${escapeHtml(valueOrPending(circuit.conductorTypeInsulation))}</td>
      <td>${escapeHtml(valueOrPending(circuit.conduitTypeDiameter))}</td>
      <td>${escapeHtml(valueOrPending(circuit.breakerAicCurve))}</td>
      <td>${escapeHtml(valueOrPending(circuit.panelBusServiceData))}</td>
      <td>${escapeHtml(circuit.status)}</td>
    `;
    summaryRows.appendChild(row);
  });

  const missing = document.getElementById("missingData");
  missing.innerHTML = data.project.missingData.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const notes = document.getElementById("notes");
  notes.innerHTML = data.project.standardNotes.map((note) => `<p>${escapeHtml(note)}</p>`).join("");
}

function valueOrPending(value) {
  return String(value || "").trim() || "Por definir";
}

function numericValue(value) {
  const cleaned = String(value || "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function formatTotal(value) {
  return value === null ? "Por definir" : value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderLoadSchedule() {
  if (!loadScheduleRows) return;
  loadScheduleRows.innerHTML = "";
  data.circuits.forEach((circuit, index) => {
    const schedule = circuit.loadSchedule || {};
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(index + 1)}. ${escapeHtml(circuit.name)}</td>
      <td><input data-id="${circuit.id}" data-field="phase" type="text" value="${escapeHtml(schedule.phase || "")}" placeholder="A/B/C"></td>
      <td><input data-id="${circuit.id}" data-field="loadType" type="text" value="${escapeHtml(schedule.loadType || "")}" placeholder="Por definir"></td>
      <td><input data-id="${circuit.id}" data-field="installedVa" type="number" min="0" step="0.01" value="${escapeHtml(schedule.installedVa || "")}" placeholder="0"></td>
      <td><input data-id="${circuit.id}" data-field="demandedVa" type="number" min="0" step="0.01" value="${escapeHtml(schedule.demandedVa || "")}" placeholder="0"></td>
      <td><input data-id="${circuit.id}" data-field="currentA" type="number" min="0" step="0.01" value="${escapeHtml(schedule.currentA || "")}" placeholder="0"></td>
      <td><input data-id="${circuit.id}" data-field="powerFactor" type="text" value="${escapeHtml(schedule.powerFactor || "")}" placeholder="Por definir"></td>
      <td><input data-id="${circuit.id}" data-field="notes" type="text" value="${escapeHtml(schedule.notes || "")}" placeholder="Por definir"></td>
    `;
    loadScheduleRows.appendChild(row);
  });
  loadScheduleRows.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const target = event.target;
      const circuit = data.circuits.find((item) => item.id === target.dataset.id);
      if (!circuit) return;
      circuit.loadSchedule = circuit.loadSchedule || {};
      circuit.loadSchedule[target.dataset.field] = target.value;
      renderLoadTotals();
    });
  });
  renderLoadTotals();
}

function renderLoadTotals() {
  const totals = data.circuits.reduce(
    (acc, circuit) => {
      const schedule = circuit.loadSchedule || {};
      const installed = numericValue(schedule.installedVa);
      const demanded = numericValue(schedule.demandedVa);
      const current = numericValue(schedule.currentA);
      if (installed !== null) acc.installed += installed, acc.hasInstalled = true;
      if (demanded !== null) acc.demanded += demanded, acc.hasDemanded = true;
      if (current !== null) acc.current += current, acc.hasCurrent = true;
      return acc;
    },
    { installed: 0, demanded: 0, current: 0, hasInstalled: false, hasDemanded: false, hasCurrent: false }
  );
  totalInstalledVa.textContent = formatTotal(totals.hasInstalled ? totals.installed : null);
  totalDemandedVa.textContent = formatTotal(totals.hasDemanded ? totals.demanded : null);
  totalCurrentA.textContent = formatTotal(totals.hasCurrent ? totals.current : null);
}

function quoteDsl(value) {
  return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " / " )}"`;
}

function attrsToText(attrs) {
  return Object.entries(attrs)
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => `${key}=${quoteDsl(value)}`)
    .join(" ");
}

function generateUnifilarScript(current = data) {
  const lines = [
    "# UnifilarScript v1",
    "# Edite y presione Aplicar codigo para reconstruir el plano.",
    `titulo ${quoteDsl(current.project.title)}`,
    `acometida ${quoteDsl(current.service.label)}`,
    `principal ${quoteDsl(current.service.mainBreaker)}`,
    `alimentador ${quoteDsl(current.service.feeder)}`
  ];
  const systemAttrs = attrsToText({
    tension: current.service.systemVoltage,
    fases_tierra: current.service.phasesGrounding
  });
  if (systemAttrs) lines.push(`sistema ${systemAttrs}`);
  const serviceAttrs = attrsToText({
    longitud: current.service.feederLength,
    conductor: current.service.conductorTypeInsulation,
    canalizacion: current.service.conduitTypeDiameter,
    aic_curva: current.service.mainBreakerAicCurve,
    tablero: current.service.panelBusServiceData
  });
  if (serviceAttrs) lines.push(`acometida_datos ${serviceAttrs}`);
  lines.push("");
  current.circuits.forEach((circuit) => {
    const schedule = circuit.loadSchedule || {};
    const attrs = attrsToText({
      interruptor: circuit.breaker,
      conductor: circuit.conductor,
      carga: circuit.load,
      longitud: circuit.length,
      conductor_aislamiento: circuit.conductorTypeInsulation,
      canalizacion: circuit.conduitTypeDiameter,
      aic_curva: circuit.breakerAicCurve,
      tablero: circuit.panelBusServiceData,
      fase: schedule.phase,
      tipo: schedule.loadType,
      va_instalado: schedule.installedVa,
      va_demandado: schedule.demandedVa,
      corriente: schedule.currentA,
      fp: schedule.powerFactor,
      notas: schedule.notes
    });
    lines.push(`circuito ${quoteDsl(circuit.displayName || circuit.name)} ${attrs}`.trim());
  });
  return `${lines.join("\n")}\n`;
}

function parseAttributes(text) {
  const attrs = {};
  const pattern = /([A-Za-z_][A-Za-z0-9_]*)=("(?:\\.|[^"])*"|[^\s]+)/g;
  let match;
  while ((match = pattern.exec(text))) {
    attrs[match[1].toLowerCase()] = unquoteDsl(match[2]);
  }
  return attrs;
}

function unquoteDsl(value) {
  const raw = String(value || "").trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return raw;
}

function firstQuotedText(text) {
  const match = text.match(/"((?:\\.|[^"])*)"/);
  return match ? unquoteDsl(`"${match[1]}"`) : "";
}

function attr(attrs, ...names) {
  for (const name of names) {
    const key = name.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(attrs, key)) return attrs[key];
  }
  return "";
}

function parseUnifilarScript(source) {
  const next = clone(DEFAULT_DATA);
  next.circuits = [];
  const errors = [];
  const lines = String(source || "").split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) return;
    const commandMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\b(.*)$/);
    if (!commandMatch) {
      errors.push(`Linea ${lineNumber}: instruccion no reconocida.`);
      return;
    }
    const command = commandMatch[1].toLowerCase();
    const rest = commandMatch[2].trim();
    const attrs = parseAttributes(rest);
    if (command === "titulo") {
      next.project.title = firstQuotedText(rest) || attr(attrs, "valor", "texto") || next.project.title;
      return;
    }
    if (command === "acometida") {
      next.service.label = firstQuotedText(rest) || attr(attrs, "nombre", "label") || next.service.label;
      return;
    }
    if (command === "principal") {
      next.service.mainBreaker = firstQuotedText(rest) || attr(attrs, "interruptor", "valor") || next.service.mainBreaker;
      return;
    }
    if (command === "alimentador") {
      next.service.feeder = firstQuotedText(rest) || attr(attrs, "conductor", "valor") || next.service.feeder;
      return;
    }
    if (command === "sistema") {
      next.service.systemVoltage = attr(attrs, "tension", "voltaje", "voltage") || next.service.systemVoltage;
      next.service.phasesGrounding = attr(attrs, "fases_tierra", "fases", "puesta_tierra", "tierra") || next.service.phasesGrounding;
      return;
    }
    if (command === "acometida_datos" || command === "servicio") {
      next.service.feederLength = attr(attrs, "longitud", "alimentador_longitud") || next.service.feederLength;
      next.service.conductorTypeInsulation = attr(attrs, "conductor", "conductor_aislamiento", "aislamiento") || next.service.conductorTypeInsulation;
      next.service.conduitTypeDiameter = attr(attrs, "canalizacion", "tuberia") || next.service.conduitTypeDiameter;
      next.service.mainBreakerAicCurve = attr(attrs, "aic_curva", "aic", "curva") || next.service.mainBreakerAicCurve;
      next.service.panelBusServiceData = attr(attrs, "tablero", "gabinete", "barras") || next.service.panelBusServiceData;
      return;
    }
    if (command === "circuito") {
      const name = firstQuotedText(rest) || attr(attrs, "nombre", "name");
      if (!name) {
        errors.push(`Linea ${lineNumber}: circuito requiere nombre entre comillas.`);
        return;
      }
      const displayName = name.replace(/\s+\/\s+/g, "\n");
      next.circuits.push(createCircuit({
        id: `c${next.circuits.length + 1}`,
        name: displayName.replace(/\n/g, " "),
        displayName,
        breaker: attr(attrs, "interruptor", "breaker", "proteccion"),
        conductor: attr(attrs, "conductor", "conductores"),
        load: attr(attrs, "carga", "load"),
        length: attr(attrs, "longitud", "length"),
        conductorTypeInsulation: attr(attrs, "conductor_aislamiento", "aislamiento"),
        conduitTypeDiameter: attr(attrs, "canalizacion", "tuberia"),
        breakerAicCurve: attr(attrs, "aic_curva", "aic", "curva"),
        panelBusServiceData: attr(attrs, "tablero", "gabinete", "barras"),
        loadSchedule: {
          phase: attr(attrs, "fase", "phase"),
          loadType: attr(attrs, "tipo", "tipo_carga"),
          installedVa: attr(attrs, "va_instalado", "va", "instalado"),
          demandedVa: attr(attrs, "va_demandado", "demandado"),
          currentA: attr(attrs, "corriente", "a", "amp"),
          powerFactor: attr(attrs, "fp", "factor_potencia"),
          notes: attr(attrs, "notas", "observaciones")
        },
        status: "Dato capturado o por confirmar en campo"
      }, next.circuits.length));
      return;
    }
    errors.push(`Linea ${lineNumber}: comando '${command}' no soportado.`);
  });
  if (errors.length) throw new Error(errors.join("\n"));
  if (!next.circuits.length) throw new Error("El codigo debe incluir al menos una linea circuito.");
  return next;
}

function setDslStatus(message, mode = "") {
  if (!dslStatus) return;
  dslStatus.textContent = message;
  dslStatus.className = `dsl-status ${mode}`.trim();
}

function syncDslEditor(force = false) {
  if (!dslEditor) return;
  if (!force && document.activeElement === dslEditor) return;
  dslEditor.value = generateUnifilarScript(data);
}

function applyDslFromEditor() {
  try {
    data = parseUnifilarScript(dslEditor.value);
    selectedCircuitId = data.circuits[0]?.id || null;
    persist();
    renderAll();
    setDslStatus(`Plano reconstruido: ${data.circuits.length} circuito(s).`, "ok");
  } catch (error) {
    setDslStatus(error.message, "error");
  }
}

function downloadDsl() {
  const source = generateUnifilarScript(data);
  downloadBlob(new Blob([source], { type: "text/plain;charset=utf-8" }), "diagrama.unifilar");
  setDslStatus("Archivo .unifilar generado.", "ok");
}

function renderAll(rebuildEditor = true) {
  drawDiagram();
  renderSummary();
  renderLoadSchedule();
  syncDslEditor(false);
  if (rebuildEditor) renderEditor();
}

function bindTopLevelInputs() {
  document.getElementById("serviceLabel").addEventListener("input", (event) => {
    data.service.label = event.target.value;
    renderAll(false);
  });
  document.getElementById("mainBreaker").addEventListener("input", (event) => {
    data.service.mainBreaker = event.target.value;
    renderAll(false);
  });
  document.getElementById("mainFeeder").addEventListener("input", (event) => {
    data.service.feeder = event.target.value;
    renderAll(false);
  });
  [
    ["systemVoltage", "systemVoltage"],
    ["phasesGrounding", "phasesGrounding"],
    ["feederLength", "feederLength"],
    ["conductorTypeInsulation", "serviceConductorTypeInsulation"],
    ["conduitTypeDiameter", "serviceConduitTypeDiameter"],
    ["mainBreakerAicCurve", "mainBreakerAicCurve"],
    ["panelBusServiceData", "panelBusServiceData"]
  ].forEach(([key, id]) => {
    document.getElementById(id).addEventListener("input", (event) => {
      data.service[key] = event.target.value;
      renderAll(false);
    });
  });
  document.getElementById("applyDslBtn").addEventListener("click", applyDslFromEditor);
  document.getElementById("syncDslBtn").addEventListener("click", () => {
    syncDslEditor(true);
    setDslStatus("Codigo generado desde el formulario actual.", "ok");
  });
  document.getElementById("downloadDslBtn").addEventListener("click", downloadDsl);
  document.getElementById("saveBtn").addEventListener("click", persist);
  document.getElementById("resetBtn").addEventListener("click", () => {
    data = clone(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    selectedCircuitId = data.circuits[0].id;
    renderAll();
    syncDslEditor(true);
    setDslStatus("Codigo restaurado desde valores base.", "ok");
    setStatus("Valores restaurados");
  });
  document.getElementById("svgBtn").addEventListener("click", downloadSvg);
  document.getElementById("pdfBtn").addEventListener("click", downloadPdf);
}

function downloadSvg() {
  const source = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([source], { type: "image/svg+xml;charset=utf-8" }), "diagrama_unifilar_editable.svg");
  setStatus("SVG descargado");
}

function downloadPdf() {
  const pdfBytes = buildPdf(data);
  downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "diagrama_unifilar_dinamico.pdf");
  setStatus("PDF generado");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function pdfEscape(value) {
  return String(value)
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdf(current) {
  const commands = [];
  const line = (x1, y1, x2, y2) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  const rect = (x, y, w, h) => commands.push(`${x} ${y} ${w} ${h} re S`);
  const text = (value, x, y, size = 10, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET`);
  };
  const centered = (value, x, y, size = 10, font = "F1") => {
    const width = String(value).length * size * 0.48;
    text(value, Math.round(x - width / 2), y, size, font);
  };
  const box = (x, y, w, h, label, size = 8) => {
    rect(x, y, w, h);
    const lines = String(label).split("\n");
    const start = y + h / 2 + (lines.length - 1) * size * 0.55;
    lines.forEach((item, idx) => centered(item, x + w / 2, Math.round(start - idx * (size + 4)), size));
  };
  const wrappedText = (value, x, y, maxChars, size = 6.5) => {
    wrapText(value, maxChars).split("\n").forEach((item, idx) => text(item, x, y - idx * (size + 2), size));
  };
  const breaker = (x, y, label) => {
    text("(", x - 17, y - 8, 28);
    centered(label, x + 12, y, 9, "F2");
  };

  commands.push("0.95 w");
  centered(current.project.title, 396, 558, 25, "F2");
  box(345, 505, 102, 28, current.service.label, 9);
  line(396, 505, 396, 474);
  breaker(386, 454, current.service.mainBreaker);
  line(396, 432, 396, 354);
  wrappedText(current.service.feeder, 415, 430, 24, 7.5);
  line(88, 354, 704, 354);

  const start = 88;
  const end = 704;
  const gap = (end - start) / (current.circuits.length - 1);
  current.circuits.forEach((circuit, idx) => {
    const x = Math.round(start + gap * idx);
    line(x, 354, x, 326);
    wrappedText(circuit.conductor, x + 12, 324, 16, 5.8);
    breaker(x - 3, 290, circuit.breaker);
    line(x, 274, x + 4, 160);
    const boxW = idx < 3 ? 100 : 76;
    const boxH = idx < 3 ? 38 : 23;
    box(Math.round(x - boxW / 2 + 4), 126, boxW, boxH, circuit.displayName, 7);
  });

  text("Datos tecnicos:", 42, 102, 8, "F2");
  text(`Tension: ${pdfEscape(valueOrPending(current.service.systemVoltage))}`, 42, 90, 7);
  text(`Fases/tierra: ${pdfEscape(valueOrPending(current.service.phasesGrounding))}`, 210, 90, 7);
  text(`Alimentador: ${pdfEscape(valueOrPending(current.service.feederLength))}`, 420, 90, 7);
  text(`Conductor/aislamiento: ${pdfEscape(valueOrPending(current.service.conductorTypeInsulation))}`, 42, 78, 7);
  text(`Canalizacion: ${pdfEscape(valueOrPending(current.service.conduitTypeDiameter))}`, 300, 78, 7);
  text(`AIC/curva principal: ${pdfEscape(valueOrPending(current.service.mainBreakerAicCurve))}`, 540, 78, 7);
  text(`Tablero/acometida: ${pdfEscape(valueOrPending(current.service.panelBusServiceData))}`, 42, 66, 7);
  text("Notas: datos transcritos de imagen. Sin calculos electricos automaticos.", 42, 50, 7);
  text(`Generado: ${new Date().toLocaleDateString("es-MX")}`, 650, 32, 7);

  const stream = commands.join("\n");
  const commands2 = [];
  const p2line = (x1, y1, x2, y2) => commands2.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  const p2rect = (x, y, w, h) => commands2.push(`${x} ${y} ${w} ${h} re S`);
  const p2text = (value, x, y, size = 8, font = "F1") => {
    commands2.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET`);
  };
  const p2cell = (value, x, y, w, h, size = 6.2, font = "F1") => {
    p2rect(x, y, w, h);
    const lines = wrapText(valueOrPending(value), Math.max(8, Math.floor(w / (size * 0.45)))).split("\n").slice(0, 2);
    lines.forEach((item, idx) => p2text(item, x + 3, y + h - 9 - idx * (size + 2), size, font));
  };
  const cols = [112, 42, 88, 72, 72, 58, 46, 206];
  const startX2 = 36;
  const topY2 = 548;
  let x2 = startX2;
  commands2.push("0.75 w");
  p2text("CUADRO DE CARGAS", 36, 574, 16, "F2");
  p2text("Suma simple de valores numericos capturados; no calcula demanda, caida de tension ni capacidad de conductores.", 36, 558, 7);
  ["Circuito", "Fase", "Tipo", "VA inst.", "VA dem.", "A", "FP", "Observaciones"].forEach((head, idx) => {
    p2cell(head, x2, topY2, cols[idx], 18, 6.2, "F2");
    x2 += cols[idx];
  });
  let y2 = topY2 - 18;
  current.circuits.forEach((circuit, idx) => {
    const schedule = circuit.loadSchedule || {};
    x2 = startX2;
    [
      `${idx + 1}. ${circuit.name}`,
      schedule.phase,
      schedule.loadType,
      schedule.installedVa,
      schedule.demandedVa,
      schedule.currentA,
      schedule.powerFactor,
      schedule.notes
    ].forEach((value, colIdx) => {
      p2cell(value, x2, y2, cols[colIdx], 24, 5.8);
      x2 += cols[colIdx];
    });
    y2 -= 24;
  });
  const sumField = (field) => {
    let total = 0;
    let hasValue = false;
    current.circuits.forEach((circuit) => {
      const value = numericValue((circuit.loadSchedule || {})[field]);
      if (value !== null) total += value, hasValue = true;
    });
    return hasValue ? String(Math.round(total * 100) / 100) : "Por definir";
  };
  p2text(`Total VA instalado: ${sumField("installedVa")}`, 36, y2 - 8, 8, "F2");
  p2text(`Total VA demandado: ${sumField("demandedVa")}`, 220, y2 - 8, 8, "F2");
  p2text(`Total corriente A: ${sumField("currentA")}`, 410, y2 - 8, 8, "F2");
  p2text("Pagina 2 de 2", 704, 32, 7);
  const stream2 = commands2.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 8 0 R >>",
    `<< /Length ${stream2.length} >>\nstream\n${stream2}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array([...pdf].map((char) => char.charCodeAt(0)));
}

bindTopLevelInputs();
renderAll();
