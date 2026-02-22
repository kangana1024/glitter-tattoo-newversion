'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const t = useTranslations('contact');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('requiredField');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('requiredField');
    }
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-accent-green/10 border border-accent-green rounded-xl p-8 text-center">
        <p className="font-heading text-xl font-semibold text-accent-green">
          {t('successMessage')}
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-text-secondary/20 bg-surface px-4 py-3 font-body text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors';
  const errorClass = 'text-sm text-primary mt-1 font-body';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block font-heading text-sm font-semibold text-text-primary mb-2">
          {t('nameLabel')} <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('namePlaceholder')}
          className={inputClass}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block font-heading text-sm font-semibold text-text-primary mb-2">
          {t('emailLabel')} <span className="text-primary">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('emailPlaceholder')}
          className={inputClass}
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block font-heading text-sm font-semibold text-text-primary mb-2">
          {t('phoneLabel')}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder={t('phonePlaceholder')}
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block font-heading text-sm font-semibold text-text-primary mb-2">
          {t('messageLabel')} <span className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder={t('messagePlaceholder')}
          className={inputClass}
        />
        {errors.message && <p className={errorClass}>{errors.message}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full">
        {t('sendMessage')}
      </Button>
    </form>
  );
}
