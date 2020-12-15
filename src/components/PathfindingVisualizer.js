import React, {Component} from "react";
import Node from "./Node";
import "./PathfindingVisualizer.css";
import dijkstraSearch from "../algorithms/dijkstra";


export default class PathfindingVisualizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [],
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

    visualizeDijkstras() {
        console.log('Starting visualizing');
        const {grid} = this.state;
        const startNode = grid[START_ROW][START_COL];
        const finishNode = grid[FINISH_ROW][FINISH_COL];
        const visitedNoderInOrder = dijkstraSearch(grid, startNode, finishNode);
        visitedNoderInOrder.forEach(node => {
            console.log(`(${node.row}, ${node.col})`);
        });
        console.log(visitedNoderInOrder);
        this.animateDijkstras(visitedNoderInOrder);
    }

    /*
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
        an interval of the timeout-value. 
    */
    animateDijkstras(visitedNodesInOrder) {
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                const copyGrid = this.state.grid.slice();
                const copyNode = {
                    ...node,
                    isVisited: true,
                };
                copyGrid[node.row][node.col] = copyNode;
                this.setState({grid: copyGrid});
            }, 20 * i);
        }
    }

    render() {
        //Extract list of nodes currently in the grid
        const {grid} = this.state;
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
                <div className="grid">
                    {grid.map((row, rowIndex) => {
                        return (
                        <div key={rowIndex} className="row">
                            {row.map((node, nodeIndex) => {
                                //extract isStart and isFinish from node object in map-function
                                const {row, col, isStart, isFinish, isVisited} = node;
                                return (
                                    <Node
                                    key={nodeIndex}
                                    row={row}
                                    col={col}
                                    isStart={isStart}
                                    isFinish={isFinish}
                                    isVisited={isVisited}></Node>
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


const rows = 20;
const cols = 50;
const START_ROW = 10;
const START_COL = 20;
const FINISH_ROW = 10;
const FINISH_COL = 35;


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
    const currentNode = {
        row,
        col,
        isStart: isStart,
        isFinish: (row === FINISH_ROW && col === FINISH_COL),
        isVisited: false,
        isWall: false,
        distance: isStart ? 0 : Infinity,
        cost: 1,
        predecessor: null,
        checked: false,
    };
    return currentNode;
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