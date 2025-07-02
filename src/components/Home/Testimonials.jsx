import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Hyderabad',
    text: 'Easy Homes made our dream of owning land in Amaravati a reality. The entire process was transparent, and the team guided us at every step. Highly recommended!',
    image:
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    name: 'Priya Sharma',
    location: 'Vijayawada',
    text: 'Excellent service and genuine plots with clear titles. The location we chose has great potential for appreciation. Thank you Easy Homes for the professional approach.',
    image:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    name: 'Anil Reddy',
    location: 'Guntur',
    text: 'Best investment decision we made! The plot we purchased through Easy Homes has already shown good appreciation. Their after-sales support is also commendable.',
    image:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#DFE5EF]">
      <div className="container mx-auto px-4 md:!px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold font-poppins text-gray-900">What Buyers & Partners Say</h2>
          <p className="text-gray-600 mt-4 font-inter">
            Real feedback from those who’ve discovered, decided, and invested through Easy Homes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-t-8 border-t-[#3868B2] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#3868B2]"
            >
              <div className="mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3868B2] to-[#38689F] rounded-full flex items-center justify-center mb-4">
                  <Quote className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 font-inter italic leading-relaxed mb-4">{`"${testimonial.text}"`}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 font-poppins">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 font-inter">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
