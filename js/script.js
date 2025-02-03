'use strict';

(function timeleft(){

  // getMonthName and getDayName
  // taken from http://javascript.about.com/library/bldatenames.htm
  Date.prototype.getMonthName = function() {
    var m = ['January','February','March','April','May','June','July',
    'August','September','October','November','December'];
    return m[this.getMonth()];
  }
  Date.prototype.getDayName = function() {
    var d = ['Sunday','Monday','Tuesday','Wednesday',
    'Thursday','Friday','Saturday'];
    return d[this.getDay()];
  }

  // check if integer (includes strings)
  function isInt(value) {
    return !isNaN(value) &&
           parseInt(Number(value)) == value &&
           !isNaN(parseInt(value, 10));
  }

  var schedule = {
    bedTime: 22,
    wakeTime: 6.5,
    goToWorkTime: 8,
    comeHomeTime: 17,
    totalBed: 0,
    totalWork: 0,
    freeTime: 0,
    isPreWork: false,
    isPreBed: false,
    isAtWork: false,
    isInBed: false,
    totalPreWorkFreeTime: 0,
    totalPreBedFreeTime: 0,
    totalHoursRemainingUntilNextThing: 0,
    bedTimeDate: new Date(),
    goToWorkDate: new Date(),
    wakeTimeDate: new Date(),
    comeHomeDate: new Date(),
  };

  var clock = {
    width: 440,
    height: 440,
    radius: 220,
    numDistFromEdge: 15,
    secondHandDistFromEdge: 5,
    secondHandLengthOfShortSide: 70,
    hourHandDistFromEdge: 40,
    hourHandLengthOfShortSide: 30,
    increment: 0.03,
    delay: 10,
    svg: document.getElementById('main-clock'),
    sleepSlice: document.getElementById('sleep-slice'),
    workSlice: document.getElementById('work-slice'),
    hourHand: document.getElementById('hour-hand'),
    hourHandShortSide: document.getElementById('hour-hand-opposite'),
    secondHand: document.getElementById('second-hand'),
    secondHandShortSide: document.getElementById('second-hand-opposite'),
  };

  clock.centerX = (clock.width / 2) + 30;
  clock.centerY = (clock.height / 2) + 30;

  var miniClock = {
    width: 250,
    height: 250,
    radius: 125,
    delay: 16,
    svg: document.getElementById('mini-clock'),
    slice: document.getElementById('mini-clock-slice'),
    busy: document.getElementById('mini-clock-busy'),
  };

  miniClock.centerX = miniClock.width / 2;
  miniClock.centerY = miniClock.height / 2;

  schedule.totalBed = measureTime(schedule.bedTime, schedule.wakeTime);
  schedule.totalWork = measureTime(schedule.goToWorkTime, schedule.comeHomeTime);

  var timer = {
    display: document.getElementById('timer-display'),
    label: document.getElementById('timer-label'),
  };

  var timeControls = {
    bedtimeInput: document.getElementById('bedtime'),
    waketimeInput: document.getElementById('waketime'),
    goToWorkInput: document.getElementById('go-to-work'),
    comeHomeInput: document.getElementById('come-home'),
  };

  var newBedTime = schedule.bedTime;
  var newWakeTime = schedule.wakeTime;
  var newGoToWorkTime = schedule.goToWorkTime;
  var newComeHomeTime = schedule.comeHomeTime;

  var sB = schedule.bedTime;
  var eB = schedule.wakeTime;
  var sW = schedule.goToWorkTime;
  var eW = schedule.comeHomeTime;

  var freeTimeDisplay = document.getElementById('free-time');

  var pi = Math.PI;
  var sin = Math.sin;
  var cos = Math.cos;

  var now = new Date();

  function measureTime(t1, t2) {
    // measure the amount time between two given points
    var result = 0;
    if (t1 > t2) {
      result = (24 - t1) + t2;
    } else {
      result =  t2 - t1;
    }
    return Math.round(result * 10) / 10;
  }

  var leadingZero = function (time) {
    return (time < 10) ? '0' + time : '' + time;
  };

  var convertToMinutes = function (t) {
    var min = leadingZero(parseInt((t - Math.floor(t)) * 60));
    // console.log('convertToMinutes(' + t + ') = ' + leadingZero(parseInt(t)) + ':' + min);
    return leadingZero(parseInt(t)) + ':' + min;
  };

  var convertToDecimal = function (input) {
    if (isInt(input)) {
      return '' + input;
    }
    var dec = input.split(/[.:]/);
    var h = parseInt(dec[0]);
    var m = dec[1] ? parseInt(dec[1]) / 60 : 0;
    if ((h >= 0 && h <= 23) && (m >= 0 && m <= 59)) {
      // console.log('convertToDecimal(' + input + ') = ' + '' + Math.ceil((h + m) * 100) / 100);
      return '' + Math.ceil((h + m) * 100) / 100;
    } else {
      return '';
    }
  };

  function updateDate () {
    now = new Date();
    document.getElementById('day-name').innerHTML = now.getDayName();
    document.getElementById('day-number').innerHTML=('0'+now.getDate()).slice(-2);
    document.getElementById('month-name').innerHTML = now.getMonthName();
  }

  schedule.updateDates = function () {

    schedule.bedTimeDate.setHours(parseInt(schedule.bedTime));
    schedule.bedTimeDate.setMinutes((schedule.bedTime - parseInt(schedule.bedTime)) * 60);
    schedule.bedTimeDate.setSeconds(0);
    schedule.wakeTimeDate.setHours(schedule.wakeTime);
    schedule.wakeTimeDate.setMinutes((schedule.wakeTime - parseInt(schedule.wakeTime)) * 60);
    schedule.wakeTimeDate.setSeconds(0);
    schedule.wakeTimeDate.setDate(now.getDate() + 1);

    schedule.goToWorkDate.setHours(schedule.goToWorkTime);
    schedule.goToWorkDate.setMinutes((schedule.goToWorkTime - parseInt(schedule.goToWorkTime)) * 60);
    schedule.goToWorkDate.setSeconds(0);

    schedule.comeHomeDate.setHours(schedule.comeHomeTime);
    schedule.comeHomeDate.setMinutes((schedule.comeHomeTime - parseInt(schedule.comeHomeTime)) * 60);
    schedule.comeHomeDate.setSeconds(0);

    // if bedtime is between 0 and 12, set bedtime date to tomorrow
    if (schedule.bedTime >= 0 && schedule.bedTime <= 12) {
      schedule.bedTimeDate.setDate(now.getDate() + 1);
    } else {
      schedule.bedTimeDate.setDate(now.getDate());
    }
    return 0;
  };

  schedule.updateFreeTime = function () {

    schedule.totalBed = measureTime(schedule.bedTime, schedule.wakeTime);
    schedule.totalWork = measureTime(schedule.goToWorkTime,
      schedule.comeHomeTime);
    schedule.totalPreWorkFreeTime = measureTime(schedule.wakeTime,
      schedule.goToWorkTime);
    schedule.totalPreBedFreeTime = measureTime(schedule.comeHomeTime,
      schedule.bedTime);

    schedule.freeTime = schedule.totalPreBedFreeTime +
      schedule.totalPreWorkFreeTime;
    schedule.freeTime = Math.round(schedule.freeTime * 100) / 100;

    if (isInt(schedule.freeTime)) {
      freeTimeDisplay.innerHTML = schedule.freeTime;
    } else {
      freeTimeDisplay.innerHTML = schedule.freeTime.toFixed(1);
    }

  };

  clock.getX = function (hour, radius) {
    radius = (radius) ? radius : clock.radius;
    var deg = hour * 15 - 90; // -90º so zero is at the top
    var rad = deg * pi / 180;
    return clock.centerX + (cos(rad) * radius);
  };

  clock.getY = function (hour, radius) {
    radius = (radius) ? radius : clock.radius;
    var deg = hour * 15 - 90;
    var rad = deg * pi / 180;
    return clock.centerY + (sin(rad) * radius);
  };

  clock.drawNumbers = function () {
    for (var i = 0; i < 24; i++) {
      var x = clock.getX(i, clock.radius + clock.numDistFromEdge);
      var y = clock.getY(i, clock.radius + clock.numDistFromEdge);
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x); // convert to string?
      text.setAttribute('y', y);
      text.setAttribute('class', 'number-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = i;
      clock.svg.appendChild(text);
    }
  };

  clock.updateHourHand = function () {
    now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    m /= 60;
    h += m;

    var x = clock.getX(h, clock.radius - clock.hourHandDistFromEdge);
    var y = clock.getY(h, clock.radius - clock.hourHandDistFromEdge);

    clock.hourHand.setAttribute('x2', x);
    clock.hourHand.setAttribute('y2', y);

    var opp = (h + 12) % 24;

    x = clock.getX(opp, clock.hourHandLengthOfShortSide);
    y = clock.getY(opp, clock.hourHandLengthOfShortSide);

    clock.hourHandShortSide.setAttribute('x2', x);
    clock.hourHandShortSide.setAttribute('y2', y);

    // while we're at it, update the date and timer at the bottom
    updateDate();
    schedule.updateDates();
    // schedule.updateGoToWorkTimeDate();
  };

  clock.updateMinuteHand = function () {
    now = new Date();
    var s = now.getSeconds();
    var ms = now.getMilliseconds();
    s += ms / 1000;
    var q = s / 60 * 24;
    var x = clock.getX(q, clock.radius - clock.secondHandDistFromEdge);
    var y = clock.getY(q, clock.radius - clock.secondHandDistFromEdge);
    clock.secondHand.setAttribute('x2', x);
    clock.secondHand.setAttribute('y2', y);
    var opp = ((q + 12) % 24);
    x = clock.getX(opp, clock.secondHandLengthOfShortSide);
    y = clock.getY(opp, clock.secondHandLengthOfShortSide);
    clock.secondHandShortSide.setAttribute('x2', x);
    clock.secondHandShortSide.setAttribute('y2', y);
  };

  clock.drawSlice = function (slice, hourS, hourF) {

    // start
    var xS = clock.getX(hourS), yS = clock.getY(hourS);

    // finish
    var xF = clock.getX(hourF), yF = clock.getY(hourF);

    // SVG arc path nomenclature:
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y

    // Large arc flag must change like this:
    // for 7–17, we need 0 (10) < 12
    // for 5–18, we need 1 (13) > 12 between 12 and 24
    // for 17-7, we need 1 (-10) > -12 between -12 and 0
    // for 18-5, we need 0 (-13) < -12

    var newPath = 'M' + this.centerX + ' ' + this.centerY + ',' + 'L' + xS +
      ' ' + yS +',A' + this.radius + ' ' + this.radius + ' ' + '0,' +
      (((hourF-hourS) > 12 && (hourF-hourS) < 24 ) ||
      ( (hourF-hourS) > -12 && (hourF-hourS) < 0 ) ? 1 : 0) +
      ',1,' + xF + ' ' + yF + ',L ' + this.centerX + ' ' + this.centerY;

    slice.setAttribute('d', newPath);

  };

  clock.updateSlice = function () {

    clock.drawSlice(clock.sleepSlice, sB, eB);
    clock.drawSlice(clock.workSlice, sW, eW);

    var a = (24 - schedule.bedTime + newBedTime) % 24;
    var b = (24 - newBedTime + schedule.bedTime) % 24;

    // take the shortest path
    if (a < b) {
      sB = (sB + clock.increment) % 24; // clockwise
    } else if (a > b) {
      sB = sB - clock.increment; // counter-clockwise
      sB = (sB < 0) ? sB + 24 : sB;
    }
    sB = Math.round(sB * 1000) / 1000;

    a = (24 - schedule.wakeTime + newWakeTime) % 24;
    b = (24 - newWakeTime + schedule.wakeTime) % 24;

     // take the shortest path
     if (a < b) {
       // clockwise
       eB = (eB + clock.increment) % 24;
     } else if (a > b) {
       // counter-clockwise
       eB = eB - clock.increment;
       eB = (eB < 0) ? eB + 24 : eB;
    }
    eB = Math.round(eB * 1000) / 1000;

    a = (24 - schedule.goToWorkTime + newGoToWorkTime) % 24;
    b = (24 - newGoToWorkTime + schedule.goToWorkTime) % 24;

     // take the shortest path
     if (a < b) {
       // clockwise
       sW = (sW + clock.increment) % 24;
     } else if (a > b) {
       // counter-clockwise
       sW = sW - clock.increment;
       sW = (sW < 0) ? sW + 24 : sW;
    }
    sW = Math.round(sW * 1000) / 1000;

    a = (24 - schedule.comeHomeTime + newComeHomeTime) % 24;
    b = (24 - newComeHomeTime + schedule.comeHomeTime) % 24;

     // take the shortest path
     if (a < b) {
       // clockwise
       eW = (eW + clock.increment) % 24;
     } else if (a > b) {
       // counter-clockwise
       eW = eW - clock.increment;
       eW = (eW < 0) ? eW + 24 : eW;
    }
    eW = Math.round(eW * 1000) / 1000;

    var diffsB = Math.abs(sB - newBedTime);
    var diffeB = Math.abs(eB - newWakeTime);
    var diffsW = Math.abs(sW - newGoToWorkTime);
    var diffeW = Math.abs(eW - newComeHomeTime);

    if (Math.abs(diffsB < 0.1)) {
      schedule.bedTime = sB = newBedTime;
    }
    if (Math.abs(diffeB < 0.1)) {
      schedule.wakeTime = eB = newWakeTime;
    }
    if (Math.abs(diffsW < 0.1)) {
      schedule.goToWorkTime = sW = newGoToWorkTime;
    }
    if (Math.abs(diffeW < 0.1)) {
      schedule.comeHomeTime = eW = newComeHomeTime;
    }

    if (schedule.bedTime == newBedTime && schedule.wakeTime == newWakeTime &&
        schedule.goToWorkTime == newGoToWorkTime && schedule.comeHomeTime ==
          newComeHomeTime) {

      clock.drawSlice(clock.sleepSlice, schedule.bedTime, schedule.wakeTime);
      clock.drawSlice(clock.workSlice, schedule.goToWorkTime,
        schedule.comeHomeTime);
      schedule.updateFreeTime();
      schedule.updateDates();
      // schedule.updateGoToWorkTimeDate();
      timer.updateTimer();
      // timeControls.bedtimeInput.value = convertToMinutes(schedule.bedTime);
      // timeControls.waketimeInput.value = convertToMinutes(schedule.wakeTime);
      // timeControls.goToWorkInput.value = convertToMinutes(schedule.goToWorkTime);
      // timeControls.comeHomeInput.value = convertToMinutes(schedule.comeHomeTime);
    } else {
      setTimeout(clock.updateSlice, clock.delay);
    }

  };

  miniClock.drawSlice = function (sec, total) {
    var percent = total === 0 ? 0 : 1 - (sec / total);
    var deg = ((360 * percent) + 270) % 360;
    // var deg = hour * 15 - 90; // -90º so zero is at the top
    var rad = deg * pi / 180;

    var x = miniClock.centerX + (cos(rad) * miniClock.radius);
    var y = miniClock.centerY + (sin(rad) * miniClock.radius);
    
    var newPath = 'M' + this.centerX + ' ' + this.centerY + ',' + 'L' +
      x + ',' + y + ',A' + this.radius + ' ' + this.radius + ' ' + '0,' +
      ((percent > 0.5) ? '0' : '1') +',1,' + '125,0' + ',L ' +
      this.centerX + ' ' + this.centerY;

    this.slice.setAttribute('d', newPath);
  };

  // give it an amount of seconds and it will format it as total time remaining
  // and return a string
  timer.calcTime = function (seconds) {

    //find out how many hours/mins/seconds are left
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * (3600);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * (60);

    // don't show hours/minutes if we don't need them
    // if (hours > 0)
      var timeStr = (leadingZero(hours) + ':' +
        leadingZero(minutes) + ':' +
        leadingZero(seconds));
    // else if (minutes > 0)
    //   var timeStr = (leadingZero(minutes) + ':' + leadingZero(seconds));
    // else
    //   var timeStr = leadingZero(seconds);

    return timeStr;
  };

  timer.updateTimer = function () {

      var milliSecondsLeft = 0;
      var totalFreeSeconds = 0;
      now = new Date();
      // var h = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds()/3600);
      // console.log(h);

      if (now >= schedule.goToWorkDate && now < schedule.comeHomeDate) {
        schedule.isAtWork = true;
        schedule.isPreWork = schedule.isPreBed = schedule.isInBed = false;
        milliSecondsLeft = schedule.comeHomeDate - now;
      } else if (now >= schedule.comeHomeDate && now < schedule.bedTimeDate) {
        schedule.isPreBed = true;
        schedule.isPreWork = schedule.isAtWork = schedule.isInBed = false;
        milliSecondsLeft = schedule.bedTimeDate - now;
      } else if (now >= schedule.bedTimeDate && now < schedule.wakeTimeDate) {
        schedule.isInBed = true;
        schedule.isPreWork = schedule.isPreBed = schedule.isAtWork = false;
        milliSecondsLeft = schedule.wakeTimeDate - now;
      } else if (now >= schedule.wakeTimeDate && now < schedule.goToWorkDate) {
        schedule.isPreWork = true;
        schedule.isPreBed = schedule.isAtWork = schedule.isInBed = false;
        milliSecondsLeft = schedule.goToWorkDate - now;
      }

      var secondsLeft = Math.round(milliSecondsLeft / 1000);
      var t = 0;

      if (schedule.isPreWork) {
        timer.label.innerHTML = 'Time until work';
        totalFreeSeconds = schedule.totalPreWorkFreeTime * 3600;
        t = secondsLeft / 3600;
        schedule.totalHoursRemainingUntilNextThing = Math.round(t * 10) / 10;
        miniClock.drawSlice(secondsLeft, totalFreeSeconds);
        miniClock.busy.style.display = 'none';
      } else if (schedule.isPreBed) {
        timer.label.innerHTML = 'Time until bedtime';
        totalFreeSeconds = schedule.totalPreBedFreeTime * 3600;
        t = secondsLeft / 3600;
        schedule.totalHoursRemainingUntilNextThing = Math.round(t * 10) / 10;
        miniClock.drawSlice(secondsLeft, totalFreeSeconds);
        miniClock.busy.style.display = 'none';
      } else if (schedule.isAtWork) {
        timer.label.innerHTML = 'Time until finish work';
        miniClock.busy.innerHTML = 'WORKING';
        miniClock.drawSlice(secondsLeft, totalFreeSeconds);
      } else if (schedule.isInBed) {
        timer.label.innerHTML = 'Time until wake up';
        miniClock.busy.innerHTML = 'SLEEPING';
        miniClock.drawSlice(secondsLeft, totalFreeSeconds);
      }

      // if past bedTime, set to zero
      // if (secondsLeft <= 0) {
      //   timer.display.innerHTML = '00:00:00'
      // } else {
        timer.display.innerHTML = timer.calcTime(secondsLeft);
      // }
  };



  window.onload = function() {

    updateDate();
    schedule.updateFreeTime();
    schedule.updateDates();
    clock.drawNumbers();
    clock.updateHourHand();
    clock.updateMinuteHand();
    clock.drawSlice(clock.sleepSlice, schedule.bedTime, schedule.wakeTime);
    clock.drawSlice(clock.workSlice, schedule.goToWorkTime,
      schedule.comeHomeTime);
    timer.updateTimer();

    // set default values
    timeControls.bedtimeInput.value = convertToMinutes(schedule.bedTime);
    timeControls.waketimeInput.value = convertToMinutes(schedule.wakeTime);
    timeControls.goToWorkInput.value = convertToMinutes(schedule.goToWorkTime);
    timeControls.comeHomeInput.value = convertToMinutes(schedule.comeHomeTime);

    // get timer to show time left before first interval kicks in
    now = new Date();
    var h = now.getHours();
    var milliSecondsLeft = 0;
    if (h >= schedule.wakeTime && h < schedule.goToWorkTime) {
      milliSecondsLeft = schedule.goToWorkDate - now;
      timer.label.innerHTML = 'Time until work';
    } else {
      milliSecondsLeft = schedule.bedTimeDate - now;
      timer.label.innerHTML = 'Time until bedtime';
    }
    var secondsLeft = Math.round(milliSecondsLeft / 1000);
    if (secondsLeft <= 0) {
      timer.display.innerHTML = '00:00:00';
    } else {
      timer.display.innerHTML = timer.calcTime(secondsLeft);
    }

    // timer (time left until bedTime)
    var timerInterval = setInterval(function() {
      timer.updateTimer();
    }, 1000);

    // timer (time left until bedTime)
    var secondHandInterval = setInterval(function() {
      clock.updateMinuteHand();
    }, 16);


    // hour hand – do this every 30000ms = 30s
    var hourHandInterval = setInterval(function() {
      clock.updateHourHand();
    }, 30000);

  }; // ======== end of window.onload


  function inputIsOK(input, type) {

    if (isInt(input) && input >= 0 && input < 24) {

      var sleepCrossesZero = (schedule.bedTime > schedule.wakeTime) ?
          true : false;
      var workCrossesZero = (schedule.goToWorkTime > schedule.comeHomeTime) ?
          true : false;

      // switch (type) {
      //   case 'bed':
      //     if (workCrossesZero) {
      //       if (input >= schedule.wakeTime || input < schedule.comeHomeTime) {
      //         alert('errorz. work crosses zero.');
      //         return false;
      //       }
      //     } else {
      //       if (input >= schedule.wakeTime || input < schedule.comeHomeTime) {
      //         alert('errorz. no cross.');
      //         return false;
      //       }
      //     }
      //     break;
      //   case 'wake':
      //     if (workCrossesZero) {
      //       if (input > schedule.goToWorkTime || input <= schedule.bedTime) {
      //         alert('errorz. work crosses zero');
      //         return false;
      //       }
      //     } else {
      //       if (input > schedule.goToWorkTime || input <= schedule.bedTime) {
      //         alert('errorz. no cross.');
      //         return false;
      //       }
      //     }
      //     break;
      //   case 'work':
      //     if (sleepCrossesZero) {
      //       if (input >= schedule.comeHomeTime || input < schedule.wakeTime) {
      //         alert('errorz. SCZ');
      //         return false;
      //       }
      //     } else {
      //       if (input >= schedule.comeHomeTime || input < schedule.wakeTime) {
      //         alert('errorz. no cross');
      //         return false;
      //       }
      //     }
      //     break;
      //   case 'home':
      //     if (sleepCrossesZero) {
      //       if (input > schedule.bedTime || input <= schedule.goToWorkTime) {
      //         alert('errorz. SCZ');
      //         return false;
      //       }
      //     } else {
      //       if (input > schedule.bedTime || input <= schedule.goToWorkTime) {
      //         alert('errorz. no cross');
      //         return false;
      //       }
      //     }
      //     break;
      // }

      return true;
    } else {
      return false;
    }
  }


  function handleBedtimeInputChange(e) {
    if (e.keyCode == 13) {
      var x = convertToDecimal(timeControls.bedtimeInput.value);
      if (inputIsOK(x, 'bed')) {
        newBedTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }

  function handleWaketimeInputChange(e) {
    if (e.keyCode == 13) {
      var x = convertToDecimal(timeControls.waketimeInput.value);
      if (inputIsOK(x, 'wake')) {
        newWakeTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }

  function handleGoToWorkInputChange(e) {
    if (e.keyCode == 13) {
      var x = convertToDecimal(timeControls.goToWorkInput.value);
      if (inputIsOK(x, 'work')) {
        newGoToWorkTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }

  function handleComeHomeInputChange(e) {
    if (e.keyCode == 13) {
      var x = convertToDecimal(timeControls.comeHomeInput.value);
      if (inputIsOK(x, 'home')) {
        newComeHomeTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }

  timeControls.bedtimeInput.addEventListener('keypress', handleBedtimeInputChange, false);
  timeControls.waketimeInput.addEventListener('keypress', handleWaketimeInputChange, false);
  timeControls.goToWorkInput.addEventListener('keypress', handleGoToWorkInputChange, false);
  timeControls.comeHomeInput.addEventListener('keypress', handleComeHomeInputChange, false);

  // bedtimeInput.addEventListener('blur', handleBedtimeInputChange, false);
  // waketimeInput.addEventListener('blur', handleWaketimeInputChange, false);
  // goToWorkInput.addEventListener('blur', handleGoToWorkInputChange, false);
  // comeHomeInput.addEventListener('blur', handleComeHomeInputChange, false);

  $('#bedtime').blur(function(e){
    var x = convertToDecimal(timeControls.bedtimeInput.value);
    if (inputIsOK(x, 'bed')) {
      newBedTime = parseFloat(x);
      timeControls.bedtimeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });

  $('#waketime').blur(function(e){
    var x = convertToDecimal(timeControls.waketimeInput.value);
    if (inputIsOK(x, 'wake')) {
      newWakeTime = parseFloat(x);
      timeControls.waketimeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });

  $('#go-to-work').blur(function(e){
    var x = convertToDecimal(timeControls.goToWorkInput.value);
    if (inputIsOK(x, 'work')) {
      newGoToWorkTime = parseFloat(x);
      timeControls.goToWorkInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });

  $('#come-home').blur(function(e){
    var x = convertToDecimal(timeControls.comeHomeInput.value);
    if (inputIsOK(x, 'home')) {
      newComeHomeTime = parseFloat(x);
      timeControls.comeHomeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });

  $('.slice').mouseenter(function(){
    if (this.id == 'work-slice') {
      $('.tooltip-label.main').text('Work');
      $('.tooltip-data.main').text(schedule.totalWork);
      $('.tooltip-hrs.main').text('hrs');
      $('.tooltip.main').show();
    } else if (this.id == 'sleep-slice') {
      $('.tooltip-label.main').text('Sleep');
      $('.tooltip-data.main').text(schedule.totalBed);
      $('.tooltip-hrs.main').text('hrs');
      $('.tooltip.main').show();
    } else if (this.id == 'mini-clock-slice') {
      $('.tooltip-label.mini').text('Remaining');
      // what about pre work?
      $('.tooltip-data.mini').text(schedule.totalHoursRemainingUntilNextThing);
      $('.tooltip-hrs.mini').text('hrs');
      $('.tooltip.mini').show();
    } else if (this.id == 'mini-clock-face') {
      $('.tooltip-label.mini').text('Total');
      // what about pre work?
      $('.tooltip-data.mini').text(schedule.totalPreBedFreeTime);
      $('.tooltip-hrs.mini').text('hrs');
      $('.tooltip.mini').show();
    }
  });

  $('.slice').bind('mousemove', function(e){
    $('.tooltip').offset({
      left: e.pageX + 5,
      top: e.pageY + 5
    });
  });

  $('.slice').mouseout(function(){
    $('.tooltip').hide();
  });


})();