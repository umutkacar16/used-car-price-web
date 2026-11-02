import React, { useState, useEffect } from 'react';
import { Car, Calculator, Trash2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BRANDS, FUEL_TYPES, TRANSMISSION_TYPES, calculateCarPrice } from './carPredictor';

export default function App() {
  // Başlangıç değerleri tamamen sıfır ve boş (placeholder) olarak tanımlandı
  const [formData, setFormData] = useState({
    brand: '',
    modelYear: '',
    mileageKm: '',
    engineCapacity: '',
    fuelType: '',
    transmission: '',
    damageRecordTL: '',
    paintedParts: 0,
    changedParts: 0
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [garage, setGarage] = useState([]);

  useEffect(() => {
    const savedGarage = localStorage.getItem('car_garage_list');
    if (savedGarage) {
      setGarage(JSON.parse(savedGarage));
    }
  }, []);

  const saveToLocalStorage = (updatedGarage) => {
    setGarage(updatedGarage);
    localStorage.setItem('car_garage_list', JSON.stringify(updatedGarage));
  };

  const selectedBrandObj = BRANDS.find(b => b.name === formData.brand);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.fuelType || !formData.transmission) {
      alert('Please fill in all mandatory fields before calculating.');
      return;
    }
    const price = calculateCarPrice(formData);
    setPredictedPrice(price);
  };

  const handleAddToGarage = () => {
    if (!predictedPrice) return;
    const newCar = {
      id: Date.now(),
      ...formData,
      imageUrl: selectedBrandObj ? selectedBrandObj.image : '',
      estimatedPrice: predictedPrice,
      date: new Date().toLocaleDateString('en-US')
    };
    const updated = [newCar, ...garage];
    saveToLocalStorage(updated);
  };

  const handleDeleteFromGarage = (id) => {
    const updated = garage.filter(car => car.id !== id);
    saveToLocalStorage(updated);
  };

  const totalGarageValue = garage.reduce((acc, car) => acc + car.estimatedPrice, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AutoValuate AI — Used Car Price Predictor</h1>
              <p className="text-slate-400 text-sm">ML Dataset-Driven Vehicle Valuation & Garage Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-3 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Garage Vehicles</p>
              <p className="text-xl font-bold text-blue-400">{garage.length} Items</p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Portfolio Value</p>
              <p className="text-xl font-bold text-emerald-400">{totalGarageValue.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
        </header>

        {/* Form & Garage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-7 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-400">
              <Calculator className="w-5 h-5" /> Vehicle Specification Input
            </h2>

          {/* Dynamic Brand Preview Image Card */}
          <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            {selectedBrandObj ? (
              <>
                <img 
                  src={selectedBrandObj.image} 
                  alt={formData.brand} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                  <div className="space-y-0.5">
                    <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow inline-block">
                      Selected Vehicle Preview
                    </span>
                    <h3 className="text-xl font-extrabold text-white drop-shadow-md">
                      {formData.brand} {formData.modelYear ? `(${formData.modelYear})` : ''}
                    </h3>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 gap-2">
                <ImageIcon className="w-10 h-10 stroke-1 text-slate-600" />
                <p className="text-sm font-medium">Select a brand below to view vehicle preview</p>
              </div>
            )}
</div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Brand</label>
                  <select 
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Brand --</option>
                    {BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Model Year {formData.modelYear ? `(${formData.modelYear})` : ''}
                  </label>
                  <input 
                    type="range" min="2005" max="2024"
                    value={formData.modelYear || 2015}
                    onChange={(e) => setFormData({...formData, modelYear: e.target.value})}
                    className="w-full mt-3 accent-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Mileage in KM</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 85000"
                    value={formData.mileageKm}
                    onChange={(e) => setFormData({...formData, mileageKm: e.target.value})}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Engine Capacity in Liters</label>
                  <input 
                    type="number" step="0.1" min="1.0" max="3.0"
                    placeholder="e.g. 1.6"
                    value={formData.engineCapacity}
                    onChange={(e) => setFormData({...formData, engineCapacity: e.target.value})}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Fuel Type</label>
                  <select 
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Fuel Type --</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Transmission</label>
                  <select 
                    value={formData.transmission}
                    onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Transmission --</option>
                    {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Painted Parts Count ({formData.paintedParts})</label>
                  <input 
                    type="range" min="0" max="7"
                    value={formData.paintedParts}
                    onChange={(e) => setFormData({...formData, paintedParts: e.target.value})}
                    className="w-full mt-3 accent-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Changed Parts Count ({formData.changedParts})</label>
                  <input 
                    type="range" min="0" max="4"
                    value={formData.changedParts}
                    onChange={(e) => setFormData({...formData, changedParts: e.target.value})}
                    className="w-full mt-3 accent-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Damage Record in TL</label>
                <input 
                  type="number" 
                  placeholder="e.g. 0"
                  value={formData.damageRecordTL}
                  onChange={(e) => setFormData({...formData, damageRecordTL: e.target.value})}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Sparkles className="w-5 h-5" /> Calculate Estimated Valuation
              </button>
            </form>

            {predictedPrice !== null && (
              <div className="mt-6 bg-slate-900/90 border border-blue-500/30 p-6 rounded-xl text-center space-y-3">
                <p className="text-sm text-slate-400">Estimated Market Value</p>
                <p className="text-3xl font-extrabold text-emerald-400">{predictedPrice.toLocaleString('tr-TR')} ₺</p>
                <button 
                  onClick={handleAddToGarage}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  + Add to Garage (LocalStorage)
                </button>
              </div>
            )}
          </div>

          {/* Garage Column */}
          <div className="lg:col-span-5 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
              <Car className="w-5 h-5" /> My Saved Garage ({garage.length})
            </h2>

            {garage.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl">
                No vehicles saved in your garage yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {garage.map(car => (
                  <div key={car.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex gap-4 items-center">
                    {car.imageUrl && (
                      <img 
                        src={car.imageUrl} 
                        alt={car.brand} 
                        className="w-20 h-20 rounded-lg object-cover object-center border border-slate-700 flex-shrink-0"
                      />
                    )}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-100 truncate">{car.brand}</span>
                        {car.modelYear && (
                          <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded font-semibold border border-blue-700">
                            {car.modelYear}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-emerald-400">{car.estimatedPrice.toLocaleString('tr-TR')} ₺</p>
                      <div className="text-xs text-slate-400 truncate">
                        {car.mileageKm ? `${parseInt(car.mileageKm).toLocaleString('tr-TR')} km` : ''} {car.engineCapacity ? `• ${car.engineCapacity}L` : ''} {car.fuelType}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFromGarage(car.id)}
                      className="text-slate-500 hover:text-red-400 p-2 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}