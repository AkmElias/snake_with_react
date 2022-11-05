import { useEffect, useState, useRef } from "react";
import "./App.css";
import styles from "./styles/Snake.module.css";

const Config = {
  height: 20,
  width: 20,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 0,
        };

      case CellType.Food:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };

      default:
        return {};
    }
  };
  return (
    <div
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getFoodInRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  expireTime: new Date().getTime() + 15000,
});

function App() {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const getDefaultFood = () => [
    { x: 4, y: 10, expireTime: new Date().getTime() + 10000 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  const [foods, setFoods] = useState(getDefaultFood());
  const [score, setScore] = useState(0);


  //restart the game
  const restartGame = () => {
    setSnake(getDefaultSnake());
    setFoods(getDefaultFood());
    setDirection(Direction.Right);
    setScore(0);
  };

  //remove the eaten food
  const eraseFood = (position) => {
    let newFoods = [...foods.filter(
      (food) => position.x !== food.x || position.y !== food.y
    )];
    setFoods(newFoods);
  };

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        //reappearing snake
        if (newHead.x === -1) newHead.x = Config.width - 1;;
        if (newHead.x === Config.width) newHead.x = 0;
        if (newHead.y === -1) newHead.y = Config.height - 1;
        if (newHead.y === Config.height) newHead.y = 0;

        //restarting game
        if (isSnake(newHead)) {
          let test = isSnake(newHead);
          // recheck for some glitch remain , hopefully will solve this someday
          if (snake.find((position) => position.x === test.x && position.y === test.y)) {
             restartGame();
          }
        }
       
        let newSnake = [newHead, ...snake];
        newSnake.pop();
        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction]);

 
  // update score and snake size whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      setScore((score) => {
        return score + 1;
      });

      eraseFood(head);

      //change snake's size
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];
        return newSnake;
      });
    }
  }, [snake]);

  // appear random food every 3 seconds
  useEffect(() => {
    const appearFood = () => {
      setFoods((foods) => {
        let newFood = getFoodInRandomCell();
        while (isSnake(newFood) || isFood(newFood)) {
          newFood = getFoodInRandomCell();
        }
        let newFoods = [newFood, ...foods];
        return newFoods;
      });
    };

    // appearFood();
    const timer = setInterval(appearFood, 3000);
    return () => clearInterval(timer);
  }, []);

  //disappearing expired food
  useEffect(() => {
    const disappearFood = () => {
     let currentTime = new Date().getTime();
      let newFoods;
      setFoods((foods) => {
        newFoods = [...foods.filter(food => food.expireTime > currentTime)];
        return newFoods;
      });
    };

    // removeFood();
    const timer = setInterval(disappearFood, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setDirection((direction) => {
            if (
              direction.x === Direction.Bottom.x &&
              direction.y === Direction.Bottom.y
            )
              return direction;
            return Direction.Top;
          });

          break;

        case "ArrowDown":
          setDirection((direction) => {
            if (
              direction.x === Direction.Top.x &&
              direction.y === Direction.Top.y
            )
              return direction;
            return Direction.Bottom;
          });

          break;

        case "ArrowLeft":
          setDirection((direction) => {
            if (
              direction.x === Direction.Right.x &&
              direction.y === Direction.Right.y
            )
              return direction;
            return Direction.Left;
          });

          break;

        case "ArrowRight":
          setDirection((direction) => {
            if (
              direction.x === Direction.Left.x &&
              direction.y === Direction.Left.y
            )
              return direction;
            return Direction.Right;
          });

          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // const isFood = ({ x, y }) => food?.x === x && food?.y === y;
  const isFood = ({ x, y }) =>
    foods.find((position) => position.x === x && position.y === y);

  const isSnake = ({ x, y }) => {
    return snake.find((position) => position.x === x && position.y === y);
  }
    

  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.Food;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
  }

  return (
    <div className="App">
      <div className={styles.container}>
        <div
          className={styles.header}
          style={{ width: Config.width * Config.cellSize }}
        >
          Score: {score}
          <p>Foods on the board {foods.length}</p>
        </div>
        <div
          className={styles.grid}
          style={{
            height: Config.height * Config.cellSize,
            width: Config.width * Config.cellSize,
          }}
        >
          {cells}
        </div>
      </div>
    </div>
  );
}

export default App;