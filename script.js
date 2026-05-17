// Базы данных заданий и ответов (можно вынести в отдельный файл)
const homeworkTasks = {
    "task1": {
        question: "Решите уравнение: 2x + 5 = 15",
        correctAnswer: "5"
    },
    "task2": {
        question: "Найдите площадь прямоугольника со сторонами 4 и 6",
        correctAnswer: "24"
    }
};

// Текущее задание
let currentTask = "task1";

// Элементы DOM
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const scanBtn = document.getElementById('scanBtn');
const scannerModal = document.getElementById('scannerModal');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const scannedText = document.getElementById('scannedText');
const closeBtn = document.querySelector('.close');

// Инициализация
function init() {
    // Показываем текущее задание
    addBotMessage(homeworkTasks[currentTask].question);
    
    // Обработчики событий
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    scanBtn.addEventListener('click', openScanner);
    captureBtn.addEventListener('click', captureImage);
    closeBtn.addEventListener('click', closeScanner);
}

// Отправка сообщения
function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    checkAnswer(text);
    userInput.value = '';
}

// Добавление сообщения бота
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Добавление сообщения пользователя
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Проверка ответа
function checkAnswer(userAnswer) {
    const correctAnswer = homeworkTasks[currentTask].correctAnswer;
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    
    if (normalizedUser === normalizedCorrect) {
        addBotMessage("✅ Правильно! Отлично выполнено.");
        // Переходим к следующему заданию
        nextTask();
    } else {
        addBotMessage("❌ Неверно. Попробуйте ещё раз или воспользуйтесь подсказкой.");
    }
}

// Переход к следующему заданию
function nextTask() {
    // Здесь можно реализовать логику перехода к следующему заданию
    // Для примера просто показываем сообщение
    setTimeout(() => {
        currentTask = currentTask === "task1" ? "task2" : "task1";
        addBotMessage("Следующее задание: " + homeworkTasks[currentTask].question);
    }, 1000);
}

// Открытие сканера
function openScanner() {
    scannerModal.style.display = 'block';
    startCamera();
}

// Закрытие сканера
function closeScanner() {
    scannerModal.style.display = 'none';
    stopCamera();
    scannedText.textContent = '';
}

// Запуск камеры
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert('Не удалось получить доступ к камере: ' + err.message);
    }
}

// Остановка камеры
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    video.srcObject = null;
}

// Захват изображения и распознавание текста
function captureImage() {
    // Настраиваем canvas под размер видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Рисуем текущий кадр видео на canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    

    // Используем Tesseract.js для распознавания текста
     async function recognizeText(imageSource) {
    const worker = await Tesseract.createWorker('rus');

    const { data: { text } } = await worker.recognize(imageSource);

    await worker.template();
    return text.trim();
    
    };
};
    // Показываем распознанный текст
    scannedText.innerHTML = "<strong>Распознанный текст:</strong><br>${text}";

    // Автоматически отправляем распознанный текст в чат
    userInput.value = '';
    sendMessage();
};
    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', init());
    console.log(typeof Tesseract)
     
     
