import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({children}) => {

    const [isAdmin, setIsAdmin ]= useState(false)
    const [shows, setShows] = useState([])
    const [favouriteMovies, setFavouriteMovies] = useState([])

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

    const {user} = useUser()
    const {getToken} = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const fetchIsAdmin = async () => {
        try {

            const {data} = await axios.get('/api/admin/is-admin', {headers: {Authorization: `Bearer ${await getToken()}`}})

            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('You are not Authorized to access admin Dashboard')
            }

        } catch (error) {
            console.error(error)
        }
    }

    const fetchShows = async () => {
        try {
            const {data} = await axios.get('/api/show/all')
            if (data.success) {
                setShows(data.shows)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

   const fetchFavouriteMovies = async () => {
  try {
    const token = await getToken();

    const { data } = await axios.get('/api/user/favourites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ API Response:', data);

    if (data.success) {
      setFavouriteMovies(data.movies || []);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('❌ Failed to fetch favourites:', error);
    toast.error('Could not fetch favourites');
  }
};


    useEffect(() => {
        if (user) {
            fetchIsAdmin()
            fetchFavouriteMovies()
        }
    }, [user])

    useEffect(() => {
        fetchShows()
    }, [])

    const value = {
        axios,
        fetchIsAdmin,
        user,
        getToken,
        navigate,
        isAdmin,
        shows,
        favouriteMovies,
        fetchFavouriteMovies,
        image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider> 
    )
}

export const useAppContext = () => useContext(AppContext)