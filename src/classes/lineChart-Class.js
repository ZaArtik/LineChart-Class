// Подключаем воспомагательные функции
import { editText } from './helperFunctions/editText'; // Функция для настраивания стилей текста
import { getUniqueValues } from './helperFunctions/getUniqueValues'; // Функция для выборки уникальных значений массива
import { drawStraightLine } from './helperFunctions/drawStraightLine'; // Функция для рисования прямой линии
import { drawRoundedRect } from './helperFunctions/drawRoundedRect'; // Функция для рисования прямоугольника и с закругленными углами
import { drawTriangle } from './helperFunctions/drawTriangle'; // Функция для рисования треугольника
import { getYAxisText, getXAxisText } from './helperFunctions/getAxisTexts'; // Функции для поиска и извелечине текущего текста в диаграмке


// Class
export let LineChart = function (ctx, options) {
    /* ------------- ПРИВАТНЫЕ СВОЙСТВА ------------- */


    /* -------- Настройка поля с блоками -------- */

    const rectFieldOptions = {
        /* 
            Высота и ширина поля в котором будут находится блоки (Отнимаем от ширины и высоты
            холста по 200, чтобы осталось место для надписей и заголовков) 
        */
        width: ctx.canvas.width - 200,
        height: ctx.canvas.height - 200,
        // Начало поля для блоков по X и по Y
        xStartPos: 80,
        yStartPos: 80,
    }


    /* -------- Настройка самих блоков -------- */

    let rectOptions = {
        // Высота блока
        height: 0,
        // Ширина блока
        width: 0,
        // Ширина границы блока
        lineWidth: 0.5,
        // Цвет границ блока
        borderColor: options.rectOptions.borderColor || 'lightgrey'
    }


    /* -------- Настройка блоков по оси Y-------- */

    // Создаем объект, который будет хранить все настройки данных по оси Y
    let yAxisDataOptions = {
        // Массив с именами наших данных
        dataName: [],
        // Свойство с оригинальными данными
        originalData: [],
        // Свойство с нашими данными для оси Y, которая будет отсортированная для правильной настройки текста
        sortedData: [],
        // Шаги которые будут обьявлять количество блоков по Y и текст, который будет писаться возле линии
        step: 0,
        // Здесь будет хранится минимальное значение отсортированного массива, в случае отсутствия нуля, чтобы начинать отсчет шагов именно с него
        minStep: 0,
        // Создаем переменную yStepFactor, она нам нужна для цикла в функции отрисовки текста, проверяем нужен ли нам 0
        stepFactor: 0,
        // Количество минусовых значений на графике по оси Y
        minusValueQuantity: 0,
        // Обьявляем переменную, которая будет хранить количество блочков по оси Y
        rectQuantity: 0,
    };

    // Проходимся по всем ячейкам массива с данными по оси Y и добавлям инфу по нужным свойствам нашего обьекта с настройками
    if (options.data.datasets && options.data.datasets.length > 0) {
        options.data.datasets.forEach((dataEl) => {
            yAxisDataOptions.dataName.push(dataEl.name);
            yAxisDataOptions.originalData.push(dataEl.yData);
            yAxisDataOptions.sortedData.push(dataEl.yData);
        });
    }

    // (Line Chart Canvas Library 1.31)
    // Закрываем это все в анонимной функции, чтобы не обьявлять эти все переменные в глобальной области видимости класса
    ; (function () {
        // Переменная с нашими данными для оси Y, которая будет отсортированная для правильной настройки текста
        let yDataSorted = yAxisDataOptions.sortedData[0] || [];

        // Оставаляем только уникальные значения, тем самым формируя уже готовый массив с даннными для оси Y
        yDataSorted = getUniqueValues(yDataSorted);

        // Сортируем массив данных по увеличению
        yDataSorted.sort(function (firstNumb, secondNumb) {
            return firstNumb - secondNumb;
        });

        // Шаги которые будут обьявлять количество блоков по Y и текст, который будет писаться возле линии
        let yDataStep = yAxisDataOptions.step;
        // Здесь будет хранится минимальное значение отсортированного массива, в случае отсутствия нуля, чтобы начинать отсчет шагов именно с него
        let yDataMinStep = yAxisDataOptions.minStep;
        // Создаем переменную yStepFactor, она нам нужна для цикла в функции отрисовки текста, проверяем нужен ли нам 0
        let yStepFactor = yAxisDataOptions.stepFactor;
        // Количество минусовых значений на графике по оси Y
        let yDataMinusQuantity = yAxisDataOptions.minusValueQuantity;
        // Обьявляем переменную, которая будет хранить количество блочков по оси Y
        let yDataRectQuantity = yAxisDataOptions.rectQuantity;
        // Формула по нахождению шага ( заключил в анонимную функцию. чтобы не сохранять промежуточную переменную)
        ; (function () {
            // Проверяем наличие минусовых значений ( Действия отличаются, если таковы присутствуют )
            if (yDataSorted[0] >= 0) {
                // Берем последнее число нашего отсортированного массива ( получается - самое большое число и делим его на 5)
                let intermediateNumber = +yDataSorted[yDataSorted.length - 1] / 5;
                /* Теперь, отнимаем получившееся число от этого числа деленого на 5 по модулю, если итог равен 0, тогда просто округляем
                    наше получившееся число, в ином случае делаем задуманное, отнимаем число от этого же числа деленного на 5 по модулю */
                yDataStep = intermediateNumber - (intermediateNumber % 5) === 0 ? Math.round(intermediateNumber) : intermediateNumber - (intermediateNumber % 5);

                // (1.1 Canvas Library) - Запихиваем проверку на ноль в блоки кода, которые выполняются взависимо от наличия минусовых значений
                if (yDataSorted.indexOf('0') >= 0 || yDataSorted[0].split('')[0] === '-' || +yDataSorted[0] < yDataStep) {
                    yStepFactor = 0;
                } else {
                    /* (1.1 Canvas Library) - Создаем промежуточную переменную, наш делитель и увеличиваем его на 1, пока он не станет
                        равным или больше числа 5. Эта переменная нам будет нужна, чтобы уменьшить количество шагов, и соответственно 
                        увеличить количество блоков и текста.
                    */
                    let dividerValue = 0;
                    while (dividerValue <= 5) {
                        dividerValue += 1;
                    }

                    yStepFactor = 1;

                    // Поверка на маленький шаг, если он мелкий, тогда делаем дробь из нашего шага
                    if (yDataStep <= 10) {
                        // Старый вариант
                        // yDataStep = yDataStep / dividerValue;
                        yDataStep = +(yDataStep / dividerValue).toFixed(1);
                    }

                    // Если нуля нету, записываем наш минимальный шаг
                    yDataMinStep = +(yDataSorted[0] - yDataStep).toFixed(1);
                    // Старый вариант
                    // yDataMinStep = Math.round(yDataMinStep);

                    // Если ноль нам не нужен, тогда уменьшаем количество отрисоваемых блоков по оси Y
                    yDataRectQuantity--;
                }
                /* Прогоняемся по циклу, умножаем шаги на i, пока это число меньше, чем последний элемент 
                    массива + один шаг, прибавляем количество наших блочков
                    (1.1 Canvas Plugin) - К умножению шага на текущее значение иттерации прибавляем еще наш минимальный шаг, 
                    чтобы корректно отображалось правильное количество блоков
                */
                for (let i = 0; yDataStep * i + yDataMinStep <= +yDataSorted[yDataSorted.length - 1]; i++) {
                    yDataRectQuantity++;
                }

                /* Дополнительная проверка - делим по модулю последнее число массива на шаги, если есть остаток, значит
                    увеличиваем количество блоков еще на один 
                    (1.1 CanvasPlugin - Делим по модулю на значение шага + значение минимального шага для корректного отображения
                    количества блоков)
                */
                if (+yDataSorted[yDataSorted.length - 1] % (yDataStep + yDataMinStep) != 0) {
                    yDataRectQuantity++
                };

                /*  (1.2 CanvasPlugin): 
                    1 - Удалена лишняя проверка.
                    2 - Добавлена проверка на то, что последнее число отсортированного массива данных по оси Y не меньше, чем
                    последнее отрисованное число на графике с помощью переменной yDataStep.
                */
                if (yDataRectQuantity * yDataStep < +yDataSorted[yDataSorted.length - 1]) {
                    yDataRectQuantity++;
                }

            } else {
                /*  Берем последнее число нашего отсортированного массива и прибавляем к нему 
                    первое значение массива, перед этим конвертировавши его в плюсовое ( получается - самое большое число и делим его на 5) 
                */
                let intermediateNumber = (+yDataSorted[yDataSorted.length - 1] + -yDataSorted[0]) / 5;
                /* Теперь, отнимаем получившееся число от этого числа деленого на 5 по модулю, если итог равен 0, тогда просто округляем
                    наше получившееся число, в ином случае делаем задуманное, отнимаем число от этого же числа деленного на 5 по модулю */
                yDataStep = intermediateNumber - (intermediateNumber % 5) === 0 ? Math.round(intermediateNumber) : intermediateNumber - (intermediateNumber % 5);
                // Считаем количество минусов до нолика, путем деления первого элемента на шаг, округляем к наибольшему значению
                yDataMinusQuantity = Math.ceil(-yDataSorted[0] / +yDataStep);

                /* Прогоняемся по циклу, умножаем шаги на i, пока это число меньше, чем последний элемент 
                    массива + один шаг, прибавляем количество наших блочков*/
                for (let i = 0; yDataStep * i <= +yDataSorted[yDataSorted.length - 1] + -yDataSorted[0]; i++) {
                    yDataRectQuantity++;
                }

                /* Дополнительная проверка - делим по модулю последнее число массива + первое число массива на шаги, если есть остаток, значит
                    увеличиваем количество блоков еще на один */
                if (+yDataSorted[yDataSorted.length - 1] + -yDataSorted[0] % yDataStep != 0) {
                    yDataRectQuantity++;
                };

                // Проверка на то, что последнее плюсовое число не меньше последнего числа массива данных
                // Отнимаем 1, чтобы не считать 0
                let yDatapositiveBalance = (yDataRectQuantity - yDataMinusQuantity) - 1;
                /* Если все умножить количество плюсовых чисел на шаг и результат будет меньше, чем последнее число 
                массива данных, тогда увеличить количество чисел возле линии */
                if (yDatapositiveBalance * yDataStep < +yDataSorted[yDataSorted.length - 1]) {
                    yDataRectQuantity++;
                }
            }
        })();

        // Высота одного блока ( Делим высоту поля на количество блоков по Y - 1, потому что рисуется на один блок больше, чем текста)
        // Присваиваем высоту свойству объекта, в котором хранятся настройки наших блоков
        rectOptions.height = rectFieldOptions.height / (yDataRectQuantity - 1);

        // Схораняем новые значения в наш ранее созданный объект
        // Шаги которые будут обьявлять количество блоков по Y и текст, который будет писаться возле линии
        yAxisDataOptions.step = yDataStep;
        // Здесь будет хранится минимальное значение отсортированного массива, в случае отсутствия нуля, чтобы начинать отсчет шагов именно с него
        yAxisDataOptions.minStep = yDataMinStep;
        // Создаем переменную yStepFactor, она нам нужна для цикла в функции отрисовки текста, проверяем нужен ли нам 0
        yAxisDataOptions.stepFactor = yStepFactor;
        // Количество минусовых значений на графике по оси Y
        yAxisDataOptions.minusValueQuantity = yDataMinusQuantity;
        // Обьявляем переменную, которая будет хранить количество блочков по оси Y
        yAxisDataOptions.rectQuantity = yDataRectQuantity;
        // Отсортированный массив данных
        yAxisDataOptions.sortedData = yDataSorted;
    })();

    /* -------- Настройка блоков по оси X -------- */

    let xAxisDataOptions = {
        // Помещяем информацию для линии по оси X
        originalData: options.data.xData,
        sortedData: options.data.xData,
        // Оригинальное количество значений в массиве данных по оси X, до всяких изменений
        originalRectQuantity: options.data.xData.length || 0,
        // Количество блоков по оси X
        rectQuantity: options.data.xData.length || 0,
        // Ограничения, при котором массив данных для оси X выводится через один элемент
        confineValue: 50,
    };

    // Помещаем это все в анонимную функцию, чтобы не обьявлять переменные в глобальной области видимости класса
    ; (function () {
        // Помещаем информацию для линии по оси X
        let xDataSorted = xAxisDataOptions.sortedData;
        // Оригинальное количество значений в массиве данных по оси X, до всяких изменений
        let xDataRectQuantityOriginal = xAxisDataOptions.originalRectQuantity;
        // Количество блоков по оси X
        let xDataRectQuantity = xAxisDataOptions.rectQuantity;
        // Ограничения, при котором массив данных для оси X выводится через один элемент
        let xDataConfineValue = xAxisDataOptions.confineValue;

        // Ширина одного блока ( Делим ширину поля на колчество блоков по X - 1, потому что рисуется на один блок больше, чем текста)
        // Так как мы теперь узнали количество блоков по оси X, добвляем ширину в наш объект
        rectOptions.width = rectFieldOptions.width / (xDataRectQuantity - 1);

        // Если данных по оси X слишком много, тогда выводим их через раз ( сжимаем ) для большей красоты отрисовки
        if (xDataRectQuantityOriginal > xDataConfineValue) {
            xDataSorted = xDataSorted.filter(function (currentData, currentDataIndex) {
                return currentDataIndex % 2 == 0;
            });
            xDataRectQuantity = xDataSorted.length;
            rectOptions.width = rectFieldOptions.width / (xDataRectQuantity - 1);
        }

        // Обновляем данные в нашем объекте
        xAxisDataOptions.originalRectQuantity = xDataRectQuantityOriginal;
        xAxisDataOptions.sortedData = xDataSorted;
        xAxisDataOptions.rectQuantity = xDataRectQuantity;
        xAxisDataOptions.confineValue = xDataConfineValue;
    })();


    /* -------- Настройка текста -------- */
    let chartFontOptions = options.globalFontOptions || {
        fontSize: 12,
        fontFamily: 'Arial',
        fontColor: 'grey'
    };


    /* -------- Настройка линий графика -------- */
    // Все настройки, которые указал пользователь
    let chartLineOptions = options.chartLineOptions || {
        arcRadius: 2.5,
        hoverArcRadius: 7,
        lineWidth: 3,
        lineColor: '#61AAC7'
    };


    /* -------- Настройка контейнера с информацией -------- */
    let infoContainerOptions = options.infoContainerOptions || {
        containerWidth: 140,
        containerHeight: 45,
        containerRadius: 10,
        containerFillColor: "rgba(0, 0, 0, 0.8)",
    }

    // (Line Chart Canvas Library 1.3) - Обьявляем приватные свойства в ранее созданном обьекте для большей гибкости работы с этими данными
    infoContainerOptions.containerWidth = 140;
    infoContainerOptions.containerHeight = 45;
    infoContainerOptions.triangleWidth = 7;

    let infoContainerFontOptions = options.infoContainerFontOptions || chartFontOptions;




    /* ------------- СОБЫТИЯ КОМПОНЕНТА ------------- */

    // Событие тригерится при наведении на круг
    ctx.canvas.onmousemove = function (event) {
        let canvasCoord = ctx.canvas.getBoundingClientRect(),
            xCoords = event.clientX - canvasCoord.left,
            yCoords = event.clientY - canvasCoord.top;
        // Очищаем наш холст
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Отрисовываем его заного и передаем координаты нашей мыши главной функции, которая все рисует
        draw(xCoords, yCoords);
    }




    /* ------------- ФУНКЦИИ ( в конце присваиваются публичные ) ------------- */

    /* Функция которая рисует наш график (Два параметра, которые передаются потом в функцию отрисовки кругов
        и линий) 
    */
    function draw(xCoordsChartLines, yCoordsChartLines) {
        drawBlocks(ctx, rectFieldOptions, rectOptions, yAxisDataOptions.rectQuantity, xAxisDataOptions.rectQuantity);
        drawYLineText(ctx, rectFieldOptions, rectOptions, yAxisDataOptions, chartFontOptions);
        drawXLineText(ctx, rectFieldOptions, rectOptions, xAxisDataOptions, chartFontOptions);
        drawChartLines(ctx, rectFieldOptions, rectOptions, xAxisDataOptions, yAxisDataOptions, chartLineOptions, xCoordsChartLines, yCoordsChartLines);
    }



    /* ------------- Приватные функции, с помощью которых рисуется наш график ------------- */

    // Функция, которая рисует Блоки
    function drawBlocks(
        ctx, // Контекст холста
        rectFieldOptions, // Настройки поля
        // Передаем объект с настройками блоков
        {
            height, // Высота блока
            width, // Ширина блока
            lineWidth, // Ширина границ блоков и всего графика
            borderColor // Цвет границ блоков

        },
        yDataRectQuantity, // Количество блоков по оси Y
        xDataRectQuantity, // Количество блоков по оси X
    ) {
        ctx.beginPath();
        // Ставим по умолчанию темный цвет линий главных осей
        ctx.strokeStyle = '#000';
        // Ширина границ блоков
        ctx.lineWidth = lineWidth;
        // Y Линия
        drawStraightLine(
            ctx,
            rectFieldOptions.xStartPos,
            rectFieldOptions.xStartPos,
            rectFieldOptions.xStartPos,
            rectFieldOptions.height + rectFieldOptions.xStartPos
        );
        // X Линия
        drawStraightLine(
            ctx,
            rectFieldOptions.xStartPos,
            rectFieldOptions.height + rectFieldOptions.xStartPos,
            rectFieldOptions.width + rectFieldOptions.xStartPos,
            rectFieldOptions.height + rectFieldOptions.xStartPos
        );
        ctx.stroke();
        // Цвет границы блока
        ctx.strokeStyle = borderColor;

        /* Проходимся по количеству блоков по осям X и Y, отнимаем от количеств еденицу, чтобы
            не рисовалось на одну линию блоков больше. */
        for (let i = 0; i < yDataRectQuantity - 1; i++) {
            for (let j = 0; j < xDataRectQuantity - 1; j++) {
                ctx.strokeRect(rectFieldOptions.xStartPos + j * width, rectFieldOptions.xStartPos + i * height, width, height);
            }
        }
    }


    // Функция рисует текст по оси Y
    function drawYLineText(
        ctx, // Контекст холста
        rectFieldOptions, // Настройки поля
        { height }, // Высота блока
        // Объект с настройками данных по оси Y
        {
            step, // Шаг по оси Y
            stepFactor, // Множитель шага, когда минусовых значений не осталось по оси Y
            minusValueQuantity, // Количество минусовых значений
            rectQuantity, // Количество блоков по оси Y
            minStep // Начальное значение, если нет нуля
        },
        chartFontOptions // Настройки шрифтов в объекте
    ) {
        ctx.beginPath();

        // Настройки текста
        editText(ctx, chartFontOptions.fontSize, chartFontOptions.fontFamily, chartFontOptions.fontColor, "center", "middle");

        // Сохраняем наличие минусовых значений для отрисовки дополнительной линии на отметке 0, если она будет
        let haveMinusQuantity = !!minusValueQuantity;

        /* Тут проходимся по циклу, пока i меньше чем количество блоков по оси Y, делаем проверку на наличие количества минусов 
            в переменноу minusValueQuantity, если оно больше 0, тогда шаг умножаем на это количество и выводим цифры, с каждой 
            итерацией отнимаем наше количество минусов.
            Если количество равно или меньше 0 - тогда берем нашу переменную stepFactor и умножаем на шаг, это делается для того, чтобы 
            можно было вывеcти 0 не задев переменную i, потому что она нам нужна для контроля позиции текста */
        for (let i = 0; i < rectQuantity; i++) {
            // Сразу рисуем черточки возле текста
            drawStraightLine(
                ctx,
                rectFieldOptions.xStartPos,
                (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i,
                rectFieldOptions.xStartPos - 10,
                (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i
            );
            ctx.stroke();

            if (minusValueQuantity > 0) {
                ctx.fillText('-' + step * minusValueQuantity, rectFieldOptions.xStartPos - 25, (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i)
                minusValueQuantity--;
            } else {
                // Если сейчас отрисовывается нолик, тогда рисуем поверх дополнительную линию, чтобы она выделялась
                if (stepFactor === 0 && haveMinusQuantity) {
                    drawStraightLine(
                        ctx,
                        rectFieldOptions.xStartPos,
                        (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i,
                        rectFieldOptions.xStartPos + rectFieldOptions.width,
                        (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i
                    )
                }
                /*  (1.1 Canvas Library) - к нулю прибавляем еще нашу новую переменную minStep, чтобы если нет 0 - отрисовка текста начиналась с минимального шага
                    (1.2 Canvas Library):
                    1 - Дополнительное умножения на 10 переменных: minStep, (step * stepFactor).
                    2 - Деление числа, которые получилось в итоге на 10, чтобы вернуть дробную часть, если они есть
                    3 - Сделано это все из-за того, что арифметические операции с числами 0.1, 0.2 и 0.3 выполняются некорректно и
                    выводятся числа с большими дробями, поэтому мы их все перемножаем на 10,а потом разделяем. 
                */
                ctx.fillText(((0 + (minStep * 10) + ((step * stepFactor) * 10)) / 10), rectFieldOptions.xStartPos - 25, (rectFieldOptions.height + rectFieldOptions.yStartPos) - height * i);
                stepFactor++;
            }
        }
    }


    // Функция, которая рисует текст по оси X
    function drawXLineText(
        ctx, // Контекст холста
        rectFieldOptions, // Настройки поля
        { width }, // Ширина блока
        {
            sortedData, // Информация для лнии по оси X ( Отсортированная )
            rectQuantity, // Ширина блока
        },
        chartFontOptions // Настройки шрифтов в объекте
    ) {
        ctx.beginPath();

        // Настройки текста
        editText(ctx, chartFontOptions.fontSize, chartFontOptions.fontFamily, chartFontOptions.fontColor, "center", "middle");

        /* Проходимся по количеству блоков по оси X, если это количество меньше за 20 - рисуем текст обычно, горизонтально,
            если количество переваливает за 20, тогда делаем фишку с translate, чтобы повернуть текст и слелать его компактнее */
        for (let i = 0; i < rectQuantity; i++) {
            // Сразу рисуем черточки возле текста
            drawStraightLine(
                ctx,
                rectFieldOptions.xStartPos + width * i,
                (rectFieldOptions.height + rectFieldOptions.yStartPos),
                rectFieldOptions.xStartPos + width * i,
                (rectFieldOptions.height + rectFieldOptions.yStartPos) + 10
            )
            ctx.stroke();

            if (rectQuantity < 20) {
                ctx.fillText(sortedData[i], rectFieldOptions.xStartPos + width * i, (rectFieldOptions.height + rectFieldOptions.yStartPos) + 25);
            } else {
                ctx.save();
                ctx.translate(rectFieldOptions.xStartPos + width * i - 15, (rectFieldOptions.height + rectFieldOptions.yStartPos) + 25);
                ctx.rotate(-Math.PI / 4);
                ctx.translate(-(rectFieldOptions.xStartPos + width * i - 15), -((rectFieldOptions.height + rectFieldOptions.yStartPos) + 25));
                ctx.textAlign = 'center';
                ctx.fillText(sortedData[i], rectFieldOptions.xStartPos + width * i - 15, (rectFieldOptions.height + rectFieldOptions.yStartPos) + 25);
                ctx.restore();
            }
        }
    }


    // Функция которая рисует сами линии графика
    function drawChartLines(
        ctx, // Контекст холста
        rectFieldOptions, // Настройки поля, где находится график
        rectOptions, // Настройки блоков
        xAxisDataOptions, // Настройки данных по оси X
        yAxisDataOptions, // Настройки данных по оси Y
        lineOptions, // Обьект с настройками стилей линии
        xCoords, // Координаты мышки по x
        yCoords // Координаты мышки по y
    ) {
        // Создание переменных для настройки линий
        let arcRadius = lineOptions.arcRadius,
            hoverArcRadius = lineOptions.hoverArcRadius / 2,
            lineWidth = lineOptions.lineWidth,
            lineColor = lineOptions.lineColor;

        // Распределяем по переменным информацию объектов с опциями
        let rectWidth = rectOptions.width,
            rectHeight = rectOptions.height;

        let xDataRectQuantityOriginal = xAxisDataOptions.originalRectQuantity,
            xDataRectQuantity = xAxisDataOptions.rectQuantity,
            xDataConfineValue = xAxisDataOptions.confineValue,
            xDataSorted = xAxisDataOptions.sortedData,
            xDataOriginal = xAxisDataOptions.originalData;

        let yDataOriginal = yAxisDataOptions.originalData[0],
            yDataSorted = yAxisDataOptions.sortedData,
            yDataRectQuantity = yAxisDataOptions.rectQuantity,
            yDataStep = yAxisDataOptions.step,
            yStepFactor = yAxisDataOptions.stepFactor,
            yDataMinusQuantity = yAxisDataOptions.minusValueQuantity,
            yDataName = yAxisDataOptions.dataName,
            yDataMinStep = yAxisDataOptions.minStep;

        let rectFieldHeight = rectFieldOptions.height,
            rectFieldWidth = rectFieldOptions.width,
            fieldXStartPos = rectFieldOptions.xStartPos,
            fieldYStartPos = rectFieldOptions.yStartPos;

        // (Line Chart Canvas Library 1.3) - Создаем переменную, в которую будем помещать координаты точки, на которую попала мышка
        let coordinatesForChartInfoContainer = {};


        ctx.beginPath();
        // Настройки линии
        ctx.fillStyle = lineColor;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;

        // Проверяем количество данных по X, чтобы выбрать нужный способ отрисовки линий
        if (xDataRectQuantityOriginal <= xDataConfineValue) {
            // Проходимся по количеству информации по оси X
            for (let i = 0; i < xDataRectQuantityOriginal; i++) {
                // Мои формулы для процентного расчета текущего числа ( умножаем и делим накрест )
                /*  1. rectFieldHeight - Высота нашего поля = самая высокая точка на графике 100%
                    2. yDataStep * (yDataRectQuantity - 1) - Число, которое находится на самой вершине, смотря по количеству шагов,
                    та же самая высока точка на графике.
                    3. Умножаем высоту поля на текущее значение.
                    4. Делим это все на самое большое число на графике 
                */
                let heightFindFormula = (rectFieldHeight * yDataOriginal[i]) / (yDataStep * (yDataRectQuantity - 1));
                let futureHeightFindFormula = (rectFieldHeight * yDataOriginal[i + 1]) / (yDataStep * (yDataRectQuantity - 1));
                /* В этой переменной хранится значение на которое нужно опустить график линий вниз, она нужна, когда
                    возле оси Y нет нуля
                */
                let moveDownValue = 0;
                /* Переменная в которой хранится значение, на которое мы должны подвинуть график вверх, чтобы корректно отрисовывались
                    линии, когда есть минусовые значения 
                */
                let moveUpValue = rectHeight * yDataMinusQuantity;

                // Делаем проверку на наличие нуля, если нуля нет, тогда будем сдвигать график на блок вниз
                if (yStepFactor) {
                    /* (1.1 Canvas Library) - Меняем формулу нахождения значения на которое мы должны подвинуть график вниз
                        Берем минимальное значение отсортированного массива, делим его на шаг и рзультат выражения умножаем
                        на высоту одного блока
                    */
                    moveDownValue = (yDataSorted[0] / yDataStep) * rectHeight;
                };

                // Переменные, в которых хранятся границы круга ( Добавляем и отнимаем 5, чтобы немного увеличить радиус срабатывания события на круге, для большего комфорта )
                let circleUpLeftPointX = (fieldXStartPos + rectWidth * i) - arcRadius - 5,
                    circleUpLeftPointY = ((rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue) - arcRadius - 5,
                    circleDownRightPointX = (fieldXStartPos + rectWidth * i) + arcRadius + 5,
                    circleDownRightPointY = ((rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue) + arcRadius + 5;

                // Рисуем круги
                ctx.moveTo((fieldXStartPos + rectWidth * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue);
                // Делаем проверку на попадание мышкой на круг
                if (xCoords >= circleUpLeftPointX && xCoords <= circleDownRightPointX && yCoords >= circleUpLeftPointY
                    && yCoords <= circleDownRightPointY) {
                    ctx.arc((fieldXStartPos + rectWidth * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius + hoverArcRadius, 0, 2 * Math.PI);

                    /* (Line Chart Canvas Library 1.3):
                        1 - Если попали по кружочку - сразу ловим ее координаты и записываем в переменную для подальшей
                        передачи в функцию отрисовки контейнера.
                    */
                    coordinatesForChartInfoContainer = {
                        x: (fieldXStartPos + rectWidth * i),
                        y: (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue
                    };
                } else {
                    ctx.arc((fieldXStartPos + rectWidth * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius, 0, 2 * Math.PI);
                }

                // Проверка на то, чтобы i не вылезла за пределы, чтобы не отрисовывалась лишняя линяя за пределами поля графика
                if (i + 1 < xDataRectQuantity) {
                    // Рисуем линии, которые соединяют эти круги
                    drawStraightLine(
                        ctx,
                        (fieldXStartPos + rectWidth * i),
                        (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue,
                        fieldXStartPos + rectWidth * (i + 1),
                        (rectFieldHeight + fieldYStartPos) - futureHeightFindFormula - moveUpValue + moveDownValue
                    )
                }
            }
        } else {
            /* Проходимся по количеству информации по оси X - 1, чтобы не вылазить за границы шрина поля графика, тут все тоже самое что и 
                в условии, где количество данных меньше за 41, только мы делим ширину блока на два, когда рисуем круги и линии, чтобы на графике вместилось
                больше кругов, и чтобы они соответсвовали недостающему тексту, который у нас поеделен на 2 
            */
            for (let i = 0; i < xDataRectQuantityOriginal - 1; i++) {

                let heightFindFormula = (rectFieldHeight * yDataOriginal[i]) / (yDataStep * (yDataRectQuantity - 1));
                let futureHeightFindFormula = (rectFieldHeight * yDataOriginal[i + 1]) / (yDataStep * (yDataRectQuantity - 1));
                let moveDownValue = 0;
                let moveUpValue = rectHeight * yDataMinusQuantity;

                if (yStepFactor) {
                    moveDownValue = (yDataSorted[0] / yDataStep) * rectHeight;
                };

                let circleUpLeftPointX = (fieldXStartPos + rectWidth / 2 * i) - arcRadius - 5,
                    circleUpLeftPointY = ((rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue) - arcRadius - 5,
                    circleDownRightPointX = (fieldXStartPos + rectWidth / 2 * i) + arcRadius + 5,
                    circleDownRightPointY = ((rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue) + arcRadius + 5;

                ctx.moveTo((fieldXStartPos + rectWidth / 2 * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue);

                if (xCoords >= circleUpLeftPointX && xCoords <= circleDownRightPointX && yCoords >= circleUpLeftPointY
                    && yCoords <= circleDownRightPointY) {
                    ctx.arc((fieldXStartPos + rectWidth / 2 * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius + hoverArcRadius, 0, 2 * Math.PI);

                    coordinatesForChartInfoContainer = {
                        x: (fieldXStartPos + rectWidth / 2 * i),
                        y: (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue
                    };

                } else {
                    ctx.arc((fieldXStartPos + rectWidth / 2 * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius, 0, 2 * Math.PI);
                }

                if (i + 1 < xDataRectQuantityOriginal - 1) {
                    drawStraightLine(
                        ctx,
                        (fieldXStartPos + rectWidth / 2 * i),
                        (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue,
                        fieldXStartPos + rectWidth / 2 * (i + 1),
                        (rectFieldHeight + fieldYStartPos) - futureHeightFindFormula - moveUpValue + moveDownValue
                    )
                }
            }
        }

        ctx.stroke();
        ctx.fill();

        // (Line Chart Canvas Library 1.3) - Проверяем или мы словили координаты во время очередной прорисовки графика.
        if (coordinatesForChartInfoContainer != undefined) {
            // Переменная в которой хранится формула нахождения рисования текста и точек
            let drawTextFormula;
            // Проверка на количество элементов, если оно превышает нужное количество, тогда меняем формулу
            xDataRectQuantityOriginal <= xDataConfineValue ? 
            drawTextFormula = (i) => fieldXStartPos + rectWidth * i :
            drawTextFormula = (i) => fieldXStartPos + rectWidth / 2 * i;

            // Переменные для работы с информационным контейнером
            let infoContainerXCoordinate, // Начало координат контейнера по X
                infoContainerYCoordinate, // Начало координат контейнера по Y
                xText, // Текст, который будет взят из оси X
                yText, // Текст, который будет взят из оси Y
                direction; // Направление в котором будет отрисован контейнер

            // (Line Chart Canvas Library 1.3) - Проверяем на какой половине графика мы словили наведение на круг, чтобы узнать с какой стороны отрисовывать контейнер
            if (coordinatesForChartInfoContainer.x > rectFieldWidth / 2) {
                // Ищем с помощью импортированых функций текст по X и Y и кладем его в новые переменные
                yText = getYAxisText(
                    yDataOriginal,
                    xDataOriginal,
                    coordinatesForChartInfoContainer.x,
                    drawTextFormula
                );

                xText = getXAxisText(
                    xDataOriginal,
                    coordinatesForChartInfoContainer.x,
                    drawTextFormula
                );

                /*
                    Расчитываем позицию путем вытягивания ранее словленных координат круга и отнимания от этого значения ширины и высоты
                    деленой на 2 контейнера.
                */
                infoContainerXCoordinate = coordinatesForChartInfoContainer.x - infoContainerOptions.containerWidth - infoContainerOptions.triangleWidth - hoverArcRadius;
                infoContainerYCoordinate = coordinatesForChartInfoContainer.y - infoContainerOptions.containerHeight / 2;
                // Выбираем направление в котором будет прорисован контейнер
                direction = 'right';
            } else {
                // Ищем с помощью импортированых функций текст по X и Y и кладем его в новые переменные
                yText = getYAxisText(
                    yDataOriginal,
                    xDataOriginal,
                    coordinatesForChartInfoContainer.x,
                    drawTextFormula
                );

                xText = getXAxisText(
                    xDataOriginal,
                    coordinatesForChartInfoContainer.x,
                    drawTextFormula
                );

                /*  
                    Расчитываем позицию путем вытягивания ранее словленных координат круга и отнимания от этого значения ширины и высоты
                    деленой на 2 контейнера.
                */
                infoContainerXCoordinate = coordinatesForChartInfoContainer.x + infoContainerOptions.triangleWidth + 17;
                infoContainerYCoordinate = coordinatesForChartInfoContainer.y - infoContainerOptions.containerHeight / 2;
                // Выбираем направление в котором будет прорисован контейнер
                direction = 'left';
            }
            drawChartInfoContainer(ctx, infoContainerXCoordinate, infoContainerYCoordinate, infoContainerOptions, infoContainerFontOptions, chartLineOptions.lineColor, yDataName, direction, xText, yText);
        }
    }


    // Функция, которая рисует прямоугольник с текущей инфой про точку
    function drawChartInfoContainer(
        ctx, // Контекст холста
        xContainerCoord, // Координата начала контейнера по оси X
        yContainerCoord, // Координата начала контейнера по оси Y
        infoContainerOptions, // Радиус и цвет заливки контейнера
        infoContainerFontOptions, // Настройки шрифтов используемых в контейнере
        lineColor, // Цвет линии
        yDataNames, // Имя данных
        triangleDirection,
        xText,
        yText
    ) {
        // Настройки текста
        let fontSize = infoContainerFontOptions.fontSize,
            fontFamily = infoContainerFontOptions.fontFamily,
            fontColor = infoContainerFontOptions.fontColor;

        // Настройки маркеров данных ( квадратиков с цветами данных )
        let dataMarkerWidth = 13,
            dataMarkerHeight = 13,
            dataMarkerColor = lineColor;

        // Статичные настройки контейнера
        let containerWidth = infoContainerOptions.containerWidth,
            containerHeight = infoContainerOptions.containerHeight,
            containerRadius = infoContainerOptions.containerRadius,
            containerFillColor = infoContainerOptions.containerFillColor,
            triangleWidth = infoContainerOptions.triangleWidth;

        // Начинаем рисовать
        ctx.beginPath();
        ctx.fillStyle = containerFillColor;

        // Используем созданную нами функцию для рисования прямоугольников с закругленными углами
        drawRoundedRect(ctx, xContainerCoord, yContainerCoord, containerWidth, containerHeight, containerRadius);
        // Проверяем какое направление треугольника передала нам функция до этой и в зависимости от ответа используем функцию для рисования треугольника
        if (triangleDirection === 'right') {
            drawTriangle(ctx, xContainerCoord + containerWidth, yContainerCoord + containerHeight / 2, triangleWidth, 10, 'right');
        } else if (triangleDirection === 'left') {
            drawTriangle(ctx, xContainerCoord - 10, yContainerCoord + containerHeight / 2, triangleWidth, 10, 'left');
        }

        // Заливаем его
        ctx.fill();

        // Настройки текста
        editText(ctx, fontSize, fontFamily, fontColor, "left", "", "bold");

        // Сохраняем стили для текста
        ctx.save();
        /* Рисуем текст, который связан с нарисованным текстом по оси X ( Рисуем его там, где находится наш 
            контейнер + величина нашего шрифта и + 3 по оси X и + 15 по оси Y, чтобы текст был не возле краёв )
        */
        ctx.fillText('Time:', xContainerCoord, yContainerCoord + 15);
        ctx.fillText(xText, xContainerCoord + ctx.measureText('Time:').width + 5, yContainerCoord + 15);

        // Рисуем квадратик с цветом наших данных, по которым чертятся линии
        ctx.fillStyle = dataMarkerColor;
        drawRoundedRect(ctx, xContainerCoord, (yContainerCoord + 32) - dataMarkerWidth / 2, dataMarkerWidth, dataMarkerHeight, 0);
        ctx.fill();
        // Откатываемся до последнего сохранения, чтобы поставить правильные стили для текста
        ctx.restore();

        // Рисуем текст, который связан с нарисованным текстом по оси Y, убраем жирный шрифт
        editText(ctx, fontSize, fontFamily);

        ctx.fillText(yDataNames + ':', xContainerCoord + dataMarkerWidth + 3, yContainerCoord + 33);
        ctx.fillText(yText, xContainerCoord + dataMarkerWidth + 3 + ctx.measureText(yDataNames + ':').width + 5, yContainerCoord + 33);
    };


    // ----- Присваиваем публичные функции ----- 
    this.draw = draw;
}

