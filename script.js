// Swap bg image
function figswap() {
  var di = $(this).attr('data-image')
  $(".figure").attr("src",di)
}

$( ".figlink" ).on( "mouseover", figswap );

$('.modal-toggle').on('click', function(e) {
  e.preventDefault();
  $('.modal').toggleClass('is-visible');
});

