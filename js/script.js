var map;
  var baseAPI = 'https://timothymartin76.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM precinct_data_merge WHERE cartodb_id = '

  var layerGroup = new L.LayerGroup();

  var TopComplaintsChartData = [];
  TopComplaintsChartData[0]={};


  var TopComplaintsChart;


  function init(){
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [40.7,-73.96],
      zoom: 11,
    })
   var layer = L.tileLayer('',{
  attribution: ''




    }).addTo(map);
    var layerUrl = 'https://timothymartin76.cartodb.com/api/v2/viz/cbe992de-b3f2-11e5-af8c-0ecd1babdde5/viz.json';
    var sublayers = [];




    var currentHover, newFeature = null;
    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        
        console.log("done");

        layer.getSubLayer(0).setInteraction(true);
        layer.on('featureOver', function(ev, pos, latlng, data){
          console.log("featureover");
          //check to see if it's the same feature so we don't waste an API call
          if(data.cartodb_id != currentHover) {
            layerGroup.clearLayers();
          
            $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
              newFeature = L.geoJson(res,{
                style: {
                  "color": "#DCFF2E",
                  "weight": 3,
                  "opacity": 1
                }
              });
              layerGroup.addLayer(newFeature);
              layerGroup.addTo(map);
              updateSidebar(res.features[0].properties);
              updateChart(res.features[0].properties)

            })
            currentHover = data.cartodb_id;
          }
        })
        .on('featureOut', function(){
          layerGroup.clearLayers();
        })

        // // change the query for the first layer
        // var subLayerOptions = {
        //   sql: "SELECT * FROM ne_10m_populated_places_simple",
        //   cartocss: "#ne_10m_populated_places_simple{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;}"
        // }
        // var sublayer = layer.getSubLayer(0);
        // sublayer.set(subLayerOptions);
        // sublayers.push(sublayer);


      })
      .on('error', function() {
        //log the error
      });
      }

      //from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
      // String.prototype.toProperCase = function () {
      //   return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      // };

      function updateSidebar(f) {

        //first check if there is data
        if (f.nypp_precinct == null) {
          $('.noData').show();
          $('.mainSidebar').hide();
        } else { 
          $('.noData').hide();
          $('.mainSidebar').show();
        }


        $('.nypp_precinct').text(function(){
          return "Precinct #:  " + f.nypp_precinct;
        });

       $('.total').text(function(){
          return "Total Major Felonies:  " + f.total;
        });




       
        TopComplaintsChartData[0].key = "test";
        TopComplaintsChartData[0].values = 
          [
            { 
              "label" : "Grand LMV" ,
              "value" : f.grand_larceny_of_motor_vehicle
            } , 
            { 
              "label" : "Grand Lar" , 
              "value" : f.grand_larceny
            } , 
            { 
              "label" : "Burglary" , 
              "value" : f.burglary
            } , 
            { 
              "label" : "Assault" , 
              "value" : f.felony_assault
            } ,
			 { 
              "label" : "Robbery" , 
              "value" : f.robbery
            } ,
			 { 
              "label" : "Rape" , 
              "value" : f.rape
            } ,
			 { 
              "label" : "Murder" , 
              "value" : f.murder
            } 
          ]
        
       

       d3.select('#TopComplaintsChart svg')
      .datum(TopComplaintsChartData)
      .transition().duration(300)
      .call(TopComplaintsChart);

    

      }

//chart stuff
nv.addGraph(function() {
  TopComplaintsChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(false)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      .valueFormat(d3.format(".0f"))
      .width(450)
	  .height(160)
      .showYAxis(false)
      .margin({left:9,right:200})
      .color(['#000000', '#004358', '#1F8A70', '#BEDB39', '#FFE11A', '#FD7400', '#ff0000'])
      ;

      TopComplaintsChart.xAxis
      .axisLabel('')

     

  // d3.select('#chart svg')
  //     .datum(exampleData)
  //     .transition().duration(500)
  //     .call(chart);

  nv.utils.windowResize( TopComplaintsChart.update);

  return TopComplaintsChart;
});


