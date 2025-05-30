interface TrackEventProps {
  category: string;
  action: string;
  label?: string;
}

// Standard tracking function - can cause main thread blocking
export const track = ({ category, action, label }: TrackEventProps): void => {
 
  // Log event in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Umami event:', category, ':', action, ':', label);
  }
  
  // Track event with Umami
  // Combine category + action as event name and pass label as data property if available
  const eventName = `${category}:${action}`;
  const eventData = label ? { label } : undefined;
  
  if (window.umami) {
    window.umami.track(eventName, eventData);
  }

};

export const trackPageView = (): void => {
  if (window.umami) {
    window.umami.track();
  }
};

// Deferred tracking function - to be used for initial page load and other critical moments
export const trackDeferred = ({ category, action, label }: TrackEventProps): void => {
  // Use requestIdleCallback to defer tracking until the browser is idle
  const trackWhenIdle = () => {
    // Create the tracking event
    const eventName = `${category}:${action}`;
    const eventData = label ? { label } : undefined;
    
    if (window.umami) {
      window.umami.track(eventName, eventData);
    }
  };
  
  // Use requestIdleCallback when available, or setTimeout as fallback
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => trackWhenIdle());
    } else {
      setTimeout(trackWhenIdle, 2000); // Defer by 2 seconds as fallback
    }
  }
};