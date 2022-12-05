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
  var startLeft = parseInt(dot.style.left);
  var startTop = parseInt(dot.style.top);
  var centerLeft = w/2;
  var centerTop = h/2;
  var angle = 0;
  var orbitRadius = 100;
  var speed = 1 / Math.sqrt(Math.pow(startLeft - centerLeft, 2) + Math.pow(startTop - centerTop, 2));
  setInterval(function() {
    var newLeft = centerLeft + orbitRadius * Math.cos(angle);
    var newTop = centerTop + orbitRadius * Math.sin(angle);
    dot.style.top = newTop + "px";
    dot.style.left = newLeft + "px";
    angle += speed;
  }, 100);
}

window.addEventListener("load", function() {
  const rgb = ["alpha", "beta", "gamma"];

  let dots = "";
  for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
  }
});
