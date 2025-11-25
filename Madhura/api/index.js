const express = require('express');
const fetch = require('node-fetch');

// Simple in-memory cache for Vercel serverless
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100;

// Transform Pokemon data to send only necessary fields
const transformPokemonData = (pokemonData, speciesData = null) => {
  return {
    name: pokemonData.name,
    id: pokemonData.id,
    sprites: {
      official: pokemonData.sprites.other['official-artwork'].front_default,
      default: pokemonData.sprites.front_default,
      shiny: pokemonData.sprites.front_shiny
    },
    types: pokemonData.types.map(t => t.type.name),
    abilities: pokemonData.abilities.map(a => ({
      name: a.ability.name,
      hidden: a.is_hidden
    })),
    stats: pokemonData.stats.map(s => ({
      name: s.stat.name,
      value: s.base_stat
    })),
    height: pokemonData.height,
    weight: pokemonData.weight,
    baseExperience: pokemonData.base_experience,
    moves: pokemonData.moves.slice(0, 5).map(m => m.move.name),
    // Get English description and clean up formatting characters
    flavorText: speciesData?.flavor_text_entries
      ?.find(entry => entry.language.name === 'en')
      ?.flavor_text.replace(/\f/g, ' ') || null
  };
};

// Check if cache entry is still valid
const getCachedData = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
};

// Store data in cache with TTL
const setCachedData = (key, value) => {
  // Remove oldest entry if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  cache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL
  });
};

const app = express();

app.use(express.json());

// Main Pokemon API endpoint
app.get('/api/pokemon/:name', async (req, res) => {
  try {
    const pokemonName = req.params.name.toLowerCase().trim();

    if (!pokemonName || pokemonName.length === 0) {
      return res.status(400).json({
        error: 'Pokemon name is required',
        cached: false
      });
    }

    // Check if we have this pokemon cached before hitting the API
    const cachedData = getCachedData(pokemonName);
    if (cachedData) {
      console.log(`Cache HIT for: ${pokemonName}`);
      return res.json({
        ...cachedData,
        cached: true
      });
    }

    console.log(`Cache MISS for: ${pokemonName}`);

    // Fetch from PokeAPI
    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    if (!pokemonResponse.ok) {
      if (pokemonResponse.status === 404) {
        return res.status(404).json({
          error: `Pokemon '${pokemonName}' not found`,
          cached: false
        });
      }
      throw new Error(`PokeAPI error: ${pokemonResponse.status}`);
    }

    const pokemonData = await pokemonResponse.json();

    // Try to fetch species data for flavor text
    let speciesData = null;
    try {
      const speciesResponse = await fetch(pokemonData.species.url);
      if (speciesResponse.ok) {
        speciesData = await speciesResponse.json();
      }
    } catch (speciesError) {
      console.warn(`Could not fetch species data: ${speciesError.message}`);
    }

    const transformedData = transformPokemonData(pokemonData, speciesData);
    setCachedData(pokemonName, transformedData);

    res.json({
      ...transformedData,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching Pokemon:', error);

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Unable to reach Pokemon API. Please try again later.',
        cached: false
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      cached: false
    });
  }
});

// Cache stats endpoint
app.get('/api/cache/stats', (req, res) => {
  res.json({
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: `${CACHE_TTL / 1000} seconds`
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
