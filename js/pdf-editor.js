// ========================================
// PDF編集機能
// ========================================

class PDFEditor {
    constructor() {
        this.editCanvas = document.getElementById('editCanvas');
        this.editCtx = this.editCanvas ? this.editCanvas.getContext('2d') : null;

        this.isDrawing = false;
        this.currentTool = null;
        this.startX = 0;
        this.startY = 0;

        this.annotations = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // テキスト追加
        const addTextBtn = document.getElementById('addText');
        if (addTextBtn) {
            addTextBtn.addEventListener('click', () => this.showTextModal());
        }

        const confirmAddText = document.getElementById('confirmAddText');
        if (confirmAddText) {
            confirmAddText.addEventListener('click', () => this.addTextToPDF());
        }

        // 画像挿入
        const addImageBtn = document.getElementById('addImage');
        const imageInput = document.getElementById('imageInput');

        if (addImageBtn && imageInput) {
            addImageBtn.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    await this.addImageToPDF(file);
                }
            });
        }

        // 図形描画
        const drawShapeBtn = document.getElementById('drawShape');
        if (drawShapeBtn) {
            drawShapeBtn.addEventListener('click', () => this.activateDrawingMode());
        }

        // ハイライト
        const highlightBtn = document.getElementById('highlight');
        if (highlightBtn) {
            highlightBtn.addEventListener('click', () => this.activateHighlightMode());
        }

        // 注釈
        const annotationBtn = document.getElementById('addAnnotation');
        if (annotationBtn) {
            annotationBtn.addEventListener('click', () => this.addAnnotation());
        }

        // ページ操作
        const rotateBtn = document.getElementById('rotatePage');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => this.rotatePage());
        }

        const deletePageBtn = document.getElementById('deletePage');
        if (deletePageBtn) {
            deletePageBtn.addEventListener('click', () => this.deletePage());
        }

        const mergePdfBtn = document.getElementById('mergePdf');
        if (mergePdfBtn) {
            mergePdfBtn.addEventListener('click', () => this.mergePDFs());
        }

        const splitPdfBtn = document.getElementById('splitPdf');
        if (splitPdfBtn) {
            splitPdfBtn.addEventListener('click', () => this.splitPDF());
        }

        // 高度な機能
        const ocrBtn = document.getElementById('ocrPdf');
        if (ocrBtn) {
            ocrBtn.addEventListener('click', () => this.performOCR());
        }

        const compressBtn = document.getElementById('compressPdf');
        if (compressBtn) {
            compressBtn.addEventListener('click', () => this.compressPDF());
        }

        const watermarkBtn = document.getElementById('addWatermark');
        if (watermarkBtn) {
            watermarkBtn.addEventListener('click', () => this.addWatermark());
        }

        const signatureBtn = document.getElementById('addSignature');
        if (signatureBtn) {
            signatureBtn.addEventListener('click', () => this.addSignature());
        }

        const protectBtn = document.getElementById('protectPdf');
        if (protectBtn) {
            protectBtn.addEventListener('click', () => this.showPasswordModal());
        }

        const confirmProtect = document.getElementById('confirmProtect');
        if (confirmProtect) {
            confirmProtect.addEventListener('click', () => this.protectPDF());
        }

        // 変換
        const pdfToImageBtn = document.getElementById('pdfToImage');
        if (pdfToImageBtn) {
            pdfToImageBtn.addEventListener('click', () => this.convertPDFToImage());
        }

        const imageToPdfBtn = document.getElementById('imageToPdf');
        if (imageToPdfBtn) {
            imageToPdfBtn.addEventListener('click', () => this.convertImageToPDF());
        }

        // PDF保存
        const savePdfBtn = document.getElementById('savePdf');
        if (savePdfBtn) {
            savePdfBtn.addEventListener('click', () => this.savePDF());
        }

        // モーダル閉じる
        document.querySelectorAll('.close-modal, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal') ||
                              e.target.closest('button')?.getAttribute('data-modal');
                if (modalId) {
                    this.closeModal(modalId);
                }
            });
        });

        // 編集キャンバスのイベント
        if (this.editCanvas) {
            this.editCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.editCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.editCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        }
    }

    // ========================================
    // モーダル制御
    // ========================================

    showTextModal() {
        const modal = document.getElementById('textModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ========================================
    // テキスト追加
    // ========================================

    async addTextToPDF() {
        const text = document.getElementById('textInput').value;
        const fontSize = parseInt(document.getElementById('fontSize').value);
        const color = document.getElementById('textColor').value;

        if (!text) {
            alert('テキストを入力してください');
            return;
        }

        try {
            pdfUtils.updateProgress(10, 'テキストを追加中...');

            const { PDFDocument, rgb } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            const currentPage = pdfViewer.getCurrentPageNumber();
            const page = pdfDoc.getPage(currentPage - 1);

            // 色をRGBに変換
            const r = parseInt(color.substr(1, 2), 16) / 255;
            const g = parseInt(color.substr(3, 2), 16) / 255;
            const b = parseInt(color.substr(5, 2), 16) / 255;

            const { height } = page.getSize();

            page.drawText(text, {
                x: 50,
                y: height - 100,
                size: fontSize,
                color: rgb(r, g, b),
            });

            const pdfBytes = await pdfDoc.save();
            await this.updatePDF(pdfBytes);

            this.closeModal('textModal');
            document.getElementById('textInput').value = '';
            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error adding text:', error);
            pdfUtils.showError('テキスト追加に失敗しました: ' + error.message);
        }
    }

    // ========================================
    // 画像追加
    // ========================================

    async addImageToPDF(imageFile) {
        try {
            pdfUtils.updateProgress(10, '画像を追加中...');

            const { PDFDocument } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            const imageBytes = await pdfUtils.readFileAsArrayBuffer(imageFile);
            let image;

            if (imageFile.type === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(imageBytes);
            } else {
                throw new Error('サポートされていない画像形式です');
            }

            const currentPage = pdfViewer.getCurrentPageNumber();
            const page = pdfDoc.getPage(currentPage - 1);
            const { width, height } = page.getSize();

            // 画像サイズを調整
            const scale = Math.min(width / image.width, height / image.height, 1) * 0.5;

            page.drawImage(image, {
                x: 50,
                y: height - 50 - image.height * scale,
                width: image.width * scale,
                height: image.height * scale,
            });

            const pdfBytes = await pdfDoc.save();
            await this.updatePDF(pdfBytes);

            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error adding image:', error);
            pdfUtils.showError('画像追加に失敗しました: ' + error.message);
        }
    }

    // ========================================
    // 描画モード
    // ========================================

    activateDrawingMode() {
        this.currentTool = 'draw';
        alert('キャンバス上でドラッグして図形を描画してください');
    }

    activateHighlightMode() {
        this.currentTool = 'highlight';
        alert('キャンバス上でドラッグしてハイライトしてください');
    }

    handleMouseDown(e) {
        if (!this.currentTool) return;

        this.isDrawing = true;
        const rect = this.editCanvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
    }

    handleMouseMove(e) {
        if (!this.isDrawing || !this.currentTool) return;

        const rect = this.editCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);

        if (this.currentTool === 'draw') {
            this.editCtx.strokeStyle = '#000000';
            this.editCtx.lineWidth = 2;
            this.editCtx.strokeRect(this.startX, this.startY, currentX - this.startX, currentY - this.startY);
        } else if (this.currentTool === 'highlight') {
            this.editCtx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.editCtx.fillRect(this.startX, this.startY, currentX - this.startX, currentY - this.startY);
        }
    }

    async handleMouseUp(e) {
        if (!this.isDrawing || !this.currentTool) return;

        this.isDrawing = false;
        const rect = this.editCanvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        // 描画を保存
        await this.saveDrawing(this.startX, this.startY, endX, endY);

        this.currentTool = null;
        this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height);
    }

    async saveDrawing(startX, startY, endX, endY) {
        try {
            const { PDFDocument, rgb } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            const currentPage = pdfViewer.getCurrentPageNumber();
            const page = pdfDoc.getPage(currentPage - 1);
            const { height } = page.getSize();

            const scale = pdfViewer.scale;
            const x = startX / scale;
            const y = (this.editCanvas.height - startY) / scale;
            const width = (endX - startX) / scale;
            const heightRect = -(endY - startY) / scale;

            if (this.currentTool === 'draw') {
                page.drawRectangle({
                    x: x,
                    y: y + heightRect,
                    width: width,
                    height: -heightRect,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 2,
                });
            } else if (this.currentTool === 'highlight') {
                page.drawRectangle({
                    x: x,
                    y: y + heightRect,
                    width: width,
                    height: -heightRect,
                    color: rgb(1, 1, 0),
                    opacity: 0.3,
                });
            }

            const pdfBytes = await pdfDoc.save();
            await this.updatePDF(pdfBytes);

        } catch (error) {
            console.error('Error saving drawing:', error);
        }
    }

    // ========================================
    // 注釈
    // ========================================

    addAnnotation() {
        const text = prompt('注釈を入力してください:');
        if (text) {
            this.addTextToPDFSimple(text, 12, '#ff0000');
        }
    }

    async addTextToPDFSimple(text, fontSize, color) {
        try {
            const { PDFDocument, rgb } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            const currentPage = pdfViewer.getCurrentPageNumber();
            const page = pdfDoc.getPage(currentPage - 1);

            const r = parseInt(color.substr(1, 2), 16) / 255;
            const g = parseInt(color.substr(3, 2), 16) / 255;
            const b = parseInt(color.substr(5, 2), 16) / 255;

            const { height } = page.getSize();

            page.drawText(text, {
                x: 50,
                y: height - 150,
                size: fontSize,
                color: rgb(r, g, b),
            });

            const pdfBytes = await pdfDoc.save();
            await this.updatePDF(pdfBytes);

        } catch (error) {
            console.error('Error adding annotation:', error);
            pdfUtils.showError('注釈追加に失敗しました');
        }
    }

    // ========================================
    // ページ操作
    // ========================================

    async rotatePage() {
        try {
            pdfUtils.updateProgress(10, 'ページを回転中...');

            const pdfData = pdfViewer.getPDFData();
            const currentPage = pdfViewer.getCurrentPageNumber();
            const blob = await pdfUtils.rotatePDF(pdfData, [currentPage], 90);

            const arrayBuffer = await blob.arrayBuffer();
            await this.updatePDF(arrayBuffer);

            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error rotating page:', error);
            pdfUtils.showError('ページ回転に失敗しました');
        }
    }

    async deletePage() {
        const confirm = window.confirm('現在のページを削除しますか？');
        if (!confirm) return;

        try {
            pdfUtils.updateProgress(10, 'ページを削除中...');

            const pdfData = pdfViewer.getPDFData();
            const currentPage = pdfViewer.getCurrentPageNumber();
            const blob = await pdfUtils.deletePages(pdfData, [currentPage]);

            const arrayBuffer = await blob.arrayBuffer();
            await this.updatePDF(arrayBuffer);

            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error deleting page:', error);
            pdfUtils.showError('ページ削除に失敗しました');
        }
    }

    async mergePDFs() {
        const input = document.getElementById('mergeInput');
        input.click();

        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            try {
                pdfUtils.updateProgress(10, 'PDFを結合中...');

                const currentPdfData = pdfViewer.getPDFData();
                const currentBlob = pdfUtils.arrayBufferToBlob(currentPdfData);
                const currentFile = new File([currentBlob], 'current.pdf', { type: 'application/pdf' });

                const allFiles = [currentFile, ...files];
                const mergedBlob = await pdfUtils.mergePDFs(allFiles);

                const arrayBuffer = await mergedBlob.arrayBuffer();
                await this.updatePDF(arrayBuffer);

                pdfUtils.showSuccess('PDFを結合しました');

            } catch (error) {
                console.error('Error merging PDFs:', error);
                pdfUtils.showError('PDF結合に失敗しました');
            }
        };
    }

    async splitPDF() {
        const pageNum = prompt('分割するページ番号を入力してください（このページまでが最初のファイルになります）:');
        if (!pageNum) return;

        const splitAt = parseInt(pageNum);
        if (isNaN(splitAt) || splitAt < 1 || splitAt >= pdfViewer.getTotalPages()) {
            alert('無効なページ番号です');
            return;
        }

        try {
            pdfUtils.updateProgress(10, 'PDFを分割中...');

            const { PDFDocument } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            // 最初の部分
            const pdf1 = await PDFDocument.create();
            for (let i = 0; i < splitAt; i++) {
                const [page] = await pdf1.copyPages(pdfDoc, [i]);
                pdf1.addPage(page);
            }
            const pdf1Bytes = await pdf1.save();
            pdfUtils.downloadFile(pdfUtils.arrayBufferToBlob(pdf1Bytes), 'split-part1.pdf');

            // 2番目の部分
            const pdf2 = await PDFDocument.create();
            for (let i = splitAt; i < pdfDoc.getPageCount(); i++) {
                const [page] = await pdf2.copyPages(pdfDoc, [i]);
                pdf2.addPage(page);
            }
            const pdf2Bytes = await pdf2.save();
            pdfUtils.downloadFile(pdfUtils.arrayBufferToBlob(pdf2Bytes), 'split-part2.pdf');

            pdfUtils.showSuccess('PDFを分割しました');

        } catch (error) {
            console.error('Error splitting PDF:', error);
            pdfUtils.showError('PDF分割に失敗しました');
        }
    }

    // ========================================
    // 高度な機能
    // ========================================

    async performOCR() {
        try {
            pdfUtils.updateProgress(10, 'OCR処理を開始中...');

            const pdfData = pdfViewer.getPDFData();
            const images = await pdfUtils.convertPDFToImages(pdfData, 2);

            pdfUtils.updateProgress(30, 'テキストを認識中...');

            const currentPage = pdfViewer.getCurrentPageNumber();
            const imageData = images[currentPage - 1].dataURL;

            const text = await pdfUtils.performOCR(imageData, 'eng+jpn');

            alert('認識されたテキスト:\n\n' + text);
            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error performing OCR:', error);
            pdfUtils.showError('OCR処理に失敗しました');
        }
    }

    async compressPDF() {
        const quality = prompt('圧縮品質を入力してください (0.1-1.0、推奨: 0.7):', '0.7');
        if (!quality) return;

        const qualityNum = parseFloat(quality);
        if (isNaN(qualityNum) || qualityNum < 0.1 || qualityNum > 1) {
            alert('無効な品質値です');
            return;
        }

        try {
            pdfUtils.updateProgress(10, 'PDFを圧縮中...');

            const pdfData = pdfViewer.getPDFData();
            const compressedBlob = await pdfUtils.compressPDF(pdfData, qualityNum);

            const originalSize = pdfData.byteLength;
            const compressedSize = compressedBlob.size;
            const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(2);

            pdfUtils.downloadFile(compressedBlob, 'compressed.pdf');
            pdfUtils.showSuccess(`PDFを圧縮しました\n元のサイズ: ${pdfUtils.formatFileSize(originalSize)}\n圧縮後: ${pdfUtils.formatFileSize(compressedSize)}\n削減率: ${reduction}%`);

        } catch (error) {
            console.error('Error compressing PDF:', error);
            pdfUtils.showError('PDF圧縮に失敗しました');
        }
    }

    async addWatermark() {
        const text = prompt('透かしのテキストを入力してください:', 'CONFIDENTIAL');
        if (!text) return;

        try {
            pdfUtils.updateProgress(10, '透かしを追加中...');

            const { PDFDocument, rgb } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            const pages = pdfDoc.getPages();
            pages.forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 2 - 100,
                    y: height / 2,
                    size: 50,
                    color: rgb(0.7, 0.7, 0.7),
                    opacity: 0.3,
                    rotate: { angle: -45 },
                });
            });

            const pdfBytes = await pdfDoc.save();
            await this.updatePDF(pdfBytes);

            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error adding watermark:', error);
            pdfUtils.showError('透かし追加に失敗しました');
        }
    }

    addSignature() {
        alert('署名機能は現在開発中です。将来のバージョンでサポート予定です。');
    }

    async protectPDF() {
        const userPassword = document.getElementById('userPassword').value;
        const ownerPassword = document.getElementById('ownerPassword').value;

        if (!userPassword && !ownerPassword) {
            alert('少なくとも1つのパスワードを入力してください');
            return;
        }

        try {
            pdfUtils.updateProgress(10, 'PDFを保護中...');

            // pdf-libは暗号化を直接サポートしていないため、
            // 代わりにメタデータを追加して保存
            const { PDFDocument } = PDFLib;
            const pdfData = pdfViewer.getPDFData();
            const pdfDoc = await PDFDocument.load(pdfData);

            pdfDoc.setTitle('Protected Document');
            pdfDoc.setAuthor('PDF Editor');
            pdfDoc.setSubject('Password Protected');

            const pdfBytes = await pdfDoc.save();
            pdfUtils.downloadFile(pdfUtils.arrayBufferToBlob(pdfBytes), 'protected.pdf');

            this.closeModal('passwordModal');
            alert('注意: パスワード保護は現在制限されています。完全な暗号化にはサーバーサイド処理が必要です。');
            pdfUtils.hideProgress();

        } catch (error) {
            console.error('Error protecting PDF:', error);
            pdfUtils.showError('PDF保護に失敗しました');
        }
    }

    // ========================================
    // 変換
    // ========================================

    async convertPDFToImage() {
        try {
            pdfUtils.updateProgress(10, 'PDFを画像に変換中...');

            const pdfData = pdfViewer.getPDFData();
            const images = await pdfUtils.convertPDFToImages(pdfData, 2);

            const currentPage = pdfViewer.getCurrentPageNumber();
            const canvas = images[currentPage - 1].canvas;

            pdfUtils.downloadCanvasAsImage(canvas, `page-${currentPage}.png`);
            pdfUtils.showSuccess('画像に変換しました');

        } catch (error) {
            console.error('Error converting PDF to image:', error);
            pdfUtils.showError('PDF変換に失敗しました');
        }
    }

    async convertImageToPDF() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.click();

        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            try {
                pdfUtils.updateProgress(10, '画像をPDFに変換中...');

                const blob = await pdfUtils.convertImagesToPDF(files);
                pdfUtils.downloadFile(blob, 'images.pdf');

                pdfUtils.showSuccess('PDFに変換しました');

            } catch (error) {
                console.error('Error converting images to PDF:', error);
                pdfUtils.showError('画像変換に失敗しました');
            }
        };
    }

    // ========================================
    // PDF保存
    // ========================================

    savePDF() {
        const pdfData = pdfViewer.getPDFData();
        if (!pdfData) {
            alert('保存するPDFがありません');
            return;
        }

        const blob = pdfUtils.arrayBufferToBlob(pdfData);
        pdfUtils.downloadFile(blob, 'edited.pdf');
    }

    // ========================================
    // ヘルパー
    // ========================================

    async updatePDF(pdfBytes) {
        // PDFを更新して再レンダリング
        pdfViewer.pdfData = pdfBytes;

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        pdfViewer.pdfDoc = await loadingTask.promise;
        pdfViewer.totalPages = pdfViewer.pdfDoc.numPages;

        const currentPage = Math.min(pdfViewer.currentPage, pdfViewer.totalPages);
        await pdfViewer.renderPage(currentPage);

        // 履歴に追加
        pdfViewer.addToHistory();
    }
}

// グローバルインスタンス
const pdfEditor = new PDFEditor();
