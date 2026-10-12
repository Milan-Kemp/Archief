export type ItemType = 'video' | 'book' | 'article'
export type Domain = 'history' | 'philosophy' | 'science'
export type DatePrecision = 'exact' | 'decade' | 'century' | 'era'
export type ItemStatus = 'to_watch' | 'done'

export interface Item {
  id: string
  user_id: string
  type: ItemType
  url: string | null
  title: string
  author: string | null
  thumbnail_url: string | null
  domain: Domain
  year_start: number
  year_end: number | null
  date_precision: DatePrecision
  region: string | null
  people: string[]
  tags: string[]
  notes: string
  status: ItemStatus
  created_at: string
  updated_at: string
}
