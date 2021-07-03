let $ = jQuery = require('jquery');

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    var fiveMinutes = 60 * 5,
        display = document.querySelector('#countdown');
   // startTimer(fiveMinutes, display);
});


$('#header-text').on('click', function() {
    $('.h1-text').addClass('hidden');
    $('.h1-input').removeClass('hidden');
    $('.h1-input input').val($('.h1-text').text());
    $('.h1-input input').focus();
});

$('.h1-input input').on('focusout', function() {
    $('.h1-text').removeClass('hidden');
    $('.h1-input').addClass('hidden');
    $('.h1-text').text($(this).val());

    
});