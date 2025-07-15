import { Request } from 'express';

export const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();
    if (isValidIp(ips)) return ips;
  }

  if (realIp && isValidIp(realIp.toString())) {
    return realIp.toString();
  }

  return req.ip?.replace('::ffff:', '') || '127.0.0.1';
};

/**
 * Validates whether a string is a valid IP address (IPv4 or IPv6)
 */
const isValidIp = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
};
