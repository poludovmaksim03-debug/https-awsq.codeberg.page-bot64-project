<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Многозадачный чат‑бот для проверки ДЗ</title>
    <link rel="stylesheet" href="style3.css">
</head>
<body>
    <style>
        h1 {color: orange} 
        p {color: orange}
        body {background-image: url("https://sun1-88.userapi.com/s/v1/ig2/HJADTC1kRnyJWwlkqy2e8E1-GXpDKhLR-I-blb0KR8fKIZzUc0wJ0B3nSobydodcg8bP-T04eTflxeZ84We2ebDh.jpg?quality=96&crop=0,0,1000,1000&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720&ava=1>") ; background-repeat: no-repeat; background-size: cover}
    </style>
    <div class="app">
        <header>
            <h1>🤖 Многозадачный чат‑бот для проверки домашнего задания</h1>
            <p>Сканирование → Распознавание → Анализ → Проверка → Объяснение</p>
        </header>

        <div class="container">
            <!-- Расширенная камера -->
            <div class="camera-section">
                <h2>📸 Расширенная камера</h2>
                <div class="camera-controls">
                    <button id="toggleCamera">🔄 Переключить камеру</button>
            <button id="startAutoScan">🔎 Автосканирование</button>
            <button id="capture">📷 Сделать снимок</button>
            <button id="stopAutoScan" style="display: none;">⏹ Остановить сканирование</button>
                </div>
                <video id="video" autoplay muted playsinline width="100%"></video>
                <canvas id="canvas" style="display: none;"></canvas>
            </div>

            <!-- Распознанный текст -->
            <div class="text-section">
                <h2>📝 Распознанный текст</h2>
                <textarea id="textOutput" readonly placeholder="Здесь появится текст с фото..."></textarea>
            </div>

            <!-- Выбор предмета -->
            <div class="subject-section">
                <h2>🎒 Выберите предмет</h2>
                <select id="subjectSelect">
                    <option value="all">Все предметы</option>
            <option value="math">Математика</option>
            <option value="physics">Физика</option>
            <option value="chemistry">Химия</option>
            <option value="russian">Русский язык</option>
            <option value="literature">Литература</option>
            <option value="history">История</option>
            <option value="biology">Биология</option>
                </select>
            </div>

            <!-- Чат с AI -->
            <div class="chat-section">
                <h2>💬 Чат с AI‑помощником</h2>
                <div id="chatMessages" class="messages"></div>
                <div class="input-area">
                    <input type="text" id="userInput" placeholder="Задайте вопрос или отправьте текст...">
            <button id="sendBtn">➤ Отправить</button>
                </div>
            </div>

            <!-- Результаты проверки -->
            <div class="results-section">
                <h2>🧠 Результаты проверки</h2>
                <div id="aiResponse" class="response"></div>
                <div class="status" id="status"></div>
            </div>
        </div>
    </div>

    <!-- Библиотеки -->
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js"></script>
    <script src="knowledge-base2.js"></script>
    <script src="script2.js"></script>
    <script src="ai-processor2.js"></script>  
</body> 
</html> 
