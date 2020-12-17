import React,  {Component} from "react";

import "./Node.css";

export default class Node extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        //The same way as in PathfindingVisualizer, extract values from props
        const {
            row,
            col,
            isStart,
            isFinish,
            isWall,
            isVisited,
            onMouseDown,
            onMouseEnter,
            onMouseUp,
        } = this.props;

        const extraNameCheck = isStart
            ? "node-start"
            : isFinish
            ? "node-finish"
            : isWall
            ? "node-wall"
            : isVisited
            ? "node-visited"
            : "";
        /*
            We pass functions into the props for handling mouse-events,
            and add these event-listener functions to the Node-component.
            Each individual node will simply have a function to handle
            a mouseDown, mouseEnter, or mouseUp event, such that all of them
            can use their individual row-col values.
        */
        return (
            <div
            id={`node-${row}-${col}`}
            className={`node ${extraNameCheck}`}
            isWall={isWall}
            onMouseDown={() => onMouseDown(row, col)}
            onMouseEnter={() => onMouseEnter(row, col)}
            onMouseUp={() => onMouseUp()}
            ></div>
        );
    }
}
/*
constructor(props) {
        super(props);
        this.state = [];
    }
*/