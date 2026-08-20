import { test, expect } from "@playwright/test";
import { gotoLab, expectParityClean, record } from "./utils.ts";

/**
 * Renderer parity. For experiments whose Renderer-B reference uses the SAME SVG
 * payloads, `resolvedA` (from the manifest) must equal `resolvedB` (direct
 * model) field-by-field. This is the core "does the standards representation
 * carry enough information" test. Exp4 is checked geometrically in exp4.spec.
 */
const RAW_PARITY_EXPS = ["1", "2", "3", "5a", "5b", "5c", "6", "7"];

for (const exp of RAW_PARITY_EXPS) {
  test(`parity: exp ${exp} renderer A resolved set == renderer B`, async ({ page }) => {
    await gotoLab(page, { exp });
    const clean = await expectParityClean(page);
    const parity = await page.evaluate(() => (window as any).__lab.parity());
    record(`parity-${exp}`, { clean, diffs: parity.flat().filter((x: unknown) => x) });
    expect(clean, `parity diffs for exp ${exp}: ${parity.join("\n")}`).toBe(true);
  });
}