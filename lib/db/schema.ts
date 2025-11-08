// lib/db/schema.ts
import { pgTable, text, timestamp, serial, jsonb, integer } from 'drizzle-orm/pg-core';

export const financialChecks = pgTable('financial_checks', {
  id: serial('id').primaryKey(),
  consultationCode: text('consultation_code').notNull().unique(),
  
  // Step 1: Life Goals
  lifePhase: text('life_phase').notNull(),
  goals: jsonb('goals').notNull(), // {retirement, realEstate, wealth, other}
  goalDetails: jsonb('goal_details').notNull(),
  
  // Step 2: Financials
  income: text('income'),
  expenses: text('expenses'),
  assets: text('assets'),
  liabilities: text('liabilities'),
  pensionGap: text('pension_gap'),
  equityForRealEstate: text('equity_for_real_estate'),
  
  // Step 3: Mindset
  moneyFeelings: jsonb('money_feelings').notNull(), // string[]
  lifestyleVsSecurity: integer('lifestyle_vs_security').notNull(),
  retirementConfidence: integer('retirement_confidence'),
  financialKnowledge: integer('financial_knowledge').notNull(),
  decisionStyle: text('decision_style'),
  investmentExperience: text('investment_experience').notNull(),
  
  // Step 4: Scenario
  scenario: text('scenario'),
  scenarioOptions: jsonb('scenario_options'), // ScenarioOption[]
  scenarioAnswer: text('scenario_answer'),
  
  // Step 5: Risk Profile
  riskProfileAnswers: jsonb('risk_profile_answers').notNull(),
  financialWorries: text('financial_worries'),
  
  // Analysis Results
  analysisScore: text('analysis_score'),
  analysisText: text('analysis_text'),
  chartData: jsonb('chart_data'), // {subject, value}[]
  detailedAnalysis: jsonb('detailed_analysis'), // {subject, explanation}[]
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FinancialCheck = typeof financialChecks.$inferSelect;
export type NewFinancialCheck = typeof financialChecks.$inferInsert;
