const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Dummy data for charging stations across India
const chargingStations = [
  // North
  { id: 1, name: "Delhi Supercharger", lat: 28.6139, lng: 77.2090, available: true },
  { id: 2, name: "Gurgaon Fast Charge", lat: 28.4595, lng: 77.0266, available: true },
  { id: 3, name: "Noida EV Point", lat: 28.5355, lng: 77.3910, available: true },
  { id: 4, name: "Faridabad Green Charge", lat: 28.4089, lng: 77.3178, available: false },
  { id: 5, name: "Chandigarh Power Station", lat: 30.7333, lng: 76.7794, available: true },
  { id: 6, name: "Jaipur Solar Charge", lat: 26.9124, lng: 75.7873, available: true },
  { id: 7, name: "Lucknow Quick Charge", lat: 26.8467, lng: 80.9462, available: false },
  // West
  { id: 8, name: "Mumbai Central EV Hub", lat: 19.0760, lng: 72.8777, available: true },
  { id: 9, name: "Pune Highway Station", lat: 18.5204, lng: 73.8567, available: true },
  { id: 10, name: "Ahmedabad Western Charge", lat: 23.0225, lng: 72.5714, available: true },
  { id: 11, name: "Surat Diamond Charge", lat: 21.1702, lng: 72.8311, available: true },
  { id: 12, name: "Goa Coastal EV Station", lat: 15.4909, lng: 73.8278, available: true },
  // South
  { id: 13, name: "Bangalore Tech Park Station", lat: 12.9716, lng: 77.5946, available: true },
  { id: 14, name: "Chennai Marina Charge", lat: 13.0827, lng: 80.2707, available: false },
  { id: 15, name: "Hyderabad Cyber Charge", lat: 17.3850, lng: 78.4867, available: true },
  { id: 16, name: "Kochi Marine EV Hub", lat: 9.9312, lng: 76.2673, available: true },
  // East & Central
  { id: 17, name: "Kolkata Eastern Hub", lat: 22.5726, lng: 88.3639, available: true },
  { id: 18, name: "Indore Central Charge", lat: 22.7196, lng: 75.8577, available: true }
];

// API endpoint to get charging stations
app.get('/api/stations', (req, res) => {
  res.json(chargingStations);
});

// API endpoint to simulate route data
app.post('/api/route', (req, res) => {
  const { source, destination } = req.body;
  // In a real application, you would use a proper routing engine (like OSRM or Google Maps).
  // Here we simulate the distance.
  const simulatedDistance = Math.floor(Math.random() * 50) + 10; // random distance 10-60 km
  
  res.json({
    message: "Route calculated successfully",
    source: source,
    destination: destination,
    distanceKm: simulatedDistance
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
