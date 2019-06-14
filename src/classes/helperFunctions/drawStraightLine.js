// Функция для рисования прямы линий
export function drawStraightLine(ctx, xStart, yStart, xEnd, yEnd) {
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
}