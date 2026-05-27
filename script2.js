class HomeworkCheckerBot {
    constructor() {
        // DOM-элементы
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.textOutput = document.getElementById('textOutput');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.aiResponse = document.getElementById('aiResponse');
        this.status = document.getElementById('status');
        this.subjectSelect = document.getElementById('subjectSelect');

        // Кнопки
        this.toggleCameraBtn = document.getElementById('toggleCamera');
        this.startAutoScanBtn = document.getElementById('startAutoScan');
        this.stopAutoScanBtn = document.getElementById('stopAutoScan');
        this.captureBtn = document.getElementById('capture');

        // Состояния
        this.autoScanInterval = null;
        this.isAutoScanning = false;
        this.currentCamera = 'environment'; // 'environment' = задняя, 'user' = фронтальная

        // Привязываем контекст
        this.handleCapture = this.handleCapture.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startAutoScanning = this.startAutoScanning.bind(this);
        this.stopAutoScanning = this.stopAutoScanning.bind(this);

        // Инициализация
        this.bindEvents();
        this.initCamera();
    }

    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentCamera }
            });
            this.video.srcObject = stream;

            // Ждём, пока видео загрузится
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    console.log('[Камера] Метаданные загружены');
                    resolve();
                };
            });

            await new Promise((resolve) => {
                this.video.onplay = () => {
                    console.log('[Камера] Видео начало воспроизводиться');
                    resolve();
                };
            });

            if (!this.video.videoWidth || !this.video.videoHeight) {
                throw new Error('Камера подключена, но не передаёт размеры');
            }

            console.log(`[Камера] Размеры: ${this.video.videoWidth}x${this.video.videoHeight}`);
            this.status.textContent = '✅ Камера готова к работе';
        } catch (error) {
            console.error('❌ Ошибка камеры:', error);
            this.status.textContent = `⚠️ Ошибка: ${error.message}`;
            alert('Не удалось включить камеру. Разрешите доступ и перезагрузите.');
        }
    }

    captureFrame() {
        if (!this.video?.srcObject) {
            console.warn('❌ Нет видеопотока');
            return null;
        }

        if (!this.video.videoWidth || !this.video.videoHeight) {
            console.warn('❌ videoWidth или videoHeight = 0');
            return null;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.context.drawImage(this.video, 0, 0);
        return this.canvas.toDataURL('image/jpeg');
    }

    async recognizeTextFromImage(imageData) {
        if (!imageData) throw new Error('Нет изображения');

        try {
            this.status.textContent = '📝 Распознавание текста...';

            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('rus+eng');
            await worker.initialize('rus+eng');
            const result = await worker.recognize(imageData);
            await worker.terminate();

            const text = result.data.text.trim();
            if (!text) throw new Error('Распознанный текст пуст');

            this.status.textContent = '✅ Текст распознан';
            return text;
        } catch (error) {
            console.error('❌ OCR ошибка:', error);
            this.status.textContent = '⚠️ Не удалось распознать текст';
            throw error;
        }
    }

    async callYandexGPT(prompt) {
        if (!prompt?.trim()) throw new Error('Пустой запрос');

        this.status.textContent = '📡 Запрос к YandexGPT...';

        const API_KEY = 'AQVN3URzJQka8xSpp0DxNgbXa38dQmrXH5IrRmdt';
        const FOLDER_ID = 'b1ghp2t1hbddkurtrt9g';

        try {
            const response = await fetch('http://localhost:3000/api/yandexgpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Key ${API_KEY}`,
                    'x-folder-id': FOLDER_ID
                },
                body: JSON.stringify({
                    prompt,
                    subject: this.subjectSelect.value,
                    modelUri: `gpt://${FOLDER_ID}/yandexgpt/latest`,
                    messages: [
                        {
                            role: 'system',
                            text: `Ты — помощник по проверке ДЗ. Предмет: ${this.subjectSelect.value}. Объясняй на русском.`
                        },
                        { role: 'user', text: prompt }
                    ],
                    completionOptions: {
                        maxTokens: 2048,
                        temperature: 0.5
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const text = data?.result?.alternatives?.[0]?.message?.text;

            if (!text) throw new Error('Пустой ответ от YandexGPT');

            this.status.textContent = '💬 Ответ получен';
            return text;
        } catch (error) {
            console.error('❌ YandexGPT ошибка:', error);
            this.status.textContent = `⚠️ Ошибка: ${error.message}`;
            throw error;
        }
    }

    async processHomework(text) {
        try {
            const subject = this.subjectSelect.value;
            const prompt = `${subject !== 'all' ? `Предмет: ${subject}. ` : ''}
Проанализируй задание и решение. Если решения нет — реши по шагам.

Задание: ${text}

Формат:
"Задание"
"Анализ решения"
"Ошибки (если есть)"
"Правильное решение"
"Итог"`;

            return await this.callYandexGPT(prompt);
        } catch (error) {
            this.status.textContent = '❌ Ошибка обработки задания';
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

    async handleCapture() {
        try {
            console.log('📸 Попытка сделать снимок...');
            console.log('srcObject:', this.video.srcObject);
            console.log('videoWidth:', this.video.videoWidth);

            if (!this.video.srcObject) {
                throw new Error('Камера не включена — перезагрузите страницу');
            }

            // Ждём, если видео ещё не готово
            if (!this.video.videoWidth || !this.video.videoHeight) {
                this.status.textContent = '⏳ Камера загружается...';
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (!this.video.videoWidth || !this.video.videoHeight) {
                    throw new Error('Камера не готова — подождите или перезагрузите');
                }
            }

            const imageData = this.captureFrame();
            if (!imageData) {
                throw new Error('Не удалось получить кадр');
            }

            const recognizedText = await this.recognizeTextFromImage(imageData);
            this.textOutput.value = recognizedText;
            this.addChatMessage(`📝 Распознано: ${recognizedText}`, true);

            this.aiResponse.textContent = '🤖 Анализирую задание...';
            try {
                const solution = await this.processHomework(recognizedText);
                this.aiResponse.textContent = solution;
                this.addChatMessage(`🧠 Ответ:\n${solution}`, false);
            } catch (error) {
                const errorMsg = `❌ Ошибка: ${error.message}`;
                this.aiResponse.textContent = errorMsg;
                this.addChatMessage(errorMsg, false);
            }
        } catch (error) {
            console.error('❌ Ошибка снимка:', error);
            this.status.textContent = `❌ Ошибка: ${error.message}`;
            alert('Ошибка: ' + error.message);
        }
    }

    startAutoScanning() {
        if (this.isAutoScanning) return;

        this.isAutoScanning = true;
        this.startAutoScanBtn.disabled = true;
        this.stopAutoScanBtn.style.display = 'inline-block';
        this.status.textContent = '🔄 Автосканирование запущено (каждые 3 сек)';

        this.autoScanInterval = setInterval(() => {
            console.log('⏱ Автосканирование: попытка снимка');
            this.handleCapture(); // вызывает полную цепочку
        }, 3000);
    }

    stopAutoScanning() {
        if (this.autoScanInterval) {
            clearInterval(this.autoScanInterval);
            this.autoScanInterval = null;
        }
        this.isAutoScanning = false;
        this.startAutoScanBtn.disabled = false;
        this.stopAutoScanBtn.style.display = 'none';
        this.status.textContent = '⏸ Автосканирование остановлено';
    }

    toggleCamera() {
        this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
        this.initCamera();
        this.status.textContent = `🔄 Переключение камеры...`;
    }

    bindEvents() {
        this.toggleCameraBtn.addEventListener('click', () => {
            this.toggleCamera();
        });

        this.startAutoScanBtn.addEventListener('click', this.startAutoScanning);
        this.stopAutoScanBtn.addEventListener('click', this.stopAutoScanning);
        this.captureBtn.addEventListener('click', this.handleCapture);

        document.getElementById('sendBtn').addEventListener('click', this.sendMessage);
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    sendMessage() {
        const userText = this.userInput.value.trim();
        if (!userText) return;

        this.addChatMessage(userText, true);
        this.userInput.value = '';

        this.aiResponse.textContent = '🤖 Анализирую...';
        this.callYandexGPT(userText)
            .then(solution => {
                this.aiResponse.textContent = solution;
                this.addChatMessage(`🧠 Ответ:\n${solution}`, false);
            })
            .catch(error => {
                const errorMsg = `❌ Ошибка: ${error.message}`;
                this.aiResponse.textContent = errorMsg;
                this.addChatMessage(errorMsg, false);
            });
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new HomeworkCheckerBot();
});




