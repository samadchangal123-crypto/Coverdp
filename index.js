const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 3000;

// Cache directory
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

// Template configurations for all 7 styles
const templates = {
  1: {
    url: "https://i.ibb.co/0jhSFqMM/c43702d446a6.jpg",
    shape: "circle",
    size: 268,
    posX: 74,
    posY: 67,
    name: "Romantic Rose"
  },
  2: {
    url: "https://i.ibb.co/9kY65xss/688f96416cc9.jpg",
    shape: "circle",
    size: 220,
    posX: 79,
    posY: 105,
    name: "Lovely Heart"
  },
  3: {
    url: "https://i.ibb.co/pBkYHvg2/c0a885aa9aaa.jpg",
    shape: "circle",
    size: 265,
    posX: 117,
    posY: 108,
    name: "Elegant Frame"
  },
  4: {
    url: "https://i.ibb.co/rGJZqChV/d49ec2cc56e0.jpg",
    shape: "circle",
    size: 220,
    posX: 306,
    posY: 128,
    name: "Golden Glow"
  },
  5: {
    url: "https://i.ibb.co/Qj7hJkmf/245285aba927.jpg",
    shape: "circle",
    size: 262,
    posX: 82,
    posY: 124,
    name: "Soft Pink"
  },
  6: {
    url: "https://i.ibb.co/mVxrF0bW/5eeafb5cdae6.jpg",
    shape: "rectangle",
    width: 170,
    height: 360,
    posX: 440,
    posY: 65,
    name: "Modern Frame"
  },
  7: {
    url: "https://i.ibb.co/m5W8TMjj/86de3ad52a9c.jpg",
    shape: "rectangle",
    width: 195,
    height: 265,
    posX: 520,
    posY: 95,
    name: "Classic Border"
  }
};

// Download template function
async function downloadTemplate(styleId) {
  const templatePath = path.join(cacheDir, `template_${styleId}.png`);
  
  if (fs.existsSync(templatePath)) {
    return templatePath;
  }
  
  const config = templates[styleId];
  try {
    const response = await axios.get(config.url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    fs.writeFileSync(templatePath, Buffer.from(response.data));
    return templatePath;
  } catch (error) {
    console.error(`Error downloading template ${styleId}:`, error.message);
    return null;
  }
}

// Make circle image
async function makeCircleImage(buffer, size) {
  try {
    const image = await Jimp.read(buffer);
    image.resize(size, size);
    
    const mask = new Jimp(size, size, 0x00000000);
    const radius = size / 2;
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const dx = x - radius;
        const dy = y - radius;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          mask.setPixelColor(0xFFFFFFFF, x, y);
        }
      }
    }
    
    image.mask(mask, 0, 0);
    return image;
  } catch (error) {
    console.error("Error making circle:", error);
    return await Jimp.create(size, size, 0xff69b4);
  }
}

// Process image based on template
async function processImage(imageBuffer, styleId) {
  const config = templates[styleId];
  const templatePath = await downloadTemplate(styleId);
  
  if (!templatePath) {
    throw new Error("Template download failed");
  }
  
  let template = await Jimp.read(templatePath);
  let userImage;
  
  if (config.shape === "circle") {
    userImage = await makeCircleImage(imageBuffer, config.size);
    template.composite(userImage, config.posX, config.posY);
  } else {
    userImage = await Jimp.read(imageBuffer);
    userImage.resize(config.width, config.height);
    template.composite(userImage, config.posX, config.posY);
  }
  
  const outputPath = path.join(cacheDir, `output_${Date.now()}.png`);
  await template.writeAsync(outputPath);
  return outputPath;
}

// HTML Interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
        <title>👑 MISS ALIYA - Cover DP Studio</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #c06c84 25%, #6c5b7b 50%, #355c7d 75%, #2c3e50 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* Header */
            .header {
                text-align: center;
                margin-bottom: 30px;
                animation: fadeInDown 0.8s ease;
            }
            
            .header h1 {
                font-size: 3rem;
                background: linear-gradient(135deg, #fff 0%, #ffd700 50%, #ff6b6b 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 2px 2px 10px rgba(0,0,0,0.2);
            }
            
            .header .subtitle {
                color: white;
                font-size: 1.1rem;
                margin-top: 10px;
                opacity: 0.9;
            }
            
            .badge {
                display: inline-block;
                background: rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                padding: 8px 20px;
                border-radius: 50px;
                margin-top: 15px;
                font-size: 0.9rem;
                color: white;
            }
            
            /* Main Card */
            .main-card {
                background: rgba(255,255,255,0.95);
                border-radius: 30px;
                padding: 30px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.8s ease;
            }
            
            /* Preview Area */
            .preview-area {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .preview-box {
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                border-radius: 20px;
                padding: 20px;
                min-height: 350px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px dashed #c06c84;
            }
            
            .preview-placeholder {
                text-align: center;
                color: #888;
            }
            
            .preview-placeholder i {
                font-size: 4rem;
                margin-bottom: 10px;
                display: block;
            }
            
            .preview-image {
                max-width: 100%;
                max-height: 300px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            /* Style Buttons */
            .style-title {
                font-size: 1.3rem;
                font-weight: 600;
                margin: 20px 0 15px;
                color: #333;
                text-align: center;
            }
            
            .style-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .style-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                padding: 15px 10px;
                border-radius: 15px;
                color: white;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            
            .style-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            
            .style-btn.selected {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                box-shadow: 0 0 15px rgba(245,87,108,0.5);
            }
            
            .style-name {
                font-size: 0.7rem;
                opacity: 0.8;
                margin-top: 5px;
            }
            
            /* Upload Area */
            .upload-area {
                margin-bottom: 20px;
            }
            
            .upload-label {
                display: block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 15px;
                border-radius: 15px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            }
            
            .upload-label:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            
            input[type="file"] {
                display: none;
            }
            
            /* Create Button */
            .create-btn {
                width: 100%;
                background: linear-gradient(135deg, #ff6b6b 0%, #c06c84 100%);
                border: none;
                padding: 18px;
                border-radius: 15px;
                color: white;
                font-weight: 700;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .create-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(192,108,132,0.4);
            }
            
            .create-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* Result Area */
            .result-area {
                margin-top: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 100%);
                border-radius: 20px;
                display: none;
                text-align: center;
            }
            
            .result-image {
                max-width: 100%;
                border-radius: 15px;
                margin: 15px 0;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .download-btn {
                display: inline-block;
                background: #4CAF50;
                color: white;
                padding: 12px 30px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 10px;
            }
            
            /* Loading */
            .loading {
                display: none;
                text-align: center;
                padding: 20px;
            }
            
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #c06c84;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            .file-info {
                text-align: center;
                margin-top: 10px;
                color: #666;
                font-size: 0.85rem;
            }
            
            /* Animations */
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .header h1 { font-size: 2rem; }
                .style-grid { gap: 10px; }
                .style-btn { padding: 10px 5px; font-size: 0.9rem; }
                .main-card { padding: 20px; }
            }
            
            /* Owner Credit */
            .owner {
                text-align: center;
                margin-top: 20px;
                color: white;
                font-size: 0.85rem;
                opacity: 0.8;
            }
            
            .owner a {
                color: #ffd700;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>👑 MISS ALIYA STUDIO 👑</h1>
                <div class="subtitle">✨ Professional Cover DP Maker ✨</div>
                <div class="badge">⚡ 7 Amazing Styles | Free | Fast ⚡</div>
            </div>
            
            <div class="main-card">
                <div class="preview-area">
                    <div class="preview-box" id="previewBox">
                        <div class="preview-placeholder">
                            <i>📸</i>
                            <p>Your Cover DP will appear here</p>
                        </div>
                    </div>
                </div>
                
                <div class="style-title">🎨 SELECT YOUR STYLE 🎨</div>
                <div class="style-grid" id="styleGrid">
                    <button class="style-btn" data-style="1">❶<br><span class="style-name">Romantic Rose</span></button>
                    <button class="style-btn" data-style="2">❷<br><span class="style-name">Lovely Heart</span></button>
                    <button class="style-btn" data-style="3">❸<br><span class="style-name">Elegant Frame</span></button>
                    <button class="style-btn" data-style="4">❹<br><span class="style-name">Golden Glow</span></button>
                    <button class="style-btn" data-style="5">❺<br><span class="style-name">Soft Pink</span></button>
                    <button class="style-btn" data-style="6">❻<br><span class="style-name">Modern Frame</span></button>
                    <button class="style-btn" data-style="7">❼<br><span class="style-name">Classic Border</span></button>
                </div>
                
                <div class="upload-area">
                    <label class="upload-label" id="uploadLabel">
                        📤 CLICK HERE TO UPLOAD YOUR PHOTO 📤
                    </label>
                    <input type="file" id="imageInput" accept="image/*">
                    <div class="file-info" id="fileInfo">No file selected</div>
                </div>
                
                <button class="create-btn" id="createBtn" disabled>✨ CREATE COVER DP ✨</button>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p style="margin-top: 10px;">🎨 MISS ALIYA IS CREATING YOUR DP...</p>
                    <p style="font-size: 0.85rem;">Please wait 5-15 seconds</p>
                </div>
                
                <div class="result-area" id="resultArea">
                    <h3>✅ YOUR COVER DP IS READY!</h3>
                    <img class="result-image" id="resultImage" alt="Your Cover DP">
                    <br>
                    <a href="#" id="downloadLink" class="download-btn" download="miss_aliya_coverdp.png">💾 DOWNLOAD YOUR DP</a>
                </div>
            </div>
            
            <div class="owner">
                ❤️ Developed with love by <strong>MISS ALIYA</strong> ❤️
            </div>
        </div>
        
        <script>
            let selectedStyle = null;
            let uploadedImage = null;
            
            // Style selection
            document.querySelectorAll('.style-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedStyle = btn.dataset.style;
                    checkReady();
                });
            });
            
            // File upload
            const fileInput = document.getElementById('imageInput');
            const fileInfo = document.getElementById('fileInfo');
            const previewBox = document.getElementById('previewBox');
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    uploadedImage = file;
                    fileInfo.innerHTML = `✅ Selected: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
                    
                    // Show preview
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        previewBox.innerHTML = `<img src="${event.target.result}" class="preview-image" alt="Preview">`;
                    };
                    reader.readAsDataURL(file);
                    checkReady();
                }
            });
            
            document.getElementById('uploadLabel').addEventListener('click', () => {
                fileInput.click();
            });
            
            function checkReady() {
                const createBtn = document.getElementById('createBtn');
                if (selectedStyle && uploadedImage) {
                    createBtn.disabled = false;
                } else {
                    createBtn.disabled = true;
                }
            }
            
            // Create DP
            document.getElementById('createBtn').addEventListener('click', async () => {
                if (!selectedStyle || !uploadedImage) return;
                
                const formData = new FormData();
                formData.append('image', uploadedImage);
                formData.append('style', selectedStyle);
                
                document.getElementById('createBtn').disabled = true;
                document.getElementById('loading').style.display = 'block';
                document.getElementById('resultArea').style.display = 'none';
                
                try {
                    const response = await fetch('/create', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to create DP');
                    }
                    
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    
                    document.getElementById('resultImage').src = url;
                    document.getElementById('downloadLink').href = url;
                    document.getElementById('resultArea').style.display = 'block';
                    
                } catch (error) {
                    alert('❌ Error: ' + error.message + '\nPlease try again!');
                } finally {
                    document.getElementById('createBtn').disabled = false;
                    document.getElementById('loading').style.display = 'none';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Create Cover DP API
app.post('/create', upload.single('image'), async (req, res) => {
  try {
    const styleId = parseInt(req.body.style);
    const imagePath = req.file.path;
    
    const imageBuffer = fs.readFileSync(imagePath);
    const outputPath = await processImage(imageBuffer, styleId);
    
    res.sendFile(path.resolve(outputPath), () => {
      fs.unlinkSync(imagePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║     👑 MISS ALIYA COVER DP STUDIO 👑         ║
  ║         Professional Circle DP Maker         ║
  ╠══════════════════════════════════════════════╣
  ║     🎨 7 Styles Loaded                       ║
  ║     🚀 Server Running on Port: ${PORT}        ║
  ║     ✨ Ready to Create Amazing DPs!          ║
  ╚══════════════════════════════════════════════╝
  `);
});
