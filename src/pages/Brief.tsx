import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const briefSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['informational', 'ecommerce', 'restaurant', 'services', 'portfolio', 'blog']),
  businessDescription: z.string().min(10, 'Please provide a more detailed description'),
  websiteTitle: z.string().min(1, 'Website title is required'),
  websiteDescription: z.string().max(160, 'Description should be 160 characters or less'),
  websiteKeyphrase: z.string().min(1, 'Keyphrase is required'),
});

type BriefFormData = z.infer<typeof briefSchema>;

const Brief: React.FC = () => {
  const { t } = useTranslation(['onboarding', 'common']);
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      businessName: state.brief.businessName,
      businessType: state.brief.businessType as any,
      businessDescription: state.brief.businessDescription,
      websiteTitle: state.brief.websiteTitle,
      websiteDescription: state.brief.websiteDescription,
      websiteKeyphrase: state.brief.websiteKeyphrase,
    },
  });

  const onSubmit = (data: BriefFormData) => {
    dispatch({
      type: 'UPDATE_BRIEF',
      payload: data,
    });
    navigate({ to: '/design' });
  };

  const handleBack = () => {
    navigate({ to: '/describe' });
  };

  const businessTypeOptions = [
    { value: 'informational', label: t('onboarding:brief.businessTypeOptions.informational') },
    { value: 'ecommerce', label: t('onboarding:brief.businessTypeOptions.ecommerce') },
    { value: 'restaurant', label: t('onboarding:brief.businessTypeOptions.restaurant') },
    { value: 'services', label: t('onboarding:brief.businessTypeOptions.services') },
    { value: 'portfolio', label: t('onboarding:brief.businessTypeOptions.portfolio') },
    { value: 'blog', label: t('onboarding:brief.businessTypeOptions.blog') },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Wizard Progress */}
        <div className="flex items-center justify-center mb-8 animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary">
                {t('onboarding:wizard.step1')}
              </span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {t('onboarding:wizard.step2')}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('onboarding:brief.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('onboarding:brief.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.businessName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('onboarding:brief.businessNamePlaceholder')}
                        className="h-12 rounded-2xl border-2 touch-target"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.businessType')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-2 touch-target">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.businessDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('onboarding:brief.businessDescriptionPlaceholder')}
                        className="min-h-[120px] rounded-2xl border-2 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="websiteTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t('onboarding:brief.websiteTitle')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('onboarding:brief.websiteTitlePlaceholder')}
                          className="h-12 rounded-2xl border-2 touch-target"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="websiteKeyphrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t('onboarding:brief.websiteKeyphrase')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('onboarding:brief.websiteKeyphrasePlaceholder')}
                          className="h-12 rounded-2xl border-2 touch-target"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="websiteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.websiteDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('onboarding:brief.websiteDescriptionPlaceholder')}
                        className="min-h-[80px] rounded-2xl border-2 resize-none"
                        maxLength={160}
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground text-right">
                      {field.value?.length || 0}/160
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="touch-target rounded-2xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common:global.back')}
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                >
                  {t('onboarding:brief.nextStep')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Brief;