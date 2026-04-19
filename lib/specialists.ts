export type SpecialistCtx = 'training' | 'nutrition' | 'sleep' | 'labs'
export type SpecialistStatus = 'active' | 'idle'

export interface Specialist {
  id: string
  em: string
  photo: string
  gender: 'm' | 'f'
  prefix: { ar: string; en: string }
  name: string
  nameAr: string
  role: { ar: string; en: string }
  color: string
  status: SpecialistStatus
  ctx: SpecialistCtx
  lastMsg: { ar: string; en: string }
  lastTime: { ar: string; en: string }
  conf: number
}

export const SPECIALISTS: Specialist[] = [
  {
    id: 'AT', em: '\uD83E\uDEAC', photo: '/avatars/peter-attia.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Peter Attia', nameAr: '\u0628\u064A\u062A\u0631 \u0639\u0637\u064A\u0629',
    role: { ar: '\u0637\u0628 \u0627\u0644\u0623\u062F\u0627\u0621 \u2022 \u0627\u0644\u0625\u0637\u0627\u0644\u0629', en: 'Performance Med.' },
    color: '#1A73E8', status: 'active', ctx: 'training',
    lastMsg: { ar: 'HRV \u0627\u0646\u062E\u0641\u0636 58\u219252ms \u2014 \u0627\u0633\u062A\u0631\u0627\u062D\u0629 \u0641\u0627\u0639\u0644\u0629 \u0623\u0641\u0636\u0644.', en: 'HRV dropped 58\u219252ms \u2014 active rest beats pushing through.' },
    lastTime: { ar: '\u0642\u0628\u0644 \u0633\u0627\u0639\u062A\u064A\u0646', en: '2h ago' }, conf: 4
  },
  {
    id: 'PL', em: '\uD83D\uDCCF', photo: '/avatars/charles-poliquin.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Charles Poliquin', nameAr: '\u062A\u0634\u0627\u0631\u0644\u0632 \u0628\u0648\u0644\u064A\u0643\u0648\u064A\u0646',
    role: { ar: '\u0627\u0644\u062A\u0643\u0648\u064A\u0646 \u0627\u0644\u062C\u0633\u062F\u064A', en: 'Body Composition' },
    color: '#D97706', status: 'active', ctx: 'nutrition',
    lastMsg: { ar: '\u0627\u0644\u0648\u0632\u0646 \u062B\u0627\u0628\u062A 10 \u0623\u064A\u0627\u0645 \u2014 \u0631\u0627\u062C\u0639 \u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0643\u0631\u0628\u0648\u0647\u064A\u062F\u0631\u0627\u062A.', en: 'Weight plateaued 10 days \u2014 review carb timing.' },
    lastTime: { ar: '\u0642\u0628\u0644 5 \u0633\u0627\u0639\u0627\u062A', en: '5h ago' }, conf: 3
  },
  {
    id: 'CE', em: '\uD83E\uDDB5', photo: '/avatars/eric-cressey.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Eric Cressey', nameAr: '\u0625\u064A\u0631\u064A\u0643 \u0643\u0631\u064A\u0633\u064A',
    role: { ar: '\u0627\u0644\u0623\u062F\u0627\u0621 \u2022 \u0635\u062D\u0629 \u0627\u0644\u0631\u0643\u0628\u0629', en: 'Performance & Knee' },
    color: '#00A87A', status: 'active', ctx: 'training',
    lastMsg: { ar: '\u0627\u0644\u0631\u0643\u0628\u0629 \uD83D\uDFE1 \u2014 \u0637\u0628\u0651\u0642 \u0627\u0644\u0625\u062D\u0645\u0627\u0621 \u0627\u0644\u0645\u0648\u0633\u0651\u0639.', en: 'Knee \uD83D\uDFE1 \u2014 apply extended warm-up.' },
    lastTime: { ar: '\u0642\u0628\u0644 8 \u0633\u0627\u0639\u0627\u062A', en: '8h ago' }, conf: 4
  },
  {
    id: 'IR', em: '\uD83D\uDCAA', photo: '/avatars/mike-israetel.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Mike Israetel', nameAr: '\u0645\u0627\u064A\u0643 \u0625\u0633\u0631\u0627\u062A\u064A\u0644',
    role: { ar: '\u0639\u0644\u0645 \u0627\u0644\u0636\u062E\u0627\u0645\u0629 \u2022 \u0627\u0644\u062A\u063A\u0630\u064A\u0629', en: 'Hypertrophy & Nutrition' },
    color: '#7C3AED', status: 'active', ctx: 'nutrition',
    lastMsg: { ar: '\u0628\u0631\u0648\u062A\u064A\u0646 96g \u2014 \u0627\u0631\u0641\u0639 \u0627\u0644\u0648\u062C\u0628\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629.', en: 'Protein 96g \u2014 increase meal 2 density.' },
    lastTime: { ar: '\u0623\u0645\u0633', en: 'Yesterday' }, conf: 3
  },
  {
    id: 'HB', em: '\uD83E\uDDE0', photo: '/avatars/andrew-huberman.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Andrew Huberman', nameAr: '\u0623\u0646\u062F\u0631\u0648 \u0647\u0648\u0628\u0631\u0645\u0627\u0646',
    role: { ar: '\u0627\u0644\u0623\u0639\u0635\u0627\u0628 \u2022 \u0627\u0644\u0646\u0648\u0645', en: 'Neuro & Sleep' },
    color: '#0891B2', status: 'idle', ctx: 'sleep',
    lastMsg: { ar: '10 \u062F\u0642\u0627\u0626\u0642 \u0636\u0648\u0621 \u0635\u0628\u0627\u062D\u064A \u062A\u062D\u0633\u0651\u0646 HRV.', en: '10 min morning light significantly improves HRV.' },
    lastTime: { ar: '\u0623\u0645\u0633 2\u0645', en: 'Yesterday 2pm' }, conf: 3
  },
  {
    id: 'LN', em: '\uD83D\uDD2C', photo: '/avatars/layne-norton.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Layne Norton', nameAr: '\u0644\u064A\u0646 \u0646\u0648\u0631\u062A\u0648\u0646',
    role: { ar: '\u0639\u0644\u0645 \u0627\u0644\u062A\u063A\u0630\u064A\u0629', en: 'Nutrition Science' },
    color: '#059669', status: 'idle', ctx: 'nutrition',
    lastMsg: { ar: '\u0641\u064A\u062A\u0627\u0645\u064A\u0646 D \u2014 \u0631\u0627\u062C\u0639 \u0627\u0644\u062C\u0631\u0639\u0629 \u0628\u0639\u062F \u0627\u0644\u0641\u062D\u0635.', en: 'Vitamin D \u2014 review dosage post-test.' },
    lastTime: { ar: '\u0642\u0628\u0644 \u064A\u0648\u0645\u064A\u0646', en: '2d ago' }, conf: 4
  },
  {
    id: 'AG', em: '\u26A1', photo: '/avatars/andy-galpin.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Andy Galpin', nameAr: '\u0623\u0646\u062F\u064A \u062C\u0627\u0644\u0628\u064A\u0646',
    role: { ar: '\u0641\u0633\u064A\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0639\u0636\u0644\u0627\u062A', en: 'Muscle Physiology' },
    color: '#DC2626', status: 'idle', ctx: 'training',
    lastMsg: { ar: 'Strain \u0645\u0631\u062A\u0641\u0639 \u2014 deload \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', en: 'Strain elevated \u2014 deload this week.' },
    lastTime: { ar: '\u0642\u0628\u0644 \u064A\u0648\u0645\u064A\u0646', en: '2d ago' }, conf: 4
  },
  {
    id: 'KG', em: '\uD83E\uDDEC', photo: '/avatars/kyle-gillett.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Kyle Gillett', nameAr: '\u0643\u0627\u064A\u0644 \u062C\u064A\u0644\u064A\u062A',
    role: { ar: '\u0637\u0628 \u0627\u0644\u0647\u0631\u0645\u0648\u0646\u0627\u062A', en: 'Hormone Medicine' },
    color: '#9333EA', status: 'idle', ctx: 'labs',
    lastMsg: { ar: '\u0643\u0648\u0631\u062A\u064A\u0632\u0648\u0644 18.2 \u2014 \u0631\u0627\u062C\u0639 \u0627\u0644\u0646\u0648\u0645 \u0623\u0648\u0644\u0627\u064B.', en: 'Cortisol 18.2 \u2014 fix sleep before hormonal intervention.' },
    lastTime: { ar: '\u0642\u0628\u0644 3 \u0623\u064A\u0627\u0645', en: '3d ago' }, conf: 3
  },
  {
    id: 'MH', em: '\uD83C\uDF3F', photo: '/avatars/mark-hyman.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Mark Hyman', nameAr: '\u0645\u0627\u0631\u0643 \u0647\u0627\u064A\u0645\u0627\u0646',
    role: { ar: '\u0627\u0644\u0637\u0628 \u0627\u0644\u0648\u0638\u064A\u0641\u064A', en: 'Functional Medicine' },
    color: '#065F46', status: 'idle', ctx: 'labs',
    lastMsg: { ar: 'HTMA \u2014 \u0646\u0642\u0635 \u0627\u0644\u0645\u063A\u0646\u064A\u0633\u064A\u0648\u0645\u060C \u062C\u0631\u0639\u0629 \u0627\u0644\u0644\u064A\u0644.', en: 'HTMA \u2014 magnesium deficiency, nighttime dosing.' },
    lastTime: { ar: '\u0642\u0628\u0644 3 \u0623\u064A\u0627\u0645', en: '3d ago' }, conf: 3
  },
  {
    id: 'BJ', em: '\uD83E\uDD16', photo: '/avatars/bryan-johnson.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Bryan Johnson', nameAr: '\u0628\u0631\u0627\u064A\u0646 \u062C\u0648\u0646\u0633\u0648\u0646',
    role: { ar: '\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u064A\u0648\u0644\u0648\u062C\u064A', en: 'Bio Optimization' },
    color: '#1D4ED8', status: 'idle', ctx: 'labs',
    lastMsg: { ar: '\u0623\u0636\u0641 3g glycine \u0642\u0628\u0644 \u0627\u0644\u0646\u0648\u0645.', en: 'Add 3g glycine pre-sleep.' },
    lastTime: { ar: '\u0642\u0628\u0644 4 \u0623\u064A\u0627\u0645', en: '4d ago' }, conf: 2
  },
  {
    id: 'RP', em: '\uD83E\uDDA0', photo: '/avatars/rhonda-patrick.jpg',
    gender: 'f', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Rhonda Patrick', nameAr: '\u0631\u0648\u0646\u062F\u0627 \u0628\u0627\u062A\u0631\u064A\u0643',
    role: { ar: '\u0627\u0644\u0645\u063A\u0630\u064A\u0627\u062A \u2022 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u062E\u0644\u0648\u064A\u0629', en: 'Micronutrients' },
    color: '#7C2D12', status: 'idle', ctx: 'nutrition',
    lastMsg: { ar: 'Omega-3 \u0643\u0627\u0641\u064D \u2014 \u0644\u0627 \u062A\u063A\u064A\u064A\u0631.', en: 'Omega-3 is sufficient \u2014 no change needed.' },
    lastTime: { ar: '\u0642\u0628\u0644 4 \u0623\u064A\u0627\u0645', en: '4d ago' }, conf: 4
  },
  {
    id: 'TL', em: '\uD83C\uDFC3', photo: '/avatars/thomas-delauer.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Thomas DeLauer', nameAr: '\u062A\u0648\u0645\u0627\u0633 \u062F\u064A\u0644\u0627\u0648\u0631',
    role: { ar: '\u0627\u0644\u0635\u064A\u0627\u0645 \u2022 \u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u063A\u0630\u0627\u0626\u064A', en: 'Fasting & Metabolism' },
    color: '#B45309', status: 'idle', ctx: 'nutrition',
    lastMsg: { ar: '\u0646\u0627\u0641\u0630\u0629 18 \u0633\u0627\u0639\u0629 \u0645\u062B\u0627\u0644\u064A\u0629 \u2014 \u0644\u0627 \u062A\u063A\u064A\u064A\u0631.', en: '18-hour window is optimal \u2014 no change.' },
    lastTime: { ar: '\u0642\u0628\u0644 5 \u0623\u064A\u0627\u0645', en: '5d ago' }, conf: 3
  },
  {
    id: 'CM', em: '\u2696\uFE0F', photo: '/avatars/casey-means.jpg',
    gender: 'f', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Casey Means', nameAr: '\u0643\u064A\u0633\u064A \u0645\u064A\u0646\u0632',
    role: { ar: '\u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0627\u0633\u062A\u0642\u0644\u0627\u0628\u064A\u0629', en: 'Metabolic Health' },
    color: '#0F766E', status: 'idle', ctx: 'nutrition',
    lastMsg: { ar: '\u0627\u0644\u062C\u0644\u0648\u0643\u0648\u0632 \u0645\u0645\u062A\u0627\u0632 \u0641\u064A \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0623\u0643\u0644.', en: 'Glucose stability excellent in eating window.' },
    lastTime: { ar: '\u0642\u0628\u0644 \u0623\u0633\u0628\u0648\u0639', en: '1w ago' }, conf: 3
  },
  {
    id: 'PS', em: '\uD83E\uDD69', photo: '/avatars/paul-saladino.jpg',
    gender: 'm', prefix: { ar: '\u062F.', en: 'Dr.' },
    name: 'Paul Saladino', nameAr: '\u0628\u0648\u0644 \u0633\u0627\u0644\u0627\u062F\u064A\u0646\u0648',
    role: { ar: '\u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629', en: 'Ancestral Nutrition' },
    color: '#78350F', status: 'idle', ctx: 'nutrition',
    lastMsg: { ar: '\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u064A\u0629 \u0643\u0627\u0641\u064A\u0629 \u2014 \u0646\u0648\u0651\u0639 \u0627\u0644\u0645\u0635\u0627\u062F\u0631.', en: 'Animal-based content sufficient \u2014 diversify sources.' },
    lastTime: { ar: '\u0642\u0628\u0644 \u0623\u0633\u0628\u0648\u0639', en: '1w ago' }, conf: 2
  },
]

export function buildSystemPrompt(
  specialist: Specialist,
  context: Record<string, string>,
  memory: string[],
  lang: 'ar' | 'en'
): string {
  const name = lang === 'ar' ? specialist.nameAr : specialist.name
  const role = specialist.role[lang]
  const ctxLines = Object.entries(context)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  const memLines = memory.length
    ? memory.map((m, i) => `${i + 1}. ${m}`).join('\n')
    : lang === 'ar' ? '\u0644\u0627 \u064A\u0648\u062C\u062F \u062A\u0627\u0631\u064A\u062E \u0633\u0627\u0628\u0642' : 'No previous history'

  if (lang === 'ar') {
    return `\u0623\u0646\u062A \u062F. ${name}\u060C \u0645\u062A\u062E\u0635\u0635 \u0641\u064A ${role}.
\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0644\u0645\u0631\u064A\u0636:
${ctxLines}

\u0633\u062C\u0644 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629:
${memLines}

\u0623\u062C\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u0642\u0637. \u0627\u062C\u0639\u0644 \u0631\u062F\u0643 \u0645\u0628\u0627\u0634\u0631\u0627\u064B \u0648\u0639\u0645\u0644\u064A\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0639\u0644\u0627\u0647. \u0644\u0627 \u062A\u0632\u064A\u062F \u0639\u0646 3-4 \u062C\u0645\u0644.`
  }
  return `You are Dr. ${name}, specialist in ${role}.
Current biomarker data:
${ctxLines}

Previous session log:
${memLines}

Reply in English only. Be direct and practical based on the data above. Max 3-4 sentences.`
}