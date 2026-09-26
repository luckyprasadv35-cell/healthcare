import React from 'react';
import OnboardingWizard from '../components/OnboardingWizard';
import AdvisoryBanner from '../components/AdvisoryBanner';

const Onboarding: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-10">
      <div className="flex-grow flex flex-col items-center px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Let's Build Your Plan</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Tell us about yourself. Our AI will analyze your data to create a hyper-personalized fitness and nutrition protocol.
          </p>
        </div>
        
        <OnboardingWizard />
      </div>
      <AdvisoryBanner />
    </div>
  );
};

export default Onboarding;
