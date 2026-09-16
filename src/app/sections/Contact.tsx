/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactProps {
  theme?: 'light' | 'dark';
}

const Contact: React.FC<ContactProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactData.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  
  // Obtener datos desde las traducciones
  const contactData = {
    title: t('contact.title'),
    subtitle: t('contact.subtitle'),
    email: t('contact.email'),
    location: t('contact.location'),
    resume_link: t('contact.resume_link'),
    social: t('contact.social', { returnObjects: true }) as {
      platform: string;
      url: string;
      icon: string;
    }[]
  };
  
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = t('contact.form.errors.nameRequired');
    
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errors.emailInvalid');
    }
    
    if (!formData.subject.trim()) newErrors.subject = t('contact.form.errors.subjectRequired');
    if (!formData.message.trim()) newErrors.message = t('contact.form.errors.messageRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (validateForm()) {
      setIsSubmitting(true);
  
      try {
        const response = await fetch('https://formspree.io/f/xzzeaqwk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          setSubmitStatus('success');
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
          });
        } else {
          setSubmitStatus('error');
        }
      } catch (error) {
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
  
        // Resetear el estado después de unos segundos
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 3000);
      }
    }
  };

  // Definir clases condicionales basadas en el tema
  const styles = {
    title: theme === 'light' ? 'text-3xl font-bold mb-8 text-gray-800' : 'text-3xl font-bold mb-8 text-white',
    container: theme === 'light' ? 'bg-white/80 p-8 rounded-xl border border-gray-200 backdrop-blur-sm' : 'bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm',
    heading: theme === 'light' ? 'text-2xl font-bold text-gray-800 mb-6' : 'text-2xl font-bold text-white mb-6',
    iconBg: theme === 'light' ? 'bg-blue-500/10 p-3 rounded-full' : 'bg-blue-500/20 p-3 rounded-full',
    iconColor: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
    labelText: theme === 'light' ? 'text-gray-700' : 'text-gray-300',
    fieldTitle: theme === 'light' ? 'text-lg font-semibold text-gray-800' : 'text-lg font-semibold text-white',
    fieldContent: theme === 'light' ? 'text-gray-600' : 'text-gray-300',
    inputBg: theme === 'light' ? 'bg-gray-100' : 'bg-gray-700',
    inputBorder: theme === 'light' ? 'border-gray-300' : 'border-gray-600',
    inputText: theme === 'light' ? 'text-gray-800' : 'text-white',
    socialBg: theme === 'light' ? 'bg-gray-200 hover:bg-blue-500 p-3 rounded-full transition-all' : 'bg-gray-700 hover:bg-blue-600 p-3 rounded-full transition-all',
    socialIconColor: theme === 'light' ? 'text-gray-800' : 'text-white',
  };
  
  // Función para renderizar iconos sociales con color condicional
  const renderSocialIcon = (iconName: string) => {
    const iconClass = `w-5 h-5 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`;
    
    switch (iconName) {
      case 'twitter':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        );
      case 'github':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.548 9.548 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="md:py-16">
      <h2 className={styles.title}>{contactData.title}</h2>
      
      {/* Call to Action Banner */}
      <div className={`mb-10 p-6 md:p-8 rounded-2xl border transition-all ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900 shadow-sm' 
          : 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border-blue-500/20 text-blue-100 shadow-lg'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 ${
              theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('contact.cta.badge', 'Disponible para proyectos')}
            </span>
            <h3 className="text-xl md:text-2xl font-bold">{t('contact.cta.title')}</h3>
            <p className={`mt-1 text-sm md:text-base max-w-2xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              {t('contact.cta.description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a 
              href="https://cal.com/brunomoya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition-all shadow-md bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('contact.cta.bookCall', 'Agendar llamada (15 min)')}
            </a>
            <a 
              href="#contact-form" 
              className={`inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium transition-all border ${
                theme === 'light' 
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300' 
                  : 'bg-gray-800/80 hover:bg-gray-700 text-gray-200 border-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('contact.cta.button')}
            </a>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información de contacto */}
        <div className={styles.container}>
          <h3 className={styles.heading}>{contactData.subtitle}</h3>
          
          {/* Tarjeta destacada de reserva Cal.com */}
          <div className={`mb-6 p-4 rounded-xl border ${
            theme === 'light'
              ? 'bg-blue-50/70 border-blue-200'
              : 'bg-blue-950/20 border-blue-500/20'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                {t('contact.bookCallTitle', 'Reunión rápida')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                15 min
              </span>
            </div>
            <p className={`text-xs md:text-sm mb-3 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              {t('contact.bookCallDesc', 'Hablemos de arquitectura de IA, consultoría técnica o liderazgo de proyectos.')}
            </p>
            <a
              href="https://cal.com/brunomoya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('contact.bookCallButton', 'Reservar en Cal.com')}
              <span className="ml-1 transition-transform group-hover:translate-x-0.5">↗</span>
            </a>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className={styles.iconBg}>
                <svg className={`w-6 h-6 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className={styles.fieldTitle}>{t('contact.locationTitle')}</h4>
                <p className={styles.fieldContent}>{contactData.location}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={styles.iconBg}>
                <svg className={`w-6 h-6 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={styles.fieldTitle}>{t('contact.emailTitle')}</h4>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <a 
                    href={`mailto:${contactData.email}`} 
                    className={`${styles.fieldContent} underline hover:text-blue-500 break-all`}
                  >
                    {contactData.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`inline-flex items-center px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                      copied 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : theme === 'light'
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                    }`}
                    title={t('contact.copyEmail', 'Copiar')}
                  >
                    {copied ? (
                      <>
                        <svg className="w-3 h-3 mr-1 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {t('contact.copied', '¡Copiado!')}
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t('contact.copyEmail', 'Copiar')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={styles.iconBg}>
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 3.5L18.5 9H14a1 1 0 01-1-1V3.5zM6 20V4h6v5a2 2 0 002 2h5v9H6z" />
                <path d="M8 12h8v2H8zm0 4h8v2H8z" />
              </svg>
              </div>
              <div>
              <h4 className={styles.fieldTitle}>{t('contact.resumeTitle')}</h4>
              <a 
                href={contactData.resume_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${styles.fieldContent} underline hover:text-blue-500`}
              >
                {t('contact.viewResume')}
              </a>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <h4 className={styles.fieldTitle + " mb-4"}>{t('contact.followMe')}</h4>
            <div className="flex space-x-4">
              {contactData.social.map((platform, index) => (
                <a 
                  key={index} 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialBg}
                >
                  {renderSocialIcon(platform.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Formulario de contacto */}
        <div id="contact-form" className={styles.container}>
          <h3 className={styles.heading}>{t('contact.form.title')}</h3>
          
          <form 
            onSubmit={handleSubmit}
            method="POST"
          >
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="name">{t('contact.form.namePlaceholder')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.name ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={t('contact.form.namePlaceholder')}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="email">{t('contact.form.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.email ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={t('contact.form.emailPlaceholder')}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="subject">{t('contact.form.subjectLabel')}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.subject ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={t('contact.form.subjectPlaceholder')}
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
            
            <div className="mb-6">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="message">{t('contact.form.messageLabel')}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full ${styles.inputBg} border ${errors.message ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={t('contact.form.messagePlaceholder')}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold transition-colors flex justify-center items-center`}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : t('contact.form.submitButton')}
            </button>
            
            {submitStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center">
                {t('contact.form.successMessage')}
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                {t('contact.form.errorMessage')}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
