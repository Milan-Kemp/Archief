import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types/item'

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    supabase
      .from('items')
      .select('*')
      .order('year_start', { ascending: true })
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { items, loading, refresh }
}
