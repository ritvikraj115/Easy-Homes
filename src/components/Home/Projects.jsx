// import React from 'react';
// import { mockProperties } from '../../data/mockdata';
// import PropertyCard from '../PropertyCard';

// const Projects = () => {
//   const projects = mockProperties



//   return (
//     <section id="projects" className="py-20 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 font-['Poppins']">
//             Explore Approved Projects
//           </h2>
//           <p className="text-xl text-gray-600 font-['Inter'] max-w-3xl mx-auto">
//             All CRDA-approved layouts—organized, verified, and ready to explore
//           </p>

//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {projects.map((project) => (
//             <PropertyCard key={project.mlsNumber} property={project} />
//           ))}
//         </div>

//         <div className="text-center mt-12 space-y-4">
//           <button className="bg-white border-2 border-[#3868B2] text-[#3868B2] hover:bg-[#3868B2] hover:text-white px-8 py-3 rounded-lg font-medium font-['Poppins'] transition-all duration-200 mr-4">
//             Explore Projects in Maps
//           </button>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Projects;
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockProperties } from '../../data/mockdata';
import PropertyCard from '../PropertyCard';
import FilterPanel from '../FilterPanel';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    radius: 5,
    budget: [0, 50],
    type: 'Plot',
    size: [100, 500],
    gated: false,
  });


  const [filteredProjects, setFilteredProjects] = useState(mockProperties);


  useEffect(() => {
    const applyFilters = () => {
      let filtered = mockProperties.filter(property => {
        const priceMatch = property.priceRange.match(/₹(\d+)–(\d+)/);
        if (priceMatch) {
          const minPrice = parseInt(priceMatch[1]);
          const maxPrice = parseInt(priceMatch[2]);
          if (maxPrice > filters.budget[1]) return false;
        }

        if (filters.type !== 'Plot' && !property.propertyType.toLowerCase().includes(filters.type.toLowerCase())) {
          return false;
        }

        const areaMatch = property.areaRange.match(/(\d+)–(\d+)/);
        if (areaMatch) {
          const minArea = parseInt(areaMatch[1]);
          const maxArea = parseInt(areaMatch[2]);
          if (maxArea > filters.size[1] || minArea < filters.size[0]) return false;
        }

        if (filters.gated) {
          const hasGatedFeature = property.keyFeatures.some(feature =>
            feature.toLowerCase().includes('gated') ||
            feature.toLowerCase().includes('security') ||
            feature.toLowerCase().includes('community')
          );
          if (!hasGatedFeature) return false;
        }

        return true;
      });

      setFilteredProjects(filtered);
      setCurrentIndex(0);
    };

    applyFilters();
  }, [filters]);

  const getCardsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg screens
      if (window.innerWidth >= 768) return 2;  // md screens
      return 1; // sm screens
    }
    return 3;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use filtered projects for carousel calculations
  const maxIndex = Math.max(0, filteredProjects.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 font-['Poppins']">
            Explore Approved Projects
          </h2>
          <p className="text-xl text-gray-600 font-['Inter'] max-w-3xl mx-auto">
            All CRDA-approved layouts—organized, verified, and ready to explore
          </p>
        </div>

        <div className='w-full py-2 rounded-3xl'>
          <FilterPanel filters={filters} onChange={setFilters} horizontal />
        </div>


        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 font-['Inter']">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -ml-6"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-6 h-6 text-[#3868B2]" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -mr-6"
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="w-6 h-6 text-[#3868B2]" />
              </button>

              {/* Carousel Track */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                  }}
                >
                  {filteredProjects.map((project) => (
                    <div
                      key={project.mlsNumber}
                      className="flex-shrink-0 px-4"
                      style={{ width: `${100 / cardsPerView}%` }}
                    >
                      <PropertyCard property={project} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentIndex
                        ? 'bg-[#3868B2]'
                        : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="text-center mt-12 space-y-4">
          <Link to="/searchProperties">
            <button
              className="bg-white border-2 border-[#3868B2] text-[#3868B2]
               hover:bg-[#3868B2] hover:text-white
               px-8 py-3 rounded-lg font-medium font-['Poppins']
               transition-all duration-200 mr-4"
            >
              Explore Projects in Maps
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;
