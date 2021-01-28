import { drawRoundedRect } from './drawRoundedRect';

export const drawMark = (ctx, x, height, knobSize, color = 'FC3E3E') => {
  ctx.beginPath();
  ctx.moveTo(x, knobSize + 1);
  ctx.lineTo(x, height);
  ctx.strokeStyle = `#${color}`;
  ctx.stroke();
  drawRoundedRect(
    ctx,
    x - knobSize / 2,
    1,
    knobSize,
    knobSize,
    knobSize / 2,
    color
  );
};
