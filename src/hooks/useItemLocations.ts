import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ItemLocation } from '../types/location'

export function useItemLocations() {
  const [locations, setLocations] = useState<ItemLocation[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    supabase
      .from('item_locations')
      .select('*')
      .then(({ data }) => {
        setLocations(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { locations, loading, refresh }
}
