// Opsomming-gedrag voor notitie-textareas: Enter zet een nieuw "- " neer,
// Shift+Enter blijft gewoon een regel binnen hetzelfde punt (standaardgedrag,
// niet onderschept), Backspace op een leeg punt ("- " zonder tekst) haalt het
// teken weg i.p.v. één teken te wissen.
export function handleBulletKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  setValue: (value: string) => void,
) {
  const el = e.currentTarget
  const { selectionStart, selectionEnd, value } = el
  if (selectionStart !== selectionEnd) return

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEndIdx = value.indexOf('\n', selectionStart)
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx
  const line = value.slice(lineStart, lineEnd)

  if (e.key === 'Enter' && !e.shiftKey) {
    const match = line.match(/^- (.*)$/)
    if (!match) return
    e.preventDefault()

    if (match[1].trim() === '' && selectionStart === lineEnd) {
      // Leeg punt: stop de lijst i.p.v. nog een leeg punt toe te voegen.
      applyChange(el, setValue, value.slice(0, lineStart) + value.slice(lineEnd), lineStart)
    } else {
      const insertion = '\n- '
      applyChange(
        el,
        setValue,
        value.slice(0, selectionStart) + insertion + value.slice(selectionEnd),
        selectionStart + insertion.length,
      )
    }
    return
  }

  if (e.key === 'Backspace' && line === '- ' && selectionStart === lineStart + 2) {
    e.preventDefault()
    applyChange(el, setValue, value.slice(0, lineStart) + value.slice(lineEnd), lineStart)
  }
}

function applyChange(
  el: HTMLTextAreaElement,
  setValue: (value: string) => void,
  newValue: string,
  cursor: number,
) {
  setValue(newValue)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = cursor
  })
}
