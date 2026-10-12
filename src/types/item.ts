export type ItemType = 'video' | 'book' | 'article'
export type Domain = 'history' | 'philosophy' | 'science'
export type DatePrecision = 'exact' | 'decade' | 'century' | 'era'
export type ItemStatus = 'to_watch' | 'done'

export type DatedItem = Item & { year_start: number }

export interface Item {
  id: string
  user_id: string
  type: ItemType
  url: string | null
  title: string
  author: string | null
  thumbnail_url: string | null
  domain: Domain
  topic: string | null
  year_start: number | null
  year_end: number | null
  date_precision: DatePrecision
  region: string | null
  countries: string[]
  people: string[]
  tags: string[]
  notes: string
  status: ItemStatus
  created_at: string
  updated_at: string
}
