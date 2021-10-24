const { ipcRenderer } = require('electron');
let $ = jQuery = require('jquery');
let time, duration;
var timer;
let data = {
    time: "",
    text: "",
    timeSent: 0,
    textSent: 0,
}

var timerRunning = true;
var timerUp = false;

function startTimer() {
   
    
    hours = parseInt(timer / 60 / 60, 10);
    minutes = parseInt(timer / 60 % 60, 10);
    seconds = parseInt(timer % 60, 10);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if(!timerUp) {
        $('#time').text(hours + ":" + minutes + ":" + seconds);
    } else {
        $('#time').text("-" + hours + ":" + minutes + ":" + seconds);
        $('#time').css('color', 'red');
    }
    

    data.time = hours + ":" + minutes + ":" + seconds;

    data.textSent = 0;
    data.timeSent = 1;

    ipcRenderer.send('request-update-label-in-second-window', data);
        
    if(!timerUp) {
        if (--timer <= 0) {
            timerUp = true;
            //timer = duration;
        }

    } else {
        timer++;
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
        data.text = $(this).val();
    } else {
        $('.h1-text').text("Zadej text...");
        data.text = "Zadej text...";
    }   

    data.textSent = 1;
    data.timeSent = 0;

    ipcRenderer.send('request-update-label-in-second-window', data);
});


$('#countdown').on('click', function(){
    $('#time').addClass('hidden');
    $('#time-input').removeClass('hidden');
    $('#time-input input').val($('#time').text());
    $('#time-input input').focus();
});

$('#time-input input').on('focusout', function() {
    $('#time').removeClass('hidden');
    $('#time-input').addClass('hidden');

    if($(this).val() != "") {
        $('#time').text($(this).val());
        data.time = $(this).val();
    } else {
        $('#time').text("01:15:00");
        data.time = "01:15:00";
    }

    data.textSent = 0;
    data.timeSent = 1;


    ipcRenderer.send('request-update-label-in-second-window', data);
});



$('#start-btn').on('click', function() {
    
    if(timerRunning) {
        
        timerRunning = false;
        $(this).addClass('disabled');

        time = $('#time').text();
        
        hours = parseInt(time.split(":")[0]);
        minutes = parseInt(time.split(":")[1]);
        seconds = parseInt(time.split(":")[2]);

        duration = (hours * 60 * 60) + (minutes * 60) + seconds;

        timer = duration, hours, minutes, seconds;

        intervalId = setInterval(startTimer, 1000);
    }

});

$('#stop-btn').on('click', function() {
    if (intervalId) {
        timerRunning = true;
        $('#start-btn').removeClass('disabled');
        clearInterval(intervalId);
    }
});

$('#reset-btn').on('click', function() {
    if (intervalId) {
        timerRunning = true;
        timerUp = false;
        $('#start-btn').removeClass('disabled');
        $('#time').css('color', 'black');
        clearInterval(intervalId);
    }
    
    $('#time').text('01:15:00');

    data.time = '01:15:00';

    data.textSent = 0;
    data.timeSent = 1;

    ipcRenderer.send('request-update-label-in-second-window', data);
});

$('.defined-texts-item').on('click', function() {
    $('.h1-text').text($(this).html());
    data.text = $(this).html();
    data.textSent = 1;
    data.timeSent = 0;

    ipcRenderer.send('request-update-label-in-second-window', data);
});