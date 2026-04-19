import type { SpecialistCtx } from './specialists'

export interface CtxItem {
  icon: string
  key: { ar: string; en: string }
  val: string | { ar: string; en: string }
  color: string
  vclr: string
}

export const CTX_DATA: Record<SpecialistCtx, CtxItem[]> = {
  training: [
    { icon: '\uD83E\uDEAC', key: { ar: 'HRV \u0627\u0644\u0644\u064A\u0644\u064A', en: 'Nightly HRV' }, val: '52ms', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\u26A1', key: { ar: 'Recovery', en: 'Recovery' }, val: '74%', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\uD83D\uDE34', key: { ar: '\u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0644\u064A\u0644\u0629', en: "Last Night's Sleep" }, val: '6.5h', color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83C\uDFCB', key: { ar: '\u0622\u062E\u0631 \u062A\u0645\u0631\u064A\u0646', en: 'Last Workout' }, val: { ar: '\u0623\u0645\u0633', en: 'Yesterday' }, color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83E\uDDB5', key: { ar: '\u062D\u0627\u0644\u0629 \u0627\u0644\u0631\u0643\u0628\u0629', en: 'Knee Status' }, val: '\uD83D\uDFE1', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\uD83D\uDCC8', key: { ar: 'Strain \u0627\u0644\u0623\u0633\u0628\u0648\u0639', en: 'Weekly Strain' }, val: '14.2', color: 'var(--rbg)', vclr: 'var(--rtx)' },
  ],
  nutrition: [
    { icon: '\uD83E\uDD69', key: { ar: '\u0628\u0631\u0648\u062A\u064A\u0646 \u0627\u0644\u064A\u0648\u0645', en: "Today's Protein" }, val: '96g/165g', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\u23F1\uFE0F', key: { ar: '\u0622\u062E\u0631 \u0648\u062C\u0628\u0629', en: 'Last Meal' }, val: { ar: '\u0642\u0628\u0644 14.3h', en: '14.3h ago' }, color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83D\uDCA7', key: { ar: '\u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u064A\u0648\u0645', en: "Today's Water" }, val: '2L/5L', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\uD83D\uDD25', key: { ar: '\u0633\u0639\u0631\u0627\u062A \u0627\u0644\u064A\u0648\u0645', en: "Today's Calories" }, val: '1840 kcal', color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83E\uDDEE', key: { ar: '\u0627\u0644\u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A', en: 'Carbohydrates' }, val: '145g', color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83D\uDCCB', key: { ar: '\u0627\u0644\u0648\u062C\u0628\u0627\u062A \u0627\u0644\u064A\u0648\u0645', en: 'Meals Today' }, val: { ar: '\u0648\u062C\u0628\u0629 \u0648\u0627\u062D\u062F\u0629', en: '1 meal' }, color: 'var(--surf2)', vclr: 'var(--t1)' },
  ],
  sleep: [
    { icon: '\uD83D\uDE34', key: { ar: '\u0645\u062F\u0629 \u0627\u0644\u0646\u0648\u0645', en: 'Sleep Duration' }, val: '6.5h', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\uD83C\uDF19', key: { ar: '\u0648\u0642\u062A \u0627\u0644\u0646\u0648\u0645', en: 'Bedtime' }, val: '11:48pm', color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\u2600\uFE0F', key: { ar: '\u0648\u0642\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0642\u0627\u0638', en: 'Wake Time' }, val: '6:17am', color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83E\uDDE0', key: { ar: 'Deep Sleep', en: 'Deep Sleep' }, val: '45%', color: 'var(--gbg)', vclr: 'var(--gtx)' },
    { icon: '\uD83E\uDEAC', key: { ar: 'HRV \u0627\u0644\u0644\u064A\u0644\u064A', en: 'Nightly HRV' }, val: '52ms', color: 'var(--abg)', vclr: 'var(--atx)' },
    { icon: '\uD83D\uDCA1', key: { ar: '\u0636\u0648\u0621 \u0635\u0628\u0627\u062D\u064A', en: 'Morning Light' }, val: { ar: '\u0644\u0645 \u064A\u064F\u0633\u062C\u064E\u0651\u0644', en: 'Not logged' }, color: 'var(--surf2)', vclr: 'var(--t3)' },
  ],
  labs: [
    { icon: '\uD83D\uDCC8', key: { ar: '\u0627\u0644\u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644', en: 'Cortisol' }, val: '18.2', color: 'var(--rbg)', vclr: 'var(--rtx)' },
    { icon: '\uD83D\uDC8A', key: { ar: '\u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A \u0627\u0644\u064A\u0648\u0645', en: "Today's Supps" }, val: '12/14', color: 'var(--gbg)', vclr: 'var(--gtx)' },
    { icon: '\uD83E\uDE78', key: { ar: '\u0622\u062E\u0631 \u062A\u062D\u0644\u064A\u0644', en: 'Last Lab Test' }, val: { ar: '15 \u0645\u0627\u0631\u0633', en: 'Mar 15' }, color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\uD83E\uDDEA', key: { ar: '\u0641\u064A\u062A\u0627\u0645\u064A\u0646 D', en: 'Vitamin D' }, val: '47 ng/mL', color: 'var(--gbg)', vclr: 'var(--gtx)' },
    { icon: '\uD83D\uDD2C', key: { ar: 'HTMA', en: 'HTMA' }, val: { ar: '\u0645\u0627\u0631\u0633 10', en: 'Mar 10' }, color: 'var(--surf2)', vclr: 'var(--t1)' },
    { icon: '\u2697\uFE0F', key: { ar: '\u0627\u0644\u0647\u0631\u0645\u0648\u0646\u0627\u062A', en: 'Hormones' }, val: { ar: '\u064A\u0646\u062A\u0638\u0631 \u0627\u0644\u0641\u062D\u0635', en: 'Awaiting test' }, color: 'var(--abg)', vclr: 'var(--atx)' },
  ],
}

export interface WhatIfScenario {
  title: { ar: string; en: string }
  sub: { ar: string; en: string }
  results: Array<{
    k: { ar: string; en: string }
    v: string | { ar: string; en: string }
    delta: string | { ar: string; en: string }
    good: boolean
  }>
}

export const WHATIF: WhatIfScenario[] = [
  {
    title: { ar: '\uD83D\uDE34 \u0644\u0648 \u0646\u0645\u062A 8 \u0633\u0627\u0639\u0627\u062A \u0628\u062F\u0644\u0627\u064B \u0645\u0646 6.5h \u0623\u0645\u0633', en: '\uD83D\uDE34 If you slept 8h instead of 6.5h last night' },
    sub: { ar: '\u0643\u064A\u0641 \u0633\u064A\u0643\u0648\u0646 \u0627\u0644\u064A\u0648\u0645 \u0645\u062E\u062A\u0644\u0641\u0627\u064B\u061F', en: 'How would today look different?' },
    results: [
      { k: { ar: 'HRV \u0627\u0644\u064A\u0648\u0645', en: "Today's HRV" }, v: '58\u201361ms', delta: '+12%', good: true },
      { k: { ar: 'Recovery', en: 'Recovery' }, v: '82\u201385%', delta: '+11%', good: true },
      { k: { ar: '\u0627\u0644\u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644 \u0627\u0644\u0635\u0628\u0627\u062D\u064A', en: 'Morning Cortisol' }, v: '14\u201315 ng/mL', delta: '-18%', good: true },
      { k: { ar: '\u0637\u0627\u0642\u062A\u0643 \u0627\u0644\u0622\u0646', en: 'Your Energy Now' }, v: { ar: '\u0639\u0627\u0644\u064A\u0629', en: 'High' }, delta: { ar: '\u2191 \u0645\u062A\u0648\u0642\u0639', en: '\u2191 Expected' }, good: true },
    ]
  },
  {
    title: { ar: '\uD83E\uDD69 \u0644\u0648 \u0623\u0643\u0644\u062A 165g \u0628\u0631\u0648\u062A\u064A\u0646 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 96g \u0623\u0645\u0633', en: '\uD83E\uDD69 If you hit 165g protein instead of 96g yesterday' },
    sub: { ar: '\u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0639\u0636\u0644\u064A \u0639\u0644\u0649 \u0627\u0644\u064A\u0648\u0645', en: 'Impact on muscle recovery today' },
    results: [
      { k: { ar: '\u062A\u0639\u0627\u0641\u064A \u0639\u0636\u0644\u064A', en: 'Muscle Recovery' }, v: { ar: '\u0623\u0633\u0631\u0639 \u0628\u0640 40%', en: '40% faster' }, delta: '+40%', good: true },
      { k: { ar: '\u0623\u0644\u0645 \u0645\u0627 \u0628\u0639\u062F \u0627\u0644\u062A\u0645\u0631\u064A\u0646', en: 'Post-workout Soreness' }, v: { ar: '\u0623\u062E\u0641 \u0628\u0643\u062B\u064A\u0631', en: 'Much lighter' }, delta: '-30%', good: true },
      { k: { ar: 'HRV', en: 'HRV' }, v: '54\u201355ms', delta: '+2ms', good: true },
      { k: { ar: '\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0646', en: 'Workout Recommendation' }, v: { ar: '\u0623\u062B\u0642\u0627\u0644 \u0643\u0627\u0645\u0644\u0629', en: 'Full weights' }, delta: { ar: '\u2713 \u0645\u0645\u0643\u0646', en: '\u2713 Possible' }, good: true },
    ]
  },
  {
    title: { ar: '\uD83D\uDEB4 \u0644\u0648 \u0623\u0636\u0641\u062A 25 \u062F\u0642\u064A\u0642\u0629 Zone 2 \u0623\u0645\u0633', en: '\uD83D\uDEB4 If you added 25 min Zone 2 yesterday' },
    sub: { ar: '\u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0643\u0627\u0631\u062F\u064A\u0648 \u0627\u0644\u062E\u0641\u064A\u0641 \u0639\u0644\u0649 Recovery', en: 'Impact of light cardio on recovery' },
    results: [
      { k: { ar: 'Recovery \u0627\u0644\u064A\u0648\u0645', en: "Today's Recovery" }, v: '79\u201382%', delta: '+7%', good: true },
      { k: { ar: 'HRV', en: 'HRV' }, v: '55\u201357ms', delta: '+5ms', good: true },
      { k: { ar: '\u062C\u0648\u062F\u0629 \u0627\u0644\u0646\u0648\u0645', en: 'Sleep Quality' }, v: { ar: '\u0623\u0641\u0636\u0644 \u0628\u0640 15%', en: '15% better' }, delta: '+15%', good: true },
      { k: { ar: 'Strain \u0625\u0636\u0627\u0641\u064A', en: 'Extra Strain' }, v: '+1.8', delta: { ar: '\u0645\u0642\u0628\u0648\u0644', en: 'Acceptable' }, good: false },
    ]
  },
  {
    title: { ar: '\uD83D\uDCA7 \u0644\u0648 \u0634\u0631\u0628\u062A 5L \u0645\u0627\u0621 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 2L \u0623\u0645\u0633', en: '\uD83D\uDCA7 If you drank 5L water instead of 2L yesterday' },
    sub: { ar: '\u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u062A\u0631\u0637\u064A\u0628 \u0639\u0644\u0649 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629', en: 'Impact of hydration on biomarkers' },
    results: [
      { k: { ar: '\u0627\u0644\u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644', en: 'Cortisol' }, v: '15\u201316 ng/mL', delta: '-14%', good: true },
      { k: { ar: 'HRV', en: 'HRV' }, v: '55\u201356ms', delta: '+6%', good: true },
      { k: { ar: '\u0623\u062F\u0627\u0621 \u0627\u0644\u062A\u0645\u0631\u064A\u0646', en: 'Workout Performance' }, v: { ar: '\u0623\u0641\u0636\u0644 \u0628\u0640 8%', en: '8% better' }, delta: '+8%', good: true },
      { k: { ar: '\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u064A\u0648\u0645', en: "Today's Weight" }, v: '93.8kg', delta: '-0.4kg', good: false },
    ]
  },
]

export const MEET_RESPONSES: Record<string, { resp: { ar: string; en: string }; tags: { ar: string[]; en: string[] }; conf: number; cc: string }> = {
  AT: {
    resp: { ar: '\u0627\u0646\u062E\u0641\u0627\u0636 HRV + \u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644 18.2 = \u062D\u0645\u0644 \u062A\u0631\u0627\u0643\u0645\u064A. \u0623\u0648\u0644\u0648\u064A\u062A\u064A: \u0631\u0627\u062D\u0629 \u0641\u0627\u0639\u0644\u0629 \u0627\u0644\u064A\u0648\u0645 + \u0645\u0631\u0627\u062C\u0639\u0629 \u062C\u0648\u062F\u0629 \u0627\u0644\u0646\u0648\u0645.', en: 'HRV decline + cortisol 18.2 = cumulative load. Priority: active rest today + sleep quality review.' },
    tags: { ar: ['\u0625\u062C\u0647\u0627\u062F', '\u0631\u0627\u062D\u0629 \u0641\u0627\u0639\u0644\u0629'], en: ['Stress', 'Active rest'] }, conf: 4, cc: '#00A87A'
  },
  PL: {
    resp: { ar: '\u062B\u0628\u0627\u062A \u0627\u0644\u0648\u0632\u0646 + HRV \u0645\u0646\u062E\u0641\u0636 = \u062C\u0633\u0645 \u0645\u062D\u0627\u0641\u0638. \u0644\u0627 \u062A\u062E\u0641\u0651\u0636 \u0627\u0644\u0633\u0639\u0631\u0627\u062A \u2014 \u0623\u0636\u0641 100 \u0643\u0627\u0644\u0648\u0631\u064A \u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A.', en: "Weight stable + low HRV = conservation mode. Don't cut calories \u2014 add 100 cal carbs." },
    tags: { ar: ['\u0637\u0627\u0642\u0629', '\u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A'], en: ['Energy', 'Carbs'] }, conf: 3, cc: '#D97706'
  },
  CE: {
    resp: { ar: '\u0627\u0644\u0631\u0643\u0628\u0629 + HRV \u0645\u0646\u062E\u0641\u0636 = \u0644\u0627 \u062B\u0642\u0644 \u0627\u0644\u064A\u0648\u0645. \u0625\u062D\u0645\u0627\u0621 20 \u062F\u0642\u064A\u0642\u0629 \u0645\u0648\u0633\u0651\u0639 + deload \u0623\u0633\u0628\u0648\u0639 \u0643\u0627\u0645\u0644.', en: 'Knee + low HRV = no heavy weights today. 20-min extended warm-up + full deload week.' },
    tags: { ar: ['deload', '\u0627\u0644\u0631\u0643\u0628\u0629'], en: ['Deload', 'Knee'] }, conf: 4, cc: '#00A87A'
  },
  IR: {
    resp: { ar: '\u0627\u0644\u0628\u0631\u0648\u062A\u064A\u0646 96g \u0643\u0627\u0641\u064D \u0644\u0644\u062A\u0639\u0627\u0641\u064A \u0641\u064A \u0641\u062A\u0631\u0629 \u0627\u0644\u0631\u0627\u062D\u0629. \u0644\u0627 \u062A\u062E\u0641\u0651\u0636 \u0627\u0644\u0637\u0627\u0642\u0629 \u2014 \u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u062C\u0648\u062F\u0629 \u0627\u0644\u0646\u0648\u0645.', en: '96g protein sufficient during rest. Focus on sleep quality instead.' },
    tags: { ar: ['\u0628\u0631\u0648\u062A\u064A\u0646', '\u0646\u0648\u0645'], en: ['Protein', 'Sleep'] }, conf: 3, cc: '#D97706'
  },
}

export const VERDICT = {
  conflict: { ar: 'Attia \u064A\u0631\u0649 \u0627\u0644\u0631\u0627\u062D\u0629 \u0627\u0644\u0641\u0627\u0639\u0644\u0629\u060C Poliquin \u064A\u0642\u062A\u0631\u062D \u0631\u0641\u0639 \u0627\u0644\u0633\u0639\u0631\u0627\u062A.', en: 'Attia recommends active rest, Poliquin suggests increasing calories.' },
  title: { ar: '\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u2014 72 \u0633\u0627\u0639\u0629', en: 'Recovery Protocol \u2014 72 hours' },
  text: { ar: '\u0625\u062C\u0645\u0627\u0639: \u0631\u0627\u062D\u0629 \u0641\u0627\u0639\u0644\u0629 (zone 2) + \u0631\u0641\u0639 \u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A 100 \u0643\u0627\u0644\u0648\u0631\u064A + \u0625\u062D\u0645\u0627\u0621 \u0627\u0644\u0631\u0643\u0628\u0629. \u0625\u0639\u0627\u062F\u0629 \u062A\u0642\u064A\u064A\u0645 HRV \u0628\u0639\u062F \u064A\u0648\u0645\u064A\u0646.', en: 'Consensus: active rest (zone 2) + raise carbs 100 cal + knee warm-up. Re-assess HRV in 2 days.' }
}