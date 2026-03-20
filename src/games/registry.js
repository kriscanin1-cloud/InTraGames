export const games = [
  {
    slug: 'toguz-korgool',
    title: 'Toguz Korgool',
    titleRu: 'Тогуз Коргоол',
    titleDe: 'Toguz Korgool',
    origin: 'Central Asia',
    originRu: 'Центральная Азия',
    originDe: 'Zentralasien',
    players: '2',
    duration: '20–40 min',
    difficulty: 2,
    description: {
      en: 'Ancient mancala-type game of the Kyrgyz nomads. Capture stones by landing on even-numbered pits.',
      ru: 'Древняя игра кыргызских кочевников. Захватывай камешки, попадая на чётные лунки соперника.',
      de: 'Altes Mankalaspiel der kirgisischen Nomaden. Steine durch gerade Mulden des Gegners erbeuten.',
    },
    tags: ['strategy', 'mancala', 'central-asia'],
    available: true,
  },
  {
    slug: 'mancala',
    title: 'Mancala',
    titleRu: 'Манкала',
    titleDe: 'Mancala',
    origin: 'Africa',
    originRu: 'Африка',
    originDe: 'Afrika',
    players: '2',
    duration: '10–20 min',
    difficulty: 1,
    description: {
      en: 'One of the oldest board games in the world. Sow and capture seeds across the board.',
      ru: 'Одна из старейших настольных игр мира. Раскладывай и захватывай камешки по доске.',
      de: 'Eines der ältesten Brettspiele der Welt. Säe und ernte Steine auf dem Spielfeld.',
    },
    tags: ['strategy', 'mancala', 'africa'],
    available: false,
  },
  {
    slug: 'hnefatafl',
    title: 'Hnefatafl',
    titleRu: 'Хнефатафль',
    titleDe: 'Hnefatafl',
    origin: 'Scandinavia',
    originRu: 'Скандинавия',
    originDe: 'Skandinavien',
    players: '2',
    duration: '20–60 min',
    difficulty: 3,
    description: {
      en: 'Viking strategy game of asymmetric warfare. Attackers vs defenders — can the king escape?',
      ru: 'Стратегическая игра викингов с асимметричными сторонами. Атакующие против защитников.',
      de: 'Wikinger-Strategiespiel mit asymmetrischen Seiten. Angreifer gegen Verteidiger.',
    },
    tags: ['strategy', 'asymmetric', 'europe'],
    available: false,
  },
  {
    slug: 'surakarta',
    title: 'Surakarta',
    titleRu: 'Суракарта',
    titleDe: 'Surakarta',
    origin: 'Southeast Asia',
    originRu: 'Юго-Восточная Азия',
    originDe: 'Südostasien',
    players: '2',
    duration: '10–30 min',
    difficulty: 2,
    description: {
      en: 'Unique game with looping tracks. Pieces travel around corner loops to capture opponents.',
      ru: 'Уникальная игра с петлями. Фигуры захватывают, проезжая через угловые петли.',
      de: 'Einzigartiges Spiel mit Schleifen. Figuren reisen durch Eckschleifen um zu schlagen.',
    },
    tags: ['strategy', 'southeast-asia'],
    available: false,
  },
];

export function getGame(slug) {
  return games.find(g => g.slug === slug);
}

export function getAvailableGames() {
  return games.filter(g => g.available);
}