/**
 * @author: Raihan Nayeem
 * @overview: Event listeners for control panel
 */
function initListeners() {

    let filesElement = document.getElementById("files");
    filesElement.addEventListener(
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

    let categoricalCol = document.getElementById("categorical-col");
    categoricalCol.addEventListener("change", function(e) {
        selected_categorical_col = categoricalCol.value;
        refreshWrappedBarChart();
    });

    let numericalCol = document.getElementById("numerical-col");
    numericalCol.addEventListener("change", function(e) {
        selected_numerical_col = numericalCol.value;
        refreshWrappedBarChart();
    });

    let colorSchemeSelection = document.getElementById("color-scheme-selection");
    let colorCodeSection = document.getElementById("color-code-section");
    let colorCode = document.getElementById("color-code");

    colorSchemeSelection.addEventListener("change", function (e) {
        wrappedBarChartArgs.colorSchemeName = colorSchemeSelection.value;

        if (wrappedBarChartArgs.colorSchemeName === "Fixed") {
            colorCodeSection.style.display = "";
            switchToFixedBarChartColor();
        }
        else {
            colorCodeSection.style.display = "none";
            clearChartDiv();
            wrapBarChart(chartValues, chartLabels, wrappedBarChartArgs);
        }
    });

    colorCode.addEventListener("change", function (e) {
        switchToFixedBarChartColor();
    });

    let saveButton = document.getElementById("save");
    saveButton.addEventListener("click", function(e) {
        e.preventDefault();
        saveSvgAsPng(document.querySelector("#chart-svg"), "chart.png");
    });
}