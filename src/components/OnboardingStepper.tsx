import React, { useState } from 'react';
import { Check, ChevronRight, MessageSquare, Zap, Target } from 'lucide-react';

interface OnboardingStepperProps {
  onComplete: () => void;
  onSkip: () => void;
  openNewForwarderModal: () => void;
  goToTelegramTab: () => void;
  isTelegramConnected: boolean;
}

export default function OnboardingStepper({ 
  onComplete, 
  onSkip, 
  openNewForwarderModal,
  goToTelegramTab,
  isTelegramConnected
}: OnboardingStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Connect Telegram',
      description: 'Link your Telegram Bot or User account to intercept messages.',
      icon: MessageSquare,
      isCompleted: isTelegramConnected,
      action: goToTelegramTab,
      actionText: 'Go to Telegram Login'
    },
    {
      id: 2,
      title: 'Create Pipeline',
      description: 'Define your source and target channels to route messages.',
      icon: Target,
      isCompleted: false, // Completing this takes them to the form
      action: openNewForwarderModal,
      actionText: 'Configure Pipeline'
    },
    {
      id: 3,
      title: 'Start Forwarding',
      description: 'Your setup is complete. Watch your messages flow in real-time.',
      icon: Zap,
      isCompleted: false,
      action: onComplete,
      actionText: 'View Dashboard'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d0e12] border border-[#1e2230] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-[#14161f] border-b border-[#1e2230] p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Welcome to TeleFlow!</h2>
          <p className="text-sm text-gray-400">Let's set up your first automated forwarding pipeline in just a few steps.</p>
        </div>

        {/* Stepper Content */}
        <div className="p-8">
          <div className="space-y-6">
            {steps.map((step, idx) => {
              const active = currentStep === step.id;
              const passed = currentStep > step.id || step.isCompleted;
              const Icon = step.icon;

              return (
                <div key={step.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${active ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-[#1e2230] bg-[#14161f]/50'}`}>
                  <div className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${passed ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#1e2230] text-gray-500'}`}>
                    {passed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${active || passed ? 'text-white' : 'text-gray-500'}`}>{step.title}</h3>
                    <p className={`text-xs mt-1 ${active || passed ? 'text-gray-400' : 'text-gray-600'}`}>{step.description}</p>
                    
                    {active && !step.isCompleted && (
                      <button 
                        onClick={() => {
                          if (step.id === 1) {
                            goToTelegramTab();
                            onSkip(); // close wrapper overlay
                          } else if (step.id === 2) {
                            openNewForwarderModal();
                            onSkip();
                          } else {
                            step.action();
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {step.actionText}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {active && step.isCompleted && step.id === 1 && (
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Telegram Connected! Next Step
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1e2230] bg-[#14161f] flex justify-between items-center">
          <button 
            onClick={onSkip} 
            className="text-xs text-gray-500 hover:text-gray-300 font-medium px-4 py-2 cursor-pointer transition-colors"
          >
            Skip for now
          </button>
          
          <div className="flex space-x-1">
            {steps.map((s) => (
              <div key={s.id} className={`h-1.5 w-8 rounded-full ${s.id === currentStep ? 'bg-indigo-500' : s.id < currentStep || s.isCompleted ? 'bg-emerald-500' : 'bg-[#1e2230]'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
