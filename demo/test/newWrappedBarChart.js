function wrappedBarChart(values,threshold,wrapthreshold,id){
    var w = $("#"+id).width();
    var h = $("#"+id).height();
    console.log([w,h]);
    var margin = {top: 50, right: 50, bottom: 50, left: 100},
        // width = 1800 - margin.left - margin.right,
        // height = 600 - margin.top - margin.bottom;
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
// Bar Chart Variables
    var clip = false;
    var xGap = 20;
    var strokeWidth = 10;
    // var threshold = 1500;
    var wrapThresh = wrapthreshold;
    var strokeGap;

    // var values = [192.07751450525203, 4.656974057598913, 648.195310212405, 2423.5834066320112, 1635.846243307583, 1140.5834879434399, 19.696138932320967, 93.8646293671742, 9000.772468159074, 833.5474850417799, 467.0090694806749, 653.9721524068206, 1717.9530355836052, 108.99027491121407, 98.24634822948074, 198.6731114836186, 117.67918707539728, 1444.191579060921, 388.25499376665834, 1142.7793045830051, 1161.505428985466, 270.22947596325906, 283.64164212886635, 415.64029769628166, 938.3887009444913];
//    values = values.sort(function(a,b){
//        return b-a
//    });
//     var labels = ["a","b","c","d","E","f","GG","Hh", "asdoz","xcv"];
    var alphabet = "abcdefghijklmnopqrstuwxyz";
    console.log(values);
    var labels = values.map(function(v,i){
        return alphabet[i].toUpperCase();
    });

// Three scales for x, y, and help axis and one scale for color
//    var x = d3.scaleLinear().range([0, width]);

    var y = d3.scaleLinear().range([height, 0]);
    y.domain([0,threshold]);
// The main SVG element
// call Function to prepare data
    var data = prepareData(values,threshold,wrapThresh);


    var x = d3.scaleLinear().range([0,data.level * (strokeWidth + xGap)]);

// D3 Line Function
    var valueline = d3.line()
        .x(function(d) { return x(d.X); })
        .y(function(d) { return y(d.Y); });

    x.domain([0,data.level]);

    var svg = d3.select("#"+id).append("svg").style("background-color","#ffffff")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg
        .append("clipPath") // define a clip path
        .attr("id", "rect-clip") // give the clipPath an ID
        .append("rect") // shape it as an ellipse
        .attr("width", width) // position the x-centre
        .attr("height", height); // position the y-centre

    var yAxis = svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width).ticks(8)).attr("class","axis y");

    var lines = svg.append("g").selectAll("path").data(data.lines).enter().append("path")
        .attr("class", "line")
        .attr("stroke-width",strokeWidth+"px")
        .attr("stroke-opacity","1")
        .attr("stroke",function(d,i){
//            console.log(color(values[i]));
//            return color(values[i])
            return "#EC3C37";
        })
        .attr("d", valueline);

    if (clip){
        lines.attr("clip-path", "url(#rect-clip)")
    }



// Add the Y Axis
//    console.log(data.tickLevels);
    var xAxis = svg.append("g")
        .attr("class","axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(data.tickLevels).tickFormat(function(d,i){
                return labels[i];
            })
        );


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
        console.log(thresh);
        console.log(yAdjust);
        console.log(thresh - y.invert(strokeWidth));
        // IF YOU WANT TO ADJUST UP SO IT CURVES inside of the chart. Change the + - in the below code. and uncomment the last part. The problem is we will lose accuracy when the
        // when the last wrap portion is smaller than the thickness of the bar.
        if (!inside){
            yAdjust = -yAdjust;
        }
        data.forEach(function(line){
            if (line.length>2){
                console.log(line);
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
                console.log(line)
            }

        });

        return {lines:data,level:level,tickLevels:levels};

    }
}
