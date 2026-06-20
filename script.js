 window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("app-splash")?.remove();
    }, 2000); // 2 seconds
});

// ============================================
        // INDEXEDDB DATABASE
        // ============================================
        class GalleryDB {
            constructor() {
                this.db = null;
                this.dbName = 'HorizonGalleryDB';
                this.dbVersion = 1;
            }

            async init() {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open(this.dbName, this.dbVersion);

                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => {
                        this.db = request.result;
                        resolve(this.db);
                    };

                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;

                        if (!db.objectStoreNames.contains('images')) {
                            const imageStore = db.createObjectStore('images', { keyPath: 'id' });
                            imageStore.createIndex('folderId', 'folderId');
                            imageStore.createIndex('createdDate', 'createdDate');
                            imageStore.createIndex('name', 'name');
                        }

                        if (!db.objectStoreNames.contains('folders')) {
                            const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
                            folderStore.createIndex('parentId', 'parentId');
                        }

                        if (!db.objectStoreNames.contains('favorites')) {
                            db.createObjectStore('favorites', { keyPath: 'imageId' });
                        }

                        if (!db.objectStoreNames.contains('starred')) {
                            db.createObjectStore('starred', { keyPath: 'imageId' });
                        }

                        if (!db.objectStoreNames.contains('recycleBin')) {
                            const binStore = db.createObjectStore('recycleBin', { keyPath: 'id' });
                            binStore.createIndex('deleteDate', 'deleteDate');
                        }

                        if (!db.objectStoreNames.contains('settings')) {
                            db.createObjectStore('settings', { keyPath: 'key' });
                        }
                    };
                });
            }

            async addImage(imageData) {
                const transaction = this.db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                return new Promise((resolve, reject) => {
                    const request = store.add(imageData);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async getImage(id) {
                const transaction = this.db.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                return new Promise((resolve, reject) => {
                    const request = store.get(id);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async getAllImages() {
                const transaction = this.db.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async getImagesByFolder(folderId) {
                const transaction = this.db.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                const index = store.index('folderId');
                return new Promise((resolve, reject) => {
                    const request = index.getAll(folderId);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async deleteImage(id) {
                const transaction = this.db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                return new Promise((resolve, reject) => {
                    const request = store.delete(id);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async updateImage(imageData) {
                const transaction = this.db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                return new Promise((resolve, reject) => {
                    const request = store.put(imageData);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async addFolder(folderData) {
                const transaction = this.db.transaction(['folders'], 'readwrite');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.add(folderData);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async getFolders() {
                const transaction = this.db.transaction(['folders'], 'readonly');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async updateFolder(folderData) {
                const transaction = this.db.transaction(['folders'], 'readwrite');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.put(folderData);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async deleteFolder(id) {
                const transaction = this.db.transaction(['folders'], 'readwrite');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.delete(id);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async addToFavorites(imageId) {
                const transaction = this.db.transaction(['favorites'], 'readwrite');
                const store = transaction.objectStore('favorites');
                return new Promise((resolve, reject) => {
                    const request = store.add({ imageId, addedDate: new Date().toISOString() });
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async removeFromFavorites(imageId) {
                const transaction = this.db.transaction(['favorites'], 'readwrite');
                const store = transaction.objectStore('favorites');
                return new Promise((resolve, reject) => {
                    const request = store.delete(imageId);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async getAllFavorites() {
                const transaction = this.db.transaction(['favorites'], 'readonly');
                const store = transaction.objectStore('favorites');
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async isFavorite(imageId) {
                const transaction = this.db.transaction(['favorites'], 'readonly');
                const store = transaction.objectStore('favorites');
                return new Promise((resolve, reject) => {
                    const request = store.get(imageId);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(!!request.result);
                });
            }

            async addToStarred(imageId) {
                const transaction = this.db.transaction(['starred'], 'readwrite');
                const store = transaction.objectStore('starred');
                return new Promise((resolve, reject) => {
                    const request = store.add({ imageId, addedDate: new Date().toISOString() });
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async removeFromStarred(imageId) {
                const transaction = this.db.transaction(['starred'], 'readwrite');
                const store = transaction.objectStore('starred');
                return new Promise((resolve, reject) => {
                    const request = store.delete(imageId);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async getAllStarred() {
                const transaction = this.db.transaction(['starred'], 'readonly');
                const store = transaction.objectStore('starred');
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async isStarred(imageId) {
                const transaction = this.db.transaction(['starred'], 'readonly');
                const store = transaction.objectStore('starred');
                return new Promise((resolve, reject) => {
                    const request = store.get(imageId);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(!!request.result);
                });
            }

            async moveToTrash(imageData) {
                const transaction = this.db.transaction(['recycleBin'], 'readwrite');
                const store = transaction.objectStore('recycleBin');
                return new Promise((resolve, reject) => {
                    const request = store.add({
                        ...imageData,
                        deleteDate: new Date().toISOString(),
                        originalId: imageData.id
                    });
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async getTrashItems() {
                const transaction = this.db.transaction(['recycleBin'], 'readonly');
                const store = transaction.objectStore('recycleBin');
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });
            }

            async clearTrash() {
                const transaction = this.db.transaction(['recycleBin'], 'readwrite');
                const store = transaction.objectStore('recycleBin');
                return new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async saveSetting(key, value) {
                const transaction = this.db.transaction(['settings'], 'readwrite');
                const store = transaction.objectStore('settings');
                return new Promise((resolve, reject) => {
                    const request = store.put({ key, value });
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async getSetting(key) {
                const transaction = this.db.transaction(['settings'], 'readonly');
                const store = transaction.objectStore('settings');
                return new Promise((resolve, reject) => {
                    const request = store.get(key);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result?.value);
                });
            }

            async clearAll() {
                const stores = ['images', 'folders', 'favorites', 'starred', 'recycleBin'];
                for (const store of stores) {
                    const transaction = this.db.transaction([store], 'readwrite');
                    const objectStore = transaction.objectStore(store);
                    await new Promise((resolve, reject) => {
                        const request = objectStore.clear();
                        request.onerror = () => reject(request.error);
                        request.onsuccess = () => resolve();
                    });
                }
            }
        }

        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        const Utils = {
            generateId() {
                return '_' + Math.random().toString(36).substr(2, 9) + Date.now();
            },

            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
            },

            formatDate(date) {
                return new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },

            async fileToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            },

            getImageDimensions(src) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({ width: img.width, height: img.height });
                    };
                    img.src = src;
                });
            },

            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        };

        // ============================================
        // TOAST NOTIFICATION
        // ============================================
        class Toast {
            static show(message, type = 'info', duration = 3000) {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;

                const icons = {
                    error: 'exclamation-circle',
                    success: 'check-circle',
                    warning: 'exclamation-triangle',
                    info: 'info-circle'
                };

                toast.innerHTML = `
                    <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                    <span>${message}</span>
                `;
                container.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = 'slideInRight 0.3s ease reverse';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }
        }

        // ============================================
        // MAIN APPLICATION
        // ============================================
        class HorizonGallery {
            constructor() {
                this.db = new GalleryDB();
                this.currentFolder = 'all';
                this.currentImages = [];
                this.selectedImages = new Set();
                this.viewMode = 'grid';
                this.currentImageIndex = 0;
                this.zoom = 1;
                this.rotation = 0;
                this.searchQuery = '';
                this.accentColor = '#00d4ff';
            }

            async init() {
                try {
                    await this.db.init();
                    await this.createDefaultFolders();
                    this.setupEventListeners();
                    await this.loadSettings();
                    await this.loadGallery('all');
                    await this.updateBadges();
                    await this.renderFolderTree();
                    this.setupThemeColors();
                    Toast.show('Gallery loaded successfully', 'success');
                } catch (error) {
                    console.error('Initialization error:', error);
                    Toast.show('Error initializing gallery', 'error');
                }
            }

            async createDefaultFolders() {
                const folders = await this.db.getFolders();
                if (folders.length === 0) {
                    const defaultFolders = [
                        { id: 'camera-roll', name: 'Camera Roll', parentId: null, type: 'default' },
                        { id: 'screenshots', name: 'Screenshots', parentId: null, type: 'default' },
                        { id: 'downloads', name: 'Downloads', parentId: null, type: 'default' },
                    ];

                    for (const folder of defaultFolders) {
                        await this.db.addFolder(folder);
                    }
                }
            }

            setupEventListeners() {
                // Menu
                document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar());
                document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());

                // Upload
                document.getElementById('uploadBtn').addEventListener('click', () => this.openUploadModal());
                document.getElementById('uploadBtnEmpty').addEventListener('click', () => this.openUploadModal());

                // Upload Zone
                const uploadZone = document.getElementById('uploadZone');
                uploadZone.addEventListener('click', () => document.getElementById('fileInput').click());
                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadZone.style.background = 'rgba(0, 212, 255, 0.15)';
                    uploadZone.style.borderColor = '#00b8d4';
                });
                uploadZone.addEventListener('dragleave', () => {
                    uploadZone.style.background = 'rgba(0, 212, 255, 0.05)';
                    uploadZone.style.borderColor = 'var(--accent)';
                });
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadZone.style.background = 'rgba(0, 212, 255, 0.05)';
                    uploadZone.style.borderColor = 'var(--accent)';
                    this.handleFiles(e.dataTransfer.files);
                });

                document.getElementById('fileInput').addEventListener('change', (e) => {
                    this.handleFiles(e.target.files);
                });

                // Sidebar items
                document.querySelectorAll('[data-folder]').forEach(item => {
                    item.addEventListener('click', async (e) => {
                        document.querySelectorAll('[data-folder]').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        const folder = item.dataset.folder;
                        this.currentFolder = folder;
                        await this.loadGallery(folder);
                    });
                });

                // Search
                const searchInput = document.getElementById('searchInput');
                searchInput.addEventListener('input', Utils.debounce(async (e) => {
                    this.searchQuery = e.target.value.toLowerCase();
                    await this.performSearch();
                }, 300));

                // Lightbox
                document.getElementById('lightboxClose').addEventListener('click', () => this.closeLightbox());
                document.getElementById('lightboxPrev').addEventListener('click', () => this.prevImage());
                document.getElementById('lightboxNext').addEventListener('click', () => this.nextImage());
                document.getElementById('lightboxZoomIn').addEventListener('click', () => this.zoomImage(1.2));
                document.getElementById('lightboxZoomOut').addEventListener('click', () => this.zoomImage(0.8));
                document.getElementById('lightboxRotateLeft').addEventListener('click', () => this.rotateImage(-90));
                document.getElementById('lightboxRotateRight').addEventListener('click', () => this.rotateImage(90));
                document.getElementById('lightboxFavorite').addEventListener('click', () => this.toggleFavorite());
                document.getElementById('lightboxStar').addEventListener('click', () => this.toggleStar());
                document.getElementById('lightboxDetails').addEventListener('click', () => this.showImageDetails());
                document.getElementById('lightboxDownload').addEventListener('click', () => this.downloadImage());
                document.getElementById('lightboxShare').addEventListener('click', () => this.shareImage());
                document.getElementById('lightboxDelete').addEventListener('click', () => this.deleteCurrentImage());

                // View mode
                document.getElementById('viewModeBtn').addEventListener('click', () => this.toggleViewMode());

                // Keyboard
                document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

                // Add folder
                document.getElementById('addFolderBtn').addEventListener('click', () => this.promptNewFolder());

                // Settings
                document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

                // Delete selected
                document.getElementById('deleteSelectedBtn').addEventListener('click', () => this.deleteSelected());

                // Theme toggle
                document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleTheme());

                // Clear cache
                document.getElementById('clearCacheBtn').addEventListener('click', () => this.promptClearCache());
            }

            toggleSidebar() {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('collapsed');
            }

            async loadGallery(folder) {
                try {
                    const galleryContent = document.getElementById('galleryContent');
                    galleryContent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%;"><div class="spinner"></div></div>';

                    let images = [];

                    if (folder === 'all') {
                        images = await this.db.getAllImages();
                    } else if (folder === 'favorites') {
                        const favorites = await this.db.getAllFavorites();
                        const favoriteIds = favorites.map(f => f.imageId);
                        const allImages = await this.db.getAllImages();
                        images = allImages.filter(img => favoriteIds.includes(img.id));
                    } else if (folder === 'starred') {
                        const starred = await this.db.getAllStarred();
                        const starredIds = starred.map(s => s.imageId);
                        const allImages = await this.db.getAllImages();
                        images = allImages.filter(img => starredIds.includes(img.id));
                    } else if (folder === 'recent') {
                        const allImages = await this.db.getAllImages();
                        images = allImages.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
                    } else if (folder === 'trash') {
                        images = await this.db.getTrashItems();
                    } else {
                        images = await this.db.getImagesByFolder(folder);
                    }

                    this.currentImages = images;
                    this.selectedImages.clear();
                    document.getElementById('deleteSelectedBtn').style.display = 'none';

                    if (images.length === 0) {
                        galleryContent.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <i class="fas fa-${folder === 'trash' ? 'trash' : 'image'}"></i>
                                </div>
                                <div class="empty-state-title">${folder === 'trash' ? 'Trash is empty' : 'No photos in this folder'}</div>
                                <div class="empty-state-text">
                                    ${folder === 'trash' ? 'Deleted files will appear here' : 'Upload your first photo to get started'}
                                </div>
                                ${folder !== 'trash' ? '<button class="btn-primary-custom" onclick="gallery.openUploadModal()"><i class="fas fa-cloud-upload-alt"></i> Upload Photos</button>' : ''}
                            </div>
                        `;
                        return;
                    }

                    this.renderGallery(images);
                } catch (error) {
                    console.error('Error loading gallery:', error);
                    Toast.show('Error loading gallery', 'error');
                }
            }

            renderGallery(images) {
                const galleryContent = document.getElementById('galleryContent');
                galleryContent.innerHTML = '';

                const grid = document.createElement('div');
                grid.className = 'gallery-grid';

                images.forEach((image, index) => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';

                    const isSelected = this.selectedImages.has(image.id);
                    if (isSelected) {
                        item.classList.add('selected');
                    }

                    item.innerHTML = `
                        <img src="${image.thumbnail || image.dataUrl}" alt="${image.name}" loading="lazy">
                        <div class="gallery-item-overlay">
                            <button class="gallery-item-btn" title="View">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    `;

                    item.addEventListener('click', (e) => {
                        if (e.ctrlKey || e.metaKey) {
                            this.toggleImageSelection(image.id, item);
                        } else {
                            this.openLightbox(index);
                        }
                    });

                    grid.appendChild(item);
                });

                galleryContent.appendChild(grid);
            }

            toggleImageSelection(imageId, element) {
                if (this.selectedImages.has(imageId)) {
                    this.selectedImages.delete(imageId);
                    element.classList.remove('selected');
                } else {
                    this.selectedImages.add(imageId);
                    element.classList.add('selected');
                }

                document.getElementById('deleteSelectedBtn').style.display = 
                    this.selectedImages.size > 0 ? 'flex' : 'none';
            }

            async deleteSelected() {
                const count = this.selectedImages.size;
                document.getElementById('confirmTitle').textContent = 'Delete Images';
                document.getElementById('confirmMessage').textContent = 
                    `Are you sure you want to delete ${count} image${count > 1 ? 's' : ''}?`;

                document.getElementById('confirmBtn').onclick = async () => {
                    for (const imageId of this.selectedImages) {
                        const image = this.currentImages.find(img => img.id === imageId);
                        if (image) {
                            await this.db.moveToTrash(image);
                            await this.db.deleteImage(imageId);
                        }
                    }

                    this.selectedImages.clear();
                    document.getElementById('deleteSelectedBtn').style.display = 'none';
                    await this.loadGallery(this.currentFolder);
                    await this.updateBadges();
                    Toast.show(`${count} image${count > 1 ? 's' : ''} moved to trash`, 'success');
                    closeModal('confirmModal');
                };

                openModal('confirmModal');
            }

            openLightbox(index) {
                this.currentImageIndex = index;
                const image = this.currentImages[index];
                document.getElementById('lightboxImage').src = image.dataUrl;
                this.updateLightboxInfo(image);
                document.getElementById('lightboxBackdrop').classList.add('active');
                this.zoom = 1;
                this.rotation = 0;
            }

            closeLightbox() {
                document.getElementById('lightboxBackdrop').classList.remove('active');
            }

            updateLightboxInfo(image) {
                document.getElementById('infoName').textContent = image.name;
                document.getElementById('infoSize').textContent = `Size: ${Utils.formatFileSize(image.size)}`;
                document.getElementById('infoResolution').textContent = `Resolution: ${image.width}x${image.height}`;
                document.getElementById('infoDate').textContent = `Date: ${Utils.formatDate(image.createdDate)}`;
                document.getElementById('infoLocation').textContent = `Folder: ${image.folderId}`;
            }

            nextImage() {
                if (this.currentImageIndex < this.currentImages.length - 1) {
                    this.openLightbox(this.currentImageIndex + 1);
                }
            }

            prevImage() {
                if (this.currentImageIndex > 0) {
                    this.openLightbox(this.currentImageIndex - 1);
                }
            }

            zoomImage(factor) {
                this.zoom *= factor;
                this.zoom = Math.max(0.5, Math.min(this.zoom, 5));
                const img = document.getElementById('lightboxImage');
                img.style.transform = `scale(${this.zoom}) rotate(${this.rotation}deg)`;
                Toast.show(`Zoom: ${Math.round(this.zoom * 100)}%`, 'info', 1000);
            }

            rotateImage(angle) {
                this.rotation = (this.rotation + angle + 360) % 360;
                const img = document.getElementById('lightboxImage');
                img.style.transform = `scale(${this.zoom}) rotate(${this.rotation}deg)`;
                Toast.show(`Rotated ${angle > 0 ? '↻' : '↺'} ${Math.abs(angle)}°`, 'info', 1000);
            }

            async toggleFavorite() {
                const image = this.currentImages[this.currentImageIndex];
                const isFav = await this.db.isFavorite(image.id);

                if (isFav) {
                    await this.db.removeFromFavorites(image.id);
                    Toast.show(`Removed "${image.name}" from favorites`, 'info');
                } else {
                    await this.db.addToFavorites(image.id);
                    Toast.show(`Added "${image.name}" to favorites`, 'success');
                }

                await this.updateBadges();
            }

            async toggleStar() {
                const image = this.currentImages[this.currentImageIndex];
                const isStarred = await this.db.isStarred(image.id);

                if (isStarred) {
                    await this.db.removeFromStarred(image.id);
                    Toast.show(`Star removed from "${image.name}"`, 'info');
                } else {
                    await this.db.addToStarred(image.id);
                    image.folderId = 'starred';
                    await this.db.updateImage(image);
                    Toast.show(`"${image.name}" moved to Starred folder`, 'success');
                }

                await this.updateBadges();
            }

            showImageDetails() {
                const image = this.currentImages[this.currentImageIndex];
                const detailsContent = document.getElementById('detailsContent');

                detailsContent.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <img src="${image.dataUrl}" alt="${image.name}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                    </div>

                    <div class="image-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">File Name</div>
                            <div class="detail-value">${image.name}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">File Size</div>
                            <div class="detail-value">${Utils.formatFileSize(image.size)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Dimensions</div>
                            <div class="detail-value">${image.width} × ${image.height}px</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">File Type</div>
                            <div class="detail-value">${image.type || 'Image'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Created</div>
                            <div class="detail-value">${Utils.formatDate(image.createdDate)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Modified</div>
                            <div class="detail-value">${Utils.formatDate(image.modifiedDate)}</div>
                        </div>
                        <div class="detail-item" style="grid-column: 1 / -1;">
                            <div class="detail-label">Folder Location</div>
                            <div class="detail-value">${image.folderId}</div>
                        </div>
                    </div>
                `;

                openModal('detailsModal');
            }

            downloadImage() {
                const image = this.currentImages[this.currentImageIndex];
                const link = document.createElement('a');
                link.href = image.dataUrl;
                link.download = image.name;
                link.click();
                Toast.show(`Downloaded "${image.name}"`, 'success');
            }

            async shareImage() {
                const image = this.currentImages[this.currentImageIndex];

                if (navigator.share) {
                    try {
                        const blob = await fetch(image.dataUrl).then(r => r.blob());
                        const file = new File([blob], image.name, { type: image.type });
                        await navigator.share({
                            files: [file],
                            title: 'Horizon Gallery',
                            text: image.name
                        });
                        Toast.show(`Shared "${image.name}"`, 'success');
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            Toast.show('Error sharing image', 'error');
                        }
                    }
                } else {
                    Toast.show('Share not supported on this browser', 'warning');
                }
            }

            async deleteCurrentImage() {
                const image = this.currentImages[this.currentImageIndex];
                document.getElementById('confirmTitle').textContent = 'Delete Image';
                document.getElementById('confirmMessage').textContent = 
                    `Are you sure you want to delete "${image.name}"?`;

                document.getElementById('confirmBtn').onclick = async () => {
                    await this.db.moveToTrash(image);
                    await this.db.deleteImage(image.id);
                    this.closeLightbox();
                    await this.loadGallery(this.currentFolder);
                    await this.updateBadges();
                    Toast.show(`"${image.name}" moved to trash`, 'success');
                    closeModal('confirmModal');
                };

                openModal('confirmModal');
            }

            handleKeyboardShortcuts(e) {
                if (!document.getElementById('lightboxBackdrop').classList.contains('active')) return;

                switch(e.key) {
                    case 'ArrowLeft':
                        this.prevImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'Delete':
                        this.deleteCurrentImage();
                        break;
                    case 's':
                    case 'S':
                        e.preventDefault();
                        this.toggleStar();
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        this.toggleFavorite();
                        break;
                }
            }

            async handleFiles(files) {
                const progressDiv = document.getElementById('uploadProgress');
                progressDiv.innerHTML = '';

                let uploadedCount = 0;

                for (let file of files) {
                    if (!file.type.startsWith('image/')) continue;

                    try {
                        const dataUrl = await Utils.fileToBase64(file);
                        const dimensions = await Utils.getImageDimensions(dataUrl);

                        const imageData = {
                            id: Utils.generateId(),
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            width: dimensions.width,
                            height: dimensions.height,
                            dataUrl: dataUrl,
                            thumbnail: dataUrl,
                            folderId: this.currentFolder === 'all' ? 'camera-roll' : this.currentFolder,
                            createdDate: new Date().toISOString(),
                            modifiedDate: new Date().toISOString()
                        };

                        await this.db.addImage(imageData);
                        uploadedCount++;

                        const progressItem = document.createElement('div');
                        progressItem.style.cssText = 'padding: 10px; background: rgba(0,212,255,0.1); border-left: 3px solid #0ecc71; margin-bottom: 8px; border-radius: 4px;';
                        progressItem.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-check" style="color: #0ecc71;"></i>
                                <span>${file.name} (${Utils.formatFileSize(file.size)})</span>
                            </div>
                        `;
                        progressDiv.appendChild(progressItem);
                    } catch (error) {
                        console.error('Error uploading file:', error);
                        Toast.show(`Error uploading ${file.name}`, 'error');
                    }
                }

                if (uploadedCount > 0) {
                    await this.loadGallery(this.currentFolder);
                    await this.updateBadges();
                    Toast.show(`${uploadedCount} image${uploadedCount > 1 ? 's' : ''} uploaded successfully`, 'success');
                    setTimeout(() => this.closeUploadModal(), 1500);
                }
            }

            openUploadModal() {
                document.getElementById('uploadModal').classList.add('active');
                document.getElementById('uploadProgress').innerHTML = '';
            }

            closeUploadModal() {
                document.getElementById('uploadModal').classList.remove('active');
                document.getElementById('fileInput').value = '';
            }

            async performSearch() {
                if (this.searchQuery.length === 0) {
                    await this.loadGallery(this.currentFolder);
                    return;
                }

                const allImages = await this.db.getAllImages();
                const allFolders = await this.db.getFolders();

                const filteredImages = allImages.filter(img =>
                    img.name.toLowerCase().includes(this.searchQuery)
                );

                const filteredFolders = allFolders.filter(folder =>
                    folder.name.toLowerCase().includes(this.searchQuery)
                );

                const galleryContent = document.getElementById('galleryContent');
                galleryContent.innerHTML = '';

                if (filteredImages.length === 0 && filteredFolders.length === 0) {
                    galleryContent.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <div class="empty-state-title">No results found</div>
                            <div class="empty-state-text">No images or folders match "${this.searchQuery}"</div>
                        </div>
                    `;
                    return;
                }

                let html = '';

                if (filteredFolders.length > 0) {
                    html += '<div style="margin-bottom: 30px;"><div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">FOLDERS</div><div style="display: grid; gap: 8px;">';
                    filteredFolders.forEach(folder => {
                        html += `
                            <div style="padding: 12px; background: rgba(0,212,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-folder" style="color: var(--accent);"></i>
                                <span>${folder.name}</span>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                }

                if (filteredImages.length > 0) {
                    html += '<div style="margin-bottom: 30px;"><div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">IMAGES</div>';
                    const grid = document.createElement('div');
                    grid.className = 'gallery-grid';
                    galleryContent.innerHTML = html;
                    galleryContent.appendChild(grid);

                    filteredImages.forEach((image, index) => {
                        const item = document.createElement('div');
                        item.className = 'gallery-item';
                        item.innerHTML = `
                            <img src="${image.thumbnail || image.dataUrl}" alt="${image.name}" loading="lazy">
                            <div class="gallery-item-overlay">
                                <button class="gallery-item-btn">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        `;
                        item.addEventListener('click', () => {
                            this.currentImages = filteredImages;
                            this.openLightbox(index);
                        });
                        grid.appendChild(item);
                    });
                } else {
                    galleryContent.innerHTML = html;
                }
            }

            async updateBadges() {
                const allImages = await this.db.getAllImages();
                const favorites = await this.db.getAllFavorites();
                const starred = await this.db.getAllStarred();
                const trash = await this.db.getTrashItems();

                document.getElementById('totalBadge').textContent = allImages.length;
                document.getElementById('favoritesBadge').textContent = favorites.length;
                document.getElementById('starredBadge').textContent = starred.length;
                document.getElementById('trashBadge').textContent = trash.length;
            }

            toggleViewMode() {
                const modes = ['grid', 'list', 'masonry'];
                const currentIndex = modes.indexOf(this.viewMode);
                this.viewMode = modes[(currentIndex + 1) % modes.length];

                const grid = document.querySelector('.gallery-grid');
                if (this.viewMode === 'list') {
                    grid.style.gridTemplateColumns = '1fr';
                    grid.style.gap = '8px';
                } else if (this.viewMode === 'masonry') {
                    grid.style.columnCount = '3';
                    grid.style.columnGap = '12px';
                } else {
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
                    grid.style.columnCount = 'unset';
                }

                const modeNames = { grid: 'Grid', list: 'List', masonry: 'Masonry' };
                Toast.show(`View mode: ${modeNames[this.viewMode]}`, 'info');
            }

            async promptNewFolder() {
                const name = prompt('Enter folder name:');
                if (name && name.trim()) {
                    const folderId = Utils.generateId();
                    await this.db.addFolder({
                        id: folderId,
                        name: name.trim(),
                        parentId: null,
                        createdDate: new Date().toISOString()
                    });

                    await this.renderFolderTree();
                    Toast.show(`Folder "${name}" created successfully`, 'success');
                }
            }

            async renderFolderTree() {
                const folders = await this.db.getFolders();
                const tree = document.getElementById('folderTree');
                tree.innerHTML = '';

                folders.filter(f => f.parentId === null).forEach(folder => {
                    const item = document.createElement('div');
                    item.className = 'folder-item';
                    item.innerHTML = `
                        <i class="fas fa-folder"></i>
                        <span>${folder.name}</span>
                    `;
                    item.addEventListener('click', async () => {
                        document.querySelectorAll('[data-folder]').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        this.currentFolder = folder.id;
                        await this.loadGallery(folder.id);
                    });
                    tree.appendChild(item);
                });
            }

            openSettings() {
                this.updateStorageInfo();
                this.setupThemeColors();
                openModal('settingsModal');
            }

            setupThemeColors() {
                const colorOptions = document.getElementById('colorOptions');
                colorOptions.innerHTML = '';

                const colors = [
                    { name: 'Cyan', value: '#00d4ff' },
                    { name: 'Blue', value: '#0084ff' },
                    { name: 'Pink', value: '#ff006e' },
                    { name: 'Purple', value: '#a855f7' },
                    { name: 'Green', value: '#10b981' },
                    { name: 'Orange', value: '#f97316' }
                ];

                colors.forEach(color => {
                    const option = document.createElement('div');
                    option.className = 'color-option';
                    if (color.value === this.accentColor) {
                        option.classList.add('selected');
                    }
                    option.style.background = color.value;
                    option.title = color.name;
                    option.addEventListener('click', () => this.setAccentColor(color.value));
                    colorOptions.appendChild(option);
                });
            }

            async setAccentColor(color) {
                this.accentColor = color;
                document.documentElement.style.setProperty('--accent', color);
                await this.db.saveSetting('accentColor', color);
                this.setupThemeColors();
                Toast.show(`Theme color changed to ${color}`, 'success');
            }

            toggleTheme() {
                const toggle = document.getElementById('darkModeToggle');
                const isDark = toggle.classList.contains('active');

                toggle.classList.toggle('active');
                document.body.classList.toggle('light-theme');

                this.db.saveSetting('darkMode', !isDark);
                Toast.show(isDark ? 'Light mode enabled' : 'Dark mode enabled', 'info');
            }

            async loadSettings() {
                const darkMode = await this.db.getSetting('darkMode');
                const accentColor = await this.db.getSetting('accentColor');

                if (darkMode === false) {
                    document.body.classList.add('light-theme');
                    document.getElementById('darkModeToggle').classList.remove('active');
                }

                if (accentColor) {
                    this.accentColor = accentColor;
                    document.documentElement.style.setProperty('--accent', accentColor);
                }
            }

            updateStorageInfo() {
                const storageInfo = document.getElementById('storageInfo');
                if (navigator.storage && navigator.storage.estimate) {
                    navigator.storage.estimate().then(estimate => {
                        const used = Utils.formatFileSize(estimate.usage);
                        const quota = Utils.formatFileSize(estimate.quota);
                        const percent = Math.round((estimate.usage / estimate.quota) * 100);

                        storageInfo.innerHTML = `
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>Storage Used</span>
                                    <span>${used} / ${quota}</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; width: ${percent}%; background: var(--accent); border-radius: 4px;"></div>
                                </div>
                            </div>
                            <div style="font-size: 12px; color: #888;">${percent}% storage used</div>
                        `;
                    });
                }
            }

            promptClearCache() {
                document.getElementById('confirmTitle').textContent = 'Clear All Data';
                document.getElementById('confirmMessage').textContent = 
                    'Are you sure you want to delete all images and data? This action cannot be undone.';

                document.getElementById('confirmBtn').innerHTML = '<i class="fas fa-trash"></i> Clear';
                document.getElementById('confirmBtn').style.background = '#ff6b6b';
                document.getElementById('confirmBtn').style.color = 'white';

                document.getElementById('confirmBtn').onclick = async () => {
                    await this.db.clearAll();
                    this.currentImages = [];
                    this.selectedImages.clear();
                    await this.createDefaultFolders();
                    await this.loadGallery('all');
                    await this.updateBadges();
                    await this.renderFolderTree();
                    Toast.show('All data cleared successfully', 'success');
                    closeModal('confirmModal');
                };

                openModal('confirmModal');
            }
        }

        // ============================================
        // GLOBAL FUNCTIONS
        // ============================================
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        let gallery;

        document.addEventListener('DOMContentLoaded', async () => {
            gallery = new HorizonGallery();
            await gallery.init();
        });

        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-custom')) {
                e.target.classList.remove('active');
            }
        });
