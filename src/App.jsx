import React, { useState, useEffect } from 'react';
// No se importa App.css porque todas las clases de estilo se aplican directamente en el JSX.

// Componente principal de la aplicación
const App = () => {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para los datos del Pokémon encontrado
  const [pokemonData, setPokemonData] = useState(null);
  // Estado para controlar el estado de carga
  const [isLoading, setIsLoading] = useState(false);
  // Estado para manejar mensajes de error
  const [error, setError] = useState(null);
  // Estado para saber si ya se ha realizado una búsqueda (para el mensaje inicial)
  const [hasSearched, setHasSearched] = useState(false);

  // useEffect se ejecuta cada vez que 'searchTerm' cambia
  useEffect(() => {
    // Función asíncrona para buscar el Pokémon
    const fetchPokemon = async () => {
      // Limpiar errores y datos de Pokémon anteriores
      setError(null);
      setPokemonData(null);
      setHasSearched(true); // Una búsqueda ha sido iniciada

      // Si el término de búsqueda está vacío, no hacer nada más que resetear el estado
      if (searchTerm.trim() === '') {
        setIsLoading(false);
        setHasSearched(false); // No se considera una búsqueda si el término está vacío
        return;
      }

      setIsLoading(true); // Indicar que la carga ha comenzado
      try {
        // Realizar la petición a la PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);

        // Si la respuesta no es OK (ej. 404 Not Found)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Pokémon no encontrado. Intenta con otro nombre.');
          } else {
            setError('Error al buscar el Pokémon. Por favor, inténtalo de nuevo más tarde.');
          }
          setIsLoading(false); // La carga ha terminado con error
          return;
        }

        // Parsear la respuesta JSON
        const data = await response.json();
        setPokemonData(data); // Almacenar los datos del Pokémon
      } catch (err) {
        // Capturar errores de red o cualquier otro error
        setError('Error de conexión. Asegúrate de estar conectado a internet.');
        console.error('Error al buscar Pokémon:', err);
      } finally {
        setIsLoading(false); // La carga ha terminado
      }
    };

    // Llamar a la función de búsqueda con un pequeño retraso (debounce)
    // Esto evita peticiones excesivas mientras el usuario escribe
    const debounceTimeout = setTimeout(() => {
      fetchPokemon();
    }, 300);

    // Función de limpieza para cancelar el timeout si el componente se desmonta o searchTerm cambia
    // Esto asegura que solo se ejecute la última búsqueda iniciada
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]); // La dependencia es 'searchTerm', por lo que se ejecuta con cada cambio

  // Manejador para el cambio en el input
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value); // Actualizar el término de búsqueda
  };

  return (
    // Contenedor principal con estilo de fondo degradado y centrado (clases de Tailwind)
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center p-4 font-inter">
      {/* Contenedor de la tarjeta de búsqueda (clases de Tailwind) */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        {/* Título de la aplicación */}
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Buscador de Pokémon
        </h1>

        {/* Campo de entrada para el término de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Introduce el nombre de un Pokémon..."
            className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 placeholder-gray-500"
          />
        </div>

        {/* Mensaje de bienvenida/instrucción inicial */}
        {!searchTerm && !pokemonData && !isLoading && !error && !hasSearched && (
          <div className="text-center py-8 text-gray-600">
            <p className="text-2xl font-semibold">¡Bienvenido al Buscador de Pokémon!</p>
            <p className="text-xl mt-2">Introduce un nombre de Pokémon para empezar.</p>
          </div>
        )}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-lg font-medium">Buscando Pokémon...</p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6" role="alert">
            <p className="font-bold text-xl mb-1">¡Oh no!</p>
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Mostrar resultados del Pokémon encontrado */}
        {pokemonData && !isLoading && !error && (
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center shadow-lg transition-all duration-300 hover:shadow-xl">
            {/* Nombre del Pokémon */}
            <h2 className="text-3xl font-bold text-blue-800 capitalize mb-4">
              {pokemonData.name}
            </h2>
            {/* Imagen del Pokémon */}
            <img
              src={pokemonData.sprites.front_default || 'https://placehold.co/200x200/cccccc/333333?text=No+Image'}
              alt={pokemonData.name}
              className="w-48 h-48 object-contain mb-4 rounded-xl shadow-md bg-white p-2"
              // Manejo de error si la imagen no carga
              onError={(e) => {
                e.target.onerror = null; // Evita bucle infinito si el fallback también falla
                e.target.src = 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
              }}
            />
            {/* Detalles del Pokémon */}
            <div className="text-lg text-gray-700 w-full text-center">
              <p className="mb-1">
                <span className="font-semibold">ID:</span> {pokemonData.id}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Altura:</span> {pokemonData.height / 10} m
              </p>
              <p className="mb-1">
                <span className="font-semibold">Peso:</span> {pokemonData.weight / 10} kg
              </p>
              <p className="mb-1">
                <span className="font-semibold">Tipos:</span>{' '}
                {pokemonData.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className="inline-block bg-blue-200 text-blue-800 text-sm font-semibold mr-2 px-3 py-1 rounded-full capitalize"
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
