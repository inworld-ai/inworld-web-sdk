import { Avatar, Badge, Box, styled, SxProps, Tooltip } from '@mui/material';
import { FC } from 'react';

interface WrapperProps {
  size?: string | number;
}

interface Props {
  src?: string;
  size?: string | number;
  name?: string;
  sx?: SxProps;
  active?: boolean;
  onClick?: () => void;
}

const AvatarWrapper = styled(Box)<WrapperProps>(({ size }) => ({
  width: size,
  height: size,
  objectFit: 'cover',
  overflow: 'hidden',
  '& img': {
    height: 'auto',
    maxWidth: '100',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export const CircularRpmAvatar: FC<Props> = ({
  src,
  size = '64px',
  name,
  sx,
  active,
  onClick,
}) => {
  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant={active ? 'dot' : 'standard'}
    >
      <AvatarWrapper sx={sx} size={size} onClick={onClick}>
        {src ? (
          <Avatar src={src} alt={`Avatar of ${name}`} />
        ) : (
          <Tooltip title={name}>
            <Avatar>{name?.[0]}</Avatar>
          </Tooltip>
        )}
      </AvatarWrapper>
    </StyledBadge>
  );
};
