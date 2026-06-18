import { useState } from 'react';
import DocumentUploader from '../../../components/DocumentUploader';
import { api } from '../../../lib/axios';

export default function AddProperties() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [propertyType, setPropertyType] = useState('HOUSE');
  const [listingType, setListingType] = useState('SALE');

  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [areaSize, setAreaSize] = useState('0');
  const [lotSize, setLotSize] = useState('0');
  const [parkingSpots, setParkingSpots] = useState('0');
  const [yearBuilt, setYearBuilt] = useState('0');
  const [propertyTax, setPropertyTax] = useState('0');
  const [hoaFees, setHoaFees] = useState('0');

  const [petPolicy, setPetPolicy] = useState('');
  const [isFurnished, setIsFurnished] = useState(false);

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const executeUploadWorkflow = async (e) => {
    e.preventDefault();
    setError(''); setFeedback('');

    if (!title.trim() || !price || !city.trim() || !country.trim()) {
      return setError('Please populate required structural parameters (*).');
    }

    setSubmitting(true);
    try {
      const dataPackage = new FormData();
      dataPackage.append('title', title.trim());
      dataPackage.append('description', description.trim());
      dataPackage.append('property_type', propertyType);
      dataPackage.append('listing_type', listingType);
      dataPackage.append('price', price.trim());
      dataPackage.append('city', city.trim());
      dataPackage.append('state', state.trim());
      dataPackage.append('zip_code', zipCode.trim());
      dataPackage.append('country', country.trim());

      dataPackage.append('bedrooms', bedrooms);
      dataPackage.append('bathrooms', bathrooms);
      dataPackage.append('area_size', areaSize);
      dataPackage.append('lot_size', lotSize);
      dataPackage.append('parking_spots', parkingSpots);
      dataPackage.append('year_built', yearBuilt);
      dataPackage.append('property_tax', propertyTax);
      dataPackage.append('hoa_fees', hoaFees);
      dataPackage.append('pet_policy', petPolicy.trim());
      dataPackage.append('is_furnished', isFurnished ? 'true' : 'false');

      images.forEach(f => dataPackage.append('images', f));
      documents.forEach(f => dataPackage.append('documents', f));

      console.log('[Frontend AddProperties] submitting /properties', {
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        propertyType,
        listingType,
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        bedrooms,
        bathrooms,
        areaSize,
        lotSize,
        parkingSpots,
        yearBuilt,
        propertyTax,
        hoaFees,
        petPolicy,
        isFurnished,
        imagesCount: images.length,
        documentsCount: documents.length,
      });

      const { data } = await api.post('/properties', dataPackage);

      if (data.success) {
        setFeedback(`Saved to local database! Registry Tracking Reference ID: ${data.data.propertyId}. Staging Status: PENDING.`);
        setTitle(''); setDescription(''); setPrice(''); setCity(''); setState(''); setZipCode(''); setCountry('');
        setPropertyType('HOUSE');
        setListingType('SALE');
        setBedrooms('0'); setBathrooms('0'); setAreaSize('0'); setLotSize('0');
        setParkingSpots('0'); setYearBuilt('0'); setPropertyTax('0'); setHoaFees('0');
        setPetPolicy(''); setIsFurnished(false);
        setImages([]); setDocuments([]);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Transmission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm mt-8 text-sm">
      <form onSubmit={executeUploadWorkflow} className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Request New Real Estate Entry Modification</h3>
        <div className="grid grid-cols-1 gap-2">
          <label className="font-semibold text-slate-700">Property Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="e.g., Beachfront Apartment" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <label className="font-semibold text-slate-700">Property Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Price (Wei String Value) *</label>
            <input type="text" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">City *</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Country *</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">State</label>
            <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="e.g., CA" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Zip Code</label>
            <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="e.g., 94105" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg">
              <option value="HOUSE">HOUSE</option>
              <option value="APARTMENT">APARTMENT</option>
              <option value="VILLA">VILLA</option>
              <option value="LAND">LAND</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Listing Type</label>
            <select value={listingType} onChange={e => setListingType(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg">
              <option value="SALE">SALE</option>
              <option value="RENT">RENT</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Bedrooms</label>
            <input type="number" min={0} value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Bathrooms</label>
            <input type="number" min={0} value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Area Size</label>
            <input type="number" min={0} value={areaSize} onChange={e => setAreaSize(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Lot Size</label>
            <input type="number" min={0} value={lotSize} onChange={e => setLotSize(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Parking Spots</label>
            <input type="number" min={0} value={parkingSpots} onChange={e => setParkingSpots(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Year Built</label>
            <input type="number" min={0} value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Property Tax</label>
            <input type="number" min={0} step="any" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">HOA Fees</label>
            <input type="number" min={0} step="any" value={hoaFees} onChange={e => setHoaFees(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-slate-700">Pet Policy</label>
            <input type="text" value={petPolicy} onChange={e => setPetPolicy(e.target.value)} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="e.g., Pets allowed" />
          </div>
          <div className="col-span-1 flex items-center gap-3 pt-7">
            <input id="isFurnished" type="checkbox" checked={isFurnished} onChange={e => setIsFurnished(e.target.checked)} className="h-4 w-4" />
            <label htmlFor="isFurnished" className="font-semibold text-slate-700">Furnished</label>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <DocumentUploader label="Upload Marketing Imagery Files" files={images} setFiles={setImages} acceptType="images" disabled={submitting} />
          <DocumentUploader label="Upload Legal Property Deeds Documentation Proofs" files={documents} setFiles={setDocuments} acceptType="docs" disabled={submitting} />
        </div>
        {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 font-medium rounded-lg text-xs">{error}</div>}
        {feedback && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono rounded-lg text-xs">{feedback}</div>}
        <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-bold p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
          {submitting ? 'Transmitting Data Clusters...' : 'File Application Requests'}
        </button>
      </form>
    </div>
  );
}
