import type { BodyEntry, RelationshipEntry, QuergiaEntry, MentalEntry, FinanceEntry } from '../types'

export function scoreBody(entry: BodyEntry | undefined): number {
  if (!entry) return 0
  let score = 0
  score += Math.min(entry.water / 2.5, 1) * 30
  score += Math.min(entry.steps / 10000, 1) * 30
  score += entry.weight != null ? 10 : 0
  score += Math.min(entry.exercises.length / 2, 1) * 30
  return Math.round(score)
}

export function scoreFinances(entry: FinanceEntry | undefined): number {
  if (!entry) return 0
  let score = 0
  score += entry.income > 0 ? 30 : 0
  score += entry.expenses.length > 0 ? 20 : 0
  score += Math.min(entry.learningItems.length / 2, 1) * 50
  return Math.round(score)
}

export function scoreMental(entry: MentalEntry | undefined): number {
  if (!entry) return 0
  let score = 0
  score += Math.min(entry.hoursLearned / 2, 1) * 50
  score += Math.min(entry.learningItems.length / 2, 1) * 30
  score += Math.min(entry.insights.length / 3, 1) * 20
  return Math.round(score)
}

export function scoreRelationships(entry: RelationshipEntry | undefined): number {
  if (!entry) return 0
  let score = 50
  const socialPenalty = Math.min(entry.socialMins / 180, 1) * 20
  score -= socialPenalty
  score += Math.min(entry.meetings.length / 2, 1) * 30
  score += entry.romanceRating ? (entry.romanceRating / 5) * 20 : 0
  return Math.round(Math.max(0, score))
}

export function scoreQuergia(entry: QuergiaEntry | undefined): number {
  if (!entry) return 0
  const total = entry.tasks.length
  if (total === 0) return 0
  const completed = entry.tasks.filter(t => t.completed).length
  return Math.round((completed / total) * 100)
}

export const AREA_COLORS: Record<string, string> = {
  body:          '#e07968', // coral
  finances:      '#16193b', // navy
  mental:        '#c48f64', // warm peach-amber
  relationships: '#e8a895', // light coral
  quergia:       '#8b90c8', // periwinkle
}

export const AREA_LABELS: Record<string, string> = {
  body:          'Body',
  finances:      'Finances',
  mental:        'Mental',
  relationships: 'Relations',
  quergia:       'QUERGIA',
}
