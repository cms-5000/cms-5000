$(document).ready(function () {
  // Navbar Dropdown
  $('.dropdown-menu').find('form').click(function (e) {
      e.stopPropagation();
  });
  
  $(".dropdown-menu a").click(function() {
    console.log('lol');
    $(this).closest(".dropdown-menu").prev().dropdown("toggle");
  });
  
  // Tabs
  $('#myTab a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  });
});
