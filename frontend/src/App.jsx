import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import { AppContext } from './context/AppContext'
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { token } = useContext(AppContext)
  const location = useLocation()

  // Hide widget on login page
  const hideWidget = location.pathname === '/login'

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-appointments' element={<MyAppointments />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <Footer />

      {/* VitCare AI Chat Widget — visible on all pages except login */}
      {!hideWidget && (
        <ChatWidget
          userToken={token}
          aiBackendUrl="http://localhost:8000/api/v1"
        />
      )}
    </div>
  )
}

export default App
