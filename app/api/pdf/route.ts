import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';

import { FinancialCheckPDF } from '@/components/result-pdf';
import { FormData, GeminiAnalysis } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, analysis, consultationCode } = body as {
      formData: FormData;
      analysis: GeminiAnalysis;
      consultationCode: string;
    };

    if (!formData || !analysis) {
      return new NextResponse('Missing required data', { status: 400 });
    }

    const pdfStream = await ReactPDF.renderToStream(
      React.createElement(FinancialCheckPDF, {
        formData: formData,
        analysis: analysis,
        consultationCode: consultationCode,
        title: 'Ihr finanzieller Check',
      })
    );

    return new Response(pdfStream as any, { 
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="financial_check_${consultationCode}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
