// Функция для рисования прямоугольника с закругленными углами
export function drawRoundedRect(
    ctx,
    xStart, // Начало координат X
    yStart, // Начало координат Y
    rectWidth, // Ширина прямоугольника
    rectHeight, // Высота прямоугольника
    radius, // Радиус окружности углов
    triangleWidth,
    withTriangle // Булевый параметр, который добавляет наличие треугольника
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

    // Проверяем нужен ли треугольник
    if (withTriangle) {
        // Настройка треугольника ( Вывели значение ширины в начало класса, чтобы с этим значением можно было работать за границами этой функции)
        let triangleHeight = 13;

        // Рисуем треугольник
        ctx.moveTo(xStart + rectWidth, yStart + rectHeight / 2 - triangleHeight / 2);
        ctx.lineTo(xStart + rectWidth + triangleWidth, (yStart + rectHeight / 2 - triangleHeight / 2) + triangleHeight / 2);
        ctx.lineTo(xStart + rectWidth, (yStart + rectHeight / 2 - triangleHeight / 2) + triangleHeight);
    }
};