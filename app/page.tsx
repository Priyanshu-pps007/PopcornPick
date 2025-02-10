'use client'
import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'

interface Movie {
  id: number
  title: string
  poster_path?: string
  genre_ids: number[]
  vote_average: number
}

interface Genre {
  id: number
  name: string
}

const HomePage = () => {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [inputValue, setInputValue] = useState('')

  const fetchGenres = async () => {
    try {
      const response = await axios.get(
        'https://api.themoviedb.org/3/genre/movie/list',
        {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjExNDI5MjRkMjQzZGZmY2VkNjNmM2JhMGExZWZjOSIsIm5iZiI6MTczOTAzMDE5NS4yMjQsInN1YiI6IjY3YTc3ZWIzMzEwMDFiZWMxM2M4YmEyOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ukcxiCijVMWQHgzgTc4LRl3t7Cw_MMISALEccTkWNnk',
          },
        }
      )
      setGenres(response.data.genres)
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const fetchMovies = async (
    search = '',
    pageNum = 1,
    genreId: number | null = null
  ) => {
    if (loading) return
    setLoading(true)

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/${search ? 'search' : 'discover'}/movie`,
        {
          params: {
            query: search,
            page: pageNum,
            with_genres: genreId || '',
          },
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjExNDI5MjRkMjQzZGZmY2VkNjNmM2JhMGExZWZjOSIsIm5iZiI6MTczOTAzMDE5NS4yMjQsInN1YiI6IjY3YTc3ZWIzMzEwMDFiZWMxM2M4YmEyOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ukcxiCijVMWQHgzgTc4LRl3t7Cw_MMISALEccTkWNnk',
          },
        }
      )

      if (pageNum === 1) {
        setMovies(response.data.results)
      } else {
        setMovies((prevMovies) => {
          // Filter out duplicates
          const newMovies = response.data.results.filter(
            (newMovie: Movie) =>
              !prevMovies.some((movie) => movie.id === newMovie.id)
          )
          return [...prevMovies, ...newMovies]
        })
      }

      setHasMore(response.data.page < response.data.total_pages)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch genres on component mount
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchMovies(searchTerm, 1, selectedGenre)
    setPage(1) // Reset page to 1 when search term or selected genre changes
  }, [searchTerm, selectedGenre])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => {
    if (page > 1) {
      fetchMovies(searchTerm, page, selectedGenre)
    }
  }, [page])

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(
      localStorage.getItem('favorites') || '[]'
    )
    setFavorites(savedFavorites)
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((searchText: string) => {
        setSearchTerm(searchText)
        setPage(1)
      }, 100),
    []
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value ? Number(e.target.value) : null)
    setPage(1)
  }

  const handleFavoriteClick = (movieId: number) => {
    let updatedFavorites: number[]
    if (favorites.includes(movieId)) {
      // Remove from favorites
      updatedFavorites = favorites.filter((id) => id !== movieId)
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, movieId]
    }
    setFavorites(updatedFavorites)
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-bold"
          style={{
            color: 'red',
          }}
        >
          PopkornPick
        </h1>
        <button
          onClick={() => router.push('/favourite')}
          className="flex items-center text-white hover:text-blue-500"
        >
          <span
            className="font-medium"
            style={{
              color: 'red',
              fontWeight: 'bolder',
            }}
          >
            Favourite
          </span>
        </button>
      </header>

      {/* Search Bar and Genre Filter */}
      <div className="max-w-xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Search movies..."
          onChange={handleInputChange}
          value={inputValue}
          className="w-full p-3 text-lg bg-gray-800 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative w-full sm:w-1/3">
          <select
            onChange={handleGenreChange}
            value={selectedGenre || ''}
            className="w-full appearance-none p-3 pr-10 text-lg bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
            style={{ marginRight: '5px' }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="relative rounded-lg overflow-hidden shadow-md cursor-pointer"
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                className="w-full h-auto object-cover rounded-lg transition-transform transform hover:scale-105"
                alt={movie.title}
                onClick={() => router.push(`/${movie.id}`)}
              />
            ) : (
              <div
                className="w-full h-auto object-cover rounded-lg bg-gray-700 flex items-center justify-center text-center p-4"
                onClick={() => router.push(`/${movie.id}`)}
              >
                No Image Available
              </div>
            )}
            {/* Rating */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
              {movie.vote_average.toFixed(1)} ⭐
            </div>
            {/* Heart Icon */}
            <button
              className="absolute top-2 right-2 text-white"
              onClick={() => handleFavoriteClick(movie.id)}
            >
              {favorites.includes(movie.id) ? (
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
              ) : (
                <svg
                  className="w-6 h-6 text-white"
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
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <p className="text-center text-gray-500 mt-6 text-lg">
          Loading more movies...
        </p>
      )}
    </div>
  )
}

export default HomePage