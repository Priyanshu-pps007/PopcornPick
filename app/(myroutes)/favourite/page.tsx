'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Movie {
  id: number
  title: string
  poster_path?: string
}

const FavoritesPage = () => {
  const router = useRouter()
  const [favorites, setFavorites] = useState<number[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(
      localStorage.getItem('favorites') || '[]'
    )
    setFavorites(savedFavorites)
  }, [])

  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      try {
        const movieData: Movie[] = await Promise.all(
          favorites.map(async (id) => {
            const response = await axios.get(
              `https://api.themoviedb.org/3/movie/${id}`,
              {
                headers: {
                  Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjExNDI5MjRkMjQzZGZmY2VkNjNmM2JhMGExZWZjOSIsIm5iZiI6MTczOTAzMDE5NS4yMjQsInN1YiI6IjY3YTc3ZWIzMzEwMDFiZWMxM2M4YmEyOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ukcxiCijVMWQHgzgTc4LRl3t7Cw_MMISALEccTkWNnk',
                },
              }
            )
            return response.data
          })
        )
        setMovies(movieData)
      } catch (error) {
        console.error('Error fetching favorite movies:', error)
      } finally {
        setLoading(false)
      }
    }
    if (favorites.length > 0) {
      fetchFavoriteMovies()
    } else {
      setLoading(false)
    }
  }, [favorites])

  const handleFavoriteClick = (movieId: number) => {
    const updatedFavorites = favorites.filter((id) => id !== movieId)
    setFavorites(updatedFavorites)
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    // Update the movies displayed
    setMovies(movies.filter((movie) => movie.id !== movieId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <p className="text-center text-gray-500 mt-6 text-lg">
          Loading favorite movies...
        </p>
      </div>
    )
  }

  if (favorites.length === 0 || movies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <p className="text-center text-gray-500 mt-6 text-lg">
          No favorite movies yet.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Your Bucket list</h1>
      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="relative rounded-lg overflow-hidden shadow-md cursor-pointer"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
              className="w-full h-auto object-cover rounded-lg transition-transform transform hover:scale-105"
              alt={movie.title}
              onClick={() => router.push(`/${movie.id}`)}
            />
            {/* Heart Icon */}
            <button
              className="absolute top-2 right-2 text-white"
              onClick={() => handleFavoriteClick(movie.id)}
            >
              <svg
                className="w-6 h-6 text-red-500"
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
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesPage