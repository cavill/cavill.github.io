var w = window.innerWidth;
var h = window.innerHeight;

var hgtmax = 140;

function addDot(c) {

  if (w > 784) {
    tLeft = Math.floor(Math.random()*(w*0.45))
  } else {
    tLeft = Math.floor(Math.random()*(w*0.8))
  }
  var tTop  = Math.floor(Math.random()*(h-hgtmax)),
      deg = Math.floor(Math.random() * 360),
      hgt = Math.floor(Math.random() * (hgtmax - 20 + 1) + 20);
  
  var dot = document.createElement('div');
  dot.className = c + " dot";
  dot.style.top = tTop + "px";
  dot.style.left = tLeft + "px";
  dot.style.transform = `rotate(${deg}deg)`;
  dot.style.height = hgt + "px";
  document.body.appendChild(dot);
}

window.addEventListener("load", function() {
  const rgb = ["alpha", "beta", "gamma", "delta", "epsilon"];

  let dots = "";
  for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
  }
});