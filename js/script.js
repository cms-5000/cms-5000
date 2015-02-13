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

// Search Box Animation
$(document).ready(function () {
    var submitIcon = $('.searchbox-icon');
    var inputBox = $('.searchbox-input');
    var searchBox = $('.searchbox');
    var isOpen = false;
    
    submitIcon.click(function () {
        if (isOpen == false) {
            searchBox.addClass('searchbox-open');
            inputBox.focus();
            isOpen = true;
        } else {
            searchBox.removeClass('searchbox-open');
            inputBox.focusout();
            isOpen = false;
        }
    });

    submitIcon.mouseup(function () {
        return false;
    });

    searchBox.mouseup(function () {
        return false;
    });

    $(document).mouseup(function () {
        if (isOpen == true) {
            $('.searchbox-icon').css('display', 'block');
            submitIcon.click();
        }
    });
});

function searchboxHover() {
    var inputVal = $('.searchbox-input').val();
    inputVal = $.trim(inputVal).length;
    if (inputVal !== 0) {
        $('.searchbox-icon').css('display', 'none');
    } else {
        $('.searchbox-input').val('');
        $('.searchbox-icon').css('display', 'block');
    }
}
