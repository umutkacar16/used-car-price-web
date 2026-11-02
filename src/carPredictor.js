// Used Car Price Valuation Algorithm matching used_car_price_dataset.csv

export const BRANDS = [
  { 
    name: 'BMW', 
    baseMultiplier: 1.28,
    image: '/images/bmw.jpg'
  },
  { 
    name: 'Mercedes', 
    baseMultiplier: 1.30,
    image: '/images/mercedes.jpg'
  },
  { 
    name: 'Volkswagen', 
    baseMultiplier: 1.05,
    image: '/images/volkswagen.jpg'
  },
  { 
    name: 'Toyota', 
    baseMultiplier: 1.00,
    image: '/images/toyota.jpg'
  },
  { 
    name: 'Ford', 
    baseMultiplier: 0.98,
    image: '/images/ford.jpg'
  },
  { 
    name: 'Fiat', 
    baseMultiplier: 0.95,
    image: '/images/fiat.jpg'
  },
  { 
    name: 'Renault', 
    baseMultiplier: 0.94,
    image: '/images/renault.jpg'
  }
];

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'LPG', 'Hybrid'];
export const TRANSMISSION_TYPES = ['Automatic', 'Manual'];

export function calculateCarPrice(carData) {
  const modelYear = parseInt(carData.modelYear || 2015);
  const mileage = parseInt(carData.mileageKm || 0);
  const engineCap = parseFloat(carData.engineCapacity || 1.6);
  const damageTL = carData.damageRecordTL !== '' && carData.damageRecordTL !== null 
    ? parseFloat(carData.damageRecordTL) 
    : 0;

  const paintedParts = parseInt(carData.paintedParts || 0);
  const changedParts = parseInt(carData.changedParts || 0);

  let yearBasePrice = 100000;
  if (modelYear > 2010) {
    yearBasePrice += Math.pow(modelYear - 2010, 2.15) * 4800;
  }

  const brandObj = BRANDS.find(b => b.name === carData.brand);
  const brandMultiplier = brandObj ? brandObj.baseMultiplier : 1.0;
  let estimatedPrice = yearBasePrice * brandMultiplier;

  estimatedPrice += (engineCap - 1.6) * 120000;

  if (carData.transmission === 'Automatic') {
    estimatedPrice += 45000;
  }

  if (carData.fuelType === 'Diesel') estimatedPrice += 25000;
  if (carData.fuelType === 'Hybrid') estimatedPrice += 15000;

  const mileageDeduction = (mileage / 10000) * 12500;
  estimatedPrice -= mileageDeduction;

  estimatedPrice -= paintedParts * 4500;
  estimatedPrice -= changedParts * 13500;
  estimatedPrice -= damageTL * 0.70;

  return Math.max(100000, Math.round(estimatedPrice));
}