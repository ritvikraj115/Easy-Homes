import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import CallToAction from "../components/Home/CallToAction";

const contactMethods = [
  {
    title: "Call",
    value: "+91 8988896666",
    description: "Best for quick questions and follow-up.",
    href: "tel:+918988896666",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    title: "Email",
    value: "contact@easyhomess.com",
    description: "Useful for detailed requirements and documentation queries.",
    href: "mailto:contact@easyhomess.com",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    title: "Office",
    value: "4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225",
    description: "Visit the office for in-person discussion and planning.",
    href: "https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu",
    icon: <MapPin className="h-5 w-5" />,
    external: true,
  },
];

const supportPoints = [
  "Project details and availability",
  "Site visit planning",
  "General property guidance",
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Easy Homes</title>
        <meta
          name="description"
          content="Contact Easy Homes for project details, site visit planning, and property guidance in Vijayawada and Amaravati."
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href="https://easyhomess.com/contact" />
      </Helmet>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7faff_0%,#eef4fb_44%,#fbfdff_100%)] py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,104,178,0.1),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(148,184,234,0.16),transparent_24%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#d8e5f7] bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3868B2] shadow-sm">
              Contact Easy Homes
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#172133] md:text-5xl">
              Get in touch with the Easy Homes team
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5a667c]">
              If you need project information, help planning a site visit, or want to discuss your requirement, you can reach us directly by phone, email, or the enquiry form below.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="rounded-[32px] border border-[#dce8f8] bg-white/88 p-6 shadow-[0_22px_55px_rgba(37,99,235,0.08)] backdrop-blur-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3868B2]">
                Reach Us
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#18243a]">
                Clear contact options, without extra clutter
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5b677f]">
                We keep this page simple so you can reach the right team quickly. For urgent questions, calling is the fastest option. For more detailed requirements, email or the form below works well.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {supportPoints.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#d7e3f6] bg-[#f6faff] px-4 py-2 text-sm text-[#4d5a73]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {contactMethods.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 rounded-[24px] border border-[#e2ebf9] bg-[#fbfdff] px-5 py-5 transition-all duration-200 hover:border-[#c9d9f3] hover:bg-white"
                  >
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#3868B2]">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3868B2]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-base font-semibold leading-7 text-[#1d2738]">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#617089]">
                        {item.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-[#dce8f8] bg-white/90 shadow-[0_22px_55px_rgba(37,99,235,0.08)]">
              <div className="border-b border-[#e3ecfa] px-6 py-5 md:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3868B2]">
                  Office Location
                </p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#18243a]">
                    Visit the Easy Homes office
                  </h2>
                  <a
                    href="https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3868B2] transition-colors duration-200 hover:text-[#2d5798]"
                  >
                    Open in Google Maps
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <iframe
                  title="Easy Homes Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15297.806891133698!2d80.56864385236149!3d16.55375480291117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efa10202d185%3A0x6a994082397967aa!2sEasy%20Homes!5e0!3m2!1sen!2sin!4v1766740166376!5m2!1sen!2sin"
                  width="100%"
                  height="420"
                  style={{ border: 0, borderRadius: "1.5rem" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
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
