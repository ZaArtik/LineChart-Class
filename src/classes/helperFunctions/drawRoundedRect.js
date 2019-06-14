// Функция для рисования прямоугольника с закругленными углами
export function drawRoundedRect(
    ctx,
    xStart, // Начало координат X
    yStart, // Начало координат Y
    rectWidth, // Ширина прямоугольника
    rectHeight, // Высота прямоугольника
    radius // Радиус окружности углов
) {
    ctx.beginPath();

    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart + rectWidth - radius, yStart);
    ctx.quadraticCurveTo(xStart + rectWidth, yStart, xStart + rectWidth, yStart + radius);
    ctx.lineTo(xStart + rectWidth, yStart + rectHeight - radius);
    ctx.quadraticCurveTo(xStart + rectWidth, yStart + rectHeight, xStart + rectWidth - radius, yStart + rectHeight);
    ctx.lineTo(xStart, yStart + rectHeight);
    ctx.quadraticCurveTo(xStart - radius, yStart + rectHeight, xStart - radius, yStart + rectHeight - radius);
    ctx.lineTo(xStart - radius, yStart + radius);
    ctx.quadraticCurveTo(xStart - radius, yStart, xStart, yStart);
};