// ========================================
// Service Worker - オフライン対応
// ========================================

const CACHE_NAME = 'pdf-editor-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/pdf-viewer.js',
    '/js/pdf-editor.js',
    '/js/pdf-utils.js',
    '/js/i18n.js',
    '/manifest.json',
    // CDNリソース
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

// インストール
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching files');
                return cache.addAll(urlsToCache).catch((error) => {
                    console.error('[SW] Cache addAll error:', error);
                    // CDNリソースのキャッシュに失敗しても続行
                    return Promise.resolve();
                });
            })
    );
    self.skipWaiting();
});

// アクティベート
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチ
self.addEventListener('fetch', (event) => {
    // POSTリクエストはキャッシュしない
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }

                // ネットワークからフェッチ
                return fetch(event.request)
                    .then((response) => {
                        // レスポンスが有効でない場合はそのまま返す
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // 外部リソースもキャッシュ
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Fetch error:', error);
                        // オフライン時のフォールバック
                        return caches.match('/index.html');
                    });
            })
    );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-pdfs') {
        event.waitUntil(syncPDFs());
    }
});

// プッシュ通知
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    const options = {
        body: event.data ? event.data.text() : 'PDF編集完了',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: '開く'
            },
            {
                action: 'close',
                title: '閉じる'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('PDF編集ツール', options)
    );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// メッセージ受信
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

// ヘルパー関数
async function syncPDFs() {
    // バックグラウンド同期処理（将来の拡張用）
    console.log('[SW] Syncing PDFs...');
    return Promise.resolve();
}

// 定期バックグラウンド同期
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

async function updateCache() {
    console.log('[SW] Updating cache...');
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    return Promise.all(
        requests.map(async (request) => {
            try {
                const response = await fetch(request);
                if (response && response.status === 200) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.error('[SW] Update cache error:', error);
            }
        })
    );
}
