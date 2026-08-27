import { DynamicField } from '../../shared/models/dynamic-form.model';
import { RequestDetails } from '../models/request.model';
import { employmentStatusOptions } from '../utils/labels';

/**
 * Mapper utility to generate dynamic form fields based on the specific type of credit request.
 * It merges the original request details with any ongoing form modifications.
 */
export class DynamicFormMapper {
  /**
   * Generates a list of dynamic form fields tailored to the request type (e.g. Mortgage vs Credit Card).
   * 
   * @param req The original request details fetched from the API.
   * @param formChanges Any current unsaved modifications made by the user in the UI.
   * @returns An array of DynamicField configurations used to render the form.
   */
  static buildFields(req: RequestDetails | undefined, formChanges?: Record<string, unknown>): DynamicField[] {
    if (!req) return [];

    const requestType = req.requestType ?? 'PRESTAMO';

    // Helper function to extract the current value for a field.
    // It prioritizes the unsaved formChanges over the original request data.
    const getValue = (key: string, sourceKey?: string) => {
      const reqVal = ((req as unknown) as Record<string, unknown>)[sourceKey ?? key];
      return formChanges ? (formChanges[key] ?? formChanges[sourceKey ?? key] ?? reqVal) : reqVal;
    };

    const common: DynamicField[] = [
      { key: 'employmentStatus', sourceKey: 'partyLaboralSituation', label: 'Situación laboral', type: 'select', options: employmentStatusOptions, value: getValue('employmentStatus', 'partyLaboralSituation') },
      { key: 'annualIncome', sourceKey: 'partyIncome', label: 'Ingresos anuales', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('annualIncome', 'partyIncome') }
    ];

    switch (requestType) {
      case 'TARJETA_CREDITO':
        return [
          { key: 'creditLimit', sourceKey: 'creditLimit', label: 'Límite de crédito', type: 'number', prefix: '€ ', validators: { min: 0, step: 100 }, value: getValue('creditLimit', 'creditLimit') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          { key: 'isRevolving', sourceKey: 'isRevolving', label: 'Revolving', type: 'boolean', value: getValue('isRevolving') ?? false },
          ...common
        ];
      case 'HIPOTECA':
        return [
          { key: 'loanAmount', sourceKey: 'loanAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('loanAmount', 'loanAmount') },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: getValue('termMonths', 'requestTermMonths') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          { key: 'propertyValue', sourceKey: 'propertyValue', label: 'Valor de la propiedad', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('propertyValue') },
          { key: 'hasMortgage', label: 'Tiene otra hipoteca', type: 'boolean', value: getValue('hasMortgage') ?? false },
          ...common
        ];
      default:
        // PRESTAMO
        return [
          { key: 'loanAmount', sourceKey: 'loanAmount', label: 'Importe solicitado', type: 'number', prefix: '€ ', validators: { min: 0, step: 1000 }, value: getValue('loanAmount', 'loanAmount') },
          { key: 'termMonths', sourceKey: 'requestTermMonths', label: 'Plazo (meses)', type: 'number', suffix: ' meses', validators: { min: 1, step: 12 }, value: getValue('termMonths', 'requestTermMonths') },
          { key: 'interestRate', sourceKey: 'interestRate', label: 'Tipo de interés', type: 'number', suffix: ' %', validators: { min: 0, max: 100, step: 0.01 }, value: getValue('interestRate') },
          { key: 'loanType', label: 'Tipo de préstamo', type: 'text', value: getValue('loanType') ?? '-' },
          { key: 'repaymentSystem', label: 'Sistema amortización', type: 'text', value: getValue('repaymentSystem') ?? '-' },
          ...common
        ];
    }
  }

  /**
   * Extracts the primary monetary amount from a request based on its type.
   * 
   * @param req The request details.
   * @returns The main requested amount or credit limit.
   */
  static getMainAmount(req: RequestDetails): number {
    if (req.requestType === 'TARJETA_CREDITO') {
      return req.creditLimit ?? 0;
    }
    return req.loanAmount ?? 0;
  }
}
