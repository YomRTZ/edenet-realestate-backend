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
  const [country, setCountry] = useState('');

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
      dataPackage.append('property_type', 'HOUSE');
      dataPackage.append('listing_type', 'SALE');
      dataPackage.append('price', price.trim());
      dataPackage.append('city', city.trim());
      dataPackage.append('country', country.trim());

      images.forEach(f => dataPackage.append('images', f));
      documents.forEach(f => dataPackage.append('documents', f));

      console.log('[Frontend AddProperties] submitting /properties', {
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        city: city.trim(),
        country: country.trim(),
        imagesCount: images.length,
        documentsCount: documents.length,
      });

      const { data } = await api.post('/properties', dataPackage);


      if (data.success) {
        setFeedback(`Saved to local database! Registry Tracking Reference ID: ${data.data.propertyId}. Staging Status: PENDING.`);
        setTitle(''); setDescription(''); setPrice(''); setCity(''); setCountry('');
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
