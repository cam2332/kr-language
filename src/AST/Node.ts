export default class Node {
  $type: string = 'Node'

  public toJSON(): any {
    return {
      Node: {},
    }
  }
}
