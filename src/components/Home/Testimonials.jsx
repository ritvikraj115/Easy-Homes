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

        <div className='mt-12'>
                {/* <!-- Elfsight Google Reviews | Untitled Google Reviews --> */}
                <script src="https://elfsightcdn.com/platform.js" async></script>
                <div class="elfsight-app-60cbc103-358f-491e-9cd9-e210af3e21a9" data-elfsight-app-lazy></div>
                </div>
      </div>
    </section>
  );
}
