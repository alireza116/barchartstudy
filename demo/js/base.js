function init() {
  wrapBarChart();
  let mData = null;
  let mColumns = null;
  let selected_categorical_col = null;
  let selected_numerical_col = null;
  let reader = new FileReader();

  let refreshWrappedBarChart = function() {
    if (
      selected_numerical_col &&
      selected_numerical_col &&
      _.indexOf(mColumns, selected_numerical_col) !== -1 &&
      _.indexOf(mColumns, selected_numerical_col) !== -1
    ) {
      let values = _.map(mData, selected_numerical_col);
      let labels = _.map(mData, selected_categorical_col);

      clearChartDiv();

      let minValue = _.min(
        values.map(function(d) {
          return parseFloat(d);
        })
      );
      let maxValue = _.max(
        values.map(function(d) {
          return parseFloat(d);
        })
      );
      let wrapBarChartArgs = {
        mThresholdSliderMin: minValue,
        mThresholdSliderMax: maxValue,
        mThreshold: d3.quantile(values, 1),
        mThresholdSliderStep: ((maxValue - minValue) * 2) / 100
      };
      wrapBarChart(values, labels, wrapBarChartArgs);
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
    }
  };

  document.getElementById("files").addEventListener(
    "change",
    function(e) {
      let file = document.querySelector("input[id=files]").files[0];
      reader.addEventListener("load", loadCSVFile, false);
      if (file) {
        reader.readAsText(file);
        document.getElementById("file-name-label").innerHTML = file.name;
      }
    },
    false
  );

  let categorical_col_selector = document.getElementById("categorical-col");
  categorical_col_selector.addEventListener("change", function(e) {
    selected_categorical_col = categorical_col_selector.value;
    refreshWrappedBarChart();
  });

  let numerical_col_selector = document.getElementById("numerical-col");
  numerical_col_selector.addEventListener("change", function(e) {
    selected_numerical_col = numerical_col_selector.value;
    refreshWrappedBarChart();
  });

  let clearChartDiv = function() {
    document.getElementById("chart").innerHTML = "";
    document.getElementById("thresh").innerHTML =
      '<span class="badge badge-custom p-2">Bar Chart Threshold</span>';
    document.getElementById("wrap").innerHTML =
      '<span class="badge badge-custom p-2">Wrap Threshold</span>';
  };

  document.getElementById("save").addEventListener("click", function(e) {
    e.preventDefault();
    saveSvgAsPng(document.querySelector("#chart-svg"), "chart.png");
  });
}
