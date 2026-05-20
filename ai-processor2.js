class AIProcessor {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.isModelLoaded = false;
        this.subjects = {
            'Математика': ['sin', 'cos', 'tg', 'ctg', 'x^', 'y=', 'уравнение', 'интеграл', 'производная', 'функция', 'график'],
            'Алгебра': ['x^', 'y=', 'функция', 'график', 'система уравнений', 'неравенство', 'многочлен'],
            'Геометрия': ['треугольник', 'угол', 'площадь', 'периметр', 'радиус', 'диаметр', 'окружность', 'квадрат', 'прямоугольник'],
            'Физика': ['сила', 'масса', 'ускорение', 'энергия', 'работа', 'мощность', 'закон', 'Ньютон', 'скорость', 'давление'],
            'Химия': ['H2O', 'реакция', 'молекула', 'атом', 'валентность', 'оксид', 'кислота', 'основание', 'соль'],
            'Биология': ['клетка', 'ДНК', 'РНК', 'фотосинтез', 'эволюция', 'вид', 'популяция', 'экосистема'],
            'Информатика': ['алгоритм', 'программа', 'код', 'переменная', 'функция', 'цикл', 'массив', 'алгоритм'],
            'История': ['год', 'век', 'событие', 'война', 'революция', 'империя', 'монарх', 'битва'],
            'Литература': ['произведение', 'автор', 'герой', 'сюжет', 'тема', 'идея', 'образ', 'стихотворение']
        };
    }

    async loadModel() {
        try {
            // Инициализация TensorFlow.js
            await tf.ready();

            // Создаём простую модель для классификации предметов
            this.model = tf.sequential();
            this.model.add(tf.layers.dense({
                units: 64,
                activation: 'relu',
                inputShape: [100]
            }));
            this.model.add(tf.layers.dense({
                units: 32,
                activation: 'relu'
            }));
            this.model.add(tf.layers.dense({
                units: Object.keys(this.subjects).length,
                activation: 'softmax'
            }));

            this.model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            this.isModelLoaded = true;
            console.log('Модель TensorFlow.js успешно загружена');
        } catch (error) {
            console.error('Ошибка загрузки модели TensorFlow:', error);
            throw error;
        }
    }

    async processHomework(text) {
        if (!this.apiKey) {
            throw new Error('API ключ ChatGPT не установлен');
        }

        try {
            // Анализ задания с помощью TensorFlow
            const analysis = this.analyzeTask(text);

            // Генерация решения через ChatGPT API
            const solution = await this.generateSolutionWithChatGPT(text, analysis.subject);

            return {
                analysis: analysis,
                solution: solution
            };
        } catch (error) {
            console.error('Ошибка обработки AI:', error);
            throw error;
        }
    }

    analyzeTask(text) {
        const lowerText = text.toLowerCase();
        let subject = 'Общее домашнее задание';
        let confidence = 0;

        // Поиск совпадений по предметам
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

    async generateSolutionWithChatGPT(text, subject) {
        const prompt = `Реши следующее домашнее задание по предмету "${subject}":\n\n${text}\n\nПредоставь подробное пошаговое решение с объяснениями каждого шага. В конце напиши окончательный ответ.`;

        const response = await fetch('https://api.air.fail/public/text/chatgpt_5_5/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Ты — AI‑ассистент для помощи с домашним заданием по всем школьным предметам. Предоставь подробное пошаговое решение с объяснениями каждого шага. В конце напиши окончательный ответ.'
                },
                {
            role: 'user',
            content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка API ChatGPT: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Ошибка при обращении к ChatGPT:', error);
            throw new Error('Не удалось получить решение от AI. Проверьте интернет‑соединение и API‑ключ.');
        }
    }


export default AIProcessor;
