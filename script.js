var w = window.innerWidth;
var h = window.innerHeight;

function addDot(c) {
  var tLeft = Math.floor(Math.random()*(w*0.5)),
      tTop  = Math.floor(Math.random()*(h-50));
  
  var dot = document.createElement('div');
  dot.className = c + " dot";
  dot.style.top = tTop + "px";
  dot.style.left = tLeft + "px";
  document.body.appendChild(dot);
}

window.addEventListener("load", function() {
  const rgb = ["alpha", "beta", "gamma"];

  let dots = "";
  for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
  }
});

// Select the divs on the page
const dott = document.querySelectorAll(".dot");

// Set up a function that will be called repeatedly to move the dots
function moveDots() {
  // Loop through each dot
  dots.forEach(dott => {
    // Generate new random x and y positions for the dot
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    // Update the dot's position using the new x and y values
    dott.style.left = `${x}px`;
    dott.style.top = `${y}px`;
  });
}

// Set the moveDots() function to be called every 1000 milliseconds (1 second)
setInterval(moveDots, 3000);
