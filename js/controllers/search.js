App.SearchRoute = Ember.Route.extend({
  model: function () {
    window.searchString = prompt("Please enter the string", "test");
    window.infoArray = new Array(0);

    return App.Post.store.filter('post', function(post) {
      var postArray = new Array(0);
      postArray.push(post.get('title'));
      postArray.push(post.get('excerpt'));
      postArray.push(post.get('body'));
      postArray.push(post.get('tags'));
      infoArray.push(postArray);

      if (!(post.get('title') === undefined)) {
        var tempTitle = post.get('title');
        var tempIndex = tempTitle.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('excerpt') === undefined)) {
        var tempExcerpt = post.get('excerpt');
        var tempIndex = tempExcerpt.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('body') === undefined)) {
        var tempBody = post.get('body');
        var tempIndex = tempBody.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('tags') === undefined)) {
        var tempTags = post.get('tags');
        var tempIndex = tempTags.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      return (false);
    });
  }
});

App.CockpitRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('diagrams', ['']);
  }
  
});

App.CockpitView = Ember.View.extend({
  didInsertElement: function() {
    
    /////////////////
    //bar chart
    /////////////////
    var lastChangeDate = new Date();

      $('#container').highcharts({
      
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
                text: 'Amount in 100'
            },
            labels: {
                formatter: function () {
                    return this.value + ' words';
                }
            }
        },
        tooltip: {
            pointFormat: '<br>Within {series.name} you produced <b>{point.y:,.0f} </b><br/>words until this month.'//{series.name} you produced <b>{point.y:,.0f}</b><br/>words in {point.x}'
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
            data: [5, 19, 33, 47, 110, 235, 369, 640, 100, 143, 206, 305]
        }, {
            name: 'this year',
            data: [1, 13, 44, 86, 135]//, 235, 369, 640, 100, 143, 206, 305]
        }]
    });

    /////////////////
    //first pie chart
    /////////////////
    var pieData = [
      {
        value: 300,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "IT"
      },
      {
        value: 50,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Music"
      },
      {
        value: 100,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Science"
      },
      {
        value: 40,
        color: "#949FB1",
        highlight: "#A8B3C5",
        label: "Economy"
      },
      {
        value: 120,
        color: "#4D5360",
        highlight: "#616774",
        label: "Misc"
      }
    ];

    var ctx = document.getElementById("chart-area").getContext("2d");
    window.myPie = new Chart(ctx).Pie(pieData);

    /////////////////
    //second pie chart
    /////////////////
    var pieData = [
        {
          value: 130,
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "IT"
        },
        {
          value: 90,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Music"
        },
        {
          value: 170,
          color: "#FDB45C",
          highlight: "#FFC870",
          label: "Science"
        },
        {
          value: 50,
          color: "#949FB1",
          highlight: "#A8B3C5",
          label: "Economy"
        },
        {
          value: 120,
          color: "#4D5360",
          highlight: "#616774",
          label: "Misc"
        }
      ];

      var ctx = document.getElementById("chart-area2").getContext("2d");
      window.myPie = new Chart(ctx).Pie(pieData);


      /////////////////
      //line chart
      /////////////////
      var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
      var lineChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            label: "My First dataset",
            fillColor : "rgba(220,220,220,0.2)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(220,220,220,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          },
          {
            label: "My Second dataset",
            fillColor : "rgba(151,187,205,0.2)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(151,187,205,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          }
        ]
      }
      var ctx = document.getElementById("canvas").getContext("2d");
      window.myLine = new Chart(ctx).Line(lineChartData, {
        responsive: true
      });

      /////////////////
      //bar chart
      /////////////////
      var randomScalingFactor = function(){ return Math.round(Math.random()*100)};

      var barChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          },
          {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,0.8)",
            highlightFill : "rgba(151,187,205,0.75)",
            highlightStroke : "rgba(151,187,205,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          }
        ]

      }

      var ctx = document.getElementById("canvas-bar").getContext("2d");
      window.myBar = new Chart(ctx).Bar(barChartData, {
        responsive : true
      });

  }
})

App.CockpitController = Ember.ArrayController.extend({
  actions: {
    loadPieData: function () {
      var pieData = [
        {
          value: 300,
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "IT"
        },
        {
          value: 50,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Music"
        },
        {
          value: 100,
          color: "#FDB45C",
          highlight: "#FFC870",
          label: "Science"
        },
        {
          value: 40,
          color: "#949FB1",
          highlight: "#A8B3C5",
          label: "Economy"
        },
        {
          value: 120,
          color: "#4D5360",
          highlight: "#616774",
          label: "Misc"
        }
      ];

      var ctx = document.getElementById("chart-area").getContext("2d");
      window.myPie = new Chart(ctx).Pie(pieData);


      this.transitionTo('cockpit');
      // TODO: Show notification about newly created user.
    },
    loadPieData2: function () {
      var pieData = [
        {
          value: 130,
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "IT"
        },
        {
          value: 90,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Music"
        },
        {
          value: 170,
          color: "#FDB45C",
          highlight: "#FFC870",
          label: "Science"
        },
        {
          value: 50,
          color: "#949FB1",
          highlight: "#A8B3C5",
          label: "Economy"
        },
        {
          value: 120,
          color: "#4D5360",
          highlight: "#616774",
          label: "Misc"
        }
      ];

      var ctx = document.getElementById("chart-area2").getContext("2d");
      window.myPie = new Chart(ctx).Pie(pieData);

      this.transitionTo('cockpit');
      // TODO: Show notification about newly created user.
    },
    loadLineData: function () {
      var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
      var lineChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            label: "My First dataset",
            fillColor : "rgba(220,220,220,0.2)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(220,220,220,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          },
          {
            label: "My Second dataset",
            fillColor : "rgba(151,187,205,0.2)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(151,187,205,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          }
        ]
      }
      var ctx = document.getElementById("canvas").getContext("2d");
      window.myLine = new Chart(ctx).Line(lineChartData, {
        responsive: true
      });

      this.transitionTo('cockpit');
      // TODO: Show notification about newly created user.
    },
    loadBarData: function () {
      var randomScalingFactor = function(){ return Math.round(Math.random()*100)};

      var barChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          },
          {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,0.8)",
            highlightFill : "rgba(151,187,205,0.75)",
            highlightStroke : "rgba(151,187,205,1)",
            data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          }
        ]

      }

      var ctx = document.getElementById("canvas-bar").getContext("2d");
      window.myBar = new Chart(ctx).Bar(barChartData, {
        responsive : true
      });
      this.transitionTo('cockpit');
    },
    loadNewDiagram: function ()  {

      var lastChangeDate = new Date();

      $('#container').highcharts({
      
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
                text: 'Amount in 100'
            },
            labels: {
                formatter: function () {
                    return this.value + 'words';
                }
            }
        },
        tooltip: {
            pointFormat: '<br>Within {series.name} you produced <b>{point.y:,.0f} </b><br/>words until this month.'//{series.name} you produced <b>{point.y:,.0f}</b><br/>words in {point.x}'
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
            data: [5, 19, 33, 47, 110, 235, 369, 640, 100, 143, 206, 305]
        }, {
            name: 'this year',
            data: [1, 13, 44, 86, 135]//, 235, 369, 640, 100, 143, 206, 305]
        }]
    });

      this.transitionTo('cockpit');
      // TODO: Show notification about newly created user.
    }

  }
});