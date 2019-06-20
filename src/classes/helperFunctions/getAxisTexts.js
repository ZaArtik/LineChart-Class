// Функция для нахождения текста и его возвращения по Y
function getYAxisText(
    yTextarray,
    xTextArray, // Массив из которого нам нужно возвратить текст
    xCoordinate, // Текущая координата текста
    drawTextFormula // Формула, по которой отрисовывался текст
) {
    let yText;
    xTextArray.forEach(function (xText, xTextIndex) {
        if (xCoordinate == drawTextFormula(xTextIndex)) {
            yText = yTextarray[xTextIndex];
            return yText;
        }
    });
    return yText;
}

// Функция для нахождения текста и его возвращения по X
function getXAxisText(
    textArray, // Массив из которого нам нужно возвратить текст
    xCoordinate, // Текущая координата текста
    drawTextFormula // Формула, по которой отрисовывался текст
) {
    return textArray.filter(function (text, textIndex) {
        return xCoordinate == drawTextFormula(textIndex);
    });
}

export {getYAxisText, getXAxisText};