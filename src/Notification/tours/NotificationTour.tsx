import React from 'react';
import { ProductTour } from '@openedx/paragon';
import { useTourConfiguration } from './data/hooks';

const NotificationTour = () => {
  const config = useTourConfiguration();

  if (!config.length) {
    return null;
  }

  return <ProductTour tours={config} />;
};

export default NotificationTour;
