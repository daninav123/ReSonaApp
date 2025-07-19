import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button, Stack, Box, Avatar, Typography, Divider } from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import Share from '@mui/icons-material/Share';
import MoreVert from '@mui/icons-material/MoreVert';
import Add from '@mui/icons-material/Add';
import { useState } from 'react';

const meta: Meta<typeof Card> = {
  title: 'Components/Common/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevation', 'outlined'],
      description: 'The variant of the card',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'elevation' },
      },
    },
    elevation: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
      description: 'The elevation of the card (0-24)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 1 },
      },
    },
    hoverElevation: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
      description: 'The elevation of the card when hovered (0-24)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 4 },
      },
    },
    clickable: {
      control: 'boolean',
      description: 'If true, the card will be clickable',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    rounded: {
      control: 'boolean',
      description: 'If true, the card will have border radius',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: true },
      },
    },
    padding: {
      control: 'text',
      description: 'The padding of the card content',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 2 },
      },
    },
    maxWidth: {
      control: 'text',
      description: 'The maximum width of the card',
    },
    minHeight: {
      control: 'text',
      description: 'The minimum height of the card',
    },
    backgroundColor: {
      control: 'color',
      description: 'The background color of the card',
    },
    loading: {
      control: 'boolean',
      description: 'If true, the card will show a loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
  args: {
    variant: 'elevation',
    elevation: 1,
    hoverElevation: 4,
    clickable: false,
    rounded: true,
    padding: 2,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Sample content for cards
const sampleContent = (
  <>
    <Typography variant="body1" color="text.secondary">
      This is a sample card content. You can put any React node as content.
      Cards are surfaces that display content and actions on a single topic.
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      They should be easy to scan for relevant and actionable information.
    </Typography>
  </>
);

export const Basic: Story = {
  args: {
    content: sampleContent,
  },
};

export const WithHeader: Story = {
  args: {
    title: 'Card Title',
    subheader: 'Card Subheader',
    content: sampleContent,
  },
};

export const WithHeaderAndActions: Story = {
  args: {
    title: 'Card with Actions',
    subheader: 'September 14, 2023',
    avatar: <Avatar>A</Avatar>,
    headerAction: (
      <Button size="small" startIcon={<MoreVert />}>
        More
      </Button>
    ),
    actions: (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button size="small" startIcon={<Favorite />}>
          Like
        </Button>
        <Button size="small" startIcon={<Share />}>
          Share
        </Button>
      </Box>
    ),
    content: sampleContent,
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    subheader: 'Click anywhere on the card',
    clickable: true,
    onClick: () => alert('Card clicked!'),
    content: (
      <Typography variant="body1" color="text.secondary">
        This card is clickable. Try clicking anywhere on it!
      </Typography>
    ),
  },
};

export const OutlinedVariant: Story = {
  args: {
    variant: 'outlined',
    title: 'Outlined Card',
    content: (
      <Typography variant="body1" color="text.secondary">
        This card uses the outlined variant instead of elevation.
      </Typography>
    ),
  },
};

export const CustomElevation: Story = {
  args: {
    title: 'Custom Elevation',
    elevation: 8,
    hoverElevation: 16,
    content: (
      <Typography variant="body1" color="text.secondary">
        This card has custom elevation and hover elevation values.
      </Typography>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    title: 'Loading Card',
    loading: true,
    content: 'This content will be replaced by a loading indicator',
  },
};

// Interactive example with state
export const Interactive: Story = {
  render: function Render() {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);

    return (
      <Card
        title="Interactive Card"
        subheader={`Clicked ${count} times`}
        actions={
          <Button 
            startIcon={<Favorite color={liked ? 'error' : 'inherit'} />} 
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
          >
            {liked ? 'Liked' : 'Like'}
          </Button>
        }
        clickable
        onClick={() => setCount(count + 1)}
        sx={{ maxWidth: 400 }}
      >
        <Typography variant="body1" color="text.secondary">
          Click anywhere on the card to increment the counter, or click the like button to toggle its state.
        </Typography>
      </Card>
    );
  },
};

// Example of a product card
export const ProductCard: Story = {
  render: () => (
    <Card
      sx={{
        maxWidth: 300,
        '&:hover .product-image': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          overflow: 'hidden',
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Box
          className="product-image"
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://source.unsplash.com/random/400x300?product)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </Box>
      <Typography variant="h6" component="div" noWrap>
        Premium Quality T-Shirt
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Comfortable and stylish
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h6" color="primary">
          $29.99
        </Typography>
        <Button variant="contained" size="small" startIcon={<Add />}>
          Add to Cart
        </Button>
      </Box>
    </Card>
  ),
};

// Example of a user profile card
export const ProfileCard: Story = {
  render: () => (
    <Card sx={{ maxWidth: 300 }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          alt="User Avatar"
          src="https://randomuser.me/api/portraits/women/44.jpg"
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography variant="h6" component="div">
          Jane Doe
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Frontend Developer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Passionate about creating beautiful and accessible user interfaces.
        </Typography>
        <Divider sx={{ my: 2, width: '100%' }} />
        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
          <Button variant="outlined" size="small">
            Message
          </Button>
          <Button variant="contained" size="small">
            Follow
          </Button>
        </Box>
      </Box>
    </Card>
  ),
};

const Template: Story = (args) => <Card {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  title: 'Card Title',
  subheader: 'Card Subheader',
  content: (
    <Typography variant="body1" color="text.secondary">
      Customize this card using the controls in the panel below.
    </Typography>
  ),
  actions: (
    <Button size="small">Action</Button>
  ),
  variant: 'elevation',
  elevation: 1,
  hoverElevation: 4,
  clickable: false,
  rounded: true,
  padding: 2,
  maxWidth: '400px',
  backgroundColor: '',
  loading: false,
};
