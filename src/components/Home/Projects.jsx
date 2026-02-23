import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterPanel from '../FilterPanel';
import PropCard from './propCard';
import useProperties from '../../hooks/useProperties';

const getRange = (value) => {
  const nums = String(value || '').match(/\d+/g);
  if (!nums || nums.length === 0) return null;

  const min = Number(nums[0]);
  const max = Number(nums[nums.length - 1]);
  return { min, max };
};

const Projects = () => {
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [filters, setFilters] = useState({
    radius: 5,
    budget: [0, 50],
    type: 'Plot',
    size: [100, 500],
    gated: false,
  });

  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const filtered = properties.filter((property) => {
      const price = getRange(property.priceRange);
      if (price && price.max > filters.budget[1]) {
        return false;
      }

      const type = String(property.propertyType || '').toLowerCase();
      if (filters.type !== 'Plot' && !type.includes(filters.type.toLowerCase())) {
        return false;
      }

      const area = getRange(property.areaRange);
      if (area && (area.max > filters.size[1] || area.min < filters.size[0])) {
        return false;
      }

      if (filters.gated) {
        const features = Array.isArray(property.keyFeatures) ? property.keyFeatures : [];
        const hasGatedFeature = features.some((feature) => {
          const item = String(feature || '').toLowerCase();
          return item.includes('gated') || item.includes('security') || item.includes('community');
        });

        if (!hasGatedFeature) {
          return false;
        }
      }

      return true;
    });

    setFilteredProjects(filtered);
    setCurrentIndex(0);
  }, [filters, properties]);

  const getCardsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 1;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      const nextCardsPerView = getCardsPerView();
      setCardsPerView(nextCardsPerView);

      const newMaxIndex = Math.max(0, filteredProjects.length - nextCardsPerView);
      if (currentIndex > newMaxIndex) {
        setCurrentIndex(newMaxIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filteredProjects.length, currentIndex]);

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
    <section id="projects" className="py-12 md:py-20 bg-white container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold font-poppins text-gray-900">
            Explore Approved Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 font-inter">
            All CRDA-approved layouts organized, verified, and ready to explore
          </p>
        </div>

        <div className="w-full py-2 rounded-3xl mb-8 flex justify-center">
          <FilterPanel filters={filters} onChange={setFilters} horizontal />
        </div>

        {propertiesLoading ? (
          <div className="text-center py-12">
            <p className="text-lg md:text-xl text-gray-600 font-['Inter'] px-4">
              Loading properties...
            </p>
          </div>
        ) : propertiesError ? (
          <div className="text-center py-12">
            <p className="text-lg md:text-xl text-red-600 font-['Inter'] px-4">
              {propertiesError}
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg md:text-xl text-gray-600 font-['Inter'] px-4">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="relative px-4 sm:px-8 lg:px-12">
              <button
                onClick={prevSlide}
                className="block absolute -left-6 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-[#3868B2]" />
              </button>

              <button
                onClick={nextSlide}
                className="block absolute -right-6 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-[#3868B2]" />
              </button>

              <div className="overflow-hidden mx-auto">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
                >
                  {filteredProjects.map((project) => (
                    <div
                      key={project.mlsNumber}
                      className="flex-shrink-0 px-2 sm:px-4"
                      style={{ width: `${100 / cardsPerView}%` }}
                    >
                      <PropCard property={project} />
                    </div>
                  ))}
                </div>
              </div>

              {maxIndex > 0 && (
                <div className="flex justify-center mt-6 md:mt-8 space-x-2">
                  {Array.from({ length: maxIndex + 1 }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-200 ${
                        index === currentIndex ? 'bg-[#3868B2]' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-center mt-8 md:mt-12 space-y-4 px-4">
          <Link to="/searchProperties">
            <button
              className="bg-white border-2 border-[#3868B2] text-[#3868B2]
               hover:bg-[#3868B2] hover:text-white
               px-6 md:px-8 py-2 md:py-3 rounded-lg font-medium font-['Poppins']
               transition-all duration-200 text-sm md:text-base"
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
