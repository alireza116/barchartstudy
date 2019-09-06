var focusCat;
var focusIndex;
var lines;
var labels;
function wrappedBarChart(values,threshold) {
    console.log(values);
    var pageWidth = document.querySelector("#main").offsetWidth;
    var margin = { top: 20, right: 50, bottom: 40, left: 100 },
    width = $("#chart").width() - margin.left - margin.right,
    height = $("#chart").height() - margin.top - margin.bottom;


    // Bar Chart Variables
    var strokeWidth = 5;
    var withSlider = false;
    var xGap = 50;

    var wrapThresh = 0;
    var strokeGap;
    var y = d3.scaleLinear().range([height, 0]);
    y.domain([0,threshold]);
// The main SVG element
// call Function to prepare data
    var data = prepareData(values,threshold,wrapThresh);


    var x = d3.scaleLinear().range([0,data.level * (strokeWidth + xGap)]);
    x.domain([0,data.level]);
    y.domain([0, threshold]);
    //    var index = 0;
    var fileName;
    var sortValue;
    var xValue;
    var yValue;
    var focus;
    // var focusCat;
    // var focusIndex;
    var alphabet = "abcdefghijklmnopqrstuwxyz";
    // console.log(values);
    labels = values.map(function(v,i){
        return alphabet[i].toUpperCase();
    });

    var prevTime = Date.now();
    //FOR Ad in Facebook


    var data;

    var xAxis;
    var yAxis;

    // The main SVG element
    var svg = d3
        .select("#chart")
        .append("svg").style("background-color","#efd8bf")
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

        // var threshold = math.quantileSeq(values,0.75);
        threshold = Math.round(threshold/100)*100;

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

        // x.domain([0, (data.level - 1) * xGap]);

    yAxis = svg
        .append("g")
        .call(d3.axisLeft(y).tickSize(-width))
        .attr("class", "axis");
        // bar charts
        lines = svg.append("g")
            .selectAll("path")
            .data(data.lines)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("stroke-width", strokeWidth)
            .attr("stroke", function(d, i) {
                //                console.log(color(values[i]));
                //                return color(values[i]);
                return "#E42644";
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
            .style("font-size", "1em");

        xAxis
            .selectAll(".tick")
            .select("line")
            .attr("stroke", "grey");

        // rotate x axis
        xAxis
            .selectAll("text")
            // .style("text-anchor", "end")
            // .attr("dx", "-.8em")
            // .attr("dy", ".15em")
            .attr("font-size","1.2em");
            // .attr("transform", "rotate(-65)");

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
            .attr("stroke", "teal")
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
                choiceIndex = focusIndex;
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


    function mousemove(d) {
        var tickPos = data.tickLevels;
        var m = d3.mouse(this);
        // console.log(data);
        if (Date.now() - prevTime > 250) {
            // user_data[index.toString()]["mousePositions"].push([current, m]);
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
        focusIndex = xI;

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
    function prepareData(values, thresh, wrapThresh) {

        var level = 1;
        var levels = [];
        var wrapGap = 0.75;
        var inside = true;
        // var yAdjust = threshold - y.invert(strokeWidth*2);
        //ISAAC CAN YOU CHECK THIS PART?

        // var barCount = 0;
        // var yAdjust = 0 ;
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
        var yAdjust = thresh - y.invert(strokeWidth/2);
        // console.log(thresh);
        // console.log(yAdjust);
        // console.log(thresh - y.invert(strokeWidth));
        // IF YOU WANT TO ADJUST UP SO IT CURVES inside of the chart. Change the + - in the below code. and uncomment the last part. The problem is we will lose accuracy when the
        // when the last wrap portion is smaller than the thickness of the bar.
        if (!inside){
            yAdjust = -yAdjust;
        }
        data.forEach(function(line){
            if (line.length>2){
                // console.log(line);
                line.forEach(function(point,i){
                    if (i > 0 && i < line.length-1){
                        if (i%4 ===1 || i%4 ===2){
                            point.Y = point.Y - yAdjust;
                        } else {
                            point.Y = point.Y + yAdjust;
                        }
                    } else if (i === line.length-1){
                        if (i%2 === 1){
                            if (inside){
                                if (Math.abs(point.Y - line[i-1].Y)<yAdjust*2){
                                    if (point.Y < yAdjust*2) {
                                        point.Y = yAdjust*2;
                                    } else if (thresh - point.Y < yAdjust*2) {
                                        point.Y = thresh - yAdjust * 2;
                                    }
                                }
                            }

                        }

                    }

                });
                // console.log(line)
            }

        });

        return {lines:data,level:level,tickLevels:levels};

    }

//     function prepareData(values, thresh, wrapThresh) {
//
//         var level = 1;
//         var levels = [];
//         var wrapGap = 0.75;
//         // var yAdjust = threshold - y.invert(strokeWidth*2);
//         //ISAAC CAN YOU CHECK THIS PART?
//
//         // var barCount = 0;
//         // var yAdjust = 0 ;
//         var data = values.map(function(d, i) {
//             if (d <= thresh) {
//                 var p = [{ Y: 0, X: level}, { Y: d, X: level}];
//                 levels.push(level);
//                 level += 1;
//                 // barCount += 1;
//                 return p;
//             } else {
//                 var points = [];
//                 var numWrap = 1;
//                 if (wrapThresh !== 0 && wrapThresh !== 1) {
//                     numWrap = (d - thresh) / ((1 - wrapThresh) * thresh);
//                 } else {
//                     numWrap = d / thresh - 1;
//                 }
//                 var portion = numWrap % 1;
//                 // barCount += parseInt(numWrap);
//                 // barCount += 2;
//                 points.push({ Y: 0, X: level });
//                 levels.push(level);
//                 var l;
//                 for (l = 0; l <= numWrap; l++) {
//
//                     if (l % 2 === 0) {
//                         points.push({ Y: thresh, X: level });
//                         level += wrapGap;
//                         if (l<numWrap){
//                             points.push({ Y: thresh, X: level});
//                         } else {
//                             if (portion > 0){
//                                 points.push({ Y: thresh, X: level});
//                             }
//                         }
//                     } else {
//                         points.push({ Y: thresh * wrapThresh, X: level});
//                         level += wrapGap;
//                         if (l<numWrap){
//                             points.push({ Y: thresh * wrapThresh, X: level});
//                         } else {
//                             if (portion > 0){
//                                 points.push({ Y: thresh * wrapThresh, X: level});
//                             }
//                         }
//
//                     }
//                 }
//
//                 if (portion > 0){
//                     var prevY = points[points.length - 1].Y;
//
//                     points.push({
//                         Y:
//                             parseInt(numWrap) % 2 === 0
//                                 ? prevY - portion * (thresh * (1 - wrapThresh))
//                                 : prevY + portion * (thresh * (1 - wrapThresh)),
//                         X: level
//                     });
//                 }
// //                    console.log(portion);
//
//
//                 level += 1;
//                 return points;
//             }
//         });
//
//         strokeGap = width/level;
//         strokeWidth = strokeGap/2;
//         xGap =  strokeGap/2;
//         var yAdjust = thresh - y.invert(strokeWidth/2);
//         console.log(thresh);
//         console.log(yAdjust);
//         console.log(thresh - y.invert(strokeWidth));
//         data.forEach(function(line){
//             if (line.length>2){
//                 console.log(line);
//                 line.forEach(function(point,i){
//                     if (i > 0 && i < line.length-1){
//                         if (i%4 ===1 || i%4 ===2){
//                             point.Y = point.Y - yAdjust;
//                         } else {
//                             point.Y = point.Y + yAdjust;
//                         }
//                     } else if (i === line.length-1){
//                         if (point.Y < yAdjust*2) {
//                             point.Y = yAdjust*2;
//                         } else if (thresh - point.Y < yAdjust*2) {
//                             point.Y = thresh - yAdjust * 2;
//                         }
//                     }
//
//                 });
//                 console.log(line)
//             }
//
//         });
//
//         return {lines:data,level:level,tickLevels:levels};
//
//     }
}
