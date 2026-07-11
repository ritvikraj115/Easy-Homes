import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThankYou from "../components/ThankYouPage/ThankYouPage";
import Footer from "../components/Home/Footer";
import Navbar from "../components/Navbar";

const REDIRECT_DELAY_SECONDS = 15;
const REDIRECT_DELAY_MS = REDIRECT_DELAY_SECONDS * 1000;

const THANK_YOU_CONTENT = {
  "site-visit": {
    eyebrow: "Site Visit Request Confirmed",
    title: "Your Kalpavruksha site visit request has been received.",
    description:
      "Thank you for booking a free site visit. Our Easy Homes team will contact you shortly on call or WhatsApp to confirm your preferred date, time slot, and pickup details if selected.",
    points: [
      "We will verify your visit slot and share the next steps.",
      "If pickup was requested, our team will confirm the pickup address before the visit.",
      "You can inspect the layout, roads, amenities, location access, and available plots during the visit.",
    ],
    primaryAction: "Back to Kalpavruksha",
  },
  "brochure-map": {
    eyebrow: "Location & Project Details Request Received",
    title: "We will send the Kalpavruksha location and project details on WhatsApp.",
    description:
      "Thank you for sharing your details. Our team will send the location pin, master plan, project details, price details, and latest site-visit assistance on WhatsApp.",
    points: [
      "You will receive the location and project details on WhatsApp.",
      "Our team can also share current pricing, available plot options, and location guidance.",
      "For faster assistance, keep your phone reachable after submitting the form.",
    ],
    primaryAction: "Back to Kalpavruksha",
  },
};

const normalizeThankYouType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  if (
    normalized === "site-visit" ||
    normalized === "sitevisit" ||
    normalized === "book-site-visit" ||
    normalized === "book-visit" ||
    normalized === "visit"
  ) {
    return "site-visit";
  }

  if (
    normalized === "brochure-map" ||
    normalized === "brochure-and-map" ||
    normalized === "brochure-map-request" ||
    normalized === "brochure" ||
    normalized === "map"
  ) {
    return "brochure-map";
  }

  return "";
};

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const thankYouType = normalizeThankYouType(
    location.state?.thankYouType || searchParams.get("type") || searchParams.get("source"),
  );
  const content = THANK_YOU_CONTENT[thankYouType];
  const returnTo = location.state?.returnTo || "/kalpavruksha/";

  useEffect(() => {
    if (!content) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      navigate(returnTo, { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [content, navigate, returnTo]);

  if (!content) {
    return (
      <div>
        <Navbar />
        <ThankYou />
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="min-h-[72vh] bg-[linear-gradient(180deg,#fff7e8_0%,#f4e2c5_50%,#fffaf1_100%)] px-4 py-20 text-[#27382c]">
        <section className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-[#d6bd8f] bg-white/82 px-5 py-8 text-center shadow-[0_28px_80px_rgba(83,64,31,0.16)] backdrop-blur sm:px-8 md:px-10 md:py-11">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#52684a] text-3xl font-bold text-[#fff7e8] shadow-[0_16px_34px_rgba(82,104,74,0.22)]">
              ✓
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#b56f37]">
              {content.eyebrow}
            </p>

            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.02em] text-[#27382c] sm:text-3xl md:text-4xl">
              {content.title}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5f684f] sm:text-base">
              {content.description}
            </p>

            <div className="mt-7 grid gap-3 text-left">
              {content.points.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-[#d6bd8f]/70 bg-[#fff7e8] px-4 py-3 text-sm font-medium leading-6 text-[#52684a]"
                >
                  {point}
                </div>
              ))}
            </div>

            <div className="mx-auto mt-6 inline-flex rounded-full border border-[#d6bd8f] bg-[#fff7e8] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8b5526]">
              Redirecting back to Kalpavruksha in {REDIRECT_DELAY_SECONDS} seconds
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to={returnTo}
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-[#b56f37] px-6 text-sm font-bold text-[#fff7e8] shadow-[0_16px_34px_rgba(181,111,55,0.24)] transition hover:bg-[#9e5f2e]"
              >
                {content.primaryAction}
              </Link>
              <a
                href="tel:+918988896666"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-[#d6bd8f] bg-[#fff7e8] px-6 text-sm font-bold text-[#27382c] transition hover:border-[#b56f37] hover:bg-[#f4e6cc]"
              >
                Call Easy Homes
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYouPage;
