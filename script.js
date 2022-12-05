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

  // animate the dot
  var angle = 0;
  var orbitRadius = 100;
  setInterval(function() {
    dot.style.top = (h/2 - orbitRadius * Math.sin(angle)) + "px";
    dot.style.left = (w/2 + orbitRadius * Math.cos(angle)) + "px";
    angle += 0.1;
  }, 10);
}

window.addEventListener("load", function() {
  const rgb = ["alpha", "beta", "gamma"];

  let dots = "";
  for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
  }
});
