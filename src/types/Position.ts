export default interface Position {
  start: { line: number; column: number }
  end: { line: number; column: number }
}

/**
 * @returns default values (-1) for  position
 */
export function initMinusOne(): Position {
  return {
    start: { line: -1, column: -1 },
    end: { line: -1, column: -1 },
  }
}
