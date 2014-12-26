$(document).ready(function () {
    $('#pin').attr('data-width', $('#dashboard').width())
    $(document).on('mouseenter', 'div.friend', function () {
        $(this).find('.btn').fadeIn(100);
    });
    $(document).on('mouseleave', 'div.friend', function () {
        $(this).find('.btn').hide();
        $('[data-toggle="dropdown"]').parent().removeClass('open');
    })
    $('#pin-panel').click(function () {
        if ($('#dashboard').attr('data-collapsed') === 'false') {
            $('#dashboard').animate({ width: '0px', opacity: '0.7' }, 500, function () {
                $('#pin-panel > span').html('&raquo;');
                $('#dashboard').attr('data-collapsed', true).hide();
            });
        } else {
            $('#dashboard').show().animate({ width: $('#dashboard').attr('data-width') + 'px', opacity: '1.0' }, 500, function () {
                $('#pin-panel > span').html('&laquo;');
                $('#dashboard').attr('data-collapsed', false);
            });
        }
    });
    $('#dashboard #friends').slimScroll({
        height: '100%',
        size: '5px',
        color: '#a3a3a3'
    });
    $(document).on('click', '.btn-history', function (e) {
        var position = $(this).offset();
        $(this).siblings('.dropdown-menu').css({ top: parseInt(position.top + $(this).parent().parent().height()) + 'px', left: position.left });
    });
})

String.format = function (format) {
    var args = arguments;
    return format.replace(/\{(\d+)\}/g, function (m, i) {
        return args[parseInt(i) + 1];
    });
}