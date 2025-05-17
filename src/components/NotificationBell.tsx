'use client';

import { useState, useEffect, useRef } from 'react';
import { notificationService } from '@/app/services/api';
import { useSession } from 'next-auth/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBadge from './NotificationBadge';

export default function NotificationBell() {
  return <NotificationBadge />;
} 