'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

interface Genre {
  id: number
  name: string
}

interface MovieDetail {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path?: string
  popularity: number
  release_date: string
  vote_average: number
  vote_count: number
  genres: Genre[]
}

const MovieDetailPage = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}`,
          {
            headers: {
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjExNDI5MjRkMjQzZGZmY2VkNjNmM2JhMGExZWZjOSIsIm5iZiI6MTczOTAzMDE5NS4yMjQsInN1YiI6IjY3YTc3ZWIzMzEwMDFiZWMxM2M4YmEyOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ukcxiCijVMWQHgzgTc4LRl3t7Cw_MMISALEccTkWNnk',
            },
          }
        )
        setMovie(response.data)
      } catch (error) {
        console.error('Error fetching movie details:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchMovie()
  }, [id])

  useEffect(() => {
    if (movie) {
      // Load favorites from localStorage
      const savedFavorites = JSON.parse(
        localStorage.getItem('favorites') || '[]'
      )
      setFavorites(savedFavorites)
      setIsFavorite(savedFavorites.includes(movie.id))
    }
  }, [movie])

  const handleFavoriteClick = () => {
    let updatedFavorites: number[]
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = favorites.filter((favoriteId) => favoriteId !== movie!.id)
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, movie!.id]
    }
    setFavorites(updatedFavorites)
    setIsFavorite(!isFavorite)
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10 text-lg">
        Loading movie details...
      </p>
    )
  if (!movie)
    return (
      <p className="text-center text-red-500 mt-10 text-lg">
        Movie not found.
      </p>
    )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-white">
      {/* Movie Title */}
      <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
      <h2 className="text-xl text-gray-400 italic mb-4">
        ({movie.original_title})
      </h2>

      {/* Movie Poster with Favorite Button */}
      <div className="relative mb-6">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg shadow-xl w-80 sm:w-96 md:w-[300px]"
          />
        ) : (
          <div
            className="w-80 sm:w-96 md:w-[300px] h-auto object-cover rounded-lg bg-gray-700 flex items-center justify-center text-center p-4"
          >
            No Image Available
          </div>
        )}
        {/* Heart Icon */}
        <button
          className="absolute top-2 right-2 text-white"
          onClick={handleFavoriteClick}
        >
          {isFavorite ? (
            <svg
              className="w-8 h-8 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4  
                  15.36 2 12.28 2 8.5 2  
                  5.42 4.42 3 7.5 3c1.74 0  
                  3.41 0.81 4.5 2.09C13.09  
                  3.81 14.76 3 16.5 3c3.08  
                  0 5.5 2.42 5.5 5.5 0 3.78-3.4  
                  6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 21.35l-1.45-1.32C5.4  
                  15.36 2 12.28 2 8.5 2  
                  5.42 4.42 3 7.5 3c1.74 0  
                  3.41 0.81 4.5 2.09C13.09  
                  3.81 14.76 3 16.5 3c3.08  
                  0 5.5 2.42 5.5 5.5 0 3.78-3.4  
                  6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Movie Details */}
      <div className="max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <p className="text-lg text-gray-300">{movie.overview}</p>

        {/* Genres */}
        <div className="mt-4">
          <p className="text-gray-400">Genres:</p>
          <div className="flex flex-wrap justify-center mt-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="bg-gray-700 px-3 py-1 m-1 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className="text-gray-400">📅 Release Date:</span>
            <p className="text-xl font-semibold">{movie.release_date}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className="text-gray-400">⭐ Vote Average:</span>
            <p className="text-xl font-semibold">
              {movie.vote_average} / 10
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className="text-gray-400">🔥 Popularity:</span>
            <p className="text-xl font-semibold">
              {Math.round(movie.popularity)}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <span className="text-gray-400">🗳️ Vote Count:</span>
            <p className="text-xl font-semibold">{movie.vote_count}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailPage