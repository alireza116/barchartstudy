/**
 * @author: Raihan Nayeem
 * @overview :: utility functions for event listeners
 */

let mDataFileName = "";
let mData = null;
let mColumns = null;
let selected_categorical_col = null;
let selected_numerical_col = null;
let chartValues = null;
let chartLabels = null;
let wrappedBarChartArgs = {
    colorSchemeName: "Fixed",
    color: "#006bd6",
    sort: null,
    mThreshold: 1500,
    mWrapThresh: 0,
    onThresholdChange: function(thresh) {
        wrappedBarChartArgs.mThreshold = thresh;
    },
    onWrapThresholdChange: function(wrapThresh) {
        wrappedBarChartArgs.mWrapThresh = wrapThresh;
    },
};
let reader = new FileReader();

let refreshWrappedBarChart = function(colorSchemeName) {
    colorSchemeName = colorSchemeName || null;
    if (
        selected_numerical_col &&
        selected_categorical_col &&
        _.indexOf(mColumns, selected_numerical_col) !== -1 &&
        _.indexOf(mColumns, selected_numerical_col) !== -1 &&
        selected_numerical_col !== selected_categorical_col
    ) {
        chartValues = _.map(mData, selected_numerical_col);
        chartLabels = _.map(mData, selected_categorical_col);

        clearChartDiv();

        let minValue = _.min(
            chartValues.map(function(d) {
                return parseFloat(d);
            })
        );
        let maxValue = _.max(
            chartValues.map(function(d) {
                return parseFloat(d);
            })
        );

        wrappedBarChartArgs.mThresholdSliderMin = minValue;
        wrappedBarChartArgs.mThresholdSliderMax = maxValue;
        wrappedBarChartArgs.mThreshold = d3.quantile(chartValues, 1);
        wrappedBarChartArgs.mWrapThresh = 0;
        wrappedBarChartArgs.mThresholdSliderStep = ((maxValue - minValue) * 2) / 100;
        wrappedBarChartArgs.colorSchemeName = colorSchemeName;

        wrapBarChart(chartValues, chartLabels, wrappedBarChartArgs);
    }
};

let loadCSVFile = function() {
    let data = d3.csvParse(reader.result, function(d) {
        return d;
    });

    if (data && data.length > 0) {
        mData = data;
        let columns = Object.keys(data[0]);
        mColumns = columns;

        let categorical_col = document.getElementById("categorical-col");
        let numerical_col = document.getElementById("numerical-col");

        categorical_col.innerHTML = "";
        numerical_col.innerHTML = "";

        _.forEach(columns, function(column, index) {
            let categorical_option = document.createElement("option");
            let numerical_option = document.createElement("option");

            categorical_option.appendChild(document.createTextNode(column));
            numerical_option.appendChild(document.createTextNode(column));

            categorical_option.value = column;
            numerical_option.value = column;

            categorical_col.appendChild(categorical_option);
            numerical_col.appendChild(numerical_option);
        });

        categorical_col.dispatchEvent(new Event('change'));
        numerical_col.dispatchEvent(new Event('change'));
    }
};

let loadColorOptions = function () {
    let colorScheme = [
        { "name": "Fixed", "n": 0},
        { "name" : "schemeCategory10", "n" : 10},
        { "name" : "schemeAccent", "n": 8},
        { "name" : "schemeDark2", "n": 8},
        { "name" : "schemePastel2", "n": 8},
        { "name" : "schemeSet2", "n": 8},
        { "name" : "schemeSet1", "n": 9},
        { "name" : "schemePastel1", "n": 9},
        { "name" : "schemeSet3", "n" : 12 },
        { "name" : "schemePaired", "n": 12},
        { "name" : "schemeTableau10", "n" : 10 }
    ];

    let colorSchemeSelection = document.getElementById("color-scheme-selection");
    _.forEach(colorScheme, (item, index) => {
        let color_option = document.createElement("option");
        color_option.appendChild(document.createTextNode(item.name));
        color_option.value = item.name;
        colorSchemeSelection.appendChild(color_option);
    });

};

let switchToFixedBarChartColor = function() {
    let colorCode = document.getElementById("color-code");
    wrappedBarChartArgs.colorSchemeName = "Fixed";
    wrappedBarChartArgs.color = colorCode.value;
    clearChartDiv();
    wrapBarChart(chartValues, chartLabels, wrappedBarChartArgs);
};

let clearChartDiv = function() {
    document.getElementById("chart").innerHTML = "";
    document.getElementById("thresh").innerHTML =
        '<span class="badge badge-custom p-2">Bar Chart Threshold</span>';
    document.getElementById("wrap").innerHTML =
        '<span class="badge badge-custom p-2">Wrap Threshold</span>';
};

let getSaveFileName = function() {
    let currentTimeStamp = new Date().getTime();
    let fileName = "chart-";
    if (mDataFileName !== "") {
        let fileNameParts = mDataFileName.split('.');
        fileNameParts.pop(-1);
        fileName = fileNameParts.join("") + "-";
    }
    return fileName + currentTimeStamp;
};

let saveSvg = function(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    let svgData = svgEl.outerHTML;
    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
