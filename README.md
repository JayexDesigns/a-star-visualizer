<h3 align="center"><img src='https://raw.githubusercontent.com/JayexDesigns/a-star-visualizer/main/favicon.png' width='15%'></h3>
<h1 align="center">A* Algorithm Visualizer</h1>
<p align="center">A* is one of the most used pathfinding algorithms in computer science</p>
<br/>
<h2>Usage</h2>
<p>First, you can change the amount of columns and rows you want to have on the grid, the minimum is 2 columns and 2 rows and the maximum is a hundred for both since I don't think any computer should be tortured to generate more than a thousand divs.
<br/><br/>
Then you can set the start and end points anywhere in the grid, there can only be one starting point and one ending point, you can also put barriers so the path gets harder. The algorithm will try to go from the start to the end without passing through a barrier.
<br/><br/>
You can also reset the grid if you want to start again. Pressing the start button will show another menu with two options, the first one starts the algorithm and waits until you tell it to proceed to the next step, the second one will ask you for a delay in milliseconds so it can execute each step automatically.
<br/><br/>
Once the algorithm starts it will evaluate nearby nodes, those will be color yellow, once it finishes evaluating one node it will turn pink, if it finishes the path followed will be painted blue. If you click a tile it will show you some data about it, the position, status, costs and the previous node.
<br/><br/>
An explanation of how the algorithm works can be found <a href="https://youtu.be/-L-WgKMFuhE">here.</a></p>
<br/>
<h2 align="center"><a href="https://jayexdesigns.github.io/a-star-visualizer/">TRY IT!</a></h2>
