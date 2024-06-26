exports.generateId = function () {
    var today = new Date();
    year = `${today.getFullYear()}`;
    month = `${today.getMonth()}`;
    if (month < 10) month = `0${month}`;
    day = `${today.getDate()}`;
    if (day < 10) day = `0${day}`;
    minutes = `${today.getMinutes()}`;
    if (minutes < 10) minutes = `0${minutes}`;
    seconds = `${today.getSeconds()}`;
    if (seconds < 10) seconds = `0${seconds}`;
    var time = `${year.slice(-2)}${month}${day}${minutes}${seconds}`;
    return time;
};
