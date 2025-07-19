import React from 'react';
import { Skeleton as MantineSkeleton } from '@mantine/core';
import type { SkeletonProps } from '@mantine/core';

/**
 * Common Skeleton wrapper based on Mantine's Skeleton component
 */
const Skeleton: React.FC<SkeletonProps> = (props) => {
  return <MantineSkeleton {...props} />;
};

export default Skeleton;
