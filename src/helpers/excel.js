const excelJS = require("exceljs");
const moment = require("moment-timezone");
const { phoneFomatter } = require("./utils");
const makeExcel = async ({ columns, data, title }) => {
  //key, type, render, defaultValue
  if (!data || data.length < 1) {
    throw "엑셀변경가능한 데이터가 없습니다.";
  }
  const workbook = new excelJS.Workbook();
  const sheet = workbook.addWorksheet(title);
  sheet.columns = columns
    .filter((x) => x.key)
    .map((x) => ({
      header: x.label,
      key: x.key,
      width: x.width || 20,
      style: {
        alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      },
    }));
  data.map((x) => {
    columns.map(({ key, type, render, defaultValue }) => {
      let result;
      if (render) {
        result = render(x);
      } else {
        if (x[key] !== undefined && type) {
          switch (type) {
            case "date":
              result = x[key]
                ? moment(x[key]).tz("Asia/Seoul").utc().format("YYYY-MM-DD")
                : "";
              break;
            case "date-time":
              result = x[key]
                ? moment(x[key])
                    .tz("Asia/Seoul")
                    .utc()
                    .format("YYYY-MM-DD HH:mm")
                : "";
              break;
            case "boolean":
              result = x[key] ? "Y" : "N";
              break;
            case "phone":
              result = phoneFomatter(x[key]);
              break;
            case "gender":
              result =
                x[key] === "male"
                  ? "남자"
                  : x[key] === "female"
                  ? "여자"
                  : "무";
              break;
          }
        } else {
          result = x[key] || defaultValue || "";
        }
      }
      x[key] = result;
    });
  });
  data.forEach((x) => {
    sheet.addRow({
      ...x,
    });
  });
  return await workbook.xlsx.writeBuffer();
};

module.exports = { makeExcel };
