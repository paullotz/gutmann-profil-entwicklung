export interface GoalDetails {
    priority: number;
    horizon: string;
}

export interface Step1Data {
  lifePhase: string;
  goals: {
    retirement: boolean;
    realEstate: boolean;
    wealth: boolean;
    other: boolean;
  };
  goalDetails: {
    retirement: GoalDetails;
    realEstate: GoalDetails;
    wealth: GoalDetails;
    other: GoalDetails;
  };
}

export interface Step2Data {
  income: string;
  expenses: string;
  assets: string;
  liabilities: string;
  pensionGap?: string;
  equityForRealEstate?: string;
}

export interface Step3Data {
  moneyFeelings: string[];
  lifestyleVsSecurity: number;
  retirementConfidence?: number;
}

export interface Step4Data {
  riskReaction: string;
  financialWorries?: string;
  scenarioQuestion: string; // Store the exact question asked
  scenarioType: string; // e.g., 'portfolio_loss', 'opportunity', 'inflation'
}

export interface FormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

export interface GeminiAnalysis {
    analyse: string;
    scoreText: string;
    chartData: {
        risiko: number;
        sparen: number;
        planung: number;
        liquiditaet: number;
        vermoegen: number;
        lifestyle: number;
    }
}
