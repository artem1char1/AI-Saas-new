export type SearchEntityType = 'contact' | 'deal' | 'activity' | 'organization'

export type SearchResultItem = {
  id: string
  entity_type: SearchEntityType
  title: string
  subtitle: string | null
  deal_id: string | null
}

export type SearchResponse = {
  query: string
  results: SearchResultItem[]
}
