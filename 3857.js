// Wait for the page to load
document.addEventListener("DOMContentLoaded", function () {
  // Get the HTML elements
  var xInput = document.getElementById("x-input");
  var yInput = document.getElementById("y-input");
  var zInput = document.getElementById("z-input");
  var calcButton = document.getElementById("calc-button");
  var resultContainer = document.getElementById("result-container");

  zInput.value = new URLSearchParams(window.location.search).get("z") ?? 12;
  xInput.value = new URLSearchParams(window.location.search).get("x") ?? 2169;
  yInput.value = new URLSearchParams(window.location.search).get("y") ?? 1191;

  function getTileCentres(z, x, y) {
    var maxc = 20037508.342789244;
    var sidelength = (2 * maxc) / Math.pow(2, z);

    var centerX = -maxc + maxc / Math.pow(2, z) + sidelength * x;
    var centerY = maxc - maxc / Math.pow(2, z) - sidelength * y;

    return [centerX, centerY];
  }

  const maxc = 20037508.342789244;
  const sidelength = (z) => (2 * maxc) / 2 ** z;

  function getTileCorners(z, x, y) {
    var tc = getTileCentres(z, x, y);
    var s = sidelength(z);
    var corners = [];
    var cornerCoordinates = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
      [1, 1],
    ];

    for (var i = 0; i < cornerCoordinates.length; i++) {
      var each = cornerCoordinates[i];
      var v = [each[0] * 0.5 * s, each[1] * 0.5 * s];
      var corner = [tc[0] + v[0], tc[1] + v[1]];
      corners.push(roundCoordinates(corner, 8));
    }

    return corners;
  }

  function getSWNEcorners3857(z, x, y) {
    var tc = getTileCentres(z, x, y);
    var s = sidelength(z);
    var corners = [];
    var cornerCoordinates = [
      [1, -1],
      [-1, 1],
    ];

    for (var i = 0; i < cornerCoordinates.length; i++) {
      var each = cornerCoordinates[i];
      var v = [each[0] * 0.5 * s, each[1] * 0.5 * s];
      var corner = [tc[0] + v[0], tc[1] + v[1]];
      corners.push(roundCoordinates(corner, 8));
    }

    return corners;
  }

  // Function to round coordinates to the specified decimal places
  function roundCoordinates(coordinates, decimalPlaces) {
    var factor = Math.pow(10, decimalPlaces);
    return coordinates.map(function (coordinate) {
      return Math.floor(coordinate * factor) / factor;
    });
  }

  // Add event listener to the input fields for Enter key press
  xInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  yInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  zInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      calcButton.click(); // Simulate a click on the Calculate button
    }
  });

  function queryParamUpdate() {
    var z = parseFloat(zInput.value);
    var x = parseFloat(xInput.value);
    var y = parseFloat(yInput.value);

    window.location.search = "?z=" + z + "&x=" + x + "&y=" + y;
  }

  zInput.addEventListener("change", queryParamUpdate);
  xInput.addEventListener("change", queryParamUpdate);
  yInput.addEventListener("change", queryParamUpdate);

  // Add event listener to the calc button
  calcButton.addEventListener("click", function () {
    var z = parseFloat(zInput.value);
    var x = parseFloat(xInput.value);
    var y = parseFloat(yInput.value);

    if (isNaN(z) || isNaN(x) || isNaN(y)) {
      resultContainer.textContent = "Please enter valid numbers.";
    } else {
      var tileCentres3857 = getTileCentres(z, x, y);

      resultContainer.innerHTML = "<hr>"; // Add line break
      resultContainer.innerHTML +=
        "Tile Centre Coordinates in EPSG:3857:<br>" +
        tileCentres3857.join(", ");
      resultContainer.innerHTML += "<br><hr>"; // Add line break

      // Define the Proj4js projections
      var proj3857 =
        "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
      var proj4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

      // Convert coordinates from EPSG:3857 to EPSG:4326
      var tileCentres4326 = proj4(proj3857, proj4326, tileCentres3857);

      // Round coordinates to the specified decimal places
      var roundedTileCentres4326 = roundCoordinates(tileCentres4326, 8);

      resultContainer.innerHTML +=
        "Tile Centre Coordinates (Lat." +
        ", Lon.):<br>" +
        roundedTileCentres4326.reverse().join(", ");
      resultContainer.innerHTML += "<br><hr>"; // Add line break

      var tileCorners3857 = getTileCorners(z, x, y);

      resultContainer.innerHTML += "In EPSG:3857, XY:<br>";

      resultContainer.innerHTML += "NW corner: " + tileCorners3857[3];
      resultContainer.innerHTML += "<br>";
      resultContainer.innerHTML += "SW corner: " + tileCorners3857[2];
      resultContainer.innerHTML += "<br>";
      resultContainer.innerHTML += "SE corner: " + tileCorners3857[1];
      resultContainer.innerHTML += "<br>";
      resultContainer.innerHTML += "NE corner: " + tileCorners3857[0];
      resultContainer.innerHTML += "<br><hr>"; // Add line break

      resultContainer.innerHTML +=
        "Tile WKT in EPSG:3857:<br>" +
        "POLYGON ((" +
        tileCorners3857.join("; ").replaceAll(",", " ").replaceAll(";", ", ") +
        "))";
      resultContainer.innerHTML += "<br><hr>"; // Add line break

      var swneCorners3857 = getSWNEcorners3857(z, x, y);
      // swneCorners4326 = proj4(proj3857, proj4326, swneCorners3857);
      console.log(swneCorners3857);

      const swneCorners4326 = [];
      swneCorners3857.forEach((cp) => {
        swneCorners4326.push(proj4(proj3857, proj4326, cp).reverse());
      });

      const url =
        "https://lp-tools.toolforge.org/misc/bbox.html?sw=" +
        swneCorners4326.join("&ne=");

      const link = document.createElement("a");
      link.href =
        "https://lp-tools.toolforge.org/misc/bbox.html?sw=" +
        swneCorners4326.join("&ne=");
      link.textContent = url;
      resultContainer.appendChild(link);
    }
  });
});
