import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import gallery1 from "@/assets/gallery1.jpg";
import gallery2 from "@/assets/gallery2.jpg";
import gallery3 from "@/assets/gallery3.jpg";
import gallery4 from "@/assets/gallery4.jpg";


const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const galleryImages = [
    {
      id: 1,
      src: gallery1,
      title: 'Professional Barbering',
      category: 'haircuts',
      description: 'Expert precision cutting'
    },
    {
      id: 2,
      src: gallery2,
      title: 'Classic Cut in Progress',
      category: 'haircuts',
      description: 'Traditional barbering techniques'
    },
    {
      id: 3,
      src: gallery3,
      title: 'Styled & Groomed',
      category: 'beard',
      description: 'Complete grooming result'
    },
    {
      id: 4,
      src: gallery4,
      title: 'Modern Fade',
      category: 'beard',
      description: 'Contemporary styling'
    },
    // {
    //   id: 5,
    //   src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186',
    //   title: 'Beard Trimming',
    //   category: 'beard',
    //   description: 'Precision beard work'
    // },
    // {
    //   id: 6,
    //   src: 'https://images.unsplash.com/photo-1743779035881-9205ef92f1ce',
    //   title: 'Professional Beard Service',
    //   category: 'beard',
    //   description: 'Expert beard grooming'
    // },
    // {
    //   id: 7,
    //   src: 'https://images.unsplash.com/photo-1759134248487-e8baaf31e33e',
    //   title: 'Modern Barbershop',
    //   category: 'shop',
    //   description: 'Contemporary barbershop interior'
    // },
    // {
    //   id: 8,
    //   src: 'https://images.unsplash.com/photo-1610475680335-dafab5475150',
    //   title: 'Classic Barber Chair',
    //   category: 'shop',
    //   description: 'Traditional barbershop setup'
    // },
    // {
    //   id: 9,
    //   src: 'https://images.unsplash.com/photo-1667539916609-c706d5b7ed65',
    //   title: 'Professional Tools',
    //   category: 'shop',
    //   description: 'Quality barbering equipment'
    // }
  ];

  const categories = [
    { id: 'all', name: 'All Work', count: galleryImages.length },
    { id: 'haircuts', name: 'Haircuts', count: galleryImages.filter(img => img.category === 'haircuts').length },
    { id: 'beard', name: 'Beard Work', count: galleryImages.filter(img => img.category === 'beard').length },
    { id: 'styling', name: 'Styling', count: galleryImages.filter(img => img.category === 'styling').length },
    { id: 'shop', name: 'Our Shop', count: galleryImages.filter(img => img.category === 'shop').length }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-zinc-900 mb-6">
            Our Gallery
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto mb-8">
            Explore our portfolio showcasing the artistry and craftsmanship that defines 
            Oxy'ss Hair Studio. Every cut tells a story of precision and style.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                }`}
                data-testid={`filter-${category.id}`}
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-zinc-100 text-zinc-600"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gallery-grid">
            {filteredImages.map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div 
                    className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid={`gallery-item-${image.id}`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* <div className="p-4">
                      <h3 className="font-semibold text-zinc-900 mb-1">
                        {image.title}
                      </h3>
                      <p className="text-sm text-zinc-600">
                        {image.description}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="mt-2 bg-yellow-100 text-yellow-800"
                      >
                        {image.category}
                      </Badge>
                    </div> */}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-[90vw] p-0">
                  <div className="relative">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    {/* <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-4">
                      <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-300">{image.description}</p>
                    </div> */}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12" data-testid="no-results">
              <p className="text-zinc-500 text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
            Ready to Look Your Best?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our satisfied customers and experience the Oxy'ss difference. 
            Book your appointment and let us create your next signature look.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8"
              data-testid="gallery-cta-book-btn"
            >
              Book Appointment
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-zinc-900 px-8"
              data-testid="gallery-cta-services-btn"
            >
              View Services
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;