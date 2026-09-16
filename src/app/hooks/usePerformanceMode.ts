import { useEffect, useState } from 'react';

type PerformanceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: Navigator['connection'] & { effectiveType?: string };
};

export const usePerformanceMode = () => {
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);

  useEffect(() => {
    const currentNavigator = navigator as PerformanceNavigator;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(currentNavigator.userAgent);
    const hasLowMemory =
      currentNavigator.deviceMemory !== undefined &&
      currentNavigator.deviceMemory < 4;
    const hasLowCPU = currentNavigator.hardwareConcurrency < 4;
    const effectiveType = currentNavigator.connection?.effectiveType;
    const hasLowBandwidth =
      effectiveType === '2g' || effectiveType === 'slow-2g';

    setIsLowPerformanceMode(
      isMobile || hasLowMemory || hasLowCPU || hasLowBandwidth
    );
  }, []);

  return { isLowPerformanceMode };
};
