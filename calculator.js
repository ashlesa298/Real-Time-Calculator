// script.js
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let lastInputIsOperator = false;

// Add click handlers for all buttons
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');

    if (action === 'clear') {
      clearDisplay();
      return;
    }
    if (action === 'back') {
      deleteLast();
      return;
    }
    if (action === 'equals') {
      calculate();
      return;
    }
    if (val) {
      appendValue(val);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;

  if (/^[0-9]$/.test(key)) {
    appendValue(key);
    e.preventDefault();
    return;
  }

  if (key === 'Enter') { calculate(); e.preventDefault(); return; }
  if (key === 'Backspace') { deleteLast(); e.preventDefault(); return; }
  if (key === '.') { appendValue('.'); e.preventDefault(); return; }
  if (['+','-','*','/','%'].includes(key)) { appendValue(key); e.preventDefault(); return; }
});

// Append a value to the expression with simple guards
function appendValue(ch) {
  let expr = display.value;

  // Prevent multiple dots in current number segment
  if (ch === '.') {
    // find last operator to get current number
    const lastOpIndex = Math.max(expr.lastIndexOf('+'), expr.lastIndexOf('-'), expr.lastIndexOf('*'), expr.lastIndexOf('/'), expr.lastIndexOf('%'));
    const currentNumber = expr.slice(lastOpIndex + 1);
    if (currentNumber.includes('.')) return; // already has dot
  }

  // Prevent two operators in a row (allow '-' as unary if expression empty)
  if (isOperator(ch)) {
    if (expr === '' && ch !== '-') return; // don't start with + * / %
    if (expr !== '' && isOperator(expr.slice(-1))) {
      // replace previous operator with new one
      display.value = expr.slice(0, -1) + ch;
      lastInputIsOperator = true;
      calculateRealtime();
      return;
    }
    lastInputIsOperator = true;
  } else {
    lastInputIsOperator = false;
  }

  display.value += ch;
  calculateRealtime();
}

function isOperator(c) {
  return ['+','-','*','/','%'].includes(c);
}

function clearDisplay() {
  display.value = '';
  display.placeholder = '0';
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
  calculateRealtime();
}

// Calculate final result
function calculate() {
  if (!display.value) return;
  try {
    const result = safeEval(display.value);
    display.value = result + '';
    display.placeholder = '= ' + result;
  } catch (err) {
    display.value = '';
    display.placeholder = 'Error';
  }
}

// Real-time preview (shows in placeholder)
function calculateRealtime() {
  if (!display.value) {
    display.placeholder = '0';
    return;
  }
  try {
    const result = safeEval(display.value);
    if (result !== undefined) display.placeholder = '= ' + result;
  } catch {
    display.placeholder = 'Error';
  }
}

// A slightly safer evaluator (handles % by converting to /100)
function safeEval(input) {
  // Replace repeated percent occurrences: "50%+10" -> "(50/100)+10"
  // We'll convert a number% token to (number/100)
  const converted = input.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  // Disallow characters except numbers, operators, parentheses and spaces
  if (/[^0-9+\-*/().\s]/.test(converted)) {
    throw new Error('Invalid characters');
  }
  // Use Function instead of eval
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${converted});`);
  const res = fn();
  if (typeof res === 'number' && !Number.isFinite(res)) throw new Error('Math error');
  return Math.round((res + Number.EPSILON) * 1e12) / 1e12; // round to avoid tiny floats
}
