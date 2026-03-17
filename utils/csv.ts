type CsvParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsvText(value: string): CsvParseResult {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let isQuoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const nextCharacter = value[index + 1];

    if (character === '"') {
      if (isQuoted && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (character === "," && !isQuoted) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !isQuoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  const [headerRow = [], ...bodyRows] = rows;
  const headers = headerRow.map((header) => header.trim());

  return {
    headers,
    rows: bodyRows.map((row) =>
      headers.reduce<Record<string, string>>((record, header, index) => {
        record[header] = row[index]?.trim() ?? "";
        return record;
      }, {})
    )
  };
}
