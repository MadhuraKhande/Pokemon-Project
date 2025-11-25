import React from 'react';

const PokemonCard = ({ pokemon }) => {
  // Official Pokemon type colors for consistent branding
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  // Color code stats based on strength for better visual feedback
  const getStatColor = (value) => {
    if (value >= 100) return '#4CAF50';
    if (value >= 70) return '#2196F3';
    if (value >= 50) return '#FFC107';
    return '#FF5722';
  };

  return (
    <div className="pokemon-card">
      {pokemon.cached && (
        <div className="cached-badge">
          ⚡ Cached Result
        </div>
      )}

      <div className="pokemon-header">
        <h2 className="pokemon-name">
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </h2>
        <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
      </div>

      <div className="pokemon-image-container">
        <img
          src={pokemon.sprites.official || pokemon.sprites.default}
          alt={pokemon.name}
          className="pokemon-image"
        />
      </div>

      <div className="pokemon-types">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="type-badge"
            style={{ backgroundColor: typeColors[type] || '#777' }}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>

      {pokemon.flavorText && (
        <div className="flavor-text">
          <p>{pokemon.flavorText}</p>
        </div>
      )}

      <div className="pokemon-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Height</span>
            <span className="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
          </div>
          <div className="info-item">
            <span className="info-label">Weight</span>
            <span className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
          </div>
          <div className="info-item">
            <span className="info-label">Base XP</span>
            <span className="info-value">{pokemon.baseExperience}</span>
          </div>
        </div>
      </div>

      <div className="pokemon-abilities">
        <h3 className="section-title">Abilities</h3>
        <div className="abilities-list">
          {pokemon.abilities.map((ability, index) => (
            <span key={index} className="ability-badge">
              {ability.name.replace('-', ' ')}
              {ability.hidden && ' (Hidden)'}
            </span>
          ))}
        </div>
      </div>

      <div className="pokemon-stats">
        <h3 className="section-title">Base Stats</h3>
        {pokemon.stats.map((stat) => (
          <div key={stat.name} className="stat-row">
            <span className="stat-name">
              {stat.name.replace('-', ' ').toUpperCase()}
            </span>
            <div className="stat-bar-container">
              <div
                className="stat-bar"
                style={{
                  width: `${Math.min((stat.value / 255) * 100, 100)}%`,
                  backgroundColor: getStatColor(stat.value),
                }}
              />
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      {pokemon.moves && pokemon.moves.length > 0 && (
        <div className="pokemon-moves">
          <h3 className="section-title">Sample Moves</h3>
          <div className="moves-list">
            {pokemon.moves.map((move, index) => (
              <span key={index} className="move-badge">
                {move.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonCard;
