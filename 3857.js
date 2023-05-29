// Wait for the page to load
document.addEventListener("DOMContentLoaded", function() {
  // Get the HTML elements
  var xInput = document.getElementById("x-input");
  var yInput = document.getElementById("y-input");
  var zInput = document.getElementById("z-input");
  var calcButton = document.getElementById("calc-button");
  var resultContainer = document.getElementById("result-container");

  // Function to calculate tile centres
  function getTileCentres(z, x, y) {
    var maxc = 20037508.342789244;
    var sidelength = 2 * maxc / Math.pow(2, z);

    var centerX = -maxc + maxc / Math.pow(2, z) + sidelength * x;
    var centerY = maxc - maxc / Math.pow(2, z) - sidelength * y;

    return [centerX, centerY];
  }

  // Function to round coordinates to the specified decimal places
  function roundCoordinates(coordinates, decimalPlaces) {
    var factor = Math.pow(10, decimalPlaces);
    return coordinates.map(function(coordinate) {
      return Math.floor(coordinate * factor) / factor;
    });
  }

  // Add event listener to the input fields for Enter key press
  xInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  yInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  zInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  // Add event listener to the calc button
  calcButton.addEventListener("click", function() {
    var z = parseFloat(zInput.value);
    var x = parseFloat(xInput.value);
    var y = parseFloat(yInput.value);

    if (isNaN(z) || isNaN(x) || isNaN(y)) {
      resultContainer.textContent = "Please enter valid numbers.";
    } else {
      var tileCentres3857 = getTileCentres(z, x, y);

      resultContainer.innerHTML = "<hr>"; // Add line break
      resultContainer.innerHTML += "Tile Centre Coordinates in EPSG:3857:<br>" + tileCentres3857.join(", ");
      resultContainer.innerHTML += "<br><hr>"; // Add line break

      // Define the Proj4js projections
      var proj3857 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
      var proj4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

      // Convert coordinates from EPSG:3857 to EPSG:4326
      var tileCentres4326 = proj4(proj3857, proj4326, tileCentres3857);

      // Round coordinates to the specified decimal places
      var roundedTileCentres4326 = roundCoordinates(tileCentres4326, 8);

      resultContainer.innerHTML += "Tile Centre Coordinates in EPSG:4326:<br>" + roundedTileCentres4326.join(", ");
      resultContainer.innerHTML += "<br>"; // Add line break
    }
  });
});
