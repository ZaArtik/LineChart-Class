// Функция для настройки текста
export function editText(
    ctx,
    fontSize,
    fontFamily,
    fontColor,
    fontAlign = '',
    fontBaseline = '',
    fontBold = 'normal'
) {
    ctx.font = fontBold + ' ' + fontSize + 'px ' + fontFamily;
    ctx.fillStyle = fontColor;
    ctx.textAlign = fontAlign;
    ctx.textBaseline = fontBaseline;
}