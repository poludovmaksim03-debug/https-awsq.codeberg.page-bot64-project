class AIProcessor { 
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
        this.subjects = {
            'Математика': ['sin', 'cos', 'tg', 'ctg', 'x^', 'y=', 'уравнение', 'интеграл', 'производная', 'функция', 'график'], 
            'Алгебра': ['x^', 'y=', 'функция', 'график', 'система уравнений', 'неравенство', 'многочлен'],
            'Геометрия': ['треугольник', 'угол', 'площадь', 'периметр', 'радиус', 'диаметр', 'окружность', 'квадрат', 'прямоугольник'],
            'Физика': ['сила', 'масса', 'ускорение', 'энергия', 'работа', 'мощность', 'закон', 'Ньютон', 'скорость', 'давление'],
            'Химия': ['H2O', 'реакция', 'молекула', 'атом', 'валентность', 'оксид', 'кислота', 'основание', 'соль'],
            'Биология': ['клетка', 'ДНК', 'РНК', 'фотосинтез', 'эволюция', 'вид', 'популяция', 'экосистема'],
            'Информатика': ['алгоритм', 'программа', 'код', 'переменная', 'функция', 'цикл', 'массив'],
            'История': ['год', 'век', 'событие', 'война', 'революция', 'империя', 'монарх', 'битва'],
            'Литература': ['произведение', 'автор', 'герой', 'сюжет', 'тема', 'идея', 'образ', 'стихотворение']
        };
    }

    analyzeTask(text) {
        const lowerText = text.toLowerCase();
        let subject = 'Общее домашнее задание';
        let confidence = 0;

        for (const [subj, keywords] of Object.entries(this.subjects)) {
            let matches = 0;
            keywords.forEach(keyword => {
                if (lowerText.includes(keyword.toLowerCase())) {
                    matches++;
                }
            });

            const subjConfidence = matches / keywords.length;
            if (subjConfidence > confidence) {
                confidence = subjConfidence;
                subject = subj;
            }
        }

        confidence = Math.min(confidence, 1);
        return { subject, confidence };
    }

    async callChatGPT(prompt, model = 'gpt-4o', maxTokens = 1000) {
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Ты — умный помощник для решения школьных домашних заданий по всем предметам. Дай чёткое, пошаговое решение с объяснением. Ответ должен быть на русском языке.'
                },
                {
            role: 'user',
            content: prompt
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Ошибка API: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Ошибка вызова ChatGPT API:', error);
            throw error;
        }
    }

    async processHomework(text) {
        try {
            const analysis = this.analyzeTask(text);
            const prompt = `Реши следующее домашнее задание по предмету "${analysis.subject}":\n\n${text}\n\nДай подробное пошаговое решение на русском языке с объяснениями каждого шага. В конце напиши итоговый ответ.`;
            const solution = await this.callChatGPT(prompt);

            return {
                analysis: analysis,
                solution: solution
            };
        } catch (error) {
            console.error('Ошибка обработки домашнего задания:', error);
            throw error;
        }
    }
}

export default AIProcessor;
