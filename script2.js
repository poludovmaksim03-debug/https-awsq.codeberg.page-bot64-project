class HomeworkCheckerBot {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.textOutput = document.getElementById('textOutput');
        this.chatMessages = document.getElementById('chatMessages'); 
        this.userInput = document.getElementById('userInput');
        this.aiResponse = document.getElementById('aiResponse');
        this.status = document.getElementById('status');
        

        this.autoScanInterval = null;
        this.isAutoScanning = false;
        this.currentCamera = 'environment'; // environment или user

        this.bindEvents();
        this.initCamera();
    }

    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: this.currentCamera
            }
        });

        this.video.srcObject = stream;
        this.status.textContent = 'Камера готова к работе';
    } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        this.status.textContent = 'Ошибка камеры: проверьте разрешения';
        alert('Не удалось получить доступ к камере. Проверьте разрешения в браузере.');
    }
}

captureFrame() {
    if (!this.video.videoWidth) return null;

    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.context.drawImage(this.video, 0, 0);
    return this.canvas.toDataURL('image/jpeg');
}

async recognizeTextFromImage(imageData) {
    try {
        this.status.textContent = 'Распознавание текста...';
        const result = await Tesseract.recognize(
            imageData,
            'rus+eng',
            { logger: info => console.log(info) }
        );
        this.status.textContent = 'Текст успешно распознан';
        return result.data.text;
    } catch (error) {
        console.error('Ошибка распознавания текста:', error);
        this.status.textContent = 'Ошибка распознавания текста';
        throw new Error('Не удалось распознать текст на изображении');
    }
}

    async callYandexGPT(prompt) {
        if (!prompt) {
            throw new Error('Пустой запрос к Yandex GPT');
        }

        this.status('Обращение к Yandex GPT...');

        try {
            const response = await fetch('http://localhost:3000/api/yandex-gpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'Ты — умный помощник для проверки домашних заданий по всем школьным предметам. Проверяй решение, находи ошибки и объясняй их. Отвечай на русском языке.'
                },
                {
                    role: 'user',
            content: prompt
        }
            ],
            max_tokens: 1500
        })
    });

        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        this.status.textContent = 'Ответ получен от YandexGPT';
        return data.response;
    } catch (error) {
        console.error('Ошибка вызова YandexGPT:', error);
        this.status.textContent = 'Ошибка получения ответа от YandexGPT';
        throw error;
    }
}

async processHomework(text) {
    try {
        const prompt = `Проанализируй следующее домашнее задание и его решение. Если решение есть — проверь его правильность, укажи на ошибки и дай правильный ответ. Если решения нет — реши задание пошагово с объяснениями.\n\nЗадание: ${text}\n\nДай подробный разбор на русском языке согласно структуре: "Задание", "Анализ решения", "Ошибки (если есть)", "Правильное решение", "Итог".`;
        return await this.callYandexGPT(prompt);
     } catch (error) {
    console.error('Ошибка обработки задания:', error);
        throw error;
    }
}

addChatMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    messageDiv.textContent = text;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
}

startAutoScanning() {
    if (this.autoScanInterval) return;

    this.isAutoScanning = true;
    document.getElementById('startAutoScan').disabled = true;
    document.getElementById('stopAutoScan').style.display = 'block';
    this.status.textContent = 'Автоматическое сканирование запущено';

    this.autoScanInterval = setInterval(async () => {
        try {
            const imageData = this.captureFrame();
            if (imageData) {
                const recognizedText = await this.recognizeTextFromImage(imageData);
                if (recognizedText.trim() && recognizedText !== this.textOutput.value) {
                    this.textOutput.value = recognizedText;
                    this.addChatMessage(`📝 Распознано: ${recognizedText}`, true);

            // Автоматически отправляем распознанный текст на проверку
            this.aiResponse.textContent = '🤖 Анализирую задание...';
            try {
                const solution = await this.processHomework(recognizedText);
                this.aiResponse.textContent = solution;
                this.addChatMessage(`🧠 Проверка от YandexGPT:\n${solution}`, false);
            } catch (error) {
                this.aiResponse.textContent = `❌ Ошибка проверки: ${error.message}`;
            }
        }
            }
        } catch (error) {
            console.error('Ошибка автоматического сканирования:', error);
        }
    }, 3000); // Сканируем каждые 3 секунды
}

stopAutoScanning() {
    if (this.autoScanInterval) {
        clearInterval(this.autoScanInterval);
        this.autoScanInterval = null;
    }
    this.isAutoScanning = false;
    document.getElementById('startAutoScan').disabled = false;
    document.getElementById('stopAutoScan').style.display = 'none';
    this.status.textContent = 'Автоматическое сканирование остановлено';
}

toggleCamera() {
    this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
    this.initCamera();
    this.status.textContent = `Камера переключена на ${this.currentCamera === 'environment' ? 'заднюю' : 'фронтальную'}`;
}

bindEvents() {
    // Переключение камеры
    document.getElementById('toggleCamera').addEventListener('click', () => {
        this.toggleCamera();
    });

    // Автоматическое сканирование
    document.getElementById('startAutoScan').addEventListener('click', () => {
        this.startAutoScanning();
    });

    // Остановка автоматического сканирования
    document.getElementById('stopAutoScan').addEventListener('click', () => {
        this.stopAutoScanning();
    });

    // Ручной снимок
    document.getElementById('capture').addEventListener('click', async () => {
        try {
            const imageData = this.captureFrame();
            if (imageData) {
                const recognizedText = await this.recognizeTextFromImage(imageData);
                this.textOutput.value = recognizedText;
                this.addChatMessage(`📝 Распознано вручную: ${recognizedText}`, true);

                // Автоматически отправляем на проверку
                this.aiResponse.textContent = '🤖 Анализирую задание...';
                try {
                    const solution = await this.processHomework(recognizedText);
                    this.aiResponse.textContent = solution;
                    this.addChatMessage(`🧠 Проверка от YandexGPT:\n${solution}`, false);
                } catch (error) {
                    this.aiResponse.textContent = `❌ Ошибка проверки: ${error.message}`;
                }
            }
        } catch (error) {
            alert('Не удалось сделать снимок: ' + error.message);
        }
    });

    // Отправка сообщений в чате
    document.getElementById('sendBtn').addEventListener('click', () => {
        this.sendMessage();
    });

    this.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
    });
}

async sendMessage() {
    const userText = this.userInput.value.trim();
    if (!userText) return;

    this.addChatMessage(userText, true);
    this.userInput.value = '';

    this.aiResponse.textContent = '🤖 Анализирую запрос...';
    try {
        const solution = await this.processHomework(userText);
        this.aiResponse.textContent = solution;
        this.addChatMessage(`🧠 Ответ YandexGPT:\n${solution}`, false);
    } catch (error) {
        this.aiResponse.textContent = `❌ Ошибка: ${error.message}`;
    }
}
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new HomeworkCheckerBot()
});
