import { normalizeKo, toChoseong } from './hangul'

export type AllergenItem = {
  name: string
  ige?: number
  nonIge?: number
  tags?: string[]
}

export function scoreItem(q: string, qCh: string, item: AllergenItem) {
  const nameN = normalizeKo(item.name)
  const nameCh = toChoseong(nameN)

  let score = 0
  if (!q) return 0
  if (nameN.includes(q)) score += 2
  if (nameCh.includes(qCh)) score += 1
  if (nameN.startsWith(q)) score += 1
  return score
}

export function search(all: AllergenItem[], raw: string) {
  const q = normalizeKo(raw)
  const qCh = toChoseong(q)

  const ranked = all
    .map(item => ({ item, score: scoreItem(q, qCh, item) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item)

  const suggestions = all
    .filter(a => toChoseong(normalizeKo(a.name)).startsWith(qCh) || normalizeKo(a.name).startsWith(q))
    .slice(0, 12)

  return { ranked, suggestions }
}
