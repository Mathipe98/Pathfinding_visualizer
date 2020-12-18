import React, {Component} from "react";
import Node from "./Node";
import "./PathfindingVisualizer.css";
import {dijkstraSearch, getShortestPath} from "../algorithms/dijkstra.js";
import { act } from "react-dom/test-utils";


const rows = 18;
const cols = 53;

const START_ROW = 0;
const START_COL = 0;
const FINISH_ROW = 9;
const FINISH_COL = 29;

export default class PathfindingVisualizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
        //console.log(`Dijkstra result: ${shortestPath}`)
        //State of the grid will be the list of nodes in the grid
        this.setState({grid});
    }

    // Function called when a button is clicked to visualize the result of
    // the pathfinding algorithm. Performed by calling to other helper-functions
    visualizeDijkstras() {
        if (!this.state.canChangeGrid) return;
        const {grid} = this.state;
        const startNode = grid[START_ROW][START_COL];
        const finishNode = grid[FINISH_ROW][FINISH_COL];
        const visitedNodesInOrder = dijkstraSearch(grid, startNode, finishNode);
        const shortestPath = getShortestPath(finishNode);
        this.animateDijkstras(visitedNodesInOrder, shortestPath);
        this.lockInterfaceInAnimation(visitedNodesInOrder, shortestPath);
    }

    /* NOTE 1
        The way we animate the pathfinder-algorithm, is to have
        an array of visited nodes, and create a copy of the existing
        grid every time we iterate through a visited node.
        This is as an external function that sets a timeout every time
        a node is iterated, instead of being taken care of inside of
        the render function. We iterate through all visited nodes, and
        for each node, we create a copy grid, and a copy node.
        We replace the existing node in the copy grid, with the
        copy node that has updated its isVisited-state.
        We pass in the copy grid as the new state of the React-component,
        and set a timeout. Therefore, the state will update itself with
        an interval of the timeout-value, which will be perceived as
        individual boxes changing their layouts because every state-update
        changes a single node. 
    */
   /* NOTE 2
        The aforementioned approach worked, however it was extremely slow and tedious.
        The new approach changes the classnames of the DOM-elements directly, instead of
        updating state (triggering re-render several times a second, which takes too much time).
        This is bad practice, but for this purpose it works just fine, and is a lot quicker.
        It also works easily because a node can only be in one of five states:
        start, finish, visited, wall, or shortest-path. Therefore we can update them without issues.
   */
    animateDijkstras(visitedNodesInOrder, shortestPath) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(shortestPath);
                }, 15 * i);
                return;
            }
            else {
                setTimeout(() => {
                    const node = visitedNodesInOrder[i];
                   if (!node.isStart) {
                       document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
                   }
                }, 15 * i);
            }
        }
    }

    animateShortestPath(shortestPath) {
        for (let i = 0; i < shortestPath.length; i++) {
            setTimeout(() => {
                const node = shortestPath[i];
                if (!node.isFinish) {
                    document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
                }
            }, 50 * i)
        }
    }

    // Reset all walls/visited nodes
    reset() {
        if (this.state.animationIsActive) return;
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
        if (this.state.animationIsActive || !this.state.canChangeGrid) {
            return;
        }
        else {
            const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid, mousePressed: true});
        }
    }

    onMouseEnter(row, col) {
        if (!this.state.mousePressed) return;
        const newGrid = getGridWithWalls(this.state.grid, row, col);
        this.setState({grid: newGrid});
    }

    onMouseUp() {
        this.setState({mousePressed: false});
    }

    lockInterfaceInAnimation(visitedNodesInOrder, shortestPath) {
        this.setState({animationIsActive: true, canChangeGrid: false});
        // Timeout in milliseconds will correspond to 65ms (15ms + 50ms) after
        // shortest path has been animated (added extra second to make sure all
        // animations are finished)
        setTimeout(() => {
            this.setState({animationIsActive: false});
        }, 15 * (visitedNodesInOrder.length + 1) + 50 * (shortestPath.length + 1) + 1000);
    }


    render() {
        console.log(document.getElementById("body").offsetWidth);
        console.log(document.getElementById("body").offsetHeight);
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
                <button onClick={() => this.visualizeDijkstras()}>
                    Visualize Dijkstra's Algorithm
                </button>
                <button className="reset" onClick={() => this.reset()}>Reset</button>
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
    const currentNode = {
        row,
        col,
        isStart: isStart,
        isFinish: isFinish,
        isVisited: false,
        isWall: false,
        distance: isStart ? 0 : Infinity,
        cost: 1,
        predecessor: null,
    };
    return currentNode;
}

function getGridWithWalls(grid, row, col) {
    const copyGrid = grid.slice();
    const node = copyGrid[row][col];
    const copyNode = {
        ...node,
        isWall: !node.isWall,
    };
    copyGrid[row][col] = copyNode;
    return copyGrid;
}

/*
const initializeGrid = () => {
        //Create a grid-array with a set length
        const grid = new Array(rows);

        //Add a new list to each index, such that grid[i][j] = node at row i, column j
        /*
            [         COLUMN
                i = 0 [j = 0, j = 1, j = 2, ...], ROW
                i = 1 [j = 0, j = 1, j = 2, ...]
            ]
        
       for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; i++) {
            grid[i][j] = new Spot(i, j);
        }
    }
}
*/