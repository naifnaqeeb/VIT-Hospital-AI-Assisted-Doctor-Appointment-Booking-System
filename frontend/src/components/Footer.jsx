import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">

        {/* {Left.....} */}
        <div>
          <img className="mb-5 w-40" src={assets.logo3} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Non quasi
            quod reprehenderit sapiente eveniet, hic dignissimos saepe vero
            doloribus voluptas, nesciunt officiis obcaecati dolores, nemo
            facilis officia aut nostrum quas.
          </p>
        </div>

        {/* {Center........} */}
        <div>
            <p className="test-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-2 text-gray-600">
                <li>Home</li>
                <li>About us</li>
                <li>Contact us</li>
                <li>Private Policy</li>
            </ul>
        </div>

        {/*Right......*/}
        <div>
            <p className="test-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-2 text-gray-600">
                <li>+91-1234567890</li>
                <li>vithospital@gmail.com</li>
            </ul>
        </div>

      </div>

      {/* {Comment text} */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2026@ VITHospital - All Right Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
