// ===== State Management =====
let originalImage = null;
let croppedImageData = null;

// ===== DOM Elements =====
const uploadSection = document.getElementById('uploadSection');
const editorSection = document.getElementById('editorSection');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const originalCanvas = document.getElementById('originalCanvas');
const croppedCanvas = document.getElementById('croppedCanvas');
const originalInfo = document.getElementById('originalInfo');
const croppedInfo = document.getElementById('croppedInfo');
const cropBtn = document.getElementById('cropBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const resizeSection = document.getElementById('resizeSection');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const aspectRatioLock = document.getElementById('aspectRatioLock');
const applyResizeBtn = document.getElementById('applyResizeBtn');

// ===== Resize State =====
let isAspectRatioLocked = true;
let currentAspectRatio = 1;
let isResizing = false;


// ===== Event Listeners =====
selectFileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
cropBtn.addEventListener('click', handleCrop);
downloadBtn.addEventListener('click', handleDownload);
resetBtn.addEventListener('click', handleReset);
aspectRatioLock.addEventListener('click', toggleAspectRatioLock);
widthInput.addEventListener('input', handleWidthInput);
heightInput.addEventListener('input', handleHeightInput);
applyResizeBtn.addEventListener('click', handleApplyResize);

// ===== File Handling =====
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/png') {
        loadImage(file);
    } else {
        alert('請選擇 PNG 格式的圖片');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'image/png') {
        loadImage(file);
    } else {
        alert('請選擇 PNG 格式的圖片');
    }
}

// ===== Image Loading =====
function loadImage(file) {
    showLoading();
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayOriginalImage(img);
            uploadSection.classList.add('hidden');
            editorSection.classList.remove('hidden');
            hideLoading();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayOriginalImage(img) {
    const ctx = originalCanvas.getContext('2d');
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    updateImageInfo(originalInfo, img.width, img.height);
    
    // Reset cropped canvas
    croppedCanvas.width = 0;
    croppedCanvas.height = 0;
    croppedInfo.textContent = '';
    downloadBtn.classList.add('hidden');
    resizeSection.classList.add('hidden');
}

function updateImageInfo(element, width, height) {
    const fileSize = ((width * height * 4) / 1024).toFixed(2);
    element.textContent = `尺寸: ${width} × ${height} px | 約 ${fileSize} KB`;
}

// ===== Auto Crop Algorithm =====
function handleCrop() {
    if (!originalImage) return;
    
    showLoading();
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        const ctx = originalCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        const bounds = findContentBounds(imageData);
        
        if (bounds) {
            cropImage(imageData, bounds);
        } else {
            alert('圖片完全透明，無法裁剪');
            hideLoading();
        }
    }, 100);
}

function findContentBounds(imageData) {
    const { width, height, data } = imageData;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;
    
    // Scan all pixels to find non-transparent bounds
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];
            
            // If pixel is not fully transparent
            if (alpha > 0) {
                hasContent = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    if (!hasContent) {
        return null;
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

function cropImage(imageData, bounds) {
    const { width, height, data } = imageData;
    const { x, y, width: cropWidth, height: cropHeight } = bounds;
    
    // Create new canvas with cropped dimensions
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    
    const croppedCtx = croppedCanvas.getContext('2d');
    const croppedData = croppedCtx.createImageData(cropWidth, cropHeight);
    
    // Copy pixels from original to cropped
    for (let row = 0; row < cropHeight; row++) {
        for (let col = 0; col < cropWidth; col++) {
            const srcIndex = ((y + row) * width + (x + col)) * 4;
            const dstIndex = (row * cropWidth + col) * 4;
            
            croppedData.data[dstIndex] = data[srcIndex];         // R
            croppedData.data[dstIndex + 1] = data[srcIndex + 1]; // G
            croppedData.data[dstIndex + 2] = data[srcIndex + 2]; // B
            croppedData.data[dstIndex + 3] = data[srcIndex + 3]; // A
        }
    }
    
    croppedCtx.putImageData(croppedData, 0, 0);
    updateImageInfo(croppedInfo, cropWidth, cropHeight);
    
    // Show download button and resize controls with animation
    downloadBtn.classList.remove('hidden');
    downloadBtn.style.animation = 'fadeInUp 0.4s ease-out';
    
    // Show and initialize resize controls
    showResizeControls(cropWidth, cropHeight);
    
    hideLoading();
}

// ===== Download =====
function handleDownload() {
    if (!croppedCanvas.width || !croppedCanvas.height) {
        alert('請先執行裁剪');
        return;
    }
    
    croppedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// ===== Reset =====
function handleReset() {
    originalImage = null;
    croppedImageData = null;
    fileInput.value = '';
    
    originalCanvas.width = 0;
    originalCanvas.height = 0;
    croppedCanvas.width = 0;
    croppedCanvas.height = 0;
    
    originalInfo.textContent = '';
    croppedInfo.textContent = '';
    
    uploadSection.classList.remove('hidden');
    editorSection.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    resizeSection.classList.add('hidden');
}

// ===== Resize Controls =====
function showResizeControls(width, height) {
    currentAspectRatio = width / height;
    widthInput.value = width;
    heightInput.value = height;
    isAspectRatioLocked = true;
    updateLockIcon();
    resizeSection.classList.remove('hidden');
    resizeSection.style.animation = 'fadeInUp 0.4s ease-out';
}

function toggleAspectRatioLock() {
    isAspectRatioLocked = !isAspectRatioLocked;
    updateLockIcon();
}

function updateLockIcon() {
    const lockedIcon = aspectRatioLock.querySelector('.locked');
    const unlockedIcon = aspectRatioLock.querySelector('.unlocked');
    
    if (isAspectRatioLocked) {
        aspectRatioLock.classList.remove('unlocked');
        lockedIcon.classList.remove('hidden');
        unlockedIcon.classList.add('hidden');
    } else {
        aspectRatioLock.classList.add('unlocked');
        lockedIcon.classList.add('hidden');
        unlockedIcon.classList.remove('hidden');
    }
}

function handleWidthInput(event) {
    if (isResizing) return;
    
    const newWidth = parseInt(event.target.value);
    if (!newWidth || newWidth <= 0) return;
    
    if (isAspectRatioLocked) {
        const newHeight = Math.round(newWidth / currentAspectRatio);
        heightInput.value = newHeight;
    }
}

function handleHeightInput(event) {
    if (isResizing) return;
    
    const newHeight = parseInt(event.target.value);
    if (!newHeight || newHeight <= 0) return;
    
    if (isAspectRatioLocked) {
        const newWidth = Math.round(newHeight * currentAspectRatio);
        widthInput.value = newWidth;
    }
}

function handleApplyResize() {
    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);
    
    // Validation
    if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
        alert('請輸入有效的寬度和高度');
        return;
    }
    
    if (newWidth > 10000 || newHeight > 10000) {
        alert('尺寸過大，請輸入小於 10000 像素的值');
        return;
    }
    
    if (newWidth === croppedCanvas.width && newHeight === croppedCanvas.height) {
        return; // No change needed
    }
    
    showLoading();
    isResizing = true;
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        resizeImage(newWidth, newHeight);
        isResizing = false;
        hideLoading();
    }, 100);
}

function resizeImage(newWidth, newHeight) {
    // Create a temporary canvas to hold the current image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = croppedCanvas.width;
    tempCanvas.height = croppedCanvas.height;
    tempCtx.drawImage(croppedCanvas, 0, 0);
    
    // Resize the cropped canvas
    croppedCanvas.width = newWidth;
    croppedCanvas.height = newHeight;
    
    // Use high-quality image smoothing
    const ctx = croppedCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the resized image
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
    
    // Update info and aspect ratio
    updateImageInfo(croppedInfo, newWidth, newHeight);
    currentAspectRatio = newWidth / newHeight;
}

// ===== Loading State =====
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// ===== Prevent Default Drag Behavior =====
document.addEventListener('dragover', (e) => {
    if (e.target !== uploadArea) {
        e.preventDefault();
    }
});

document.addEventListener('drop', (e) => {
    if (e.target !== uploadArea) {
        e.preventDefault();
    }
});
