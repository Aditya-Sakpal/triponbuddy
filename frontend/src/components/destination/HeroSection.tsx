import destinationsHeroBg from "@/assets/destinations-hero-bg.jpg";

export const HeroSection = () => {
    return (
        <section
            className="relative py-28 px-6 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.8), rgba(147, 107, 230, 0.8)), url(${destinationsHeroBg})`,
            }}
        >
            <div className="container mx-auto text-center relative z-10">
                <h1 className="font-bold mb-6 text-4xl md:text-5xl text-white">
                    Explore Incredible Destinations Worldwide
                </h1>
                <p className="leading-relaxed text-white/90">
                    Discover the diverse beauty of both domestic and international destinations - from
                    majestic mountains and serene beaches to ancient temples and vibrant cities.
                </p>
            </div>
        </section>
    );
};