"use client";

import { BsGithub, BsLinkedin, BsInstagram, BsTwitter, BsEnvelope, BsFileEarmarkPerson } from "react-icons/bs"; 
import ToggleBtn from "./tglbutton";

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface ContactInfo {
  email?: string;
  location?: string;
  resume_link?: string;
  social?: SocialLink[];
}

interface HeroInfo {
  title?: string;
  subtitle?: string;
}

interface SiteData {
  hero?: HeroInfo;
  contact?: ContactInfo;
}

interface FooterProps {
  setIsDarkMode: (value: boolean) => void;
  isDarkMode: boolean;
  siteData?: SiteData;
}

export const FooterComponent = ({ setIsDarkMode, isDarkMode, siteData }: FooterProps) => {
  // const [email, setEmail] = useState("");
  
  const handleThemeChange = (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
    localStorage.setItem('userThemePreference', 'true');
  };

  // const handleSubscribe = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (email && email.includes('@')) {
  //     // Here you would normally send this to your backend
  //     console.log("Subscribing email:", email);
  //     setSubscribed(true);
  //     setEmail("");
  //     setTimeout(() => setSubscribed(false), 3000);
  //   }
  // };

  const SocialIcon = ({ 
    href, 
    icon: Icon, 
    label,
    className 
  }: { 
    href: string; 
    icon: React.ElementType; 
    label: string;
    className: string 
  }) => (
    <a 
      href={href} 
      className={className} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </a>
  );

  // Get social data from site data prop or use empty array as fallback
  const socialLinks = siteData?.contact?.social || [];
  
  // Map social icon names to corresponding React icons
  const getSocialIcon = (iconName: string) => {
    switch(iconName?.toLowerCase()) {
      case 'github': return BsGithub;
      case 'linkedin': return BsLinkedin;
      case 'twitter': return BsTwitter;
      case 'instagram': return BsInstagram;
      default: return BsEnvelope;
    }
  };
  
  // Navigation sections based on the page structure
  // Split navigation into two columns to make it less tall
  const navigationSections = [
    [
      { name: "Home", href: "#hero" },
      { name: "About", href: "#about" },
      { name: "Experience", href: "#experience" },
      { name: "Projects", href: "#projects" },
    ],
    [
      { name: "Talks", href: "#talks" },
      { name: "News", href: "#news" },
      { name: "Education", href: "#education" },
      { name: "Contact", href: "#contact" },
    ]
  ];

  const linkClass = `${isDarkMode 
    ? 'text-gray-400 hover:text-white' 
    : 'text-gray-600 hover:text-gray-900'} transition-colors hover:underline`;

  // Extract name from hero title or use fallback
  const heroName = "Bruno Moya";

  return (
    <footer className={`w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-16 py-10 p-2`}>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About & Theme Toggle */}
          <div className="flex flex-col space-y-4">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {siteData?.hero?.title?.split(',')[0] || "Portfolio"}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {siteData?.hero?.subtitle || "Developer & Entrepreneur"}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
              <ToggleBtn   
                className={`flex items-center justify-center w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                onChange={handleThemeChange}
                checked={isDarkMode} 
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Navigation</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {/* First column of navigation */}
              <div>
                {navigationSections[0].map((section) => (
                  <a key={section.href} href={section.href} className={linkClass + " block mb-2"}>
                    {section.name}
                  </a>
                ))}
              </div>
              
              {/* Second column of navigation */}
              <div>
                {navigationSections[1].map((section) => (
                  <a key={section.href} href={section.href} className={linkClass + " block mb-2"}>
                    {section.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Column 3: Contact */}
          <div className="flex flex-col space-y-4">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Contact</h3>
            <nav className="flex flex-col space-y-2">
              {siteData?.contact?.email && (
                <a href={`mailto:${siteData.contact.email}`} className={`${linkClass} flex items-center gap-2 group`}>
                  <BsEnvelope className="h-4 w-4 group-hover:text-indigo-500 transition-colors" />
                  <span>{siteData.contact.email}</span>
                </a>
              )}
              {siteData?.contact?.location && (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  {siteData.contact.location}
                </p>
              )}
              {siteData?.contact?.resume_link && (
                <a 
                  href={siteData.contact.resume_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`${linkClass} flex items-center gap-2 group`}
                >
                  <BsFileEarmarkPerson className="h-4 w-4 group-hover:text-indigo-500 transition-colors" />
                  <span>View Resume</span>
                </a>
              )}
            </nav>
          </div>
        </div>
        
        <hr className={`${isDarkMode ? 'border-gray-800' : 'border-gray-200'} my-6`} />
        
        {/* Bottom section with social + copyright */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              © {new Date().getFullYear()} {heroName}. All rights reserved.
              <span className="hidden md:inline mx-2">•</span>
              <span className="block md:inline mt-1 md:mt-0">
                Hecho con ♥ desde España
              </span>
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Dynamically render social icons from site-data */}
            {socialLinks.map((social) => (
              <SocialIcon 
                key={social.platform}
                href={social.url} 
                icon={getSocialIcon(social.icon)}
                label={`Visit ${social.platform} Profile`}
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors hover:scale-110`} 
              />
            ))}
            
            {/* Add email icon if available */}
            {siteData?.contact?.email && (
              <SocialIcon 
                href={`mailto:${siteData.contact.email}`} 
                icon={BsEnvelope} 
                label="Send Email"
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors hover:scale-110`} 
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
