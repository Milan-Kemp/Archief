export function parseList(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function joinList(list: string[]): string {
  return list.join(', ')
}
