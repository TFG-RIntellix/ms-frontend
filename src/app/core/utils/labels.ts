import { TagSeverity } from './tag-severity';

export const statusLabel: Record<string, string> = {
  PENDIENTE_DE_REVISION: 'Pendiente de revisión',
  REVISADO: 'Revisado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado'
};

export const statusSeverity: Record<string, TagSeverity> = {
  PENDIENTE_DE_REVISION: 'warn',
  REVISADO: 'info',
  APROBADO: 'success',
  RECHAZADO: 'danger'
};

export const requestTypeLabel: Record<string, string> = {
  PRESTAMO: 'Préstamo',
  HIPOTECA: 'Hipoteca',
  TARJETA_CREDITO: 'Tarjeta de crédito'
};

export const purposeLabel: Record<string, string> = {
  COMPRA_VIVIENDA: 'Compra de vivienda',
  MEJORA_VIVIENDA: 'Mejora de vivienda',
  COMPRA_VEHICULO: 'Compra de vehículo',
  REFORMA_HOGAR: 'Reforma del hogar',
  EDUCACION: 'Educación',
  SALUD: 'Salud',
  CONSOLIDACION_DEUDA: 'Consolidación de deuda',
  ELECTRODOMESTICOS: 'Electrodomésticos',
  TECNOLOGIA: 'Tecnología',
  VIAJES: 'Viajes',
  OTROS: 'Otros'
};

export const genderLabel: Record<string, string> = {
  MUJER: 'Mujer',
  HOMBRE: 'Hombre',
  OTRO: 'Otro'
};

export const maritalStatusLabel: Record<string, string> = {
  SOLTERO: 'Soltero/a',
  CASADO: 'Casado/a',
  DIVORCIADO: 'Divorciado/a',
  VIUDO: 'Viudo/a'
};

export const educationLabel: Record<string, string> = {
  SIN_ESTUDIOS: 'Sin estudios',
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
  BACHILLERATO: 'Bachillerato',
  FORMACION_PROFESIONAL: 'Formación profesional',
  GRADO: 'Grado universitario',
  POSGRADO: 'Posgrado'
};

export const employmentStatusLabel: Record<string, string> = {
  TEMPORAL: 'Temporal',
  INDEFINIDO: 'Indefinido',
  FUNCIONARIO: 'Funcionario/a',
  AUTONOMO: 'Autónomo/a',
  DESEMPLEADO: 'Desempleado/a',
  INACTIVO: 'Inactivo/a'
};

export const homeOwnershipLabel: Record<string, string> = {
  PROPIA_PAGADA: 'Propia (pagada)',
  PROPIA_HIPOTECA: 'Propia con hipoteca',
  ALQUILER: 'Alquiler',
  CEDIDA: 'Cedida'
};

export const riskGradeColor: Record<string, string> = {
  A: 'success',
  B: 'success',
  C: 'info',
  D: 'info',
  E: 'warn',
  F: 'warn',
  G: 'danger',
  H: 'danger'
};

export const employmentStatusOptions = Object.entries(employmentStatusLabel).map(([value, label]) => ({ value, label }));
export const purposeOptions = Object.entries(purposeLabel).map(([value, label]) => ({ value, label }));
