import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            It is Sri Sakthi Amma’s divine vision which inspired the
            establishment of Sri Narayani Hospital & Research Centre. The
            institution is situated in Thirumalaikodi, a tiny hamlet about 9
            kilometres from Vellore.Its prime objective since inception is to
            provide quality medical service to the less privileged rural
            population,at a level on par with hospitals of metropolitan cities.
          </p>
          <p>
            Its primary health centre in the VIT, Vellore Campus provides round
            the clock primary (basic) health care services to all the students,
            staff and their dependents, faculty and their dependents and other
            employees working/residing at VIT Vellore Campus.
          </p>

          <p>
            The Primary health centre is located at Dr.A.L.Mudaliar Block within
            VIT, Vellore Campus. It has a reception, Pharmacy, 2 Out Patient
            consultation rooms (one male and one female), Emergency room with 3
            beds, Dressing/Suturing room situated at ground floor. 5 Specialist
            consultation rooms, 1 duty doctor room, 2 male & 2 female wards with
            20 In-patient beds, Physiotherapy room, Lab & X-Ray situated at
            first floor.
          </p>
        </div>
      </div>

      <div className="my-10">

  <p className="text-center text-2xl font-semibold text-gray-800 mb-10">
    List of Speciality Services
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-20 max-w-4xl mx-auto">

    <div className="flex flex-col gap-6">
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Anaesthesiology
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Cardiac Sciences
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        General Surgery
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        General Medicine
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Family Medicine
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Dermatology
      </div>
    </div>

    {/* Right column */}
    <div className="flex flex-col gap-6">
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Nephrology
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Oncology
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Radiology
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Vascular Surgery
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Paediatrics
      </div>
      <div className="bg-primary text-white px-10 py-4 font-medium">
        Cosmetology & Plastic Surgery
      </div>
    </div>

  </div>
</div>

    </div>
  );
};

export default About;
