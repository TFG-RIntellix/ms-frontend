import { Scoring } from '../models/scoring.model';
import { DraftResponse, SimulationDetails, SimulationMetrics } from '../models/simulation.model';
import { RequestDetails } from '../models/request.model';
import { TagSeverity } from '../utils/tag-severity';

/**
 * Represents a single row of metric comparison (Base vs Simulated).
 */
export interface MetricRow {
  label: string;
  base: number;
  sim: number;
  delta: number;
  isCurrency: boolean;
  invert: boolean;
  format?: string;
  hidden?: boolean;
}

/**
 * Utility class to map API simulation and scoring data into structured UI models.
 * Handles the differences between full simulations and temporary drafts.
 */
export class SimulationMetricsMapper {

  /**
   * Builds an array of MetricRow to compare the original scoring vs the simulated/draft results.
   * 
   * @param scoring The original scoring baseline.
   * @param draftOrSim The simulated results. Can be a full SimulationDetails or a temporary DraftResponse.
   * @returns Array of formatted MetricRow for the comparison table.
   */
  static buildMetricRows(scoring: Scoring, draftOrSim: DraftResponse | SimulationDetails | undefined): MetricRow[] {
    if (!scoring) return [];

    // If no simulation is provided, return base values with zeroed simulation columns.
    const simResults = draftOrSim && 'simulatedResults' in draftOrSim ? draftOrSim.simulatedResults : undefined;
    const delta = draftOrSim && 'delta' in draftOrSim ? draftOrSim.delta : undefined;



    let simPd = 0, simLgd = 0, simEad = 0, simEcl = 0;

    // Support both nested DraftResponse structure and flat SimulationDetails structure.
    if (simResults) {
      simPd = simResults.pd ?? 0;
      simLgd = simResults.lgd ?? 0;
      simEad = simResults.ead ?? 0;
      simEcl = simResults.ecl ?? 0;
    } else if (draftOrSim && 'simulatedPd' in draftOrSim) {
      // Fallback for flat SimulationDetails structure.
      simPd = (draftOrSim as any).simulatedPd ?? 0;
      simLgd = (draftOrSim as any).simulatedLgd ?? 0;
      simEad = (draftOrSim as any).simulatedEad ?? 0;
      simEcl = (draftOrSim as any).simulatedEcl ?? 0;
    }

    return [
      { label: 'PD (%)', base: (scoring.pd ?? 0) * 100, sim: simPd * 100, delta: (delta?.pdChange ?? 0) * 100, isCurrency: false, invert: true, format: '1.2-2' },
      { label: 'LGD (%)', base: (scoring.lgd ?? 0) * 100, sim: simLgd * 100, delta: (delta?.lgdChange ?? 0) * 100, isCurrency: false, invert: true, format: '1.2-2' },
      { label: 'EAD', base: scoring.ead ?? 0, sim: simEad, delta: delta?.eadChange ?? 0, isCurrency: true, invert: true },
      { label: 'ECL', base: scoring.ecl ?? 0, sim: simEcl, delta: delta?.eclChange ?? 0, isCurrency: true, invert: true },
      {
        label: 'Cuota mensual',
        base: scoring.monthlyPayment ?? 0,
        sim: simResults?.monthlyPayment ?? 0,
        delta: delta?.monthlyPaymentChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'DTI (%)',
        base: (scoring.dti ?? 0) * 100,
        sim: (simResults?.dti ?? 0) * 100,
        delta: (delta?.dtiChange ?? 0) * 100,
        isCurrency: false,
        invert: true,
        format: '1.2-2',
        hidden: !simResults
      },
      {
        label: 'Pago total',
        base: scoring.totalPayment ?? 0,
        sim: simResults?.totalPayment ?? 0,
        delta: delta?.totalPaymentChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'Intereses totales',
        base: scoring.totalInterest ?? 0,
        sim: simResults?.totalInterest ?? 0,
        delta: delta?.totalInterestChange ?? 0,
        isCurrency: true,
        invert: true,
        hidden: !simResults
      },
      {
        label: 'Ingreso disponible',
        base: scoring.monthlyDisposableIncome ?? 0,
        sim: simResults?.disposableIncome ?? 0,
        delta: delta?.monthlyDisposableIncomeChange ?? 0,
        isCurrency: true,
        invert: false,
        hidden: !simResults
      }
    ];
  }

  /**
   * Constructs the amortization configuration for charting, overriding base loan parameters
   * with any active form changes if a simulation is currently being tweaked.
   * 
   * @param req The base request details.
   * @param score The base scoring details.
   * @param formChanges The current unsubmitted form values (if any).
   * @param simResults The calculated metrics from the simulation/draft.
   * @returns An object containing base and simulated amortization parameters, or null if missing core data.
   */
  static buildAmortizationConfig(req: RequestDetails, score: Scoring, formChanges: Record<string, unknown> | undefined, simResults: SimulationMetrics | undefined) {
    if (!req || !score) return null;
    const basePrincipal = req.loanAmount ?? req.creditLimit ?? score.ead;
    const baseRate = req.interestRate ?? 0;
    const baseMonths = req.requestTermMonths ?? 12;

    let simPrincipal = basePrincipal;
    let simRate = baseRate;
    let simMonths = baseMonths;

    if (formChanges) {
      simPrincipal = (formChanges['loanAmount'] as number) ?? (formChanges['creditLimit'] as number) ?? basePrincipal;
      simRate = (formChanges['interestRate'] as number) ?? baseRate;
      simMonths = (formChanges['termMonths'] as number) ?? baseMonths;
    }

    const simPayment = simResults?.monthlyPayment ?? 0;

    return {
      base: { principal: basePrincipal, rate: baseRate, months: baseMonths, payment: score.monthlyPayment, ecl: score.ecl },
      sim: simResults ? { principal: simPrincipal, rate: simRate, months: simMonths, payment: simPayment, ecl: simResults.ecl } : null
    };
  }

  /**
   * Maps a risk grade letter (e.g., 'A', 'D') to a UI severity color token.
   * 
   * @param grade The risk grade string.
   * @returns The corresponding TagSeverity color type.
   */
  static getRiskSeverity(grade: string | undefined): TagSeverity {
    if (!grade) return 'info';
    if (['A', 'B', 'C'].includes(grade)) return 'success';
    if (['D', 'E'].includes(grade)) return 'warn';
    return 'danger';
  }
}
