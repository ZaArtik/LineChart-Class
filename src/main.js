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
            xData: times,
            datasets: [{
                name: 'Temperature',
                yData: times2
            }]
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
        },

        infoContainerOptions: {
            containerRadius: 10,
            containerFillColor: "rgba(0, 0, 0, 0.8)"
        },

        infoContainerFontOptions: {
            infoContainerFontSize: 12,
            infoContainerFontFamily: 'Arial',
            infoContainerFontColor: '#fff'
        }
    }

    let newLineChart = new lineChart(ctx, options);
    newLineChart.draw();
}

let kekFunc = () => 5;



/* Проблема с дробями

*/