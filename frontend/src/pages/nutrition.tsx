import React, { useState } from 'react';
import { Search, Apple, Info } from 'lucide-react';
import './css/nutrition.css';

const CACHE_KEY = 'nutrition_search_cache';
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCachedResults(q: string): any[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const key = (q || '').trim().toLowerCase();
    const entry = data[key];
    if (!entry || !Array.isArray(entry.results)) return null;
    if (Date.now() - (entry.ts || 0) > CACHE_TTL_MS) return null;
    return entry.results;
  } catch {
    return null;
  }
}

function setCachedResults(q: string, results: any[]) {
  try {
    const key = (q || '').trim().toLowerCase();
    if (!key) return;
    const raw = localStorage.getItem(CACHE_KEY) || '{}';
    const data = JSON.parse(raw);
    data[key] = { results, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

const Nutrition: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    { name: 'Pomme' },
    { name: 'Poulet' },
    { name: 'Riz' },
    { name: 'Avocat' },
    { name: 'Oeuf' }
  ];

  const formatLabel = (key: string) => {
    let label = key.replace(/[_-]/g, ' ');
    label = label.replace(/\s+100g$/i, ' /100g');
    label = label.replace(/\s+serving$/i, ' /serving');
    label = label.replace(/energy kj/i, 'energy (kJ)');
    label = label.replace(/energy kcal/i, 'calories (kcal)');
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const unitForKey = (key: string) => {
    if (/kcal/i.test(key)) return ' kcal';
    return '';
  };

  const handleSearch = async (e: React.FormEvent, searchOverride?: string) => {
    if (e) e.preventDefault();
    const searchTerm = searchOverride || query;
    if (!searchTerm.trim()) return;

    setError('');
    setLoading(true);

    const cached = getCachedResults(searchTerm);
    if (cached && cached.length > 0) {
      setResults(cached);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/nutritionix/search/${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        const items = data.results || [];
        setResults(items);
        setCachedResults(searchTerm, items);
      } else {
        setError('Aucun résultat trouvé.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-container">
      <h1 className="welcome-title">Nutrition <Apple size={36} color="#10b981" /></h1>
      <p className="home-subtitle">Analysez la valeur nutritionnelle de vos aliments préférés.</p>

     <form onSubmit={(e) => handleSearch(e)} className="nutrition-search-bar-new">
  <input
    type="text"
    placeholder="Rechercher un aliment..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="nutrition-input-new"
  />
  <button type="submit" className="nutrition-button-new">
    <Search size={20} color="white" strokeWidth={3} />
  </button>
</form>

      <div className="quick-suggestions">
        <span style={{ marginRight: '8px' }}>Suggestions :</span>
        {suggestions.map((item) => (
          <button
            key={item.name}
            className="suggestion-pill"
            onClick={(e) => {
              setQuery(item.name);
              handleSearch(e, item.name);
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {loading && <div className="loading-spinner">Chargement...</div>}
      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.map((item, index) => {
          const nutrientEntries = (Object.entries(item) as [string, unknown][]).filter(([k, v]) => {
            if (['name', 'brand', 'barcode', 'image', 'serving_size', 'quantity', 'serving', 'product_name'].includes(k)) return false;
            return (typeof v === 'number') || (typeof v === 'string' && v !== '' && !isNaN(Number(String(v))));
          });

          return (
            <div key={index} className="nutrition-card">
              <div className="card-header">
                <h3>{(item.name as string) || (item.product_name as string) || 'Produit'}</h3>
                {item.brand && <span className="brand-badge">{item.brand}</span>}
              </div>

              {item.image && (
                <div className="product-image-container">
                  <img alt={item.name as string} src={String(item.image)} className="product-image" />
                </div>
              )}

              <div className="serving-info">
                <Info size={16} /> <span>Portion: {String(item.serving_size || '100g')}</span>
              </div>

              <div className="nutrient-grid">
                {nutrientEntries.map(([k, v]) => (
                  <div key={k} className="nutrient-item">
                    <span className="nutrient-label">{formatLabel(k)}</span>
                    <span className="nutrient-value">
                      {v === null ? '—' : String(v)}{unitForKey(k)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Nutrition;