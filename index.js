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

// ========== COVER DP TEMPLATES (7) ==========
const coverTemplates = {
  1: { url: "https://i.ibb.co/0jhSFqMM/c43702d446a6.jpg", shape: "circle", size: 268, posX: 74, posY: 67, name: "Romantic Rose" },
  2: { url: "https://i.ibb.co/9kY65xss/688f96416cc9.jpg", shape: "circle", size: 220, posX: 79, posY: 105, name: "Lovely Heart" },
  3: { url: "https://i.ibb.co/pBkYHvg2/c0a885aa9aaa.jpg", shape: "circle", size: 265, posX: 117, posY: 108, name: "Elegant Frame" },
  4: { url: "https://i.ibb.co/rGJZqChV/d49ec2cc56e0.jpg", shape: "circle", size: 220, posX: 306, posY: 128, name: "Golden Glow" },
  5: { url: "https://i.ibb.co/Qj7hJkmf/245285aba927.jpg", shape: "circle", size: 262, posX: 82, posY: 124, name: "Soft Pink" },
  6: { url: "https://i.ibb.co/mVxrF0bW/5eeafb5cdae6.jpg", shape: "rectangle", width: 170, height: 360, posX: 440, posY: 65, name: "Modern Frame" },
  7: { url: "https://i.ibb.co/m5W8TMjj/86de3ad52a9c.jpg", shape: "rectangle", width: 195, height: 265, posX: 520, posY: 95, name: "Classic Border" }
};

// ========== FRAME DP TEMPLATES (9) ==========
const frameTemplates = {
  1: { url: "https://i.ibb.co/jP5RT6mh/59231906c30e.jpg", width: 230, height: 310, posX: 210, posY: 93, name: "Frame 1" },
  2: { url: "https://i.ibb.co/LXZMTgwK/3ba0f3daebfb.jpg", width: 210, height: 355, posX: 236, posY: 80, name: "Frame 2" },
  3: { url: "https://i.ibb.co/vCp4xnkV/4ca998d49fb1.jpg", width: 220, height: 300, posX: 126, posY: 84, name: "Frame 3" },
  4: { url: "https://i.ibb.co/BVq7Txb3/955c5d7c4b60.jpg", width: 212, height: 307, posX: 34, posY: 65, name: "Frame 4" },
  5: { url: "https://i.ibb.co/s9V2XSF6/b3e1f8cb43d2.jpg", width: 220, height: 310, posX: "auto", posY: 80, name: "Frame 5" },
  6: { url: "https://i.ibb.co/93gjcXvv/58b3d5968b15.jpg", width: 200, height: 290, posX: 152, posY: 103, name: "Frame 6" },
  7: { url: "https://i.ibb.co/JWYBCLGw/f063e0ce45e0.jpg", width: 200, height: 330, posX: 111, posY: 18, name: "Frame 7" },
  8: { url: "https://i.ibb.co/Pv6bhKbK/2d5abf483d1e.jpg", width: 205, height: 300, posX: 34, posY: 71, name: "Frame 8" },
  9: { url: "https://i.ibb.co/s9dHV7K1/6aa4dc51020a.jpg", width: 200, height: 300, posX: 89, posY: 43, name: "Frame 9" }
};

// ========== PAIR DP TEMPLATES (15) - WITH 2 IMAGES ==========
const pairTemplates = {
  1: { url: "https://i.ibb.co/Zptb9xJ2/803a8e8cc475.jpg", shape: "circle", size1: 230, size2: 230, x1: 10, y1: 5, x2: 245, y2: 5, name: "Pair 1" },
  2: { url: "https://i.ibb.co/q3DDkP9D/9fe55575821c.jpg", shape: "circle", size1: 117, size2: 117, x1: 48, y1: 175, x2: 310, y2: 170, name: "Pair 2" },
  3: { url: "https://i.ibb.co/LDpk5SGX/39cb5df1b030.jpg", shape: "circle", size1: 120, size2: 120, x1: 66, y1: 114, x2: 240, y2: 114, name: "Pair 3" },
  4: { url: "https://i.ibb.co/2e3d1e0cfa8a.jpg", shape: "circle", size1: 218, size2: 218, x1: 86, y1: 95, x2: 435, y2: 98, name: "Pair 4" },
  5: { url: "https://i.ibb.co/0e465782e95a.jpg", shape: "circle", size1: 240, size2: 242, x1: 45, y1: 118, x2: 433, y2: 116, name: "Pair 5" },
  6: { url: "https://i.ibb.co/4d9f6c32ac89.jpg", shape: "square", size1: 110, size2: 110, x1: 131, y1: 88, x2: 292, y2: 88, name: "Pair 6" },
  7: { url: "https://i.ibb.co/44083411ce02.jpg", shape: "heart", size1: 210, size2: 210, x1: 28, y1: 134, x2: 268, y2: 140, name: "Pair 7" },
  8: { url: "https://i.ibb.co/d57df01d663b.jpg", shape: "circle", size1: 280, size2: 280, x1: 63, y1: 80, x2: 525, y2: 88, name: "Pair 8" },
  9: { url: "https://i.ibb.co/bb84c4de0b9c.jpg", shape: "circle", size1: 160, size2: 160, x1: 85, y1: 160, x2: 590, y2: 160, name: "Pair 9" },
  10: { url: "https://i.ibb.co/63caff53d8d5.jpg", shape: "circle", size1: 180, size2: 180, x1: 123, y1: 160, x2: 493, y2: 160, name: "Pair 10" },
  11: { url: "https://i.ibb.co/c6b869aae271.jpg", shape: "circle", size1: 140, size2: 140, x1: 23, y1: 140, x2: 310, y2: 138, name: "Pair 11" },
  12: { url: "https://i.ibb.co/69c73e098eb0.jpg", shape: "circle", size1: 190, size2: 190, x1: 178, y1: 140, x2: 450, y2: 150, name: "Pair 12" },
  13: { url: "https://i.ibb.co/b9946659be99.jpg", shape: "circle", size1: 250, size2: 250, x1: 55, y1: 205, x2: 565, y2: 25, name: "Pair 13" },
  14: { url: "https://i.ibb.co/d24adccf0acc.jpg", shape: "circle", size1: 220, size2: 220, x1: 130, y1: 125, x2: 500, y2: 125, name: "Pair 14" },
  15: { url: "https://i.ibb.co/WBZBPcJ/gifpair.gif", shape: "gif", name: "Pair 15 (GIF)" }
};

async function downloadTemplate(url, id, type) {
  const templatePath = path.join(cacheDir, `${type}_${id}.png`);
  if (fs.existsSync(templatePath)) return templatePath;
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
    fs.writeFileSync(templatePath, Buffer.from(response.data));
    return templatePath;
  } catch (err) {
    console.error(`Download failed for ${type}_${id}:`, err.message);
    return null;
  }
}

async function makeCircleImage(buffer, size) {
  const image = await Jimp.read(buffer);
  image.resize(size, size);
  const mask = new Jimp(size, size, 0x00000000);
  const center = size / 2;
  const radius = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      if (dist <= radius) mask.setPixelColor(0xFFFFFFFF, x, y);
    }
  }
  image.mask(mask, 0, 0);
  return image;
}

async function makeSquareImage(buffer, size) {
  const image = await Jimp.read(buffer);
  image.resize(size, size);
  return image;
}

async function makeHeartImage(buffer, size) {
  const image = await Jimp.read(buffer);
  image.resize(size, size);
  const mask = new Jimp(size, size, 0x00000000);
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - cx) / cx * 2.6;
      const ny = (y - cy) / cy * 2.8;
      const heart = Math.pow(nx*nx + ny*ny - 1, 3) - nx*nx * Math.pow(ny, 3);
      if (heart <= 0) mask.setPixelColor(0xFFFFFFFF, x, y);
    }
  }
  image.mask(mask, 0, 0);
  return image;
}

async function processCover(buffer, id) {
  const config = coverTemplates[id];
  const templatePath = await downloadTemplate(config.url, id, 'cover');
  if (!templatePath) throw new Error('Template download failed');
  let template = await Jimp.read(templatePath);
  let userImg;
  if (config.shape === 'circle') {
    userImg = await makeCircleImage(buffer, config.size);
    template.composite(userImg, config.posX, config.posY);
  } else {
    userImg = await Jimp.read(buffer);
    userImg.resize(config.width, config.height);
    template.composite(userImg, config.posX, config.posY);
  }
  const outPath = path.join(cacheDir, `out_${Date.now()}.png`);
  await template.writeAsync(outPath);
  return outPath;
}

async function processFrame(buffer, id) {
  const config = frameTemplates[id];
  const templatePath = await downloadTemplate(config.url, id, 'frame');
  if (!templatePath) throw new Error('Template download failed');
  let template = await Jimp.read(templatePath);
  let userImg = await Jimp.read(buffer);
  userImg.resize(config.width, config.height);
  let x = config.posX === 'auto' ? (template.bitmap.width - config.width) / 2 : config.posX;
  template.composite(userImg, x, config.posY);
  const outPath = path.join(cacheDir, `out_${Date.now()}.png`);
  await template.writeAsync(outPath);
  return outPath;
}

// PAIR PROCESSOR - 2 IMAGES
async function processPair(buffer1, buffer2, id) {
  const config = pairTemplates[id];
  
  // GIF special case
  if (config.shape === 'gif') {
    const templatePath = await downloadTemplate(config.url, id, 'pair');
    if (!templatePath) throw new Error('GIF download failed');
    const outPath = path.join(cacheDir, `out_${Date.now()}.png`);
    fs.copyFileSync(templatePath, outPath);
    return outPath;
  }
  
  const templatePath = await downloadTemplate(config.url, id, 'pair');
  if (!templatePath) throw new Error('Template download failed');
  let template = await Jimp.read(templatePath);
  
  // Process first image
  let img1;
  if (config.shape === 'heart') {
    img1 = await makeHeartImage(buffer1, config.size1);
  } else if (config.shape === 'square') {
    img1 = await makeSquareImage(buffer1, config.size1);
  } else {
    img1 = await makeCircleImage(buffer1, config.size1);
  }
  template.composite(img1, config.x1, config.y1);
  
  // Process second image
  let img2;
  if (config.shape === 'heart') {
    img2 = await makeHeartImage(buffer2, config.size2);
  } else if (config.shape === 'square') {
    img2 = await makeSquareImage(buffer2, config.size2);
  } else {
    img2 = await makeCircleImage(buffer2, config.size2);
  }
  template.composite(img2, config.x2, config.y2);
  
  const outPath = path.join(cacheDir, `out_${Date.now()}.png`);
  await template.writeAsync(outPath);
  return outPath;
}

// HTML - with separate uploads for Pair DP
const getHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<title>👑 MISS ALIYA | PREMIUM DP STUDIO 👑</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Poppins', sans-serif;
    background: radial-gradient(circle at 0% 0%, #0a0a2a, #1a1a3a, #0d0d2b);
    min-height: 100vh;
    overflow-x: hidden;
  }
  .welcome-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, #1a1a3a, #0a0a2a);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeOut 3.5s ease forwards 2.5s;
  }
  @keyframes fadeOut { 0%,70%{opacity:1;visibility:visible;}100%{opacity:0;visibility:hidden;} }
  .welcome-card { text-align: center; animation: zoomIn 0.8s ease; }
  @keyframes zoomIn { from { transform: scale(0.2) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
  .sliding-name {
    font-size: 4rem;
    font-family: 'Orbitron', monospace;
    background: linear-gradient(135deg, #FFD700, #FF6B6B, #FFB347);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    letter-spacing: 8px;
    overflow: hidden;
    white-space: nowrap;
    animation: slideIn 1.5s ease-out;
  }
  @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .glow-sub { font-size: 1.5rem; color: #FFD700; text-shadow: 0 0 20px #FFD700; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{text-shadow:0 0 20px #FFD700;}50%{text-shadow:0 0 50px #FF6B6B;} }
  .owner-img-welcome {
    width: 150px; height: 150px; border-radius: 50%; border: 4px solid #FFD700;
    margin: 20px auto; object-fit: cover; box-shadow: 0 0 40px rgba(255,215,0,0.6);
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-15px);} }
  .attitude-text { font-size: 1rem; color: rgba(255,215,0,0.8); margin-top: 20px; }
  .main-content { opacity: 0; animation: fadeInMain 0.8s ease forwards 3s; }
  @keyframes fadeInMain { to { opacity: 1; } }
  .particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
  .particle {
    position: absolute;
    background: radial-gradient(circle, rgba(255,215,0,0.8), rgba(255,107,107,0.4));
    border-radius: 50%;
    animation: particleFloat 8s infinite ease-in-out;
  }
  @keyframes particleFloat { 0%,100%{transform:translateY(0) translateX(0);opacity:0.3;}50%{transform:translateY(-30px) translateX(20px);opacity:0.8;} }
  .container { max-width: 1400px; margin: 0 auto; padding: 20px; position: relative; z-index: 2; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 2.5rem; font-family: 'Orbitron', monospace; background: linear-gradient(135deg, #FFD700, #FF6B6B); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .category-tabs { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
  .tab-btn {
    background: linear-gradient(135deg, #1f1f3f, #15152f);
    border: 2px solid rgba(255,215,0,0.3);
    padding: 12px 30px;
    border-radius: 50px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }
  .tab-btn.active { background: linear-gradient(135deg, #FFD700, #FF6B6B); color: #0a0a2a; border-color: white; box-shadow: 0 0 20px rgba(255,215,0,0.5); }
  .preview-3d { background: linear-gradient(145deg, #1a1a3a, #0f0f2a); border-radius: 30px; padding: 25px; margin-bottom: 30px; border: 1px solid rgba(255,215,0,0.5); }
  .preview-box { background: rgba(0,0,0,0.4); border-radius: 25px; min-height: 300px; display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,215,0,0.5); }
  .preview-image { max-width: 100%; max-height: 250px; border-radius: 15px; border: 2px solid #FFD700; }
  .double-upload {
    display: flex;
    gap: 20px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .upload-box {
    flex: 1;
    background: linear-gradient(145deg, #1f1f3f, #15152f);
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    border: 2px dashed rgba(255,215,0,0.4);
    transition: all 0.3s;
  }
  .upload-box:hover { border-color: #FFD700; transform: scale(1.01); }
  .upload-box i { font-size: 2rem; color: #FFD700; }
  .upload-box p { margin-top: 10px; color: white; }
  .style-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 12px;
    margin: 20px 0;
    max-height: 280px;
    overflow-y: auto;
    padding: 5px;
  }
  .style-btn {
    background: linear-gradient(145deg, #1f1f3f, #15152f);
    border: 1px solid rgba(255,215,0,0.3);
    padding: 10px 5px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.75rem;
  }
  .style-btn:hover, .style-btn.selected { background: linear-gradient(135deg, #FFD700, #FF6B6B); color: #0a0a2a; border-color: white; transform: scale(1.02); }
  .glow-button {
    width: 100%;
    background: linear-gradient(135deg, #FFD700, #FF6B6B);
    border: none;
    padding: 18px;
    border-radius: 50px;
    color: #0a0a2a;
    font-weight: 800;
    font-size: 1.2rem;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    margin-top: 20px;
  }
  .glow-button:disabled { opacity: 0.5; cursor: not-allowed; }
  .result-card {
    margin-top: 30px;
    background: linear-gradient(145deg, #1a1a3a, #0f0f2a);
    border-radius: 25px;
    padding: 25px;
    text-align: center;
    border: 1px solid #FFD700;
    display: none;
  }
  .result-image { max-width: 100%; border-radius: 15px; margin: 15px 0; border: 3px solid #FFD700; }
  .download-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: #4CAF50; color: white; padding: 12px 30px;
    border-radius: 50px; text-decoration: none;
  }
  .loading { display: none; text-align: center; padding: 30px; }
  .spinner { width: 50px; height: 50px; border: 4px solid rgba(255,215,0,0.3); border-top-color: #FFD700; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .file-status { text-align: center; margin: 10px; color: #FFD700; font-size: 0.8rem; }
  .footer { text-align: center; margin-top: 30px; color: rgba(255,215,0,0.6); }
  @media (max-width: 768px) {
    .sliding-name { font-size: 2rem; letter-spacing: 3px; }
    .glow-sub { font-size: 1rem; }
    .owner-img-welcome { width: 100px; height: 100px; }
    .double-upload { flex-direction: column; }
    .header h1 { font-size: 1.5rem; }
    .tab-btn { padding: 8px 15px; font-size: 0.8rem; }
  }
</style>
</head>
<body>

<div class="welcome-screen" id="welcomeScreen">
  <div class="welcome-card">
    <img src="https://i.ibb.co/rG46PWKB/file-00000000d27471fa8382db8cabb463b2.png" class="owner-img-welcome" alt="MISS ALIYA" onerror="this.src='https://i.ibb.co/rG46PWKB/file-00000000d27471fa8382db8cabb463b2.png'">
    <div class="sliding-name">👑 MISS ALIYA 👑</div>
    <div class="glow-sub">✦ THE ATTITUDE STUDIO ✦</div>
    <div class="attitude-text"><i class="fas fa-crown"></i> ROYAL • PREMIUM • EXCLUSIVE <i class="fas fa-crown"></i></div>
  </div>
</div>

<div class="particles" id="particles"></div>

<div class="main-content">
<div class="container">
  <div class="header">
    <h1><i class="fas fa-gem"></i> MISS ALIYA STUDIO <i class="fas fa-gem"></i></h1>
  </div>

  <div class="category-tabs">
    <button class="tab-btn active" data-cat="cover">📸 COVER DP (7)</button>
    <button class="tab-btn" data-cat="frame">🖼️ FRAME DP (9)</button>
    <button class="tab-btn" data-cat="pair">👫 PAIR DP (15)</button>
  </div>

  <div class="preview-3d">
    <div class="preview-box" id="previewBox"><div style="color:#FFD700;"><i class="fas fa-cloud-upload-alt" style="font-size:3rem;"></i><p>Your masterpiece will appear here</p></div></div>
  </div>

  <!-- Cover Grid -->
  <div id="coverGrid" class="style-grid">
    ${[1,2,3,4,5,6,7].map(i => `<button class="style-btn" data-cat="cover" data-style="${i}">${i}️⃣ ${coverTemplates[i].name}</button>`).join('')}
  </div>

  <!-- Frame Grid -->
  <div id="frameGrid" class="style-grid" style="display:none;">
    ${[1,2,3,4,5,6,7,8,9].map(i => `<button class="style-btn" data-cat="frame" data-style="${i}">${i}️⃣ ${frameTemplates[i].name}</button>`).join('')}
  </div>

  <!-- Pair Grid -->
  <div id="pairGrid" class="style-grid" style="display:none;">
    ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => `<button class="style-btn" data-cat="pair" data-style="${i}">${i}️⃣ ${pairTemplates[i].name}</button>`).join('')}
  </div>

  <!-- Single Upload (Cover/Frame) -->
  <div id="singleUpload" style="display:block;">
    <div class="upload-box" id="singleUploadZone">
      <i class="fas fa-cloud-upload-alt"></i>
      <p><strong>CLICK OR DRAG & DROP</strong><br>Your Photo</p>
      <input type="file" id="singleImageInput" accept="image/*" style="display:none;">
    </div>
    <div id="singleStatus" class="file-status">⚡ No image selected ⚡</div>
  </div>

  <!-- Double Upload (Pair) -->
  <div id="doubleUpload" style="display:none;">
    <div class="double-upload">
      <div class="upload-box" id="uploadZone1">
        <i class="fas fa-user"></i>
        <p><strong>IMAGE 1</strong><br>Person 1</p>
        <input type="file" id="imageInput1" accept="image/*" style="display:none;">
      </div>
      <div class="upload-box" id="uploadZone2">
        <i class="fas fa-user"></i>
        <p><strong>IMAGE 2</strong><br>Person 2</p>
        <input type="file" id="imageInput2" accept="image/*" style="display:none;">
      </div>
    </div>
    <div id="doubleStatus" class="file-status">⚡ Waiting for both images ⚡</div>
  </div>

  <button class="glow-button" id="createBtn" disabled><i class="fas fa-magic"></i> CREATE PREMIUM DP <i class="fas fa-magic"></i></button>

  <div class="loading" id="loading"><div class="spinner"></div><p>✨ MISS ALIYA IS CREATING ✨</p></div>
  <div class="result-card" id="resultCard"><h3>✅ YOUR PREMIUM DP IS READY!</h3><img class="result-image" id="resultImage"><br><a href="#" id="downloadLink" class="download-btn" download="miss_aliya_dp.png"><i class="fas fa-download"></i> DOWNLOAD NOW</a></div>
  <div class="footer"><i class="fas fa-heart" style="color:#FF6B6B;"></i> CREATED WITH ATTITUDE BY MISS ALIYA <i class="fas fa-heart" style="color:#FF6B6B;"></i></div>
</div></div>

<script>
function createParticles(){for(let i=0;i<50;i++){let p=document.createElement('div');p.classList.add('particle');p.style.width=Math.random()*8+2+'px';p.style.height=p.style.width;p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animationDelay=Math.random()*10+'s';p.style.animationDuration=Math.random()*8+5+'s';document.getElementById('particles').appendChild(p);}}createParticles();

let selectedCategory='cover',selectedStyle=null;
let singleImage=null;
let pairImage1=null,pairImage2=null;
let singlePreview=null;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn=>{btn.onclick=()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  selectedCategory=btn.dataset.cat;
  selectedStyle=null;
  document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('coverGrid').style.display=selectedCategory==='cover'?'grid':'none';
  document.getElementById('frameGrid').style.display=selectedCategory==='frame'?'grid':'none';
  document.getElementById('pairGrid').style.display=selectedCategory==='pair'?'grid':'none';
  document.getElementById('singleUpload').style.display=selectedCategory==='pair'?'none':'block';
  document.getElementById('doubleUpload').style.display=selectedCategory==='pair'?'block':'none';
  checkReady();
};});

// Style selection
document.querySelectorAll('.style-btn').forEach(btn=>{btn.onclick=()=>{
  document.querySelectorAll('.style-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedStyle=btn.dataset.style;
  checkReady();
};});

// Single upload
const singleZone=document.getElementById('singleUploadZone');
const singleInput=document.getElementById('singleImageInput');
if(singleZone){singleZone.onclick=()=>singleInput.click();
singleZone.ondragover=e=>{e.preventDefault();singleZone.style.borderColor='#FFD700';};
singleZone.ondragleave=()=>{singleZone.style.borderColor='rgba(255,215,0,0.4)';};
singleZone.ondrop=e=>{e.preventDefault();singleZone.style.borderColor='rgba(255,215,0,0.4)';const file=e.dataTransfer.files[0];if(file&&file.type.startsWith('image/'))handleSingleImage(file);};}
singleInput.onchange=e=>{if(e.target.files[0])handleSingleImage(e.target.files[0]);};
function handleSingleImage(file){
  singleImage=file;
  document.getElementById('singleStatus').innerHTML='✅ '+file.name.slice(0,30);
  const reader=new FileReader();
  reader.onload=ev=>{document.getElementById('previewBox').innerHTML='<img src="'+ev.target.result+'" class="preview-image">';singlePreview=ev.target.result;};
  reader.readAsDataURL(file);
  checkReady();
}

// Pair uploads
const zone1=document.getElementById('uploadZone1'),zone2=document.getElementById('uploadZone2');
const input1=document.getElementById('imageInput1'),input2=document.getElementById('imageInput2');
if(zone1){zone1.onclick=()=>input1.click();
zone1.ondrop=e=>{e.preventDefault();const file=e.dataTransfer.files[0];if(file&&file.type.startsWith('image/'))handlePairImage1(file);};}
if(zone2){zone2.onclick=()=>input2.click();
zone2.ondrop=e=>{e.preventDefault();const file=e.dataTransfer.files[0];if(file&&file.type.startsWith('image/'))handlePairImage2(file);};}
input1.onchange=e=>{if(e.target.files[0])handlePairImage1(e.target.files[0]);};
input2.onchange=e=>{if(e.target.files[0])handlePairImage2(e.target.files[0]);};
function handlePairImage1(file){
  pairImage1=file;
  zone1.style.borderColor='#4CAF50';
  document.getElementById('pair1Status')?document.getElementById('pair1Status').innerHTML='✅':null;
  updatePairPreview();
  checkReady();
}
function handlePairImage2(file){
  pairImage2=file;
  zone2.style.borderColor='#4CAF50';
  checkReady();
}
function updatePairPreview(){
  if(pairImage1){
    const reader=new FileReader();
    reader.onload=ev=>{document.getElementById('previewBox').innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"><img src="'+ev.target.result+'" style="max-width:45%;max-height:200px;border-radius:15px;border:2px solid #FFD700;"></div>';};
    reader.readAsDataURL(pairImage1);
  }
  if(pairImage2){
    const reader=new FileReader();
    reader.onload=ev=>{const existing=document.getElementById('previewBox').innerHTML;document.getElementById('previewBox').innerHTML=existing+'<img src="'+ev.target.result+'" style="max-width:45%;max-height:200px;border-radius:15px;border:2px solid #FFD700;">';};
    reader.readAsDataURL(pairImage2);
  }
}
function checkReady(){
  if(selectedCategory==='pair'){
    document.getElementById('createBtn').disabled=!(selectedStyle&&pairImage1&&pairImage2);
    if(pairImage1&&pairImage2)document.getElementById('doubleStatus').innerHTML='✅ Both images ready!';
    else document.getElementById('doubleStatus').innerHTML='⚠️ Waiting for both images ('+(pairImage1?'✅1':❌1')+(pairImage2?' ✅2':' ❌2')+')';
  }else{
    document.getElementById('createBtn').disabled=!(selectedStyle&&singleImage);
  }
}
// Track pair status text
setInterval(()=>{
  if(selectedCategory==='pair'){
    const s=document.getElementById('doubleStatus');
    if(s)s.innerHTML='📸 '+(pairImage1?'✅ IMG1 ':'❌ IMG1 ')+(pairImage2?'✅ IMG2':'❌ IMG2');
  }
},500);

document.getElementById('createBtn').onclick=async()=>{
  if(!selectedStyle)return alert('Select a style!');
  const formData=new FormData();
  if(selectedCategory==='pair'){
    if(!pairImage1||!pairImage2)return alert('Upload both images!');
    formData.append('image1',pairImage1);
    formData.append('image2',pairImage2);
    formData.append('type','pair');
  }else{
    if(!singleImage)return alert('Upload an image!');
    formData.append('image1',singleImage);
    formData.append('type',selectedCategory);
  }
  formData.append('style',selectedStyle);
  
  document.getElementById('createBtn').disabled=true;
  document.getElementById('loading').style.display='block';
  document.getElementById('resultCard').style.display='none';
  try{
    const response=await fetch('/create',{method:'POST',body:formData});
    if(!response.ok){const err=await response.json();throw new Error(err.error||'Server error');}
    const blob=await response.blob();
    const url=URL.createObjectURL(blob);
    document.getElementById('resultImage').src=url;
    document.getElementById('downloadLink').href=url;
    document.getElementById('resultCard').style.display='block';
  }catch(err){alert('Error: '+err.message);}
  finally{document.getElementById('createBtn').disabled=false;document.getElementById('loading').style.display='none';}
};
</script>
</body>
</html>`;

// API endpoint
app.post('/create', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
  try {
    const type = req.body.type;
    const styleId = parseInt(req.body.style);
    const file1 = req.files['image1'] ? req.files['image1'][0] : null;
    const file2 = req.files['image2'] ? req.files['image2'][0] : null;
    
    if (!file1) throw new Error('First image is required');
    
    let outputPath;
    const buffer1 = fs.readFileSync(file1.path);
    
    if (type === 'pair') {
      if (!file2) throw new Error('Pair DP requires 2 images');
      const buffer2 = fs.readFileSync(file2.path);
      outputPath = await processPair(buffer1, buffer2, styleId);
      try { fs.unlinkSync(file2.path); } catch(e) {}
    } else if (type === 'cover') {
      outputPath = await processCover(buffer1, styleId);
    } else if (type === 'frame') {
      outputPath = await processFrame(buffer1, styleId);
    } else {
      throw new Error('Invalid type');
    }
    
    res.sendFile(path.resolve(outputPath), () => {
      try { fs.unlinkSync(file1.path); } catch(e) {}
      try { fs.unlinkSync(outputPath); } catch(e) {}
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log('👑 MISS ALIYA STUDIO RUNNING on port', PORT));
