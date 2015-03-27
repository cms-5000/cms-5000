App.CockpitRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('diagrams', ['']);
    controller.set('posts', this.store.find('post'));
    controller.set('pages', this.store.find('page'));
  },
  actions: {
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
  }
  
});

App.CockpitView = Ember.View.extend({
  didInsertElement: function () {

    if (this.get('controller.controllers.register').get('loggedIn')) {
      // Logged in:
      
      /////////////////
      //bar chart for the amount of written words
      /////////////////
      var lastChangeDate = new Date();

      $('#wordAmount').highcharts({

        chart: {
          type: 'area'
        },
        title: {
          text: 'Amount of written words'
        },
        subtitle: {
          text: 'last update: ' + lastChangeDate + ' '
        },
        xAxis: {

          allowDecimals: false,
          labels: {
            formatter: function () {
              if (this.value == '1') return 'Jan';
              if (this.value == '2') return 'Feb';
              if (this.value == '3') return 'Mar';
              if (this.value == '4') return 'Apr';
              if (this.value == '5') return 'May';
              if (this.value == '6') return 'Jun';
              if (this.value == '7') return 'Jul';
              if (this.value == '8') return 'Aug';
              if (this.value == '9') return 'Sep';
              if (this.value == '10') return 'Oct';
              if (this.value == '11') return 'Nov';
              if (this.value == '12') return 'Dec';
              return this.value; // clean, unformatted number for year
            }
          }
        },
        yAxis: {
          title: {
            text: 'Amount'
          },
          labels: {
            formatter: function () {
              return this.value + ' words';
            }
          }
        },
        tooltip: {
          pointFormat: '<br>Within {series.name} you produced <b>{point.y:,.0f} </b><br/>words until this month.' //{series.name} you produced <b>{point.y:,.0f}</b><br/>words in {point.x}'
        },
        plotOptions: {
          area: {
            pointStart: 1,
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{
          name: 'last year',
          data: [150, 360, 450, 640, 870, 930, 1100, 1210, 1350, 1500, 1630, 1750]
        }, {
          name: 'this year',
          data: [80, 114, 375]
        }]
      });

       $('#complexity').highcharts({
        title: {
            text: 'Monthly Average Complexity',
            x: -20 //center
        },
        subtitle: {
            text: 'diversity of words in relation to the amount of words',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Complexity'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ''
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'this year',
            data: [0.62, 0.49, 0.81, 0.72, 0.83, 0.58, 0.88, 0.62, 0.90, 0.44, 0.71, 0.81]
        }, {
            name: 'last year',
            data: [0.42, 0.69, 0.51, 0.72, 0.66, 0.72, 0.44, 0.81, 0.63, 0.69, 0.73, 0.69]
        }]
    });

    $('#tagpiealltime').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Used Tags (timeless)'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Tag',
            data: [
                ['NEWS',   25.0],
                ['MUSIC',       26.8],
                {
                    name: 'IT',
                    y: 32.8,
                    sliced: true,
                    selected: true
                },
                ['CODE',    11.5],
                ['TOOLS',     3.2],
                ['MISC',   0.7]
            ]
        }]
      });

      $('#currenttagpie').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Currently used Tags (this year)'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Tag',
            data: [
                ['NEWS',   45.0],
                ['MUSIC',       26.8],
                {
                    name: 'IT',
                    y: 12.8,
                    sliced: true,
                    selected: true
                },
                ['CODE',    8.5],
                ['TOOLS',     6.2],
                ['MISC',   0.7]
            ]
        }]
      });

      $('#correlation').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Amount of words written Versus Complexity'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Amount of words'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Complexity of words'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} words and a complexity of {point.y} kg'
                }
            }
        },
        series: [{
            name: 'Amount vs. complexity',
            color: 'rgba(223, 83, 83, .5)',
            data: [[201,0.44],[275,0.51],[499,0.65],[215,0.54],[561,0.7],[368,0.42],[554,0.74],[559,0.91],[268,0.57],
                   [588,0.85],[202,0.49],[566,0.67],[324,0.55],[527,0.73],[419,0.62],[548,0.79],[231,0.45],[457,0.56],
                   [267,0.77],[269,0.59],[447,0.56],[532,0.78],[227,0.5],[441,0.83],[339,0.78],[174,0.48],[246,0.58],
                   [497,0.8],[397,0.84],[249,0.68],[557,0.82],[183,0.91],[250,0.48],[296,0.81],[333,0.75],[441,0.65],
                   [514,0.91],[450,0.8],[192,0.49],[187,0.68],[220,0.59],[548,0.84],[221,0.4],[324,0.91],[404,0.76],
                   [385,0.61],[446,0.84],[277,0.76],[404,0.61],[552,0.81]]
        }]
      });

    } else {
      // User is not logged in, Cockpit is not being shown.
    }
  }
});

App.CockpitController = Ember.ArrayController.extend({
  needs: ['register']
});

