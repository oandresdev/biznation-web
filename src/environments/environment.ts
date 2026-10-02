/**
 * La API se consume siempre en la ruta relativa /api/v1:
 *  - en desarrollo, `ng serve` la redirige a localhost:3000 (proxy.conf.json);
 *  - en AWS, CloudFront enruta /api/* hacia el ALB, así frontend y API comparten dominio y no hace falta CORS.
 */
export const environment = {
  apiUrl: '/api/v1',
} as const;
