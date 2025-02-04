(function () {
  "use strict";

  // =============================
  // MARK: Section 1
  // Constants & Prototypes
  // =============================
  const DEG_TO_RAD = Math.PI / 180; // Convert degrees to radians

  // Extend Date prototype for month and day names
  Date.prototype.getMonthName = function () {
    const m = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return m[this.getMonth()];
  };
  Date.prototype.getDayName = function () {
    const d = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return d[this.getDay()];
  };

  // =============================
  // MARK: Section 2
  // Utility Functions
  // =============================
  function isInt(value) {
    return (
      !isNaN(value) &&
      parseInt(Number(value)) == value &&
      !isNaN(parseInt(value, 10))
    );
  }

  function measureTime(t1, t2) {
    let result = t1 > t2 ? 24 - t1 + t2 : t2 - t1;
    return Math.round(result * 10) / 10;
  }

  function leadingZero(time) {
    return time < 10 ? "0" + time : "" + time;
  }

  function convertToMinutes(t) {
    const min = leadingZero(parseInt((t - Math.floor(t)) * 60));
    return leadingZero(parseInt(t)) + ":" + min;
  }

  function convertToDecimal(input) {
    if (isInt(input)) return "" + input;
    const dec = input.split(/[.:]/);
    const h = parseInt(dec[0]);
    const m = dec[1] ? parseInt(dec[1]) / 60 : 0;
    return h >= 0 && h <= 23 && m >= 0 && m <= 59
      ? "" + Math.ceil((h + m) * 100) / 100
      : "";
  }

  function updateDate() {
    const now = new Date();
    document.getElementById("day-name").innerHTML = now.getDayName();
    document.getElementById("day-number").innerHTML = (
      "0" + now.getDate()
    ).slice(-2);
    document.getElementById("month-name").innerHTML = now.getMonthName();
  }

  // =============================
  // MARK: Section 3
  // Objects & DOM Elements
  // =============================
  const schedule = {
    bedTime: 22,
    wakeTime: 5,
    goToWorkTime: 9,
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
    wakeTimeDate: new Date(),
    goToWorkDate: new Date(),
    comeHomeDate: new Date(),
  };

  const clock = {
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
    svg: document.getElementById("main-clock"),
    sleepSlice: document.getElementById("sleep-slice"),
    workSlice: document.getElementById("work-slice"),
    hourHand: document.getElementById("hour-hand"),
    hourHandShortSide: document.getElementById("hour-hand-opposite"),
    secondHand: document.getElementById("second-hand"),
    secondHandShortSide: document.getElementById("second-hand-opposite"),
  };
  clock.centerX = clock.width / 2 + 30;
  clock.centerY = clock.height / 2 + 30;

  const miniClock = {
    width: 250,
    height: 250,
    radius: 125,
    delay: 16,
    svg: document.getElementById("mini-clock"),
    slice: document.getElementById("mini-clock-slice"),
    busy: document.getElementById("mini-clock-busy"),
  };
  miniClock.centerX = miniClock.width / 2;
  miniClock.centerY = miniClock.height / 2;

  const timer = {
    display: document.getElementById("timer-display"),
    label: document.getElementById("timer-label"),
  };

  const timeControls = {
    bedtimeInput: document.getElementById("bedtime"),
    waketimeInput: document.getElementById("waketime"),
    goToWorkInput: document.getElementById("go-to-work"),
    comeHomeInput: document.getElementById("come-home"),
  };

  let newBedTime = schedule.bedTime,
    newWakeTime = schedule.wakeTime,
    newGoToWorkTime = schedule.goToWorkTime,
    newComeHomeTime = schedule.comeHomeTime;

  let sB = schedule.bedTime,
    eB = schedule.wakeTime,
    sW = schedule.goToWorkTime,
    eW = schedule.comeHomeTime;

  const freeTimeDisplay = document.getElementById("free-time");

  // Initialize schedule totals
  schedule.totalBed = measureTime(schedule.bedTime, schedule.wakeTime);
  schedule.totalWork = measureTime(
    schedule.goToWorkTime,
    schedule.comeHomeTime
  );

  // =============================
  // MARK: Section 4
  // Clock, Timer & Schedule Methods
  // =============================
  clock.getX = function (hour, radius) {
    radius = radius || clock.radius;
    const deg = hour * 15 - 90;
    return clock.centerX + Math.cos(deg * DEG_TO_RAD) * radius;
  };
  clock.getY = function (hour, radius) {
    radius = radius || clock.radius;
    const deg = hour * 15 - 90;
    return clock.centerY + Math.sin(deg * DEG_TO_RAD) * radius;
  };

  clock.drawNumbers = function () {
    for (let i = 0; i < 24; i++) {
      const x = clock.getX(i, clock.radius + clock.numDistFromEdge);
      const y = clock.getY(i, clock.radius + clock.numDistFromEdge);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x); // convert to string?
      text.setAttribute("y", y);
      text.setAttribute("class", "number-label");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = i;
      clock.svg.appendChild(text);
    }
  };

  clock.updateHourHand = function () {
    let now = new Date(); // added let declaration
    let h = now.getHours();
    let m = now.getMinutes();
    m /= 60;
    h += m;

    let x = clock.getX(h, clock.radius - clock.hourHandDistFromEdge);
    let y = clock.getY(h, clock.radius - clock.hourHandDistFromEdge);

    clock.hourHand.setAttribute("x2", x);
    clock.hourHand.setAttribute("y2", y);

    const opp = (h + 12) % 24;

    x = clock.getX(opp, clock.hourHandLengthOfShortSide);
    y = clock.getY(opp, clock.hourHandLengthOfShortSide);

    clock.hourHandShortSide.setAttribute("x2", x);
    clock.hourHandShortSide.setAttribute("y2", y);

    // while we're at it, update the date and timer at the bottom
    updateDate();
    schedule.updateDates();
    // schedule.updateGoToWorkTimeDate();
  };

  clock.updateMinuteHand = function () {
    let now = new Date(); // now declared using let
    let s = now.getSeconds();
    const ms = now.getMilliseconds();
    s += ms / 1000;
    const q = (s / 60) * 24;
    let x = clock.getX(q, clock.radius - clock.secondHandDistFromEdge);
    let y = clock.getY(q, clock.radius - clock.secondHandDistFromEdge);
    clock.secondHand.setAttribute("x2", x);
    clock.secondHand.setAttribute("y2", y);
    const opp = (q + 12) % 24;
    x = clock.getX(opp, clock.secondHandLengthOfShortSide);
    y = clock.getY(opp, clock.secondHandLengthOfShortSide);
    clock.secondHandShortSide.setAttribute("x2", x);
    clock.secondHandShortSide.setAttribute("y2", y);
  };

  clock.drawSlice = function (slice, hourS, hourF) {
    // start
    const xS = clock.getX(hourS),
      yS = clock.getY(hourS);

    // finish
    const xF = clock.getX(hourF),
      yF = clock.getY(hourF);

    // SVG arc path nomenclature:
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y

    // Large arc flag must change like this:
    // for 7–17, we need 0 (10) < 12
    // for 5–18, we need 1 (13) > 12 between 12 and 24
    // for 17-7, we need 1 (-10) > -12 between -12 and 0
    // for 18-5, we need 0 (-13) < -12

    const newPath =
      "M" +
      this.centerX +
      " " +
      this.centerY +
      "," +
      "L" +
      xS +
      " " +
      yS +
      ",A" +
      this.radius +
      " " +
      this.radius +
      " " +
      "0," +
      ((hourF - hourS > 12 && hourF - hourS < 24) ||
      (hourF - hourS > -12 && hourF - hourS < 0)
        ? 1
        : 0) +
      ",1," +
      xF +
      " " +
      yF +
      ",L " +
      this.centerX +
      " " +
      this.centerY;

    slice.setAttribute("d", newPath);
  };

  clock.updateSlice = function () {
    clock.drawSlice(clock.sleepSlice, sB, eB);
    clock.drawSlice(clock.workSlice, sW, eW);

    let a = (24 - schedule.bedTime + newBedTime) % 24;
    let b = (24 - newBedTime + schedule.bedTime) % 24;

    // take the shortest path
    if (a < b) {
      sB = (sB + clock.increment) % 24; // clockwise
    } else if (a > b) {
      sB = sB - clock.increment; // counter-clockwise
      sB = sB < 0 ? sB + 24 : sB;
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
      eB = eB < 0 ? eB + 24 : eB;
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
      sW = sW < 0 ? sW + 24 : sW;
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
      eW = eW < 0 ? eW + 24 : eW;
    }
    eW = Math.round(eW * 1000) / 1000;

    const diffsB = Math.abs(sB - newBedTime);
    const diffeB = Math.abs(eB - newWakeTime);
    const diffsW = Math.abs(sW - newGoToWorkTime);
    const diffeW = Math.abs(eW - newComeHomeTime);

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

    if (
      schedule.bedTime == newBedTime &&
      schedule.wakeTime == newWakeTime &&
      schedule.goToWorkTime == newGoToWorkTime &&
      schedule.comeHomeTime == newComeHomeTime
    ) {
      clock.drawSlice(clock.sleepSlice, schedule.bedTime, schedule.wakeTime);
      clock.drawSlice(
        clock.workSlice,
        schedule.goToWorkTime,
        schedule.comeHomeTime
      );
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
    const percent = total === 0 ? 0 : 1 - sec / total;
    const deg = (360 * percent + 270) % 360;
    const rad = deg * DEG_TO_RAD;

    // Use Math.cos and Math.sin
    const x = miniClock.centerX + Math.cos(rad) * miniClock.radius;
    const y = miniClock.centerY + Math.sin(rad) * miniClock.radius;

    const newPath =
      "M" +
      this.centerX +
      " " +
      this.centerY +
      "," +
      "L" +
      x +
      "," +
      y +
      ",A" +
      this.radius +
      " " +
      this.radius +
      " " +
      "0," +
      (percent > 0.5 ? "0" : "1") +
      ",1," +
      "125,0" +
      ",L " +
      this.centerX +
      " " +
      this.centerY;

    this.slice.setAttribute("d", newPath);
  };

  // give it an amount of seconds and it will format it as total time remaining
  // and return a string
  timer.calcTime = function (seconds) {
    //find out how many hours/mins/seconds are left
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    const timeStr =
      leadingZero(hours) +
      ":" +
      leadingZero(minutes) +
      ":" +
      leadingZero(seconds);

    return timeStr;
  };

  timer.updateTimer = function () {
    let now = new Date();
    let milliSecondsLeft = 0;
    let totalFreeSeconds = 0;

    // Reorder conditions for a full day cycle:
    if (now < schedule.goToWorkDate) {
      schedule.isPreWork = true;
      schedule.isPreBed = schedule.isAtWork = schedule.isInBed = false;
      milliSecondsLeft = schedule.goToWorkDate - now;
      timer.label.innerHTML = "Time until work";
      totalFreeSeconds = schedule.totalPreWorkFreeTime * 3600;
    } else if (now < schedule.comeHomeDate) {
      schedule.isAtWork = true;
      schedule.isPreWork = schedule.isPreBed = schedule.isInBed = false;
      milliSecondsLeft = schedule.comeHomeDate - now;
      timer.label.innerHTML = "Time until finish work";
    } else if (now < schedule.bedTimeDate) {
      schedule.isPreBed = true;
      schedule.isPreWork = schedule.isAtWork = schedule.isInBed = false;
      milliSecondsLeft = schedule.bedTimeDate - now;
      timer.label.innerHTML = "Time until bedtime";
      totalFreeSeconds = schedule.totalPreBedFreeTime * 3600;
    } else {
      schedule.isInBed = true;
      schedule.isPreWork = schedule.isPreBed = schedule.isAtWork = false;
      milliSecondsLeft = schedule.wakeTimeDate - now;
      timer.label.innerHTML = "Time until wake up";
    }

    const secondsLeft = Math.round(milliSecondsLeft / 1000);
    let t = secondsLeft / 3600;
    schedule.totalHoursRemainingUntilNextThing = Math.round(t * 10) / 10;

    if (schedule.isPreWork || schedule.isPreBed) {
      miniClock.drawSlice(secondsLeft, totalFreeSeconds);
      miniClock.busy.style.display = "none";
    } else if (schedule.isAtWork) {
      miniClock.busy.innerHTML = "WORKING";
      miniClock.drawSlice(secondsLeft, totalFreeSeconds);
    } else if (schedule.isInBed) {
      miniClock.busy.innerHTML = "SLEEPING";
      miniClock.drawSlice(secondsLeft, totalFreeSeconds);
    }
    timer.display.innerHTML = timer.calcTime(secondsLeft);
  };

  schedule.updateDates = function () {
    let now = new Date();

    // Bedtime
    schedule.bedTimeDate = new Date(now);
    schedule.bedTimeDate.setHours(parseInt(schedule.bedTime));
    schedule.bedTimeDate.setMinutes((schedule.bedTime - parseInt(schedule.bedTime)) * 60);
    schedule.bedTimeDate.setSeconds(0);
    if (now >= schedule.bedTimeDate) {
      schedule.bedTimeDate.setDate(schedule.bedTimeDate.getDate() + 1);
    }

    // Wake time
    schedule.wakeTimeDate = new Date(now);
    schedule.wakeTimeDate.setHours(parseInt(schedule.wakeTime));
    schedule.wakeTimeDate.setMinutes((schedule.wakeTime - parseInt(schedule.wakeTime)) * 60);
    schedule.wakeTimeDate.setSeconds(0);
    if (now >= schedule.wakeTimeDate) {
      schedule.wakeTimeDate.setDate(schedule.wakeTimeDate.getDate() + 1);
    }

    // Go-to-work & come-home times (fix)
    let tempGoToWork = new Date(now);
    tempGoToWork.setHours(parseInt(schedule.goToWorkTime));
    tempGoToWork.setMinutes((schedule.goToWorkTime - parseInt(schedule.goToWorkTime)) * 60);
    tempGoToWork.setSeconds(0);

    let tempComeHome = new Date(now);
    tempComeHome.setHours(parseInt(schedule.comeHomeTime));
    tempComeHome.setMinutes((schedule.comeHomeTime - parseInt(schedule.comeHomeTime)) * 60);
    tempComeHome.setSeconds(0);

    if (now < tempGoToWork) {
      schedule.goToWorkDate = tempGoToWork;
      schedule.comeHomeDate = tempComeHome;
    } else if (now < tempComeHome) {
      schedule.goToWorkDate = tempGoToWork;
      schedule.comeHomeDate = tempComeHome;
    } else {
      tempGoToWork.setDate(tempGoToWork.getDate() + 1);
      tempComeHome.setDate(tempComeHome.getDate() + 1);
      schedule.goToWorkDate = tempGoToWork;
      schedule.comeHomeDate = tempComeHome;
    }
    return 0;
  };

  schedule.updateFreeTime = function () {
    schedule.totalBed = measureTime(schedule.bedTime, schedule.wakeTime);
    schedule.totalWork = measureTime(
      schedule.goToWorkTime,
      schedule.comeHomeTime
    );
    schedule.totalPreWorkFreeTime = measureTime(
      schedule.wakeTime,
      schedule.goToWorkTime
    );
    schedule.totalPreBedFreeTime = measureTime(
      schedule.comeHomeTime,
      schedule.bedTime
    );

    schedule.freeTime =
      schedule.totalPreBedFreeTime + schedule.totalPreWorkFreeTime;
    schedule.freeTime = Math.round(schedule.freeTime * 100) / 100;

    if (isInt(schedule.freeTime)) {
      freeTimeDisplay.innerHTML = schedule.freeTime;
    } else {
      freeTimeDisplay.innerHTML = schedule.freeTime.toFixed(1);
    }
  };

  // =============================
  // MARK: Section 5
  // Event Handlers & Initialization
  // =============================
  function inputIsOK(input, type) {
    if (isInt(input) && input >= 0 && input < 24) {
      const sleepCrossesZero =
        schedule.bedTime > schedule.wakeTime ? true : false;
      const workCrossesZero =
        schedule.goToWorkTime > schedule.comeHomeTime ? true : false;
      return true;
    } else {
      return false;
    }
  }

  function handleBedtimeInputChange(e) {
    if (e.keyCode === 13) {
      const x = convertToDecimal(timeControls.bedtimeInput.value);
      if (inputIsOK(x, "bed")) {
        newBedTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }
  function handleWaketimeInputChange(e) {
    if (e.keyCode === 13) {
      const x = convertToDecimal(timeControls.waketimeInput.value);
      if (inputIsOK(x, "wake")) {
        newWakeTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }
  function handleGoToWorkInputChange(e) {
    if (e.keyCode === 13) {
      const x = convertToDecimal(timeControls.goToWorkInput.value);
      if (inputIsOK(x, "work")) {
        newGoToWorkTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }
  function handleComeHomeInputChange(e) {
    if (e.keyCode === 13) {
      const x = convertToDecimal(timeControls.comeHomeInput.value);
      if (inputIsOK(x, "home")) {
        newComeHomeTime = parseFloat(x);
        clock.updateSlice();
      }
    }
    return false;
  }

  timeControls.bedtimeInput.addEventListener(
    "keypress",
    handleBedtimeInputChange,
    false
  );
  timeControls.waketimeInput.addEventListener(
    "keypress",
    handleWaketimeInputChange,
    false
  );
  timeControls.goToWorkInput.addEventListener(
    "keypress",
    handleGoToWorkInputChange,
    false
  );
  timeControls.comeHomeInput.addEventListener(
    "keypress",
    handleComeHomeInputChange,
    false
  );

  $("#bedtime").blur(function (e) {
    const x = convertToDecimal(timeControls.bedtimeInput.value);
    if (inputIsOK(x, "bed")) {
      newBedTime = parseFloat(x);
      timeControls.bedtimeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });
  $("#waketime").blur(function (e) {
    const x = convertToDecimal(timeControls.waketimeInput.value);
    if (inputIsOK(x, "wake")) {
      newWakeTime = parseFloat(x);
      timeControls.waketimeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });
  $("#go-to-work").blur(function (e) {
    const x = convertToDecimal(timeControls.goToWorkInput.value);
    if (inputIsOK(x, "work")) {
      newGoToWorkTime = parseFloat(x);
      timeControls.goToWorkInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });
  $("#come-home").blur(function (e) {
    const x = convertToDecimal(timeControls.comeHomeInput.value);
    if (inputIsOK(x, "home")) {
      newComeHomeTime = parseFloat(x);
      timeControls.comeHomeInput.value = convertToMinutes(x);
      clock.updateSlice();
    }
  });

  $(".slice").mouseenter(function () {
    if (this.id == "work-slice") {
      $(".tooltip-label.main").text("Work");
      $(".tooltip-data.main").text(schedule.totalWork);
      $(".tooltip-hrs.main").text("hrs");
      $(".tooltip.main").show();
    } else if (this.id == "sleep-slice") {
      $(".tooltip-label.main").text("Sleep");
      $(".tooltip-data.main").text(schedule.totalBed);
      $(".tooltip-hrs.main").text("hrs");
      $(".tooltip.main").show();
    } else if (this.id == "mini-clock-slice") {
      $(".tooltip-label.mini").text("Remaining");
      // what about pre work?
      $(".tooltip-data.mini").text(schedule.totalHoursRemainingUntilNextThing);
      $(".tooltip-hrs.mini").text("hrs");
      $(".tooltip.mini").show();
    } else if (this.id == "mini-clock-face") {
      $(".tooltip-label.mini").text("Total");
      // what about pre work?
      $(".tooltip-data.mini").text(schedule.totalPreBedFreeTime);
      $(".tooltip-hrs.mini").text("hrs");
      $(".tooltip.mini").show();
    }
  });

  $(".slice").bind("mousemove", function (e) {
    $(".tooltip").offset({
      left: e.pageX + 5,
      top: e.pageY + 5,
    });
  });

  $(".slice").mouseout(function () {
    $(".tooltip").hide();
  });

  window.onload = function () {
    // ...existing code...
    let now = new Date(); // now declared using let
    const h = now.getHours();
    updateDate();
    schedule.updateFreeTime();
    schedule.updateDates();
    clock.drawNumbers();
    clock.updateHourHand();
    clock.updateMinuteHand();
    clock.drawSlice(clock.sleepSlice, schedule.bedTime, schedule.wakeTime);
    clock.drawSlice(
      clock.workSlice,
      schedule.goToWorkTime,
      schedule.comeHomeTime
    );
    timer.updateTimer();

    // set default values
    timeControls.bedtimeInput.value = convertToMinutes(schedule.bedTime);
    timeControls.waketimeInput.value = convertToMinutes(schedule.wakeTime);
    timeControls.goToWorkInput.value = convertToMinutes(schedule.goToWorkTime);
    timeControls.comeHomeInput.value = convertToMinutes(schedule.comeHomeTime);

    // get timer to show time left before first interval kicks in
    now = new Date();
    let milliSecondsLeft = 0;
    if (now < schedule.goToWorkDate) {
        milliSecondsLeft = schedule.goToWorkDate - now;
        timer.label.innerHTML = "Time until work";
    } else if (now < schedule.comeHomeDate) {
        milliSecondsLeft = schedule.comeHomeDate - now;
        timer.label.innerHTML = "Time until finish work";
    } else if (now < schedule.bedTimeDate) {
        milliSecondsLeft = schedule.bedTimeDate - now;
        timer.label.innerHTML = "Time until bedtime";
    } else {
        milliSecondsLeft = schedule.wakeTimeDate - now;
        timer.label.innerHTML = "Time until wake up";
    }
    const secondsLeft = Math.round(milliSecondsLeft / 1000);
    if (secondsLeft <= 0) {
        timer.display.innerHTML = "00:00:00";
    } else {
        timer.display.innerHTML = timer.calcTime(secondsLeft);
    }

    // timer (time left until bedTime)
    const timerInterval = setInterval(function () {
      timer.updateTimer();
    }, 1000);

    // timer (time left until bedTime)
    const secondHandInterval = setInterval(function () {
      clock.updateMinuteHand();
    }, 16);

    // hour hand – do this every 30000ms = 30s
    const hourHandInterval = setInterval(function () {
      clock.updateHourHand();
    }, 30000);

    // Add event listener for color-picker changes
    document
      .getElementById("color-picker")
      .addEventListener("input", function (e) {
        let hex = e.target.value;
        if (hex.charAt(0) === "#") {
          hex = hex.substring(1);
        }
        if (hex.length === 3) {
          hex = hex
            .split("")
            .map((x) => x + x)
            .join("");
        } 
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty("--color-r", r);
        document.documentElement.style.setProperty("--color-g", g);
        document.documentElement.style.setProperty("--color-b", b);
      });

  }; // ======== end of window.onload
})();
