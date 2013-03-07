if (typeof app === 'undefined' || !app) {
  var app = {};
}

// Namespace for utility functions
app.util = {};

app.activeViol = 'perc_viol'; // Active section in radio button set
app.removedTracts = []; // Tracks that don't meet filter specified in app.util.Filter

app.util.Filter = function(data) {
  var filteredData = [];

  for(var i=0; i<data.length; i++) {
    if (data[i].income !== 0 && data[i].dist_opa > 100) {
      filteredData.push(data[i]);
    } else {
      app.removedTracts.push(data[i].name);
    }
  }

  return filteredData;
};

app.util.getHTML = function(props) {
  var med_inc = '$' + String(props.income).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    delinq =  (props.perc_inv * 100).toFixed(1) + '%',
    viol = (props[app.activeViol] * 100).toFixed(1) + '%';

    return "<strong>Tract " + props.name + "</strong>" +
           "<p>Median Income: " + med_inc + "</p>" +
           "<p>Properties with one or more violation(s) from August, 2011 to August, 2012: " + viol + "</p>" +
           "<p>Percent of properties that are investor-owned and tax delinquent: " + delinq + "</p>";
};

app.util.showTooltip = function(props, element) {
  if (app.tractClass === 'tract inactive') { return false; }

  var html = app.util.getHTML(props),
      offset = $(element).offset();

  $(".arrow_box").css({
    left: offset.left - 124 + element.r.baseVal.value,
    top: offset.top + 60
  }).show().find(".content").html(html);
};

app.util.hideTooltip = function() {
  $(".arrow_box").hide();
};

app.util.getProps = function(id) {
  for(var i=0; i<app.data.length; i++) {
    var dId = '#d' + String(app.data[i].name).replace(".","dot");
    if(dId === id) { return app.data[i]; }
  }
};

app.util.setActiveViol = function() {
  var $active = $(".violations-container :checked");

  app.activeViol = $($active[0]).val();
};

app.util.calcRadii = function(dot) {
  var percent = dot[app.activeViol];

  return Math.sqrt((percent / Math.PI) * 1500);
};

app.util.updateRadii = function() {
  app.util.setActiveViol();

  app.chart.selectAll("circle")
    .transition()
    .attr("r", function(d) {
      return app.util.calcRadii(d);
    });
};

app.util.getClass = function(value) {
  var colorClass = '';

  switch(true) {
    case (value === 0):
      colorClass = 'step-zero';
      break;
    case (value > 0) && (value < 0.10):
      colorClass = 'step-one';
      break;
    case (value >= 0.10) && (value < 0.20):
      colorClass = 'step-two';
      break;
    case (value >= 0.20) && (value < 0.30):
      colorClass = 'step-three';
      break;
    case (value >= 0.30):
      colorClass = 'step-four';
      break;
  }

  return colorClass;
};

app.legendItems = [
  {
    className: "step-zero",
    range: "N/A",
    x: 0
  },
  {
    className: "step-one",
    range: "0%",
    x: 30
  },
  {
    className: "step-two",
    range: "10%",
    x: 112
  },
  {
    className: "step-three",
    range: "20%",
    x: 178
  },
  {
    className: "step-four",
    range: "30%",
    x: 240
  }
];

app.run = function() {
  $(".violations-container :input").click(function(){
    app.util.updateRadii();
  });

  d3.json("data/tracts-data.json", function(error, data){
    app.data = data;
    app.fData = app.util.Filter(app.data);
    app.currentTractClass = '';
    app.currentDotClass = '';

    // Map
    app.map = {};

    app.map.path = d3.geo.path()
      .projection(d3.geo.mercator([-75.118,40.0020])
      .scale(438635)
      .translate([91727, 53480]));

    app.map.svg = d3.select("#map").append("svg")
      .attr("viewBox", "0 0 400 435")
      .attr("preserveAspectRatio", "xMidYMid")
      .attr("height", 435)
      .attr("width", 400)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("version", "1.1");

    d3.json("data/tracts-topo.json", function(error, topology){
      app.map.svg.selectAll("path")
          .data(topojson.object(topology, topology.objects.tracts).geometries)
        .enter().append("path")
          .attr("d", app.map.path)
          .attr("class", function(d) {
            var i;

            for(i=0; i<app.removedTracts.length; i++) {
              if (d.id === String(app.removedTracts[i])) {
                return 'tract inactive';
              }
            }

            for (i=0; i<app.fData.length; i++){
              if(d.id == (String(app.fData[i].name))) {
                return 'tract ' + app.util.getClass(app.fData[i].perc_inv);
              }
            }
          })
          .attr("id", function(d) {
            return 't' + String(d.id).replace('.','dot');
          })
          .on("mouseover", function(d) {
            if (d3.select(this).attr("class") === "tract inactive") { return false; }

            app.currentTractClass = d3.select(this).attr("class");
            d3.select(this).attr("class", "tract selected");

            var id = '#d' + String(d.id).replace('.','dot');
            app.currentDotClass = d3.select(id).attr("class");
            var dot = d3.select(id).attr("class", "dot selected");

            app.util.showTooltip(app.util.getProps(id), dot[0][0]);
          })
          .on("mouseout", function(d) {
            if (d3.select(this).attr("class") === "tract inactive") { return false; }

            d3.select(this).attr("class", app.currentTractClass);
            d3.select('#d' + String(d.id).replace('.','dot'))
              .attr("class", app.currentDotClass);
            app.util.hideTooltip();
          });
    });

    // Chart
    app.config = {};
    app.config.margin = {top: 60, right: 40, bottom: 60, left: 40};
    app.config.width = 730 - app.config.margin.left - app.config.margin.right;
    app.config.height = 530 - app.config.margin.top - app.config.margin.bottom;

    app.config.x = d3.scale.linear()
      .domain([0, 130000])
      .range([0, app.config.width]);

    app.config.y = d3.scale.linear()
      .domain([0, 0.40])
      .range([app.config.height, 0]);

    app.config.xAxis = d3.svg.axis()
      .scale(app.config.x)
      .ticks(6)
      .tickFormat(d3.format(",.0f"))
      .orient("bottom");

    app.config.yAxis = d3.svg.axis()
      .scale(app.config.y)
      .ticks(5)
      .tickFormat(d3.format("%"))
      .orient("left");

    app.chart = d3.select(".chart").append("svg")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("version", "1.1")
      .attr("width", app.config.width + app.config.margin.left + app.config.margin.right)
      .attr("height", app.config.height + app.config.margin.top + app.config.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + app.config.margin.left + "," + app.config.margin.top + ")");

    app.chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + app.config.height + ")")
      .call(app.config.xAxis);

    app.chart.append("g")
      .attr("class", "y axis")
      .call(app.config.yAxis);

    // Annotate the chart
    app.chart.append("text")
      .attr("class", "label")
      .text("Median Income ($)")
      .attr("x", 10)
      .attr("y", 445);

    app.chart.append("text")
      .attr("class", "label")
      .text("Percent of Properties")
      .attr("x", -40)
      .attr("y", -50);

    app.chart.append("text")
      .attr("class", "label")
      .text("that are Investor-owned")
      .attr("x", -40)
      .attr("y", -35);

    app.chart.append("text")
      .attr("class", "label")
      .text("and Tax Delinquent")
      .attr("x", -40)
      .attr("y", -20);

    app.chart.append("text")
      .attr("class", "note")
      .text("Each circle represents a census tract.")
      .attr("x", 395)
      .attr("y", 230);

    app.chart.append("text")
      .attr("class", "note")
      .text("The larger the circle, the higher the percent of")
      .attr("x", 395)
      .attr("y", 255);

    app.chart.append("text")
      .attr("class", "note")
      .text("properties in that tract that have received one or")
      .attr("x", 395)
      .attr("y", 270);

    app.chart.append("text")
      .attr("class", "note")
      .text("more of the selected violation(s).")
      .attr("x", 395)
      .attr("y", 285);

    app.chart.append("text")
      .attr("class", "note")
      .text("The darker the circle, the higher ")
      .attr("x", 395)
      .attr("y", 310);

    app.chart.append("text")
      .attr("class", "note")
      .text("investor-owned delinquent properties.")
      .attr("x", 395)
      .attr("y", 325);

    app.chart.append("text")
      .attr("class", "note")
      .text("Tracts with less than 100 properties, ")
      .attr("x", 395)
      .attr("y", 350);

    app.chart.append("text")
      .attr("class", "note")
      .text("or with $0 in median income have been excluded.")
      .attr("x", 395)
      .attr("y", 365);

    // Add the data to the chart.
    app.chart.selectAll(".dot")
      .data(app.fData)
      .enter()
      .append("circle")
      .attr("class", function(d){
        return "dot " + app.util.getClass(d.perc_inv);
      })
      .attr("id", function(d) {
        return 'd' + String(d.name).replace(".", "dot");
      })
      .attr("cx", function(d) { return app.config.x(d.income); })
      .attr("cy", function(d) { return app.config.y(d.perc_inv); })
      .attr("r", function(d) {
          return Math.sqrt((d.perc_viol / Math.PI) * 1500);
      })
      .on("mouseover", function(d) {
        app.currentDotClass = d3.select(this).attr("class");
        d3.select(this).attr("class", "dot selected");

        app.currentTractClass = d3.select('#t' + String(d.name).replace(".", "dot")).attr("class");
        d3.select('#t' + String(d.name).replace(".", "dot")).attr("class", "tract selected");
        app.util.showTooltip(d, this);
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("class", app.currentDotClass);
        d3.select('#t' + String(d.name).replace(".", "dot")).attr("class", app.currentTractClass);
        app.util.hideTooltip();
      });
  });
};