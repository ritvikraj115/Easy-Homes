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
