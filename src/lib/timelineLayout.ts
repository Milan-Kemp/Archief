export interface LaneEntry {
  id: string
  x: number
  width: number
}

// Simpele interval-kleuring: elk item krijgt de eerste rij waar het past,
// zodat overlappende periodes niet over elkaar heen tekenen.
export function assignLanes(entries: LaneEntry[], gap = 12): { laneOf: Map<string, number>; laneCount: number } {
  const sorted = [...entries].sort((a, b) => a.x - b.x)
  const laneEnds: number[] = []
  const laneOf = new Map<string, number>()

  for (const entry of sorted) {
    let lane = laneEnds.findIndex((end) => end + gap <= entry.x)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(entry.x + entry.width)
    } else {
      laneEnds[lane] = entry.x + entry.width
    }
    laneOf.set(entry.id, lane)
  }

  return { laneOf, laneCount: laneEnds.length }
}
