import React from 'react';
import { Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';
import type { BreadcrumbsProps } from '@mantine/core';

/**
 * Common Breadcrumbs wrapper based on Mantine's Breadcrumbs component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = (props) => {
  return <MantineBreadcrumbs {...props} />;
};

export default Breadcrumbs;
