/**
 * Aggregates E17 evidence into evidence/e17/cross-engine-matrix.json and
 * summary.json. Reads only files written by tests/e2e/cross-engine.spec.ts.
 *
 * Agreement semantics: a matrix row is UNANIMOUS when every installed engine
 * produced the SAME interpretation-match set for that cell. Unanimity across
 * engines establishes multi-engine BROWSER behavior — never standards
 * provenance.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const E = resolve(here, "..", "evidence", "e17");
const ENGINES = ["chromium", "firefox", "webkit"];

const readJson = (f) => JSON.parse(readFileSync(resolve(E, f), "utf8"));

const files = readdirSync(E);
const byEngineCase = (prefix) =>
  Object.fromEntries(
    ENGINES.map((e) => {
      const f = files.find((x) => x === prefix.replace("<engine>", e));
      return [e, f ? readJson(f) : null];
    }),
  );

// ---------------------------------------------------------------------------
// Geometry matrix (E15 cells + max-variant cells)
// ---------------------------------------------------------------------------
const matrix = {};
let cellsMeasured = 0;
for (const f of files.filter((x) => x.startsWith("case-e15-") || x.startsWith("case-max-"))) {
  const data = readJson(f);
  const engine = data.meta.engine;
  for (const cell of data.cells) {
    const key = `${cell.variant}@${cell.regionKey}|${cell.embedding}`;
    matrix[key] ??= {};
    matrix[key][engine] = { verdict: cell.verdict, matches: cell.matches };
    cellsMeasured++;
  }
}

let unanimous = 0;
const divergentRows = [];
const incompleteRows = [];
for (const [key, perEngine] of Object.entries(matrix)) {
  const enginesPresent = ENGINES.filter((e) => perEngine[e]);
  if (enginesPresent.length < ENGINES.length) {
    incompleteRows.push({ key, enginesPresent });
    continue;
  }
  const sig = (r) => JSON.stringify([...r.matches].sort());
  const all = enginesPresent.map((e) => sig(perEngine[e]));
  if (new Set(all).size === 1) {
    unanimous++;
    perEngine.agreement = "unanimous";
  } else {
    divergentRows.push(key);
    perEngine.agreement = "divergent";
  }
}

// ---------------------------------------------------------------------------
// E16 probe outcomes
// ---------------------------------------------------------------------------
const e16 = {};
for (const slug of ["case01-control", "case03-collapse", "case05-separation", "case06-fit", "case07-verdicts"]) {
  e16[slug] = byEngineCase(`e16-<engine>-${slug}.json`);
}
const e16Agreement = {
  case03_novbBand_unanimous:
    new Set(ENGINES.map((e) => e16["case03-collapse"][e]?.probes?.novbStretchedBandNearCanvas38)).size === 1,
  case03_collapsedBand_unanimous:
    new Set(ENGINES.map((e) => e16["case03-collapse"][e]?.probes?.leafParCollapsedBandNearCanvas441)).size === 1,
  case05_leftRuns_unanimous: (() => {
    const sig = (d) => JSON.stringify((d?.leftFrameRuns ?? []).map((x) => +x.toFixed(3)));
    return new Set(ENGINES.map((e) => sig(e16["case05-separation"][e]))).size === 1;
  })(),
  case06_compositeNaturals_unanimous: (() => {
    const sig = (d) =>
      JSON.stringify((d?.compositeImgIntrinsicSizes ?? []).map((i) => `${i.naturalWidth}x${i.naturalHeight}`));
    return new Set(ENGINES.map((e) => sig(e16["case06-fit"][e]))).size === 1;
  })(),
  case07_designedDivergencePreserved_allEngines: ENGINES.every((e) => {
    const d = e16["case07-verdicts"][e];
    const want = JSON.stringify(["a!=blind", "a!=native", "blind==native"]);
    return d && JSON.stringify(d.blindVerdicts) === want && JSON.stringify(d.rendererAVerdicts) === want;
  }),
};

// ---------------------------------------------------------------------------
// Intrinsics comparison (raw values)
// ---------------------------------------------------------------------------
const intrinsics = Object.fromEntries(ENGINES.map((e) => [e, byEngineCase(`intrinsics-<engine>.json`)[e] ?? null]));
const intrinsicsDivergentVariants = [];
{
  const perVariant = {};
  for (const e of ENGINES) {
    const d = intrinsics[e];
    if (!d) continue;
    for (const [v, dims] of Object.entries({ ...d.e15Variants, ...d.e17Variants })) {
      perVariant[v] ??= {};
      perVariant[v][e] = `${dims.w}x${dims.h}`;
    }
  }
  for (const [v, per] of Object.entries(perVariant)) {
    if (new Set(Object.values(per)).size > 1) intrinsicsDivergentVariants.push({ variant: v, per });
  }
}

// ---------------------------------------------------------------------------
// Engine metadata + per-engine cell stats
// ---------------------------------------------------------------------------
const enginesMeta = {};
const cellStats = {};
for (const e of ENGINES) {
  const anyCase = files.find((x) => x.includes(e) && x.startsWith("case-"));
  if (anyCase) {
    const m = readJson(anyCase).meta;
    enginesMeta[e] = { browserVersion: m.browserVersion, userAgent: m.userAgent };
  }
  let agree = 0,
    diverge = 0,
    unmeasured = 0;
  for (const f of files.filter((x) => x.startsWith("case-") && x.includes(e))) {
    for (const c of readJson(f).cells) {
      if (c.verdict === "agree") agree++;
      else if (c.verdict === "diverge") diverge++;
      else unmeasured++;
    }
  }
  cellStats[e] = { agree, diverge, unmeasured };
}

const summary = {
  experiment: "E17/N1 cross-engine replication of E15/E16 [BROWSER]-classified rows",
  plan: "research/next-session-plan.md Stage 1",
  note: "Cross-engine agreement establishes multi-engine browser behavior only; it MUST NOT be read as standards provenance.",
  generatedAt: new Date().toISOString(),
  engines: enginesMeta,
  cellStats,
  totals: {
    distinctMatrixCells: Object.keys(matrix).length,
    cellMeasurements: cellsMeasured,
    unanimousRows: unanimous,
    divergentRows: divergentRows.length,
    incompleteRows: incompleteRows.length,
  },
  divergentRows,
  incompleteRows,
  e16Agreement,
  intrinsicsDivergentVariants,
};

writeFileSync(resolve(E, "cross-engine-matrix.json"), JSON.stringify(matrix, null, 2) + "\n", "utf8");
writeFileSync(resolve(E, "summary.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");
console.log(
  `cross-engine-matrix.json: ${Object.keys(matrix).length} rows (${unanimous} unanimous, ${divergentRows.length} divergent, ${incompleteRows.length} incomplete)`,
);
console.log(`summary.json written. e16Agreement=${JSON.stringify(e16Agreement)}`);
if (intrinsicsDivergentVariants.length) console.log(`intrinsics divergences: ${JSON.stringify(intrinsicsDivergentVariants)}`);
