class ChatBot {
    constructor(aiProcessor) {
        this.validateDependencies(aiProcessor);
        this.aiProcessor = aiProcessor;
        this.messages = [];
        this.isProcessing = false;
        this.elements = this.getDOMElements();
        this.bindMethods();
    }

    validateDependencies(aiProcessor) {
        if (!aiProcessor) throw new Error('AIProcessor обязателен для ChatBot');
        if (typeof aiProcessor.processHomework !== 'function') throw new Error('AIProcessor должен иметь processHomework');
    }

    getDOMElements() {
        const elements = {
            chatMessages: document.getElementById('chatMessages'),
            recognizedText: document.getElementById('recognizedText'),
            aiSolution: document.getElementById('aiSolution'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn')
        };

        // Проверяем, что все элементы найдены
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Элемент DOM не найден: ${key}`);
            }
        });
        return elements;
    }

    bindMethods() {
        ['addMessage', 'processUserMessage', 'handleScanResult'].forEach(method => {
            this[method] = this[method].bind(this);
        });
    }

    addMessage(text, isUser = false) {
        try {
            if (!text || typeof text !== 'string' || !text.trim()) return false;

            const trimmedText = text.trim();
            if (!this.elements.chatMessages) return false;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = trimmedText;
            this.elements.chatMessages.appendChild(messageDiv);
            this.smoothScrollToBottom();

            this.messages.push({
                text: trimmedText,
                isUser: isUser,
                timestamp: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Ошибка добавления сообщения:', error);
            return false;
        }
    }

    smoothScrollToBottom() {
        if (this.elements.chatMessages) {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
    }

    async processUserMessage(message) {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.elements.sendBtn.disabled = true;

            // Добавляем сообщение пользователя
            this.addMessage(message, true);

            // Показываем индикатор загрузки
            this.addMessage('🤖 Анализирую задание...', false);

            // Обрабатываем через AI
            const result = await this.aiProcessor.processHomework(message);

            // Удаляем индикатор загрузки
            this.elements.chatMessages.lastChild.remove();

            // Отображаем результат
            this.displayResults(result);
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
            this.addMessage('❌ Произошла ошибка при обработке запроса. Попробуйте ещё раз.', false);
        } finally {
            this.isProcessing = false;
            this.elements.sendBtn.disabled = false;
            this.elements.userInput.value = '';
        }
    }

    handleScanResult(recognizedText) {
        // Обновляем поле распознанного текста
        this.elements.recognizedText.value = recognizedText;

        // Отправляем распознанный текст на обработку AI
        this.processUserMessage(recognizedText);
    }

    displayResults(result) {
        // Отображаем анализ задания
        this.addMessage(`🔎 Анализ задания:\nПредмет: ${result.analysis.subject}\nУверенность: ${(result.analysis.confidence * 100).toFixed(1)}%`, false);

        // Отображаем решение
        this.elements.aiSolution.textContent = result.solution;
    }

    setupEventListeners() {
        // Отправка сообщения по кнопке
        this.elements.sendBtn.addEventListener('click', () => {
            const message = this.elements.userInput.value.trim();
            if (message) {
                this.processUserMessage(message);
            }
        });

        // Отправка по Enter
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = this.elements.userInput.value.trim();
                if (message) {
                    this.processUserMessage(message);
                }
            }
        });
    }
}

export default ChatBot;

