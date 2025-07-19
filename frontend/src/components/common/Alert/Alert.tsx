import React from 'react';
import { Alert as MantineAlert } from '@mantine/core';
import type { AlertProps } from '@mantine/core';

/**
 * Common Alert wrapper based on Mantine's Alert component
 */
const Alert: React.FC<AlertProps> = (props) => {
  return <MantineAlert {...props} />;
};

export default Alert;
