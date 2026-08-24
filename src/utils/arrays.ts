/**
 * Array utility helpers.
 *
 * Prefer these over lodash for lightweight, tree-shakeable, type-safe operations.
 * Drop-in replacements for the most common lodash array/collection patterns.
 */

// ── Type guards ───────────────────────────────────────────────────────────────

/** Returns true only for real, non-null arrays. */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/** Returns true when value is null, undefined, an empty array, or an empty string. */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "string") return value.trim().length === 0
  if (typeof value === "object") return Object.keys(value as object).length === 0
  return false
}

/** Inverse of isEmpty. */
export function isNonEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

/** Returns true when value is null or undefined. */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

// ── Array coercion ────────────────────────────────────────────────────────────

/**
 * Safely coerces any API response to a typed array.
 *
 * Handles these common backend shapes:
 *   - Already an array               → returned as-is
 *   - null / undefined               → []
 *   - { data: T[] }                  → data field extracted
 *   - { data: T[], pagination: ... } → data field extracted
 *   - { items: T[] }                 → items field extracted
 *   - { results: T[] }               → results field extracted
 *   - Any other object / primitive   → []
 *
 * @example
 *   const plans = ensureArray<Plan>(apiResponse)
 */
export function ensureArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value === null || value === undefined) return []
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj["data"]))    return obj["data"] as T[]
    if (Array.isArray(obj["items"]))   return obj["items"] as T[]
    if (Array.isArray(obj["results"])) return obj["results"] as T[]
  }
  return []
}

// ── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Removes null and undefined values from an array and narrows the type.
 *
 * @example
 *   compact([1, null, 2, undefined, 3]) // [1, 2, 3]
 */
export function compact<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((v): v is T => v !== null && v !== undefined)
}

/**
 * Returns unique values from an array (shallow equality).
 *
 * @example
 *   uniq([1, 2, 2, 3]) // [1, 2, 3]
 */
export function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * Returns unique values from an array by a key selector.
 *
 * @example
 *   uniqBy(users, (u) => u.id)
 */
export function uniqBy<T>(arr: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set<unknown>()
  return arr.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Groups array items into a Record by a key selector.
 *
 * @example
 *   groupBy(orders, (o) => o.status)
 *   // { "pending": [...], "delivered": [...] }
 */
export function groupBy<T>(
  arr: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

// ── Numeric summaries ─────────────────────────────────────────────────────────

/**
 * Sums values from an array using a selector function.
 *
 * @example
 *   sumBy(orders, (o) => o.total) // 1500
 */
export function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((total, item) => total + fn(item), 0)
}

/**
 * Returns the min value in an array using a selector.
 *
 * @example
 *   minBy(items, (i) => i.price)
 */
export function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) return undefined
  return arr.reduce((min, item) => (fn(item) < fn(min) ? item : min))
}

/**
 * Returns the max value in an array using a selector.
 *
 * @example
 *   maxBy(items, (i) => i.price)
 */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) return undefined
  return arr.reduce((max, item) => (fn(item) > fn(max) ? item : max))
}

// ── Misc ──────────────────────────────────────────────────────────────────────

/**
 * Safely returns the first element of an array (or undefined).
 *
 * @example
 *   first([1, 2, 3]) // 1
 *   first([])        // undefined
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

/**
 * Safely returns the last element of an array (or undefined).
 *
 * @example
 *   last([1, 2, 3]) // 3
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

/**
 * Splits an array into chunks of the given size.
 *
 * @example
 *   chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
