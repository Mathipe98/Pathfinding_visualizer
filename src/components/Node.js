import React,  {Component} from "react";

import "./Node.css";

export default class Node extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        //The same way as in PathfindingVisualizer, extract isStart+isFinish from props-object.
        const {isStart, isFinish} = this.props;
        const startOrFinishNameCheck = isStart ? "node-start" : isFinish ? "node-finish" : "";
        const row = this.props.i;
        const col = this.props.j;
        return (
            <div className={`node ${startOrFinishNameCheck}`}></div>
        );
    }
}
/*
constructor(props) {
        super(props);
        this.state = [];
    }
*/