const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 3000;

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
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<title>✨ MISS ALIYA | Premium Cover DP Studio ✨</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background: radial-gradient(circle at 0% 0%, #0a0a2a, #1a1a3a, #0d0d2b);
    min-height: 100vh;
    padding: 20px;
    position: relative;
    overflow-x: hidden;
  }

  /* Animated Background */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,107,107,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') repeat-x bottom;
    background-size: cover;
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
  }

  /* Floating Particles Effect */
  .particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .particle {
    position: absolute;
    background: radial-gradient(circle, rgba(255,215,0,0.8), rgba(255,107,107,0.4));
    border-radius: 50%;
    animation: float 8s infinite ease-in-out;
    filter: blur(3px);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-30px) translateX(20px); opacity: 0.8; }
  }

  .container {
    max-width: 1300px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  /* Glowing Header */
  .header {
    text-align: center;
    margin-bottom: 40px;
    animation: glowPulse 2s infinite, slideDown 0.8s ease;
  }

  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 20px rgba(255,107,107,0.5); }
    50% { text-shadow: 0 0 40px rgba(255,215,0,0.8), 0 0 60px rgba(255,107,107,0.6); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-50px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .header h1 {
    font-size: 4rem;
    font-family: 'Orbitron', monospace;
    background: linear-gradient(135deg, #FFD700, #FF6B6B, #FFB347, #FF6B6B);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 2px;
    margin-bottom: 10px;
  }

  .glow-text {
    font-size: 1rem;
    color: #FFD700;
    letter-spacing: 4px;
    word-break: keep-all;
    display: inline-block;
    background: rgba(0,0,0,0.5);
    padding: 5px 20px;
    border-radius: 50px;
    backdrop-filter: blur(5px);
  }

  /* Premium Card */
  .premium-card {
    background: rgba(20, 20, 50, 0.7);
    backdrop-filter: blur(15px);
    border-radius: 40px;
    padding: 35px;
    border: 1px solid rgba(255, 215, 0, 0.3);
    box-shadow: 0 25px 45px rgba(0,0,0,0.4), 0 0 30px rgba(255,107,107,0.2);
    transition: all 0.4s;
  }

  /* Preview Area 3D */
  .preview-3d {
    background: linear-gradient(145deg, #1a1a3a, #0f0f2a);
    border-radius: 30px;
    padding: 25px;
    margin-bottom: 30px;
    border: 1px solid rgba(255,215,0,0.5);
    box-shadow: 0 20px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
    transition: transform 0.3s;
  }

  .preview-3d:hover {
    transform: translateY(-5px);
  }

  .preview-box {
    background: rgba(0,0,0,0.4);
    border-radius: 25px;
    min-height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(255,215,0,0.5);
    transition: all 0.3s;
  }

  .preview-image {
    max-width: 100%;
    max-height: 340px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 2px solid #FFD700;
  }

  .placeholder-icon {
    text-align: center;
    color: rgba(255,215,0,0.6);
  }

  .placeholder-icon i {
    font-size: 5rem;
    margin-bottom: 15px;
    display: block;
  }

  /* Style Grid - Neon Cards */
  .section-title {
    text-align: center;
    margin: 30px 0 20px;
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FFD700, #FF6B6B);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .neon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .neon-btn {
    background: linear-gradient(145deg, #1f1f3f, #15152f);
    border: none;
    padding: 18px 10px;
    border-radius: 25px;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    font-family: 'Orbitron', monospace;
    border: 1px solid rgba(255,215,0,0.3);
  }

  .neon-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent);
    transition: left 0.5s;
  }

  .neon-btn:hover::before {
    left: 100%;
  }

  .neon-btn:hover {
    transform: translateY(-5px) scale(1.05);
    border-color: #FFD700;
    box-shadow: 0 0 20px rgba(255,215,0,0.5);
  }

  .neon-btn.selected {
    background: linear-gradient(135deg, #FFD700, #FF6B6B);
    color: #0a0a2a;
    text-shadow: none;
    border-color: white;
    box-shadow: 0 0 30px rgba(255,215,0,0.8);
  }

  .style-name {
    font-size: 0.7rem;
    opacity: 0.8;
    margin-top: 8px;
    font-family: 'Poppins', sans-serif;
  }

  /* Upload Zone */
  .upload-zone {
    background: linear-gradient(145deg, #1f1f3f, #15152f);
    border-radius: 25px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px dashed rgba(255,215,0,0.4);
    margin-bottom: 20px;
  }

  .upload-zone:hover {
    border-color: #FFD700;
    background: linear-gradient(145deg, #25254a, #1a1a3a);
    transform: scale(1.01);
  }

  .upload-zone i {
    font-size: 3rem;
    color: #FFD700;
    margin-bottom: 10px;
  }

  /* Glow Button */
  .glow-button {
    width: 100%;
    background: linear-gradient(135deg, #FFD700, #FF6B6B, #FFB347);
    border: none;
    padding: 18px;
    border-radius: 50px;
    color: #0a0a2a;
    font-weight: 800;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s;
    font-family: 'Orbitron', monospace;
    letter-spacing: 2px;
  }

  .glow-button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255,215,0,0.6);
    letter-spacing: 4px;
  }

  .glow-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Result Card */
  .result-card {
    margin-top: 30px;
    background: linear-gradient(145deg, #1a1a3a, #0f0f2a);
    border-radius: 30px;
    padding: 25px;
    text-align: center;
    border: 1px solid #FFD700;
    display: none;
  }

  .result-image {
    max-width: 100%;
    border-radius: 20px;
    margin: 20px 0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 3px solid #FFD700;
  }

  .download-neon {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #4CAF50;
    color: white;
    padding: 14px 35px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: 0.3s;
    margin-top: 10px;
  }

  .download-neon:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px #4CAF50;
  }

  /* Loading Animation */
  .loading-overlay {
    display: none;
    text-align: center;
    padding: 30px;
  }

  .ring {
    display: inline-block;
    width: 80px;
    height: 80px;
    border: 4px solid rgba(255,215,0,0.3);
    border-radius: 50%;
    border-top-color: #FFD700;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .file-status {
    text-align: center;
    margin-top: 10px;
    color: #FFD700;
    font-size: 0.85rem;
  }

  /* Footer */
  .footer {
    text-align: center;
    margin-top: 35px;
    color: rgba(255,215,0,0.6);
    font-size: 0.8rem;
  }

  @media (max-width: 680px) {
    .header h1 { font-size: 2rem; }
    .neon-grid { gap: 12px; }
    .neon-btn { padding: 12px 5px; font-size: 1rem; }
    .glow-button { font-size: 1rem; padding: 14px; }
  }
</style>
</head>
<body>
<div class="particles" id="particles"></div>
<div class="container">
  <div class="header">
    <h1>👑 MISS ALIYA STUDIO 👑</h1>
    <div class="glow-text">✦ PROFESSIONAL COVER DP MAKER ✦</div>
  </div>

  <div class="premium-card">
    <div class="preview-3d">
      <div class="preview-box" id="previewBox">
        <div class="placeholder-icon">
          <i class="fas fa-crown"></i>
          <p>Your Masterpiece Awaits</p>
          <p style="font-size: 0.8rem;">⬇ Upload & Select Style ⬇</p>
        </div>
      </div>
    </div>

    <div class="section-title">
      <i class="fas fa-magic"></i> SELECT YOUR STYLE <i class="fas fa-star"></i>
    </div>
    <div class="neon-grid" id="styleGrid">
      <button class="neon-btn" data-style="1">❶<br><span class="style-name">ROSE</span></button>
      <button class="neon-btn" data-style="2">❷<br><span class="style-name">HEART</span></button>
      <button class="neon-btn" data-style="3">❸<br><span class="style-name">ELEGANT</span></button>
      <button class="neon-btn" data-style="4">❹<br><span class="style-name">GOLDEN</span></button>
      <button class="neon-btn" data-style="5">❺<br><span class="style-name">PINK</span></button>
      <button class="neon-btn" data-style="6">❻<br><span class="style-name">MODERN</span></button>
      <button class="neon-btn" data-style="7">❼<br><span class="style-name">CLASSIC</span></button>
    </div>

    <div class="upload-zone" id="uploadZone">
      <i class="fas fa-cloud-upload-alt"></i>
      <p><strong>CLICK OR DRAG & DROP</strong><br>Your High Quality Photo</p>
      <input type="file" id="imageInput" accept="image/*" style="display: none;">
    </div>
    <div class="file-status" id="fileStatus">⚡ No image selected ⚡</div>

    <button class="glow-button" id="createBtn" disabled>
      <i class="fas fa-gem"></i> CREATE COVER DP <i class="fas fa-gem"></i>
    </button>

    <div class="loading-overlay" id="loadingOverlay">
      <div class="ring"></div>
      <p style="margin-top: 15px; color:#FFD700;">✨ Processing with AI Magic ✨</p>
    </div>

    <div class="result-card" id="resultCard">
      <h3><i class="fas fa-check-circle"></i> YOUR EXCLUSIVE COVER DP</h3>
      <img class="result-image" id="resultImg" alt="Cover DP">
      <a href="#" id="downloadLink" class="download-neon" download="miss_aliya_cover.png">
        <i class="fas fa-download"></i> DOWNLOAD NOW
      </a>
    </div>
  </div>
  <div class="footer">
    <i class="fas fa-heart" style="color:#FF6B6B;"></i> DEVELOPED WITH PRECISION BY MISS ALIYA <i class="fas fa-heart" style="color:#FF6B6B;"></i>
  </div>
</div>

<script>
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for(let i = 0; i < 45; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.width = Math.random() * 8 + 2 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = Math.random() * 6 + 5 + 's';
      particlesContainer.appendChild(particle);
    }
  }
  createParticles();

  let selectedStyle = null;
  let uploadedImage = null;

  document.querySelectorAll('.neon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.neon-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedStyle = btn.dataset.style;
      checkReady();
    });
  });

  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('imageInput');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#FFD700';
    uploadZone.style.transform = 'scale(1.01)';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'rgba(255,215,0,0.4)';
    uploadZone.style.transform = 'scale(1)';
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'rgba(255,215,0,0.4)';
    const file = e.dataTransfer.files[0];
    if(file && file.type.startsWith('image/')) handleImage(file);
  });

  fileInput.addEventListener('change', (e) => {
    if(e.target.files[0]) handleImage(e.target.files[0]);
  });

  function handleImage(file) {
    uploadedImage = file;
    document.getElementById('fileStatus').innerHTML = '<i class="fas fa-check-circle"></i> Selected: ' + file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('previewBox').innerHTML = '<img src="'+ev.target.result+'" class="preview-image" alt="Preview">';
    };
    reader.readAsDataURL(file);
    checkReady();
  }

  function checkReady() {
    document.getElementById('createBtn').disabled = !(selectedStyle && uploadedImage);
  }

  document.getElementById('createBtn').addEventListener('click', async () => {
    if(!selectedStyle || !uploadedImage) return;
    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('style', selectedStyle);
    document.getElementById('createBtn').disabled = true;
    document.getElementById('loadingOverlay').style.display = 'block';
    document.getElementById('resultCard').style.display = 'none';
    try {
      const response = await fetch('/create', { method: 'POST', body: formData });
      if(!response.ok) throw new Error('Server Error');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      document.getElementById('resultImg').src = url;
      document.getElementById('downloadLink').href = url;
      document.getElementById('resultCard').style.display = 'block';
    } catch(err) {
      alert('Error: ' + err.message);
    } finally {
      document.getElementById('createBtn').disabled = false;
      document.getElementById('loadingOverlay').style.display = 'none';
    }
  });
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

app.listen(PORT, () => console.log('🚀 MISS ALIYA STUDIO RUNNING on port', PORT));
