import Node from './Node'
import Position, { initMinusOne } from '../types/Position'
import Identifier from './Identifier'
import ClassMethod from './ClassMethod'
import ClassProperty from './ClassProperty'

export type Accessibility = 'public' | 'protected' | 'private'

export default class ClassDeclaration extends Node {
  constructor(
    public name: Identifier,
    public superClass: Identifier | undefined = undefined,
    public konstructors: ClassMethod[] = [],
    public fields: ClassProperty[] = [],
    public methods: ClassMethod[] = [],
    public position: Position = initMinusOne()
  ) {
    super('ClassDeclaration', position)
  }

  public toJSON(): any {
    return {
      ClassDeclaration: {
        name: this.name,
        superClass: this.superClass,
        constructors: this.konstructors,
        fields: this.fields,
        methods: this.methods,
        position: this.position,
      },
    }
  }
}
