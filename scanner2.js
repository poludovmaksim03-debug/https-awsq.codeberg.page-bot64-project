class DocumentScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.stream = null;
        this.isCameraActive = false;
    }

    async startCamera() {
        try {
            if (this.isCameraActive) return true;

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Браузер не поддерживает доступ к камере');
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
            width: { ideal: 9920 },
            height: { ideal: 9080 }
                }
            });

            if (this.video) {
                this.video.srcObject = this.stream;
                this.isCameraActive = true;
                return true;
            } else {
                throw new Error('Видеоэлемент не найден в DOM');
            }
        } catch (error) {
            console.error('Ошибка доступа к камере:', error);

            if (error.name === 'NotAllowedError') {
                alert('Доступ к камере отклонён. Разрешите доступ в настройках браузера.');
            } else if (error.name === 'NotFoundError') {
                alert('Камера не найдена. Проверьте подключение камеры.');
            } else {
                alert(`Ошибка камеры: ${error.message}`);
            }
            return false;
        }
    }

    captureFrame() {
        if (!this.isCameraActive || !this.stream) {
            throw new Error('Камера не активна. Сначала запустите камеру.');
        }

        if (!this.video || !this.video.videoWidth || !this.video.videoHeight) {
            throw new Error('Видеопоток недоступен или имеет некорректные размеры.');
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.context.drawImage(this.video, 0, 0);
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    stopCamera() {
        if (this.stream && this.isCameraActive) {
            const tracks = this.stream.getTracks();
            tracks.forEach(track => track.stop());
            if (this.video) this.video.srcObject = null;
            this.isCameraActive = false;
        }
    }

    destroy() {
        this.stopCamera();
        this.context = null;
        this.canvas = null;
        this.video = null;
    }
}

export default DocumentScanner;
