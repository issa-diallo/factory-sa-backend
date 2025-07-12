import { Request } from 'express';

/**
 * Récupère l'adresse IP réelle du client à partir de la requête
 * Prend en compte les en-têtes de proxy courants et valide le format de l'IP
 */
export const getClientIp = (req: Request): string => {
  // Vérifier les en-têtes courants
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  // Extraire la première IP de x-forwarded-for si présente (format: client, proxy1, proxy2)
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0].trim();
    if (isValidIp(ips)) return ips;
  }

  // Vérifier x-real-ip
  if (realIp && isValidIp(realIp.toString())) {
    return realIp.toString();
  }

  // Utiliser req.ip comme solution de repli
  return req.ip?.replace('::ffff:', '') || '127.0.0.1';
};

/**
 * Valide si une chaîne est une adresse IP valide (IPv4 ou IPv6)
 */
const isValidIp = (ip: string): boolean => {
  // Validation simple pour IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    // Vérifier que chaque octet est entre 0 et 255
    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Validation basique pour IPv6 (peut être améliorée)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
};
