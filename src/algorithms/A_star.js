import { getNeighbours } from "./commonAlgorithmFunctions";


export const aStar = function (grid, startNode, finishNode) {
    const openList = [startNode];
    const visitedNodesInOrder = [];
    const closedList = [];

    while (openList?.length) {
        // Get node with least f since openList is always sorted on f
        const currentNode = openList.shift();
        // Push nodes for visualizing
        visitedNodesInOrder.push(currentNode);
        console.log(currentNode);
        closedList.push(currentNode);

        // If one is true, then both are. Redundant, but just to be sure
        if (currentNode === finishNode || currentNode.isFinish) {
            return visitedNodesInOrder;
        }

        // Generate neighbours
        const currentNeighbours = getNeighbours(grid, currentNode);
        for (const neighbour of currentNeighbours) {
            
            // If neighbour is a wall, or neighbour is in closedList, then skip it
            if (neighbour.isWall || closedList.includes(neighbour)) continue;

            // neighbour.g = current.g + neighbour.g
            neighbour.distance = currentNode.distance + neighbour.cost;
            // neighbour.f = neighbour.g + neighbour.h
            neighbour.total = neighbour.distance + neighbour.manDistance;
            // Find a node (if one exists) in the openList with same coordinates as neighbour
            const currentNodeInOpenList = openList.find(node => {
                return ((node.col === neighbour.col && node.row === neighbour.row) || node === neighbour);
            });
            // If the distance of the node in openList is less than neighbour's, then skip neighbour
            if (currentNodeInOpenList?.distance <= neighbour.distance) {
                continue;
            }

            // If none of the above are true, then add neighbour to openList
            openList.push(neighbour);
            neighbour.predecessor = currentNode;
        }
        //debugger;
        // Sort based on total = f(n) = g(n) + h(n)
        openList.sort((n1, n2) => n1.total - n2.total);
    }
    // If we end up here, then the goal is unreachable. Therefore return visited nodes
    return visitedNodesInOrder;
}


// Check if a node is null, visited, or a wall
function checkNode(node) {
    if (node === null) {
        return false;
    }
    if (node.isWall) {
        return false;
    }
    return true;
}