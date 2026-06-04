import Dexie, { type Table } from 'dexie'
import type {
  BodyEntry, FinanceEntry, MentalEntry, RelationshipEntry,
  QuergiaEntry, DayPlan, ReflectionEntry, QuarterlyReview,
  MasterTask, InspirationFigure, VisionImage
} from '../types'

class NewDayDB extends Dexie {
  body!: Table<BodyEntry>
  finances!: Table<FinanceEntry>
  mental!: Table<MentalEntry>
  relationships!: Table<RelationshipEntry>
  quergia!: Table<QuergiaEntry>
  dayPlans!: Table<DayPlan>
  reflections!: Table<ReflectionEntry>
  quarterlyReviews!: Table<QuarterlyReview>
  masterTasks!: Table<MasterTask>
  inspirationFigures!: Table<InspirationFigure>
  visionImages!: Table<VisionImage>

  constructor() {
    super('NewDayDB')
    this.version(1).stores({
      body: '++id, date',
      finances: '++id, date',
      mental: '++id, date',
      relationships: '++id, date',
      quergia: '++id, date',
      dayPlans: '++id, date',
      reflections: '++id, date',
      quarterlyReviews: '++id, [quarter+year]',
      masterTasks: '++id, category, pinned',
      inspirationFigures: '++id, name',
      visionImages: '++id, category',
    })
  }
}

export const db = new NewDayDB()

export async function getOrCreateBodyEntry(date: string): Promise<BodyEntry> {
  const existing = await db.body.where('date').equals(date).first()
  if (existing) return existing
  const id = await db.body.add({ date, water: 0, steps: 0, exercises: [] }) as number
  return { id, date, water: 0, steps: 0, exercises: [] }
}

export async function getOrCreateDayPlan(date: string): Promise<DayPlan> {
  const existing = await db.dayPlans.where('date').equals(date).first()
  if (existing) return existing
  const id = await db.dayPlans.add({ date, tasks: [] }) as number
  return { id, date, tasks: [] }
}

export async function getOrCreateReflection(date: string): Promise<ReflectionEntry> {
  const existing = await db.reflections.where('date').equals(date).first()
  if (existing) return existing
  const entry: ReflectionEntry = {
    date, lessons: '', beliefs: '', strengths: [], weaknesses: [],
    didWell: '', improve: '', actions: [], decisions: [],
    giftEvent: '', giftPerspective: '',
    playToWin: 5, focused: 5, conscious: 5, intentional: 5,
  }
  const id = await db.reflections.add(entry) as number
  return { ...entry, id }
}

export async function getBodyEntriesRange(from: string, to: string): Promise<BodyEntry[]> {
  return db.body.where('date').between(from, to, true, true).toArray()
}

export async function seedInspirationFigures() {
  const count = await db.inspirationFigures.count()
  if (count > 0) return
  const defaults: Omit<InspirationFigure, 'id'>[] = [
    {
      name: 'Marie Curie',
      bio: 'Physicist and chemist who conducted pioneering research on radioactivity.',
      achievements: ['First woman to win a Nobel Prize', 'Only person to win Nobel in two sciences'],
      quotes: ['Nothing in life is to be feared, only to be understood.', 'Be less curious about people and more curious about ideas.'],
      area: ['mental', 'sciences'],
      isCustom: false,
    },
    {
      name: 'Bruce Lee',
      bio: 'Martial artist, actor, and philosopher who transformed martial arts and fitness.',
      achievements: ['Founded Jeet Kune Do', 'Inspired a global fitness movement'],
      quotes: ['Be like water making its way through cracks.', 'Absorb what is useful, discard what is not.'],
      area: ['body', 'mental'],
      isCustom: false,
    },
    {
      name: 'Nikola Tesla',
      bio: 'Inventor and engineer who developed the AC electrical system.',
      achievements: ['AC induction motor', 'Wireless power transmission research'],
      quotes: ['The present is theirs; the future is mine.', 'If you want to find the secrets of the universe, think in terms of energy.'],
      area: ['mental', 'finances'],
      isCustom: false,
    },
    {
      name: 'Oprah Winfrey',
      bio: 'Media executive, talk show host, and philanthropist.',
      achievements: ['Built a media empire from nothing', 'First Black female billionaire'],
      quotes: ['The biggest adventure you can take is to live the life of your dreams.', 'Turn your wounds into wisdom.'],
      area: ['relationships', 'quergia'],
      isCustom: false,
    },
    {
      name: 'Steve Jobs',
      bio: 'Co-founder of Apple, pioneer of the personal computer revolution.',
      achievements: ['Co-founded Apple', 'Revolutionized mobile computing with iPhone'],
      quotes: ['Stay hungry, stay foolish.', 'Innovation distinguishes between a leader and a follower.'],
      area: ['quergia', 'mental'],
      isCustom: false,
    },
    {
      name: 'Elon Musk',
      bio: 'Entrepreneur and business magnate behind Tesla, SpaceX, and more.',
      achievements: ['Founded SpaceX', 'Transformed the electric vehicle industry'],
      quotes: ['When something is important enough, you do it even if the odds are not in your favor.'],
      area: ['quergia', 'finances'],
      isCustom: false,
    },
  ]
  await db.inspirationFigures.bulkAdd(defaults)
}
