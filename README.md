# PNG Editor - Auto Crop Tool

A simple and elegant web-based PNG editor that automatically removes transparent edges from images, similar to the crop functionality in Paint.NET.

## 🌐 Live Demo

**[Try it now!](https://leelai.github.io/png_editor/)**

> The app is hosted on GitHub Pages and runs entirely in your browser - no data is uploaded to any server.

## Features

- 🖼️ **Auto-Crop Transparency**: Automatically detects and removes transparent borders from PNG images
- 📤 **Drag & Drop Upload**: Easy file upload with drag-and-drop support
- 👁️ **Live Preview**: Real-time before/after comparison
- 💾 **Instant Download**: Download processed images with one click
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- ⚡ **Client-Side Processing**: All processing happens in your browser - no server upload needed

## Usage

1. Open `index.html` in your web browser
2. Upload a PNG image by:
   - Clicking the upload area and selecting a file
   - Dragging and dropping an image onto the upload area
3. The tool will automatically detect and crop transparent edges
4. Preview the result with before/after comparison
5. Click "Download Cropped Image" to save the result

## Technical Details

- **Pure JavaScript**: No external dependencies or frameworks
- **Canvas API**: Uses HTML5 Canvas for image processing
- **Responsive Design**: Works on desktop and mobile devices
- **Modern CSS**: Utilizes CSS Grid, Flexbox, and custom properties

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and animations
- `script.js` - Image processing logic and UI interactions

## How It Works

The auto-crop algorithm:
1. Loads the image onto an HTML5 canvas
2. Scans pixel data to find non-transparent boundaries
3. Calculates the minimal bounding box containing all non-transparent pixels
4. Crops the image to the detected boundaries
5. Outputs the cropped result

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas API
- File API
- ES6+ JavaScript

## License

MIT License - feel free to use and modify as needed.

## Author

Created with ❤️ for quick and easy PNG image processing.
