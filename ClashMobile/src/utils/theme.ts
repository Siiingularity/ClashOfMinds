// ── Design Tokens — exact match to web app ───────────────────────────

export const COLORS = {
  // Backgrounds
  BG:           '#F5E6D3',   // main app background (warm beige)
  BG_GAME:      '#F0E0C8',   // game screen background
  BG_CARD:      '#FFFFFF',   // card background

  // Browns
  BROWN_DARKEST:  '#1A0A00', // game board / overlays
  BROWN_DARK2:    '#2A1505', // cells, dark areas
  BROWN_MED:      '#4A2810', // bottom bars
  BROWN_MED2:     '#3D2008', // score areas
  BROWN_PRIMARY:  '#5D3A1A', // primary text + buttons
  BROWN_ACCENT:   '#8B5A2B', // secondary buttons, accents
  BROWN_LIGHT:    '#A67B5B', // lighter accent
  BROWN_BEIGE:    '#C4A882', // active team, gold highlights

  // Text
  TEXT_DARK:   '#1A0A00',
  TEXT_MED:    '#5D3A1A',
  TEXT_LIGHT:  '#8B5A2B',
  TEXT_MUTED:  'rgba(90,55,25,0.55)',

  // States
  SUCCESS:   '#16a34a',
  ERROR:     '#dc2626',
  WARNING:   '#d97706',
};

export const GAME_LOGO = 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png';
export const INFO_ICON  = 'https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260414/info_s9gtjd.png';

export const POWERUPS: Record<string, { icon_url: string; name: { ar: string; en: string }; description: { ar: string; en: string } }> = {
  steal: {
    icon_url: 'https://i.imgur.com/e1Ywhk4.png',
    name: { ar: 'سرقة السؤال', en: 'Steal Question' },
    description: { ar: 'اسرق سؤال الخصم', en: 'Steal opponent\'s question' },
  },
  block: {
    icon_url: 'https://i.imgur.com/VtMtaCu.png',
    name: { ar: 'منع الخصم', en: 'Block Opponent' },
    description: { ar: 'امنع الخصم من الإجابة', en: 'Block opponent\'s next question' },
  },
  double: {
    icon_url: 'https://i.imgur.com/PdUyRQG.png',
    name: { ar: 'تدبيل النقاط', en: 'Double Points' },
    description: { ar: 'ضاعف نقاط السؤال القادم', en: 'Double the next question\'s points' },
  },
  callfriend: {
    icon_url: 'https://i.imgur.com/r2gvY0n.png',
    name: { ar: 'اتصال بصديق', en: 'Call a Friend' },
    description: { ar: 'اتصل بصديق للمساعدة', en: 'Call a friend for help' },
  },
  twoanswers: {
    icon_url: 'https://i.imgur.com/3R4plWC.png',
    name: { ar: 'إجابتين', en: 'Two Answers' },
    description: { ar: 'جرب إجابتين', en: 'Try two answers' },
  },
};

// Image URL helper - handles relative API paths and full URLs
export function getCategoryImageUri(imageUrl: string | undefined | null): string | null {
  if (!imageUrl || imageUrl === 'question') return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `https://clashofminds-production.up.railway.app${imageUrl}`;
}
