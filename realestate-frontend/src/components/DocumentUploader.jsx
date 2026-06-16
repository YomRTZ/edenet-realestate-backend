import { useRef, useState } from 'react';

export default function DocumentUploader({ label, files, setFiles, acceptType, disabled }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleSelection = (e) => {
    const list = Array.from(e.target.files || []);
    setError('');
    setFiles(prev => {
      const merged = [...prev, ...list];
      if (merged.length > 15) { setError('Limit reached. Max 15 items.'); return merged.slice(0, 15); }
      return merged;
    });
  };

  return (
    <div className="w-full border border-slate-200 p-4 bg-slate-50/50 rounded-xl text-xs">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-bold text-slate-700 block">{label}</span>
          <span className="text-slate-400">Up to 15 items per structural array</span>
        </div>
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-1.5 rounded-lg disabled:opacity-50">
          Staging Selection
        </button>
      </div>
      <input ref={inputRef} type="file" multiple accept={acceptType === 'images' ? 'image/*' : 'application/pdf,.pdf'} className="hidden" onChange={handleSelection} />
      <div className="space-y-1 mt-2">
        {files.length === 0 ? <p className="text-slate-400 italic text-center py-2 border border-dashed rounded-lg">Staging bucket empty.</p> :
          files.map((f, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
              <span className="truncate max-w-[70%] font-medium text-slate-700">{f.name}</span>
              <button type="button" onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:underline">Remove</button>
            </div>
          ))}
      </div>
      {error && <p className="text-red-500 mt-1 font-bold">{error}</p>}
    </div>
  );
}
