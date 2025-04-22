import { Level } from "./level";
import { Dimensions, NodeState } from "./types";

enum Difficulty {
  easy,
  hard,
}

enum Direction {
  positive = 1,
  negative = -1,
}

export class Engine {
  moveCount: number;
  initialState: string;
  difficulty: Difficulty;
  level: Level;

  constructor(difficulty: Difficulty) {
    this.moveCount = 0;
    this.difficulty = difficulty;
    this.level = new Level(2, [2, 2]);
    this.initialState = this.level.serializeMap();
  }

  loadLevel(serializedMap: string) {
    this.level.loadMap(serializedMap);
    if (this.level.gameReady()) {
      this.initialState = serializedMap;
    } else {
      throw new Error("The level loaded is not a valid, playable level.");
    }
  }

  restart() {
    this.moveCount = 0;
    this.level.loadMap(this.initialState);
  }

  move(dimension: Dimensions, direction: Direction) {
    let hasMoved = false;
    const startPosition = this.level.findPlayer();
    const startNodeState = this.level.getNodeState(startPosition);
    const targetPosition = startPosition
      .slice()
      .reverse()
      .splice(dimension, 1, startPosition.reverse()[dimension] + direction)
      .reverse();
    const validTargets = [NodeState.MAZE, NodeState.GOAL];
    const targetNodeState = this.level.getNodeState(targetPosition);
    if (targetNodeState) {
      if (validTargets.includes(targetNodeState)) {
        this.level.setNodeState(
          targetPosition,
          targetNodeState === NodeState.GOAL
            ? NodeState.PLAYER_ON_GOAL
            : NodeState.PLAYER,
        );
        this.level.setNodeState(
          startPosition,
          startNodeState === NodeState.PLAYER_ON_GOAL
            ? NodeState.GOAL
            : NodeState.MAZE,
        );
        hasMoved = true;
      }
      if ([NodeState.BOX, NodeState.FILLED_GOAL].includes(targetNodeState)) {
        const targetBoxPosition = targetPosition
          .slice()
          .reverse()
          .splice(dimension, 1, startPosition.reverse()[dimension] + direction)
          .reverse();
        const targetBoxNodeState = this.level.getNodeState(targetBoxPosition);
        if (targetBoxNodeState && validTargets.includes(targetBoxNodeState)) {
          this.level.setNodeState(
            targetBoxPosition,
            targetBoxNodeState === NodeState.GOAL
              ? NodeState.FILLED_GOAL
              : NodeState.BOX,
          );
          this.level.setNodeState(
            targetPosition,
            targetNodeState === NodeState.GOAL
              ? NodeState.PLAYER_ON_GOAL
              : NodeState.PLAYER,
          );
          this.level.setNodeState(
            startPosition,
            startNodeState === NodeState.PLAYER_ON_GOAL
              ? NodeState.GOAL
              : NodeState.MAZE,
          );
          hasMoved = true;
        }
      }
    }
    if (hasMoved || this.difficulty === Difficulty.hard) {
      this.moveCount++;
    }
  }
}
