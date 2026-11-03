'use strict'

/**
 * Orders page.versions for the version picker by display version.
 *
 * Antora sorts component versions on the `version` key of each branch's
 * antora.yml, and the current stable branch names its version `stable` so
 * the documentation is published under /reference/stable/. A named version
 * sorts ahead of every numeric one in Antora, which puts 3.7 in front of
 * 3.8 and leaves the picker reading nightly, 3.7, 3.8, 3.6. Sorting on the
 * display version instead gives the order a reader expects: named versions
 * such as nightly first, then numeric versions newest first.
 *
 * Usage: {{#each (sortVersions page.versions)}}
 */
const isNumeric = (version) => /^\d/.test(version)

const compareNumeric = (a, b) => {
  const partsA = a.split('.')
  const partsB = b.split('.')
  const length = Math.max(partsA.length, partsB.length)
  for (let i = 0; i < length; i++) {
    const numA = parseInt(partsA[i] || '0', 10)
    const numB = parseInt(partsB[i] || '0', 10)
    if (numA !== numB) return numA - numB
  }
  return 0
}

module.exports = (versions) => {
  if (!Array.isArray(versions)) return versions
  return versions.slice().sort((a, b) => {
    const displayA = String(a.displayVersion || a.version || '')
    const displayB = String(b.displayVersion || b.version || '')
    const numericA = isNumeric(displayA)
    const numericB = isNumeric(displayB)
    if (numericA !== numericB) return numericA ? 1 : -1
    if (numericA) return compareNumeric(displayB, displayA)
    return displayB.localeCompare(displayA, 'en', { numeric: true })
  })
}
