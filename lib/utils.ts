import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化用户积分显示，始终显示一位小数
 * @param credits 积分数值
 * @returns 格式化后的字符串，如 "123.4"
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(1);
}

/**
 * 格式化用户积分显示带单位
 * @param credits 积分数值
 * @param unit 单位，默认为"积分"
 * @returns 格式化后的字符串，如 "123.4 积分"
 */
export function formatCreditsWithUnit(credits: number, unit: string = '积分'): string {
  return `${credits.toFixed(1)} ${unit}`;
}
