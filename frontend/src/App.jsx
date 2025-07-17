import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favourites from './pages/Favourites'
import {Toaster} from 'react-hot-toast'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShow from './pages/admin/ListShow'
import ListBookings from './pages/admin/ListBookings'
import Layout from './pages/admin/Layout'
import './index.css'; // or whatever your global file is called
import { useAppContext } from '../context/AppContext'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading'


const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const {user} = useAppContext()

  return (
    <>
    <Toaster/>
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/movies' element={<Movies/>}/>
        <Route path='/movies/:id' element={<MovieDetails/>}/>
        <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
        <Route path='/my-bookings' element={<MyBookings/>}/>
        <Route path='/loading/:nextUrl' element={<Loading/>}/>
        <Route path='/favourites' element={<Favourites/>}/> 
        <Route path='/admin/*' element={user ?<Layout/> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )}>
          <Route index element={<Dashboard/>}/>
          <Route path='add-shows' element={<AddShows/>}/>
          <Route path='list-shows' element={<ListShow/>}/>
          <Route path='list-bookings' element={<ListBookings/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App
