let $ = jQuery = require('jquery');
let time, duration;
var timer;

function startTimer() {
   
    hours = parseInt(timer / 60 / 60, 10);
    minutes = parseInt(timer / 60 % 60, 10);
    seconds = parseInt(timer % 60, 10);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    $('#time').text(hours + ":" + minutes + ":" + seconds);
    
    if (--timer < 0) {
        timer = duration;
    }
}

$('#header-text').on('click', function() {
    $('.h1-text').addClass('hidden');
    $('.h1-input').removeClass('hidden');
    $('.h1-input input').val($('.h1-text').text());
    $('.h1-input input').focus();
});

$('.h1-input input').on('focusout', function() {
    $('.h1-text').removeClass('hidden');
    $('.h1-input').addClass('hidden');
    if($(this).val() != "") {
        $('.h1-text').text($(this).val());
    } else {
        $('.h1-text').text("Zadej text...");
    }    
});


$('#countdown').on('click', function(){
    $('#time').addClass('hidden');
    $('#time-input').removeClass('hidden');
    $('#time-input').val($('#time').text());
    $('#time-input').focus();
});

$('#time-input').on('focusout', function() {
    $('#time').removeClass('hidden');
    $('#time-input').addClass('hidden');

    if($(this).val() != "") {
        $('#time').text($(this).val());
    } else {
        $('#timet').text("00:00:00");
    }
});



$('#start-btn').on('click', function() {
    time = $('#time').text();

    hours = parseInt(time.split(":")[0]);
    minutes = parseInt(time.split(":")[1]);
    seconds = parseInt(time.split(":")[2]);

    duration = (hours * 60 * 60) + (minutes * 60) + seconds;

    timer = duration, hours, minutes, seconds;

    intervalId = setInterval(startTimer, 1000);
});

$('#stop-btn').on('click', function() {
    if (intervalId)
      clearInterval(intervalId);
});

$('#reset-btn').on('click', function() {
    if (intervalId)
      clearInterval(intervalId);
    
    $('#time').text('01:15:00');
});