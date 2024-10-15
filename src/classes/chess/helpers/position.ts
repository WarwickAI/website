export interface Position {
  row: number;
  column: number;
}

export function addPositions(pos1: Position, pos2: Position): Position {
  return {
    row: pos1.row + pos2.row,
    column: pos1.column + pos2.column,
  };
}

export function multiplyPosition(pos: Position, mult: number): Position {
  return {
    row: pos.row * mult,
    column: pos.column * mult,
  };
}
