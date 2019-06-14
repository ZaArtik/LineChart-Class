export function drawTriangle(
    ctx,
    xStart,
    yStart,
    triangleWidth,
    triangleHeight,
    triangleDirection
) {
    if (triangleDirection === 'right') {
        // Рисуем треугольник
        ctx.moveTo(xStart, yStart - triangleHeight / 2);
        ctx.lineTo(xStart + triangleWidth, (yStart - triangleHeight / 2) + triangleHeight / 2);
        ctx.lineTo(xStart, (yStart - triangleHeight / 2) + triangleHeight);
    } else {
        // Рисуем треугольник
        ctx.moveTo(xStart, yStart - triangleHeight / 2);
        ctx.lineTo(xStart - triangleWidth, (yStart - triangleHeight / 2) + triangleHeight / 2);
        ctx.lineTo(xStart, (yStart - triangleHeight / 2) + triangleHeight);
    }
}