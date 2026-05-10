/**
 * @fileoverview Utilities - Función cn() para clases condicionales
 * @fileoverview Utilities - cn() function for conditional classes
 * @module lib/utils
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind condicionalmente
 * Combines Tailwind classes conditionally
 * @param {...ClassValue} inputs - Classes to merge
 * @returns {string} Merged classes
 * 
 * @example
 * cn('base-class', isActive && 'active-class')
 * cn('px-4 py-2', variant === 'primary' && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
