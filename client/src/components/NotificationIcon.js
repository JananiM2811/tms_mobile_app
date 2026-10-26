import React from 'react';
import { FiBell } from './Icons';

/**
 * Clean monochrome notification bell icon from react-icons.
 * Outline stroke, without colorful fill.
 */
export const NotificationIcon = ({ size = 18, color = '#475569', style }) => {
  return <FiBell size={size} color={color} style={style} />;
};
