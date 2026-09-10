import jspreadsheet, {
  type CellValue,
  type SpreadsheetOptions,
} from "kspreadsheet";
// Shared spreadsheet and enhancement styles are loaded by style.scss.
import "./spreadsheet-demo.scss";

// Fictional demo data. Column order is the same in data, columns, and getData().
const initialData: CellValue[][] = [
  [
    "SQ010_SH010",
    "Lighting",
    "Alex",
    "In progress",
    "2026-09-15",
    false,
    "Balance the window light",
  ],
  [
    "SQ010_SH020",
    "Compositing",
    "Sam",
    "Ready for review",
    "2026-09-16",
    true,
    "Version 12 is ready",
  ],
  [
    "SQ020_SH010",
    "Animation",
    "Morgan",
    "Approved",
    "2026-09-17",
    true,
    "Approved timing",
  ],
  [
    "SQ020_SH020",
    "Lighting",
    "Taylor",
    "Not started",
    "2026-09-18",
    false,
    "Awaiting animation",
  ],
];
const copyRows = () => initialData.map((row) => [...row]);
const host = document.querySelector<HTMLDivElement>("#submission-spreadsheet")!;
const status = document.querySelector<HTMLElement>("#spreadsheet-status")!;
const output = document.querySelector<HTMLElement>("#spreadsheet-data")!;

const options: SpreadsheetOptions = {
  tabs: true,
  toolbar: false,
  worksheets: [
    {
      worksheetName: "Submission review",
      data: copyRows(),
      columns: [
        { type: "text", title: "Shot", width: 150 },
        {
          type: "dropdown",
          title: "Department",
          width: 140,
          source: ["Animation", "Lighting", "Compositing"],
        },
        { type: "text", title: "Artist", width: 130 },
        {
          type: "dropdown",
          title: "Status",
          width: 170,
          source: [
            "Not started",
            "In progress",
            "Ready for review",
            "Approved",
          ],
        },
        {
          type: "calendar",
          title: "Due date",
          width: 130,
          options: { format: "YYYY-MM-DD" },
        },
        { type: "checkbox", title: "Ready", width: 80 },
        { type: "text", title: "Review notes", width: 260, wordWrap: true },
      ],
      freezeColumns: 2,
      tableOverflow: true,
      tableWidth: "100%",
      tableHeight: "360px",
      minDimensions: [7, 8],
      allowComments: true,
    },
  ],
  onchange: (_worksheet, _cell, x, y) => {
    status.textContent = `Updated column ${Number(x) + 1}, row ${Number(y) + 1}. Changes stay in this demo.`;
  },
};

// Keep the first worksheet returned by the constructor.
const worksheet = jspreadsheet(host, options)[0];
document.querySelector("#spreadsheet-get")!.addEventListener("click", () => {
  output.textContent = JSON.stringify(worksheet.getData(), null, 2);
  output.hidden = false;
  status.textContent = "Current worksheet data shown below.";
});
document.querySelector("#spreadsheet-reset")!.addEventListener("click", () => {
  worksheet.setData(copyRows());
  output.hidden = true;
  status.textContent = "Sample data restored.";
});
document.querySelector("#spreadsheet-update")!.addEventListener("click", () => {
  worksheet.setValue("D1", "Ready for review");
});

// A separate worksheet demonstrates the opt-in Material palette.
const materialHost = document.querySelector<HTMLDivElement>('#material-spreadsheet')!;
const materialWorksheet = jspreadsheet(materialHost, {
  ...options,
  worksheets: options.worksheets!.map(sheet => ({ ...sheet, data: copyRows() })),
  onchange: () => {
    document.querySelector('#material-spreadsheet-status')!.textContent = 'Material example updated. Changes stay in this demo.';
  },
})[0];

// Release worksheet listeners when Vite replaces this module during development.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    jspreadsheet.destroy(worksheet.parent.el);
    jspreadsheet.destroy(materialWorksheet.parent.el);
  });
