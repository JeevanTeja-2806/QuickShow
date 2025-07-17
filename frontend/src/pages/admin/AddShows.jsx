import React, { useEffect, useState } from 'react'
import { CheckIcon, DeleteIcon, Loader, StarIcon } from 'lucide-react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { kConverter } from '../../lib/kConverter'
import { useAppContext } from '../../../context/AppContext'
import toast from 'react-hot-toast'

const AddShows = () => {

  const { axios, getToken, user, image_base_url } = useAppContext()

  const currency = import.meta.env.VITE_CURRENCY

  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState("")
  const [showPrice, setShowPrice] = useState("")
  const [addingShow, setAddingShow] = useState(false)

 const fetchNowPlayingMovies = async () => {
  try {
    const { data } = await axios.get('/api/show/now-playing', {
      headers: { Authorization: `Bearer ${await getToken()}` }
    });
    console.log('Fetched movies from API:', data.movies);

    if (data.success) {
      setNowPlayingMovies(
        data.movies
          .filter(m => m && m.id)
          .map((m) => ({
            ...m,
            _id: String(m.id)
          }))
      );
    }
  } catch (error) {
    console.error('Error fetching Movies: ', error);
  }
};


  const handleDateTimeAdd = () => {
    console.log("dateTimeInput raw value:", dateTimeInput)

    if (!dateTimeInput) {
      toast.error("Input is empty!")
      return
    }

    const [date, time] = dateTimeInput.split("T")
    console.log("Parsed date:", date, "Parsed time:", time)

    if (!date || !time) {
      toast.error("Invalid date-time format!")
      return
    }

    setDateTimeSelection((prev) => {
      const times = prev[date] || []
      const updated = !times.includes(time)
        ? { ...prev, [date]: [...times, time] }
        : prev

      console.log("Updated dateTimeSelection:", updated)
      return updated
    })

    setDateTimeInput("")
  }

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time)
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [date]: filteredTimes }
    })
  }

  const handleSubmit = async () => {
    try {
      setAddingShow(true)

      console.log("selectedMovie:", selectedMovie)
      console.log("dateTimeSelection:", dateTimeSelection)
      console.log("showPrice:", showPrice)

      const showsInput = Object.entries(dateTimeSelection)
        .flatMap(([date, times]) =>
          times.map(time => ({ date, time }))
        )

      console.log("Built showsInput:", showsInput)

      if (
        !selectedMovie ||
        showsInput.length === 0 ||
        isNaN(Number(showPrice)) ||
        Number(showPrice) <= 0
      ) {
        setAddingShow(false)
        toast.error('Missing required fields')
        return
      }

      const payLoad = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice)
      }

      console.log("Final Payload to Submit:", payLoad)

      const { data } = await axios.post('/api/show/add', payLoad, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success(data.message)
        setSelectedMovie(null)
        setDateTimeSelection({})
        setShowPrice("")
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error("Submission error: ", error)
      toast.error("An error occurred. Please try again")
    }

    setAddingShow(false)
  }

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies()
    }
  }, [user])

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 text-lg font-medium'>Now Playing Movies</p>
      <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
          {nowPlayingMovies
            .filter(movie => movie && movie._id)
            .map((movie) => (
              <div
                key={String(movie._id)}
                className='relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300'
                onClick={() =>
                  setSelectedMovie((prev) =>
                    prev === String(movie._id) ? null : String(movie._id)
                  )
                }
              >
                <div className='relative rounded-lg overflow-hidden'>
                  <img
                    src={image_base_url + movie.poster_path}
                    alt=""
                    className='w-full object-cover brightness-90'
                  />
                  <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                    <p className='flex items-center gap-1 text-gray-400 '>
                      <StarIcon className='w-4 h-4 text-red-400 fill-red-400' />
                      {movie.vote_average?.toFixed(1)}
                    </p>
                    <p className='text-gray-300'>
                      {kConverter(movie.vote_count)} Votes
                    </p>
                  </div>
                </div>
                {selectedMovie === String(movie._id) && (
                  <div className='absolute top-2 right-2 flex items-center justify-center bg-red-400 h-6 w-6 rounded'>
                    <CheckIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                  </div>
                )}
                <p className='font-medium truncate'>{movie.title}</p>
                <p className='text-gray-400 text-sm'>{movie.release_date}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Show Price Input */}
      <div className='mt-8'>
        <label className='block text-sm font-medium mb-2'>Show Price</label>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
          <p className='text-gray-400 text-sm'>{currency}</p>
          <input
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder='Enter Show Price'
            className='outline-none'
          />
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className='mt-6'>
        <label className='block text-sm font-medium mb-2'>Select Date & Time</label>
        <div className='flex items-center gap-4'>
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className='w-64 border border-gray-400 px-3 py-2 outline-none rounded-md'
          />
          <button
            onClick={handleDateTimeAdd}
            className='bg-red-400/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-red-400 cursor-pointer'
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display Selected Time */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6'>
          <h2>Selected Date-Time</h2>
          <ul className='space-y-3'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className='font-medium'>{date}</div>
                <div className='flex flex-wrap gap-2 text-sm mt-1'>
                  {times.map((time) => (
                    <div
                      key={time}
                      className='border border-red-400 px-2 py-1 flex items-center rounded'
                    >
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className='ml-2 text-red-500 hover:text-red-700 cursor-pointer'
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className='bg-red-400 text-white px-8 py-2 mt-6 rounded hover:bg-red-400/90 transition-all cursor-pointer'
      >
        {addingShow ? "Adding..." : "Add Show"}
      </button>
    </>
  ) : <Loading />
}

export default AddShows
