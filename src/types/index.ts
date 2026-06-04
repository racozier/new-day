export interface Exercise {
  id: string
  type: 'yoga' | 'shakti' | 'situps' | 'walking' | 'running' | 'stretching' | 'custom'
  name?: string
  duration?: number
  reps?: number
  satisfaction?: number
}

export interface BodyEntry {
  id?: number
  date: string
  water: number
  steps: number
  weight?: number
  exercises: Exercise[]
}

export interface FinanceEntry {
  id?: number
  date: string
  income: number
  expenses: ExpenseItem[]
  learningItems: LearningItem[]
}

export interface ExpenseItem {
  id: string
  label: string
  amount: number
  category: string
}

export interface LearningItem {
  id: string
  title: string
  type: 'course' | 'book' | 'podcast' | 'video' | 'article'
  progress?: number
  area: 'finance' | 'marketing' | 'mental' | 'skills' | 'other'
}

export interface MentalEntry {
  id?: number
  date: string
  learningItems: LearningItem[]
  insights: string[]
  hoursLearned: number
}

export interface RelationshipEntry {
  id?: number
  date: string
  communicatorMins: number
  socialMins: number
  meetings: Meeting[]
  romanceRating?: 1 | 2 | 3 | 4 | 5
}

export interface Meeting {
  id: string
  person: string
  type: 'family' | 'friend' | 'work' | 'networking' | 'romantic'
  durationMins: number
}

export interface MasterTask {
  id?: number
  title: string
  category: string
  notes?: string
  pinned: boolean
  createdAt: string
}

export interface PlanTask {
  id: string
  title: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime'
  fromMaster?: number
  completed: boolean
  unexpected: boolean
  notes?: string
}

export interface QuergiaEntry {
  id?: number
  date: string
  tasks: PlanTask[]
  revenue: number
  leads: number
  notes: string
}

export interface DayPlan {
  id?: number
  date: string
  tasks: PlanTask[]
}

export interface Decision {
  id: string
  description: string
  outcome: 'correct' | 'incorrect' | 'pending'
  lesson: string
}

export interface ReflectionEntry {
  id?: number
  date: string
  lessons: string
  beliefs: string
  strengths: string[]
  weaknesses: string[]
  didWell: string
  improve: string
  actions: string[]
  decisions: Decision[]
  giftEvent: string
  giftPerspective: string
  playToWin: number
  focused: number
  conscious: number
  intentional: number
}

export interface QuarterlyReview {
  id?: number
  quarter: number
  year: number
  completedAt: string
  progress: string
  regression: string
  couldDoBetter: string
  couldPredict: string
  experiences: string
  newClarity: string
  block: 'body' | 'skills' | 'emotions' | 'none'
  sentences: QuarterlySentences
  conclusions: string
}

export interface QuarterlySentences {
  didntDo: string
  cantStart: string
  distracts: string
  repeatedPattern: string
  unexpectedReaction: string
}

export interface InspirationFigure {
  id?: number
  name: string
  bio: string
  achievements: string[]
  quotes: string[]
  imageUrl?: string
  area: string[]
  isCustom: boolean
}

export interface VisionImage {
  id?: number
  title: string
  imageData: string
  category: string
  addedAt: string
}

export type AreaKey = 'body' | 'finances' | 'mental' | 'relationships' | 'quergia'

export interface DayScore {
  date: string
  body: number
  finances: number
  mental: number
  relationships: number
  quergia: number
}
