import React, {Component} from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { visualizeAlgorithm } from "../algorithms/visualizingFunctions";

const rowsAndCols = calculateRowsAndCols();
//console.log(`Body width: ${body.offsetWidth}. Body height: ${body.offsetHeight}`);
console.log(`Number of rows: ${rowsAndCols[0]}. Number of cols: ${rowsAndCols[1]}`);
const rows = rowsAndCols[0];
const cols = rowsAndCols[1];

const START_ROW = 0;
const START_COL = 0;
const FINISH_ROW = 9;
const FINISH_COL = 29;

export default class PathfindingVisualizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAlgorithm: 'Dijkstra',
            grid: [],
            mousePressed: false,
            animationIsActive: false,
            canChangeGrid: true,
        };
    }

    /*
    Function that will be called after render(). If no key is sent in the props of
    the component, this function will only run once.
    */
    componentDidMount() {
        const grid = createGrid();
        //State of the grid will be the list of nodes in the grid
        this.setState({grid});
    }

    // Function called when a button is clicked to visualize the result of
    // the pathfinding algorithm. Performed by calling to other helper-functions
    visualizeAlgorithm() {
        console.log(this.state.canChangeGrid);
        if (!this.state.canChangeGrid) return;
        const {grid, currentAlgorithm} = this.state;
        console.log("Hello did we get here wtf");
        debugger;
        // Outsourced visualizing to clean up this file
        const timerLists = visualizeAlgorithm(grid, currentAlgorithm, START_ROW, START_COL, FINISH_ROW, FINISH_COL);
        this.lockInterfaceInAnimation(timerLists[0], timerLists[1]); //visitedNodesInOrder, shortestPath
    }

    // Reset all walls/visited nodes
    reset() {
        // Cannot reset if animation is active
        if (this.state.animationIsActive) return;
        // Allow the change of the grid again
        this.setState({canChangeGrid: true});
        // Because of changing classnames of DOM-elements, we have to reset their names
        const actualGrid = this.state.grid;
        for (let i = 0; i < actualGrid.length; i++) {
            for (let j = 0; j < actualGrid[i].length; j++) {
                const currentNode = actualGrid[i][j];
                // Reset all nodes except start and finish
                if (!currentNode.isStart && !currentNode.isFinish) {
                    document.getElementById(`node-${currentNode.row}-${currentNode.col}`).className = 'node';
                }
            }
        }

        const resetGrid = createGrid();
        this.setState({grid: resetGrid});
    }

    onMouseDown(row, col) {
        // Cannot change layout of grid if animation is active or reset has not been pushed
        if (this.state.animationIsActive || !this.state.canChangeGrid) {
            return;
        }
        const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid, mousePressed: true});
    }

    onMouseEnter(row, col) {
        if (!this.state.mousePressed) return;
        const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid});
    }

    onMouseUp() {
        if (this.state.animationIsActive || !this.state.canChangeGrid) return;
        this.setState({mousePressed: false});
    }

    // Set state-variable to know which algorithm to visualize
    setAlgorithmOnClick(algorithm) {
        if (this.state.animationIsActive || !this.state.canChangeGrid) return;
        this.setState({currentAlgorithm: algorithm});
    }

    lockInterfaceInAnimation(visitedNodesInOrder, shortestPath) {
        // animationIsActive makes sure we cannot change the grid layout mid-animation
        // canChangeGrid makes sure we cannot change grid post-animation; we have to press
        // the reset button in order to be able to change the grid again.
        this.setState({animationIsActive: true, canChangeGrid: false});
        setTimeout(() => {
            this.setState({animationIsActive: false});
        }, 15 * (visitedNodesInOrder.length + 1) + 50 * (shortestPath.length + 1) + 1000);
    }

    generateRandomMaze(grid) {
        if (!this.state.canChangeGrid) return;
        const copyGrid = grid.slice();
        for (let i = 0; i < copyGrid.length; i++) {
            for (let j = 0; j < copyGrid[i].length; j++) {
                const node = copyGrid[i][j];
                if (node.isStart || node.isFinish) continue;
                const randomNumber = Math.floor(Math.random() * 10);
                if (randomNumber < 3) {
                    copyGrid[i][j] = {
                        ...node,
                        isWall: !node.isWall,
                    };
                }
            }
        }
        this.setState({grid: copyGrid});
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
                <div id={"menu"}>
                    <button className="menuButton" onClick={() => this.visualizeAlgorithm()}>
                        Visualize
                    </button>
                    <button className="menuButton" onClick={() => this.reset()}>
                        Reset
                    </button>
                    <button className="menuButton" onClick={() => this.setAlgorithmOnClick("Astar")} >
                        A*
                    </button>
                    <button className="menuButton" onClick={() => this.setAlgorithmOnClick("Dijkstra")}>
                        Dijkstra's
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



//Helper function for creating an array of arrays with nodes
function createGrid() {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        const currentRow = [];
        for (let j = 0; j < cols; j++) {
            const currentNode = createNode(i, j);
            currentRow.push(currentNode);
        }
        grid.push(currentRow);
    }
    return grid;
}

//Helper function for creating a node with attributes for usage in pathfinding-algorithms
function createNode(row, col) {
    const isStart = (row === START_ROW && col === START_COL);
    const isFinish = (row === FINISH_ROW && col === FINISH_COL);
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

function getGridWithWalls(grid, row, col) {
    const copyGrid = grid.slice();
    const node = copyGrid[row][col];
    copyGrid[row][col] = {
        ...node,
        isWall: !node.isWall,
    };
    return copyGrid;
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
