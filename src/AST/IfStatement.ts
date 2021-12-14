import Position from '../types/Position'
import BlockStatement from './BlockStatement'
import Node from './Node'

export default class IfStatement extends Node {
  constructor(
    public test: Node,
    public consequent: BlockStatement,
    public alternate: BlockStatement | IfStatement | undefined,
    position: Position
  ) {
    super('IfStatement', position)
  }

  public toJSON(): any {
    return {
      IfStatement: {
        test: this.test,
        consequent: this.consequent,
        alternate: this.alternate,
      },
    }
  }
}
