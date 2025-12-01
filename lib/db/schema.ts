// lib/db/schema.ts
import { pgTable, text, timestamp, serial, jsonb, integer } from 'drizzle-orm/pg-core';

export const financialChecks = pgTable('financial_checks', {
  id: serial('id').primaryKey(),
  consultationCode: text('consultation_code').notNull().unique(),
  
  lifePhase: text('life_phase').notNull(),
  goals: jsonb('goals').notNull(), 
  goalDetails: jsonb('goal_details').notNull(),
  
  income: text('income'),
  expenses: text('expenses'),
  assets: text('assets'),
  liabilities: text('liabilities'),
  pensionGap: text('pension_gap'),
  equityForRealEstate: text('equity_for_real_estate'),
  
  moneyFeelings: jsonb('money_feelings').notNull(),
  lifestyleVsSecurity: integer('lifestyle_vs_security').notNull(),
  retirementConfidence: integer('retirement_confidence'),
  financialKnowledge: integer('financial_knowledge').notNull(),
  decisionStyle: text('decision_style'),
  investmentExperience: text('investment_experience').notNull(),
  
  scenario: text('scenario'),
  scenarioOptions: jsonb('scenario_options'), // ScenarioOption[]
  scenarioAnswer: text('scenario_answer'),
  
  riskProfileAnswers: jsonb('risk_profile_answers').notNull(),
  financialWorries: text('financial_worries'),
  
  analysisScore: text('analysis_score'),
  analysisText: text('analysis_text'),
  chartData: jsonb('chart_data'), 
  detailedAnalysis: jsonb('detailed_analysis'), 
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testerFeedback = pgTable('tester_feedback', {
  id: serial('id').primaryKey(),
  consultationCode: text('consultation_code'),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type FinancialCheck = typeof financialChecks.$inferSelect;
export type NewFinancialCheck = typeof financialChecks.$inferInsert;
export type NewTesterFeedback = typeof testerFeedback.$inferInsert;
