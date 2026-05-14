# https-awsq.codeberg.page-bot64-project
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Чат‑бот для проверки ДЗ</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Чат‑бот проверки домашнего задания</h1>
        
        <div class="chat-container" id="chatContainer">
            <div class="message bot">Привет! Я помогу проверить ваше домашнее задание. Используйте сканер или введите ответ вручную.</div>
        </div>

        <div class="input-area">
            <input type="text" id="userInput" placeholder="Введите ответ или используйте сканер">
            <button id="sendBtn">Отправить</button>
            <button id="scanBtn">🔎 Сканировать</button>
        </div>

        <!-- Модальное окно сканера -->
        <div id="scannerModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Сканирование задания</h3>
                <video id="video" autoplay></video>
                <button id="captureBtn">Сделать снимок</button>
                <canvas id="canvas" style="display: none;"></canvas>
                <div id="scannedText"></div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/2.1.5/tesseract.min.js"></script>

</body>
</html>


