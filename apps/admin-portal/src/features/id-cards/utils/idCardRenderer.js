import { jsPDF } from 'jspdf';

const CARD_WIDTH = 600;
const CARD_HEIGHT = 960;

export const sanitizeFileNamePart = (value) => {
  const cleaned = String(value || 'Member')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned || 'Member';
};

export const buildIdCardFileName = (idNumber, name, extension) => {
  const safeId = String(idNumber || '001').trim();
  const safeName = sanitizeFileNamePart(name);
  return `ID-${safeId}_${safeName}.${extension}`; };  
  function drawRoundedRect(ctx, x, y, width, height, radius) { 
             const r = typeof radius === 'number' ? { 
                          tl: radius, tr: radius, br: radius, bl: radius 
             } : { tl: 0, tr: 0, br: 0, bl: 0, ...radius };  
             ctx.beginPath(); ctx.moveTo(x + r.tl, y); 
             ctx.lineTo(x + width - r.tr, y); 
             ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr); 
             ctx.lineTo(x + width, y + height - r.br); 
             ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height); 
             ctx.lineTo(x + r.bl, y + height); 
             ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl); 
             ctx.lineTo(x, y + r.tl); ctx.quadraticCurveTo(x, y, x + r.tl, y); 
             ctx.closePath(); 
  }  
  function drawLotusWatermark(ctx, cx, cy, scale = 1) { 
             ctx.save(); ctx.translate(cx, cy); 
             ctx.scale(scale, scale); ctx.strokeStyle = 'rgba(181, 88, 122, 0.24)'; 
             ctx.lineWidth = 1.6;  
             ctx.beginPath(); 
             ctx.moveTo(0, -18); 
             ctx.quadraticCurveTo(9, -4, 0, 10); 
             ctx.quadraticCurveTo(-9, -4, 0, -18); 
             ctx.stroke();  
             [-1, 1].forEach((dir) => { ctx.beginPath(); ctx.moveTo(0, 10); 
                          ctx.quadraticCurveTo(dir * 16, -2, dir * 13, -14); 
                          ctx.quadraticCurveTo(dir * 4, -8, 0, 10); ctx.stroke();  
                          ctx.beginPath(); ctx.moveTo(0, 10); 
                          ctx.quadraticCurveTo(dir * 26, 4, dir * 23, -7); 
                          ctx.quadraticCurveTo(dir * 12, -3, 0, 10); ctx.stroke(); });  
                          ctx.beginPath(); ctx.moveTo(-18, 11); 
                          ctx.quadraticCurveTo(0, 16, 18, 11); 
                          ctx.stroke();  ctx.restore(); 
             }  
             function wrapAndFitName(ctx, name, maxWidth) { 
                          const cleanName = String(name || '').trim() || 'Member Name'; let fontSize = 44;  
                          while (fontSize >= 28) { 
                                       ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(cleanName).width <= maxWidth) {
      return { lines: [cleanName], fontSize };
    }
    fontSize -= 2;
  }

  const words = cleanName.split(' ');
  if (words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');

    fontSize = 32;
    while (fontSize >= 20) {
      ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
      if (
        ctx.measureText(line1).width <= maxWidth &&
        ctx.measureText(line2).width <= maxWidth
      ) {
        return { lines: [line1, line2], fontSize };
      }
      fontSize -= 2;
    }
    return { lines: [line1, line2], fontSize: 20 };
  }

  fontSize = 26;
  while (fontSize >= 18) {
    ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(cleanName).width <= maxWidth) {
      return { lines: [cleanName], fontSize };
    }
    fontSize -= 2;
  }

  return { lines: [cleanName], fontSize: 18 };
}

export function renderIdCardToCanvas(canvas, { name, position, idNumber }, scale = 3) {
  if (!canvas) return null;

  canvas.width = CARD_WIDTH * scale;
  canvas.height = CARD_HEIGHT * scale;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(scale, scale);

  // Cream background
  ctx.fillStyle = '#f8f5ef';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = 'rgba(130, 108, 86, 0.045)';
  for (let y = 240; y < 860; y += 14) {
    for (let x = 14; x < CARD_WIDTH; x += 18) {
      ctx.fillRect(x + ((y * 7) % 9), y, 2, 2);
    }
  }

  // Lotus watermarks
  const lotusPositions = [
    [55, 390, 0.95],
    [560, 390, 0.95],
    [115, 475, 1.05],
    [475, 465, 1.05],
    [175, 535, 0.9],
    [55, 650, 0.95],
    [305, 660, 0.95],
    [555, 650, 0.95],
    [175, 780, 0.95],
    [455, 780, 0.95],
    [62, 885, 0.95],
    [305, 880, 0.95],
    [565, 905, 0.95],
  ];
  lotusPositions.forEach(([lx, ly, ls]) => drawLotusWatermark(ctx, lx, ly, ls));

  // Top Deep Maroon Curved Header
  const headerGrad = ctx.createLinearGradient(0, 0, 0, 325);
  headerGrad.addColorStop(0, '#5a0e29');
  headerGrad.addColorStop(1, '#7c183c');
  ctx.fillStyle = headerGrad;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(CARD_WIDTH, 0);
  ctx.lineTo(CARD_WIDTH, 245);
  ctx.quadraticCurveTo(CARD_WIDTH / 2, 345, 0, 245);
  ctx.closePath();
  ctx.fill();

  // Brand Logo Pill
  drawRoundedRect(ctx, 105, 54, 390, 100, 24);
  ctx.fillStyle = '#f8f3e9';
  ctx.fill();

  ctx.fillStyle = '#8b4a42';
  ctx.font = '800 50px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('amaanitvam', CARD_WIDTH / 2, 95);

  ctx.fillStyle = '#8b4a42';
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('f o u n d a t i o n', CARD_WIDTH / 2 - 22, 134);

  drawRoundedRect(ctx, 382, 123, 42, 20, 10);
  ctx.fillStyle = '#df7675';
  ctx.fill();

// Photo Frame (clean white box matching Canva frame dimensions)
  const frameW = 194;
  const frameH = 264;
  const frameX = (CARD_WIDTH - frameW) / 2;
  const frameY = 216;

  drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#f25582';
  ctx.stroke();

  // Blush Strip (aligned below the name baseline like the Canva template)
  const stripX = 98;
  const stripY = 556;
  const stripW = CARD_WIDTH - stripX;
  const stripH = 96;

  ctx.save();
  ctx.shadowColor = 'rgba(40, 10, 22, 0.22)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(ctx, stripX, stripY, stripW, stripH, {
    tl: 0,
    tr: 0,
    br: 0,
    bl: 34,
  });
  ctx.fillStyle = 'rgba(249, 226, 236, 0.92)';
  ctx.fill();
  ctx.restore();

  [586, 656, 742].forEach((dotY) => {
    ctx.beginPath();
    ctx.arc(582, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f26a92';
    ctx.fill();
  });

  // Member Name
  const { lines, fontSize } = wrapAndFitName(ctx, name, 490);
  ctx.fillStyle = '#751133';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (lines.length === 1) {
    ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(lines[0], CARD_WIDTH / 2, 544);
  } else {
    ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    const lineGap = fontSize + 4;
    ctx.fillText(lines[0], CARD_WIDTH / 2, 532);
    ctx.fillText(lines[1], CARD_WIDTH / 2, 532 + lineGap);
  }

  // Approved Position Pill
  const positionText = String(position || 'MEMBER').trim().toUpperCase();
  let posFontSize = 18;
  ctx.font = `700 ${posFontSize}px "Segoe UI", Arial, sans-serif`;
  while (posFontSize > 13 && ctx.measureText(positionText).width > 340) {
    posFontSize -= 1;
    ctx.font = `700 ${posFontSize}px "Segoe UI", Arial, sans-serif`;
  }

  const pillW = Math.min(410, Math.max(290, ctx.measureText(positionText).width + 64));
  const pillH = 38;
  const pillX = (CARD_WIDTH - pillW) / 2;
  const pillY = 582;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 19);
  ctx.fillStyle = '#6f1131';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(positionText, CARD_WIDTH / 2, pillY + pillH / 2 + 1);

  // Organization Subtitle
  ctx.fillStyle = '#5f5b5d';
  ctx.font = '500 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Amaanitvam Foundation', CARD_WIDTH / 2, 646);

  // Sequential Zero-Padded ID Number
  const displayId = String(idNumber || '001').trim();
  const labelText = 'ID No: ';

  ctx.font = '500 23px "Segoe UI", Arial, sans-serif';
  const labelW = ctx.measureText(labelText).width;
  ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
  const valueW = ctx.measureText(displayId).width;

  const startX = (CARD_WIDTH - (labelW + valueW)) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4a4648';
  ctx.font = '500 23px "Segoe UI", Arial, sans-serif';
  ctx.fillText(labelText, startX, 706);

  ctx.fillStyle = '#7c183c';
  ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText(displayId, startX + labelW, 706);

  // Gold Divider & Footer
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 856, CARD_WIDTH, 18);

  ctx.fillStyle = '#c88c1e';
  ctx.fillRect(0, 874, CARD_WIDTH, 4);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7c183c';
  ctx.font = '700 18px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Humanity is Everything', CARD_WIDTH / 2, 904);

  ctx.fillStyle = '#8b2949';
  ctx.font = '500 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('www.amaanitvam.org', CARD_WIDTH / 2, 930);

  ctx.restore();
  return canvas;
}

export function downloadIdCardAsPng(cardData) {
  const offscreen = document.createElement('canvas');
  renderIdCardToCanvas(offscreen, cardData, 3);

  const dataUrl = offscreen.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = buildIdCardFileName(cardData.idNumber, cardData.name, 'png');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadIdCardAsPdf(cardData) {
  const offscreen = document.createElement('canvas');
  renderIdCardToCanvas(offscreen, cardData, 3);

  const imgData = offscreen.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [54, 86.4],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 54, 86.4, undefined, 'FAST');
  pdf.save(buildIdCardFileName(cardData.idNumber, cardData.name, 'pdf'));
}
