const TOTAL_QUESTIONS = 10;

const CATEGORY_CONFIG = {
  liter: {
    label: "Liter",
    typeLabel: "inhoud",
    leftExtensions: ["decaliter", "hectoliter", "kiloliter"],
    rightExtensions: ["centimicroliter", "decimicroliter", "microliter"],
    units: [
      { symbol: "l", factor: 1000 },
      { symbol: "dl", factor: 100 },
      { symbol: "cl", factor: 10 },
      { symbol: "ml", factor: 1 }
    ]
  },
  gewicht: {
    label: "Gewicht",
    typeLabel: "gewicht",
    leftExtensions: ["decakilogram", "hectokilogram", "ton"],
    rightExtensions: ["centimilligram", "decimilligram", "microgram"],
    units: [
      { symbol: "kg", factor: 1000000 },
      { symbol: "g", factor: 1000 },
      { symbol: "mg", factor: 1 }
    ]
  },
  lengte: {
    label: "Lengte",
    typeLabel: "lengte",
    leftExtensions: ["decakilometer", "hectokilometer", "megameter"],
    rightExtensions: ["centimillimeter", "decimillimeter", "micrometer"],
    units: [
      { symbol: "km", factor: 1000000 },
      { symbol: "m", factor: 1000 },
      { symbol: "dm", factor: 100 },
      { symbol: "cm", factor: 10 },
      { symbol: "mm", factor: 1 }
    ]
  }
};

const POSITIVE_FEEDBACK = [
  "Goed gedaan!",
  "Knap gewerkt!",
  "Heel goed!",
  "Super bezig!"
];

const ENCOURAGING_FEEDBACK = [
  "Bijna, probeer nog eens met de oplossing erbij.",
  "Niet erg, kijk even naar de uitleg.",
  "Dat lukt straks beter met deze stapjes."
];

const RESULT_MESSAGES = [
  { minScore: 10, message: "Perfect gewerkt. Jij bent een echte herleidkampioen." },
  { minScore: 8, message: "Heel sterk. Je kent de omzettingen al goed." },
  { minScore: 5, message: "Goed geoefend. Nog een reeks en je wordt nog sterker." },
  { minScore: 0, message: "Blijf oefenen. Elke vraag helpt je vooruit." }
];

const state = {
  categoryKey: "liter",
  level: 1,
  currentQuestion: null,
  currentIndex: 0,
  score: 0,
  answered: false,
  tableLeftCount: 0,
  tableRightCount: 0,
  finished: false,
  summary: []
};

const elements = {
  startScreen: document.getElementById("startScreen"),
  quizScreen: document.getElementById("quizScreen"),
  endScreen: document.getElementById("endScreen"),
  setupForm: document.getElementById("setupForm"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  questionText: document.getElementById("questionText"),
  questionHint: document.getElementById("questionHint"),
  feedbackBox: document.getElementById("feedbackBox"),
  nextQuestionBtn: document.getElementById("nextQuestionBtn"),
  scoreText: document.getElementById("scoreText"),
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  categoryBadge: document.getElementById("categoryBadge"),
  levelBadge: document.getElementById("levelBadge"),
  resultText: document.getElementById("resultText"),
  resultMessage: document.getElementById("resultMessage"),
  restartBtn: document.getElementById("restartBtn"),
  summaryList: document.getElementById("summaryList"),
  tableToggleBtn: document.getElementById("tableToggleBtn"),
  tablePanel: document.getElementById("tablePanel"),
  tableHeadRow: document.getElementById("tableHeadRow"),
  tableBody: document.getElementById("tableBody"),
  tableClearBtn: document.getElementById("tableClearBtn"),
  addLeftColumnBtn: document.getElementById("addLeftColumnBtn"),
  addRightColumnBtn: document.getElementById("addRightColumnBtn")
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

function parseAnswer(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized || !/^[-+]?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  return Number(normalized);
}

function isCorrectAnswer(answer, expected) {
  return Math.abs(answer - expected) < 0.0001;
}

function getUnitIndex(config, symbol) {
  return config.units.findIndex((unit) => unit.symbol === symbol);
}

function chooseUnits(config, minGap, allowSameUnit) {
  let fromUnit = randomFrom(config.units);
  let toUnit = randomFrom(config.units);

  while (
    fromUnit.symbol === toUnit.symbol ||
    Math.abs(getUnitIndex(config, fromUnit.symbol) - getUnitIndex(config, toUnit.symbol)) < minGap
  ) {
    fromUnit = randomFrom(config.units);
    toUnit = randomFrom(config.units);
  }

  if (allowSameUnit) {
    return { fromUnit, toUnit };
  }

  return { fromUnit, toUnit };
}

function chooseLevelOneUnits(config) {
  const sortedUnits = config.units.slice().sort((a, b) => b.factor - a.factor);
  const fromIndex = randomInt(0, sortedUnits.length - 2);
  const toIndex = randomInt(fromIndex + 1, sortedUnits.length - 1);

  return {
    fromUnit: sortedUnits[fromIndex],
    toUnit: sortedUnits[toIndex]
  };
}

function convertValue(value, fromUnit, toUnit) {
  return (value * fromUnit.factor) / toUnit.factor;
}

function buildSimpleQuestion(config, level) {
  const gap = level === 1 ? 1 : 2;
  const { fromUnit, toUnit } = level === 1
    ? chooseLevelOneUnits(config)
    : chooseUnits(config, gap, false);
  const amount = level === 1 ? randomInt(1, 10) : randomInt(10, 500);
  const answer = convertValue(amount, fromUnit, toUnit);
  const factorText = formatNumber(fromUnit.factor / toUnit.factor);

  return {
    prompt: `Hoeveel ${toUnit.symbol} is ${formatNumber(amount)} ${fromUnit.symbol}?`,
    hint: `Denk aan de volgorde van de ${config.typeLabel}-eenheden.`,
    answer,
    explanation: `${formatNumber(amount)} ${fromUnit.symbol} × ${factorText} = ${formatNumber(answer)} ${toUnit.symbol}.`,
    tableRowCount: 1
  };
}

function buildDecimalQuestion(config) {
  const { fromUnit, toUnit } = chooseUnits(config, 1, false);
  const whole = randomInt(1, 20);
  const decimalPart = randomFrom([0.1, 0.2, 0.25, 0.5, 0.75]);
  const amount = whole + decimalPart;
  const answer = convertValue(amount, fromUnit, toUnit);
  const factorText = formatNumber(fromUnit.factor / toUnit.factor);

  return {
    prompt: `Hoeveel ${toUnit.symbol} is ${formatNumber(amount)} ${fromUnit.symbol}?`,
    hint: "Een antwoord met komma of punt is allebei goed.",
    answer,
    explanation: `${formatNumber(amount)} ${fromUnit.symbol} × ${factorText} = ${formatNumber(answer)} ${toUnit.symbol}.`,
    tableRowCount: 1
  };
}

function buildMixedUnitQuestion(config) {
  const baseUnit = config.units[0];
  const secondaryPool = config.units.slice(1);
  const secondaryUnit = randomFrom(secondaryPool);
  const targetUnit = randomFrom(config.units.slice(1));
  const mainAmount = randomInt(1, 9);
  const secondaryAmount = randomInt(1, 9) * randomInt(1, 9);
  const totalBaseValue =
    mainAmount * baseUnit.factor + secondaryAmount * secondaryUnit.factor;
  const answer = totalBaseValue / targetUnit.factor;

  return {
    prompt: `Hoeveel ${targetUnit.symbol} is ${mainAmount} ${baseUnit.symbol} en ${secondaryAmount} ${secondaryUnit.symbol} samen?`,
    hint: "Zet eerst beide delen om naar dezelfde eenheid en tel daarna samen.",
    answer,
    explanation:
      `${mainAmount} ${baseUnit.symbol} = ${formatNumber((mainAmount * baseUnit.factor) / targetUnit.factor)} ${targetUnit.symbol} ` +
      `en ${secondaryAmount} ${secondaryUnit.symbol} = ${formatNumber((secondaryAmount * secondaryUnit.factor) / targetUnit.factor)} ${targetUnit.symbol}. ` +
      `Samen is dat ${formatNumber(answer)} ${targetUnit.symbol}.`,
    tableRowCount: 2
  };
}

function createQuestion(categoryKey, level) {
  const config = CATEGORY_CONFIG[categoryKey];
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

function getResultMessage(score) {
  return RESULT_MESSAGES.find((item) => score >= item.minScore).message;
}

function updateStatus() {
  const category = CATEGORY_CONFIG[state.categoryKey];
  elements.categoryBadge.textContent = category.label;
  elements.levelBadge.textContent = `Niveau ${state.level}`;
  elements.scoreText.textContent = `${state.score} van de ${TOTAL_QUESTIONS} juist`;
  elements.progressText.textContent = `Vraag ${state.currentIndex} van ${TOTAL_QUESTIONS}`;
  elements.progressFill.style.width = `${(state.currentIndex / TOTAL_QUESTIONS) * 100}%`;
}

function buildTableColumns(config) {
  const leftColumns = config.leftExtensions.slice(0, state.tableLeftCount).reverse();
  const rightColumns = config.rightExtensions.slice(0, state.tableRightCount);
  return [...leftColumns, ...config.units.map((unit) => unit.symbol), ...rightColumns];
}

function updateTableButtons(config) {
  elements.addLeftColumnBtn.disabled = state.tableLeftCount >= config.leftExtensions.length;
  elements.addRightColumnBtn.disabled = state.tableRightCount >= config.rightExtensions.length;
}

function bindTableInputs() {
  elements.tableBody.querySelectorAll(".conversion-table-input").forEach((input) => {
    input.setAttribute("maxlength", "1");
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);
    });
  });
}

function renderConversionTable() {
  const category = CATEGORY_CONFIG[state.categoryKey];
  const columns = buildTableColumns(category);
  const rowCount = state.currentQuestion && state.currentQuestion.tableRowCount === 2 ? 2 : 1;
  const previousLabels = Array.from(elements.tableHeadRow.querySelectorAll("th")).map((cell) => cell.textContent);
  const previousRows = Array.from(elements.tableBody.querySelectorAll("tr"));
  const previousValues = {};

  previousRows.forEach((row, rowIndex) => {
    const rowInputs = Array.from(row.querySelectorAll("input"));
    previousLabels.forEach((label, columnIndex) => {
      previousValues[`${rowIndex}-${label}`] = rowInputs[columnIndex] ? rowInputs[columnIndex].value : "";
    });
  });

  elements.tableHeadRow.innerHTML = columns
    .map((label) => `<th scope="col">${label}</th>`)
    .join("");

  elements.tableBody.innerHTML = Array.from({ length: rowCount }, (_, rowIndex) => {
    return `<tr>${
      columns.map((label) => {
        return `<td><input class="form-control conversion-table-input" type="text" inputmode="decimal" aria-label="Vakje rij ${rowIndex + 1} voor ${label}"></td>`;
      }).join("")
    }</tr>`;
  })
    .join("");

  elements.tableBody.querySelectorAll("tr").forEach((row, rowIndex) => {
    row.querySelectorAll("input").forEach((input, columnIndex) => {
      const label = columns[columnIndex];
      input.value = previousValues[`${rowIndex}-${label}`] || "";
    });
  });

  bindTableInputs();
  updateTableButtons(category);
}

function clearConversionTable() {
  elements.tableBody.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });
}

function showScreen(screenName) {
  elements.startScreen.classList.toggle("is-hidden", screenName !== "start");
  elements.quizScreen.classList.toggle("is-hidden", screenName !== "quiz");
  elements.endScreen.classList.toggle("is-hidden", screenName !== "end");
}

function renderQuestion() {
  state.currentQuestion = createQuestion(state.categoryKey, state.level);
  state.answered = false;
  state.tableLeftCount = 0;
  state.tableRightCount = 0;
  renderConversionTable();
  elements.questionText.textContent = state.currentQuestion.prompt;
  elements.questionHint.textContent = state.currentQuestion.hint;
  elements.answerInput.value = "";
  elements.answerInput.disabled = false;
  elements.feedbackBox.innerHTML = "";
  elements.nextQuestionBtn.classList.add("is-hidden");
  clearConversionTable();
  updateStatus();
  elements.answerInput.focus();
}

function renderFeedback(isCorrect) {
  const feedbackClass = isCorrect ? "is-correct" : "is-wrong";
  const intro = isCorrect ? randomFrom(POSITIVE_FEEDBACK) : randomFrom(ENCOURAGING_FEEDBACK);
  const body = isCorrect
    ? `${intro} ${formatNumber(state.currentQuestion.answer)} is juist.`
    : `${intro} Het juiste antwoord is ${formatNumber(state.currentQuestion.answer)}. ${state.currentQuestion.explanation}`;

  elements.feedbackBox.innerHTML = `<div class="conversion-feedback-box ${feedbackClass}">${body}</div>`;
}

function renderSummary() {
  elements.resultText.textContent = `Je had ${state.score} van de ${TOTAL_QUESTIONS} juist.`;
  elements.resultMessage.textContent = getResultMessage(state.score);
  elements.summaryList.innerHTML = state.summary
    .map((item) => {
      const statusClass = item.isCorrect ? "is-correct" : "is-wrong";
      const statusText = item.isCorrect ? "Juist" : "Fout";
      return `<div class="conversion-summary-item ${statusClass}">
        <strong>${statusText}</strong>
        <span>${item.prompt}</span>
        <span>Jouw antwoord: ${item.userAnswer}</span>
        <span>Juiste antwoord: ${formatNumber(item.correctAnswer)}</span>
      </div>`;
    })
    .join("");
}

function finishQuiz() {
  state.finished = true;
  renderSummary();
  showScreen("end");
}

function startQuiz(categoryKey, level) {
  state.categoryKey = categoryKey;
  state.level = level;
  state.currentIndex = 1;
  state.score = 0;
  state.answered = false;
  state.finished = false;
  state.summary = [];
  showScreen("quiz");
  renderQuestion();
}

elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.setupForm);
  const categoryKey = formData.get("category");
  const level = Number(formData.get("level"));
  startQuiz(String(categoryKey), level);
});

elements.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.currentQuestion || state.finished || state.answered) {
    return;
  }

  const parsedAnswer = parseAnswer(elements.answerInput.value);
  if (parsedAnswer === null) {
    elements.feedbackBox.innerHTML = '<div class="conversion-feedback-box is-wrong">Typ een getal. Een komma of punt mag allebei.</div>';
    return;
  }

  const isCorrect = isCorrectAnswer(parsedAnswer, state.currentQuestion.answer);
  if (isCorrect) {
    state.score += 1;
  }

  state.summary.push({
    prompt: state.currentQuestion.prompt,
    correctAnswer: state.currentQuestion.answer,
    userAnswer: elements.answerInput.value.trim(),
    isCorrect
  });

  state.answered = true;
  elements.answerInput.disabled = true;
  renderFeedback(isCorrect);
  updateStatus();

  if (state.currentIndex >= TOTAL_QUESTIONS) {
    elements.nextQuestionBtn.textContent = "Bekijk resultaat";
  } else {
    elements.nextQuestionBtn.textContent = "Volgende vraag";
  }
  elements.nextQuestionBtn.classList.remove("is-hidden");
});

elements.nextQuestionBtn.addEventListener("click", () => {
  if (state.currentIndex >= TOTAL_QUESTIONS) {
    finishQuiz();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
});

elements.addLeftColumnBtn.addEventListener("click", () => {
  const category = CATEGORY_CONFIG[state.categoryKey];
  if (state.tableLeftCount >= category.leftExtensions.length) {
    return;
  }

  state.tableLeftCount += 1;
  renderConversionTable();
});

elements.addRightColumnBtn.addEventListener("click", () => {
  const category = CATEGORY_CONFIG[state.categoryKey];
  if (state.tableRightCount >= category.rightExtensions.length) {
    return;
  }

  state.tableRightCount += 1;
  renderConversionTable();
});

elements.tableToggleBtn.addEventListener("click", () => {
  const isHidden = elements.tablePanel.classList.contains("is-hidden");
  elements.tablePanel.classList.toggle("is-hidden", !isHidden);
  elements.tableToggleBtn.textContent = isHidden
    ? "Verberg herleidingstabel"
    : "Toon herleidingstabel";
  elements.tableToggleBtn.setAttribute("aria-expanded", String(isHidden));
});

elements.tableClearBtn.addEventListener("click", () => {
  clearConversionTable();
});

elements.restartBtn.addEventListener("click", () => {
  elements.setupForm.reset();
  showScreen("start");
});
