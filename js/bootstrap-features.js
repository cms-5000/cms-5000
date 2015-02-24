// Navbar Dropdown
$(document).ready(function () {
    $('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
    });
});

// Tabs
$('#myTab a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
});
