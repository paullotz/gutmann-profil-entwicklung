import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { financialChecks } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const generateConsultationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "GUT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const validateApiKey = (request: NextRequest): boolean => {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('API_KEY is not configured in environment variables');
    return false;
  }

  return apiKey === validApiKey;
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { formData, analysis } = body;

    let consultationCode = generateConsultationCode();
    
    let existingCode = await db
      .select()
      .from(financialChecks)
      .where(eq(financialChecks.consultationCode, consultationCode))
      .limit(1);
    
    while (existingCode.length > 0) {
      consultationCode = generateConsultationCode();
      existingCode = await db
        .select()
        .from(financialChecks)
        .where(eq(financialChecks.consultationCode, consultationCode))
        .limit(1);
    }

    const [entry] = await db
      .insert(financialChecks)
      .values({
        consultationCode,
        // Step 1
        lifePhase: formData.step1.lifePhase,
        goals: formData.step1.goals,
        goalDetails: formData.step1.goalDetails,
        // Step 2
        income: formData.step2.income,
        expenses: formData.step2.expenses,
        assets: formData.step2.assets,
        liabilities: formData.step2.liabilities,
        pensionGap: formData.step2.pensionGap,
        equityForRealEstate: formData.step2.equityForRealEstate,
        // Step 3
        moneyFeelings: formData.step3.moneyFeelings,
        lifestyleVsSecurity: formData.step3.lifestyleVsSecurity,
        retirementConfidence: formData.step3.retirementConfidence,
        financialKnowledge: formData.step3.financialKnowledge,
        decisionStyle: formData.step3.decisionStyle,
        investmentExperience: formData.step3.investmentExperience,
        // Step 4
        scenario: formData.step4.scenario,
        scenarioOptions: formData.step4.options,
        scenarioAnswer: formData.step4.answer,
        // Step 5
        riskProfileAnswers: formData.step5.riskProfileAnswers,
        financialWorries: formData.step5.financialWorries,
        // Analysis
        analysisScore: analysis.scoreText,
        analysisText: analysis.analyse,
        chartData: analysis.chartData,
        detailedAnalysis: analysis.detailedAnalysis,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        consultationCode: entry.consultationCode,
        createdAt: entry.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Insert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save data',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key',
    }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const limit = searchParams.get('limit');

    if (code) {
      const [entry] = await db
        .select()
        .from(financialChecks)
        .where(eq(financialChecks.consultationCode, code))
        .limit(1);

      if (!entry) {
        return NextResponse.json({
          success: false,
          error: 'Code not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: entry,
      });
    }

    let query = db
      .select()
      .from(financialChecks)
      .orderBy(desc(financialChecks.createdAt));

    const allEntries = await query;

    return NextResponse.json({
      success: true,
      data: allEntries,
      count: allEntries.length,
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
    }, { status: 500 });
  }
}
