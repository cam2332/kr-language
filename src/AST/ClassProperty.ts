import Node from './Node'
import Identifier from './Identifier'
import Position from '../types/Position'
import { Accessibility } from './ClassDeclaration'

export default class ClassProperty extends Node {
  constructor(
    public name: Identifier,
    public value: Node,
    public iStatic: boolean,
    public readonly: boolean,
    public accessibility: Accessibility,
    position: Position
  ) {
    super('ClassProperty', position)
  }

  public toJSON(): any {
    return {
      ClassProperty: {
        name: this.name,
        value: this.value,
        static: this.iStatic,
        readonly: this.readonly,
        accessibility: this.accessibility,
        position: this.$position,
      },
    }
  }
}
