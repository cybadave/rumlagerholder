import cloneDeep from "lodash.clonedeep";
import {
  Dimensions,
  LevelMap,
  Map2D,
  Map3D,
  Map4D,
  Map5D,
  Map6D,
  NodeState,
  ValidDimensions,
  ValidDimensionSizes,
} from "./types";

export class Level {
  map: LevelMap;
  dimensionCount: ValidDimensions;
  dimensionSizes: ValidDimensionSizes;

  constructor(
    dimensionCount: ValidDimensions,
    dimensionSizes: ValidDimensionSizes,
  ) {
    if (dimensionSizes.length !== dimensionCount) {
      throw new Error(
        "Length of size array must be equal to supplied dimensions",
      );
    }
    this.dimensionCount = dimensionCount;
    this.dimensionSizes = dimensionSizes;
    this.map = this.emptyMap(dimensionCount, dimensionSizes);
  }

  private emptyMap(
    dimensions: ValidDimensions,
    size: ValidDimensionSizes,
  ): LevelMap {
    const dimensionArrays = Array(dimensions);
    dimensionArrays[0] = Array(size[size.length - 1]).fill(NodeState.VOID);
    for (let i = 1; i < dimensions; i++) {
      dimensionArrays[i] = [];
      for (let j = 0; j < size[size.length - i - 1]; j++) {
        dimensionArrays[i].push(cloneDeep(dimensionArrays[i - 1]));
      }
    }
    return dimensionArrays[dimensions - 1] as LevelMap;
  }

  private calculateDimensionsAndSizeFromMap() {
    let dimensionCount = 0;
    const dimensionSizes: number[] = [];
    let checkMap = JSON.parse(JSON.stringify(this.map));
    while (typeof checkMap !== "number") {
      dimensionSizes.push(checkMap.length);
      checkMap = checkMap[0];
      dimensionCount++;
    }
    if (dimensionCount < 2 || dimensionCount > 6) {
      throw new Error("Map has dimensions outside the valid range [2-6]");
    }
    for (let i = 0; i < dimensionCount; i++) {
      if (dimensionSizes[i] < 2 || dimensionSizes[1] > 30) {
        throw new Error(
          `Map has invalid dimensionSize of ${dimensionSizes[i]} for dimension ${this.getDimensionName(dimensionCount, i)} (valid range is [2-30])`,
        );
      }
    }
    this.dimensionCount = dimensionCount as ValidDimensions;
    this.dimensionSizes =
      dimensionSizes.reverse() as unknown as ValidDimensionSizes;
  }

  private getDimensionName(dimensionCount: number, dimensionIndex: number) {
    return Object.values(Dimensions).slice(0, dimensionCount).reverse()[
      dimensionIndex
    ];
  }

  getDimensionSize(dimension: Dimensions) {
    return Array.from(this.dimensionSizes).reverse()[dimension];
  }

  setNodeState(indices: number[], nodeState: NodeState) {
    if (!this.map) {
      throw new Error("Map not yet instantiated");
    }
    this.validateIndices(indices);
    switch (this.dimensionCount) {
      case 2:
        (this.map as Map2D)[indices[0]][indices[1]] = nodeState;
        break;
      case 3:
        (this.map as Map3D)[indices[0]][indices[1]][indices[2]] = nodeState;
        break;
      case 4:
        (this.map as Map4D)[indices[0]][indices[1]][indices[2]][indices[3]] =
          nodeState;
        break;
      case 5:
        (this.map as Map5D)[indices[0]][indices[1]][indices[2]][indices[3]][
          indices[4]
        ] = nodeState;
        break;
      case 6:
        (this.map as Map6D)[indices[0]][indices[1]][indices[2]][indices[3]][
          indices[4]
        ][indices[5]] = nodeState;
        break;
    }
  }

  getNodeState(indices: number[]): NodeState | undefined {
    if (!this.map) {
      throw new Error("Map not yet instantiated");
    }
    this.validateIndices(indices);
    switch (indices.length) {
      case 2:
        return (this.map as Map2D)[indices[0]][indices[1]];
      case 3:
        return (this.map as Map3D)[indices[0]][indices[1]][indices[2]];
      case 4:
        return (this.map as Map4D)[indices[0]][indices[1]][indices[2]][
          indices[3]
        ];
      case 5:
        return (this.map as Map5D)[indices[0]][indices[1]][indices[2]][
          indices[3]
        ][indices[4]];
      case 6:
        return (this.map as Map6D)[indices[0]][indices[1]][indices[2]][
          indices[3]
        ][indices[4]][indices[5]];
    }
  }

  validateIndices(indices: number[]) {
    if (indices.length !== this.dimensionCount) {
      throw new Error(
        `Indexing error: indices of length(${indices.length}) can not be used to index a ${this.dimensionCount} dimensional level map`,
      );
    }
    for (let i = 0; i < this.dimensionCount; i++) {
      if (indices[i] < 0 || indices[i] >= this.dimensionSizes[i]) {
        throw new Error(
          `Indexing error at indices[${i}]: value(${indices[i]}) is outside the valid rage of 0-${this.dimensionSizes[i] - 1} for dimension ${this.getDimensionName(this.dimensionCount, i)}`,
        );
      }
    }
  }

  report() {
    return `This is a ${this.dimensionCount} dimensional map of size [ ${this.dimensionSizes.join(" x ")} ]`;
  }

  serializeMap() {
    return JSON.stringify(this.map);
  }

  loadMap(map: string) {
    try {
      this.map = JSON.parse(map);
    } catch {
      throw new Error("Invalid map data");
    }
    this.calculateDimensionsAndSizeFromMap();
  }

  countBoxes() {
    return this.map.flat().filter((node) => node === NodeState.BOX).length;
  }

  countGoals() {
    return this.map
      .flat()
      .filter(
        (node) => node === NodeState.GOAL || node === NodeState.PLAYER_ON_GOAL,
      ).length;
  }

  countFilledGoals() {
    return this.map.flat().filter((node) => node === NodeState.FILLED_GOAL)
      .length;
  }

  countPlayer() {
    return this.map.flat().filter((node) => node === NodeState.PLAYER).length;
  }

  findPlayerRecursive(
    map: LevelMap | NodeState[],
    indices: number[],
  ): number[] {
    if (typeof map[0] === "number") {
      indices.push(
        (map as NodeState[]).indexOf(NodeState.PLAYER) ||
          (map as NodeState[]).indexOf(NodeState.PLAYER_ON_GOAL),
      );
      return indices;
    }
    for (let index = 0; index < map.length; index++) {
      const value = map[index] as LevelMap;
      if (
        value
          .flat()
          .find(
            (node) =>
              node === NodeState.PLAYER || node === NodeState.PLAYER_ON_GOAL,
          )
      ) {
        indices.push(index);
        return this.findPlayerRecursive(value as LevelMap, indices);
      }
    }
    return indices;
  }

  findPlayer() {
    return this.findPlayerRecursive(this.map, []);
  }

  gameReady() {
    return (
      this.countBoxes() === this.countGoals() &&
      this.findPlayer().length > 0 &&
      this.countFilledGoals() === 0
    );
  }

  gameWon() {
    return (
      this.countBoxes() === 0 &&
      this.countGoals() === 0 &&
      this.countFilledGoals() > 0
    );
  }
}
