import React, {Component} from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { visualizeAlgorithm } from "../algorithms/visualizingFunctions";
//import { act } from "react-dom/test-utils";

const text = `
    Hello! And welcome to my Pathfinding-visualizer app!\n
    This app visualizes algorithms that find shortest paths between two points.\n
    You can choose between A* or Dijkstra (currently, but more will be implemented).
    You can press the squares on your screen to make walls that cannot be passed through.
    You can also hold down your mouse and drag it across the screen to make several in one go!
    If you want to visualize how the algorithm finds the shortest path, simply click visualize! :)
    You can also drag around the finish and start squares to change where the algorithm starts
    and where it finishes.
    You can reset the grid by pressing the reset-button, or generate a random maze (just random
    walls) by pressing the generate-button. Have fun!
    \n\n
    Source code can be found at https://github.com/mathipe98
    `;


export default class PathfindingVisualizer extends Component {
    
    constructor(props) {
        super(props);
        const stateVariable = {
            currentAlgorithm: 'Dijkstra',
            grid: [],
            mousePressed: false,
            animationIsActive: false,
            canChangeGrid: true,
            grabbedStart: false,
            grabbedFinish: false,
            START_ROW: 0,
            START_COL: 0,
            FINISH_ROW: 9,
            FINISH_COL: 29,
        }
        this.state = stateVariable;
        // Use ReactRef to refer to infoSheet, and consequently remove it
        this.infoSheetRef = React.createRef();
        this.removeInfoSheet = this.removeInfoSheet.bind(this);
    }

    /*
    Function that will be called after render(). If no key is sent in the props of
    the component, this function will only run once.
    */
    componentDidMount() {
        const {START_ROW, START_COL, FINISH_ROW, FINISH_COL} = this.state;
        const grid = createGrid(START_ROW, START_COL, FINISH_ROW, FINISH_COL);
        //State of the grid will be the list of nodes in the grid
        this.setState({grid});
    }

    // Function called when a button is clicked to visualize the result of
    // the pathfinding algorithm. Performed by calling to other helper-functions
    visualizeAlgorithm() {
        // Can't visualize anything if previous visualization hasn't been reset
        if (!this.state.canChangeGrid) return;
        const {grid, currentAlgorithm, START_ROW, START_COL, FINISH_ROW, FINISH_COL} = this.state;
        debugger;
        // Outsourced visualizing to clean up this file
        const timerLists = visualizeAlgorithm(grid, currentAlgorithm, START_ROW, START_COL, FINISH_ROW, FINISH_COL);
        this.lockInterfaceInAnimation(timerLists[0], timerLists[1]); //visitedNodesInOrder, shortestPath
    }

    // Reset all walls/visited nodes
    reset() {
        // Cannot reset if animation is active
        if (this.state.animationIsActive) return;
        const resetGrid = createGrid(0, 0, 9, 29);
        // Allow the change of the grid again
        this.setState({canChangeGrid: true, grid: resetGrid, START_ROW: 0, START_COL: 0, FINISH_ROW: 9, FINISH_COL: 29});

        // Because of changing classnames of DOM-elements, we have to reset their names
        const actualGrid = this.state.grid;
        for (let i = 0; i < actualGrid.length; i++) {
            for (let j = 0; j < actualGrid[i].length; j++) {
                const currentNode = actualGrid[i][j];
                // Reset all nodes except start and finish
                if (!currentNode.isStart && !currentNode.isFinish) {
                    document.getElementById(`node-${currentNode.row}-${currentNode.col}`).className = 'node';
                }
                else {
                    console.log(`Start or finish coords: ${currentNode.row}, ${currentNode.col}`);
                }
            }
        }
    }

    // Called when mouse is pressed down
    onMouseDown(row, col) {
        // Cannot change layout of grid if animation is active or reset has not been pushed
        if (this.state.animationIsActive || !this.state.canChangeGrid) {
            return;
        }
        // If current node is start, update state so that we know we are moving start-node
        if (this.state.grid[row][col].isStart) {
            this.setState({grabbedStart: true, mousePressed: true});
            return;
        }
        // Likewise for finish-node
        if (this.state.grid[row][col].isFinish) {
            this.setState({grabbedFinish: true, mousePressed: true});
            return;
        }
        // If we get here, then the entered node becomes a wall
        const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid, mousePressed: true});
    }

    // Called when cursor enters a node
    onMouseEnter(row, col) {
        if (!this.state.mousePressed) return;
        if (this.state.grabbedStart) {
            this.changeStartOrFinishNode(row, col, true);
            return;
        }
        if (this.state.grabbedFinish) {
            this.changeStartOrFinishNode(row, col, false);
            return;
        }
        const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid});
    }

    // Called when letting go of the mouse button
    onMouseUp() {
        if (this.state.animationIsActive || !this.state.canChangeGrid) return;
        const {grid, FINISH_ROW, FINISH_COL} = this.state;
        console.log(FINISH_ROW, FINISH_COL);
        const adjustedGrid = recalculateManDistance(grid, FINISH_ROW, FINISH_COL);
        this.setState({grid: adjustedGrid, mousePressed: false, grabbedFinish: false, grabbedStart: false});
    }

    // When dragging the start node, iterate through the grid and update accordingly
    // changeStart = true => change start-node, else change finish-node
    changeStartOrFinishNode(row, col, changeStart) {
        // Create a copy and setState because it will update with each change, and
        // not just update when letting go (which happens if you directly modify state.grid)
        const copyGrid = this.state.grid.slice();
        for (let i = 0; i < copyGrid.length; i++) {
            for (let j = 0; j < copyGrid[i].length; j++) {
                const node = copyGrid[i][j];

                // Change the start-node
                if (changeStart) {
                    if (node.isStart) {
                        // Remember to set distance to infinity when node isn't start
                        copyGrid[i][j] = {
                            ...node,
                            isStart: !node.isStart,
                            distance: Infinity,
                        };
                    }
                    // If this is true, then this is the current node which we want to change to
                    if (row === i & col === j) {
                        // Likewise, set distance to 0 when node is start
                        copyGrid[i][j] = {
                            ...node,
                            isStart: true,
                            distance: 0,
                        };
                    }
                }

                // Change finish node
                else {
                    if (node.isFinish) {
                        copyGrid[i][j] = {
                            ...node,
                            isFinish: !node.isFinish,
                        };
                    }
                    if (row === i & col === j) {
                        copyGrid[i][j] = {
                            ...node,
                            isFinish: true,
                        };
                    }
                }
            }
        }
        // Set state to update with each change
        if (changeStart) {
            this.setState({grid: copyGrid, START_ROW: row, START_COL: col});
        }
        else {
            this.setState({grid: copyGrid, FINISH_ROW: row, FINISH_COL: col});
        }
    }
    

    // Set state-variable to know which algorithm to visualize
    setAlgorithmOnClick(algorithm) {
        if (this.state.animationIsActive || !this.state.canChangeGrid) return;
        // Highlight the algorithm that is chosen such that it remains highlighted post-click
        highlightButtons(algorithm);
        this.setState({currentAlgorithm: algorithm});
    }

    // Function that makes sure that we cannot alter the grid when animation is ongoing
    lockInterfaceInAnimation(visitedNodesInOrder, shortestPath) {
        // animationIsActive makes sure we cannot change the grid layout mid-animation
        // canChangeGrid makes sure we cannot change grid post-animation; we have to press
        // the reset button in order to be able to change the grid again.
        this.setState({animationIsActive: true, canChangeGrid: false});
        setTimeout(() => {
            this.setState({animationIsActive: false});
        }, 15 * (visitedNodesInOrder.length + 1) + 50 * (shortestPath.length + 1) + 1000);
    }

    // Iterates through all nodes in the grid and generates a random number
    // that decides whether or not a node is a wall
    // Note: it does not take into account if a node already is a wall, so if
    // called several times, more nodes will become walls
    generateRandomMaze(grid) {
        // If we are done with the animation, then we cannot create a random maze
        if (!this.state.canChangeGrid) return;
        // Calculate random row/col values to set a random start/finish at the end of the function
        const randomNumbers = getRandomStartFinish(grid);
        const randomRow1 = randomNumbers[0];
        const randomRow2 = randomNumbers[1];
        const randomCol1 = randomNumbers[2];
        const randomCol2 = randomNumbers[3];

        //Create a new grid instead of altering the current one
        const cleanGrid = createGrid(randomRow1, randomCol1, randomRow2, randomCol2);
        for (let i = 0; i < cleanGrid.length; i++) {
            for (let j = 0; j < cleanGrid[i].length; j++) {
                const node = cleanGrid[i][j];

                if (node.isStart || node.isFinish) continue;
                // Random number between 0 and 9
                const randomNumber = Math.floor(Math.random() * 10);
                // The higher the number on the right, the more walls generated
                // 3 seemed like a fair balance; 30% of nodes will be walls
                if (randomNumber < 3) {
                    node.isWall = true;
                }
            }
        }
        this.setState({grid: cleanGrid, START_ROW: randomRow1, START_COL: randomCol1, FINISH_ROW: randomRow2, FINISH_COL: randomCol2});
    }

    // Remove the text-box that informs the user of the app-functionality
    removeInfoSheet() {
        this.infoSheetRef.current.remove();
    }


    render() {
        //Extract list of nodes currently in the grid
        const {grid, mousePressed} = this.state;
        /*
        Inside the return function, we will iterate through all rows, and for each row
        we will create a <Node></Node> object for each column.
        This will in essence translate to making a single box for each item in 
        the nodes-array. Keep note of indexes to assess position of each node
        */
        return (
            <>
                <div className="infoSheet" ref={this.infoSheetRef} onMouseUp={() => this.onMouseUp()}>
                    <div className="boxclose" onClick={() => this.removeInfoSheet()}></div>
                    {text}
                </div>
                <div id={"menu"} onMouseUp={() => this.onMouseUp()}>
                    <button className="menuButton" onClick={() => this.visualizeAlgorithm()}>
                        Visualize
                    </button>
                    <button className="menuButton" onClick={() => this.reset()}>
                        Reset
                    </button>
                    <button className="algoButton active" id="Dijkstra" onClick={() => this.setAlgorithmOnClick("Dijkstra")}>
                        Dijkstra's
                    </button>
                    <button className="algoButton" id="Astar" onClick={() => this.setAlgorithmOnClick("Astar")} >
                        A*
                    </button>
                    <button className="menuButton" onClick={() => this.generateRandomMaze(grid)}>
                        Generate random maze
                    </button>
                </div>
                <div className="grid">
                    {grid.map((row, rowIndex) => {
                        return (
                        <div key={rowIndex} className="row">
                            {row.map((node, nodeIndex) => {
                                //extract attributes from node-object in map-function
                                const {
                                    row,
                                    col,
                                    isStart,
                                    isFinish,
                                    isVisited,
                                    isWall,
                                } = node;
                                return (
                                    <Node
                                    key={nodeIndex}
                                    row={row}
                                    col={col}
                                    isStart={isStart}
                                    isFinish={isFinish}
                                    isVisited={isVisited}
                                    isWall={isWall}
                                    mousePressed={mousePressed}
                                    onMouseDown={(row, col) => this.onMouseDown(row, col)}
                                    onMouseEnter={(row, col) => this.onMouseEnter(row, col)}
                                    onMouseUp={() => this.onMouseUp()}></Node>
                                    );
                            })}
                        </div>
                        );
                    })}
                </div>
            </>
        );
    }
}


// Calculates rows and columns in grid according to screen size
const rowsAndCols = calculateRowsAndCols();
const rows = rowsAndCols[0];
const cols = rowsAndCols[1];

//Helper function for creating an array of arrays with nodes
function createGrid(START_ROW, START_COL, FINISH_ROW, FINISH_COL) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        const currentRow = [];
        for (let j = 0; j < cols; j++) {
            const currentNode = createNode(i, j, START_ROW, START_COL, FINISH_ROW, FINISH_COL);
            currentRow.push(currentNode);
        }
        grid.push(currentRow);
    }
    return grid;
}

//Helper function for creating a node with attributes for usage in pathfinding-algorithms
function createNode(row, col, START_ROW, START_COL, FINISH_ROW, FINISH_COL) {
    const isStart = (row === START_ROW && col === START_COL);
    const isFinish = (row === FINISH_ROW && col === FINISH_COL);
    // Manhattan distance for use in A*
    const manDistance = Math.abs(row - FINISH_ROW) + Math.abs(col - FINISH_COL);
    const currentNode = {
        row,
        col,
        isStart,
        isFinish,
        isVisited: false,
        isWall: false,
        distance: isStart ? 0 : Infinity,
        cost: 1,
        manDistance,
        total: isStart ? 0 : Infinity,
        predecessor: null,
    };
    return currentNode;
}

//Create a copy grid with the node passed in as a wall
function getGridWithWalls(grid, row, col) {
    const copyGrid = grid.slice();
    const node = copyGrid[row][col];
    copyGrid[row][col] = {
        ...node,
        isWall: !node.isWall,
    };
    return copyGrid;
}

function recalculateManDistance(grid, FINISH_ROW, FINISH_COL) {
    const resultGrid = grid.slice();
    for (let i = 0; i < resultGrid.length; i++) {
        for (let j = 0; j < resultGrid[i].length; j++) {
            const node = resultGrid[i][j];
            const distance = Math.abs(i - FINISH_ROW) + Math.abs(j - FINISH_COL);
            resultGrid[i][j] = {
                ...node,
                manDistance: distance,
            };
        }
    }
    return resultGrid;
}

// Calculates how many nodes will appear according to screen size
function calculateRowsAndCols() {
    const screen = document.getElementById("body");
    const screenWidth = screen.offsetWidth;
    const screenHeight = screen.offsetHeight;
    if (screenWidth <= 1280 && screenHeight <= 590) {
        // Reduce height by 144px since this is the height of the menu
        // gridHeight = bodyHeight - menuHeight. Ref: PathfindingVisualizer.css
        return [Math.floor((screenHeight - 144) / 24), Math.floor(screenWidth / 24)];
    }
    else if (screenWidth <= 1920 && screenHeight <= 940) {
        // menuHeight = 217px
        return [Math.floor((screenHeight - 217) / 24), Math.floor(screenWidth / 24)];
        //return [30, 76];
    }
    else { //Assume max screen size and resolution is 2560x1440 and size = 27"
        // menuHeight = 241px
        return [Math.floor((screenHeight - 241) / 24), Math.floor(screenWidth / 24)];
    }
}

function getRandomValues(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomStartFinish(grid) {
    // Calculate random row/col values to set a random start/finish at the end of the function
    let randomRow1 = getRandomValues(0, grid.length - 1);
    let randomRow2 = getRandomValues(0, grid.length - 1);
    let randomCol1 = getRandomValues(0, grid[0].length - 1);
    let randomCol2 = getRandomValues(0, grid[0].length - 1);
    // If they are the exact same, which is extremely unlikely, but nonetheless possible
    if (randomRow1 === randomRow2 && randomCol1 === randomCol2) {
        let ok = false;
        while (!ok) {
            randomRow1 = getRandomValues(0, grid.length - 1);
            randomRow2 = getRandomValues(0, grid.length - 1);
            randomCol1 = getRandomValues(0, grid[0].length - 1);
            randomCol2 = getRandomValues(0, grid[0].length - 1);
            if (randomRow1 !== randomRow2 || randomCol1 !== randomCol2) {
                ok = true;
            }
        }
    }
    console.log(`Max row: ${grid.length}. Max col: ${grid[0].length}`);
    console.log(`Random rows: ${randomRow1}, ${randomRow2}. Random cols: ${randomCol1}, ${randomCol2}`);
    return [randomRow1, randomRow2, randomCol1, randomCol2];
}

// Directly access the DOM-elements with id/className instead of adding
// eventListener-functions because those functions cannot take into account
// that the animation is ongoing or that the grid hasn't reset
function highlightButtons(id) {
    const activeButton = document.getElementsByClassName("active")[0];
    activeButton.className = activeButton.className.replace(" active", "");
    document.getElementById(id).className += " active";
}

/*
for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }
*/