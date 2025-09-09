import { useFeedbackForm } from "@/hooks/useFeedbackForm";
import { FeedbackForm } from "./FeedbackForm";

export const FeedbackSection = () => {
  const formLogic = useFeedbackForm();

  return (
    <section className="py-20 bg-blue-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-latin text-primary mb-6">
              Share Your Feedback
            </h2>
            <p className="text-lg font-latin text-muted-foreground leading-relaxed">
              We value your opinion! Let us know how we can improve
              your travel planning experience.
            </p>
          </div>

          {/* Right side - Form */}
          <FeedbackForm formLogic={formLogic} />
        </div>
      </div>
    </section>
  );
};

