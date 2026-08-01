const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'server', 'index.html')
let html = fs.readFileSync(filePath, 'utf8')

// Replace old card styles with new modern ones
const oldStyles = {
  '.card-stack': `.card-stack {
        position: relative;
        width: calc(100% - 32px);
        max-width: 360px;
        height: 430px;
        margin: 0 auto;
      }`,

  '.card-item': `.card-item {
        position: absolute;
        inset: 0;
        border-radius: var(--radius);
        background: var(--card);
        border: 1px solid var(--card-border);
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1.2);
        will-change: transform;
      }`,
}

// Add new CSS for modern cards
const newCSS = `
      /* ===== MODERN 3D CARDS ===== */
      .app-bg-effects {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }
      .floating-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.12;
        animation: floatOrb 12s ease-in-out infinite;
      }
      .floating-orb:nth-child(1) {
        width: 200px;
        height: 200px;
        background: var(--acc);
        top: -50px;
        right: -30px;
        animation-delay: 0s;
      }
      .floating-orb:nth-child(2) {
        width: 150px;
        height: 150px;
        background: var(--acc2);
        bottom: 20%;
        left: -40px;
        animation-delay: -4s;
      }
      .floating-orb:nth-child(3) {
        width: 120px;
        height: 120px;
        background: var(--grn);
        top: 40%;
        right: -20px;
        animation-delay: -8s;
      }
      @keyframes floatOrb {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(20px, -30px) scale(1.1); }
        50% { transform: translate(-15px, 20px) scale(0.95); }
        75% { transform: translate(25px, 15px) scale(1.05); }
      }
      
      .card-stack {
        position: relative;
        width: calc(100% - 32px);
        max-width: 360px;
        height: 430px;
        margin: 0 auto;
        perspective: 1000px;
      }
      .card-item {
        position: absolute;
        inset: 0;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.06),
          0 12px 40px rgba(108, 92, 231, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        overflow: hidden;
        transition:
          transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.3s ease;
        will-change: transform;
        transform-style: preserve-3d;
        animation: cardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .card-item:hover {
        box-shadow:
          0 8px 24px rgba(0, 0, 0, 0.08),
          0 20px 60px rgba(108, 92, 231, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }
      .card-item:nth-child(2) {
        transform: translateY(8px) scale(0.94) rotateX(4deg);
        z-index: 2;
        opacity: 0.88;
      }
      .card-item:nth-child(3) {
        transform: translateY(16px) scale(0.88) rotateX(8deg);
        z-index: 1;
        opacity: 0.72;
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(40px) scale(0.85) rotateX(-12deg); }
        to { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
      }
      .card-stripe {
        height: 6px;
        border-radius: 28px 28px 0 0;
        background: linear-gradient(90deg, var(--acc), var(--acc2));
        box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
      }
      .card-avatar {
        width: 52px !important;
        height: 52px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.8);
        animation: avatarPulse 3s ease-in-out infinite;
      }
      @keyframes avatarPulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        50% { box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4); }
      }
      .card-meta::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--grn);
        animation: pulse 2s ease-in-out infinite;
        margin-right: 4px;
      }
      .card-urgency {
        background: linear-gradient(135deg, var(--acc), var(--acc2));
        box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
      }
      .card-category {
        background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(255, 107, 138, 0.1));
        border: 1px solid rgba(108, 92, 231, 0.15);
        animation: categoryGlow 4s ease-in-out infinite;
      }
      @keyframes categoryGlow {
        0%, 100% { box-shadow: 0 0 0 rgba(108, 92, 231, 0); }
        50% { box-shadow: 0 0 12px rgba(108, 92, 231, 0.2); }
      }
      .card-hint {
        animation: hintPulse 2s ease-in-out infinite;
      }
      @keyframes hintPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      /* Enhanced buttons */
      .action-btn {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .action-btn:hover {
        transform: translateY(-3px) scale(1.08);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }
      .action-btn:active {
        transform: scale(0.92);
      }
      .action-btn.like {
        animation: likeGlow 2s ease-in-out infinite;
      }
      @keyframes likeGlow {
        0%, 100% { box-shadow: 0 6px 20px rgba(0, 200, 150, 0.25); }
        50% { box-shadow: 0 6px 30px rgba(0, 200, 150, 0.4); }
      }
      
      /* Ripple effect */
      @keyframes rippleEffect {
        from { transform: scale(0); opacity: 1; }
        to { transform: scale(4); opacity: 0; }
      }
      .action-btn, .submit-btn, .onboard-btn {
        position: relative;
        overflow: hidden;
      }
`

// Add HTML for background effects
const oldAppDiv = '<div class="app" id="app" style="display: none">'
const newAppDiv = `<div class="app" id="app" style="display: none">
      <div class="app-bg-effects">
        <div class="floating-orb"></div>
        <div class="floating-orb"></div>
        <div class="floating-orb"></div>
      </div>`

// Replace app div
html = html.replace(oldAppDiv, newAppDiv)

// Insert new CSS before closing </style>
html = html.replace('</style>', newCSS + '      </style>')

// Add ripple JS before </script>
const newJS = `
      // 3D card tilt on mouse move
      const cardStack = document.getElementById('cardStack')
      if (cardStack) {
        cardStack.addEventListener('mousemove', (e) => {
          if (isDragging) return
          const rect = cardStack.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const rotateX = ((y - centerY) / centerY) * -6
          const rotateY = ((x - centerX) / centerX) * 6
          const cards = document.querySelectorAll('.card-item')
          if (cards[0]) {
            cards[0].style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(0) scale(1)'
          }
        })
        cardStack.addEventListener('mouseleave', () => {
          if (isDragging) return
          const cards = document.querySelectorAll('.card-item')
          if (cards[0]) cards[0].style.transform = ''
        })
      }
      // Ripple effect for buttons
      document.querySelectorAll('.action-btn, .submit-btn, .onboard-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          const ripple = document.createElement('span')
          ripple.style.cssText = 'position:absolute;border-radius:50%;background:rgba(108,92,231,0.3);width:100px;height:100px;margin-left:-50px;margin-top:-50px;left:' + e.offsetX + 'px;top:' + e.offsetY + 'px;animation:rippleEffect 0.6s ease-out forwards;pointer-events:none;'
          this.appendChild(ripple)
          setTimeout(() => ripple.remove(), 600)
        })
      })
`

html = html.replace('</script>', newJS + '    </script>')

// Save
fs.writeFileSync(filePath, html, 'utf8')
console.log('✅ Файл обновлён! Размер:', html.length, 'символов')
console.log('✅ Добавлены: glassmorphism, 3D tilt, floating orbs, ripple эффекты')
