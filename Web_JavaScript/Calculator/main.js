// Lấy các phần tử DOM cần thiết
const display = document.getElementById('display');
const keys = document.querySelector('.calculator-keys');

// Đối tượng lưu trữ trạng thái của máy tính
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

// Hàm cập nhật màn hình hiển thị
function updateDisplay() {
    let displayString = String(calculator.displayValue);

    // Xử lý các giá trị đặc biệt (Infinity, -Infinity, NaN)
    if (displayString.includes('Infinity')) {
        display.textContent = 'Lỗi: Vô cực';
    } else if (displayString === 'NaN') {
        display.textContent = 'Lỗi: Không phải số';
    } else {
        // Cắt bớt nếu quá dài, sử dụng toPrecision để xử lý số quá nhỏ/lớn
        // 16 là một con số an toàn cho độ chính xác của JavaScript
        display.textContent = displayString.length > 16
            ? parseFloat(displayString).toPrecision(12) // Hiển thị 12 chữ số nếu quá dài
            : displayString;
    }
}

// Hàm xử lý nhập số
function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }

    updateDisplay();
}

// Hàm xử lý dấu thập phân
function inputDecimal(dot) {
    // Nếu đang chờ toán hạng thứ hai, gõ dấu "." sẽ bắt đầu một số mới "0."
    if (calculator.waitingForSecondOperand === true) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        updateDisplay();
        return;
    }

    // Chỉ cho phép thêm dấu thập phân nếu chưa có
    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
    updateDisplay();
}

// Đối tượng chứa logic tính toán cho từng toán tử
const performCalculation = {
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '^': (firstOperand, secondOperand) => firstOperand ** secondOperand,
    '%': (firstOperand, secondOperand) => firstOperand % secondOperand,
};

// Hàm xử lý toán tử
function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    // Kiểm tra nếu giá trị nhập vào không phải là số (ví dụ: đang hiển thị "Lỗi")
    // Chỉ cần kiểm tra isFinite là đủ.
    if (!Number.isFinite(inputValue)) {
        calculator.displayValue = 'Lỗi: Không thể tính';
        updateDisplay();
        return;
    }

    // Nếu chưa có toán hạng đầu tiên, lưu giá trị hiện tại làm toán hạng đầu tiên
    if (firstOperand === null) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        // Nếu đã có toán tử (ví dụ: 5 + 3), thực hiện phép tính
        let result = performCalculation[operator](firstOperand, inputValue);
        
        // **Cải tiến quan trọng**: Làm tròn kết quả để tránh lỗi dấu phẩy động (vd: 0.1 + 0.2)
        result = parseFloat(result.toPrecision(15));

        calculator.displayValue = String(result);
        calculator.firstOperand = result;
    }

    // Cập nhật trạng thái cho phép toán tiếp theo
    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;

    updateDisplay();
}

// Hàm xử lý khi nhấn dấu bằng (=)
function handleCalculate() {
    const { firstOperand, displayValue, operator } = calculator;
    
    // Chỉ thực hiện khi có đủ toán hạng và toán tử
    if (operator && firstOperand !== null) {
        const inputValue = parseFloat(displayValue);

        // Kiểm tra nếu giá trị nhập vào không phải là số
        if (!Number.isFinite(inputValue)) {
             calculator.displayValue = 'Lỗi: Không thể tính';
             updateDisplay();
             return;
        }

        let result = performCalculation[operator](firstOperand, inputValue);
        
        // **Cải tiến quan trọng**: Làm tròn kết quả
        result = parseFloat(result.toPrecision(15));

        calculator.displayValue = String(result);
        calculator.firstOperand = result; // Lưu kết quả để có thể tiếp tục tính (vd: 5+3 = * 2 =)
    }

    // Sau khi nhấn "=", reset toán tử và chờ toán hạng mới
    calculator.operator = null;
    calculator.waitingForSecondOperand = true;
    updateDisplay();
}

// Hàm thiết lập lại máy tính
function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    updateDisplay();
}

// Lắng nghe sự kiện click trên các nút
keys.addEventListener('click', (event) => {
    const { target } = event;
    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!target.matches('button')) {
        return;
    }

    // Xử lý nút số
    if (value !== undefined) {
        inputDigit(value);
        return;
    }

    // Xử lý các hành động
    switch (action) {
        case 'decimal':
            inputDecimal('.');
            break;
        case 'clear':
            resetCalculator();
            break;
        case 'calculate':
            handleCalculate();
            break;
        // Các trường hợp còn lại là toán tử
        default:
            if (performCalculation.hasOwnProperty(action)) {
                handleOperator(action);
            }
            break;
    }
});

// Khởi tạo hiển thị
updateDisplay();