// Class
export let lineChart = function (ctx, options) {
    /* ------------- ПРИВАТНЫЕ СВОЙСТВА ------------- */


    /* ------------- Настрока блоков ------------- */

    /* Высота и ширина поля в котором будут находится блоки (Отнимаем от ширины и высоты
        холста по 200, чтобы осталось место для надписей и заголовков) */
    let rectFieldWidth = ctx.canvas.width - 200,
        rectFieldHeight = ctx.canvas.height - 200;
    // Начало поля для блоков по X и по Y
    let fieldXStartPos = 80,
        fieldYStartPos = 80;
    // Цвет границ блоков
    let rectBorderColor = 'lightgrey';
    if (options.rectOptions) {
        rectBorderColor = options.rectOptions.rectBorderColor || 'lightgrey';
    }
    // Ширина границ блоков
    let rectLineWidth = 0.5;


    /* -------- Настройка блоков по оси Y-------- */

    // Переменная с оригинальными данными
    let yDataOriginal = options.data.yData || [];
    // Переменная с нашими данными для оси Y, которая будет отсортированная для правильной настройки текста
    let yDataSorted = options.data.yData || [];

    // Оставаляем только уникальные значения, тем самым формируя уже готовый массив с даннными для оси Y
    yDataSorted = getUniqueValues(yDataSorted);

    // Сортируем массив данных по увеличению
    yDataSorted.sort(function (firstNumb, secondNumb) {
        return firstNumb - secondNumb;
    });

    // Шаги которые будут обьявлять количество блоков по Y и текст, который будет писаться возле линии
    let yDataStep = 0;
    // Здесь будет хранится минимальное значение отсортированного массива, в случае отсутствия нуля, чтобы начинать отсчет шагов именно с него
    let yDataMinStep = 0;
    // Создаем переменную yStepFactor, она нам нужна для цикла в функции отрисовки текста, проверяем нужен ли нам 0
    let yStepFactor = 0;
    // Количество минусовых значений на графике по оси Y
    let yDataMinusQuantity = 0;
    // Обьявляем переменную, которая будет хранить количество блочков по оси Y
    let yDataRectQuantity = 0;
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
                    yDataStep = yDataStep / dividerValue;
                    // yDataStep = (yDataStep / dividerValue).toFixed(1);
                }

                // Если нуля нету, записываем наш минимальный шаг
                yDataMinStep = +yDataSorted[0] - yDataStep;

                // yDataMinStep = Math.round(yDataMinStep);
                
                // Если ноль нам не нужен, тогда уменьшаем количество отрисоваемых блоков по оси Y
                yDataRectQuantity--;
            }
            /* Прогоняемся по циклу, умножаем шаги на i, пока это число меньше, чем последний элемент 
                массива + один шаг, прибавляем количество наших блочков
                (1.1 Canvas Plugin - К умножению шага на текущее значение иттерации прибавляем еще наш минимальный шаг, 
                чтобы корректно отображалось правильное количество блоков)
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

        } else {
            /* Берем последнее число нашего отсортированного массива и прибавляем к нему 
            первое значение массива, перед этим конвертировавши его в плюсовое ( получается - самое большое число и делим его на 5) */
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
    let rectHeight = rectFieldHeight / (yDataRectQuantity - 1);


    /* -------- Настройка блоков по оси X -------- */
    // Помещяем информацию для линии по оси X
    let xDataOriginal = options.data.xData;
    let xDataSorted = options.data.xData;
    // Оригинальное количество значений в массиве данных по оси X, до всяких изменений
    let xDataRectQuantityOriginal = options.data.xData.length || 0;
    // Количество блоков по оси X
    let xDataRectQuantity = options.data.xData.length || 0;
    // Ширина одного блока ( Делим ширину поля на колчество блоков по X - 1, потому что рисуется на один блок больше, чем текста)
    let rectWidth = rectFieldWidth / (xDataRectQuantity - 1);
    // Ограничения, при котором массив данных для оси X выводится через один элемент
    let xDataConfineValue = 50;

    // Если данных по оси X слишком много, тогда выводим их через раз ( сжимаем ) для большей красоты отрисовки
    if (xDataRectQuantityOriginal > xDataConfineValue) {
        xDataSorted = xDataSorted.filter(function (currentData, currentDataIndex) {
            return currentDataIndex % 2 == 0;
        });
        xDataRectQuantity = xDataSorted.length;
        rectWidth = rectFieldWidth / (xDataRectQuantity - 1);
    }


    /* -------- Настройка текста -------- */
    let chartFontOptions = options.fontOptions || {
        chartFontSize: 12,
        chartFontFamily: 'Arial',
        chartFontColor: 'grey'
    };


    /* -------- Настройка линий графика -------- */
    // Все настройки, которые указал пользователь
    let chartLineOptions = options.chartLineOptions || {
        arcRadius: 2.5,
        hoverArcRadius: 7,
        lineWidth: 3,
        lineColor: '#61AAC7'
    };





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
        drawBlocks(ctx, rectHeight, rectWidth, yDataRectQuantity, xDataRectQuantity, rectLineWidth, rectBorderColor);
        drawYLineText(ctx, rectHeight, yDataStep, yStepFactor, yDataMinusQuantity, yDataRectQuantity, chartFontOptions);
        drawXLineText(ctx, xDataSorted, rectWidth, xDataRectQuantity, chartFontOptions);
        drawChartLines(ctx, yDataOriginal, rectWidth, rectHeight, xDataRectQuantityOriginal, xDataRectQuantity, yDataRectQuantity, chartLineOptions, xCoordsChartLines, yCoordsChartLines);
        drawChartInfoContainer(ctx);
    }



    /* ------------- Приватные функции, с помощью которых рисуется наш график ------------- */

    // Функция, которая рисует Блоки
    function drawBlocks(
        ctx, // Контекст холста
        rectHeight, // Высота блока
        rectWidth, // Ширина блока
        yDataRectQuantity, // Количество блоков по оси Y
        xDataRectQuantity, // Количество блоков по оси X
        rectLineWidth, // Ширина границ блоков и всего графика
        rectBorderColor // Цвет границ блоков
    ) {
        ctx.beginPath();
        // Ставим по умолчанию темный цвет линий главных осей
        ctx.strokeStyle = '#000';
        // Ширина границ блоков
        ctx.lineWidth = rectLineWidth;
        // Y Линия
        ctx.moveTo(fieldXStartPos, fieldYStartPos);
        ctx.lineTo(fieldXStartPos, rectFieldHeight + fieldYStartPos);
        // X Линия
        ctx.moveTo(fieldXStartPos, rectFieldHeight + fieldYStartPos);
        ctx.lineTo(rectFieldWidth + fieldXStartPos, rectFieldHeight + fieldYStartPos);
        ctx.stroke();
        // Цвет границы блока
        ctx.strokeStyle = rectBorderColor;

        /* Проходимся по количеству блоков по осям X и Y, отнимаем от количеств еденицу, чтобы
            не рисовалось на одну линию блоков больше. */
        for (let i = 0; i < yDataRectQuantity - 1; i++) {
            for (let j = 0; j < xDataRectQuantity - 1; j++) {
                ctx.strokeRect(fieldXStartPos + j * rectWidth, fieldYStartPos + i * rectHeight, rectWidth, rectHeight)
            }
        }
    }


    // Функция рисует текст по оси Y
    function drawYLineText(
        ctx, // Контекст холста
        rectHeight, // Высота блока
        yDataStep, // Шаг по оси Y
        yStepFactor, // Множитель шага, когда минусовых значений не осталось по оси Y
        yDataMinusQuantity, // Количество минусовых значений
        yDataRectQuantity, // Количество блоков по оси Y
        chartFontOptions // Настройки шрифтов в объекте
    ) {
        ctx.beginPath();

        // Настройки текста
        ctx.font = chartFontOptions.chartFontSize + "px " + chartFontOptions.chartFontFamily;
        ctx.fillStyle = chartFontOptions.chartFontColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Сохраняем наличие минусовых значений для отрисовки дополнительной линии на отметке 0, если она будет
        let haveMinusQuantity = !!yDataMinusQuantity;

        /* Тут проходимся по циклу, пока i меньше чем количество блоков по оси Y, делаем проверку на наличие количества минусов 
            в переменноу yDataMinusQuantity, если оно больше 0, тогда шаг умножаем на это количество и выводим цифры, с каждой 
            итерацией отнимаем наше количество минусов.
            Если количество равно или меньше 0 - тогда берем нашу переменную yStepFactor и умножаем на шаг, это делается для того, чтобы 
            можно было вывеcти 0 и не задев переменную i, потому что она нам нужна для контроля позиции текста */
        for (let i = 0; i < yDataRectQuantity; i++) {
            // Сразу рисуем черточки возле текста
            ctx.moveTo(fieldXStartPos, (rectFieldHeight + fieldYStartPos) - rectHeight * i);
            ctx.lineTo(fieldXStartPos - 10, (rectFieldHeight + fieldYStartPos) - rectHeight * i);
            ctx.stroke();

            if (yDataMinusQuantity > 0) {
                ctx.fillText('-' + yDataStep * yDataMinusQuantity, fieldXStartPos - 25, (rectFieldHeight + fieldYStartPos) - rectHeight * i)
                yDataMinusQuantity--;
            } else {
                // Если сейчас отрисовывается нолик, тогда рисуем поверх дополнительную линию, чтобы она выделялась
                if (yStepFactor === 0 && haveMinusQuantity) {
                    ctx.moveTo(fieldXStartPos, (rectFieldHeight + fieldYStartPos) - rectHeight * i);
                    ctx.lineTo(fieldXStartPos + rectFieldWidth, (rectFieldHeight + fieldYStartPos) - rectHeight * i);
                }
                // (1.1 Canvas Library) - к нулю прибавляем еще нашу новую переменную yDataMinStep, чтобы если нет 0 - отрисовка текста начиналась с минимального шага
                ctx.fillText(0 + yDataMinStep + (yDataStep * yStepFactor), fieldXStartPos - 25, (rectFieldHeight + fieldYStartPos) - rectHeight * i);
                yStepFactor++;
            }
        }
    }


    // Функция, которая рисует текст по оси X
    function drawXLineText(
        ctx, // Контекст холста
        xDataSorted, // Информация для лнии по оси X ( Отсортированная )
        rectWidth, // Ширина блока
        xDataRectQuantity, // Количество блоков по оси X
        chartFontOptions // Настройки шрифтов в объекте
    ) {
        ctx.beginPath();

        // Настройки текста
        ctx.font = chartFontOptions.chartFontSize + "px " + chartFontOptions.chartFontFamily;
        ctx.fillStyle = chartFontOptions.chartFontColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        /* Проходимся по количеству блоков по оси X, если это количество меньше за 20 - рисуем текст обычно, горизонтально,
            если количество переваливает за 20, тогда делаем фишку с translate, чтобы повернуть текст и слелать его компактнее */
        for (let i = 0; i < xDataRectQuantity; i++) {
            // Сразу рисуем черточки возле текста
            ctx.moveTo(fieldXStartPos + rectWidth * i, (rectFieldHeight + fieldYStartPos));
            ctx.lineTo(fieldXStartPos + rectWidth * i, (rectFieldHeight + fieldYStartPos) + 10);
            ctx.stroke();

            if (xDataRectQuantity < 20) {
                ctx.fillText(xDataSorted[i], fieldXStartPos + rectWidth * i, (rectFieldHeight + fieldYStartPos) + 25);
            } else {
                ctx.save();
                ctx.translate(fieldXStartPos + rectWidth * i - 15, (rectFieldHeight + fieldYStartPos) + 25);
                ctx.rotate(-Math.PI / 4);
                ctx.translate(-(fieldXStartPos + rectWidth * i - 15), -((rectFieldHeight + fieldYStartPos) + 25));
                ctx.textAlign = 'center';
                ctx.fillText(xDataSorted[i], fieldXStartPos + rectWidth * i - 15, (rectFieldHeight + fieldYStartPos) + 25);
                ctx.restore();
            }
        }
    }


    // Функция которая рисует сами линии графика
    function drawChartLines(
        ctx, // Контекст холста
        yDataOriginal, // Информация по оси Y ( оригинальная, не сортированная )
        rectWidth, // Ширина блока
        rectHeight, // Высота блока
        xDataRectQuantityOriginal, // Оригинальное количество значений в массиве данных по оси X
        xDataRectQuantity, // Количество блоков по оси X
        yDataRectQuantity, // Количество блоков по оси Y
        lineOptions, // Обьект с настройками стилей линии
        xCoords, // Координаты мышки по x
        yCoords // Координаты мышки по y
    ) {
        // Создание переменных для настройки линий
        let arcRadius = lineOptions.arcRadius || 3,
            hoverArcRadius = lineOptions.hoverArcRadius / 2 || arcRadius + 2,
            lineWidth = lineOptions.lineWidth || 3.5,
            lineColor = lineOptions.lineColor || '#61AAC7';


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
                } else {
                    ctx.arc((fieldXStartPos + rectWidth * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius, 0, 2 * Math.PI);
                }

                // Проверка на то, чтобы i не вылезла за пределы, чтобы не отрисовывалась лишняя линяя за пределами поля графика
                if (i + 1 < xDataRectQuantity) {
                    // Рисуем линии, которые соединяют эти круги
                    ctx.moveTo((fieldXStartPos + rectWidth * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue);
                    ctx.lineTo(fieldXStartPos + rectWidth * (i + 1), (rectFieldHeight + fieldYStartPos) - futureHeightFindFormula - moveUpValue + moveDownValue);
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
                } else {
                    ctx.arc((fieldXStartPos + rectWidth / 2 * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue, arcRadius, 0, 2 * Math.PI);
                }

                if (i + 1 < xDataRectQuantityOriginal - 1) {
                    ctx.moveTo((fieldXStartPos + rectWidth / 2 * i), (rectFieldHeight + fieldYStartPos) - heightFindFormula - moveUpValue + moveDownValue);
                    ctx.lineTo(fieldXStartPos + rectWidth / 2 * (i + 1), (rectFieldHeight + fieldYStartPos) - futureHeightFindFormula - moveUpValue + moveDownValue);
                }

            }
        }
        ctx.stroke();
        ctx.fill();
    }


    // Функция, которая рисует прямоугольник с текущей инфой про точку
    function drawChartInfoContainer(
        ctx, // Контекст холста
        xContainerCoord, // Координата начала контейнера по оси X
        yContainerCoord, // Координата начала контейнера по оси Y
    ) {
        // Статичные настройки контейнера
        let containerWidth = 120,
            containerHeight = 50,
            containerRadius = 10,
            containerFillColor = "rgba(0, 0, 0, 0.8)";

        // Начинаем рисовать
        ctx.beginPath();
        ctx.fillStyle = containerFillColor;

        // Используем созданную нами функцию для рисования прямоугольников с закругленными углами
        drawRoundedRect(25, 55, containerWidth, containerHeight, containerRadius, true);
        // Заливаем его
        ctx.fill();
    };



    /* ------------- Приватные воспомогательные функции ------------- */

    // Функция для выборки только уникальных значений из массива
    function getUniqueValues(arr) {
        let obj = {};

        arr.forEach(function (currentValue, currentIndex) {
            obj[currentValue] = true;
        });

        return Object.keys(obj);
    }

    // Функция для рисования прямоугольника с закругленными углами
    function drawRoundedRect(
        xStart, // Начало координат X
        yStart, // Начало координат Y
        rectWidth, // Ширина прямоугольника
        rectHeight, // Высота прямоугольника
        radius, // Радиус окружности углов
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
            // Настройка треугольника
            let triangleWidth = 7,
                triangleHeight = 13;

            // Рисуем треугольник
            ctx.moveTo(xStart + rectWidth, yStart + rectHeight / 2 - triangleHeight / 2);
            ctx.lineTo(xStart + rectWidth + triangleWidth, (yStart + rectHeight / 2 - triangleHeight / 2) + triangleHeight / 2);
            ctx.lineTo(xStart + rectWidth, (yStart + rectHeight / 2 - triangleHeight / 2) + triangleHeight);
        }
    };


    // ----- Присваиваем публичные функции ----- 
    this.draw = draw;
}