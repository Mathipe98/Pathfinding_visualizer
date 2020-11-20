
/*
The main idea in these algorithms will be to first implement the functions that
provide the actual solution, and then implement functions that will visualize
these solutions by altering the classname of each explored node in order to
colorize which nodes are in progress, which ones are visited, and ultimately 
highlight the final path.
*/


function dijkstraSearch(grid, startNode, finishNode) {

    const allNodes = getAllNodes(grid);

}

function getNeighbours(grid, node, maxRowIndex, maxColIndex) {
    const {i, j} = node;

    const topNeighbour = (i > 0) ? grid[i-1][j] : null;
    const bottomNeighbour = (i < maxRowIndex) ? grid[i+1][j] : null;
    const rightNeighbour = (j < maxColIndex) ? grid[i][j+1] : null;
    const leftNeighbour = (j > 0) ? grid[i][j-1] : null;
    //List in order of what nodes will be searched first: top, right, bottom, left
    const neighbourList = [topNeighbour, rightNeighbour, bottomNeighbour, leftNeighbour];
    //Filter out null-nodes and visitedNodes
    return neighbourList.filter(neighbour => {
        return (neighbour !== null || !neighbour.isVisited);
    });
}

function getAllNodes(grid) {
    //We don't need a 2D array now, we can make due with 1D
    const nodeList = [];
    for (let row of grid) {
        for (let col of row) {
            grid.push(col);
        }
    }
    return nodeList;
}