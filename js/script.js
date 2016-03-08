var map;
  var baseAPI = 'https://timothymartin76.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM cmbd_crime_agg_merge WHERE cartodb_id = '

  var layerGroup = new L.LayerGroup();

  var TopComplaintsChartData = [];
  TopComplaintsChartData[0]={};


  var TopComplaintsChart;


  function init(){
    // initiate leaflet map
    map = new L.Map('map', { 
	zoomControl: true,
	title: true,
	fullscreen : true,
	ScrollWheelZoom: true,
	fullscreen : true,
      center: [40.694526,-73.936176], 
      zoom: 11,
    })
   var layer = L.tileLayer('',{
  attribution: ''




    }).addTo(map);
    var layerUrl = 'https://timothymartin76.cartodb.com/api/v2/viz/9aa4fc42-e546-11e5-bfa5-0e674067d321/viz.json';
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
        if (f.cmbd == null) {
          $('.noData').show();
          $('.mainSidebar').hide();
        } else { 
          $('.noData').hide();
          $('.mainSidebar').show();
        }


        $('.cmbd').text(function(){
          return "Community Board #:  " + f.cmbd;
        });
		
		$('.borough').text(function(){
          return "Borough:  " + f.borough;
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
              "value" : f.murder_non_negl_manslaughte
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


