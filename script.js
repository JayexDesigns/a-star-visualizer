const grid = document.getElementById("grid");

// Initial Values
let cols = 25;
let rows = 15;
let gap = Math.floor(grid.offsetWidth/cols)/5;

let straightDistance = 10;

let startPoint = null;
let endPoint = null;
let barriers = [];

let nodesOpen = [];
let nodesClosed = [];

let currentTooltip = null;





// Handles The Controls
const colsInput = document.getElementById("cols-input");
const rowsInput = document.getElementById("rows-input");
const startPointButton = document.getElementById("start-point-button");
const endPointButton = document.getElementById("end-point-button");
const barrierButton = document.getElementById("barrier-button");
const resetButton = document.getElementById("reset-button");
const startButton = document.getElementById("start-button");
const tooltipBackground = document.getElementById("tooltip-background");

let currentAction = "none";

const changeCurrentAction = (newAction) => {
    let r = document.querySelector(':root');
    if (newAction === "none") r.style.setProperty('--hover-action-color', 'var(--secondary-color-light)');
    else if (newAction === "start") r.style.setProperty('--hover-action-color', 'var(--start-point-color)');
    else if (newAction === "end") r.style.setProperty('--hover-action-color', 'var(--end-point-color)');
    else if (newAction === "barrier") r.style.setProperty('--hover-action-color', 'var(--barrier-color)');
    currentAction = newAction;
};

startPointButton.addEventListener('click', () => changeCurrentAction("start"));
endPointButton.addEventListener('click', () => changeCurrentAction("end"));
barrierButton.addEventListener('click', () => changeCurrentAction("barrier"));





// Main Algorithm
const startAlgorithm = async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    if (startPoint === null || endPoint === null) return null;

    // G Cost Is The Distance To The Starting Node Following The Current Path
    const calculateGCost = (i, j, prev=null) => {
        if (prev) return prev.g + Math.floor(Math.sqrt(Math.abs((prev.x - i) * straightDistance)**2 + Math.abs((prev.y - j) * straightDistance)**2));
        else if (startPoint[0] === i && startPoint === j) return 0;
        else return Math.floor(Math.sqrt(Math.abs((startPoint[0] - i) * straightDistance)**2 + Math.abs((startPoint[1] - j) * straightDistance)**2));
    };
    // H Cost Is The Distance To The End Node
    const calculateHCost = (i, j) => Math.floor(Math.sqrt(Math.abs((endPoint[0] - i) * straightDistance)**2 + Math.abs((endPoint[1] - j) * straightDistance)**2));
    // F Cost Is The Sum Of The G And H Costs
    const calculateFCost = (gCost, hCost) => gCost + hCost;

    nodesOpen = []; // List Of Nodes Being Evaluated
    nodesClosed = []; // List Of Nodes Already Evaluated

    let point = {
        x: startPoint[0],
        y: startPoint[1],
        prev: null,
    };
    point.g = calculateGCost(point.x, point.y);
    point.h = calculateHCost(point.x, point.y);
    point.f = calculateFCost(point.g, point.h);

    nodesOpen.push(point);

    while (true) {
        // Selects The Node With Lowest F Cost In The Open Array
        let current;
        let currentIndex;
        for (let i = 0; i < nodesOpen.length; ++i) {
            if (!current) {
                current = nodesOpen[i];
                currentIndex = i;
            }
            else if (current.f > nodesOpen[i].f) {
                current = nodesOpen[i];
                currentIndex = i;
            }
        }
        nodesOpen.splice(currentIndex, 1);
        nodesClosed.push(current);

        if (!current) return null; // Not Possible Path
        else if (current.x === endPoint[0] && current.y === endPoint[1]) return current; // Path Found

        let neighbours = [ // All Adjacent Nodes Of The Current One
            [current.x - 1, current.y - 1],
            [current.x    , current.y - 1],
            [current.x + 1, current.y - 1],
            [current.x + 1, current.y    ],
            [current.x + 1, current.y + 1],
            [current.x    , current.y + 1],
            [current.x - 1, current.y + 1],
            [current.x - 1, current.y    ],
        ];
        for (let i = 0; i < neighbours.length; ++i) {
            if ( // If Neighbour Is Out Of Bounds, Not Traversable Or Is In Closed Skips It
                neighbours[i][0] < 0 || neighbours[i][0] > (cols - 1) ||
                neighbours[i][1] < 0 || neighbours[i][1] > (rows - 1) ||
                barriers.filter(barrier => barrier[0] === neighbours[i][0] && barrier[1] === neighbours[i][1]).length > 0 ||
                nodesClosed.filter(node => node.x === neighbours[i][0] && node.y === neighbours[i][1]).length > 0
            ) continue;

            let neighbour = {
                x: neighbours[i][0],
                y: neighbours[i][1],
                prev: current,
            };
            neighbour.g = calculateGCost(neighbour.x, neighbour.y, neighbour.prev);
            neighbour.h = calculateHCost(neighbour.x, neighbour.y);
            neighbour.f = calculateFCost(neighbour.g, neighbour.h);

            // Search The Current Neighbour In The Open List
            let nodeEvaluated = null;
            for (let i = 0; i < nodesOpen.length; ++i) {
                if (nodesOpen[i].x === neighbour.x && nodesOpen[i].y === neighbour.y) {
                    nodeEvaluated = i;
                    break;
                }
            }

            // If The Neighbour Now Has A Better Path It Updates It
            if (nodeEvaluated && nodesOpen[nodeEvaluated].f > neighbour.f) {
                nodesOpen[nodeEvaluated].g = neighbour.g;
                nodesOpen[nodeEvaluated].h = neighbour.h;
                nodesOpen[nodeEvaluated].f = neighbour.f;
                nodesOpen[nodeEvaluated].prev = neighbour.prev;
            }
            // If The Neighbour Wasn't In The Open List Adds It
            else if (!nodeEvaluated) {
                nodesOpen.push(neighbour);
            }
        }

        // Paint All Nodes Being Evaluated
        for (let i = 0; i < nodesOpen.length; ++i) if (
            !(nodesOpen[i].x === startPoint[0] && nodesOpen[i].y === startPoint[1]) &&
            !(nodesOpen[i].x === endPoint[0] && nodesOpen[i].y === endPoint[1])
        ) setTileColor(nodesOpen[i].x, nodesOpen[i].y, "var(--evaluating-color)");

        // Paint All The Evaluated Nodes
        for (let i = 0; i < nodesClosed.length; ++i) if (
            !(nodesClosed[i].x === startPoint[0] && nodesClosed[i].y === startPoint[1]) &&
            !(nodesClosed[i].x === endPoint[0] && nodesClosed[i].y === endPoint[1])
        ) setTileColor(nodesClosed[i].x, nodesClosed[i].y, "var(--evaluated-color)");

        await sleep(50);
    }
};



// Start Button Handler
startButton.addEventListener('click', () => {
    startPointButton.disabled = true;
    endPointButton.disabled = true;
    barrierButton.disabled = true;
    startButton.disabled = true;
    startAlgorithm().then(res => {
        if (res) {
            let current = res.prev;
            while (current.prev !== null) {
                setTileColor(current.x, current.y, "var(--path-color)");
                current = current.prev;
            }
        }
        startPointButton.disabled = false;
        endPointButton.disabled = false;
        barrierButton.disabled = false;
        startButton.disabled = false;
    });
    changeCurrentAction("none");
});





const removeTooltip = () => {
    tooltip.style.opacity = 0;
    setTimeout(() => {
        currentTooltip.remove();
        currentTooltip = null;
    }, 300);
    tooltipBackground.style.pointerEvents = "none";
};

tooltipBackground.addEventListener('click', removeTooltip);





// Changes The Color Of A Tile
const setTileColor = (i, j, color) => {
    document.getElementById(`tile-${i}-${j}`).style.backgroundColor = color;
};

// When The User Clicks A Tile It Executes The Action Selected Previously
const tileClickHandle = (i, j) => {
    if (currentAction === "start") {
        if (endPoint !== null && endPoint[0] === i && endPoint[1] === j || barriers.filter(barrier => barrier[0] === i && barrier[1] === j).length > 0) return;
        if (startPoint !== null) setTileColor(startPoint[0], startPoint[1], "var(--secondary-color)");
        startPoint = [i, j];
        setTileColor(startPoint[0], startPoint[1], "var(--start-point-color)");
        changeCurrentAction("none");
    }

    else if (currentAction === "end") {
        if (startPoint !== null && startPoint[0] === i && startPoint[1] === j || barriers.filter(barrier => barrier[0] === i && barrier[1] === j).length > 0) return;
        if (endPoint !== null) setTileColor(endPoint[0], endPoint[1], "var(--secondary-color)");
        endPoint = [i, j];
        setTileColor(endPoint[0], endPoint[1], "var(--end-point-color)");
        changeCurrentAction("none");
    }

    else if (currentAction === "barrier") {
        if (startPoint !== null && startPoint[0] === i && startPoint[1] === j || endPoint !== null && endPoint[0] === i && endPoint[1] === j) return;
        if (barriers.filter(barrier => barrier[0] === i && barrier[1] === j).length > 0) {
            barriers = barriers.filter(barrier => barrier[0] !== i || barrier[1] !== j);
            setTileColor(i, j, "var(--secondary-color)");
        }
        else {
            barriers.push([i, j]);
            setTileColor(i, j, "var(--barrier-color)");
        }
    }

    else if (currentAction === "none") {
        if (currentTooltip && currentTooltip.children.length > 0) return;
        else if (currentTooltip) removeTooltip();
        let tile = document.getElementById(`tile-${i}-${j}`);
        let tooltip = document.createElement("div");
        tooltip.id = "tooltip";

        let openNode = null;
        for (let node = 0; node < nodesOpen.length; ++node) if (nodesOpen[node].x === i && nodesOpen[node].y === j) openNode = nodesOpen[node];
        console.log(openNode);

        let closedNode = null;
        if (!openNode) {
            for (let node = 0; node < nodesClosed.length; ++node) if (nodesClosed[node].x === i && nodesClosed[node].y === j) closedNode = nodesClosed[node];
        }

        tooltip.innerHTML = `
            <p>Tile: ${i} ${j}</p>
            <p>Status: ${(openNode) ? "Open" : (closedNode) ? "Closed" : "Null"}</p>
            <p>G Cost: ${(openNode) ? `${openNode.g}` : (closedNode) ? `${closedNode.g}` : "Null"}</p>
            <p>H Cost: ${(openNode) ? `${openNode.h}` : (closedNode) ? `${closedNode.h}` : "Null"}</p>
            <p>F Cost: ${(openNode) ? `${openNode.f}` : (closedNode) ? `${closedNode.f}` : "Null"}</p>
            <p>Previous: ${
                (openNode && openNode.prev) ? `${openNode.prev.x} ${openNode.prev.y}` :
                (closedNode && closedNode.prev) ? `${closedNode.prev.x} ${closedNode.prev.y}` :
                "Null"
            }</p>
        `;
        tile.appendChild(tooltip);
        setTimeout(() => tooltip.style.opacity = 1, 10);
        tooltipBackground.style.pointerEvents = "all";
        currentTooltip = tooltip;
    }
};





// Create Or Rebuild The Grid
const createGrid = () => {
    startPoint = null;
    endPoint = null;
    barriers = [];
    nodesOpen = [];
    nodesClosed = [];
    currentTooltip = null;

    grid.style.gap = `${gap}px`;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    grid.innerHTML = '';

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            let tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${j}-${i}`;
            tile.addEventListener('click', () => tileClickHandle(j, i));
            grid.appendChild(tile);
        }
    }
};



// For When The User Changes The Amount Of Columns Or Rows
const changeColsAndRows = (c, r) => {
    let changed = false;
    if (c >= 2 && c <= 100) {
        cols = c;
        changed = true;
    }
    if (r >= 2 && r <= 100) {
        rows = r;
        changed = true;
    }
    if (changed) {
        gap = Math.floor(grid.offsetWidth/cols)/5;
        createGrid();
    }
};

colsInput.addEventListener('change', (e) => changeColsAndRows(parseInt(e.target.value), 0));
rowsInput.addEventListener('change', (e) => changeColsAndRows(0, parseInt(e.target.value)));



// Set The Initial Values To More Or Less Respect The Device Aspect Ratio
let ratio = (innerWidth*0.8)/(innerHeight*0.6);
let c = Math.floor((innerWidth/30)/ratio);
let r = Math.floor((innerHeight/30)/ratio);
colsInput.value = c;
rowsInput.value = r;
changeColsAndRows(c, r);



resetButton.addEventListener('click', () => createGrid());
createGrid();