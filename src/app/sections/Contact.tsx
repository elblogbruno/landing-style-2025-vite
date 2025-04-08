/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactProps {
  data: {
    title: string;
    subtitle: string;
    email: string; 
    location: string;
    resume_link: string;
    social: {
      platform: string;
      url: string;
      icon: string;
    }[];
  };
  theme?: 'light' | 'dark';
}

const Contact: React.FC<ContactProps> = ({ data, theme = 'dark' }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
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
      <h2 className={styles.title}>{data.title}</h2>
      
      {/* Call to Action Banner */}
      <div className={`mb-10 p-6 rounded-xl ${theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/40 text-blue-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold">Did I catch your attention?</h3>
            <p className="mt-1 text-sm md:text-base">Let's connect and discuss how we can work together.</p>
          </div>
          <a 
            href="#contact" 
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              theme === 'light' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            Send me a message
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información de contacto */}
        <div className={styles.container}>
          <h3 className={styles.heading}>{data.subtitle}</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className={styles.iconBg}>
                <svg className={`w-6 h-6 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className={styles.fieldTitle}>Location</h4>
                <p className={styles.fieldContent}>{data.location}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={styles.iconBg}>
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              </div>
              <div>
              <h4 className={styles.fieldTitle}>Email</h4>
              <a 
                href={`mailto:${data.email}`} 
                className={`${styles.fieldContent} underline hover:text-blue-500`}
              >
                {data.email}
              </a>
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
              <h4 className={styles.fieldTitle}>Resume</h4>
              <a 
                href={data.resume_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${styles.fieldContent} underline hover:text-blue-500`}
              >
                View Resume
              </a>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <h4 className={styles.fieldTitle + " mb-4"}>Follow Me</h4>
            <div className="flex space-x-4">
              {data.social.map((platform, index) => (
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
          <h3 className={styles.heading}>Send a Message</h3>
          
          <form 
            onSubmit={handleSubmit}
            method="POST"
          >
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.name ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Your name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.email ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full ${styles.inputBg} border ${errors.subject ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Subject"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
            
            <div className="mb-6">
              <label className={`block ${styles.labelText} mb-2`} htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full ${styles.inputBg} border ${errors.message ? 'border-red-500' : styles.inputBorder} rounded-lg p-3 ${styles.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Your message"
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
              ) : 'Send Message'}
            </button>
            
            {submitStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center">
                Message sent successfully!
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                Failed to send message. Please try again later.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
