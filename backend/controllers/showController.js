import axios from "axios"
import Movie from "../models/Movie.js"
import Show from "../models/Show.js"
import {inngest}  from '../inngest/index.js';


//API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })

        const movies = data.results
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to add a new show to database
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body

        let movie = await Movie.findById(movieId)

        if (!movie) {
            // Fetch movie details and credits from TMDB database
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([

                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`,
                    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }),

                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })

            ])

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                poster_path: movieApiData.poster_path,
                overview: movieApiData.overview,
                release_date: movieApiData.release_date,
                runtime: movieApiData.runtime,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                backdrop_path: movieApiData.backdrop_path,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
            }

            //    Add movie to database
            movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];

        showsInput.forEach(show => {
            const showDate = show.date;
            const time = show.time;

            const dateTimeString = `${showDate}T${time}`;
            showsToCreate.push({
                movie: movieId,
                showDateTime: new Date(dateTimeString),
                showPrice,
                occupiedSeats: {}
            });
        });


        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate)
        }

        // Trigger Inngest event
        await inngest.send({
            name: "app/show.added",
            data: {movieTitle: movie.title}
        })

        res.json({ success: true, message: 'Show Added Successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all shows from the database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 })

        // Filter Unique Shows
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({ success: true, shows: Array.from(uniqueShows) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to get single Show from Database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params

        //Get all Upcoming Shows for the movie
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } })

        const movie = await Movie.findById(movieId)
        const dateTime = {}

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })

        res.json({ success: true, movie, dateTime })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


