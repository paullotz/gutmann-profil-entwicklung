export interface RiskQuestion {
  id: string;
  question: string;
  options: Array<{
    value: string;
    title: string;
    description: string;
    riskScore: number; // 0-100, höher = risikofreudiger
  }>;
  category: 'loss_aversion' | 'regret_aversion' | 'time_horizon' | 'volatility' | 'opportunity' | 'emergency';
}

export interface StepProps {
	setData: React.Dispatch<React.SetStateAction<FormData>>
	data: FormData
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
    retirement: GoalDetail;
    realEstate: GoalDetail;
    wealth: GoalDetail;
    other: GoalDetail;
  };
}

export interface GoalDetail {
  priority: number;
  horizon: string;
}

export interface Step2Data {
  income: string;
  expenses: string;
  assets: string;
  liabilities: string;
  pensionGap: string;
  equityForRealEstate: string;
}

export interface Step3Data {
  moneyFeelings: string[];
  lifestyleVsSecurity: number;
  retirementConfidence: number;
  financialKnowledge: number;
  decisionStyle: string;
  investmentExperience: string;
}

export interface ScenarioOption {
    title: string;
    description: string;
    value: string;
}

export interface Step4Data {
  scenarios: GeneratedScenario[];  // Array statt einzelnes Szenario
  answers: Record<string, string>; // Record für mehrere Antworten
}

export interface Step5Data {
  riskProfileAnswers: Record<string, string>;
  financialWorries: string;
}

export interface FormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

export interface GeminiAnalysis {
  scoreText: string;
  analyse: string;
  chartData: {
    subject: string;
    value: number;
  }[];
  detailedAnalysis: {
    subject: string;
    explanation: string;
  }[];
}

export interface GeneratedScenario {
  id: string;
  scenario: string;
  options: ScenarioOption[];
}

export interface GeneratedScenarios {
  scenarios: GeneratedScenario[];
}
