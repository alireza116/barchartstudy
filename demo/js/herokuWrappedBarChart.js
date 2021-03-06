function wrapBarChart(mValues, mLabels, args, mId) {
  args = args || {};
  mId = mId || { chart: "#chart", thresh: "#thresh", wrap: "#wrap" };
  let fixedColorSchemeName = "Fixed";
  // set width and height
  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(y).ticks(5);
  }

  let $chart = $("#chart");
  let w = $chart.width();
  let h = $chart.height();

  var margin = { top: 20, right: 50, bottom: 50, left: 100 },
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  // Bar Chart Variables
  let clip = true;
  let xGap = 30;
  let strokeWidth = 20;
  let threshold = args.mThreshold || 1500;
  let wrapThresh = args.mWrapThresh || 0;
  let strokeGap;

  let thresholdSliderStep = args.mThresholdSliderStep || 50;
  let thresholdSliderMin = args.mThresholdSliderMin || 500;
  let thresholdSliderMax = args.mThresholdSliderMax || 10000;
  let colorSchemeName = args.colorSchemeName? args.colorSchemeName: fixedColorSchemeName;
  let barColor = args.color || "#006bd6";

  let values = mValues || [
    192.07751450525203,
    4.656974057598913,
    648.195310212405,
    2423.5834066320112,
    1635.846243307583,
    1140.5834879434399,
    19.696138932320967,
    93.8646293671742,
    9000.772468159074,
    833.5474850417799,
    467.0090694806749,
    653.9721524068206,
    1717.9530355836052,
    108.99027491121407,
    98.24634822948074,
    198.6731114836186,
    117.67918707539728,
    1444.191579060921,
    388.25499376665834,
    1142.7793045830051,
    1161.505428985466,
    270.22947596325906,
    283.64164212886635,
    415.64029769628166,
    938.3887009444913
  ];
  let labels = mLabels || "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");

  if (args.sort) {
    /*
     * if sorting parameter passed in argument
     */
    let valueMap = {};
    values.forEach(function (value, index) {
      if (valueMap.hasOwnProperty(value))
        valueMap[value].push(labels[index]);
      else
        valueMap[value] = [labels[index]];
    });
    values = [...values];
    let sorted_values = values.sort(function (a, b) {
      if (args.sort === "asc")
        return a-b;
      else if (args.sort === "desc")
        return b-a;
      return null;
    });

    let sorted_labels = [];
    sorted_values.forEach(function (value) {
      sorted_labels.push(valueMap[value].pop());
    });
    values = sorted_values;
    labels = sorted_labels;
  }

  let y = d3.scaleLinear().range([height, 0]);
  y.domain([0, threshold]);

  let data = prepareData(values, threshold, wrapThresh);
  let help = d3
    .scaleLinear()
    .range([0, height * (1 - wrapThresh)])
    .domain([threshold, wrapThresh * threshold]);
  let x = d3.scaleLinear().range([0, data.level * (strokeWidth + xGap)]);
  let colorScale;

  if (colorSchemeName !== fixedColorSchemeName) {
    colorScale = d3.scaleOrdinal(d3[colorSchemeName]);
    colorScale.domain(labels);
  }

  // D3 Line Function
  let valueline = d3
    .line()
    .x(function(d) {
      return x(d.X);
    })
    .y(function(d) {
      return y(d.Y);
    });

  x.domain([0, data.level]);

  let svg = d3
    .select(mId.chart)
    .append("svg")
    .attr("id", "chart-svg") //.style("background-color","#efd8bf")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .attr("class", "grid")
    .call(
      make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    );

  svg
    .append("clipPath") // define a clip path
    .attr("id", "rect-clip") // give the clipPath an ID
    .append("rect") // shape it as an ellipse
    .attr("width", width) // position the x-centre
    .attr("height", height); // position the y-centre

  var lines = svg
    .selectAll(".lines")
    .data(data.lines)
    .enter()
    .append("path")
    .attr("class", "lines")
    .attr("stroke-width", strokeWidth)
    .attr("stroke", function(d, i) {
      if (colorSchemeName === 'Fixed')
        return barColor;
      return colorScale(values[i]);
    })
    .attr("d", valueline);

  if (clip) {
    lines.attr("clip-path", "url(#rect-clip)");
  }

  var yAxis = svg
    .append("g")
    .call(d3.axisLeft(y))
    .attr("class", "axis y chart_axis");

  // Add the Y Axis
  //    console.log(data.tickLevels);
  var xAxis = svg
    .append("g")
    .attr("class", "axis x chart_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .tickValues(data.tickLevels)
        .tickFormat(function(d, i) {
          return labels[i];
        })
    );

  // var helpAxis = svg.append("g")
  //         .attr("transform", "translate(" +  width+ ", 0 )")
  //     .call(
  //         d3.axisLeft(help).tickValues([wrapThresh*threshold,threshold])
  //     );

  var helpTranslate = ((1 - wrapThresh) * height) / 2;

  // var helpAxisRange = svg.append("text")
  //     .attr("transform","translate("+(width - 45)+"," + helpTranslate+")")
  //     .text(parseInt(threshold - (wrapThresh*threshold)));

  var sliderSimple = d3
    .sliderBottom()
    .min(thresholdSliderMin)
    .max(thresholdSliderMax)
    .width(250)
    .tickFormat(d3.format("~s"))
    .step(thresholdSliderStep)
    .ticks(5)
    .default(threshold)
    .on("onchange", function(val) {
      threshold = val;
      if (args.onThresholdChange) args.onThresholdChange(val);
      y.domain([0, threshold]);
      var data = prepareData(values, threshold, wrapThresh);
      //            strokeGap = width/data.level;
      //            strokeWidth = strokeGap/5*2;
      //            xGap =  strokeGap/5*3;

      x.range([0, data.level * (strokeWidth + xGap)]);

      x.domain([0, data.level]);
      help
        .range([0, height * (1 - wrapThresh)])
        .domain([threshold, wrapThresh * threshold]);

      var helpTranslate = ((1 - wrapThresh) * height) / 2;

      yAxis.call(d3.axisLeft(y));

      xAxis.call(
        d3
          .axisBottom(x)
          .tickValues(data.tickLevels)
          .tickFormat(function(d, i) {
            return labels[i];
          })
      );

      lines
        .data(data.lines)
        .attr("d", valueline)
        .attr("stroke-width", strokeWidth)
        .attr("stroke", (d, i) => {
          if (colorSchemeName === 'Fixed')
            return barColor;
          return colorScale(values[i]);
        });
    });

  var sliderSimple2 = d3
    .sliderBottom()
    .min(0)
    .max(0.95)
    .width(250)
    .step(0.05)
    .tickFormat(d3.format(".2f"))
    .ticks(5)
    .default(wrapThresh)
    .on("onchange", function(val) {
      wrapThresh = val;
      if (args.onWrapThresholdChange) args.onWrapThresholdChange(val);

      let data = prepareData(values, threshold, wrapThresh);
      //            strokeGap = width/data.level;
      //            strokeWidth = strokeGap/5*2;
      //            xGap =  strokeGap/5*3;

      x.range([0, data.level * (strokeWidth + xGap)]);
      y.domain([0, threshold]);
      x.domain([0, data.level]);
      xAxis.call(d3.axisBottom(x));

      help
        .range([0, height * (1 - wrapThresh)])
        .domain([threshold, wrapThresh * threshold]);

      var helpTranslate = ((1 - wrapThresh) * height) / 2;

      yAxis.call(d3.axisLeft(y));

      xAxis.call(
        d3
          .axisBottom(x)
          .tickValues(data.tickLevels)
          .tickFormat(function(d, i) {
            return labels[i];
          })
      );

      lines
        .data(data.lines)
        .attr("d", valueline)
        .attr("stroke-width", strokeWidth);
    });

  var gSimple = d3
    .select(mId.thresh)
    .append("svg")
    .attr("width", 300)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(15,30)");

  gSimple.call(sliderSimple);

  var gSimple2 = d3
    .select(mId.wrap)
    .append("svg")
    .attr("width", 300)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(15,30)");

  gSimple2.call(sliderSimple2);

  function prepareData(values, thresh, wrapThresh) {
    let level = 1;
    let levels = [];
    let wrapGap = 0.6;
    let inside = true;
    let levelStep = 2;
    let wrapGapAdjust = 0;
    // var yAdjust = threshold - y.invert(strokeWidth*2);
    //ISAAC CAN YOU CHECK THIS PART?

    // var barCount = 0;
    // var yAdjust = 0 ;
    var data = values.map(function(d, i) {
      if (d <= thresh) {
        var p = [{ Y: 0, X: level }, { Y: d, X: level }];
        levels.push(level);
        level += levelStep;
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
            if (l < numWrap) {
              points.push({ Y: thresh, X: level });
            } else {
              if (portion > 0) {
                points.push({ Y: thresh, X: level });
              }
            }
          } else {
            points.push({ Y: thresh * wrapThresh, X: level });
            level += wrapGap + wrapGapAdjust;
            if (l < numWrap) {
              points.push({ Y: thresh * wrapThresh, X: level });
            } else {
              if (portion > 0) {
                points.push({ Y: thresh * wrapThresh, X: level });
              }
            }
          }
        }

        if (portion > 0) {
          var prevY = points[points.length - 1].Y;

          points.push({
            Y:
              parseInt(numWrap) % 2 === 0
                ? prevY - portion * (thresh * (1 - wrapThresh))
                : prevY + portion * (thresh * (1 - wrapThresh)),
            X: level
          });
        }

        level += levelStep;
        return points;
      }
    });

    strokeGap = width / level;
    strokeWidth = strokeGap * 0.5;
    xGap = strokeGap * 0.5;
    var yAdjust = thresh - y.invert(strokeWidth / 2);

    // IF YOU WANT TO ADJUST UP SO IT CURVES inside of the chart. Change the + - in the below code. and uncomment the last part. The problem is we will lose accuracy when the
    // when the last wrap portion is smaller than the thickness of the bar.
    if (!inside) {
      yAdjust = -yAdjust;
    }
    data.forEach(function(line) {
      if (line.length > 2) {
        // console.log(line);
        line.forEach(function(point, i) {
          if (i > 0 && i < line.length - 1) {
            if (i % 4 === 1 || i % 4 === 2) {
              point.Y = point.Y - yAdjust;
            } else {
              point.Y = point.Y + yAdjust;
            }
          } else if (i === line.length - 1) {
            if (i % 2 === 1) {
              if (inside) {
                if (Math.abs(point.Y - line[i - 1].Y) < yAdjust * 2) {
                  if (point.Y < yAdjust * 2) {
                    point.Y = yAdjust * 2;
                  } else if (thresh - point.Y < yAdjust * 2) {
                    point.Y = thresh - yAdjust * 2;
                  }
                }
              }
            }
          }
        });
        // console.log(line);
      }
    });

    return { lines: data, level: level, tickLevels: levels };
  }
}
