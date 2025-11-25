const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const LRUCache = require('./cache');
const { transformPokemonData } = require('./utils/transform');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cache to store up to 100 pokemon for 10 minutes each
const pokemonCache = new LRUCache(100, 10 * 60 * 1000);


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


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
    const cachedData = pokemonCache.get(pokemonName);
    if (cachedData) {
      console.log(`Cache HIT for: ${pokemonName}`);
      return res.json({
        ...cachedData,
        cached: true
      });
    }

    console.log(`Cache MISS for: ${pokemonName}`);

  
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

    
    pokemonCache.set(pokemonName, transformedData);

   
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


app.get('/api/cache/stats', (req, res) => {
  res.json({
    size: pokemonCache.size(),
    maxSize: pokemonCache.maxSize,
    ttl: `${pokemonCache.ttl / 1000} seconds`
  });
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.listen(PORT, () => {
  console.log(` Pokemon API server running on http://localhost:${PORT}`);
  console.log(` Cache initialized: ${pokemonCache.maxSize} max entries, ${pokemonCache.ttl / 1000}s TTL`);
});
