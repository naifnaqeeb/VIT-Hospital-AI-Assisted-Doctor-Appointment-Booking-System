// import React from "react";
// import { specialityData } from "../assets/assets";
// import { Link } from "react-router-dom";

// const SpecialityMenu = () => {
//   return (
//     <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id="speciality">
//       <h1 className="text-3xl font-medium">Find by Speciality</h1>
//       <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
//       <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
//         {specialityData.map((item,index)=>(
//             <Link onClick={()=>scrollTo(0,0)} className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500" key={index} to={`/doctors/${item.speciality}`}>
//                 <img className="w-16 sm:w-24 mb-2" src={item.image} alt="" />
//                 <p>{item.speciality}</p>
//             </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SpecialityMenu;


import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <section
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-white to-blue-50"
      id="speciality"
    >
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #003580 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-3">

        {/* Section badge */}
        <div className="flex items-center gap-2 bg-[#003580]/10 border border-[#003580]/20 rounded-full px-4 py-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-pulse inline-block" />
          <span className="text-[#003580] text-[11px] tracking-[2.5px] uppercase font-bold">
            Our Medical Departments
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#003580] text-center tracking-tight">
          Find by Speciality
        </h1>

        {/* Gold underline */}
        <div className="w-16 h-1 bg-yellow-400 rounded-full mb-1" />

        {/* Subtext */}
        <p className="text-gray-500 text-sm text-center max-w-sm leading-relaxed">
          Browse our expert departments at VIT Hospital Central and book your
          appointment hassle-free.
        </p>

        {/* Speciality cards — same map logic as original */}
        <div className="flex sm:justify-center gap-5 pt-8 w-full overflow-x-auto pb-4">
          {specialityData.map((item, index) => (
            <Link
              onClick={() => scrollTo(0, 0)}
              className="flex flex-col items-center flex-shrink-0 w-28 sm:w-32 group cursor-pointer"
              key={index}
              to={`/doctors/${item.speciality}`}
            >
              {/* Icon card with white bg, border, shadow */}
              <div className="
                w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white
                border-2 border-[#003580]/10
                flex items-center justify-center p-3
                shadow-md group-hover:shadow-xl
                group-hover:-translate-y-2 group-hover:border-[#003580]/30
                group-hover:ring-4 ring-yellow-400/30
                transition-all duration-300
              ">
                {/* item.image used exactly like before */}
                <img
                  className="w-full h-full object-contain"
                  src={item.image}
                  alt={item.speciality}
                />
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <p className="text-[#003580] text-xs font-bold tracking-wide leading-tight group-hover:text-yellow-500 transition-colors duration-200">
                  {item.speciality}
                </p>
                {/* Animated underline on hover */}
                <div className="w-0 group-hover:w-full h-0.5 bg-yellow-400 rounded-full mt-1.5 transition-all duration-300 mx-auto" />
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll hint */}
        <p className="text-gray-400 text-[11px] tracking-wider mt-2 uppercase">
          Scroll to explore all departments →
        </p>
      </div>
    </section>
  );
};

export default SpecialityMenu;