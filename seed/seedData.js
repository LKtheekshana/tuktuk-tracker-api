/**
 * Seed Script — generates all master data and simulation data
 *
 * Run with: npm run seed
 *
 * Inserts:
 *   - 9 provinces
 *   - 25 districts
 *   - 25 police stations (1 per district)
 *   - 200 tuk-tuks
 *   - 1 admin user  (username: admin / password: Admin@1234)
 *   - 1 week of location pings (~10 pings/day per vehicle = ~1,400,000 pings)
 *     (reduced to 5 pings/day for seeding speed — adjust PINGS_PER_DAY below)
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Province from '../src/models/Province.js';
import District from '../src/models/District.js';
import PoliceStation from '../src/models/PoliceStation.js';
import Vehicle from '../src/models/Vehicle.js';
import LocationPing from '../src/models/LocationPing.js';
import User from '../src/models/User.js';

// ─── Config ──────────────────────────────────────────────────────────────────
const PINGS_PER_DAY = 5;   // pings per vehicle per day  (increase to 10 for richer history)
const HISTORY_DAYS = 7;
const VEHICLE_COUNT = 200;

// ─── Sri Lanka geographic bounds ─────────────────────────────────────────────
const SL_LAT  = { min: 5.92, max: 9.85 };
const SL_LNG  = { min: 79.65, max: 81.88 };

const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(6));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Master Data ──────────────────────────────────────────────────────────────
const PROVINCES = [
  { name: 'Western Province',        code: 'WP' },
  { name: 'Central Province',        code: 'CP' },
  { name: 'Southern Province',       code: 'SP' },
  { name: 'Northern Province',       code: 'NP' },
  { name: 'Eastern Province',        code: 'EP' },
  { name: 'North Western Province',  code: 'NWP' },
  { name: 'North Central Province',  code: 'NCP' },
  { name: 'Uva Province',            code: 'UP' },
  { name: 'Sabaragamuwa Province',   code: 'SGP' },
];

// 25 districts mapped to their province code
const DISTRICTS = [
  { name: 'Colombo',       province: 'WP'  },
  { name: 'Gampaha',       province: 'WP'  },
  { name: 'Kalutara',      province: 'WP'  },
  { name: 'Kandy',         province: 'CP'  },
  { name: 'Matale',        province: 'CP'  },
  { name: 'Nuwara Eliya',  province: 'CP'  },
  { name: 'Galle',         province: 'SP'  },
  { name: 'Matara',        province: 'SP'  },
  { name: 'Hambantota',    province: 'SP'  },
  { name: 'Jaffna',        province: 'NP'  },
  { name: 'Kilinochchi',   province: 'NP'  },
  { name: 'Mannar',        province: 'NP'  },
  { name: 'Mullaitivu',    province: 'NP'  },
  { name: 'Vavuniya',      province: 'NP'  },
  { name: 'Batticaloa',    province: 'EP'  },
  { name: 'Ampara',        province: 'EP'  },
  { name: 'Trincomalee',   province: 'EP'  },
  { name: 'Kurunegala',    province: 'NWP' },
  { name: 'Puttalam',      province: 'NWP' },
  { name: 'Anuradhapura',  province: 'NCP' },
  { name: 'Polonnaruwa',   province: 'NCP' },
  { name: 'Badulla',       province: 'UP'  },
  { name: 'Monaragala',    province: 'UP'  },
  { name: 'Ratnapura',     province: 'SGP' },
  { name: 'Kegalle',       province: 'SGP' },
];

// NIC patterns
const generateNIC = (index) => {
  const year = String(randInt(1965, 1998)).slice(2);
  const day = String(randInt(1, 366)).padStart(3, '0');
  return `${year}${day}${String(index).padStart(4, '0')}V`;
};

// Registration number pattern: WP CAB-XXXX
const generateReg = (index, provCode) => {
  const num = String(index + 1000).slice(1);
  return `${provCode} TUK-${num}`;
};

// Driver names pool
const FIRST_NAMES = ['Kamal', 'Nimal', 'Sunil', 'Asanka', 'Chaminda', 'Priyantha', 'Roshan', 'Dilshan', 'Tharaka', 'Sachith',
                     'Wasantha', 'Nuwan', 'Sampath', 'Madushan', 'Janaka', 'Rukmal', 'Dimuthu', 'Isuru', 'Kasun', 'Lahiru'];
const LAST_NAMES  = ['Perera', 'Silva', 'Fernando', 'De Silva', 'Jayasinghe', 'Gunasekara', 'Bandara', 'Wickramasinghe',
                     'Ranasinghe', 'Kumara', 'Rajapaksha', 'Dissanayake', 'Seneviratne', 'Herath', 'Liyanage'];

// ─── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Province.deleteMany({}),
    District.deleteMany({}),
    PoliceStation.deleteMany({}),
    Vehicle.deleteMany({}),
    LocationPing.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // 1. Insert Provinces
  const provinceMap = {};
  for (const p of PROVINCES) {
    const created = await Province.create(p);
    provinceMap[p.code] = created._id;
  }
  console.log(`Inserted ${PROVINCES.length} provinces`);

  // 2. Insert Districts
  const districtDocs = [];
  for (const d of DISTRICTS) {
    const doc = await District.create({ name: d.name, province: provinceMap[d.province] });
    districtDocs.push({ ...d, _id: doc._id, provinceId: provinceMap[d.province] });
  }
  console.log(`Inserted ${DISTRICTS.length} districts`);

  // 3. Insert Police Stations (1 per district, 25 total)
  const stationDocs = [];
  for (const d of districtDocs) {
    const code = d.name.toUpperCase().replace(/\s+/g, '-').slice(0, 8) + '-PS';
    const station = await PoliceStation.create({
      name: `${d.name} Police Station`,
      code,
      district: d._id,
      province: d.provinceId,
      address: `Main Street, ${d.name}`,
      contactNumber: `0${randInt(11, 99)}-${randInt(1000000, 9999999)}`,
    });
    stationDocs.push(station);
  }
  console.log(`Inserted ${stationDocs.length} police stations`);

  // 4. Insert 200 Vehicles
  const vehicleDocs = [];
  for (let i = 0; i < VEHICLE_COUNT; i++) {
    const district = randFrom(districtDocs);
    const vehicle = await Vehicle.create({
      registrationNumber: generateReg(i, PROVINCES.find(p => provinceMap[p.code].toString() === district.provinceId.toString())?.code || 'WP'),
      driverName: `${randFrom(FIRST_NAMES)} ${randFrom(LAST_NAMES)}`,
      driverNIC: generateNIC(i),
      district: district._id,
      province: district.provinceId,
      status: randFrom(['active', 'active', 'active', 'active', 'inactive', 'suspended']),
    });
    vehicleDocs.push(vehicle);
  }
  console.log(`Inserted ${VEHICLE_COUNT} vehicles`);

  // 5. Insert Location Pings (1 week of history)
  const now = new Date();
  const pingBatch = [];
  const vehicleLastLocations = {};

  for (const vehicle of vehicleDocs) {
    if (vehicle.status === 'suspended') continue;

    // Give each vehicle a base position within Sri Lanka
    let baseLat = rand(SL_LAT.min, SL_LAT.max);
    let baseLng = rand(SL_LNG.min, SL_LNG.max);

    for (let day = HISTORY_DAYS; day >= 0; day--) {
      for (let p = 0; p < PINGS_PER_DAY; p++) {
        const hoursAgo = day * 24 - (p * (24 / PINGS_PER_DAY));
        const timestamp = new Date(now.getTime() - hoursAgo * 3600 * 1000);

        // Simulate movement: small drift from base position each ping
        baseLat += rand(-0.005, 0.005);
        baseLng += rand(-0.005, 0.005);
        // Keep within Sri Lanka bounds
        baseLat = Math.max(SL_LAT.min, Math.min(SL_LAT.max, baseLat));
        baseLng = Math.max(SL_LNG.min, Math.min(SL_LNG.max, baseLng));

        pingBatch.push({
          vehicle: vehicle._id,
          latitude: parseFloat(baseLat.toFixed(6)),
          longitude: parseFloat(baseLng.toFixed(6)),
          speed: rand(0, 60),
          heading: randInt(0, 359),
          timestamp,
        });

        // Track the most recent ping for lastLocation
        if (!vehicleLastLocations[vehicle._id] || timestamp > vehicleLastLocations[vehicle._id].timestamp) {
          vehicleLastLocations[vehicle._id] = { latitude: baseLat, longitude: baseLng, timestamp };
        }
      }
    }
  }

  // Bulk insert pings in chunks of 1000 for performance
  const CHUNK = 1000;
  for (let i = 0; i < pingBatch.length; i += CHUNK) {
    await LocationPing.insertMany(pingBatch.slice(i, i + CHUNK));
  }
  console.log(`Inserted ${pingBatch.length} location pings`);

  // Update lastLocation on each vehicle
  for (const [vehicleId, loc] of Object.entries(vehicleLastLocations)) {
    await Vehicle.findByIdAndUpdate(vehicleId, { lastLocation: loc });
  }
  console.log('Updated lastLocation on all vehicles');

  // 6. Create Admin User (plain password — pre-save hook handles hashing)
  await User.create({
    username: 'admin',
    email: 'admin@police.lk',
    password: 'Admin@1234',
    role: 'ADMIN',
  });
  console.log('Admin user created: username=admin / password=Admin@1234');

  // 7. Create sample Station Officer user
  await User.create({
    username: 'officer_colombo',
    email: 'officer@police.lk',
    password: 'Officer@1234',
    role: 'STATION_OFFICER',
    station: stationDocs[0]._id,
  });
  console.log('Sample station officer created: username=officer_colombo / password=Officer@1234');

  await mongoose.disconnect();
  console.log('\n✅ Seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
