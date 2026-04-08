import React from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
} from "react-icons/fa6";

const logo = "/logo.png";

const ThankYou = () => {
    return (
        <div className="bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] px-4 py-12 md:px-6 md:py-16">
            <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
                <div className="w-full rounded-[32px] border border-[#d9e6ff] bg-white px-6 py-10 text-center shadow-[0_24px_60px_rgba(37,99,235,0.08)] md:px-10 md:py-14">
                    <div className="mx-auto inline-flex items-center rounded-full border border-[#d7e2f7] bg-[#f8fbff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3868B2]">
                        Submission Received
                    </div>

                    <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-[#1c2434] md:text-5xl">
                        Thank You
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#49566f] md:text-[1.35rem]">
                        The form was submitted successfully.
                    </p>

                    <a href="/" className="mt-8 inline-flex justify-center">
                        <img src={logo} alt="Easy Homes Logo" className="w-[220px] max-w-full md:w-[280px]" />
                    </a>

                    <p className="mt-8 text-base font-semibold uppercase tracking-[0.08em] text-[#1f2c42] md:text-lg">
                        Our team will get back to you soon
                    </p>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#5f6f8d] md:text-base">
                        Follow us on social media
                    </p>

                    <div className="mt-6 flex justify-center gap-4">
                        <a
                            href="https://m.facebook.com/894019353792727/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d7e2f7] bg-[#f8fbff] text-[#3868B2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#234f95]"
                        >
                            <FaFacebookF />
                        </a>
                        <a
                            href="https://www.instagram.com/easyhomesofficial/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d7e2f7] bg-[#f8fbff] text-[#3868B2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#234f95]"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://www.youtube.com/@easyhomes8"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d7e2f7] bg-[#f8fbff] text-[#3868B2] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#234f95]"
                        >
                            <FaYoutube />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
