import React from 'react';
import Feather from '@expo/vector-icons/Feather';

const createIcon = (name) => {
  const Icon = ({ size = 16, color = '#64748B', style, ...rest }) => {
    const numSize = typeof size === 'string' ? parseInt(size, 10) || 16 : size;
    return <Feather name={name} size={numSize} color={color} style={style} {...rest} />;
  };
  Icon.displayName = `Fi_${name}`;
  return Icon;
};

// Core Icons
export const FiShield = createIcon('shield');
export const FiUsers = createIcon('users');
export const FiTool = createIcon('tool');
export const FiUserCheck = createIcon('user-check');
export const FiMessageSquare = createIcon('message-square');
export const FiBell = createIcon('bell');
export const FiLayers = createIcon('layers');
export const FiActivity = createIcon('activity');
export const FiBookOpen = createIcon('book-open');
export const FiLock = createIcon('lock');
export const FiArrowRight = createIcon('arrow-right');
export const FiArrowLeft = createIcon('arrow-left');
export const FiSettings = createIcon('settings');
export const FiCheckSquare = createIcon('check-square');
export const FiCheckCircle = createIcon('check-circle');
export const FiClock = createIcon('clock');
export const FiSend = createIcon('send');
export const FiCheck = createIcon('check');
export const FiZap = createIcon('zap');
export const FiEye = createIcon('eye');
export const FiEyeOff = createIcon('eye-off');
export const FiPaperclip = createIcon('paperclip');
export const FiImage = createIcon('image');
export const FiChevronDown = createIcon('chevron-down');
export const FiChevronRight = createIcon('chevron-right');
export const FiChevronLeft = createIcon('chevron-left');
export const FiChevronUp = createIcon('chevron-up');
export const FiMoreVertical = createIcon('more-vertical');
export const FiCircle = createIcon('circle');
export const FiPlusCircle = createIcon('plus-circle');
export const FiAlertCircle = createIcon('alert-circle');
export const FiAlertTriangle = createIcon('alert-triangle');
export const FiTrendingUp = createIcon('trending-up');
export const FiLogOut = createIcon('log-out');
export const FiPlus = createIcon('plus');
export const FiSearch = createIcon('search');
export const FiFilter = createIcon('filter');
export const FiRefreshCw = createIcon('refresh-cw');
export const FiGrid = createIcon('grid');
export const FiList = createIcon('list');
export const FiUser = createIcon('user');
export const FiSmile = createIcon('smile');
export const FiFolder = createIcon('folder');
export const FiMenu = createIcon('menu');
export const FiX = createIcon('x');
export const FiDownload = createIcon('download');
export const FiStar = createIcon('star');
export const FiAward = createIcon('award');
export const FiCpu = createIcon('cpu');
export const FiCamera = createIcon('camera');
export const FiTrash2 = createIcon('trash-2');
export const FiMail = createIcon('mail');
export const FiPhone = createIcon('phone');
export const FiBriefcase = createIcon('briefcase');
export const FiHelpCircle = createIcon('help-circle');
export const FiFileText = createIcon('file-text');
export const FiTag = createIcon('tag');
export const FiExternalLink = createIcon('external-link');
export const FiThumbsUp = createIcon('thumbs-up');
export const FiBarChart2 = createIcon('bar-chart-2');
export const FiPieChart = createIcon('pie-chart');
export const FiInfo = createIcon('info');
export const FiHash = createIcon('hash');
export const FiEdit = createIcon('edit');
export const FiEdit2 = createIcon('edit-2');
export const FiEdit3 = createIcon('edit-3');
export const FiKey = createIcon('key');
export const FiUpload = createIcon('upload');
export const FiCalendar = createIcon('calendar');
export const FiCopy = createIcon('copy');
export const FiSave = createIcon('save');
export const FiSliders = createIcon('sliders');
export const FiToggleLeft = createIcon('toggle-left');
export const FiToggleRight = createIcon('toggle-right');

// Default export
const allIcons = {
  FiShield,
  FiUsers,
  FiTool,
  FiUserCheck,
  FiMessageSquare,
  FiBell,
  FiLayers,
  FiActivity,
  FiBookOpen,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiSend,
  FiCheck,
  FiZap,
  FiEye,
  FiEyeOff,
  FiPaperclip,
  FiImage,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiUser,
  FiSmile,
  FiFolder,
  FiMenu,
  FiX,
  FiDownload,
  FiStar,
  FiAward,
  FiCpu,
  FiCamera,
  FiTrash2,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiHelpCircle,
  FiFileText,
  FiTag,
  FiExternalLink,
  FiThumbsUp,
  FiBarChart2,
  FiInfo,
  FiHash,
};

export default allIcons;
