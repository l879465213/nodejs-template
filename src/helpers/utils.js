const isExistArray = (arr) => {
  if (!arr) {
    return false;
  } else if (!Array.isArray(arr)) {
    return false;
  } else if (arr.length < 1) {
    return false;
  }
  return true;
};

const setString = (str) => {
  if (str && typeof str === "string" && str !== "undefined") {
    return str;
  } else {
    return "";
  }
};

const checkNumber = (n) => {
  if ((!n || isNaN(n)) && n !== 0) {
    return false;
  } else {
    return true;
  }
};

const checkDate = (date) => {
  if (date.split("").filter((x) => x === "-").length !== 2) {
    return false;
  } else if (date.length !== 10) {
    return false;
  } else {
    return true;
  }
};

const checkEnum = (input, data, nullable) => {
  if (!input && nullable) {
    return true;
  }
  if (!data && !input) {
    return false;
  }
  if (!data.includes(input)) {
    return false;
  } else {
    return true;
  }
};

const checkTime = (time) => {
  if (time.split("").filter((x) => x === ":").length !== 1) {
    return false;
  } else if (time.length !== 5) {
    return false;
  } else {
    return true;
  }
};
const generateRandomNumber = (length) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
};

const makeThousands = (str) => {
  str = parseInt(str);
  if (isNaN(str)) {
    return "";
  } else {
    if (str > 10000) {
      return str;
    } else if (str > 1000) {
      return "0" + str;
    } else if (str > 100) {
      return "00" + str;
    } else if (str > 10) {
      return "000" + str;
    } else {
      return "000" + str;
    }
  }
};

const phoneFomatter = (num, type) => {
  if (!num) {
    return "";
  }
  num = String(num);
  var formatNum = "";

  if (num.length == 11) {
    if (type == 0) {
      formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");
    } else {
      formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
  } else if (num.length == 8) {
    formatNum = num.replace(/(\d{4})(\d{4})/, "$1-$2");
  } else {
    if (num.indexOf("02") == 0) {
      if (type == 0) {
        formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, "$1-****-$3");
      } else {
        formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
      }
    } else {
      if (type == 0) {
        formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, "$1-***-$3");
      } else {
        formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      }
    }
  }

  return formatNum;
};

module.exports = {
  generateRandomNumber,
  isExistArray,
  phoneFomatter,
  makeThousands,
  checkEnum,
  checkDate,
  checkNumber,
  checkTime,
  setString,
};
