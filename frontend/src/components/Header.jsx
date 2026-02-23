// import React from "react";
// import { assets } from "../assets/assets";

// const Header = () => {
//   return (
//     <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20">
//       {/*Left Side.....*/}
//       <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
//         <p className="text-2xl md:text-4xl lg:text-4xl text-white font-bold leading-tight md:leading-tight lg:leading-tight">
//           Book Appointment <br /> With Trusted Doctors
//         </p>
//         <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
//           <img className="w-28" src={assets.group_profiles} alt="" />
//           <p>
//             Simply browse through our extensive list of trusted doctors,
//             schedule your appointment hassle-free.
//           </p>
//         </div>
//         <a
//           className="flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300"
//           href="#speciality"
//         >
//           Book Appointment{" "}
//           <img className="w-3" src={assets.arrow_icon} alt="" />
//         </a>
//       </div>

//       {/*Right Side.....*/}
//       <div className="md:w-1/2 relative">
//         <img
//           className="w-full md:absolute bottom-0 h-auto rounded-lg md:scale-110 md:origin-bottom"
//           src={assets.header2}
//           alt=""
//         />
//       </div>
//     </div>
//   );
// };

// export default Header;


import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#0055b3] to-[#0077cc] flex flex-col md:flex-row flex-wrap">

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003580] via-yellow-400 to-[#003580]" />

      {/* Background decorative circles */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white opacity-5" />
      <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white opacity-5" />

      {/* ── LEFT SIDE ── */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-5 py-12 px-8 md:px-12 lg:px-16 m-auto md:py-[8vw] md:mb-[-30px] relative z-10">

        

        {/* Headline */}
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            VIT Hospital
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-300 mt-1 leading-snug">
            Your Health, Our Priority
          </h2>
          <div className="w-14 h-1 bg-yellow-400 rounded-full mt-4" />
        </div>

        {/* Subtext with group profiles */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 max-w-md">
          <img
            className="w-24 rounded-full border-2 border-yellow-400/50 p-0.5 flex-shrink-0"
            src={assets.group_profiles}
            alt="Our Doctors"
          />
          <p className="text-white/80 text-sm leading-relaxed">
            Browse our team of experienced Indian medical specialists. Book
            your appointment at VIT Hospital Central — fast, trusted, and
            hassle-free.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8">
          {[
            { num: "80+", label: "Specialists" },
            { num: "1L+", label: "Patients" },
            { num: "24/7", label: "Emergency" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-yellow-300 text-xl font-bold leading-tight">{stat.num}</p>
              <p className="text-white/50 text-[10px] tracking-widest uppercase mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#003580] font-bold text-sm px-8 py-3.5 rounded-lg shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all duration-300 tracking-wide uppercase"
          href="#speciality"
        >
          Book Appointment
          <img className="w-3" src={assets.arrow_icon} alt="" style={{ filter: "brightness(0)" }} />
        </a>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="md:w-1/2 relative flex items-end justify-center min-h-[300px] md:min-h-0">

        {/* Glow behind doctor */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4/5 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        

        

        <img
          className="w-full md:absolute bottom-0 h-auto object-contain max-w-sm md:max-w-none drop-shadow-2xl"
          src={assets.header2}
          alt="VIT Hospital Doctor"
        />
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
    </div>
  );
};

export default Header;