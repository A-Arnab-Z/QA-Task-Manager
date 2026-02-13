import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(deadline: string) {
  return new Date(deadline).getTime() < Date.now();
}
