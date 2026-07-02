import React from 'react';
import { Shield } from 'lucide-react';

export default function MyCertificates() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
        <Shield className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">My Certificates</h1>
      <p className="text-slate-500 max-w-md">
        Your officially issued certificates from Amaanitvam Foundation will appear here.
      </p>
    </div>
  );
}
