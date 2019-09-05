var csvData;
function wrappedBarChart(values, wrapThresh, threshPortion) {
  var pageWidth = document.querySelector("#main").offsetWidth;
  var margin = { top: 20, right: 50, bottom: 100, left: 50 },
    // width = pageWidth - margin.left - margin.right - 100,
    width = $("#chart").width() - margin.left - margin.right;
  height = $("#chart").height() - margin.top - margin.bottom;

  // Bar Chart Variables
  var strokeWidth = 5;
  var withSlider = false;
  var xGap = 50;
  // var threshPortion = 0.3;
  // var wrapThresh = 0;
  var index = indexNumber;

  var x = d3.scaleLinear().range([0, width - margin.right]);
  var y = d3.scaleLinear().range([height, 0]);
  var fileNames = [
    "PresidentialCandidates",
    "gunDeathsByState",
    "congressMisconduct"
  ];
  //    var index = 0;
  var fileName;
  var sortValue;
  var xValue;
  var yValue;
  var focus;
  var focusCat;
  var values = [];
  var labels = [];

  var prevTime = Date.now();
  //FOR Ad in Facebook


  var data;

  var xAxis;
  var yAxis;

  // The main SVG element
  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("clipPath") // define a clip path
    .attr("id", "rect-clip") // give the clipPath an ID
    .append("rect") // shape it as an ellipse
    .attr("width", width) // position the x-centre
    .attr("height", height); // position the y-centre

  d3.csv(fileName + ".csv").then(function(csvData) {
    console.log(csvData);
    csvData.sort(function(a, b) {
      if (a[sortValue] < b[sortValue]) {
        return -1;
      }
      if (a[sortValue] > b[sortValue]) {
        return 1;
      }
      return 0;
    });
    values = [];
    labels = [];
    csvData.forEach(function(d) {
      labels.push(d[xValue]);
      values.push(+d[yValue]);
    });

    var sum = 0;
    values.forEach(function(v) {
      sum += v;
    });
    var average = sum / values.length;
    console.log(average);
    var maxValue = d3.max(values);
    maxValue = maxValue + 0.01 * maxValue;
    var threshold = maxValue * threshPortion;
    if (threshPortion != 1) {
      threshold = d3.median(values);
      if (threshold < 100) {
        threshold = Math.round(threshold / 10) * 10;
      } else if (threshold < 1000) {
        threshold = Math.round(threshold / 100) * 100;
      } else {
        threshold = Math.round(threshold / 1000) * 1000;
      }
      console.log("threshold");
      console.log(threshold);
    }

    data = prepareData(values, threshold, wrapThresh);

    // Three scales for x, y, and help axis and one scale for color

    var help = d3
      .scaleLinear()
      .range([0, height * (1 - wrapThresh)])
      .domain([threshold, wrapThresh * threshold]);

    // D3 Line Function
    var valueline = d3
      .line()
      .x(function(d) {
        return x(d.X);
      })
      .y(function(d) {
        return y(d.Y);
      });

    x.domain([0, (data.level - 1) * xGap]);
    y.domain([0, threshold]);

    // bar charts
    var lines = svg
      .selectAll("path")
      .data(data.lines)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("stroke-width", strokeWidth)
      .attr("stroke", function(d, i) {
        //                console.log(color(values[i]));
        //                return color(values[i]);
        return "teal";
      })
      .attr("d", valueline)
      .on("mouseover", function(d) {
        d3.select(this).attr("stroke", "orange");
      })
      .on("mouseout", function(d) {
        d3.selectAll(".line").attr("stroke", function(d, i) {
          //                    return color(values[i]);
          return "teal";
        });
      })
      .attr("clip-path", "url(#rect-clip)");

    //y axis
    yAxis = svg
      .append("g")
      .call(d3.axisLeft(y).tickSize(-width))
      .style("font-size", "0.7m");

    yAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "grey");

    // x axis
    xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .tickValues(data.tickLevels)
          .tickFormat(function(d, i) {
            return labels[i];
          })
      )
      .style("font-size", "0.7em");

    xAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "grey");

    // rotate x axis
    xAxis
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    // helper axis to show wrapping area

    var helpAxis = svg
      .append("g")
      .attr("transform", "translate(" + width + ", 0 )")
      .call(d3.axisLeft(help).tickValues([wrapThresh * threshold, threshold]))
      .attr("display", "none");

    helpAxis.selectAll("text").attr("transform", "translate(40,0)");

    var helpTranslate = ((1 - wrapThresh) * height) / 2;

    var helpAxisRange = svg
      .append("text")
      .attr(
        "transform",
        "translate(" + (width + 10) + "," + helpTranslate + ")"
      )
      .text(parseInt(threshold - wrapThresh * threshold))
      .attr("display", "none");

    focus = svg
      .append("g")
      .attr("class", "focus")
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", height)
      .attr("y2", 0)
      .attr("stroke", "purple")
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", 0.0);
    //            .style("display", "none");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("stroke", 0)
      .on("click", function() {
        // console.log(current);
        d3.select("#" + current).property("value", focusCat);
        $("#" + current).val(focusCat);
      })
      .on("mouseover", function() {
        focus.attr("stroke-opacity", 0.5);
      })
      .on("mouseout", function() {
        focus.attr("stroke-opacity", 0.0);
        xAxis.selectAll("text").style("fill", "black");
      })
      .on("mousemove", mousemove);

    if (withSlider) {
      var sliderSimple = d3
        .sliderBottom()
        .min(0.01 * maxValue)
        .max(maxValue)
        .width(300)
        .tickFormat(d3.format("~s"))
        .step(1)
        .ticks(5)
        .default(threshold)
        .on("onchange", function(val) {
          threshold = val;
          data = prepareData(values, threshold, wrapThresh);
          y.domain([0, threshold]);
          x.domain([0, data.level * xGap]);
          help
            .range([0, height * (1 - wrapThresh)])
            .domain([threshold, wrapThresh * threshold]);

          var helpTranslate = ((1 - wrapThresh) * height) / 2;

          helpAxisRange
            .attr(
              "transform",
              "translate(" + (width + 10) + "," + helpTranslate + ")"
            )
            .text(parseInt(threshold - wrapThresh * threshold));

          yAxis.call(d3.axisLeft(y).tickSize(-width));

          xAxis.call(
            d3
              .axisBottom(x)
              .tickValues(data.tickLevels)
              .tickFormat(function(d, i) {
                return labels[i];
              })
          );

          xAxis
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

          helpAxis.call(
            d3.axisLeft(help).tickValues([wrapThresh * threshold, threshold])
          );
          helpAxis.selectAll("text").attr("transform", "translate(40,0)");

          // Add the Y Axis

          lines
            .data(data.lines)
            .attr("d", valueline)
            .attr("stroke-width", strokeWidth);
        });

      var sliderSimple2 = d3
        .sliderBottom()
        .min(0)
        .max(0.95)
        .width(300)
        .step(0.01)
        .tickFormat(d3.format(".2f"))
        .ticks(5)
        .default(wrapThresh)
        .on("onchange", function(val) {
          wrapThresh = val;
          data = prepareData(values, threshold, wrapThresh);
          y.domain([0, threshold]);
          x.domain([0, data.level * xGap]);
          xAxis.call(d3.axisBottom(x));
          xAxis
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

          help
            .range([0, height * (1 - wrapThresh)])
            .domain([threshold, wrapThresh * threshold]);

          var helpTranslate = ((1 - wrapThresh) * height) / 2;

          helpAxisRange
            .attr(
              "transform",
              "translate(" + (width + 10) + "," + helpTranslate + ")"
            )
            .text(parseInt(threshold - wrapThresh * threshold));

          helpAxis.call(
            d3.axisLeft(help).tickValues([wrapThresh * threshold, threshold])
          );
          helpAxis.selectAll("text").attr("transform", "translate(40,0)");

          // Add the Y Axis
          yAxis.call(d3.axisLeft(y).tickSize(-width));

          console.log(data);
          xAxis.call(
            d3
              .axisBottom(x)
              .tickValues(data.tickLevels)
              .tickFormat(function(d, i) {
                return labels[i];
              })
          );

          xAxis
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

          lines
            .data(data.lines)
            .attr("d", valueline)
            .attr("stroke-width", strokeWidth);
        });

      var gSimple = d3
        .select("#thresh")
        .append("svg")
        .attr("width", 500)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

      gSimple.call(sliderSimple);

      var gSimple2 = d3
        .select("#wrap")
        .append("svg")
        .attr("width", 500)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

      gSimple2.call(sliderSimple2);
    }
  });

  function mousemove(d) {
    var tickPos = data.tickLevels;
    var m = d3.mouse(this);
    // console.log(data);
    if (Date.now() - prevTime > 250) {
      user_data[index.toString()]["mousePositions"].push([current, m]);
      prevTime = Date.now();
    }

    var lowDiff = 1e99,
      xI = null;
    for (var i = 0; i < tickPos.length; i++) {
      var diff = Math.abs(m[0] - x(tickPos[i]));
      if (diff < lowDiff) {
        lowDiff = diff;
        xI = i;
      }
    }

    focus.attr("transform", "translate(" + x(tickPos[xI]) + "," + 0 + ")");

    focusCat = labels[xI];

    xAxis.selectAll("text").style("fill", function(d, i) {
      if (i === xI) {
        return "purple";
      } else {
        return "black";
      }
    });
  }

  // this function takes values in order, a maximum threshold to wrap around, and a portion threshold to continue wrapping
  // for example , if for a data point of 1500 if thresh is the maximum value for y axis will be 500 and the data will start to wrap at 500
  // wrapthresh defines at what portion of the y axis will the bars wrap, so if wrapthresh is 0.5, the data will wrap at the half point of y axis
  // in the above example, 1500 is the value, it wraps at 500, so 1000 is left, and it will wrap at 250, so it will wrap four times.

  // function prepareData(values, thresh, wrapThresh) {
  //   var level = 0.5;
  //   var levels = [];
  //   // var barCount = 0;
  //   var data = values.map(function(d, i) {
  //     if (d <= thresh) {
  //       var p = [{ Y: 0, X: level * xGap }, { Y: d, X: level * xGap }];
  //       levels.push(level * xGap);
  //       level += 1;
  //       // barCount += 1;
  //       return p;
  //     } else {
  //       var points = [];
  //       var numWrap = 1;
  //       if (wrapThresh !== 0 && wrapThresh !== 1) {
  //         numWrap = (d - thresh) / ((1 - wrapThresh) * thresh);
  //       } else {
  //         numWrap = d / thresh - 1;
  //       }
  //       // barCount += parseInt(numWrap);
  //       // barCount += 2;
  //       points.push({ Y: 0, X: level * xGap });
  //       levels.push(level * xGap);
  //       var l;
  //       for (l = 0; l < numWrap; l++) {
  //         if (l % 2 === 0) {
  //           points.push({ Y: thresh, X: level * xGap });
  //           //                        level += 0.3;
  //           level += 0.25;
  //
  //           points.push({ Y: thresh, X: level * xGap });
  //         } else {
  //           points.push({ Y: thresh * wrapThresh, X: level * xGap });
  //           //                        level += 0.3;
  //           level += 0.25;
  //           points.push({ Y: thresh * wrapThresh, X: level * xGap });
  //         }
  //       }
  //
  //       var portion = numWrap % 1;
  //       var prevY = points[points.length - 1].Y;
  //       console.log(numWrap);
  //       //                points.push({X:(portion/thresh)*thresh,Y:level*xGap});
  //       points.push({
  //         Y:
  //           parseInt(numWrap) % 2 === 0
  //             ? prevY - portion * (thresh * (1 - wrapThresh))
  //             : prevY + portion * (thresh * (1 - wrapThresh)),
  //         X: level * xGap
  //       });
  //       level += 1;
  //       return points;
  //     }
  //   });
  //
  //   //        console.log(width - level*xGap);
  //
  //   return { lines: data, level: level, tickLevels: levels };
  // }

    function prepareData(values, thresh, wrapThresh) {
        console.log(values);

        var level = 1;
        var levels = [];
        var wrapGap = 0.75;
        // var yAdjust = threshold - y.invert(strokeWidth*2);
        //ISAAC CAN YOU CHECK THIS PART?
        // var yAdjust = thresh - y.invert(strokeWidth) + 10;
        // var barCount = 0;
        var yAdjust = 0 ;
        var data = values.map(function(d, i) {
            if (d <= thresh) {
                var p = [{ Y: 0, X: level}, { Y: d, X: level}];
                levels.push(level);
                level += 1;
                // barCount += 1;
                return p;
            } else {
                var points = [];
                var numWrap = 1;
                if (wrapThresh !== 0 && wrapThresh !== 1) {
                    numWrap = (d - thresh) / ((1 - wrapThresh) * thresh);
                } else {
                    numWrap = d / thresh - 1;
                }
                var portion = numWrap % 1;
                // barCount += parseInt(numWrap);
                // barCount += 2;
                points.push({ Y: 0, X: level });
                levels.push(level);
                var l;
                for (l = 0; l <= numWrap; l++) {

                    if (l % 2 === 0) {
                        points.push({ Y: thresh, X: level });
                        level += wrapGap;
                        if (l<numWrap){
                            points.push({ Y: thresh, X: level});
                        } else {
                            if (portion > 0){
                                points.push({ Y: thresh, X: level});
                            }
                        }
                    } else {
                        points.push({ Y: thresh * wrapThresh, X: level});
                        level += wrapGap;
                        if (l<numWrap){
                            points.push({ Y: thresh * wrapThresh, X: level});
                        } else {
                            if (portion > 0){
                                points.push({ Y: thresh * wrapThresh, X: level});
                            }
                        }

                    }
                }

                if (portion > 0){
                    var prevY = points[points.length - 1].Y;

                    points.push({
                        Y:
                            parseInt(numWrap) % 2 === 0
                                ? prevY - portion * (thresh * (1 - wrapThresh))
                                : prevY + portion * (thresh * (1 - wrapThresh)),
                        X: level
                    });
                }
//                    console.log(portion);


                level += 1;
                return points;
            }
        });

        strokeGap = width/level;
        strokeWidth = strokeGap/2;
        xGap =  strokeGap/2;

        return {lines:data,level:level,tickLevels:levels};

    }
}
