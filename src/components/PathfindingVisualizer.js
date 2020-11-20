import React, {Component} from "react";
import Node from "./Node";
import "./PathfindingVisualizer.css";


export default class PathfindingVisualizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
        };
    }

    /*
    Function that will be called after render(). If no key is sent in the props of
    the component, this function will only run once.
    */
    componentDidMount() {
        const nodes = createGrid();
        //State of the grid will be the list of nodes in the grid
        this.setState({nodes});
    }

    render() {
        //Extract list of nodes currently in the grid
        const {nodes} = this.state;

        /*
        Inside the return function, we will iterate through all rows, and for each row
        we will create a <Node></Node> object for each column.
        This will in essence translate to making a single box for each item in 
        the nodes-array. Keep note of indexes to assess position of each node
        */
        return (
            <div className="grid">
                {nodes.map((row, rowIndex) => {
                    return (
                    <div key={rowIndex} className="row">
                        {row.map((node, nodeIndex) => {
                            //extract isStart and isFinish from node object in map-function
                            const {i, j, isStart, isFinish, isVisited, distance, predecessor} = node;
                            return (
                                <Node
                                key={nodeIndex}
                                i={i}
                                j={j}
                                isStart={isStart}
                                isFinish={isFinish}
                                isVisited={isVisited}
                                distance={distance}
                                predecessor={predecessor}
                                test={"foo"}></Node>
                                );
                        })}
                    </div>
                    );
                })}
            </div>
        );
    }
}


const rows = 20;
const cols = 50;
const START_ROW = 10;
const START_COL = 5;
const FINISH_ROW = 10;
const FINISH_COL = 45;

//Helper function for creating an array of arrays with nodes
function createGrid() {
    const nodes = [];
    for (let i = 0; i < rows; i++) {
        const currentRow = [];
        for (let j = 0; j < cols; j++) {
            const currentNode = createNode(i, j);
            currentRow.push(currentNode);
        }
        nodes.push(currentRow);
    }
    return nodes;
}

//Helper function for creating a node with attributes for usage in pathfinding-algorithms
function createNode(i, j) {
    const currentNode = {
        i,
        j,
        isStart: (i === START_ROW && j === START_COL),
        isFinish: (i === FINISH_ROW && j === FINISH_COL),
        isVisited: this.isStart,
        isWall: false,
        distance: Infinity,
        predecessor: null,
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