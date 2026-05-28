import { useState } from 'react';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState('basic'); // 'basic' or 'scientific'
  const [memory, setMemory] = useState(0);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '%':
        return firstValue % secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const performScientificOperation = (op) => {
    const value = parseFloat(display);
    let result;

    switch (op) {
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'factorial':
        result = factorial(value);
        break;
      case '1/x':
        result = 1 / value;
        break;
      case 'abs':
        result = Math.abs(value);
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const insertConstant = (constant) => {
    let value;
    switch (constant) {
      case 'pi':
        value = Math.PI;
        break;
      case 'e':
        value = Math.E;
        break;
      default:
        value = 0;
    }
    setDisplay(String(value));
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Memory operations
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));
  const memoryStore = () => setMemory(parseFloat(display));

  return (
    <div className="calculator-page">
      <div className="page-header">
        <h2>🔢 Calculator</h2>
        <div className="mode-toggle">
          <button
            className={mode === 'basic' ? 'active' : ''}
            onClick={() => setMode('basic')}
          >
            Basic
          </button>
          <button
            className={mode === 'scientific' ? 'active' : ''}
            onClick={() => setMode('scientific')}
          >
            Scientific
          </button>
        </div>
      </div>

      <div className={`calculator ${mode}`}>
        <div className="calculator-display">
          <div className="memory-indicator">{memory !== 0 && 'M'}</div>
          <div className="display-value">{display}</div>
          {operation && <div className="operation-indicator">{operation}</div>}
        </div>

        <div className="calculator-keypad">
          {mode === 'scientific' && (
            <div className="scientific-functions">
              <button onClick={() => performScientificOperation('sin')}>sin</button>
              <button onClick={() => performScientificOperation('cos')}>cos</button>
              <button onClick={() => performScientificOperation('tan')}>tan</button>
              <button onClick={() => performScientificOperation('log')}>log</button>
              <button onClick={() => performScientificOperation('ln')}>ln</button>
              
              <button onClick={() => performScientificOperation('sqrt')}>√</button>
              <button onClick={() => performScientificOperation('square')}>x²</button>
              <button onClick={() => performScientificOperation('cube')}>x³</button>
              <button onClick={() => performOperation('^')}>xʸ</button>
              <button onClick={() => performScientificOperation('1/x')}>1/x</button>
              
              <button onClick={() => insertConstant('pi')}>π</button>
              <button onClick={() => insertConstant('e')}>e</button>
              <button onClick={() => performScientificOperation('factorial')}>n!</button>
              <button onClick={() => performScientificOperation('abs')}>|x|</button>
              <button onClick={() => performScientificOperation('exp')}>eˣ</button>
            </div>
          )}

          <div className="memory-functions">
            <button onClick={memoryClear} className="memory-btn">MC</button>
            <button onClick={memoryRecall} className="memory-btn">MR</button>
            <button onClick={memoryStore} className="memory-btn">MS</button>
            <button onClick={memoryAdd} className="memory-btn">M+</button>
            <button onClick={memorySubtract} className="memory-btn">M-</button>
          </div>

          <div className="standard-keypad">
            <button onClick={clear} className="function-btn clear">C</button>
            <button onClick={clearEntry} className="function-btn">CE</button>
            <button onClick={backspace} className="function-btn">⌫</button>
            <button onClick={() => performOperation('/')} className="operator-btn">÷</button>

            <button onClick={() => inputDigit(7)} className="number-btn">7</button>
            <button onClick={() => inputDigit(8)} className="number-btn">8</button>
            <button onClick={() => inputDigit(9)} className="number-btn">9</button>
            <button onClick={() => performOperation('*')} className="operator-btn">×</button>

            <button onClick={() => inputDigit(4)} className="number-btn">4</button>
            <button onClick={() => inputDigit(5)} className="number-btn">5</button>
            <button onClick={() => inputDigit(6)} className="number-btn">6</button>
            <button onClick={() => performOperation('-')} className="operator-btn">−</button>

            <button onClick={() => inputDigit(1)} className="number-btn">1</button>
            <button onClick={() => inputDigit(2)} className="number-btn">2</button>
            <button onClick={() => inputDigit(3)} className="number-btn">3</button>
            <button onClick={() => performOperation('+')} className="operator-btn">+</button>

            <button onClick={toggleSign} className="function-btn">±</button>
            <button onClick={() => inputDigit(0)} className="number-btn">0</button>
            <button onClick={inputDecimal} className="function-btn">.</button>
            <button onClick={() => performOperation('=')} className="equals-btn">=</button>
          </div>
        </div>

        <div className="calculator-info">
          <p>💡 <strong>Tip:</strong> Switch to Scientific mode for advanced mathematical functions</p>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
