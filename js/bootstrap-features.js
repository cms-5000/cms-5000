$(document).ready(function () {
  // Navbar Dropdown
  $('.dropdown-menu').click(function (e) {
      e.stopPropagation();
  });
  
  $(".dropdown-menu .register-link").click(function() {
    $(this).closest(".dropdown-menu").prev().dropdown("toggle");
  });
  
  // Tabs
  $('#myTab a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  });
});
