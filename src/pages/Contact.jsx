import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import CallToAction from "../components/Home/CallToAction";

const officeAddress =
  "4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225";
const mapsUrl =
  "https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu";

const contactMethods = [
  {
    title: "Call us",
    value: "+91 8988896666",
    description: "For quick assistance, availability, and site visit coordination.",
    href: "tel:+918988896666",
    icon: Phone,
  },
  {
    title: "Email us",
    value: "contact@easyhomess.com",
    description: "For detailed requirements, brochures, and document sharing.",
    href: "mailto:contact@easyhomess.com",
    icon: Mail,
  },
  {
    title: "Visit the office",
    value: officeAddress,
    description: "A quick call before visiting helps us coordinate the right team member.",
    href: mapsUrl,
    icon: MapPin,
    external: true,
  },
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Easy Homes</title>
        <meta
          name="description"
          content="Contact Easy Homes for project information, brochure requests, site visit planning, and general property enquiries."
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href="https://easyhomess.com/contact" />
      </Helmet>

      <section className="bg-[#f6f8fc] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#dfe7f3] bg-white px-6 py-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:px-10 md:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3868B2]">
              Contact
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#172133] md:text-[3.6rem] md:leading-[1.02]">
              Contact <span className="text-[#3868B2]">Easy Homes</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#5e6b82]">
              Reach us for project details, brochure requests, site visit
              assistance, or general property enquiries.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#6a7890]">
              If your enquiry is urgent, calling is the fastest option. If you
              would like a callback, you can also use the enquiry form below.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="tel:+918988896666"
                className="inline-flex items-center justify-center rounded-full bg-[#3868B2] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#2f5898]"
              >
                Call Now
              </a>
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center rounded-full border border-[#d2deef] bg-white px-6 py-3 text-sm font-semibold text-[#264675] transition-colors duration-200 hover:border-[#c1d1e7] hover:bg-[#f8fbff]"
              >
                Send an Enquiry
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {contactMethods.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex h-full flex-col rounded-[28px] border border-[#dfe7f3] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition-colors duration-200 hover:border-[#cdd9eb]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3fb] text-[#3868B2]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#3868B2]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-xl font-semibold leading-8 text-[#172133]">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#697892]">
                    {item.description}
                  </p>
                </a>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden rounded-[32px] border border-[#dfe7f3] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-4 md:p-6">
                <iframe
                  title="Easy Homes Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15297.806891133698!2d80.56864385236149!3d16.55375480291117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efa10202d185%3A0x6a994082397967aa!2sEasy%20Homes!5e0!3m2!1sen!2sin!4v1766740166376!5m2!1sen!2sin"
                  width="100%"
                  height="360"
                  style={{ border: 0, borderRadius: "1.5rem" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>

              <div className="border-t border-[#e5edf7] px-6 py-8 lg:border-l lg:border-t-0 lg:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3868B2]">
                  Office Location
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172133]">
                  Visit Easy Homes
                </h2>
                <p className="mt-4 text-base leading-7 text-[#5f6d85]">
                  {officeAddress}
                </p>
                <p className="mt-4 text-sm leading-6 text-[#6d7b92]">
                  For in-person discussions, calling ahead helps us prepare the
                  right project details and assist you better.
                </p>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d2deef] px-5 py-3 text-sm font-semibold text-[#3868B2] transition-colors duration-200 hover:border-[#c1d1e7] hover:text-[#2d5798]"
                >
                  Open in Google Maps
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="contact-form">
        <CallToAction
          formName="contact_callback_form"
          placement="contact_page"
        />
      </div>
    </>
  );
}
