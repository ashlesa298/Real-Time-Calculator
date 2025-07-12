const display = document.getElementById('display');

function clearDisplay() {
  display.textContent = '';
}

function appendToDisplay(value) {
  display.textContent += value;
}

function calculateResult() {
  try {
    display.textContent = eval(display.textContent
      .replace('÷', '/')
      .replace('×', '*'));
  } catch {
    display.textContent = 'Error';
  }
}
