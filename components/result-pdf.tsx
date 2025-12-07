import React from 'react';
import { Document, Page, Text, View, StyleSheet, DocumentProps } from '@react-pdf/renderer';
import type { FormData, GeminiAnalysis } from '@/lib/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 11,
    color: '#666',
  },
  value: {
    width: '60%',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scoreBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  detailBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  codeBox: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: 15,
    borderRadius: 5,
    textAlign: 'center',
    marginTop: 20,
  },
  codeLabel: {
    fontSize: 10,
    marginBottom: 5,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

interface Props {
  formData: FormData;
  analysis: GeminiAnalysis;
  consultationCode: string;
}

export const FinancialCheckPDF: React.FC<DocumentProps & Props> = ({ formData, analysis, consultationCode }) => {
  const { step1, step2, step3 } = formData;

  return (
    <Document>
      {/* Seite 1: Übersicht */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Financial Health Check</Text>
          <Text style={styles.subtitle}>
            Ihre persönliche Finanzanalyse - {new Date().toLocaleDateString('de-DE')}
          </Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{analysis.scoreText}</Text>
          <Text style={styles.analysisText}>{analysis.analyse}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ihre Finanzsituation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Monatliches Nettoeinkommen:</Text>
            <Text style={styles.value}>€ {step2.income || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monatliche Ausgaben:</Text>
            <Text style={styles.value}>€ {step2.expenses || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Liquides Vermögen:</Text>
            <Text style={styles.value}>€ {step2.assets || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verbindlichkeiten:</Text>
            <Text style={styles.value}>€ {step2.liabilities || '0'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ihre Ziele</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Lebensphase:</Text>
            <Text style={styles.value}>{step1.lifePhase}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Altersvorsorge:</Text>
            <Text style={styles.value}>{step1.goals.retirement ? 'Ja' : 'Nein'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Immobilie:</Text>
            <Text style={styles.value}>{step1.goals.realEstate ? 'Ja' : 'Nein'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vermögensaufbau:</Text>
            <Text style={styles.value}>{step1.goals.wealth ? 'Ja' : 'Nein'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ihr Money Mindset</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Finanzwissen:</Text>
            <Text style={styles.value}>{step3.financialKnowledge}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Investmenterfahrung:</Text>
            <Text style={styles.value}>{step3.investmentExperience}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Entscheidungsstil:</Text>
            <Text style={styles.value}>{step3.decisionStyle || '-'}</Text>
          </View>
        </View>

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Ihr persönlicher Beratungscode</Text>
          <Text style={styles.codeText}>{consultationCode}</Text>
        </View>

        <Text style={styles.footer}>
          Gutmann Kompass | Vertraulich
        </Text>
      </Page>

      {/* Seite 2: Detailanalyse */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Detail-Analyse</Text>
          <Text style={styles.subtitle}>Aufschlüsselung nach Kernbereichen</Text>
        </View>

        <View style={styles.section}>
          {analysis.detailedAnalysis.map((detail, index) => {
            const chartItem = analysis.chartData.find(item => item.subject === detail.subject);
            const score = chartItem ? chartItem.value : 0;

            return (
              <View key={index} style={styles.detailBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.detailTitle}>{detail.subject}</Text>
                  <Text style={styles.detailScore}>{score} / 100</Text>
                </View>
                <Text style={styles.analysisText}>{detail.explanation}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nächste Schritte</Text>
          <Text style={styles.analysisText}>
            Vereinbaren Sie ein persönliches Gespräch mit einem Bank Gutmann Experten, 
            um Ihre individuellen Ziele zu besprechen und eine maßgeschneiderte Strategie zu entwickeln.
          </Text>
          <Text style={[styles.analysisText, { marginTop: 10 }]}>
            Verwenden Sie Ihren Beratungscode {consultationCode} bei der Terminvereinbarung.
          </Text>
        </View>

        <Text style={styles.footer}>
          Gutmann Kompass | Vertraulich | Seite 2
        </Text>
      </Page>
    </Document>
  );
};
