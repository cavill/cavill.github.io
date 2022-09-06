var w = $(window).width();
var h = $(window).height();

function addDot(c) {
  var tLeft = Math.floor(Math.random()*(w*0.5)),
      tTop  = Math.floor(Math.random()*(h-50));
  
  $('body').append('<div class="' + c + ' dot" style="top:' + tTop + 'px; left:' + tLeft + 'px"></div>');
}

$(document).ready(function() {
   const rgb = ["alpha", "beta", "gamma"];

   let dots = "";
   for (let i = 0; i < rgb.length; i++) {
    addDot(rgb[i]);
   }
});
