// Initialize the map centered on New Delhi, India
const map = L.map('map').setView([28.6139, 77.2090], 10);

// Use OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Keep track of route line to remove previous ones
let currentRouteLine = null;

// Group to hold charging station markers
const stationGroup = L.layerGroup();

// Variables for new features
let stationsData = [];
let currentSourceCoords = [28.6139, 77.2090]; // default to Delhi
let nearestRouteLine = null;
const routeEndpointsGroup = L.layerGroup();

// Helper: Haversine distance formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

// Add crude CSS for the custom icon to the page
const style = document.createElement('style');
style.innerHTML = `
  .charging-station-icon {
    font-size: 24px;
    line-height: 24px;
    text-align: center;
    background: #1e1e1e;
    border-radius: 50%;
    border: 2px solid #00d2ff;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 10px #00d2ff;
  }
`;
document.head.appendChild(style);

// Fetch and display nearby charging stations
async function loadChargingStations() {
  try {
    const response = await fetch('/api/stations');
    const stations = await response.json();
    stationsData = stations; // Store for nearest station logic
    
    // Custom icon for charging stations
    const stationIcon = L.divIcon({
      html: '⚡',
      className: 'charging-station-icon',
      iconSize: [30, 30]
    });

    stations.forEach(station => {
      const marker = L.marker([station.lat, station.lng], { icon: stationIcon });
      marker.bindPopup(`<b>${station.name}</b><br>Status: ${station.available ? 'Available' : 'Occupied'}`);
      stationGroup.addLayer(marker);
    });
  } catch (err) {
    console.error("Error loading stations:", err);
  }
}

// Simple geocoding using Nominatim API to get coordinates from city names
async function getCoordinates(city) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

// Find Route Button Logic
document.getElementById('find-route-btn').addEventListener('click', async () => {
  const sourceCity = document.getElementById('source').value;
  const destCity = document.getElementById('destination').value;

  if (!sourceCity || !destCity) {
    alert("Please enter both source and destination");
    return;
  }

  // Get coordinates for map drawing
  const sourceCoords = await getCoordinates(sourceCity);
  const destCoords = await getCoordinates(destCity);
  
  if (sourceCoords) currentSourceCoords = sourceCoords;

  if (!sourceCoords || !destCoords) {
    alert("Could not find coordinates for one or both locations. Try cities like Delhi, Gurgaon, Noida.");
    return;
  }

  // Draw simple straight line route (in a real app, use a routing engine like OSRM)
  if (currentRouteLine) {
    map.removeLayer(currentRouteLine);
  }
  routeEndpointsGroup.clearLayers();

  // Show Source and Destination on map
  L.marker(sourceCoords).addTo(routeEndpointsGroup).bindTooltip(`<b>Start:</b> ${sourceCity}`, {permanent: true, direction: 'top'});
  L.marker(destCoords).addTo(routeEndpointsGroup).bindTooltip(`<b>End:</b> ${destCity}`, {permanent: true, direction: 'top'});
  routeEndpointsGroup.addTo(map);

  currentRouteLine = L.polyline([sourceCoords, destCoords], {
    color: '#00d2ff',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 10'
  }).addTo(map);

  // Fit map bounds to show the complete route
  map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });

  // Call our backend API for route data simulation
  try {
    const response = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourceCity, destination: destCity })
    });
    const routeData = await response.json();

    // Show route summary on UI
    document.getElementById('route-info').style.display = 'block';
    document.getElementById('distance-val').textContent = routeData.distanceKm;
    
    // Simulate battery usage (e.g. 1% per 5km)
    const usage = Math.ceil(routeData.distanceKm / 5);
    document.getElementById('usage-val').textContent = usage;

    // Smart Battery Prediction
    const currentBat = parseInt(slider.value);
    const predictionEl = document.getElementById('battery-prediction');
    if (predictionEl) {
      if (currentBat < usage) {
        predictionEl.textContent = "⚠️ Insufficient battery to reach destination!";
        predictionEl.style.color = "#ff4757";
      } else {
        const remaining = currentBat - usage;
        predictionEl.textContent = `✅ You will arrive with ~${remaining}% battery.`;
        predictionEl.style.color = "#2ed573";
      }
    }

  } catch (err) {
    console.error("Error calculating route:", err);
  }
});

// Battery simulation logic
const batteryLevelEl = document.getElementById('battery-level');
const batteryAlertEl = document.getElementById('battery-alert');
const batteryIndicator = document.getElementById('battery-indicator');
const slider = document.getElementById('battery-slider');
const sliderVal = document.getElementById('slider-val');

function updateBattery(value) {
  batteryLevelEl.textContent = `${value}%`;
  sliderVal.textContent = `${value}%`;
  
  if (value < 30) {
    batteryAlertEl.style.display = 'block';
    batteryIndicator.style.color = '#ff4757'; // Alert color
    
    // Show charging stations on the map
    if (!map.hasLayer(stationGroup)) {
      stationGroup.addTo(map);
    }

    // Find Nearest Charging Station
    if (stationsData.length > 0) {
      let nearest = null;
      let minDst = Infinity;
      stationsData.forEach(st => {
        const d = getDistanceFromLatLonInKm(currentSourceCoords[0], currentSourceCoords[1], st.lat, st.lng);
        if (d < minDst) { minDst = d; nearest = st; }
      });
      
      if (nearest) {
        const nearestInfoEl = document.getElementById('nearest-station-info');
        if (nearestInfoEl) nearestInfoEl.textContent = `📍 Nearest Station: ${nearest.name} (~${Math.round(minDst)} km away)`;
        
        // Setup Route to Nearest Button
        const routeNearestBtn = document.getElementById('route-to-nearest-btn');
        if (routeNearestBtn) {
          routeNearestBtn.style.display = 'inline-block';
          routeNearestBtn.onclick = () => {
            if (nearestRouteLine) map.removeLayer(nearestRouteLine);
            // CSS filter pre-preserves pure red (#ff0000) so it will render as a vibrant red on the map
            nearestRouteLine = L.polyline([currentSourceCoords, [nearest.lat, nearest.lng]], {
              color: '#ff0000', weight: 5, opacity: 0.9, dashArray: '5, 10'
            }).addTo(map);
            map.fitBounds(nearestRouteLine.getBounds(), { padding: [50, 50] });
          };
        }
      }
    }
  } else {
    batteryAlertEl.style.display = 'none';
    batteryIndicator.style.color = 'inherit'; // Reset
    
    // Hide charging stations
    if (map.hasLayer(stationGroup)) {
      map.removeLayer(stationGroup);
    }
    // Remove nearest route if exists
    if (nearestRouteLine) {
      map.removeLayer(nearestRouteLine);
      nearestRouteLine = null;
    }
  }
}

slider.addEventListener('input', (e) => {
  updateBattery(e.target.value);
});

// Initialize app elements
loadChargingStations();
updateBattery(70); // initial static value
