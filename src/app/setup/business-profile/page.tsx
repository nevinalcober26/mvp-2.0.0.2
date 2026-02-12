'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 1, label: 'Signup', status: 'completed' },
  { id: 2, label: 'Business Profile', status: 'current' },
  { id: 3, label: 'Choose a Plan', status: 'upcoming' },
  { id: 4, label: 'Payment', status: 'upcoming' },
  { id: 5, label: 'Confirmation', status: 'upcoming' },
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    timezone: '',
    businessEmail: '',
    businessPhone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'ae',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate saving data to a real database
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to LocalStorage "Database"
    localStorage.setItem('businessProfile', JSON.stringify(formData));

    toast({
      title: 'Profile Updated',
      description: 'Your business profile has been saved successfully.',
    });

    // Proceed to plan selection
    router.push('/setup/choose-plan');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fafbfc]">
      <header className="relative z-20 w-full bg-white border-b border-gray-100 py-4 flex justify-center shrink-0">
        <EMenuIcon />
      </header>

      <main className="relative flex-1 flex flex-col items-center p-4 pt-12 overflow-auto">
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#e6f7f6] blur-[120px] opacity-60" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fffcf0] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#f0f7ff] blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#fff5f8] blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full max-w-[800px] mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300",
                      step.status === 'completed'
                        ? "bg-[#18B4A6] text-white"
                        : step.status === 'current'
                        ? "bg-[#18B4A6] text-white ring-4 ring-[#18B4A6]/10"
                        : "bg-gray-200 text-gray-400"
                    )}
                  >
                    {step.status === 'completed' ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
                  </div>
                  <span
                    className={cn(
                      "text-[13px] font-bold whitespace-nowrap",
                      step.status === 'upcoming' ? "text-gray-400" : "text-gray-900"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-[2px] bg-gray-200">
                    <div 
                      className={cn(
                        "h-full bg-[#18B4A6] transition-all duration-500",
                        step.status === 'completed' ? "w-full" : "w-0"
                      )} 
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[640px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-[32px] font-black tracking-tight text-[#142424]">
              Create Your Business Profile
            </h1>
            <p className="text-[14px] font-medium text-gray-400">
              Tell us about your business so we can customize your experience
            </p>
          </div>

          <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardContent className="p-8 sm:p-10">
              <form onSubmit={handleContinue} className="space-y-6">
                {/* Business Information */}
                <section className="space-y-4">
                  <div className="space-y-1 border-b border-gray-100 pb-3">
                    <h3 className="text-[18px] font-bold text-[#142424]">Business Information</h3>
                    <p className="text-[12px] text-gray-400 font-medium">This information will be used to set up your tenant profile</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Enter your Company Name" 
                        required 
                        className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">
                          Business Type <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          onValueChange={(val) => handleSelectChange('businessType', val)}
                          required
                        >
                          <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="bar">Bar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">
                          Timezone <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          onValueChange={(val) => handleSelectChange('timezone', val)}
                          required
                        >
                          <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]">
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc+4">(UTC+04:00) Abu Dhabi, Muscat</SelectItem>
                            <SelectItem value="utc+0">(UTC+00:00) London</SelectItem>
                            <SelectItem value="utc-5">(UTC-05:00) New York</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="space-y-4">
                  <div className="space-y-1 border-b border-gray-100 pb-3">
                    <h3 className="text-[18px] font-bold text-[#142424]">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">
                        Business Email <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        name="businessEmail"
                        type="email" 
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com" 
                        required 
                        className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">
                        Business Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000" 
                        required 
                        className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                      />
                    </div>
                  </div>
                </section>

                {/* Business Address */}
                <section className="space-y-4">
                  <div className="space-y-1 border-b border-gray-100 pb-3">
                    <h3 className="text-[18px] font-bold text-[#142424]">Business Address</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">
                        Address Line 1 <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        name="address1"
                        value={formData.address1}
                        onChange={handleInputChange}
                        placeholder="Street address" 
                        required 
                        className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City" 
                          required 
                          className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-bold text-[#142424]">
                          Zip/Postal Code <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          placeholder="Zip/Postal Code" 
                          required 
                          className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-bold text-[#142424]">
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        onValueChange={(val) => handleSelectChange('country', val)}
                        defaultValue="ae"
                        required
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-200 rounded-xl px-4 text-[13px]">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ae">United Arab Emirates</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-11 bg-white border-gray-200 rounded-xl px-8 text-[13px] font-bold text-gray-500 hover:bg-gray-50"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="submit"
                    className="h-11 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold text-[13px] rounded-xl px-10 shadow-lg shadow-[#18B4A6]/20 transition-all active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
