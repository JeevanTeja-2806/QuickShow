import Booking from "../models/Booking.js"
import {clerkClient} from "@clerk/express"
import Movie from '../models/Movie.js'


// API Controller Function to get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId

        const bookings = await Booking.find({user}).populate({
            path: 'show',
            populate: {path: "movie"}
        }).sort({createdAt : -1})

        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message})
    }
}

export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    let favourites = user.privateMetadata?.favourites || [];

    if (!favourites.includes(movieId)) {
      favourites.push(movieId);
    } else {
      favourites = favourites.filter(id => id !== movieId);
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { favourites }
    });

    res.json({ success: true, message: "Favourite movies Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



// API to get All Favourite Movies
export const getFavourites = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const user = await clerkClient.users.getUser(userId);

    // Get favourites array safely
    const favourites = user.privateMetadata?.favourites || [];

    console.log("🎯 Clerk favourites:", favourites);

    if (favourites.length === 0) {
      return res.json({ success: true, movies: [] });
    }

    // Fetch movie objects from DB
    const movies = await Movie.find({ _id: { $in: favourites } });

    console.log("🎬 Found movies:", movies);

    return res.json({ success: true, movies });
  } catch (error) {
    console.error("❌ Error in getFavourites:", error.message);
    return res.json({ success: false, message: error.message });
  }
};