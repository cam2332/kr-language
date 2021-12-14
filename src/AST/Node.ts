import Position from '../types/Position'

export default class Node {
  $type: string = 'Node'
  $position: Position = {
    start: { line: -1, column: -1 },
    end: { line: -1, column: -1 },
  }

  constructor(type: string, position: Position) {
    this.$type = type
    this.$position = position
  }

  public toJSON(): any {
    return {
      Node: {},
    }
  }
}
