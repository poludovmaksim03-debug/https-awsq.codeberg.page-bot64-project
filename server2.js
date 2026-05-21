const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.')); // Для обслуживания статических файлов


// Получаем API‑ключ из переменных окружения
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Ошибка: OPENAI_API_KEY не установлен в переменных окружения');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;

    // Базовая валидация входящих данных
    if (!model || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Некорректные данные запроса' });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model || 'gpt-4o',
      messages: messages,
      max_tokens: max_tokens || 1500
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Ошибка API OpenAI:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Ошибка при обращении к AI‑сервису'
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
  console.log('Откройте в браузере: http://localhost:3000');
});
