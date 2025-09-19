import * as XLSX from "xlsx";
import fs from "fs";

// читаем книгу Excel
const workbook = XLSX.readFile("12.xlsx");

// выбираем первую страницу (или по имени)
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// превращаем в массив объектов
const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1, // массив массивов
  defval: "" // пустые ячейки = ""
});

// убираем заголовки и собираем объекты
const data = rows.slice(1).map(row => ({
  id: row[0],
  okrug: row[1],
  city: row[2],
  hospital: row[3],
  patients: Number(row[4]) || 0
}));

// сохраняем в JSON
fs.writeFileSync("patients.json", JSON.stringify(data, null, 2), "utf-8");

console.log("✅ patients.json готов");
