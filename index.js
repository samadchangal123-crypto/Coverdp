const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 3000;

// Create directories
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

// ========== PAIR DP TEMPLATES (15) ==========
const pairTemplates = {
  1: { url: "https://i.ibb.co/Zptb9xJ2/803a8e8cc475.jpg", shape: "circle", size1: 230, size2: 230, x1: 10, y1: 5, x2: 245, y2: 5, name: "Classic Love" },
  2: { url: "https://i.ibb.co/q3DDkP9D/9fe55575821c.jpg", shape: "circle", size1: 117, size2: 117, x1: 48, y1: 175, x2: 310, y2: 170, name: "Romantic Frame" },
  3: { url: "https://i.ibb.co/LDpk5SGX/39cb5df1b030.jpg", shape: "circle", size1: 120, size2: 120, x1: 66, y1: 114, x2: 240, y2: 114, name: "Golden Hearts" },
  4: { url: "https://i.ibb.co/2e3d1e0cfa8a.jpg", shape: "circle", size1: 218, size2: 218, x1: 86, y1: 95, x2: 435, y2: 98, name: "Eternal Bond" },
  5: { url: "https://i.ibb.co/0e465782e95a.jpg", shape: "circle", size1: 240, size2: 242, x1: 45, y1: 118, x2: 433, y2: 116, name: "Royal Couple" },
  6: { url: "https://i.ibb.co/4d9f6c32ac89.jpg", shape: "square", size1: 110, size2: 110, x1: 131, y1: 88, x2: 292, y2: 88, name: "Modern Square" },
  7: { url: "https://i.ibb.co/44083411ce02.jpg", shape: "heart", size1: 210, size2: 210, x1: 28, y1: 134, x2: 268, y2: 140, name: "Heart Shape" },
  8: { url: "https://i.ibb.co/d57df01d663b.jpg", shape: "circle", size1: 280, size2: 280, x1: 63, y1: 80, x2: 525, y2: 88, name: "Big Love" },
  9: { url: "https://i.ibb.co/bb84c4de0b9c.jpg", shape: "circle", size1: 160, size2: 160, x1: 85, y1: 160, x2: 590, y2: 160, name: "Side by Side" },
  10: { url: "https://i.ibb.co/63caff53d8d5.jpg", shape: "circle", size1: 180, size2: 180, x1: 123, y1: 160, x2: 493, y2: 160, name: "Close Together" },
  11: { url: "https://i.ibb.co/c6b869aae271.jpg", shape: "circle", size1: 140, size2: 140, x1: 23, y1: 140, x2: 310, y2: 138, name: "Sweet Pair" },
  12: { url: "https://i.ibb.co/69c73e098eb0.jpg", shape: "circle", size1: 190, size2: 190, x1: 178, y1: 140, x2: 450, y2: 150, name: "Lovely Duo" },
  13: { url: "https://i.ibb.co/b9946659be99.jpg", shape: "circle", size1: 250, size2: 250, x1: 55, y1: 205, x2: 565, y2: 25, name: "Forever Together" },
  14: { url: "https://i.ibb.co/d24adccf0acc.jpg", shape: "circle", size1: 220, size2: 220, x1: 130, y1: 125, x2: 500, y2: 125, name: "Perfect Match" },
  15: { url: "https://i.ibb.co/yVPwR4c/7b33c648c5ff.jpg", shape: "circle", size1: 200, size2: 200, x1: 100, y1: 100, x2: 350, y2: 100, name: "Special Edition" }
};

async function downloadTemplate(url, name) {
  const templatePath = path.join(cacheDir, `${name}.png`);
  if (fs.existsSync(templatePath)) return templatePath;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(templatePath, Buffer.from(response.data));
  return templatePath;
}

async function makeCircleImage(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize(size, size);
  const mask = new Jimp(size, size, 0x00000000);
  const r = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.sqrt((x - r) ** 2 + (y - r) ** 2);
      if (d <= r) mask.setPixelColor(0xFFFFFFFF, x, y);
    }
  }
  img.mask(mask, 0, 0);
  return img;
}

async function makeSquareImage(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize(size, size);
  return img;
}

async function makeHeartImage(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize(size, size);
  const mask = new Jimp(size, size, 0x00000000);
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - cx) / cx * 2.6;
      const ny = (y - cy) / cy * 2.8;
      const val = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(ny, 3);
      if (val <= 0) mask.setPixelColor(0xFFFFFFFF, x, y);
    }
  }
  img.mask(mask, 0, 0);
  return img;
}

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MISS ALIYA STUDIO</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Poppins',sans-serif;background:radial-gradient(circle at 0% 0%,#0a0a2a,#1a1a3a,#0d0d2b);min-height:100vh;}
.welcome-screen{position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a2a;z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeOut 3s ease forwards 2s;}
@keyframes fadeOut{0%,70%{opacity:1}100%{opacity:0;visibility:hidden}}
.welcome-card{text-align:center;animation:zoomIn 0.6s ease;}
@keyframes zoomIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.sliding-name{font-size:3rem;font-family:'Orbitron',monospace;background:linear-gradient(135deg,#FFD700,#FF6B6B,#FFB347);-webkit-background-clip:text;background-clip:text;color:transparent;animation:slideIn 1s ease-out;}
@keyframes slideIn{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
.owner-img{width:130px;height:130px;border-radius:50%;border:3px solid #FFD700;margin:20px auto;object-fit:cover;box-shadow:0 0 30px rgba(255,215,0,0.5);animation:float 3s infinite;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.main-content{opacity:0;animation:fadeMain 0.5s ease forwards 2.2s;}
@keyframes fadeMain{to{opacity:1}}
.container{max-width:1300px;margin:0 auto;padding:20px;position:relative;z-index:2}
.header{text-align:center;margin-bottom:30px}
.header h1{font-size:2.5rem;font-family:'Orbitron',monospace;background:linear-gradient(135deg,#FFD700,#FF6B6B);-webkit-background-clip:text;background-clip:text;color:transparent}
.category-tabs{display:flex;justify-content:center;gap:15px;margin-bottom:30px;flex-wrap:wrap}
.tab-btn{background:#1f1f3f;border:2px solid rgba(255,215,0,0.3);padding:10px 25px;border-radius:50px;color:white;font-weight:bold;cursor:pointer;transition:0.3s}
.tab-btn.active{background:linear-gradient(135deg,#FFD700,#FF6B6B);color:#0a0a2a;border-color:white;box-shadow:0 0 20px rgba(255,215,0,0.5)}
.preview-3d{background:#1a1a3a;border-radius:30px;padding:25px;margin-bottom:30px;border:1px solid rgba(255,215,0,0.3)}
.preview-box{background:rgba(0,0,0,0.4);border-radius:20px;min-height:300px;display:flex;align-items:center;justify-content:center;border:2px dashed rgba(255,215,0,0.5)}
.preview-image{max-width:100%;max-height:280px;border-radius:15px;border:2px solid #FFD700}
.style-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:12px;margin:20px 0;max-height:250px;overflow-y:auto;padding:5px}
.style-btn{background:#1f1f3f;border:1px solid rgba(255,215,0,0.3);padding:10px;border-radius:12px;color:white;font-weight:bold;cursor:pointer;transition:0.3s}
.style-btn:hover,.style-btn.selected{background:linear-gradient(135deg,#FFD700,#FF6B6B);color:#0a0a2a;transform:scale(1.02)}
.double-upload{display:flex;gap:20px;margin:20px 0;flex-wrap:wrap}
.upload-box{flex:1;background:#1f1f3f;border-radius:20px;padding:20px;text-align:center;cursor:pointer;border:2px dashed rgba(255,215,0,0.4);transition:0.3s}
.upload-box:hover{border-color:#FFD700;transform:scale(1.01)}
.upload-box i{font-size:2rem;color:#FFD700}
.glow-button{width:100%;background:linear-gradient(135deg,#FFD700,#FF6B6B);border:none;padding:18px;border-radius:50px;color:#0a0a2a;font-weight:800;font-size:1.2rem;cursor:pointer;font-family:'Orbitron',monospace;margin-top:20px}
.glow-button:disabled{opacity:0.5;cursor:not-allowed}
.result-card{margin-top:30px;background:#1a1a3a;border-radius:25px;padding:25px;text-align:center;border:1px solid #FFD700;display:none}
.result-image{max-width:100%;border-radius:15px;margin:15px 0;border:3px solid #FFD700}
.download-btn{display:inline-flex;align-items:center;gap:10px;background:#4CAF50;color:white;padding:12px 30px;border-radius:50px;text-decoration:none}
.loading{display:none;text-align:center;padding:30px}
.spinner{width:50px;height:50px;border:4px solid rgba(255,215,0,0.3);border-top-color:#FFD700;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.file-status{text-align:center;margin:10px;color:#FFD700;font-size:0.85rem}
.footer{text-align:center;margin-top:30px;color:rgba(255,215,0,0.5);font-size:0.8rem}
@media(max-width:768px){.sliding-name{font-size:1.8rem}.header h1{font-size:1.5rem}.double-upload{flex-direction:column}.style-btn{font-size:0.7rem;padding:6px}}
</style>
</head>
<body>
<div class="welcome-screen"><div class="welcome-card"><img src="https://i.ibb.co/rG46PWKB/file-00000000d27471fa8382db8cabb463b2.png" class="owner-img" onerror="this.src='https://i.ibb.co/rG46PWKB/file-00000000d27471fa8382db8cabb463b2.png'"><div class="sliding-name">👑 MISS ALIYA 👑</div><h3 style="color:#FFD700;margin-top:15px">✦ THE ATTITUDE STUDIO ✦</h3><p style="color:white;margin-top:10px"><i class="fas fa-crown"></i> ROYAL • PREMIUM • EXCLUSIVE</p></div></div>
<div class="main-content"><div class="container"><div class="header"><h1><i class="fas fa-gem"></i> MISS ALIYA STUDIO <i class="fas fa-gem"></i></h1></div>
<div class="category-tabs"><button class="tab-btn active" data-cat="cover">📸 COVER DP (7)</button><button class="tab-btn" data-cat="frame">🖼️ FRAME DP (9)</button><button class="tab-btn" data-cat="pair">👫 PAIR DP (15)</button></div>
<div class="preview-3d"><div class="preview-box" id="previewBox"><div style="color:#FFD700;"><i class="fas fa-cloud-upload-alt" style="font-size:3rem"></i><p>Your preview here</p></div></div></div>
<div id="coverGrid" class="style-grid">${[1,2,3,4,5,6,7].map(i => `<button class="style-btn" data-cat="cover" data-style="${i}">${i}️⃣ ${coverTemplates[i].name}</button>`).join('')}</div>
<div id="frameGrid" class="style-grid" style="display:none">${[1,2,3,4,5,6,7,8,9].map(i => `<button class="style-btn" data-cat="frame" data-style="${i}">${i}️⃣ ${frameTemplates[i].name}</button>`).join('')}</div>
<div id="pairGrid" class="style-grid" style="display:none">${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => `<button class="style-btn" data-cat="pair" data-style="${i}">${i}️⃣ ${pairTemplates[i].name}</button>`).join('')}</div>
<div id="singleUpload"><div class="upload-box" id="singleZone"><i class="fas fa-cloud-upload-alt"></i><p>CLICK OR DRAG & DROP<br>Your Photo</p><input type="file" id="singleInput" accept="image/*" style="display:none"></div><div id="singleStatus" class="file-status">⚡ No image selected ⚡</div></div>
<div id="doubleUpload" style="display:none"><div class="double-upload"><div class="upload-box" id="pairZone1"><i class="fas fa-user"></i><p>IMAGE 1<br>Person 1</p><input type="file" id="pairInput1" accept="image/*" style="display:none"></div><div class="upload-box" id="pairZone2"><i class="fas fa-user"></i><p>IMAGE 2<br>Person 2</p><input type="file" id="pairInput2" accept="image/*" style="display:none"></div></div><div id="pairStatus" class="file-status">⚡ Waiting for both images ⚡</div></div>
<button class="glow-button" id="createBtn" disabled><i class="fas fa-magic"></i> CREATE PREMIUM DP <i class="fas fa-magic"></i></button>
<div class="loading" id="loading"><div class="spinner"></div><p style="margin-top:10px;color:#FFD700">MISS ALIYA IS CREATING...</p></div>
<div class="result-card" id="resultCard"><h3>✅ YOUR PREMIUM DP IS READY!</h3><img class="result-image" id="resultImage"><br><a href="#" id="downloadLink" class="download-btn" download="miss_aliya_dp.png"><i class="fas fa-download"></i> DOWNLOAD NOW</a></div>
<div class="footer"><i class="fas fa-heart" style="color:#FF6B6B"></i> CREATED WITH ATTITUDE BY MISS ALIYA <i class="fas fa-heart" style="color:#FF6B6B"></i></div></div></div>
<script>
let selectedCat='cover',selectedStyle=null;
let singleImg=null;
let pair1=null,pair2=null;
document.querySelectorAll('.tab-btn').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedCat=b.dataset.cat;selectedStyle=null;document.querySelectorAll('.style-btn').forEach(x=>x.classList.remove('selected'));document.getElementById('coverGrid').style.display=selectedCat==='cover'?'grid':'none';document.getElementById('frameGrid').style.display=selectedCat==='frame'?'grid':'none';document.getElementById('pairGrid').style.display=selectedCat==='pair'?'grid':'none';document.getElementById('singleUpload').style.display=selectedCat==='pair'?'none':'block';document.getElementById('doubleUpload').style.display=selectedCat==='pair'?'block':'none';checkReady();};});
document.querySelectorAll('.style-btn').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.style-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedStyle=b.dataset.style;checkReady();};});
const sz=document.getElementById('singleZone'),si=document.getElementById('singleInput');
sz.onclick=()=>si.click();sz.ondragover=e=>{e.preventDefault();sz.style.borderColor='#FFD700';};sz.ondragleave=()=>{sz.style.borderColor='rgba(255,215,0,0.4)';};sz.ondrop=e=>{e.preventDefault();sz.style.borderColor='rgba(255,215,0,0.4)';const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))handleSingle(f);};
si.onchange=e=>{if(e.target.files[0])handleSingle(e.target.files[0]);};
function handleSingle(f){singleImg=f;document.getElementById('singleStatus').innerHTML='✅ '+f.name.slice(0,30);const r=new FileReader();r.onload=ev=>{document.getElementById('previewBox').innerHTML='<img src="'+ev.target.result+'" class="preview-image">';};r.readAsDataURL(f);checkReady();}
const pz1=document.getElementById('pairZone1'),pz2=document.getElementById('pairZone2'),pi1=document.getElementById('pairInput1'),pi2=document.getElementById('pairInput2');
pz1.onclick=()=>pi1.click();pz1.ondrop=e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))handlePair1(f);};
pz2.onclick=()=>pi2.click();pz2.ondrop=e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))handlePair2(f);};
pi1.onchange=e=>{if(e.target.files[0])handlePair1(e.target.files[0]);};
pi2.onchange=e=>{if(e.target.files[0])handlePair2(e.target.files[0]);};
function handlePair1(f){pair1=f;pz1.style.borderColor='#4CAF50';updatePairPreview();checkReady();}
function handlePair2(f){pair2=f;pz2.style.borderColor='#4CAF50';updatePairPreview();checkReady();}
function updatePairPreview(){let html='<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">';if(pair1){const r=new FileReader();r.onload=ev=>{document.getElementById('previewBox').innerHTML=html+'<img src="'+ev.target.result+'" style="max-width:45%;max-height:200px;border-radius:15px;border:2px solid #FFD700">'+(pair2?'...':'')+'</div>';};r.readAsDataURL(pair1);}if(pair2){const r=new FileReader();r.onload=ev=>{document.getElementById('previewBox').innerHTML=html+(pair1?'...':'')+'<img src="'+ev.target.result+'" style="max-width:45%;max-height:200px;border-radius:15px;border:2px solid #FFD700"></div>';};r.readAsDataURL(pair2);}}
function checkReady(){if(selectedCat==='pair'){const btn=document.getElementById('createBtn');btn.disabled=!(selectedStyle&&pair1&&pair2);document.getElementById('pairStatus').innerHTML=pair1&&pair2?'✅ Both images ready!':'⚠️ '+(pair1?'✅1':'❌1')+' '+(pair2?'✅2':'❌2');}else{document.getElementById('createBtn').disabled=!(selectedStyle&&singleImg);}}
document.getElementById('createBtn').onclick=async()=>{if(!selectedStyle)return alert('Select a style!');const fd=new FormData();if(selectedCat==='pair'){if(!pair1||!pair2)return alert('Upload both images!');fd.append('image1',pair1);fd.append('image2',pair2);fd.append('type','pair');}else{if(!singleImg)return alert('Upload an image!');fd.append('image1',singleImg);fd.append('type',selectedCat);}fd.append('style',selectedStyle);document.getElementById('createBtn').disabled=true;document.getElementById('loading').style.display='block';document.getElementById('resultCard').style.display='none';try{const resp=await fetch('/create',{method:'POST',body:fd});if(!resp.ok)throw new Error('Server error');const blob=await resp.blob();const url=URL.createObjectURL(blob);document.getElementById('resultImage').src=url;document.getElementById('downloadLink').href=url;document.getElementById('resultCard').style.display='block';}catch(e){alert('Error: '+e.message);}finally{document.getElementById('createBtn').disabled=false;document.getElementById('loading').style.display='none';}};
</script>
</body>
</html>`);
});

app.post('/create', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
  try {
    const type = req.body.type;
    const styleId = parseInt(req.body.style);
    const file1 = req.files['image1'] ? req.files['image1'][0] : null;
    const file2 = req.files['image2'] ? req.files['image2'][0] : null;
    if (!file1) throw new Error('No image');
    
    const buffer1 = fs.readFileSync(file1.path);
    let outputPath;
    
    if (type === 'pair') {
      if (!file2) throw new Error('Pair needs 2 images');
      const buffer2 = fs.readFileSync(file2.path);
      const config = pairTemplates[styleId];
      const templatePath = await downloadTemplate(config.url, `pair_${styleId}`);
      let template = await Jimp.read(templatePath);
      let img1, img2;
      if (config.shape === 'heart') {
        img1 = await makeHeartImage(buffer1, config.size1);
        img2 = await makeHeartImage(buffer2, config.size2);
      } else if (config.shape === 'square') {
        img1 = await makeSquareImage(buffer1, config.size1);
        img2 = await makeSquareImage(buffer2, config.size2);
      } else {
        img1 = await makeCircleImage(buffer1, config.size1);
        img2 = await makeCircleImage(buffer2, config.size2);
      }
      template.composite(img1, config.x1, config.y1);
      template.composite(img2, config.x2, config.y2);
      outputPath = path.join(cacheDir, `out_${Date.now()}.png`);
      await template.writeAsync(outputPath);
      try { fs.unlinkSync(file2.path); } catch(e) {}
    } else if (type === 'cover') {
      const config = coverTemplates[styleId];
      const templatePath = await downloadTemplate(config.url, `cover_${styleId}`);
      let template = await Jimp.read(templatePath);
      if (config.shape === 'circle') {
        const img = await makeCircleImage(buffer1, config.size);
        template.composite(img, config.posX, config.posY);
      } else {
        const img = await Jimp.read(buffer1);
        img.resize(config.width, config.height);
        template.composite(img, config.posX, config.posY);
      }
      outputPath = path.join(cacheDir, `out_${Date.now()}.png`);
      await template.writeAsync(outputPath);
    } else {
      const config = frameTemplates[styleId];
      const templatePath = await downloadTemplate(config.url, `frame_${styleId}`);
      let template = await Jimp.read(templatePath);
      const img = await Jimp.read(buffer1);
      img.resize(config.width, config.height);
      let x = config.posX === 'auto' ? (template.bitmap.width - config.width) / 2 : config.posX;
      template.composite(img, x, config.posY);
      outputPath = path.join(cacheDir, `out_${Date.now()}.png`);
      await template.writeAsync(outputPath);
    }
    
    res.sendFile(path.resolve(outputPath), () => {
      try { fs.unlinkSync(file1.path); } catch(e) {}
      try { fs.unlinkSync(outputPath); } catch(e) {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log('MISS ALIYA STUDIO RUNNING on', PORT));
