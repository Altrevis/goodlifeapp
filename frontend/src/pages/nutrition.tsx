import React, { useState } from 'react';
import './css/nutrition.css';

const CACHE_KEY = 'nutrition_search_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

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

  const formatLabel = (key: string) => {
    let label = key.replace(/[_\-]/g, ' ');
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError('');
    const cached = getCachedResults(query);
    if (cached && cached.length > 0) {
      setResults(cached);
    } else {
      setResults([]);
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/nutritionix/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const items = data.results || [];
        setResults(items);
        setCachedResults(query, items);
      } else {
        const err = await response.json().catch(() => ({} as any));
        const msg =
          (err && (err.error || err.message)) ||
          `Erreur serveur (${response.status})` ||
          'Aucun résultat trouvé';
        setError(msg);
      }
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-container">
      <h1>🍎 Nutrition</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Rechercher un aliment... (ex: pomme, poulet)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Rechercher</button>
      </form>

      {loading && <p className="loading">Chargement...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.map((item, index) => {
          // Object.entries retourne [string, unknown][]
          const nutrientEntries = (Object.entries(item) as [string, unknown][]).filter(([k, v]) => {
            if (['name', 'brand', 'barcode', 'image', 'serving_size', 'quantity', 'serving', 'product_name'].includes(k)) return false;
            // garder les champs numériques ou textuels utiles
            return (typeof v === 'number') || (typeof v === 'string' && v !== '' && !isNaN(Number(String(v)))) || (typeof v === 'string' && isNaN(Number(String(v))));
          });

          return (
            <div key={index} className="nutrition-card">
              <h3>{(item.name as string) || (item.product_name as string) || 'Produit'}</h3>
              {(item.brand || item.brands) && <p><strong>Marque:</strong> {(item.brand || item.brands)}</p>}
              {item.image && <img alt={(item.name as string) || 'image produit'} src={String(item.image)} />}
              {item.serving_size && <p><strong>Portion:</strong> {String(item.serving_size)}</p>}

              {nutrientEntries.length > 0 ? (
                <ul className="nutrient-list">
                  {nutrientEntries.map(([k, v]) => {
                    const display = v === null || v === undefined
                      ? '—'
                      : (typeof v === 'object' ? JSON.stringify(v) : String(v));
                    return (
                      <li key={k}>
                        <strong>{formatLabel(k)}:</strong> {display}{unitForKey(k)}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>Aucune information nutritionnelle disponible pour ce résultat.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Nutrition;
