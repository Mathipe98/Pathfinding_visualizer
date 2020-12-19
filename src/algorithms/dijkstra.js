
import { getNeighbours } from "./commonAlgorithmFunctions";

/*
The main idea in these algorithms will be to first implement the functions that
provide the actual solution, and then implement functions that will visualize
these solutions by altering the classname of each explored node in order to
colorize which nodes are in progress, which ones are visited, and ultimately 
highlight the final path. The animation will be taken care of in
PathfindingVisualizer, while we provide the actual backend of the algorithms here.
*/

// Dijkstra's algorithm: takes in a grid of nodes, along with start and finish,
// and checks two nodes u,v if it's cheaper/more efficient to move
// from node u to v instead of the path v already has.
// Also updates each node with a pointer to its predecessor.
function dijkstraSearch(grid, startNode, finishNode) {

    const queue = getAllNodes(grid);
    const visitedNodesInOrder = [];
    
    // equivalent to (queue && queue.length)
    while (queue?.length) {
        //debugger;

        
        // Because of the sorting, this node is guaranteed to have the lowest distance
        const currentNode = queue.shift();

        // If a wall is encountered, skip the node
        if (currentNode.isWall) continue;

        
        // If we end up here, then we are trapped, and therefore return the list of nodes
        if (currentNode.distance === Infinity) {
            return visitedNodesInOrder;
        }
        // Break if we have found the target (might delete later to calculate all-to-all)
        if (currentNode === finishNode) {
            return visitedNodesInOrder;
        }
        
        // Get all neighbours of current node
        const currentNeighbours = getNeighbours(grid, currentNode);
        visitedNodesInOrder.push(currentNode);
        // Iterate through neighbours and relax the edges
        for (let neighbour of currentNeighbours) {
            relax(currentNode, neighbour);
        }
        queue.sort((n1, n2) => n1.distance - n2.distance);
    }
}

// Relax an edge between u and v:
// if (u.distance + cost(go from u to v) < v.distance)
// => v.distance = u.distance cost(go from u to v);
// => v.predecessor = u;
function relax(currentNode, neighbour) {
    const tempDistance = currentNode.distance + neighbour.cost;
        if (tempDistance < neighbour.distance) {
            neighbour.distance = tempDistance;
            neighbour.predecessor = currentNode;
        }
}

// Returns a sorted list of all nodes in the grid where the sorting
// is based on the distance of each node
function getAllNodes(grid) {
    const nodeList = [];
    for (let i = 0; i < grid.length; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length; j++) {
            nodeList.push(row[j]);
        }
    }
    const result = nodeList.sort((n1, n2) => n1.distance - n2.distance);
    return result;
}

export {dijkstraSearch, relax, getAllNodes};