import sharp from 'sharp'

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="630" fill="#09090E"/>
<ellipse cx="120" cy="100" rx="420" ry="320" fill="rgba(124,58,237,0.18)"/>
<ellipse cx="80" cy="80" rx="280" ry="200" fill="rgba(124,58,237,0.10)"/>
<rect x="0" y="0" width="1200" height="2" fill="#7C3AED"/>
<text x="80" y="130" font-family="system-ui, sans-serif" font-size="58" font-weight="800" fill="#FFFFFF" letter-spacing="-2">mivia.</text>
<text x="80" y="230" font-family="system-ui, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF" letter-spacing="-2">Tu web profesional</text>
<text x="80" y="308" font-family="system-ui, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF" letter-spacing="-2">en 2 minutos.</text>
<text x="80" y="380" font-family="system-ui, sans-serif" font-size="24" font-weight="400" fill="rgba(255,255,255,0.55)">Actualizable por WhatsApp · Solo €9/mes</text>
<rect x="80" y="415" width="340" height="48" rx="24" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.45)" stroke-width="1.5"/>
<text x="254" y="445" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="#C4B5FD" text-anchor="middle">✦ Sin tarjeta · Sin permanencia</text>
<rect x="778" y="75" width="340" height="500" rx="36" fill="rgba(124,58,237,0.08)"/>
<rect x="770" y="68" width="340" height="500" rx="34" fill="#0C0C18" stroke="#1F1F2E" stroke-width="2"/>
<rect x="900" y="82" width="80" height="12" rx="6" fill="#1F1F2E"/>
<rect x="794" y="112" width="292" height="32" rx="4" fill="#131320"/>
<rect x="806" y="120" width="60" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
<rect x="1052" y="120" width="24" height="8" rx="4" fill="rgba(124,58,237,0.6)"/>
<rect x="794" y="156" width="292" height="130" rx="6" fill="#1A1A2E"/>
<rect x="810" y="174" width="200" height="16" rx="3" fill="#7C3AED"/>
<rect x="810" y="200" width="160" height="10" rx="3" fill="rgba(255,255,255,0.2)"/>
<rect x="810" y="218" width="130" height="10" rx="3" fill="rgba(255,255,255,0.15)"/>
<rect x="810" y="244" width="100" height="28" rx="6" fill="#7C3AED"/>
<rect x="920" y="244" width="80" height="28" rx="6" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
<rect x="794" y="298" width="88" height="80" rx="6" fill="#131320"/>
<rect x="810" y="312" width="56" height="32" rx="3" fill="#1A1A2E"/>
<rect x="810" y="352" width="44" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
<rect x="810" y="366" width="56" height="6" rx="2" fill="rgba(255,255,255,0.1)"/>
<rect x="892" y="298" width="88" height="80" rx="6" fill="#131320"/>
<rect x="908" y="312" width="56" height="32" rx="3" fill="#1A1A2E"/>
<rect x="908" y="352" width="44" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
<rect x="908" y="366" width="56" height="6" rx="2" fill="rgba(255,255,255,0.1)"/>
<rect x="990" y="298" width="96" height="80" rx="6" fill="#131320"/>
<rect x="1006" y="312" width="64" height="32" rx="3" fill="#1A1A2E"/>
<rect x="1006" y="352" width="44" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
<rect x="1006" y="366" width="56" height="6" rx="2" fill="rgba(255,255,255,0.1)"/>
<rect x="794" y="390" width="292" height="60" rx="6" fill="#131320"/>
<rect x="810" y="406" width="40" height="12" rx="2" fill="#7C3AED"/>
<rect x="810" y="424" width="30" height="8" rx="2" fill="rgba(255,255,255,0.15)"/>
<rect x="880" y="406" width="40" height="12" rx="2" fill="#7C3AED"/>
<rect x="880" y="424" width="30" height="8" rx="2" fill="rgba(255,255,255,0.15)"/>
<rect x="950" y="406" width="40" height="12" rx="2" fill="#7C3AED"/>
<rect x="950" y="424" width="30" height="8" rx="2" fill="rgba(255,255,255,0.15)"/>
<rect x="1020" y="406" width="40" height="12" rx="2" fill="#7C3AED"/>
<rect x="1020" y="424" width="30" height="8" rx="2" fill="rgba(255,255,255,0.15)"/>
<rect x="794" y="462" width="292" height="48" rx="6" fill="rgba(124,58,237,0.3)" stroke="rgba(124,58,237,0.5)" stroke-width="1"/>
<rect x="860" y="478" width="160" height="16" rx="3" fill="rgba(124,58,237,0.6)"/>
<text x="80" y="590" font-family="system-ui, sans-serif" font-size="20" font-weight="400" fill="rgba(255,255,255,0.3)" letter-spacing="1">mivia.es</text>
</svg>`

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png({ quality: 95 })
  .toFile('public/og-image.png')

console.log('✅ og-image.png generado correctamente (1200x630px)')
