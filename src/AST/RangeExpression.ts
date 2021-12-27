import Position from '../types/Position'
import Node from './Node'
import NumericLiteral from './NumericLiteral'

export default class RangeExpression extends Node {
  constructor(
    public start: NumericLiteral,
    public step: NumericLiteral,
    public end: NumericLiteral,
    position: Position
  ) {
    super('RangeExpression', position)
  }

  public toJSON(): any {
    return {
      RangeExpression: {
        start: this.start,
        step: this.step,
        end: this.end,
        position: this.$position,
      },
    }
  }
}
