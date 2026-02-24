// import React, { useState } from 'react'
// import {assets} from '../assets/assets'
// import { NavLink, useNavigate } from 'react-router-dom'

// const Navbar = () => {

//     const navigate = useNavigate();

//     const {token,setToken} = useContext(AppContext)

//     const [showMenu,setShowMenu] = useState(false)

      //  const logout = () => {
      //   setToken(false)
      //   localStorage.removeItem('token')
      //  }

//   return (
//     <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
//       <img onClick={()=>navigate('/')} src={assets.logo3} alt="logo" className="w-20 h-auto cursor-pointer" />
//       <ul className='hidden md:flex items-start gap-5 font-medium'>
//         <NavLink to='/'>
//             <li className='py-1'>HOME</li>
//             <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
//         </NavLink>
//         <NavLink to='/doctors'>
//             <li className='py-1'>ALL DOCTORS</li>
//             <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
//         </NavLink>
//         <NavLink to='/about'>
//             <li className='py-1'>ABOUT</li>
//             <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
//         </NavLink>
//         <NavLink to='/contact'>
//             <li className='py-1'>CONTACT</li>
//             <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
//         </NavLink>
//       </ul>
//       <div className='flex items-center gap-4'>
//         {
//             token
//             ? <div className='flex items-center gap-2 cursor-pointer group relative'>
//                 <img className='w-8 rounded-full' src={assets.profile_pic} alt="" />
//                 <img className='w-2.5' src={assets.dropdown_icon} alt="" />
//                 <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
//                     <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
//                         <p onClick={()=>navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
//                         <p onClick={()=>navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
//                         <p onClick={logout()} className='hover:text-black cursor-pointer'>Logout</p>
//                     </div>
//                 </div>
//             </div>
//             : <button onClick={()=>navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create account</button>
//         }
//         <img onClick={()=>setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
//         {/* Mobile Menu...... */}
//         <div className={` ${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
//             <div className='flex items-center justify-between px-5 py-6'>
//                 <img className='w-36' src={assets.logo3} alt="" />
//                 <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
//             </div>
//             <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
//                 <NavLink onClick={()=>setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>Home</p></NavLink>
//                 <NavLink onClick={()=>setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded inline-block'>ALL DOCTORS</p></NavLink>
//                 <NavLink onClick={()=>setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded inline-block'>ABOUT</p></NavLink>
//                 <NavLink onClick={()=>setShowMenu(false)} to='contact'><p className='px-4 py-2 rounded inline-block'>CONTACT</p></NavLink>
//             </ul>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Navbar


import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()

  const {token,setToken} = useContext(AppContext)

  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

        const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
       }

  // Add scroll effect for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 bg-white border-b-2 border-[#003580] transition-shadow duration-300 ${scrolled ? 'shadow-lg shadow-blue-900/10' : ''}`}>
        <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-3">

          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={assets.logo3}
              alt="VIT Hospital Central"
              className="w-12 h-auto"
            />
            <div className="hidden sm:block leading-tight">
              <p className="text-[#003580] font-bold text-base tracking-tight">VIT Hospital</p>
              <p className="text-yellow-500 text-[10px] tracking-[2px] uppercase font-semibold">Vellore</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1 font-medium text-[13px]">
            {[
              { to: '/', label: 'Home' },
              { to: '/doctors', label: 'All Doctors' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <li
                    className={`px-4 py-2 rounded-md tracking-wide transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-[#003580] text-white'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#003580]'
                      }`}
                  >
                    {label.toUpperCase()}
                  </li>
                )}
              </NavLink>
            ))}
          </ul>

          {/* Right side: profile / login + hamburger */}
          <div className="flex items-center gap-3">
            {token ? (
              <div className="relative group flex items-center gap-2 cursor-pointer">
                {/* Profile avatar */}
                <div className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-[#003580]/20 rounded-full pl-1 pr-3 py-1 transition-all duration-200">
                  <img
                    className="w-8 h-8 rounded-full border-2 border-[#003580]/30 object-cover"
                    src={assets.profile_pic}
                    alt="Profile"
                  />
                  <span className="hidden sm:block text-[#003580] text-xs font-semibold tracking-wide">My Account</span>
                  <img
                    className="w-2.5 opacity-60"
                    src={assets.dropdown_icon}
                    alt=""
                  />
                </div>

                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-30">
                  <div className="min-w-52 bg-white rounded-xl shadow-xl shadow-blue-900/15 border border-blue-100 overflow-hidden">
                    {/* Dropdown header */}
                    <div className="bg-gradient-to-r from-[#003580] to-[#0055b3] px-4 py-3">
                      <p className="text-white text-xs font-bold tracking-wide uppercase">VIT Hospital Portal</p>
                    </div>
                    <div className="p-2 flex flex-col gap-0.5">
                      {[
                        { label: '👤  My Profile', action: () => navigate('/my-profile') },
                        { label: '📅  My Appointments', action: () => navigate('/my-appointments') },
                        { label: '🚪  Logout', action: () => logout() },
                      ].map(({ label, action }) => (
                        <p
                          key={label}
                          onClick={action}
                          className="px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#003580] rounded-lg cursor-pointer transition-all duration-150 font-medium"
                        >
                          {label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden md:flex items-center gap-2 bg-[#003580] hover:bg-[#0055b3] text-white text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-105"
              >
                Create Account
              </button>
            )}

            {/* Hamburger for mobile */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-blue-50 transition-colors"
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-[#003580] rounded" />
              <span className="block w-5 h-0.5 bg-[#003580] rounded" />
              <span className="block w-3.5 h-0.5 bg-yellow-500 rounded" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${showMenu ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setShowMenu(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showMenu ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer header */}
          <div className="bg-gradient-to-r from-[#003580] to-[#0055b3] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img className="w-10 h-auto" src={assets.logo3} alt="" />
              <div>
                <p className="text-white font-bold text-sm">VIT Hospital</p>
                <p className="text-yellow-300 text-[9px] tracking-[2px] uppercase">Vellore</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <img className="w-4" src={assets.cross_icon} alt="Close" />
            </button>
          </div>

          {/* Drawer links */}
          <ul className="flex flex-col gap-1 p-4 mt-2 flex-1">
            {[
              { to: '/', label: '🏠  Home' },
              { to: '/doctors', label: '🩺  All Doctors' },
              { to: '/about', label: 'ℹ️  About' },
              { to: '/contact', label: '📞  Contact' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setShowMenu(false)}>
                {({ isActive }) => (
                  <li
                    className={`px-5 py-3.5 rounded-xl text-sm font-semibold tracking-wide cursor-pointer transition-all duration-150
                      ${isActive
                        ? 'bg-[#003580] text-white shadow-md'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-[#003580]'
                      }`}
                  >
                    {label}
                  </li>
                )}
              </NavLink>
            ))}
          </ul>

          {/* Drawer footer */}
          <div className="p-4 border-t border-gray-100">
            {token ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <img className="w-10 h-10 rounded-full border-2 border-[#003580]/20 object-cover" src={assets.profile_pic} alt="" />
                <div>
                  <p className="text-[#003580] text-xs font-bold">My Account</p>
                  <p
                    onClick={() => { logout(); setShowMenu(false) }}
                    className="text-gray-400 text-[11px] cursor-pointer hover:text-red-500 transition-colors"
                  >
                    Tap to logout
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { navigate('/login'); setShowMenu(false) }}
                className="w-full bg-[#003580] text-white text-sm font-bold tracking-widest uppercase py-3 rounded-xl hover:bg-[#0055b3] transition-colors"
              >
                Create Account
              </button>
            )}
            <p className="text-center text-gray-300 text-[10px] tracking-wider mt-3 uppercase">
              Emergency: 0416-220-2020
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar