// Extract only the fields we need from the PokeAPI response to reduce payload size
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

module.exports = { transformPokemonData };
