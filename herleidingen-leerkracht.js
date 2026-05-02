const CATEGORY_CONFIG = {
  liter: {
    label: "Liter",
    typeLabel: "inhoud",
    leftExtensions: [
      { key: "dal", label: "decaliter", symbol: "dal", factor: 10000 },
      { key: "hl", label: "hectoliter", symbol: "hl", factor: 100000 },
      { key: "kl", label: "kiloliter", symbol: "kl", factor: 1000000 }
    ],
    rightExtensions: [],
    units: [
      { key: "l", symbol: "l", factor: 1000 },
      { key: "dl", symbol: "dl", factor: 100 },
      { key: "cl", symbol: "cl", factor: 10 },
      { key: "ml", symbol: "ml", factor: 1 }
    ],
    questionUnits: [
      { symbol: "kl", factor: 1000000 },
      { symbol: "hl", factor: 100000 },
      { symbol: "dal", factor: 10000 },
      { symbol: "l", factor: 1000 },
      { symbol: "dl", factor: 100 },
      { symbol: "cl", factor: 10 },
      { symbol: "ml", factor: 1 }
    ]
  },
  gewicht: {
    label: "Gewicht",
    typeLabel: "gewicht",
    leftExtensions: [],
    rightExtensions: [
      { key: "dg", label: "decigram", symbol: "dg", factor: 100 },
      { key: "cg", label: "centigram", symbol: "cg", factor: 10 },
      { key: "mg", label: "milligram", symbol: "mg", factor: 1 }
    ],
    units: [
      { key: "kg", symbol: "kg", factor: 1000000 },
      { key: "hg", symbol: "hg", factor: 100000 },
      { key: "dag", symbol: "dag", factor: 10000 },
      { key: "g", symbol: "g", factor: 1000 }
    ],
    questionUnits: [
      { symbol: "kg", factor: 1000000 },
      { symbol: "hg", factor: 100000 },
      { symbol: "dag", factor: 10000 },
      { symbol: "g", factor: 1000 },
      { symbol: "dg", factor: 100 },
      { symbol: "cg", factor: 10 },
      { symbol: "mg", factor: 1 }
    ]
  },
  lengte: {
    label: "Lengte",
    typeLabel: "lengte",
    leftExtensions: [
      { key: "dam", label: "decameter", symbol: "dam", factor: 10000 },
      { key: "hm", label: "hectometer", symbol: "hm", factor: 100000 },
      { key: "km", label: "kilometer", symbol: "km", factor: 1000000 }
    ],
    rightExtensions: [],
    units: [
      { key: "m", symbol: "m", factor: 1000 },
      { key: "dm", symbol: "dm", factor: 100 },
      { key: "cm", symbol: "cm", factor: 10 },
      { key: "mm", symbol: "mm", factor: 1 }
    ],
    questionUnits: [
      { symbol: "km", factor: 1000000 },
      { symbol: "hm", factor: 100000 },
      { symbol: "dam", factor: 10000 },
      { symbol: "m", factor: 1000 },
      { symbol: "dm", factor: 100 },
      { symbol: "cm", factor: 10 },
      { symbol: "mm", factor: 1 }
    ]
  }
};

const elements = {
  teacherSetupForm: document.getElementById("teacherSetupForm"),
  teacherCategory: document.getElementById("teacherCategory"),
  teacherLevel: document.getElementById("teacherLevel"),
  teacherType: document.getElementById("teacherType"),
  teacherCategoryBadge: document.getElementById("teacherCategoryBadge"),
  teacherLevelBadge: document.getElementById("teacherLevelBadge"),
  teacherTypeBadge: document.getElementById("teacherTypeBadge"),
  teacherQuestionText: document.getElementById("teacherQuestionText"),
  teacherQuestionHint: document.getElementById("teacherQuestionHint"),
  teacherShowSolutionBtn: document.getElementById("teacherShowSolutionBtn"),
  teacherNewQuestionBtn: document.getElementById("teacherNewQuestionBtn"),
  teacherSolutionPanel: document.getElementById("teacherSolutionPanel"),
  teacherSolutionText: document.getElementById("teacherSolutionText"),
  teacherExplanationText: document.getElementById("teacherExplanationText"),
  teacherTableHeadRow: document.getElementById("teacherTableHeadRow"),
  teacherTableBody: document.getElementById("teacherTableBody")
};

const teacherState = {
  question: null
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function formatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  const rounded = Number(value.toFixed(3));
  return String(rounded).replace(".", ",");
}

function convertValue(value, fromUnit, toUnit) {
  return (value * fromUnit.factor) / toUnit.factor;
}

function createSourcePart(amount, unit) {
  return {
    amount,
    unit: unit.symbol,
    factor: unit.factor
  };
}

function findUnit(config, symbol) {
  return config.units.find((unit) => unit.symbol === symbol);
}

function chooseUnits(config, minGap) {
  let fromUnit = randomFrom(config.questionUnits);
  let toUnit = randomFrom(config.questionUnits);

  while (
    fromUnit.symbol === toUnit.symbol ||
    Math.abs(config.questionUnits.indexOf(fromUnit) - config.questionUnits.indexOf(toUnit)) < minGap
  ) {
    fromUnit = randomFrom(config.questionUnits);
    toUnit = randomFrom(config.questionUnits);
  }

  return { fromUnit, toUnit };
}

function chooseLevelOneUnits(config) {
  const fromIndex = randomInt(0, config.questionUnits.length - 2);
  const toIndex = randomInt(fromIndex + 1, config.questionUnits.length - 1);

  return {
    fromUnit: config.questionUnits[fromIndex],
    toUnit: config.questionUnits[toIndex]
  };
}

function buildSimpleQuestion(config, level) {
  const { fromUnit, toUnit } = level === 1
    ? chooseLevelOneUnits(config)
    : chooseUnits(config, 2);
  const amount = level === 1 ? randomInt(1, 10) : randomInt(10, 500);
  const answer = convertValue(amount, fromUnit, toUnit);

  return {
    prompt: `Hoeveel ${toUnit.symbol} is ${formatNumber(amount)} ${fromUnit.symbol}?`,
    hint: `Denk aan de volgorde van de ${config.typeLabel}-eenheden.`,
    explanation: `${formatNumber(amount)} ${fromUnit.symbol} = ${formatNumber(answer)} ${toUnit.symbol}.`,
    answer,
    type: "simple",
    sourceParts: [createSourcePart(amount, fromUnit)],
    targetUnit: { symbol: toUnit.symbol, factor: toUnit.factor }
  };
}

function buildDecimalQuestion(config) {
  const { fromUnit, toUnit } = chooseUnits(config, 1);
  const whole = randomInt(1, 20);
  const decimalPart = randomFrom([0.1, 0.2, 0.25, 0.5, 0.75]);
  const amount = whole + decimalPart;
  const answer = convertValue(amount, fromUnit, toUnit);

  return {
    prompt: `Hoeveel ${toUnit.symbol} is ${formatNumber(amount)} ${fromUnit.symbol}?`,
    hint: "Een antwoord met komma of punt is allebei goed.",
    explanation: `${formatNumber(amount)} ${fromUnit.symbol} = ${formatNumber(answer)} ${toUnit.symbol}.`,
    answer,
    type: "decimal",
    sourceParts: [createSourcePart(amount, fromUnit)],
    targetUnit: { symbol: toUnit.symbol, factor: toUnit.factor }
  };
}

function buildMixedUnitQuestion(config) {
  const mainUnit = config.units[0];
  const secondUnit = randomFrom(config.units.slice(1));
  const targetUnit = randomFrom(config.units.slice(1));
  const mainAmount = randomInt(1, 9);
  const secondAmount = randomInt(1, 9) * randomInt(1, 9);
  const answer = (
    mainAmount * mainUnit.factor + secondAmount * secondUnit.factor
  ) / targetUnit.factor;

  return {
    prompt: `Hoeveel ${targetUnit.symbol} is ${mainAmount} ${mainUnit.symbol} en ${secondAmount} ${secondUnit.symbol} samen?`,
    hint: "De leerlingen lossen de oefening op papier op.",
    explanation:
      `${mainAmount} ${mainUnit.symbol} = ${formatNumber((mainAmount * mainUnit.factor) / targetUnit.factor)} ${targetUnit.symbol} en ` +
      `${secondAmount} ${secondUnit.symbol} = ${formatNumber((secondAmount * secondUnit.factor) / targetUnit.factor)} ${targetUnit.symbol}. ` +
      `Samen is dat ${formatNumber(answer)} ${targetUnit.symbol}.`,
    answer,
    type: "mixed",
    sourceParts: [
      createSourcePart(mainAmount, mainUnit),
      createSourcePart(secondAmount, secondUnit)
    ],
    targetUnit: { symbol: targetUnit.symbol, factor: targetUnit.factor }
  };
}

function createQuestion(categoryKey, level, preferredType) {
  const config = CATEGORY_CONFIG[categoryKey];
  const requestedType = preferredType || "auto";

  if (requestedType === "simple") {
    return buildSimpleQuestion(config, level);
  }
  if (requestedType === "decimal") {
    return buildDecimalQuestion(config);
  }
  if (requestedType === "mixed") {
    return buildMixedUnitQuestion(config);
  }
  if (level === 1) {
    return buildSimpleQuestion(config, level);
  }
  if (level === 2) {
    return buildSimpleQuestion(config, level);
  }

  return Math.random() < 0.5
    ? buildDecimalQuestion(config)
    : buildMixedUnitQuestion(config);
}

function formatTeacherType(type) {
  if (type === "simple") {
    return "Eenvoudige omzetting";
  }
  if (type === "decimal") {
    return "Kommagetal";
  }
  if (type === "mixed") {
    return "Gemengde eenheden";
  }
  return "Automatisch";
}

function getDecimalLength(amount) {
  const parts = formatNumber(amount).split(",");
  return parts[1] ? parts[1].length : 0;
}

function getWholeLength(amount) {
  const parts = formatNumber(amount).split(",");
  return parts[0].replace("-", "").length;
}

function buildRelevantColumns(config, question) {
  const involvedFactors = question.sourceParts
    .map((part) => part.factor)
    .concat(question.targetUnit.factor);
  const maxFactor = Math.max(...involvedFactors);
  const minFactor = Math.min(...involvedFactors);

  const leftColumns = config.leftExtensions
    .filter((column) => column.factor <= maxFactor)
    .map((column) => ({
      key: column.key,
      label: column.label,
      symbol: column.symbol,
      factor: column.factor
    }))
    .reverse();

  const baseColumns = config.units.map((unit) => ({
    key: unit.key,
    label: unit.symbol,
    symbol: unit.symbol,
    factor: unit.factor
  }));

  const rightColumns = config.rightExtensions
    .filter((column) => column.factor >= minFactor)
    .map((column) => ({
      key: column.key,
      label: column.label,
      symbol: column.symbol,
      factor: column.factor
    }));

  return [...leftColumns, ...baseColumns, ...rightColumns];
}

function buildSourceRowCells(part, columns, targetSymbol) {
  const cells = columns.map((column) => ({
    key: column.key,
    text: "",
    className: column.symbol === targetSymbol ? "teacher-target-column" : ""
  }));
  const amountText = formatNumber(part.amount);
  const textParts = amountText.split(",");
  const wholeText = textParts[0].replace("-", "");
  const decimalText = textParts[1] || "";
  const sourceIndex = columns.findIndex((column) => column.label === part.unit || column.symbol === part.unit);
  const occupiedIndexes = [];

  for (let offset = 0; offset < wholeText.length; offset += 1) {
    const columnIndex = sourceIndex - offset;
    const digit = wholeText[wholeText.length - 1 - offset];
    if (cells[columnIndex]) {
      cells[columnIndex].text = digit;
      cells[columnIndex].className += " teacher-cell-source";
      occupiedIndexes.push(columnIndex);
    }
  }

  for (let offset = 0; offset < decimalText.length; offset += 1) {
    const columnIndex = sourceIndex + 1 + offset;
    const digit = decimalText[offset];
    if (cells[columnIndex]) {
      cells[columnIndex].text = digit;
      cells[columnIndex].className += " teacher-cell-source";
      occupiedIndexes.push(columnIndex);
    }
  }

  const targetIndex = columns.findIndex((column) => column.symbol === targetSymbol);
  if (occupiedIndexes.length === 0 || targetIndex === -1) {
    return cells;
  }

  const minIndex = Math.min(...occupiedIndexes);
  const maxIndex = Math.max(...occupiedIndexes);

  if (targetIndex > maxIndex) {
    for (let index = maxIndex + 1; index <= targetIndex; index += 1) {
      if (cells[index] && !cells[index].text) {
        cells[index].text = "0";
        cells[index].className += " teacher-cell-fill";
      }
    }
  }

  if (targetIndex < minIndex) {
    for (let index = targetIndex; index < minIndex; index += 1) {
      if (cells[index] && !cells[index].text) {
        cells[index].text = "0";
        cells[index].className += " teacher-cell-fill";
      }
    }
  }

  return cells;
}

function buildResultRowCells(question, columns) {
  const cells = columns.map((column) => ({
    key: column.key,
    text: "",
    className: column.symbol === question.targetUnit.symbol ? "teacher-target-column teacher-cell-result" : "teacher-cell-result"
  }));
  const answerText = formatNumber(question.answer);
  const parts = answerText.split(",");
  const wholeText = parts[0].replace("-", "");
  const decimalText = parts[1] || "";
  const targetIndex = columns.findIndex((column) => column.symbol === question.targetUnit.symbol);

  for (let offset = 0; offset < wholeText.length; offset += 1) {
    const columnIndex = targetIndex - offset;
    const digit = wholeText[wholeText.length - 1 - offset];
    if (cells[columnIndex]) {
      cells[columnIndex].text = digit;
    }
  }

  for (let offset = 0; offset < decimalText.length; offset += 1) {
    const columnIndex = targetIndex + 1 + offset;
    if (cells[columnIndex]) {
      cells[columnIndex].text = decimalText[offset];
    }
  }

  return cells;
}

function renderTeacherTable(question, categoryKey) {
  const config = CATEGORY_CONFIG[categoryKey];
  const columns = buildRelevantColumns(config, question);
  const targetSymbol = question.targetUnit.symbol;

  elements.teacherTableHeadRow.innerHTML = "<th>Rij</th>" + columns
    .map((column) => {
      const targetClass = column.symbol === targetSymbol ? "teacher-target-column" : "";
      return `<th scope="col" class="${targetClass}">${column.label}</th>`;
    })
    .join("");

  const sourceRows = question.sourceParts.map((part, index) => {
    const cells = buildSourceRowCells(part, columns, targetSymbol);
    const label = question.sourceParts.length > 1 ? `Deel ${index + 1}` : "Opgave";
    return `<tr>
      <th scope="row">${label}</th>
      ${cells.map((cell) => `<td class="${cell.className.trim()}">${cell.text}</td>`).join("")}
    </tr>`;
  });

  const resultCells = buildResultRowCells(question, columns);
  const resultRow = `<tr class="teacher-solution-result-row">
    <th scope="row">Uitkomst</th>
    ${resultCells.map((cell) => `<td class="${cell.className.trim()}">${cell.text}</td>`).join("")}
  </tr>`;

  elements.teacherTableBody.innerHTML = [...sourceRows, resultRow].join("");
}

function renderTeacherQuestion(question, categoryKey, level) {
  const category = CATEGORY_CONFIG[categoryKey];
  teacherState.question = question;
  elements.teacherCategoryBadge.textContent = category.label;
  elements.teacherLevelBadge.textContent = `Niveau ${level}`;
  elements.teacherTypeBadge.textContent = formatTeacherType(question.type);
  elements.teacherQuestionText.textContent = question.prompt;
  elements.teacherQuestionHint.textContent = "De leerlingen lossen deze oefening op papier op.";
  elements.teacherSolutionPanel.classList.add("is-hidden");
  elements.teacherSolutionText.textContent = "";
  elements.teacherExplanationText.textContent = "";
  elements.teacherTableHeadRow.innerHTML = "";
  elements.teacherTableBody.innerHTML = "";
  elements.teacherShowSolutionBtn.disabled = false;
  elements.teacherNewQuestionBtn.disabled = false;
}

function generateTeacherQuestion() {
  const categoryKey = elements.teacherCategory.value;
  const level = Number(elements.teacherLevel.value);
  const selectedType = elements.teacherType.value;
  const question = createQuestion(categoryKey, level, selectedType);
  renderTeacherQuestion(question, categoryKey, level);
}

function showTeacherSolution() {
  if (!teacherState.question) {
    return;
  }

  const categoryKey = elements.teacherCategory.value;
  elements.teacherSolutionText.textContent =
    `Juiste antwoord: ${formatNumber(teacherState.question.answer)} ${teacherState.question.targetUnit.symbol}`;
  elements.teacherExplanationText.textContent = teacherState.question.explanation;
  renderTeacherTable(teacherState.question, categoryKey);
  elements.teacherSolutionPanel.classList.remove("is-hidden");
}

elements.teacherSetupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generateTeacherQuestion();
});

elements.teacherShowSolutionBtn.addEventListener("click", () => {
  showTeacherSolution();
});

elements.teacherNewQuestionBtn.addEventListener("click", () => {
  generateTeacherQuestion();
});
