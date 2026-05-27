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
        this.subjectSelect = document.getElementById('subjectSelect');

        this.autoScanInterval = null;
        this.isAutoScanning = false;
        this.currentCamera = 'environment';

        // ✅ Привязываем методы к this
        this.handleCapture = this.handleCapture.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

        this.bindEvents();
        this.initCamera();
    }

    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentCamera }
            });
            this.video.srcObject = stream;
            this.status.textContent = 'Камера готова к работе';
        } catch (error) {
            console.error('Ошибка камеры:', error);
            this.status.textContent = '❌ Ошибка камеры: ' + error.message;
            alert('Не удалось включить камеру. Проверьте доступ.');
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

            const worker = await Tesseract.createWorker();
            await worker.loadLanguage('rus+eng');
            await worker.initialize('rus+eng');
            const result = await worker.recognize(imageData);
            await worker.terminate();

            this.status.textContent = 'Текст успешно распознан';
            return result.data.text.trim();
        } catch (error) {
            console.error('Ошибка OCR:', error);
            this.status.textContent = '❌ Ошибка распознавания';
            throw error;
        }
    }

    async callYandexGPT(prompt) {
        if (!prompt?.trim()) {
            throw new Error('Пустой запрос');
        }

        this.status.textContent = 'Запрос к YandexGPT...';

        // ✅ Ваш API-ключ
        const API_KEY = 'AQVN3URzJQka8xSpp0DxNgbXa38dQmrXH5IrRmdt'; // ✔️ Правильный формат
        const FOLDER_ID = 'b1ghp2t1hbddkurtrt9g';

        try {
            const response = await fetch('http://localhost:5500/api/yandexgpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Key ${API_KEY}`,
                    'x-folder-id': FOLDER_ID
                },
                body: JSON.stringify({prompt: 'Реши 2+2', subject: 'math',
                    modelUri: `gpt://${FOLDER_ID}/yandexgpt/latest`,
                    messages: [
                        {
                            role: 'system',
                            text: `Ты — помощник по проверке домашних заданий. Предмет: ${this.subjectSelect.value}. Объясняй на русском.`
                        },
                        {
                            role: 'user',
                            text: prompt
                        }
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

            if (!text) {
                throw new Error('Пустой ответ от YandexGPT');
            }

            this.status.textContent = 'Ответ получен от YandexGPT';
            return text;
        } catch (error) {
            console.error('Ошибка YandexGPT:', error);
            // ✅ Защита: проверяем, что this.status существует
            if (this.status && typeof this.status.textContent === 'string') {
                this.status.textContent = `Ошибка API: ${error.message}`;
            } else {
                console.error('this.status недоступен');
            }
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

            const solution = await this.callYandexGPT(prompt);
            return solution;
        } catch (error) {
            // ✅ Защита при ошибке
            if (this.status) {
                this.status.textContent = '❌ Ошибка обработки задания';
            }
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
            const imageData = this.captureFrame();
            if (!imageData) throw new Error('Нет данных с камеры');

            const recognizedText = await this.recognizeTextFromImage(imageData);
            if (!recognizedText) throw new Error('Нет текста');

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
            console.error('Ошибка снимка:', error);
            alert('Ошибка: ' + error.message);
        }
    }

    bindEvents() {
        // ✅ Стрелочные функции или bind() — чтобы this был правильным
        document.getElementById('toggleCamera').addEventListener('click', () => {
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            this.initCamera();
            this.status.textContent = `Камера: ${this.currentCamera}`;
        });

        document.getElementById('capture').addEventListener('click', this.handleCapture);

        document.getElementById('sendBtn').addEventListener('click', this.sendMessage);
        this.userInput.addEventListener('keypress', (e) => e.key === 'Enter' && this.sendMessage());
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

document.addEventListener('DOMContentLoaded', () => {
    new HomeworkCheckerBot();
});




