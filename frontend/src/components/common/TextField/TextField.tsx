import React from 'react';
import { TextField as MuiTextField } from '@mui/material';
type TextFieldProps = React.ComponentProps<typeof MuiTextField>;

/**
 * Common TextField wrapper based on MUI TextField
 */
const TextField: React.FC<TextFieldProps> = (props) => {
  return <MuiTextField {...props} />;
};

export default TextField;
