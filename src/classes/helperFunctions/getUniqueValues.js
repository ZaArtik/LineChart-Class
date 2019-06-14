// Функция для выборки только уникальных значений из массива
export function getUniqueValues(arr) {
    let obj = {};

    arr.forEach(function (currentValue, currentIndex) {
        obj[currentValue] = true;
    });

    return Object.keys(obj);
}