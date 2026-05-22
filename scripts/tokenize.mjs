#!/usr/bin/env node
/**
 * One-shot codemod that rewrites hardcoded Tailwind color utilities to the
 * new token-driven utilities defined in app/globals.css.
 *
 * Run order matters — longest, most-specific keys are processed first so
 * `text-stone-500` is rewritten before `text-stone-5` (which doesn't exist
 * here, but illustrates the principle).
 *
 * This script touches:
 *   - components/{listings,agent,landing,layout,messaging,auth,reservations,admin}/**
 *   - app/(public|agent|admin|buyer|auth)/**
 * It skips:
 *   - components/ui/** (already migrated by hand)
 *   - components/illustrations/** (embedded SVG hex colors — separate pass)
 *   - components/theme/** (own colors are deliberate)
 *   - node_modules, .next, etc.
 *
 * Safe to re-run: idempotent (target tokens never match the patterns again).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const INCLUDE_GLOBS = [
  "components/listings",
  "components/agent",
  "components/landing",
  "components/layout",
  "components/messaging",
  "components/auth",
  "components/reservations",
  "components/admin",
  "app",
];

const SKIP_PATH_PARTS = new Set([
  "node_modules",
  ".next",
  ".git",
  "components/ui",
  "components/illustrations",
  "components/theme",
]);

// Order: longest / most specific first.
// Each entry is [searchRegex, replacement].
const RULES = [
  // ----- emerald -----
  [/\bbg-emerald-50\b/g, "bg-primary-soft"],
  [/\bbg-emerald-100\b/g, "bg-primary-soft"],
  [/\bbg-emerald-200\b/g, "bg-primary-soft"],
  [/\bbg-emerald-500\b/g, "bg-primary"],
  [/\bbg-emerald-600\b/g, "bg-primary"],
  [/\bbg-emerald-700\b/g, "bg-primary"],
  [/\bbg-emerald-800\b/g, "bg-primary-hover"],
  [/\bbg-emerald-900\b/g, "bg-primary-hover"],
  [/\bhover:bg-emerald-50\b/g, "hover:bg-primary-soft"],
  [/\bhover:bg-emerald-100\b/g, "hover:bg-primary-soft"],
  [/\bhover:bg-emerald-600\b/g, "hover:bg-primary-hover"],
  [/\bhover:bg-emerald-700\b/g, "hover:bg-primary-hover"],
  [/\bhover:bg-emerald-800\b/g, "hover:bg-primary-hover"],
  [/\bhover:bg-emerald-900\b/g, "hover:bg-primary-hover"],
  [/\bactive:bg-emerald-900\b/g, "active:bg-primary-hover"],
  [/\bgroup-hover:text-emerald-700\b/g, "group-hover:text-primary"],
  [/\btext-emerald-50\b/g, "text-primary-foreground"],
  [/\btext-emerald-100\b/g, "text-primary-foreground"],
  [/\btext-emerald-200\b/g, "text-primary-foreground"],
  [/\btext-emerald-600\b/g, "text-primary"],
  [/\btext-emerald-700\b/g, "text-primary"],
  [/\btext-emerald-800\b/g, "text-primary-soft-foreground"],
  [/\btext-emerald-900\b/g, "text-primary-soft-foreground"],
  [/\btext-emerald-950\b/g, "text-primary-soft-foreground"],
  [/\bhover:text-emerald-700\b/g, "hover:text-primary"],
  [/\bhover:text-emerald-800\b/g, "hover:text-primary"],
  [/\bborder-emerald-100\b/g, "border-primary/10"],
  [/\bborder-emerald-200\b/g, "border-primary/20"],
  [/\bborder-emerald-300\b/g, "border-primary/30"],
  [/\bborder-emerald-500\b/g, "border-primary"],
  [/\bborder-emerald-700\b/g, "border-primary"],
  [/\bhover:border-emerald-500\b/g, "hover:border-primary"],
  [/\bring-emerald-100\b/g, "ring-primary/10"],
  [/\bring-emerald-200\b/g, "ring-primary/20"],
  [/\bring-emerald-300\b/g, "ring-primary/30"],
  [/\bring-emerald-500\b/g, "ring-primary"],
  [/\bring-emerald-700\b/g, "ring-primary"],
  [/\bfocus:ring-emerald-500\b/g, "focus:ring-primary"],
  [/\bfocus:border-emerald-500\b/g, "focus:border-primary"],
  [/\bfocus-visible:ring-emerald-500\b/g, "focus-visible:ring-primary"],
  [/\bfocus-visible:border-emerald-500\b/g, "focus-visible:border-primary"],
  [/\bfrom-emerald-50\b/g, "from-primary-soft"],
  [/\bfrom-emerald-500\b/g, "from-primary"],
  [/\bfrom-emerald-600\b/g, "from-primary"],
  [/\bfrom-emerald-700\b/g, "from-primary"],
  [/\bfrom-emerald-800\b/g, "from-primary-hover"],
  [/\bvia-emerald-50\b/g, "via-primary-soft"],
  [/\bvia-emerald-500\b/g, "via-primary"],
  [/\bvia-emerald-700\b/g, "via-primary"],
  [/\bvia-emerald-800\b/g, "via-primary-hover"],
  [/\bto-emerald-50\b/g, "to-primary-soft"],
  [/\bto-emerald-700\b/g, "to-primary"],
  [/\bto-emerald-800\b/g, "to-primary-hover"],

  // ----- amber -----
  [/\bbg-amber-50\b/g, "bg-accent-soft"],
  [/\bbg-amber-100\b/g, "bg-accent-soft"],
  [/\bbg-amber-200\b/g, "bg-accent-soft"],
  [/\bbg-amber-400\b/g, "bg-accent"],
  [/\bbg-amber-500\b/g, "bg-accent"],
  [/\bbg-amber-600\b/g, "bg-accent"],
  [/\bhover:bg-amber-100\b/g, "hover:bg-accent-soft"],
  [/\bhover:bg-amber-600\b/g, "hover:bg-accent-hover"],
  [/\btext-amber-50\b/g, "text-accent-foreground"],
  [/\btext-amber-100\b/g, "text-accent-foreground"],
  [/\btext-amber-300\b/g, "text-accent"],
  [/\btext-amber-600\b/g, "text-accent"],
  [/\btext-amber-700\b/g, "text-accent"],
  [/\btext-amber-800\b/g, "text-accent-soft-foreground"],
  [/\btext-amber-900\b/g, "text-accent-soft-foreground"],
  [/\bborder-amber-100\b/g, "border-accent/10"],
  [/\bborder-amber-200\b/g, "border-accent/20"],
  [/\bborder-amber-300\b/g, "border-accent/30"],
  [/\bborder-amber-500\b/g, "border-accent"],
  [/\bring-amber-100\b/g, "ring-accent/10"],
  [/\bring-amber-200\b/g, "ring-accent/20"],
  [/\bring-amber-300\b/g, "ring-accent/30"],
  [/\bfrom-amber-50\b/g, "from-accent-soft"],
  [/\bfrom-amber-100\b/g, "from-accent-soft"],
  [/\bfrom-amber-500\b/g, "from-accent"],
  [/\bvia-amber-50\b/g, "via-accent-soft"],
  [/\bvia-amber-500\b/g, "via-accent"],
  [/\bto-amber-50\b/g, "to-accent-soft"],
  [/\bto-amber-500\b/g, "to-accent"],

  // ----- stone (neutrals) -----
  [/\bbg-stone-50\b/g, "bg-surface-2"],
  [/\bbg-stone-100\b/g, "bg-surface-2"],
  [/\bbg-stone-200\b/g, "bg-surface-3"],
  [/\bbg-stone-300\b/g, "bg-surface-3"],
  [/\bbg-stone-800\b/g, "bg-foreground"],
  [/\bbg-stone-900\b/g, "bg-foreground"],
  [/\bhover:bg-stone-50\b/g, "hover:bg-surface-2"],
  [/\bhover:bg-stone-100\b/g, "hover:bg-surface-2"],
  [/\bhover:bg-stone-200\b/g, "hover:bg-surface-3"],
  [/\btext-stone-50\b/g, "text-background"],
  [/\btext-stone-300\b/g, "text-text-subtle"],
  [/\btext-stone-400\b/g, "text-text-subtle"],
  [/\btext-stone-500\b/g, "text-muted-foreground"],
  [/\btext-stone-600\b/g, "text-muted-foreground"],
  [/\btext-stone-700\b/g, "text-foreground"],
  [/\btext-stone-800\b/g, "text-foreground"],
  [/\btext-stone-900\b/g, "text-foreground"],
  [/\bhover:text-stone-700\b/g, "hover:text-foreground"],
  [/\bhover:text-stone-900\b/g, "hover:text-foreground"],
  [/\bborder-stone-100\b/g, "border-border"],
  [/\bborder-stone-200\b/g, "border-border"],
  [/\bborder-stone-300\b/g, "border-input"],
  [/\bborder-stone-400\b/g, "border-input"],
  [/\bborder-stone-700\b/g, "border-foreground/40"],
  [/\bhover:border-stone-400\b/g, "hover:border-muted-foreground/40"],
  [/\bring-stone-100\b/g, "ring-border"],
  [/\bring-stone-200\b/g, "ring-border"],
  [/\bring-stone-800\b/g, "ring-foreground/40"],
  [/\bfrom-stone-50\b/g, "from-surface-2"],
  [/\bfrom-stone-100\b/g, "from-surface-2"],
  [/\bfrom-stone-900\b/g, "from-foreground"],
  [/\bvia-stone-50\b/g, "via-surface-2"],
  [/\bvia-stone-100\b/g, "via-surface-2"],
  [/\bto-stone-50\b/g, "to-surface-2"],
  [/\bto-stone-100\b/g, "to-surface-2"],
  [/\bto-stone-900\b/g, "to-foreground"],

  // ----- red (danger) -----
  [/\bbg-red-50\b/g, "bg-danger-soft"],
  [/\bbg-red-100\b/g, "bg-danger-soft"],
  [/\bbg-red-500\b/g, "bg-danger"],
  [/\bbg-red-600\b/g, "bg-danger"],
  [/\bbg-red-700\b/g, "bg-danger"],
  [/\bhover:bg-red-700\b/g, "hover:opacity-90"],
  [/\btext-red-500\b/g, "text-danger"],
  [/\btext-red-600\b/g, "text-danger"],
  [/\btext-red-700\b/g, "text-danger-soft-foreground"],
  [/\btext-red-800\b/g, "text-danger-soft-foreground"],
  [/\btext-red-900\b/g, "text-danger-soft-foreground"],
  [/\bborder-red-200\b/g, "border-danger/20"],
  [/\bborder-red-500\b/g, "border-danger"],
  [/\bring-red-100\b/g, "ring-danger/10"],
  [/\bring-red-200\b/g, "ring-danger/20"],

  // ----- rose (variant of red used in a few spots) -----
  [/\btext-rose-500\b/g, "text-danger"],
  [/\btext-rose-600\b/g, "text-danger"],
  [/\btext-rose-700\b/g, "text-danger-soft-foreground"],
  [/\bbg-rose-50\b/g, "bg-danger-soft"],
  [/\bbg-rose-100\b/g, "bg-danger-soft"],

  // ----- white surface helpers -----
  // `bg-white` on cards/panels → bg-card. Stay conservative: only target the
  // most common phrasing patterns.
  [/\bbg-white\/95\b/g, "bg-card/95"],
  [/\bbg-white\/90\b/g, "bg-card/90"],
  [/\bbg-white\/85\b/g, "bg-card/85"],
  [/\bbg-white\/80\b/g, "bg-card/80"],
  [/\bbg-white\/70\b/g, "bg-card/70"],

  // ----- second-pass clean-ups (gradients and divides the bulk pass missed) -----
  [/\bdivide-stone-100\b/g, "divide-border"],
  [/\bdivide-stone-200\b/g, "divide-border"],
  [/\bfill-amber-500\b/g, "fill-accent"],
  [/\btext-amber-500\b/g, "text-accent"],
  [/\bhover:border-emerald-400\b/g, "hover:border-primary"],
  [/\bborder-emerald-400\b/g, "border-primary"],
  [/\bring-amber-500\b/g, "ring-accent"],
  [/\baccent-emerald-700\b/g, "[accent-color:var(--primary)]"],
  // bg-white without a fractional alpha — don't capture bg-white/10 etc.
  [/\bbg-white\b(?!\/)/g, "bg-card"],
  [/\btext-stone-100\b/g, "text-white/90"],
  [/\btext-stone-200\b/g, "text-white/80"],
  [/\bvia-stone-900\/30\b/g, "via-black/30"],
  [/\bvia-emerald-100\b/g, "via-primary-soft"],
  [/\bfrom-emerald-100\b/g, "from-primary-soft"],
  [/\bto-emerald-100\b/g, "to-primary-soft"],
  [/\bto-amber-600\b/g, "to-accent"],
  [/\bring-stone-900\b/g, "ring-foreground"],
  [/\bborder-stone-900\b/g, "border-foreground"],
  [/\bbg-emerald-900\b/g, "bg-primary-hover"],
  [/\bto-emerald-900\b/g, "to-primary-hover"],

  // ----- neutral (Tailwind's other neutral family used in a few spots) -----
  [/\bbg-neutral-50\b/g, "bg-surface-2"],
  [/\bbg-neutral-100\b/g, "bg-surface-2"],
  [/\bbg-neutral-200\b/g, "bg-surface-3"],
  [/\bbg-neutral-900\b/g, "bg-foreground"],
  [/\bhover:bg-neutral-100\b/g, "hover:bg-surface-2"],
  [/\btext-neutral-300\b/g, "text-text-subtle"],
  [/\btext-neutral-400\b/g, "text-text-subtle"],
  [/\btext-neutral-500\b/g, "text-muted-foreground"],
  [/\btext-neutral-600\b/g, "text-muted-foreground"],
  [/\btext-neutral-700\b/g, "text-foreground"],
  [/\btext-neutral-900\b/g, "text-foreground"],
  [/\bborder-neutral-100\b/g, "border-border"],
  [/\bborder-neutral-200\b/g, "border-border"],
  [/\bborder-neutral-300\b/g, "border-input"],
];

const FILE_EXTS = new Set([".tsx", ".ts", ".jsx", ".js"]);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(ROOT, full);
    if ([...SKIP_PATH_PARTS].some((p) => rel.startsWith(p) || rel.includes(`/${p}/`) || rel.endsWith(`/${p}`))) continue;
    if (ent.isDirectory()) await walk(full, out);
    else if (FILE_EXTS.has(path.extname(ent.name))) out.push(full);
  }
  return out;
}

async function run() {
  const files = [];
  for (const dir of INCLUDE_GLOBS) {
    await walk(path.join(ROOT, dir), files);
  }

  let touched = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    let next = original;
    let fileReplacements = 0;
    for (const [pattern, repl] of RULES) {
      const matches = next.match(pattern);
      if (matches) {
        fileReplacements += matches.length;
        next = next.replace(pattern, repl);
      }
    }
    if (next !== original) {
      await fs.writeFile(file, next);
      touched++;
      totalReplacements += fileReplacements;
      console.log(`  ${path.relative(ROOT, file)}  (${fileReplacements})`);
    }
  }

  console.log(
    `\nDone: ${touched} files touched, ${totalReplacements} replacements applied.`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
