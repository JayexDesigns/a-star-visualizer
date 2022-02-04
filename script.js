const grid = document.getElementById("grid");

let cols = 30;
let rows = 15;
let gap = Math.floor(grid.offsetWidth/cols)/5;

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
startButton.addEventListener('click', () => changeCurrentAction("none"));







const tileClickHandle = (i, j) => {
    const setTileColor = (i, j, color) => {
        document.getElementById(`tile-${i}-${j}`).style.backgroundColor = color;
    }

    if (currentAction === "none") return;
    else if (currentAction === "start") {
        if (startPoint !== null) setTileColor(startPoint[0], startPoint[1], "var(--secondary-color)");
        startPoint = [i, j];
        setTileColor(startPoint[0], startPoint[1], "var(--start-point-color)");
        changeCurrentAction("none");
    }
    else if (currentAction === "end") {
        if (endPoint !== null) setTileColor(endPoint[0], endPoint[1], "var(--secondary-color)");
        endPoint = [i, j];
        setTileColor(endPoint[0], endPoint[1], "var(--end-point-color)");
        changeCurrentAction("none");
    }
    else if (currentAction === "barrier") {
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





grid.style.gap = `${gap}px`;
grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `tile-${i}-${j}`;
        tile.addEventListener('click', () => tileClickHandle(i, j));
        grid.appendChild(tile);
    }
}