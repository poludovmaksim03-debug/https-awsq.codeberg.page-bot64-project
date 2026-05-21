const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.')); // Для обслуживания статических файлов


// Получаем API‑ключ и идентификатор каталога из переменных окружения
const YANDEX_API_KEY = process.env.ai-studio-cc8b18;
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;


if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
  console.error('Ошибка: YANDEX_API_KEY или YANDEX_FOLDER_ID не установлены в переменных окружения');
  process.exit(1);
}

app.post('/api/yandex-gpt', async (req, res) => {
  try {
    const { messages, max_tokens } = req.body;

    // Базовая валидация входящих данных
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Некорректные данные запроса' });
    }

    const response = await axios.post('https://console.yandex.cloud/folders/b1ghp2t1hbddkurtrt9g/iam/service-accounts', {
      modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt/latest`,
      completionOptions: {
        stream: false,
        temperature: 0.3,
        maxTokens: max_tokens || 1500
      },
      messages: messages
    }, {
      headers: {
        'Authorization': `Api-Key ${YANDEX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.result.alternatives[0].message.text;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Ошибка API Yandex GPT:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Ошибка при обращении к Yandex GPT'
    });
  }
});

// Обработка CORS для разработки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log('Откройте в браузере: https://console.yandex.cloud/folders/b1ghp2t1hbddkurtrt9g/iam/service-accounts');
  console.log('\nДля работы необходимо установить:');
  console.log('- YANDEX_API_KEY в .env файле');
  console.log('- YANDEX_FOLDER_ID в .env файле');
});
