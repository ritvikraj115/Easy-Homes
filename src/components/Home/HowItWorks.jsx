import { Search, Eye, Save } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Search className="w-6 h-6 text-[#3868B2]" />,
    title: 'Explore Verified Projects',
    description: 'Browse CRDA-approved layouts through live photos, updated regularly by our team. Use our interactive map, filters, and project comparison tools to shortlist with precision.',
  },
  {
    number: '02',
    icon: <Eye className="w-6 h-6 text-[#3868B2]" />,
    title: 'Watch & Evaluate',
    description: 'View walkthrough videos of open plots and 360° tours for apartments and villas—so you can assess from anywhere.',
  },
  {
    number: '03',
    icon: <Save className="w-6 h-6 text-[#3868B2]" />,
    title: 'Save, Connect & Decide',
    description: 'Save favourites, compare projects, and contact the sales manager directly—or let Easy Homes assist you, with no commission and support from start to finish.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-poppins text-gray-900">How It Works</h2>
          <p className="text-gray-600 mt-2 font-inter">Discover, evaluate, and connect—everything you need to make confident property decisions, in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative text-center p-8 bg-white border-t-2 border-t-blue-500 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#3868B2] to-[#38689F] text-white font-semibold flex items-center justify-center text-sm font-poppins">
                {step.number}
              </div>

              <div className="w-16 h-16 bg-[#97B3D933] rounded-full flex items-center justify-center mx-auto mt-6 mb-6 transition-all duration-300 hover:scale-110">
                <div className="transition-colors duration-300 group-hover:text-white">{step.icon}</div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">{step.title}</h3>
              <p className="text-gray-500 font-inter leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
