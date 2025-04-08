import ReactGA from "react-ga4";

interface GAEvent {
  category: string;
  action: string;
  label?: string;
}

const initializeGA = (): void => {
  ReactGA.initialize("G-RMB5J9SZLY");

  ReactGA.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
};

export const setConsent = (hasConsent: boolean): void => {
  console.log("GA CONSENT:", hasConsent);
  if (hasConsent) {
    ReactGA.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
    });
  } else {
    ReactGA.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
    });
  }
};

export const trackGAEvent = ({ category, action, label }: GAEvent): void => {
  console.log("GA event:", category, ":", action, ":", label);
  ReactGA.event({
    category,
    action,
    label,
  });
};

export default initializeGA;
