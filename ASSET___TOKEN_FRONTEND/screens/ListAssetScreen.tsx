import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Upload, CheckCircle, FileText } from 'lucide-react';

type Step = 'details' | 'documents' | 'tokenization' | 'review' | 'submitted';

export const ListAssetScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'real-estate',
    totalSupply: '',
    tokenSymbol: '',
    titleDeed: null as File | null,
    valuationReport: null as File | null,
    legalOpinion: null as File | null,
  });
  
  const steps = [
    { id: 'details', label: 'Asset Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'tokenization', label: 'Tokenization' },
    { id: 'review', label: 'Review' },
  ];
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  
  const handleNext = () => {
    const stepOrder: Step[] = ['details', 'documents', 'tokenization', 'review', 'submitted'];
    const nextIndex = stepOrder.indexOf(currentStep) + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };
  
  const handleBack = () => {
    const stepOrder: Step[] = ['details', 'documents', 'tokenization', 'review'];
    const prevIndex = stepOrder.indexOf(currentStep) - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };
  
  if (currentStep === 'submitted') {
    return (
      <Layout showBack>
        <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl mb-2">Submission Received</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-xs mb-8">
            Your asset is under review. You will be notified once approved.
          </p>
          
          <Card className="w-full max-w-sm mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Asset Name</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Location</span>
                <span className="font-medium">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Token Symbol</span>
                <span className="font-medium">{formData.tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Status</span>
                <span className="text-amber-400">Under Review</span>
              </div>
            </div>
          </Card>
          
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/home')} className="max-w-sm">
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showBack>
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl mb-2">List Your Asset</h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Submit your asset for verification and tokenization
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index <= currentStepIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-secondary))]'
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-xs mt-1.5 text-center text-[rgb(var(--color-text-secondary))]">
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentStepIndex ? 'bg-blue-500' : 'bg-[rgb(var(--color-border))]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            <Input
              label="Asset Name *"
              placeholder="Brooklyn Heights Residential"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            
            <Input
              label="Location *"
              placeholder="Brooklyn, NY, USA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            
            <div>
              <label className="block text-sm text-[rgb(var(--color-text-secondary))] mb-1.5">
                Asset Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="real-estate">Real Estate</option>
                <option value="commodity">Commodity</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="art">Art</option>
              </select>
            </div>
          </div>
        )}
        
        {currentStep === 'documents' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium">Title Deed *</h3>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Upload the official title deed or ownership certificate
                </p>
                <label className="block">
                  <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-[rgb(var(--color-text-secondary))] mx-auto mb-2" />
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formData.titleDeed ? formData.titleDeed.name : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, titleDeed: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </Card>
            
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium">Valuation Report *</h3>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Independent valuation or appraisal report
                </p>
                <label className="block">
                  <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-[rgb(var(--color-text-secondary))] mx-auto mb-2" />
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formData.valuationReport ? formData.valuationReport.name : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, valuationReport: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </Card>
            
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium">Legal Opinion (Optional)</h3>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Legal verification from a qualified attorney
                </p>
                <label className="block">
                  <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-[rgb(var(--color-text-secondary))] mx-auto mb-2" />
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formData.legalOpinion ? formData.legalOpinion.name : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, legalOpinion: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </Card>
          </div>
        )}
        
        {currentStep === 'tokenization' && (
          <div className="space-y-4">
            <Input
              label="Total Supply *"
              type="number"
              placeholder="1000"
              value={formData.totalSupply}
              onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
              fullWidth
            />
            
            <Input
              label="Token Symbol *"
              placeholder="BHR"
              value={formData.tokenSymbol}
              onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
              fullWidth
            />
            
            <Card className="bg-blue-500/5 border-blue-500/20">
              <div className="text-sm space-y-2">
                <p className="text-blue-400 font-medium">Tokenization Info</p>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  Your asset will be tokenized using ERC-20 standard with 18 decimals. Each token represents fractional ownership of your asset.
                </p>
              </div>
            </Card>
          </div>
        )}
        
        {currentStep === 'review' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <h3 className="font-medium mb-3">Review Your Submission</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                    <span className="text-[rgb(var(--color-text-secondary))]">Asset Name</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                    <span className="text-[rgb(var(--color-text-secondary))]">Location</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                    <span className="text-[rgb(var(--color-text-secondary))]">Type</span>
                    <span className="font-medium capitalize">{formData.type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                    <span className="text-[rgb(var(--color-text-secondary))]">Total Supply</span>
                    <span className="font-medium">{formData.totalSupply}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[rgb(var(--color-text-secondary))]">Token Symbol</span>
                    <span className="font-medium">{formData.tokenSymbol}</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Documents</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Title Deed</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">Valuation Report</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  {formData.legalOpinion && (
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--color-text-secondary))]">Legal Opinion</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            <label className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-card))] text-blue-500"
                required
              />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                I declare that all information provided is accurate and I have the legal authority to tokenize this asset.
              </span>
            </label>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex gap-3 sticky bottom-20 pt-4">
          {currentStep !== 'details' && (
            <Button variant="secondary" size="lg" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === 'review' ? 'Submit for Review' : 'Continue'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
