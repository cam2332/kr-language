import Position from './Position'

export default interface KrError {
  name: string
  message: string
  position: Position
}
