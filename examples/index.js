var mapContainer = '.leaflet-overlay-pane';
var graphContainer = '.graph-container';

window.onload = function() {
  // sigma.visual_settings = {
  //   border: {
  //     border_width_per: 0.3 // процент от радиуса ноды, который занимает border
  //   },
  //   node: {
  //     label: 'label', // поле для лейбла
  //     defaultColor: '#3482B9',
  //     transparency: 1.0,
  //     rangers:{
  //       sizing:{
  //         field: ''
  //       },
  //       coloring:{
  //         field: '',
  //         range: ['#ffffff', '#f02020']
  //       }
  //     },
  //     min_size: 4,
  //     max_size: 12
  //   },
  //   edge:{
  //     label: 'label',
  //     arrowSize: 8.0, // размер стрелки для webgl шейдера
  //     transparency: 1.0,
  //     defaultColor: '#3482B9',
  //     rangers:{
  //       sizing:{
  //         field: ''
  //       },
  //       coloring:{
  //         field: '',
  //         range: ['#000000', '#f02020']
  //       }
  //     },
  //     min_size: 0.5,
  //     max_size: 3
  //   }
  // };
  // settings for sigmajs
  var sigmaSettings = {
    nodesPowRatio: 0, // no scale nodes
    edgesPowRatio: 0, // no scale edges
    zoomMin: 0.0005, // максимальное приближение
    zoomMax: 5, // максимальное удаление
    drawLabels: false, // отрисовать лейблы для всех нод
    drawEdgeLabels: false, // отрисовать лейблы для всех ребер
    edgeHoverSizeRatio: 6, // множитель размера ребра при hover событии
    edgeArrowHoverSizeRatio: 3.7, // множитель размера стрелки ребра при hover событии
    defaultEdgeType: 'modelling', // тип рендерщика. "modelling" это название моего рендерщика
    defaultEdgeColor: 'rgba(138, 173, 226, 0.8)', // дефолтный цвет ребра при hover
    defaultEdgeArrowColor: 'rgba(0, 0, 0, 1.0)', // цвет стрелки при hover ребра
    edgeColor: 'default', // применение дефолтных настроек для ребер
    enableEdgeHovering: false, // hover режим ребер. Можно включить
    labelSize: false, // не помню
    labelSizeRatio: 2.3, // множитель размера лейбла. 2.3 - оптимальный
    labelThreshold: 1, // пороговое значение размера ноды, чтобы показывать на ней лейбл
    defaultLabelColor: '#FFFFFF', // цвет текста лейбла
    defaultLabelHoverColor: '#FFFFFF', // цвет текста лейбла при hover
    defaultHoverLabelBGColor: '#2D7FB6', // цвет background лейбла
    defaultHoverLabelColor: '#2D7FB6', // цвет лейбла
    labelHoverBGColor: 'node', // цвет background лейбла брать такой же, как и цвет ноды
    webglOversamplingRatio: 1 // сглаживание. >1 картинка четче, лагает больше. В шейдерах есть обрабочик четкости
  };

  // Если true - рисует как принято у сигмы, если false - облегченный рендерщик для больших данных при mouse событиях
  sigma.mode.graph.standartCaptor = false;
  var mode = sigma.utils.queryString.mode || 'map';
  var filename = sigma.utils.queryString.name || 'input.json';

  sigma.utils.loader(true);
  sigma.utils.fetchFile('settings.json', function (respText) {
    var externalSettings = JSON.parse(respText);
    if(externalSettings.sigmaSettings)
      sigmaSettings = $.extend({}, sigmaSettings, externalSettings.sigmaSettings);
    if(externalSettings.visualSettings)
      sigma.visual_settings = $.extend({}, sigma.visual_settings, externalSettings.visualSettings);
    if(externalSettings.standartCaptor)
      sigma.mode.graph.standartCaptor = externalSettings.standartCaptor;
    if(externalSettings.mode)
      mode = externalSettings.mode;
    if(externalSettings.dataFileName)
      filename = externalSettings.dataFileName;

    sigma.utils.fetchFile(filename, function (respText) {
      var jsonGraph = JSON.parse(respText);
      sigma.mode.init({map: mapContainer, graph: graphContainer}, sigmaSettings);
      sigma.mode.activate(mode, jsonGraph);

      var sigmaInstance = sigma.mode.getInstance();
      sigmaInstance.bind('overNode outNode clickNode doubleClickNode rightClickNode', function(e) {
//      console.log(e);
      });
      sigmaInstance.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
//      console.log(e);
      });
      var dragListener = sigma.plugins.dragNodes(sigmaInstance, sigmaInstance.renderers[0]);
      // sigmaInstance.startForceAtlas2({
      //   iterationsPerRender: 300,
      //   edgeWeightInfluence: 1,
      //   scalingRatio: 100,
      //   gravity: 1,
      //   adjustSizes: true
      // });
      sigma.utils.loader(false);
    });
  });


};