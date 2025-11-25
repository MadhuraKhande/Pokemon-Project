import { useState, useEffect } from 'react';
import PokemonCard from './components/PokemonCard';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Load theme preference from browser storage, default to dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError('Please enter a Pokémon name');
      return;
    }

    setLoading(true);
    setError(null);
    setPokemon(null);

    try {
      // Fetch pokemon data from our backend API which handles caching
      const response = await fetch(`/api/pokemon/${searchTerm.toLowerCase().trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Pokémon');
      }

      setPokemon(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="app">
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle theme"
      >
        {darkMode ? 'LIGHT' : 'DARK'}
      </button>

      <div className="container">
        <header className="header">
          <h1 className="title">
            Pokedex
          </h1>
          <p className="subtitle">Search and discover Pokémon</p>
        </header>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Enter Pokémon name (e.g., pikachu, charizard)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading Pokémon data...</p>
          </div>
        )}

        {pokemon && !loading && (
          <PokemonCard pokemon={pokemon} />
        )}

        {!pokemon && !loading && !error && (
          <div className="empty-state">
            <p>Start by searching for a Pokémon!</p>
            <p className="empty-hint">Try: pikachu, charizard, mewtwo, bulbasaur</p>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>Data from <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a></p>
      </footer>
    </div>
  );
}

export default App;
