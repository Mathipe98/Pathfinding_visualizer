
function getNeighbours(grid, node) {
    const {row, col} = node;
    const maxRowIndex = grid.length - 1;
    const maxColIndex = grid[0].length - 1;

    const topNeighbour = (row > 0) ? grid[row-1][col] : null;
    const bottomNeighbour = (row < maxRowIndex) ? grid[row+1][col] : null;
    const rightNeighbour = (col < maxColIndex) ? grid[row][col+1] : null;
    const leftNeighbour = (col > 0) ? grid[row][col-1] : null;
    const neighbourList = [topNeighbour, rightNeighbour, bottomNeighbour, leftNeighbour];

    // Filter out null-nodes, visited nodes, wall nodes, and sort the list
    // where nodes with minimal distance will appear first
    const result = neighbourList
        .filter(checkNode)
        .sort((n1, n2) => n1.distance - n2.distance);
    return result;
}

// Check if a node is null, visited, or a wall
function checkNode(node) {
    if (node === null) {
        return false;
    }
    if (node.isVisited) {
        return false;
    }
    if (node.isWall) {
        return false;
    }
    return true;
}

// Backtrack the shortest path. Must be called after dijkstraSearch
function backtrackShortestPath (finishNode) {
    const result = [];
    let currentNode = finishNode;
    while (currentNode.predecessor) {
        result.push(currentNode);
        currentNode = currentNode.predecessor;
    }
    return result;
}



export {
    getNeighbours,
    checkNode,
    backtrackShortestPath,
};