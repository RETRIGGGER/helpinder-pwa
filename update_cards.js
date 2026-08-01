const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'server', 'index.html')
let content = fs.readFileSync(filePath, 'utf8')

// Check if already updated
if (content.includes('.card-item{position:absolute;inset:0;border-radius:28px;background:rgba(255,255,255')) {
  console.log('✅ УЖЕ ОБНОВЛЕНО!')
  process.exit(0)
}

// Replace card-stack
content = content.replace(
  /\.card-stack\{position:relative;width:calc\(100% - 32px\);max-width:360px;height:430px;margin:0 auto;\}/,
  '.card-stack{position:relative;width:calc(100% - 32px);max-width:360px;height:430px;margin:0 auto;perspective:1000px}'
)

// Replace card-item with new glassmorphism style
content = content.replace(
  /\.card-item\{position:absolute;inset:0;border-radius:var\(--radius\);background:var\(--card\);border:1px solid var\(--card-border\);box-shadow:var\(--shadow\);overflow:hidden;transition:transform \.45s cubic-bezier\(\.25\,.8\,.25\,1\.2\);will-change:transform;\}/,
  '.card-item{position:absolute;inset:0;border-radius:28px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.5);box-shadow:0 4px 16px rgba(0,0,0,.06),0 12px 40px rgba(108,92,231,.15),inset 0 1px 0 rgba(255,255,255,.8);overflow:hidden;transition:transform .5s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease;will-change:transform;animation:cardIn .6s cubic-bezier(.34,1.56,.64,1)}'
)

// Add animation keyframes before </style>
const keyframes = `
      @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.85) rotateX(-12deg)}to{opacity:1;transform:translateY(0) scale(1) rotateX(0)}}
      @keyframes floatOrb{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(20px,-30px) scale(1.1)}50%{transform:translate(-15px,20px) scale(.95)}75%{transform:translate(25px,15px) scale(1.05)}}
      @keyframes avatarPulse{0%,100%{box-shadow:0 4px 12px rgba(0,0,0,.15)}50%{box-shadow:0 4px 20px rgba(108,92,231,.4)}}
      @keyframes categoryGlow{0%,100%{box-shadow:0 0 0 rgba(108,92,231,0)}50%{box-shadow:0 0 12px rgba(108,92,231,.2)}}
      @keyframes rippleEffect{from{transform:scale(0);opacity:1}to{transform:scale(4);opacity:0}}`

content = content.replace('</style>', keyframes + '\n      </style>')

// Replace card-stripe
content = content.replace(
  /\.card-stripe\{height:5px;border-radius:5px 5px 0 0\}/,
  '.card-stripe{height:6px;border-radius:28px 28px 0 0;background:linear-gradient(90deg,var(--acc),var(--acc2));box-shadow:0 2px 8px rgba(108,92,231,.3)}'
)

// Replace action-btn
content = content.replace(
  /\.action-btn\{width:48px;height:48px;border-radius:50%;border:1\.5px solid var\(--card-border\);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;background:var\(--card\);box-shadow:0 2px 8px rgba\(0,0,0,.06\);transition:all \.15s;/,
  '.action-btn{width:50px;height:50px;border-radius:50%;border:2px solid var(--card-border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 4px 12px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.8);transition:all .25s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden;'
)

// Replace action-btn hover and active
content = content.replace(
  /\.action-btn:active\{transform:scale\(\.9\)\}/,
  '.action-btn:hover{transform:translateY(-3px) scale(1.08)}\n      .action-btn:active{transform:scale(.92)}'
)

// Replace like button
content = content.replace(
  /\.action-btn\.like\{width:58px;height:58px;font-size:26px;color:var\(--grn\);border-color:rgba\(0,200,150,.25\)\}/,
  '.action-btn.like{width:62px;height:62px;font-size:28px;color:var(--grn);border-color:rgba(0,200,150,.35);box-shadow:0 6px 20px rgba(0,200,150,.25),inset 0 1px 0 rgba(255,255,255,1);animation:likeGlow 2s ease-in-out infinite}\n      @keyframes likeGlow{0%,100%{box-shadow:0 6px 20px rgba(0,200,150,.25)}50%{box-shadow:0 6px 30px rgba(0,200,150,.4)}}'
)

// Replace card-urgency
content = content.replace(
  /\.card-urgency\{font-size:10px;font-weight:700;color:#fff;padding:5px 10px;border-radius:12px;margin-left:auto;white-space:nowrap\}/,
  '.card-urgency{font-size:10px;font-weight:700;color:#fff;padding:6px 12px;border-radius:14px;margin-left:auto;white-space:nowrap;background:linear-gradient(135deg,var(--acc),var(--acc2));box-shadow:0 2px 8px rgba(108,92,231,.3)}'
)

// Replace card-category
content = content.replace(
  /\.card-category\{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;padding:6px 12px;border-radius:10px;margin-bottom:12px\}/,
  '.card-category{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:8px 14px;border-radius:14px;margin-bottom:14px;background:linear-gradient(135deg,rgba(108,92,231,.1),rgba(255,107,138,.1));border:1px solid rgba(108,92,231,.15);animation:categoryGlow 4s ease-in-out infinite}'
)

// Replace card-meta
content = content.replace(
  /\.card-meta\{font-size:11px;color:var\(--sub\);margin-top:2px\}/,
  '.card-meta{font-size:11px;color:var(--sub);margin-top:3px;display:flex;align-items:center;gap:4px}\n      .card-meta::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--grn);animation:pulse 2s ease-in-out infinite}'
)

// Replace card-hint
content = content.replace(
  /\.card-hint\{font-size:10px;opacity:\.6\}/,
  '.card-hint{font-size:10px;opacity:.6;animation:hintPulse 2s ease-in-out infinite}\n      @keyframes hintPulse{0%,100%{opacity:.6}50%{opacity:1}}'
)

// Replace card-avatar
content = content.replace(
  /\.card-avatar\{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0\}/,
  '.card-avatar{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.15);border:2px solid rgba(255,255,255,.8);animation:avatarPulse 3s ease-in-out infinite}'
)

// Add mouse event listeners before </script>
const mouseJS = `
      const _cs=document.getElementById('cardStack');if(_cs){_cs.addEventListener('mousemove',function(e){if(isDragging)return;var r=_cs.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cr=r.width/2,cr2=r.height/2,rx=(y-cr2)/cr2*-6,ry=(x-cr2)/cr2*6,c=document.querySelectorAll('.card-item');if(c[0])c[0].style.transform='perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(0) scale(1)'});_cs.addEventListener('mouseleave',function(){if(!isDragging){var c2=document.querySelectorAll('.card-item');if(c2[0])c2[0].style.transform=''}})}\n      document.querySelectorAll('.action-btn,.submit-btn,.onboard-btn').forEach(function(b){b.addEventListener('click',function(e){var r=document.createElement('span');r.style.cssText='position:absolute;border-radius:50%;background:rgba(108,92,231,.3);width:100px;height:100px;margin-left:-50px;margin-top:-50px;left:'+e.offsetX+'px;top:'+e.offsetY+'px;animation:rippleEffect .6s ease-out forwards;pointer-events:none';this.appendChild(r);setTimeout(function(){r.remove()},600)})})`

content = content.replace('</script>', mouseJS + '\n    </script>')

fs.writeFileSync(filePath, content, 'utf8')
console.log('✅ Стили карточек обновлены!')
console.log('   Размер файла:', content.length)
