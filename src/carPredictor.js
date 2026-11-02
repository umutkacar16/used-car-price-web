/**
 * @file carPredictor.js
 * @description Core Valuation Engine for AutoValuate AI.
 * Implements a heuristic pricing model aligned with feature importances 
 * derived from the underlying Machine Learning dataset (`used_car_price_dataset.csv`).
 *
 * @author Umut Kaçar
 * @version 1.0.0
 */

/**
 * @typedef {Object} BrandConfig
 * @property {string} name - Vehicle manufacturer brand name.
 * @property {number} baseMultiplier - Valuation weight multiplier based on brand equity.
 * @property {string} image - Path to the localized brand preview image asset.
 */

/**
 * Supported vehicle brands with corresponding valuation weight multipliers and local asset paths.
 * @type {ReadonlyArray<BrandConfig>}
 */
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

/**
 * Available fuel type categories supported by the valuation model.
 * @type {ReadonlyArray<string>}
 */
export const FUEL_TYPES = ['Gasoline', 'Diesel', 'LPG', 'Hybrid'];

/**
 * Transmission options supported by the valuation model.
 * @type {ReadonlyArray<string>}
 */
export const TRANSMISSION_TYPES = ['Automatic', 'Manual'];

/**
 * Calculates the estimated market valuation for a vehicle based on input parameters.
 * 
 * Valuation Factors Considered:
 * - Exponential depreciation / appreciation by model year relative to baseline (2010).
 * - Brand equity coefficient weighting.
 * - Engine displacement capacity adjustment.
 * - Transmission type surcharge (Automatic vs. Manual).
 * - Fuel efficiency / market preference adjustment.
 * - Kilometer mileage penalty.
 * - Body condition deductions (painted parts, replaced parts, insurance damage record).
 *
 * @param {Object} carData - The vehicle specs input payload.
 * @param {string} carData.brand - Manufacturer brand name.
 * @param {number|string} [carData.modelYear=2015] - Production year of the vehicle.
 * @param {number|string} [carData.mileageKm=0] - Total distance traveled in kilometers.
 * @param {number|string} [carData.engineCapacity=1.6] - Engine capacity in liters.
 * @param {string} [carData.fuelType] - Fuel type classification.
 * @param {string} [carData.transmission] - Transmission mechanism type.
 * @param {number|string} [carData.paintedParts=0] - Count of repainted body components.
 * @param {number|string} [carData.changedParts=0] - Count of replaced structural/body parts.
 * @param {number|string} [carData.damageRecordTL=0] - Total registered damage value in TRY.
 * 
 * @returns {number} Estimated market value in TRY (floored at minimum baseline 100,000 TRY).
 */
export function calculateCarPrice(carData) {
  // Parse and sanitize input attributes with safe fallback defaults
  const modelYear = parseInt(carData.modelYear || 2015, 10);
  const mileage = parseInt(carData.mileageKm || 0, 10);
  const engineCap = parseFloat(carData.engineCapacity || 1.6);
  const damageTL = carData.damageRecordTL !== '' && carData.damageRecordTL !== null 
    ? parseFloat(carData.damageRecordTL) 
    : 0;

  const paintedParts = parseInt(carData.paintedParts || 0, 10);
  const changedParts = parseInt(carData.changedParts || 0, 10);

  // 1. Model Year Baseline & Non-linear Age Appreciation Curve
  let yearBasePrice = 100000;
  if (modelYear > 2010) {
    yearBasePrice += Math.pow(modelYear - 2010, 2.15) * 4800;
  }

  // 2. Brand Value Weighting
  const brandObj = BRANDS.find(b => b.name === carData.brand);
  const brandMultiplier = brandObj ? brandObj.baseMultiplier : 1.0;
  let estimatedPrice = yearBasePrice * brandMultiplier;

  // 3. Engine Displacement Valuation Adjustment
  estimatedPrice += (engineCap - 1.6) * 120000;

  // 4. Transmission Type Premium
  if (carData.transmission === 'Automatic') {
    estimatedPrice += 45000;
  }

  // 5. Fuel Type Premium / Discount
  if (carData.fuelType === 'Diesel') estimatedPrice += 25000;
  if (carData.fuelType === 'Hybrid') estimatedPrice += 15000;

  // 6. Mileage Mileage Penalty
  const mileageDeduction = (mileage / 10000) * 12500;
  estimatedPrice -= mileageDeduction;

  // 7. Body Condition & Insurance Damage Record Deductions
  estimatedPrice -= paintedParts * 4500;
  estimatedPrice -= changedParts * 13500;
  estimatedPrice -= damageTL * 0.70;

  // Floor output at minimum nominal baseline valuation (100,000 TRY)
  return Math.max(100000, Math.round(estimatedPrice));
}