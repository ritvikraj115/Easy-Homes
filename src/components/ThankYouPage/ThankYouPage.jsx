import React from "react";
import "./ThankYouPage.css";
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaTwitter,
} from "react-icons/fa6";

const logo = "/logo.png";
const bgImage = "";

const ThankYou = () => {
    return (
        <div
            className="thankyou-container"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
            <h1>Thank You</h1>
            <p className="success-message">The form was submitted successfully</p>

            <a href="/">
                <img src={logo} alt="Ramee Logo" className="thankyou-logo" />
            </a>


            <p className="team-msg">OUR TEAM WILL GET BACK TO YOU SOON</p>
            <p className="follow-msg">FOLLOW US ON SOCIAL MEDIA</p>

            <div className="thankyou-social-icons">
                <a href="https://m.facebook.com/894019353792727/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebookF />
                </a>
                <a href="https://www.instagram.com/easyhomesofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                </a>
                <a href="https://www.youtube.com/@easyhomes8" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FaYoutube />
                </a>
                {/* <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin />
                </a> */}
            </div>
        </div>
    );
};

export default ThankYou;
