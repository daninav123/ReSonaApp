import React from 'react';
import { Loader } from '@mantine/core';
import type { LoaderProps } from '@mantine/core';

/**
 * Common Loading spinner wrapper based on Mantine's Loader component
 */
const Loading: React.FC<LoaderProps> = (props) => {
  return <Loader {...props} />;
};

export default Loading;
