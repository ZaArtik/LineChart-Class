// Styles 
import './scss/style.scss';

// Custom modules
import { article1 } from './data/temperature.js';
import { lineChart } from './classes/lineChart-Class.js';

// Libraries


let times = [];
let times2 = [];

article1.forEach(function (currentElement, currentIndex) {
    if (currentIndex < 50) {
        times.push(currentElement.time.slice(11, 16));
        times2.push(currentElement.temp / 100);
    }
});


let canvas = document.getElementById('myCanvas');
if (canvas.getContext) {
    let ctx = document.getElementById('myCanvas').getContext('2d');
    // Настраиваем высоту и ширину холстаs
    ctx.canvas.width = 1300;
    ctx.canvas.height = 600;

    let options = {
        data: {
            yData: [7.7, 8.1, 7.8, 8.5, 8.1, 7.9, 7.7, 7.8, 7.7, 8],
            xData: times
        },

        rectOptions: {
            rectBorderColor: 'lightgrey',
        },

        fontOptions: {
            chartFontSize: 12,
            chartFontFamily: 'Arial',
            chartFontColor: 'grey'
        },

        chartLineOptions: {
            arcRadius: 2.5,
            hoverArcRadius: 7,
            lineWidth: 3,
            lineColor: '#61AAC7'
        }
    }

    let newLineChart = new lineChart(ctx, options);
    newLineChart.draw();
}

let kekFunc = () => 5;



/* Проблема с дробями
    1. Проблема [9.5, 8.7, 9, 9.4, 10.1, 9.6, 9.9, 11, 11.1, 8.9] - при введении в данные такого массива
        слишком большие дроби, решается путем округления yDataMinStep и yDataStep, закоментировано
        на строках 77 и 83.
    2. Когда происхоит округление тех переменных - сбивается правильная рисовка линий, нужно как-то исправить.
*/