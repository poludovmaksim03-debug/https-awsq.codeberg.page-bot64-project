import DocumentScanner from './scanner2.js';
import TextRecognizer from './recognizer2.js';
import AIProcessor from './ai-processor2.js'; 
import ChatBot from './chatbot2.js';

class App {
    constructor() {
        this.scanner = new DocumentScanner();
        this.recognizer = new TextRecognizer();
        this.aiProcessor = new AIprocessor();
        this.chatBot = new ChatBot(this.aiProcessor);
        this.setupEventListeners();
    }

    async initialize() {
        try {
            // Инициализация всех компонентов
            await this.recognizer.initialize();
            await this.aiProcessor.loadModel();
            this.chatBot.setupEventListeners();

            // Запуск камеры
            await this.scanner.startCamera();

            // Приветственное сообщение
            this.chatBot.addMessage('Привет! Я AI‑бот для помощи с домашним заданием по всем школьным предметам. Готов распознать и решить задачи!', false);

            console.log('Все компоненты успешно инициализированы');
        } catch (error) {
            console.error('Критическая ошибка инициализации:', error);
            alert('Произошла ошибка при запуске бота. Проверьте консоль браузера.');
        }
    }

    setupEventListeners() {
        // Полноэкранный режим
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

                // Сканирование документа
        document.getElementById('scanBtn').addEventListener('click', async () => {
            try {
                const imageDataUrl = this.scanner.captureFrame();
                const recognizedText = await this.recognizer.recognizeText(imageDataUrl);
                this.chatBot.handleScanResult(recognizedText);
            } catch (error) {
                console.error('Ошибка сканирования:', error);
                alert('Ошибка при сканировании документа: ' + error.message);
            }
        });

        // Сделать снимок
        document.getElementById('captureBtn').addEventListener('click', async () => {
            try {
                const imageDataUrl = this.scanner.captureFrame();
                // Показываем сообщение о процессе распознавания
                this.chatBot.addMessage('📷 Снимок сделан! Распознавание текста...', false);
                const recognizedText = await this.recognizer.recognizeText(imageDataUrl);
                this.chatBot.handleScanResult(recognizedText);
            } catch (error) {
                console.error('Ошибка создания снимка:', error);
                alert('Ошибка при создании снимка: ' + error.message);
            }
        });

        // Обработчик изменения полноэкранного режима
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            document.body.classList.toggle('fullscreen', isFullscreen);
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});

