class TextRecognizer {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        try {
            this.worker = await Tesseract.createWorker('eng', 1.0, {
                logger: m => console.log(m)
            });
            await this.worker.loadLanguage('eng+rus');
            await this.worker.initialize('eng+rus');
        } catch (error) {
            console.error('Ошибка инициализации распознавателя:', error);
            throw error;
        }
    }

    async recognizeText(imageDataUrl) {
        if (!this.worker) {
            throw new Error('Распознаватель не инициализирован. Вызовите initialize() сначала.');
        }

        try {
            const result = await this.worker.recognize(imageDataUrl);
            return result.data.text;
        } catch (error) {
            console.error('Ошибка распознавания текста:', error);
            throw error;
        }
    }

    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}

export default TextRecognizer;

