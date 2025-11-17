// ========================================
// PDFユーティリティ関数
// ========================================

class PDFUtils {
    constructor() {
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
    }

    /**
     * ファイルサイズを人間が読める形式に変換
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * ファイルサイズをチェック
     */
    checkFileSize(file) {
        if (file.size > this.maxFileSize) {
            alert(i18n.translate('file-too-large'));
            return false;
        }
        return true;
    }

    /**
     * ファイルをArrayBufferとして読み込む
     */
    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * ファイルをDataURLとして読み込む
     */
    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * ArrayBufferをBlobに変換
     */
    arrayBufferToBlob(buffer, type = 'application/pdf') {
        return new Blob([buffer], { type });
    }

    /**
     * BlobをダウンロードDataURLに変換
     */
    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * ファイルをダウンロード
     */
    downloadFile(blob, filename = 'document.pdf') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Canvasを画像としてダウンロード
     */
    downloadCanvasAsImage(canvas, filename = 'page.png', format = 'image/png') {
        canvas.toBlob((blob) => {
            this.downloadFile(blob, filename);
        }, format);
    }

    /**
     * 画像をCanvasに描画
     */
    async drawImageToCanvas(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = reject;

            this.readFileAsDataURL(imageFile).then(dataURL => {
                img.src = dataURL;
            });
        });
    }

    /**
     * 複数のPDFを結合
     */
    async mergePDFs(pdfFiles) {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        return this.arrayBufferToBlob(mergedPdfBytes);
    }

    /**
     * PDFを画像に変換
     */
    async convertPDFToImages(pdfData, scale = 2) {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        const images = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const dataURL = canvas.toDataURL('image/png');
            images.push({ pageNum: i, dataURL, canvas });
        }

        return images;
    }

    /**
     * 画像をPDFに変換
     */
    async convertImagesToPDF(imageFiles) {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();

        for (const file of imageFiles) {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            let image;

            // 画像タイプに応じて埋め込み
            if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else {
                console.error('Unsupported image format:', file.type);
                continue;
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        return this.arrayBufferToBlob(pdfBytes);
    }

    /**
     * PDFを圧縮（画質を下げる）
     */
    async compressPDF(pdfData, quality = 0.7) {
        const { PDFDocument } = PDFLib;

        // まず画像に変換してから再度PDFにする（圧縮効果）
        const images = await this.convertPDFToImages(pdfData, quality);
        const pdfDoc = await PDFDocument.create();

        for (const { canvas } of images) {
            const dataURL = canvas.toDataURL('image/jpeg', quality);
            const imageBytes = await fetch(dataURL).then(res => res.arrayBuffer());
            const image = await pdfDoc.embedJpg(imageBytes);

            const page = pdfDoc.addPage([canvas.width, canvas.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
            });
        }

        const compressedPdfBytes = await pdfDoc.save();
        return this.arrayBufferToBlob(compressedPdfBytes);
    }

    /**
     * PDFページを回転
     */
    async rotatePDF(pdfData, pageNumbers, degrees) {
        const { PDFDocument, degrees: Degrees } = PDFLib;
        const pdfDoc = await PDFDocument.load(pdfData);
        const pages = pdfDoc.getPages();

        pageNumbers.forEach(pageNum => {
            if (pageNum > 0 && pageNum <= pages.length) {
                const page = pages[pageNum - 1];
                const currentRotation = page.getRotation().angle;
                page.setRotation(Degrees((currentRotation + degrees) % 360));
            }
        });

        const pdfBytes = await pdfDoc.save();
        return this.arrayBufferToBlob(pdfBytes);
    }

    /**
     * PDFからページを削除
     */
    async deletePages(pdfData, pageNumbers) {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(pdfData);

        // 降順でソートして削除（インデックスがずれないように）
        pageNumbers.sort((a, b) => b - a);

        pageNumbers.forEach(pageNum => {
            if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
                pdfDoc.removePage(pageNum - 1);
            }
        });

        const pdfBytes = await pdfDoc.save();
        return this.arrayBufferToBlob(pdfBytes);
    }

    /**
     * OCR処理（Tesseract.js使用）
     */
    async performOCR(imageData, lang = 'eng+jpn') {
        const result = await Tesseract.recognize(
            imageData,
            lang,
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        this.updateProgress(m.progress * 100);
                    }
                }
            }
        );
        return result.data.text;
    }

    /**
     * プログレスバーを更新
     */
    updateProgress(percentage, text) {
        const container = document.getElementById('progressContainer');
        const fill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (container && fill) {
            container.style.display = 'block';
            fill.style.width = percentage + '%';
            if (progressText && text) {
                progressText.textContent = text;
            }
        }
    }

    /**
     * プログレスバーを非表示
     */
    hideProgress() {
        const container = document.getElementById('progressContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Web Worker使用可能かチェック
     */
    supportsWebWorkers() {
        return typeof Worker !== 'undefined';
    }

    /**
     * WebAssembly使用可能かチェック
     */
    supportsWebAssembly() {
        return typeof WebAssembly !== 'undefined';
    }

    /**
     * エラーを表示
     */
    showError(message) {
        alert(message || i18n.translate('error'));
        this.hideProgress();
    }

    /**
     * 成功メッセージを表示
     */
    showSuccess(message) {
        alert(message || i18n.translate('success'));
        this.hideProgress();
    }
}

// グローバルインスタンス
const pdfUtils = new PDFUtils();
