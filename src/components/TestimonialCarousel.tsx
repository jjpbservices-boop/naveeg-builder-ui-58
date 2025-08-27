import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CounterAnimation } from '@/components/CounterAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Solutions",
    content: "Naveeg transformed our online presence completely. The AI-generated website looks professional and converts visitors like never before. Our leads increased by 300% in just two months!",
    rating: 5,
    avatar: "SC"
  },
  {
    id: 2,
    name: "Miguel Rodriguez",
    role: "Restaurant Owner",
    company: "Sabor Auténtico",
    content: "I needed a website fast for my restaurant, and Naveeg delivered beyond expectations. The design captures our authentic atmosphere perfectly, and online orders have tripled since launch.",
    rating: 5,
    avatar: "MR"
  },
  {
    id: 3,
    name: "Jennifer Walsh",
    role: "Fitness Coach",
    company: "Peak Performance Studio",
    content: "The website Naveeg created for my fitness studio is exactly what I envisioned. It's modern, engaging, and the booking system works flawlessly. My client base has grown significantly!",
    rating: 5,
    avatar: "JW"
  },
  {
    id: 4,
    name: "David Kim",
    role: "E-commerce Founder",
    company: "EcoHome Products",
    content: "Launching our sustainable products store was seamless with Naveeg. The AI understood our brand values and created a website that truly represents our mission. Sales are booming!",
    rating: 5,
    avatar: "DK"
  }
];

export const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal delay={0}>
          <div className="text-center mb-12">
            <h2 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands of Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              See how our AI-powered websites are transforming businesses worldwide
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <ScrollReveal delay={200}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    <CounterAnimation end={15000} suffix="+" />
                  </div>
                  <p className="text-muted-foreground">Websites Created</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={400}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    <CounterAnimation end={98} suffix="%" />
                  </div>
                  <p className="text-muted-foreground">Customer Satisfaction</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={600}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    <CounterAnimation end={250} suffix="%" />
                  </div>
                  <p className="text-muted-foreground">Average Lead Increase</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonial Carousel */}
        <ScrollReveal delay={400}>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft border">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {currentTestimonial.avatar}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Stars */}
                  <div className="flex justify-center md:justify-start mb-4">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed">
                    "{currentTestimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div>
                    <div className="font-semibold text-foreground">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-muted-foreground">
                      {currentTestimonial.role} • {currentTestimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};