import {dijkstraSearch} from "./dijkstra.js";
import {aStar} from "./A_star";
import { backtrackShortestPath } from "./commonAlgorithmFunctions";

// Function called when a button is clicked to visualize the result of
// the pathfinding algorithm. Performed by calling to other helper-functions
function visualizeAlgorithm(grid, currentAlgorithm, START_ROW, START_COL, FINISH_ROW, FINISH_COL) {
    const startNode = grid[START_ROW][START_COL];
    const finishNode = grid[FINISH_ROW][FINISH_COL];

    const visitedNodesInOrder = (currentAlgorithm === "Dijkstra") ?
        dijkstraSearch(grid, startNode, finishNode) : (currentAlgorithm === "Astar") ?
        aStar(grid, startNode, finishNode) : null; // can add more later

    const shortestPath = backtrackShortestPath(finishNode);
    animateAlgorithm(visitedNodesInOrder, shortestPath);
    // Return the lists in case we need to use them, thus we don't have to recalculate them
    return [visitedNodesInOrder, shortestPath];
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
function animateAlgorithm(visitedNodesInOrder, shortestPath) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
            setTimeout(() => {
                animateShortestPath(shortestPath);
            }, 15 * i);
            return;
        }
        else {
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                if (!node.isStart && !node.isFinish) {
                    document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
                }
            }, 15 * i);
        }
    }
}

function animateShortestPath(shortestPath) {
    for (let i = 0; i < shortestPath.length; i++) {
        setTimeout(() => {
            const node = shortestPath[i];
            if (!node.isFinish) {
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
            }
        }, 50 * i)
    }
}

export {
    visualizeAlgorithm,
};