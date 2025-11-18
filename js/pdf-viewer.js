// ========================================
// PDFビューアー
// ========================================

// PDF.jsのワーカー設定
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFViewer {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.rotation = 0;
        this.pdfData = null;

        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.renderTask = null;
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // ファイル選択
        const fileInput = document.getElementById('fileInput');
        const openFileBtn = document.getElementById('openFile');
        const selectFileBtn = document.getElementById('selectFile');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type === 'application/pdf') {
                    this.loadPDF(file);
                }
            });
        }

        [openFileBtn, selectFileBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    fileInput.click();
                });
            }
        });

        // ナビゲーション
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const currentPageInput = document.getElementById('currentPage');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        if (currentPageInput) {
            currentPageInput.addEventListener('change', (e) => {
                const pageNum = parseInt(e.target.value);
                if (pageNum > 0 && pageNum <= this.totalPages) {
                    this.goToPage(pageNum);
                }
            });
        }

        // ズーム
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }

        // 元に戻す・やり直し
        const undoBtn = document.getElementById('undo');
        const redoBtn = document.getElementById('redo');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '=':
                    case '+':
                        e.preventDefault();
                        this.zoomIn();
                        break;
                    case '-':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                    case '0':
                        e.preventDefault();
                        this.resetZoom();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                }
            } else {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'PageUp':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                    case 'PageDown':
                        e.preventDefault();
                        this.nextPage();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToPage(1);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToPage(this.totalPages);
                        break;
                }
            }
        });
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.loadPDF(files[0]);
            }
        });
    }

    async loadPDF(file) {
        try {
            pdfUtils.updateProgress(10, i18n.translate('loading'));

            if (!pdfUtils.checkFileSize(file)) {
                pdfUtils.hideProgress();
                return;
            }

            this.pdfData = await pdfUtils.readFileAsArrayBuffer(file);
            pdfUtils.updateProgress(30);

            const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;

            pdfUtils.updateProgress(60);

            // UIを更新
            document.getElementById('totalPages').textContent = this.totalPages;
            document.getElementById('dropZone').style.display = 'none';
            document.getElementById('pdfCanvasWrapper').style.display = 'flex';

            // 最初のページを表示
            await this.renderPage(1);

            // サムネイルを生成
            await this.generateThumbnails();

            // 履歴に追加
            this.addToHistory();

            pdfUtils.updateProgress(100);
            setTimeout(() => pdfUtils.hideProgress(), 500);

        } catch (error) {
            console.error('Error loading PDF:', error);
            pdfUtils.showError('PDFの読み込みに失敗しました: ' + error.message);
        }
    }

    async renderPage(pageNum) {
        if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) {
            return;
        }

        try {
            // 既存のレンダリングをキャンセル
            if (this.renderTask) {
                this.renderTask.cancel();
            }

            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale, rotation: this.rotation });

            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            // 編集キャンバスもリサイズ
            const editCanvas = document.getElementById('editCanvas');
            if (editCanvas) {
                editCanvas.width = viewport.width;
                editCanvas.height = viewport.height;
            }

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            this.renderTask = page.render(renderContext);
            await this.renderTask.promise;
            this.renderTask = null;

            this.currentPage = pageNum;
            document.getElementById('currentPage').value = pageNum;

            // ナビゲーションボタンの状態を更新
            this.updateNavigationButtons();

        } catch (error) {
            if (error.name === 'RenderingCancelledException') {
                console.log('Rendering cancelled');
            } else {
                console.error('Error rendering page:', error);
            }
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }

    async generateThumbnails() {
        const thumbnailList = document.getElementById('thumbnailList');
        if (!thumbnailList) return;

        thumbnailList.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const page = await this.pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'thumbnail-item';
            if (i === this.currentPage) {
                thumbnailItem.classList.add('active');
            }

            thumbnailItem.appendChild(canvas);
            thumbnailItem.addEventListener('click', () => {
                this.goToPage(i);
            });

            thumbnailList.appendChild(thumbnailItem);
        }
    }

    updateThumbnailSelection() {
        const thumbnails = document.querySelectorAll('.thumbnail-item');
        thumbnails.forEach((thumb, index) => {
            if (index + 1 === this.currentPage) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.renderPage(pageNum);
            this.updateThumbnailSelection();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    zoomIn() {
        this.scale = Math.min(this.scale + 0.25, 3.0);
        this.renderPage(this.currentPage);
        this.updateZoomLevel();
    }

    zoomOut() {
        this.scale = Math.max(this.scale - 0.25, 0.5);
        this.renderPage(this.currentPage);
        this.updateZoomLevel();
    }

    resetZoom() {
        this.scale = 1.5;
        this.renderPage(this.currentPage);
        this.updateZoomLevel();
    }

    updateZoomLevel() {
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        }
    }

    rotate(degrees) {
        this.rotation = (this.rotation + degrees) % 360;
        this.renderPage(this.currentPage);
    }

    addToHistory() {
        // 履歴管理（簡易版）
        this.history = this.history.slice(0, this.historyIndex + 1);

        // pdfDataのコピーを保存（detached問題を回避）
        let pdfDataCopy;
        if (this.pdfData instanceof ArrayBuffer) {
            pdfDataCopy = this.pdfData.slice(0);
        } else if (this.pdfData instanceof Uint8Array) {
            pdfDataCopy = new Uint8Array(this.pdfData).buffer;
        } else {
            pdfDataCopy = this.pdfData;
        }

        this.history.push({
            pdfData: pdfDataCopy,
            currentPage: this.currentPage
        });
        this.historyIndex++;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
        }
    }

    async restoreState(state) {
        this.pdfData = state.pdfData;
        const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
        this.pdfDoc = await loadingTask.promise;
        this.totalPages = this.pdfDoc.numPages;
        await this.renderPage(state.currentPage);
    }

    getPDFData() {
        // ArrayBufferのコピーを返す（detached問題を回避）
        if (this.pdfData instanceof ArrayBuffer) {
            return this.pdfData.slice(0);
        }
        // Uint8Arrayの場合もコピーを返す
        if (this.pdfData instanceof Uint8Array) {
            return new Uint8Array(this.pdfData).buffer;
        }
        return this.pdfData;
    }

    getCurrentPageNumber() {
        return this.currentPage;
    }

    getTotalPages() {
        return this.totalPages;
    }
}

// グローバルインスタンス
const pdfViewer = new PDFViewer();
