type Tuple<
  T,
  N extends number,
  R extends readonly T[] = [],
> = R["length"] extends N ? R : Tuple<T, N, readonly [T, ...R]>;

export enum NodeState {
  VOID,
  PLAYER,
  PLAYER_ON_GOAL,
  MAZE,
  BOX,
  GOAL,
  FILLED_GOAL,
}

export enum Dimensions {
  X,
  Y,
  Z,
  T,
  U,
  V,
}

export type ValidDimensions = 2 | 3 | 4 | 5 | 6;
export type ValidDimensionSize =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30;
export type ValidDimensionSizes =
  | Tuple<ValidDimensionSize, 2>
  | Tuple<ValidDimensionSize, 3>
  | Tuple<ValidDimensionSize, 4>
  | Tuple<ValidDimensionSize, 5>
  | Tuple<ValidDimensionSize, 6>;
export type Map2D = NodeState[][];
export type Map3D = NodeState[][][];
export type Map4D = NodeState[][][][];
export type Map5D = NodeState[][][][][];
export type Map6D = NodeState[][][][][][];

export type LevelMap = Map2D | Map3D | Map4D | Map5D | Map6D;
