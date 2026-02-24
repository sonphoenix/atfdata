import * as THREE from "three";
import { useRef, useMemo, useEffect, useState } from "react";
import { useLoader, useFrame } from '@react-three/fiber';

export const AnimatedEarthScene = () => {
  const globeRef = useRef();
  const atmosphereRef = useRef();
  const [texturePath, setTexturePath] = useState("/textures/world_day.jpg");
  const [isDay, setIsDay] = useState(true); // Track day/night state
  
  // SIMPLE DAY/NIGHT TEXTURE SWITCHING BASED ON LOCAL TIME
  useEffect(() => {
    const hour = new Date().getHours();
    // Simple: If it's between 6 AM and 6 PM (adjust as needed)
    const dayTime = hour >= 6 && hour < 18;
    setIsDay(dayTime);
    setTexturePath(dayTime ? "/textures/world_day.jpg" : "/textures/world_night.jpg");
    
    // Optional: Log for debugging
    console.log(`Local hour: ${hour}, isDay: ${dayTime}, texture: ${dayTime ? 'day' : 'night'}`);
  }, []);
  
  const earthTexture = useLoader(THREE.TextureLoader, texturePath);
  
  useEffect(() => {
    if (earthTexture) {
      earthTexture.anisotropy = 16;
    }
  }, [earthTexture]);

  // Convert lat/lon to 3D coordinates
  const latLonToVector3 = (lat, lon, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // REDUCED: Strategic city network with FIXED indices
  const { cityConnections, cityPositions } = useMemo(() => {
    const cities = [
      // NORTH AMERICA - Major hubs only (5 cities) - indices 0-4
      { lat: 40.7128, lon: -74.0060, name: "New York", region: "north_america", isHub: true },
      { lat: 37.7749, lon: -122.4194, name: "San Francisco", region: "north_america", isHub: true },
      { lat: 34.0522, lon: -118.2437, name: "Los Angeles", region: "north_america", isHub: false },
      { lat: 43.6532, lon: -79.3832, name: "Toronto", region: "north_america", isHub: false },
      { lat: 19.4326, lon: -99.1332, name: "Mexico City", region: "north_america", isHub: false },
      
      // SOUTH AMERICA - Major hubs only (3 cities) - indices 5-7
      { lat: -23.5505, lon: -46.6333, name: "São Paulo", region: "south_america", isHub: true },
      { lat: -34.6037, lon: -58.3816, name: "Buenos Aires", region: "south_america", isHub: false },
      { lat: -12.0464, lon: -77.0428, name: "Lima", region: "south_america", isHub: false },
      
      // EUROPE - Major hubs only (5 cities) - indices 8-12
      { lat: 51.5074, lon: -0.1278, name: "London", region: "europe", isHub: true },
      { lat: 48.8566, lon: 2.3522, name: "Paris", region: "europe", isHub: true },
      { lat: 55.7558, lon: 37.6173, name: "Moscow", region: "europe", isHub: true },
      { lat: 52.5200, lon: 13.4050, name: "Berlin", region: "europe", isHub: false },
      { lat: 41.9028, lon: 12.4964, name: "Rome", region: "europe", isHub: false },
      
      // AFRICA - Major hubs only (4 cities) - indices 13-16
      { lat: -1.2921, lon: 36.8219, name: "Nairobi", region: "africa", isHub: true },
      { lat: 30.0444, lon: 31.2357, name: "Cairo", region: "africa", isHub: true },
      { lat: -33.9361, lon: 18.4365, name: "Cape Town", region: "africa", isHub: false },
      { lat: 6.5244, lon: 3.3792, name: "Lagos", region: "africa", isHub: false },
      
      // ASIA - Major hubs only (8 cities) - indices 17-24
      { lat: 35.6762, lon: 139.6503, name: "Tokyo", region: "asia", isHub: true },
      { lat: 1.3521, lon: 103.8198, name: "Singapore", region: "asia", isHub: true },
      { lat: 22.3193, lon: 114.1694, name: "Hong Kong", region: "asia", isHub: true },
      { lat: 28.6139, lon: 77.2090, name: "Delhi", region: "asia", isHub: true },
      { lat: 39.9042, lon: 116.4074, name: "Beijing", region: "asia", isHub: false },
      { lat: 31.2304, lon: 121.4737, name: "Shanghai", region: "asia", isHub: false },
      { lat: 37.5665, lon: 126.9780, name: "Seoul", region: "asia", isHub: false },
      { lat: 25.2048, lon: 55.2708, name: "Dubai", region: "asia", isHub: true },
      
      // OCEANIA - Major hubs only (3 cities) - indices 25-27
      { lat: -33.8688, lon: 151.2093, name: "Sydney", region: "oceania", isHub: true },
      { lat: -36.8485, lon: 174.7633, name: "Auckland", region: "oceania", isHub: false },
      { lat: -37.8136, lon: 144.9631, name: "Melbourne", region: "oceania", isHub: false }
    ];

    // Create routes - STRATEGIC APPROACH with fewer connections
    const routes = [];

    // 1. Intra-regional connections
    const regions = ["north_america", "south_america", "europe", "africa", "asia", "oceania"];
    
    regions.forEach(region => {
      const regionCityIndices = cities
        .map((city, index) => city.region === region ? index : -1)
        .filter(index => index !== -1);
      
      // Connect each hub in the region to 1-2 other cities in same region
      const hubIndices = regionCityIndices.filter(index => cities[index].isHub);
      const nonHubIndices = regionCityIndices.filter(index => !cities[index].isHub);
      
      hubIndices.forEach(hubIndex => {
        // Connect hub to other hubs in same region
        hubIndices.forEach(otherHubIndex => {
          if (otherHubIndex > hubIndex) { // Avoid duplicate connections
            routes.push([hubIndex, otherHubIndex]);
          }
        });
        
        // Connect hub to 1 non-hub city in same region if available
        if (nonHubIndices.length > 0) {
          const randomNonHub = nonHubIndices[Math.floor(Math.random() * nonHubIndices.length)];
          routes.push([hubIndex, randomNonHub]);
        }
      });
    });

    // 2. Key intercontinental connections - FIXED with correct indices
    const intercontinentalRoutes = [
      // Trans-Pacific
      [1, 17], // San Francisco (1) to Tokyo (17)
      [0, 18], // New York (0) to Singapore (18)
      [2, 25], // Los Angeles (2) to Sydney (25)
      
      // Trans-Atlantic
      [0, 8],  // New York (0) to London (8)
      [1, 9],  // San Francisco (1) to Paris (9)
      
      // Europe-Asia
      [8, 17], // London (8) to Tokyo (17)
      [9, 18], // Paris (9) to Singapore (18)
      [10, 24], // Moscow (10) to Dubai (24)
      
      // Africa connections
      [13, 8],  // Nairobi (13) to London (8)
      [14, 10], // Cairo (14) to Moscow (10)
      [13, 17], // Nairobi (13) to Tokyo (17)
      
      // South America connections
      [5, 0],  // São Paulo (5) to New York (0)
      [5, 8],  // São Paulo (5) to London (8)
      
      // Middle East hub
      [24, 8],  // Dubai (24) to London (8)
      [24, 17], // Dubai (24) to Tokyo (17)
      [24, 18], // Dubai (24) to Singapore (18)
      
      // Australia connections
      [25, 18], // Sydney (25) to Singapore (18)
      [25, 17], // Sydney (25) to Tokyo (17)
    ];

    // Add all intercontinental routes
    routes.push(...intercontinentalRoutes);

    // 3. Remove any duplicate routes
    const uniqueRoutes = [];
    const routeSet = new Set();
    
    routes.forEach(route => {
      const [i, j] = route;
      // Validate indices
      if (i >= 0 && i < cities.length && j >= 0 && j < cities.length) {
        const sorted = [i, j].sort((a, b) => a - b);
        const key = `${sorted[0]}-${sorted[1]}`;
        
        if (!routeSet.has(key)) {
          routeSet.add(key);
          uniqueRoutes.push([i, j]);
        }
      }
    });

    console.log(`Created ${uniqueRoutes.length} strategic routes between ${cities.length} cities`);

    // Create connection objects with proper validation
    const connections = uniqueRoutes.map(([i, j]) => {
      const startCity = cities[i];
      const endCity = cities[j];
      
      // Additional safety check
      if (!startCity || !endCity) {
        console.warn(`Invalid city indices: [${i}, ${j}]`);
        return null;
      }
      
      return {
        start: startCity,
        end: endCity,
        startVec: latLonToVector3(startCity.lat, startCity.lon, 2.01),
        endVec: latLonToVector3(endCity.lat, endCity.lon, 2.01),
        direction: Math.random() > 0.5 ? 1 : -1,
        isHubToHub: startCity.isHub && endCity.isHub,
      };
    }).filter(connection => connection !== null);

    // Get unique city positions for markers
    const allPositions = new Set();
    connections.forEach(conn => {
      allPositions.add(JSON.stringify(conn.startVec));
      allPositions.add(JSON.stringify(conn.endVec));
    });
    
    const cityPositionsArray = Array.from(allPositions).map(posStr => {
      const pos = JSON.parse(posStr);
      return new THREE.Vector3(pos.x, pos.y, pos.z);
    });

    return {
      cityConnections: connections,
      cityPositions: cityPositionsArray
    };
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0008;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.scale.setScalar(
        2.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03
      );
    }
  });

  return (
    <group>
      {/* Lighting - Adjust for day/night */}
      <ambientLight intensity={isDay ? 0.4 : 0.2} color={isDay ? "#4a90e2" : "#3a0066"} />
      <directionalLight position={[5, 3, 5]} intensity={isDay ? 1.5 : 0.8} color="#ffffff" />
      <directionalLight position={[-3, -2, -3]} intensity={isDay ? 0.5 : 0.3} color={isDay ? "#38bdf8" : "#8a2be2"} />
      <pointLight position={[0, 0, 0]} intensity={isDay ? 0.8 : 0.5} color={isDay ? "#60a5fa" : "#9370db"} />

      {/* Main Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={earthTexture}
          roughness={0.7}
          metalness={0.3}
          emissive={isDay ? "#062056" : "#1a0033"}
          emissiveIntensity={isDay ? 0.25 : 0.4}
        />
      </mesh>

      {/* Atmosphere Layers - Purple for night */}
      <mesh ref={atmosphereRef} scale={2.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={isDay ? "#38bdf8" : "#8a2be2"}
          transparent
          opacity={isDay ? 0.18 : 0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={2.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={isDay ? "#60a5fa" : "#9370db"}
          transparent
          opacity={isDay ? 0.12 : 0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={2.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={isDay ? "#93c5fd" : "#d8bfd8"}
          transparent
          opacity={isDay ? 0.08 : 0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Connection Arcs */}
      {cityConnections.map((connection, i) => (
        <TravelingArc 
          key={i}
          start={connection.startVec}
          end={connection.endVec}
          direction={connection.direction}
          index={i}
          isHubToHub={connection.isHubToHub}
          isDay={isDay} // Pass day/night state
        />
      ))}

      {/* City Points */}
      {cityPositions.map((position, i) => (
        <CityPoint 
          key={i} 
          position={position} 
          index={i} 
          isDay={isDay} // Pass day/night state
        />
      ))}
    </group>
  );
};

// TravelingArc with optimized particles - now supports day/night colors
function TravelingArc({ start, end, direction, index, isHubToHub, isDay }) {
  const arcRef = useRef();
  const glowRef = useRef();
  const particleRef = useRef();
  
  const { curve, geometry, glowGeometry } = useMemo(() => {
    const distance = start.distanceTo(end);
    const arcHeight = isHubToHub ? Math.max(distance * 0.85, 1.5) : Math.max(distance * 0.7, 1.2);
    
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const normal = midPoint.clone().normalize();
    const control = midPoint.clone().add(normal.clone().multiplyScalar(arcHeight));
    const bezierCurve = new THREE.QuadraticBezierCurve3(start, control, end);
    
    // Fewer points for less complex geometry
    const points = bezierCurve.getPoints(60);
    const catmullCurve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(catmullCurve, 60, isHubToHub ? 0.004 : 0.003, 8, false);
    const glowTubeGeo = new THREE.TubeGeometry(catmullCurve, 60, 0.008, 8, false);
    
    return { 
      curve: bezierCurve,
      geometry: tubeGeo,
      glowGeometry: glowTubeGeo
    };
  }, [start, end, isHubToHub]);

  // Day colors: blue theme
  const dayColors = {
    hubGlow: "#60a5fa",
    nonHubGlow: "#38bdf8",
    hubArc: "#3b82f6",
    nonHubArc: "#2563eb",
    particle: "#06b6d4"
  };
  
  // Night colors: purple theme
  const nightColors = {
    hubGlow: "#a855f7", // Vibrant purple
    nonHubGlow: "#8b5cf6", // Medium purple
    hubArc: "#7c3aed", // Deep purple
    nonHubArc: "#6d28d9", // Dark purple
    particle: "#c084fc" // Light purple
  };
  
  const colors = isDay ? dayColors : nightColors;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (arcRef.current && glowRef.current) {
      const pulse = Math.sin(time * 1.5 + index * 0.3) * 0.2 + 0.8;
      arcRef.current.material.opacity = pulse * (isDay ? 0.5 : 0.6);
      glowRef.current.material.opacity = pulse * (isDay ? 0.25 : 0.3);
    }
    
    if (particleRef.current) {
      let progress = ((time * 0.1 + index * 0.01) % 1);
      
      if (direction < 0) {
        progress = 1 - progress;
      }
      
      const position = curve.getPoint(progress);
      particleRef.current.position.copy(position);
      
      const fadeIn = Math.min(progress * 5, 1);
      const fadeOut = Math.min((1 - progress) * 5, 1);
      const alpha = fadeIn * fadeOut;
      
      particleRef.current.material.opacity = alpha * (isDay ? 0.95 : 1);
      particleRef.current.scale.setScalar(isHubToHub ? 0.02 : 0.015);
    }
  });

  return (
    <group>
      <mesh ref={glowRef} geometry={glowGeometry}>
        <meshBasicMaterial
          color={isHubToHub ? colors.hubGlow : colors.nonHubGlow}
          transparent
          opacity={isDay ? 0.2 : 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <mesh ref={arcRef} geometry={geometry}>
        <meshBasicMaterial
          color={isHubToHub ? colors.hubArc : colors.nonHubArc}
          transparent
          opacity={isDay ? 0.4 : 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Single particle instead of multiple */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={colors.particle}
          transparent
          opacity={isDay ? 0.95 : 1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// CityPoint component - now supports day/night colors
function CityPoint({ position, index, isDay }) {
  const coreRef = useRef();
  const glowRef = useRef();
  
  // Day colors: blue theme
  const dayColors = {
    glow: "#60a5fa",
    core: "#06b6d4"
  };
  
  // Night colors: purple theme
  const nightColors = {
    glow: "#a855f7",
    core: "#c084fc"
  };
  
  const colors = isDay ? dayColors : nightColors;
  
  useFrame((state) => {
    if (coreRef.current && glowRef.current) {
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * 1.2 + index * 0.4) * 0.3 + 0.7;
      
      coreRef.current.scale.setScalar(pulse * 0.035);
      
      const glowPulse = Math.sin(time * 1.2 + index * 0.4 + Math.PI / 3) * 0.25 + 0.75;
      glowRef.current.scale.setScalar(glowPulse * 0.055);
      glowRef.current.material.opacity = (1 - glowPulse) * (isDay ? 0.6 : 0.7);
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={colors.glow}
          transparent
          opacity={isDay ? 0.6 : 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={colors.core}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default AnimatedEarthScene;