export default class Node {
  $type: string = 'Node'
  $position: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  } = { start: { line: -1, column: -1 }, end: { line: -1, column: -1 } }

  public toJSON(): any {
    return {
      Node: {},
    }
  }
}
