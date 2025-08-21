import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Send, BookOpen } from 'lucide-react';

const Contact: React.FC = () => {
  const { t } = useTranslation('contact');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    email: z.string().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
    subject: z.string().min(1, t('validation.subjectRequired')),
    message: z.string().min(10, t('validation.messageMinLength')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Here would be the actual form submission logic
      console.log('Form submitted:', values);
      
      toast({
        title: t('form.success'),
        description: t('form.successMessage'),
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: t('form.error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: t('info.email'),
      href: `mailto:${t('info.email')}`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: t('info.phone'),
      href: `tel:${t('info.phone')}`,
    },
    {
      icon: MapPin,
      label: 'Address',
      value: t('info.address'),
    },
    {
      icon: Clock,
      label: 'Hours',
      value: t('info.hours'),
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-syne text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div>
            <div className="bg-card rounded-3xl border shadow-soft p-8">
              <h2 className="font-syne text-2xl font-bold text-foreground mb-6">
                {t('form.title')}
              </h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.name')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('form.namePlaceholder')} 
                            {...field} 
                            className="touch-target"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.email')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder={t('form.emailPlaceholder')} 
                            {...field} 
                            className="touch-target"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.subject')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('form.subjectPlaceholder')} 
                            {...field} 
                            className="touch-target"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.message')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('form.messagePlaceholder')} 
                            className="min-h-[120px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover text-white font-semibold touch-target"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        {t('form.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        {t('form.send')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Contact Info & Support */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-card rounded-3xl border shadow-soft p-8">
              <h2 className="font-syne text-2xl font-bold text-foreground mb-6">
                {t('info.title')}
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.href ? (
                        <a 
                          href={item.href}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Resources */}
            <div className="bg-card rounded-3xl border shadow-soft p-8">
              <h2 className="font-syne text-2xl font-bold text-foreground mb-6">
                {t('support.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('support.description')}
              </p>
              
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  {t('support.helpCenter')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  {t('support.documentation')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;