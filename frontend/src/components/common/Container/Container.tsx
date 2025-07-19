import React from 'react';
import { Container as MantineContainer } from '@mantine/core';

type ContainerProps = React.ComponentProps<typeof MantineContainer>;

/**
 * A common layout Container wrapper based on Mantine's Container
 */
const Container: React.FC<ContainerProps> = (props) => {
  return <MantineContainer {...props} />;
};

export default Container;
