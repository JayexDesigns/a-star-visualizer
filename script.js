const grid = document.getElementById("grid");

// Initial Values
let cols = 25;
let rows = 15;
let gap = Math.floor(grid.offsetWidth/cols)/5;

let straightDistance = 10;

let startPoint = null;
let endPoint = null;
let barriers = [];





const startPointButton = document.getElementById("start-point-button");
const endPointButton = document.getElementById("end-point-button");
const barrierButton = document.getElementById("barrier-button");
const startButton = document.getElementById("start-button");

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

    if (startPoint === null || endPoint === null) return;

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

    let open = []; // List Of Nodes Being Evaluated
    let closed = []; // List Of Nodes Already Evaluated

    let point = {
        x: startPoint[0],
        y: startPoint[1],
        prev: null,
    };
    point.g = calculateGCost(point.x, point.y);
    point.h = calculateHCost(point.x, point.y);
    point.f = calculateFCost(point.g, point.h);

    open.push(point);

    while (true) {
        let current;
        let currentIndex;
        for (let i = 0; i < open.length; ++i) {
            if (!current) {
                current = open[i];
                currentIndex = i;
            }
            else if (current.f > open[i].f) {
                current = open[i];
                currentIndex = i;
            }
        }
        open.splice(currentIndex, 1);
        closed.push(current);

        if (!current) return null; // Not Possible Path
        else if (current.x === endPoint[0] && current.y === endPoint[1]) return current; // Path Found

        let neighbours = [
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
                closed.filter(node => node.x === neighbours[i][0] && node.y === neighbours[i][1]).length > 0
            ) continue;

            let neighbour = {
                x: neighbours[i][0],
                y: neighbours[i][1],
                prev: current,
            };
            neighbour.g = calculateGCost(neighbour.x, neighbour.y, neighbour.prev);
            neighbour.h = calculateHCost(neighbour.x, neighbour.y);
            neighbour.f = calculateFCost(neighbour.g, neighbour.h);

            let nodeEvaluated = null;
            for (let i = 0; i < open.length; ++i) {
                if (open[i].x === neighbour.x && open[i].y === neighbour.y) {
                    nodeEvaluated = i;
                    break;
                }
            }

            if (nodeEvaluated && open[nodeEvaluated].f > neighbour.f) {
                open[nodeEvaluated].g = neighbour.g;
                open[nodeEvaluated].h = neighbour.h;
                open[nodeEvaluated].f = neighbour.f;
                open[nodeEvaluated].prev = neighbour.prev;
            }
            else if (!nodeEvaluated) {
                open.push(neighbour);
            }
        }

        for (let i = 0; i < open.length; ++i) if (
            !(open[i].x === startPoint[0] && open[i].y === startPoint[1]) &&
            !(open[i].x === endPoint[0] && open[i].y === endPoint[1])
        ) setTileColor(open[i].x, open[i].y, "var(--evaluating-color)");

        for (let i = 0; i < closed.length; ++i) if (
            !(closed[i].x === startPoint[0] && closed[i].y === startPoint[1]) &&
            !(closed[i].x === endPoint[0] && closed[i].y === endPoint[1])
        ) setTileColor(closed[i].x, closed[i].y, "var(--evaluated-color)");

        await sleep(50);
    }
};



startButton.addEventListener('click', () => {
    startAlgorithm().then(res => {
        if (res !== null) {
            let current = res.prev;
            while (current.prev !== null) {
                setTileColor(current.x, current.y, "var(--path-color)");
                current = current.prev;
            }
        }
    });
    changeCurrentAction("none");
});







// Changes The Color Of A Tile
const setTileColor = (i, j, color) => {
    document.getElementById(`tile-${i}-${j}`).style.backgroundColor = color;
};

// When The User Clicks A Tile It Executes The Action Selected Previously
const tileClickHandle = (i, j) => {
    if (currentAction === "none") return;
    else if (currentAction === "start") {
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
};





// Create The Grid
const createGrid = () => {
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
createGrid();