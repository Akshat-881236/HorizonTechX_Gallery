 window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("app-splash")?.remove();
    }, 2000); // 2 seconds
});
 // ============================================
        // INDEXEDDB DATABASE MANAGEMENT
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

            async deleteFolder(id) {
                const transaction = this.db.transaction(['folders'], 'readwrite');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.delete(id);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve();
                });
            }

            async renameFolder(id, newName) {
                const folder = await this.getFolder(id);
                if (folder) {
                    folder.name = newName;
                    return this.updateFolder(folder);
                }
            }

            async getFolder(id) {
                const transaction = this.db.transaction(['folders'], 'readonly');
                const store = transaction.objectStore('folders');
                return new Promise((resolve, reject) => {
                    const request = store.get(id);
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

            async emptyTrash() {
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

            getRelativeTime(date) {
                const now = new Date();
                const diff = now - new Date(date);
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (seconds < 60) return 'Just now';
                if (minutes < 60) return `${minutes}m ago`;
                if (hours < 24) return `${hours}h ago`;
                if (days < 7) return `${days}d ago`;
                return Utils.formatDate(date);
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
                    img.onerror = () => resolve({ width: 0, height: 0 });
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
            },

            getLocationFromPath(path) {
                const parts = path.split('/');
                return parts[parts.length - 1] || 'Storage';
            }
        };

        // ============================================
        // TOAST NOTIFICATION SYSTEM
        // ============================================
        class Toast {
            static show(message, type = 'info', duration = 3000) {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const icon = {
                    error: 'exclamation-circle',
                    success: 'check-circle',
                    warning: 'exclamation-triangle',
                    info: 'info-circle'
                };

                toast.innerHTML = `
                    <i class="fas fa-${icon[type] || 'info-circle'}"></i>
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
        // MAIN APPLICATION CLASS
        // ============================================
        class HorizonGallery {
            constructor() {
                this.db = new GalleryDB();
                this.currentFolder = 'all';
                this.currentImages = [];
                this.viewMode = 'grid';
                this.currentImageIndex = 0;
                this.zoom = 1;
                this.rotation = 0;
                this.searchQuery = '';
            }

            async init() {
                try {
                    await this.db.init();
                    await this.createDefaultFolders();
                    this.setupEventListeners();
                    this.setupTheme();
                    await this.loadGallery('all');
                    await this.updateBadges();
                    await this.renderFolderTree();
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
                        { id: 'camera-roll', name: 'Camera Roll', parentId: null, type: 'default', createdDate: new Date().toISOString() },
                        { id: 'screenshots', name: 'Screenshots', parentId: null, type: 'default', createdDate: new Date().toISOString() },
                        { id: 'downloads', name: 'Downloads', parentId: null, type: 'default', createdDate: new Date().toISOString() }
                    ];

                    for (const folder of defaultFolders) {
                        await this.db.addFolder(folder);
                    }
                }
            }

            setupTheme() {
                const themeToggle = document.getElementById('themeToggle');
                const contrastRadios = document.querySelectorAll('input[name="contrast"]');

                // Load theme settings
                const savedTheme = localStorage.getItem('gallery-theme') || 'dark';
                const savedContrast = localStorage.getItem('gallery-contrast') || 'normal';

                document.documentElement.setAttribute('data-theme', savedTheme);
                document.documentElement.setAttribute('data-contrast', savedContrast);

                themeToggle.checked = savedTheme === 'light';

                contrastRadios.forEach(radio => {
                    radio.checked = radio.value === savedContrast;
                });

                // Theme toggle
                themeToggle.addEventListener('change', (e) => {
                    const newTheme = e.target.checked ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('gallery-theme', newTheme);
                    Toast.show(`Theme changed to ${newTheme}`, 'info');
                });

                // Contrast change
                contrastRadios.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        const newContrast = e.target.value;
                        document.documentElement.setAttribute('data-contrast', newContrast);
                        localStorage.setItem('gallery-contrast', newContrast);
                        Toast.show(`Contrast set to ${newContrast}`, 'info');
                    });
                });
            }

            setupEventListeners() {
                // Sidebar
                document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar());
                document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());

                // Upload
                document.getElementById('uploadBtn').addEventListener('click', () => this.openUploadModal());
                document.getElementById('uploadBtnEmpty').addEventListener('click', () => this.openUploadModal());

                // Upload zone
                const uploadZone = document.getElementById('uploadZone');
                uploadZone.addEventListener('click', () => document.getElementById('fileInput').click());
                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadZone.classList.add('dragover');
                });
                uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadZone.classList.remove('dragover');
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
                        this.searchQuery = '';
                        document.getElementById('searchInput').value = '';
                        await this.loadGallery(folder);
                    });
                });

                // Search
                const searchInput = document.getElementById('searchInput');
                searchInput.addEventListener('input', Utils.debounce(async (e) => {
                    this.searchQuery = e.target.value.toLowerCase();
                    if (this.searchQuery.length === 0) {
                        await this.loadGallery(this.currentFolder);
                    } else {
                        await this.searchImagesAndFolders(this.searchQuery);
                    }
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
                document.getElementById('lightboxDownload').addEventListener('click', () => this.downloadImage());
                document.getElementById('lightboxDelete').addEventListener('click', () => this.promptDelete());
                document.getElementById('lightboxDetails').addEventListener('click', () => this.showImageDetails());
                document.getElementById('lightboxShare').addEventListener('click', () => this.shareImage());

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

                // View mode
                document.getElementById('viewModeBtn').addEventListener('click', () => this.toggleViewMode());

                // Add folder button
                document.getElementById('addFolderBtn').addEventListener('click', () => this.promptNewFolder());

                // Settings
                document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
                document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
                document.getElementById('clearCacheBtn').addEventListener('click', () => this.clearCache());
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
                        images = allImages.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, 100);
                    } else if (folder === 'trash') {
                        images = await this.db.getTrashItems();
                    } else {
                        images = await this.db.getImagesByFolder(folder);
                    }

                    this.currentImages = images;

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
                    item.innerHTML = `
                        <div class="gallery-item-label">${image.name}</div>
                        <img src="${image.thumbnail || image.dataUrl}" alt="${image.name}" loading="lazy">
                        <div class="gallery-item-overlay">
                            <button class="gallery-item-btn" title="View">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    `;

                    item.addEventListener('click', () => this.openLightbox(index));
                    grid.appendChild(item);
                });

                galleryContent.appendChild(grid);
            }

            openLightbox(index) {
                this.currentImageIndex = index;
                const image = this.currentImages[index];
                document.getElementById('lightboxImage').src = image.dataUrl;
                document.getElementById('lightboxName').textContent = image.name;
                document.getElementById('lightboxDetails').textContent = `${Utils.formatFileSize(image.size)} • ${image.width}×${image.height}`;
                document.getElementById('lightboxIndex').textContent = `${index + 1} / ${this.currentImages.length}`;
                document.getElementById('lightboxBackdrop').classList.add('active');
                this.zoom = 1;
                this.rotation = 0;
                
                this.updateLightboxButtons();
            }

            closeLightbox() {
                document.getElementById('lightboxBackdrop').classList.remove('active');
            }

            async updateLightboxButtons() {
                const image = this.currentImages[this.currentImageIndex];
                const isFav = await this.db.isFavorite(image.id);
                const isStarred = await this.db.isStarred(image.id);

                const favBtn = document.getElementById('lightboxFavorite');
                const starBtn = document.getElementById('lightboxStar');

                if (isFav) {
                    favBtn.classList.add('active');
                } else {
                    favBtn.classList.remove('active');
                }

                if (isStarred) {
                    starBtn.classList.add('active');
                } else {
                    starBtn.classList.remove('active');
                }
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
                const zoomPercent = Math.round(this.zoom * 100);
                img.style.transform = `scale(${this.zoom}) rotate(${this.rotation}deg)`;
                Toast.show(`Zoom: ${zoomPercent}%`, 'info', 1000);
            }

            rotateImage(angle) {
                this.rotation = (this.rotation + angle) % 360;
                const img = document.getElementById('lightboxImage');
                img.style.transform = `scale(${this.zoom}) rotate(${this.rotation}deg)`;
                Toast.show(`Rotated: ${this.rotation}°`, 'info', 1000);
            }

            async toggleFavorite() {
                const image = this.currentImages[this.currentImageIndex];
                const isFav = await this.db.isFavorite(image.id);

                if (isFav) {
                    await this.db.removeFromFavorites(image.id);
                    Toast.show(`Removed from Favorite`, 'info');
                } else {
                    await this.db.addToFavorites(image.id);
                    Toast.show(`Added "${image.name}" to Favorite`, 'success');
                }

                await this.updateBadges();
                await this.updateLightboxButtons();
            }

            async toggleStar() {
                const image = this.currentImages[this.currentImageIndex];
                const isStarred = await this.db.isStarred(image.id);

                if (isStarred) {
                    await this.db.removeFromStarred(image.id);
                    Toast.show(`Image moved back from Starred Folder`, 'info');
                } else {
                    await this.db.addToStarred(image.id);
                    Toast.show(`Image moved to Starred Folder`, 'success');
                }

                await this.updateBadges();
                await this.updateLightboxButtons();
                
                if (this.currentFolder === 'starred') {
                    await this.loadGallery('starred');
                    this.closeLightbox();
                }
            }

            downloadImage() {
                const image = this.currentImages[this.currentImageIndex];
                const link = document.createElement('a');
                link.href = image.dataUrl;
                link.download = image.name;
                link.click();
                Toast.show(`Downloaded "${image.name}"`, 'success');
            }

            promptDelete() {
                const image = this.currentImages[this.currentImageIndex];
                showConfirmation(
                    'Delete Image',
                    `Are you sure you want to delete "${image.name}"? This action can be undone from Trash.`,
                    async () => {
                        await this.deleteImage(image.id);
                    }
                );
            }

            async deleteImage(imageId) {
                const image = await this.db.getImage(imageId);
                if (image) {
                    await this.db.moveToTrash(image);
                    await this.db.deleteImage(imageId);
                    this.closeLightbox();
                    await this.loadGallery(this.currentFolder);
                    await this.updateBadges();
                    Toast.show(`Image moved to Trash`, 'success');
                }
            }

            async showImageDetails() {
                const image = this.currentImages[this.currentImageIndex];
                const detailsContent = document.getElementById('detailsContent');
                
                const details = [
                    { label: 'File Name', value: image.name },
                    { label: 'File Size', value: Utils.formatFileSize(image.size) },
                    { label: 'Dimensions', value: `${image.width} × ${image.height} px` },
                    { label: 'Type', value: image.type },
                    { label: 'Location', value: image.folderId },
                    { label: 'Created', value: Utils.formatDate(image.createdDate) },
                    { label: 'Modified', value: Utils.formatDate(image.modifiedDate) },
                    { label: 'Aspect Ratio', value: `${(image.width / image.height).toFixed(2)}:1` }
                ];

                detailsContent.innerHTML = details.map(d => `
                    <div>
                        <div style="font-weight: 600; font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${d.label}</div>
                        <div style="color: var(--text-primary); word-break: break-all;">${d.value}</div>
                    </div>
                `).join('');

                document.getElementById('detailsModal').classList.add('active');
            }

            shareImage() {
                const image = this.currentImages[this.currentImageIndex];
                
                if (navigator.share) {
                    navigator.share({
                        title: image.name,
                        text: 'Check out this photo!',
                        files: [new File([image.dataUrl], image.name, { type: image.type })]
                    }).catch(err => console.log('Share cancelled'));
                } else {
                    // Fallback
                    const link = document.createElement('a');
                    link.href = image.dataUrl;
                    link.download = image.name;
                    Toast.show(`Share URL copied to clipboard`, 'info');
                }
            }

            handleKeyboardShortcuts(e) {
                if (!document.getElementById('lightboxBackdrop').classList.contains('active')) return;

                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevImage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextImage();
                        break;
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'Delete':
                        this.promptDelete();
                        break;
                    case '+':
                    case '=':
                        this.zoomImage(1.2);
                        break;
                    case '-':
                        this.zoomImage(0.8);
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
                            folderId: this.currentFolder === 'all' || this.currentFolder === 'recent' ? 'camera-roll' : this.currentFolder,
                            createdDate: new Date().toISOString(),
                            modifiedDate: new Date().toISOString()
                        };

                        await this.db.addImage(imageData);
                        uploadedCount++;

                        const progressItem = document.createElement('div');
                        progressItem.style.cssText = 'padding: 10px; background: rgba(0,212,255,0.1); border-left: 3px solid #0ecc71; margin-bottom: 8px; border-radius: 4px;';
                        progressItem.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-check"></i>
                                <span>${file.name} (${Utils.formatFileSize(file.size)})</span>
                            </div>
                        `;
                        progressDiv.appendChild(progressItem);
                    } catch (error) {
                        console.error('Error uploading file:', error);
                    }
                }

                if (uploadedCount > 0) {
                    await this.loadGallery(this.currentFolder);
                    await this.updateBadges();
                    Toast.show(`${uploadedCount} image(s) uploaded successfully`, 'success');
                    setTimeout(() => {
                        this.closeUploadModal();
                    }, 1500);
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

            async searchImagesAndFolders(query) {
                const allImages = await this.db.getAllImages();
                const allFolders = await this.db.getFolders();

                const filteredImages = allImages.filter(img =>
                    img.name.toLowerCase().includes(query)
                );

                const filteredFolders = allFolders.filter(folder =>
                    folder.name.toLowerCase().includes(query)
                );

                const galleryContent = document.getElementById('galleryContent');
                galleryContent.innerHTML = '';

                if (filteredImages.length === 0 && filteredFolders.length === 0) {
                    galleryContent.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-search"></i></div>
                            <div class="empty-state-title">No results found</div>
                            <div class="empty-state-text">Try searching with different keywords</div>
                        </div>
                    `;
                    return;
                }

                // Show folders
                if (filteredFolders.length > 0) {
                    const folderSection = document.createElement('div');
                    folderSection.style.marginBottom = '30px';
                    folderSection.innerHTML = '<div style="font-weight: 600; margin-bottom: 12px; color: var(--text-secondary); text-transform: uppercase; font-size: 12px;">Folders</div>';
                    
                    const folderGrid = document.createElement('div');
                    folderGrid.style.display = 'grid';
                    folderGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                    folderGrid.style.gap = '12px';

                    filteredFolders.forEach(folder => {
                        const folderItem = document.createElement('div');
                        folderItem.style.cssText = 'background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: var(--transition);';
                        folderItem.innerHTML = `
                            <div style="font-size: 32px; margin-bottom: 8px;"><i class="fas fa-folder" style="color: var(--accent);"></i></div>
                            <div style="font-size: 14px; font-weight: 500;">${folder.name}</div>
                        `;
                        folderItem.addEventListener('mouseover', () => folderItem.style.borderColor = 'var(--accent)');
                        folderItem.addEventListener('mouseout', () => folderItem.style.borderColor = 'var(--border-color)');
                        folderItem.addEventListener('click', async () => {
                            this.currentFolder = folder.id;
                            document.querySelectorAll('[data-folder]').forEach(i => i.classList.remove('active'));
                            await this.loadGallery(folder.id);
                        });
                        folderGrid.appendChild(folderItem);
                    });

                    folderSection.appendChild(folderGrid);
                    galleryContent.appendChild(folderSection);
                }

                // Show images
                if (filteredImages.length > 0) {
                    const imageSection = document.createElement('div');
                    imageSection.innerHTML = '<div style="font-weight: 600; margin-bottom: 12px; color: var(--text-secondary); text-transform: uppercase; font-size: 12px;">Photos</div>';
                    
                    const grid = document.createElement('div');
                    grid.className = 'gallery-grid';

                    filteredImages.forEach((image, index) => {
                        const item = document.createElement('div');
                        item.className = 'gallery-item';
                        item.innerHTML = `
                            <img src="${image.thumbnail || image.dataUrl}" alt="${image.name}" loading="lazy">
                            <div class="gallery-item-label">${image.name}</div>
                            <div class="gallery-item-overlay">
                                <button class="gallery-item-btn" title="View">
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

                    imageSection.appendChild(grid);
                    galleryContent.appendChild(imageSection);
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
                if (!grid) return;

                if (this.viewMode === 'list') {
                    grid.style.gridTemplateColumns = '1fr';
                    grid.style.gap = '8px';
                    Toast.show('List View', 'info');
                } else if (this.viewMode === 'masonry') {
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                    Toast.show('Masonry View', 'info');
                } else {
                    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
                    Toast.show('Grid View', 'info');
                }
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
                    Toast.show(`Folder "${name}" created`, 'success');
                }
            }

            async renderFolderTree() {
                const folders = await this.db.getFolders();
                const tree = document.getElementById('folderTree');
                tree.innerHTML = '';

                folders.filter(f => f.parentId === null).forEach(folder => {
                    const item = document.createElement('div');
                    item.className = 'sidebar-item';
                    item.style.display = 'flex';
                    item.style.justifyContent = 'space-between';
                    item.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <i class="fas fa-folder"></i>
                            <span>${folder.name}</span>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button data-folder-id="${folder.id}" class="folder-rename-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 12px; padding: 0; width: auto;" title="Rename">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button data-folder-id="${folder.id}" class="folder-delete-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 12px; padding: 0; width: auto;" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;

                    const mainPart = item.querySelector('div:first-child');
                    mainPart.addEventListener('click', async () => {
                        document.querySelectorAll('[data-folder]').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        this.currentFolder = folder.id;
                        this.searchQuery = '';
                        document.getElementById('searchInput').value = '';
                        await this.loadGallery(folder.id);
                    });

                    item.querySelector('.folder-rename-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.promptRenameFolder(folder.id, folder.name);
                    });

                    item.querySelector('.folder-delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.promptDeleteFolder(folder.id, folder.name);
                    });

                    tree.appendChild(item);
                });
            }

            async promptRenameFolder(folderId, oldName) {
                const newName = prompt(`Rename "${oldName}" to:`, oldName);
                if (newName && newName.trim() && newName !== oldName) {
                    await this.db.renameFolder(folderId, newName.trim());
                    await this.renderFolderTree();
                    Toast.show(`Renamed "${oldName}" to "${newName}"`, 'success');
                }
            }

            async promptDeleteFolder(folderId, folderName) {
                const images = await this.db.getImagesByFolder(folderId);
                showConfirmation(
                    'Delete Folder',
                    `Are you sure you want to delete "${folderName}"? ${images.length > 0 ? `This folder contains ${images.length} image(s).` : ''}`,
                    async () => {
                        for (const image of images) {
                            await this.db.moveToTrash(image);
                            await this.db.deleteImage(image.id);
                        }
                        await this.db.deleteFolder(folderId);
                        await this.renderFolderTree();
                        await this.loadGallery('all');
                        await this.updateBadges();
                        Toast.show(`Folder deleted`, 'success');
                    }
                );
            }

            openSettings() {
                document.getElementById('settingsModal').classList.add('active');
            }

            async exportData() {
                try {
                    const images = await this.db.getAllImages();
                    const folders = await this.db.getFolders();
                    const favorites = await this.db.getAllFavorites();
                    const starred = await this.db.getAllStarred();

                    const exportData = {
                        version: '1.0',
                        exportDate: new Date().toISOString(),
                        images: images,
                        folders: folders,
                        favorites: favorites,
                        starred: starred
                    };

                    const dataStr = JSON.stringify(exportData, null, 2);
                    const link = document.createElement('a');
                    link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    link.download = `gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    Toast.show('Data exported successfully', 'success');
                } catch (error) {
                    Toast.show('Error exporting data', 'error');
                }
            }

            async clearCache() {
                showConfirmation(
                    'Clear Cache',
                    'This will delete all cached data. Are you sure?',
                    async () => {
                        try {
                            const allImages = await this.db.getAllImages();
                            for (const image of allImages) {
                                await this.db.deleteImage(image.id);
                            }
                            await this.db.emptyTrash();
                            await this.loadGallery('all');
                            await this.updateBadges();
                            Toast.show('Cache cleared successfully', 'success');
                        } catch (error) {
                            Toast.show('Error clearing cache', 'error');
                        }
                    }
                );
            }
        }

        // ============================================
        // GLOBAL FUNCTIONS
        // ============================================
        window.closeModal = function(modalId) {
            document.getElementById(modalId).classList.remove('active');
        };

        function showConfirmation(title, message, onConfirm) {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            document.getElementById('confirmModal').classList.add('active');

            const confirmBtn = document.getElementById('confirmBtn');
            confirmBtn.onclick = async () => {
                await onConfirm();
                window.closeModal('confirmModal');
            };
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

// Delete after Test
async init() {
    try {
        console.log("DB Init Start");

        await this.db.init();

        console.log("DB Init Success");

        await this.createDefaultFolders();

        console.log("Folders Success");

        this.setupEventListeners();

        console.log("Events Success");

        this.setupTheme();

        console.log("Theme Success");

        await this.loadGallery('all');

        console.log("Gallery Loaded");

    } catch(error) {
        console.error(
            "INIT FAILED:",
            error
        );
    }
}
