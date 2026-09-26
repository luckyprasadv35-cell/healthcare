import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AdvisoryBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-t border-amber-500/20 py-4 px-4 w-full mt-auto">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-amber-200/80 text-sm">
          <strong>Medical Advisory:</strong> Vitalis AI provides algorithmic fitness and nutritional guidance. It is not a substitute for professional medical advice. Consult a physician before beginning any new health regimen.
        </p>
      </div>
    </div>
  );
};

export default AdvisoryBanner;
