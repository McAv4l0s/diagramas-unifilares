import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function loadScriptApi() {
  let source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  source = source
    .replace(/^import.*$/gm, "")
    .replace(/^const h = React\.createElement;$/m, "const h = () => null;");
  source = source.slice(0, source.indexOf("\ncreateRoot("));
  source += "\nreturn { DEFAULT_DATA, emptyData, generateScript, parseScript, buildPdfDocument, buildPdfFromScript, appReducer };";
  return Function(source)();
}

const { DEFAULT_DATA, emptyData, generateScript, parseScript, buildPdfDocument, buildPdfFromScript, appReducer } = loadScriptApi();
const pdfText = bytes => new TextDecoder().decode(bytes);

test("generated UnifilarScript preserves complete captured data", () => {
  const generated = generateScript(DEFAULT_DATA);
  const parsed = parseScript(generated);

  assert.equal(parsed.project.reviewedBy, DEFAULT_DATA.project.reviewedBy);
  assert.equal(parsed.project.drawingNumber, DEFAULT_DATA.project.drawingNumber);
  assert.equal(parsed.project.standards, DEFAULT_DATA.project.standards);
  assert.equal(parsed.service.panelBusServiceData, DEFAULT_DATA.service.panelBusServiceData);
  assert.equal(parsed.system.demandFactor, DEFAULT_DATA.system.demandFactor);
  assert.equal(parsed.system.powerFactor, DEFAULT_DATA.system.powerFactor);
  assert.equal(parsed.panel.mainDevice, DEFAULT_DATA.panel.mainDevice);
  assert.equal(parsed.panel.groundBar, DEFAULT_DATA.panel.groundBar);
  assert.equal(parsed.grounding.groundingConductor, DEFAULT_DATA.grounding.groundingConductor);
  assert.equal(parsed.stps.workRisk, DEFAULT_DATA.stps.workRisk);
  assert.equal(parsed.circuits.length, DEFAULT_DATA.circuits.length);
  assert.equal(parsed.circuits[0].conduitFill, DEFAULT_DATA.circuits[0].conduitFill);
  assert.equal(parsed.circuits[0].status, DEFAULT_DATA.circuits[0].status);
  assert.equal(parsed.circuits[0].loadSchedule.notes, DEFAULT_DATA.circuits[0].loadSchedule.notes);
});

test("parser starts from blank data for new one-line diagrams", () => {
  const parsed = parseScript(`
titulo "DIAGRAMA NUEVO"
circuito "Contacto nuevo" interruptor="1x20 A" conductor="2 cal.12 Cu" fase="L1-N" va_instalado="1000"
`);
  const blank = emptyData();

  assert.equal(parsed.project.title, "DIAGRAMA NUEVO");
  assert.equal(parsed.project.projectName, blank.project.projectName);
  assert.equal(parsed.service.label, blank.service.label);
  assert.equal(parsed.circuits.length, 1);
  assert.equal(parsed.circuits[0].displayName, "Contacto nuevo");
  assert.equal(parsed.circuits[0].loadSchedule.installedVa, "1000");
});

test("parser accepts legacy UnifilarScript aliases", () => {
  const parsed = parseScript(`
titulo "PRUEBA LEGACY"
sistema tension="220/127 V" fases="1F+N+T" demanda="12 kVA"
tablero "TG" barras="100 A" material="Cobre" interruptiva="10 kAIC"
puesta_tierra groundingConductor="cal.12 Cu" bonding="bonded"
stps workRisk="medio" arcFlashLabel="pendiente" fireRiskArea="ordinaria" emergencyNotes="senalizar"
circuito "C1" interruptor="1x20 A" conductor="2 cal.12" fase="L1-N" va_instalado="1000"
`);

  assert.equal(parsed.system.maxDemand, "12 kVA");
  assert.equal(parsed.panel.busAmps, "100 A");
  assert.equal(parsed.panel.interruptingRating, "10 kAIC");
  assert.equal(parsed.grounding.groundingConductor, "cal.12 Cu");
  assert.equal(parsed.stps.workRisk, "medio");
  assert.equal(parsed.stps.arcFlashLabel, "pendiente");
});

test("simplified PDF is schematic-only without load schedule", () => {
  const text = pdfText(buildPdfDocument(DEFAULT_DATA, "simple"));

  assert.match(text, /Diagrama unifilar simplificado/);
  assert.doesNotMatch(text, /Circuitos y cuadro general de cargas/);
  assert.doesNotMatch(text, /VA instalado/);
  assert.doesNotMatch(text, /NOM-002-STPS-2010/);
});

test("complete PDF includes load schedule and Mexican normative summary", () => {
  const text = pdfText(buildPdfDocument(DEFAULT_DATA, "complete"));

  assert.match(text, /Resumen tecnico y marco normativo mexicano/);
  assert.match(text, /Circuitos y cuadro general de cargas/);
  assert.match(text, /NOM-001-SEDE-2012/);
  assert.match(text, /NOM-002-STPS-2010/);
  assert.match(text, /NOM-029-STPS-2011/);
  assert.match(text, /Total VA instalado/);
});

test("UnifilarScript download path builds a PDF instead of text output", () => {
  const script = generateScript(DEFAULT_DATA);
  const text = pdfText(buildPdfFromScript(script, "complete"));

  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /Resumen tecnico y marco normativo mexicano/);
  assert.match(text, /Circuitos y cuadro general de cargas/);
});

test("redux-style reducer centralizes button state actions", () => {
  const initial = { data: emptyData(), history: [], active: "project", script: "", scriptDirty: false, status: "Listo" };
  const edited = appReducer(initial, { type: "data/commit", updater: data => ({ ...data, project: { ...data.project, projectName: "Proyecto X" } }) });
  const scripted = appReducer(edited, { type: "script/edit", value: "titulo \"Manual\"" });
  const restored = appReducer(scripted, { type: "history/undo" });

  assert.equal(edited.data.project.projectName, "Proyecto X");
  assert.equal(edited.history.length, 1);
  assert.equal(scripted.scriptDirty, true);
  assert.equal(restored.data.project.projectName, "");
});
