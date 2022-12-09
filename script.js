var w = window.innerWidth;
var h = window.innerHeight;

function addDot(c) {
  var tLeft = Math.floor(Math.random()*(w*0.5)),
      tTop  = Math.floor(Math.random()*(h-50)),
      deg = Math.floor(Math.random() * 360),
      hgt = Math.floor(Math.random() * (140 - 30 + 1) + 30);
  
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