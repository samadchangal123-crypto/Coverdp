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
if (!fs.existsSync('uploads/')) fs.mkdirSync('uploads/');

const templates = {
  1: { url: "https://i.ibb.co/0jhSFqMM/c43702d446a6.jpg", shape: "circle", size: 268, posX: 74, posY: 67, name: "Romantic Rose" },
  2: { url: "https://i.ibb.co/9kY65xss/688f96416cc9.jpg", shape: "circle", size: 220, posX: 79, posY: 105, name: "Lovely Heart" },
  3: { url: "https://i.ibb.co/pBkYHvg2/c0a885aa9aaa.jpg", shape: "circle", size: 265, posX: 117, posY: 108, name: "Elegant Frame" },
  4: { url: "https://i.ibb.co/rGJZqChV/d49ec2cc56e0.jpg", shape: "circle", size: 220, posX: 306, posY: 128, name: "Golden Glow" },
  5: { url: "https://i.ibb.co/Qj7hJkmf/245285aba927.jpg", shape: "circle", size: 262, posX: 82, posY: 124, name: "Soft Pink" },
  6: { url: "https://i.ibb.co/mVxrF0bW/5eeafb5cdae6.jpg", shape: "rectangle", width: 170, height: 360, posX: 440, posY: 65, name: "Modern Frame" },
  7: { url: "https://i.ibb.co/m5W8TMjj/86de3ad52a9c.jpg", shape: "rectangle", width: 195, height: 265, posX: 520, posY: 95, name: "Classic Border" }
};

async function downloadTemplate(styleId) {
  const templatePath = path.join(cacheDir, `template_${styleId}.png`);
  if (fs.existsSync(templatePath)) return templatePath;
  const config = templates[styleId];
  const response = await axios.get(config.url, { responseType: 'arraybuffer', timeout: 30000 });
  fs.writeFileSync(templatePath, Buffer.from(response.data));
  return templatePath;
}

async function makeCircleImage(buffer, size) {
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
}

async function processImage(imageBuffer, styleId) {
  const config = templates[styleId];
  const templatePath = await downloadTemplate(styleId);
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

const getHTML = () => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MISS ALIYA - Cover DP Studio</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#ff6b6b,#c06c84,#6c5b7b,#355c7d);min-height:100vh;padding:20px;}
.container{max-width:1200px;margin:0 auto;}
.header{text-align:center;margin-bottom:30px;}
.header h1{font-size:3rem;color:white;text-shadow:2px 2px 5px black;}
.badge{background:rgba(255,255,255,0.2);padding:8px 20px;border-radius:50px;color:white;display:inline-block;}
.main-card{background:white;border-radius:30px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.3);}
.preview-box{background:#f0f0f0;border-radius:20px;padding:20px;min-height:350px;display:flex;align-items:center;justify-content:center;border:3px dashed #c06c84;margin-bottom:20px;}
.preview-image{max-width:100%;max-height:300px;border-radius:15px;}
.style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:15px;margin:20px 0;}
.style-btn{background:linear-gradient(135deg,#667eea,#764ba2);border:none;padding:15px;border-radius:15px;color:white;font-weight:bold;cursor:pointer;}
.style-btn.selected{background:linear-gradient(135deg,#f093fb,#f5576c);}
.upload-label{display:block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;padding:15px;border-radius:15px;cursor:pointer;margin:20px 0;}
.create-btn{width:100%;background:linear-gradient(135deg,#ff6b6b,#c06c84);border:none;padding:18px;border-radius:15px;color:white;font-size:1.2rem;font-weight:bold;cursor:pointer;}
.create-btn:disabled{opacity:0.6;}
.result-area{margin-top:20px;text-align:center;display:none;}
.result-image{max-width:100%;border-radius:15px;margin:15px 0;}
.download-btn{display:inline-block;background:#4CAF50;color:white;padding:12px 30px;border-radius:10px;text-decoration:none;}
.loading{display:none;text-align:center;padding:20px;}
.spinner{width:50px;height:50px;border:4px solid #f3f3f3;border-top:4px solid #c06c84;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;}
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
.owner{text-align:center;margin-top:20px;color:white;}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>MISS ALIYA STUDIO</h1>
<div class="badge">7 Amazing Styles | Free | Fast</div>
</div>
<div class="main-card">
<div class="preview-box" id="previewBox"> Your Cover DP will appear here</div>
<div style="text-align:center;font-weight:bold;">SELECT YOUR STYLE</div>
<div class="style-grid" id="styleGrid">
<button class="style-btn" data-style="1">1 Style 1</button>
<button class="style-btn" data-style="2">2 Style 2</button>
<button class="style-btn" data-style="3">3 Style 3</button>
<button class="style-btn" data-style="4">4 Style 4</button>
<button class="style-btn" data-style="5">5 Style 5</button>
<button class="style-btn" data-style="6">6 Style 6</button>
<button class="style-btn" data-style="7">7 Style 7</button>
</div>
<label class="upload-label" id="uploadLabel">CLICK HERE TO UPLOAD YOUR PHOTO</label>
<input type="file" id="imageInput" accept="image/*" style="display:none">
<div id="fileInfo" style="text-align:center;margin:10px">No file selected</div>
<button class="create-btn" id="createBtn" disabled>CREATE COVER DP</button>
<div class="loading" id="loading"><div class="spinner"></div><p>Creating your DP...</p></div>
<div class="result-area" id="resultArea">
<h3>YOUR COVER DP IS READY!</h3>
<img class="result-image" id="resultImage">
<br>
<a href="#" id="downloadLink" class="download-btn" download="coverdp.png">DOWNLOAD YOUR DP</a>
</div>
</div>
<div class="owner">Developed with love by MISS ALIYA</div>
</div>
<script>
let selectedStyle = null;
let uploadedImage = null;
document.querySelectorAll('.style-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('selected'));
btn.classList.add('selected');
selectedStyle = btn.dataset.style;
checkReady();
});
});
document.getElementById('uploadLabel').onclick = () => document.getElementById('imageInput').click();
document.getElementById('imageInput').onchange = (e) => {
const file = e.target.files[0];
if(file){
uploadedImage = file;
document.getElementById('fileInfo').innerHTML = 'Selected: ' + file.name;
const reader = new FileReader();
reader.onload = (ev) => { document.getElementById('previewBox').innerHTML = '<img src="'+ev.target.result+'" class="preview-image">'; };
reader.readAsDataURL(file);
checkReady();
}
};
function checkReady(){ document.getElementById('createBtn').disabled = !(selectedStyle && uploadedImage); }
document.getElementById('createBtn').onclick = async () => {
if(!selectedStyle || !uploadedImage) return;
const formData = new FormData();
formData.append('image', uploadedImage);
formData.append('style', selectedStyle);
document.getElementById('createBtn').disabled = true;
document.getElementById('loading').style.display = 'block';
document.getElementById('resultArea').style.display = 'none';
try{
const response = await fetch('/create', { method: 'POST', body: formData });
if(!response.ok) throw new Error('Failed');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
document.getElementById('resultImage').src = url;
document.getElementById('downloadLink').href = url;
document.getElementById('resultArea').style.display = 'block';
}catch(err){ alert('Error: ' + err.message); }
finally{
document.getElementById('createBtn').disabled = false;
document.getElementById('loading').style.display = 'none';
}
};
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(getHTML()));

app.post('/create', upload.single('image'), async (req, res) => {
  try {
    const styleId = parseInt(req.body.style);
    const imageBuffer = fs.readFileSync(req.file.path);
    const outputPath = await processImage(imageBuffer, styleId);
    res.sendFile(path.resolve(outputPath), () => {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
      try { fs.unlinkSync(outputPath); } catch(e) {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log('MISS ALIYA STUDIO running on port', PORT));
