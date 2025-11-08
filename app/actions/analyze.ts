"use server"

import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeminiAnalysis, GeneratedScenario } from '../../lib/types';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export async function generateDynamicScenario(data: Pick<FormData, 'step1' | 'step2' | 'step3'>): Promise<GeneratedScenario> {
    const relevantGoals = Object.entries(data.step1.goals)
      .filter(([, checked]) => checked)
      .map(([key]) => key)
      .join(", ") || "allgemeiner Vermögensaufbau";

    const prompt = `
        Basierend auf den folgenden Benutzerdaten, generiere ein einziges, personalisiertes Finanzszenario.
        Das Szenario soll ein realistisches Dilemma oder eine Entscheidungssituation darstellen, die für den Benutzer relevant ist.
        Die Sprache muss klar, verständlich und neutral sein.

        **Benutzerdaten:**
        - Lebensphase: ${data.step1.lifePhase}
        - Hauptziele: ${relevantGoals}
        - Monatliches Einkommen: ${data.step2.income} EUR
        - Monatliche Ausgaben: ${data.step2.expenses} EUR
        - Liquides Vermögen: ${data.step2.assets} EUR
        - Gefühle zu Geld: ${data.step3.moneyFeelings.join(", ")}
        - Investment-Erfahrung: ${data.step3.investmentExperience}

        **Anforderungen:**
        1.  **Szenario-Relevanz**: Das Szenario muss direkt auf die Ziele und die finanzielle Situation des Benutzers zugeschnitten sein.
            (z.B. Immobilien-Szenario bei Immobilien-Ziel, Anlage-Chance bei Vermögensaufbau-Ziel etc.)
        2.  **Drei Optionen**: Biete genau drei Handlungsoptionen an. Jede Option muss einen unterschiedlichen psychologischen Ansatz repräsentieren (z.B. risikoscheu/sicherheitsorientiert, ausgewogen/analytisch, risikofreudig/opportunistisch).
        3.  **Antwortformat**: Deine Antwort MUSS ein valides JSON-Objekt sein, das exakt dem folgenden Schema entspricht. Füge keine Erklärungen außerhalb des JSON-Objekts hinzu.

        \`\`\`json
        {
          "scenario": "Eine detaillierte, aber prägnante Beschreibung der Situation...",
          "options": [
            { "title": "Kurzer, prägnanter Titel für Option 1", "description": "Beschreibung der ersten Handlungsoption.", "value": "option_a" },
            { "title": "Kurzer, prägnanter Titel für Option 2", "description": "Beschreibung der zweiten Handlungsoption.", "value": "option_b" },
            { "title": "Kurzer, prägnanter Titel für Option 3", "description": "Beschreibung der dritten Handlungsoption.", "value": "option_c" }
          ]
        }
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

		if (!response.text) {
			throw new Error("no res text")
		}
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as GeneratedScenario;
    } catch (error) {
        console.error("Error calling Gemini API for scenario generation:", error);
        // Fallback scenario
        return {
            scenario: "Ihr Anlageportfolio hat unerwartet 20% an Wert verloren. Wie reagieren Sie?",
            options: [
                { title: "Verkaufen", description: "Sie verkaufen einen Teil, um weitere Verluste zu begrenzen.", value: "option_a" },
                { title: "Abwarten", description: "Sie halten an Ihrer Strategie fest und warten, bis sich der Markt erholt.", value: "option_b" },
                { title: "Nachkaufen", description: "Sie sehen es als Chance und investieren zusätzliches Kapital.", value: "option_c" }
            ]
        };
    }
}


export async function getFinancialAnalysis(data: FormData): Promise<GeminiAnalysis> {
  const selectedScenarioOption = data.step4.options.find(opt => opt.value === data.step4.answer);
  
  const prompt = `
    Führe eine Finanzanalyse für einen Kunden durch, basierend auf den folgenden Daten.
    Gib deine Antwort NUR als JSON-Objekt zurück, das dem bereitgestellten Schema entspricht.
    Sprache der Analyse: Deutsch.

    **Kundendaten:**

    **Schritt 1: Lebenssituation & Ziele**
    - Lebensphase: ${data.step1.lifePhase}
    - Hauptziele: ${Object.entries(data.step1.goals).filter(([,v]) => v).map(([k]) => k).join(", ")}
    - Zieldetails (Priorität/Horizont): Altersvorsorge (${data.step1.goalDetails.retirement.priority}/${data.step1.goalDetails.retirement.horizon}), Immobilie (${data.step1.goalDetails.realEstate.priority}/${data.step1.goalDetails.realEstate.horizon}), Vermögensaufbau (${data.step1.goalDetails.wealth.priority}/${data.step1.goalDetails.wealth.horizon})

    **Schritt 2: Finanzielle Situation (monatlich in EUR)**
    - Einkommen: ${data.step2.income}
    - Ausgaben: ${data.step2.expenses}
    - Liquides Vermögen: ${data.step2.assets}
    - Verbindlichkeiten: ${data.step2.liabilities}

    **Schritt 3: Money Mindset**
    - Gefühle zu Geld: ${data.step3.moneyFeelings.join(", ")}
    - Balance (0=Lebensstil, 100=Sicherheit): ${data.step3.lifestyleVsSecurity}
    - Finanzwissen (0-100): ${data.step3.financialKnowledge}
    - Entscheidungsstil: ${data.step3.decisionStyle}
    - Investment-Erfahrung: ${data.step3.investmentExperience}

    **Schritt 4: Reaktion auf KI-Szenario**
    - Präsentiertes Szenario: "${data.step4.scenario}"
    - Gewählte Reaktion: "${selectedScenarioOption?.title}: ${selectedScenarioOption?.description}"
    
    **Schritt 5: Risikoprofil (Fragebogen)**
    - Antworten zum Risikoprofil: ${JSON.stringify(data.step5.riskProfileAnswers, null, 2)}
    - Finanzielle Sorgen: ${data.step5.financialWorries || "Keine angegeben"}

    **Analyseauftrag:**

    1.  **scoreText**: Gib eine Gesamtbewertung ab. Wähle EINEN der folgenden Werte: "Ausgezeichnet", "Gut", "Solide", "Optimierungsbedarf".
    2.  **analyse**: Schreibe eine kurze, aber aufschlussreiche Zusammenfassung (2-3 Sätze). Berücksichtige insbesondere die Reaktion im KI-Szenario als wichtigen Indikator für das tatsächliche Verhalten. Gehe auf die Stärken und die größten Potenziale ein. Sei ermutigend und konstruktiv.
    3.  **chartData**: Erstelle Daten für ein Radar-Diagramm. Bewerte die folgenden 6 Dimensionen auf einer Skala von 0 bis 100, basierend auf den Kundendaten. Die Subjects MÜSSEN exakt lauten: "Liquidität", "Sparrate", "Vermögen", "Risikomanagement", "Zielplanung", "Mindset".
    4.  **detailedAnalysis**: Erstelle eine detaillierte Analyse für JEDE der 6 Dimensionen aus chartData. Gib für jeden Subject eine kurze, konstruktive Erklärung (1-2 Sätze), die den Score begründet und einen konkreten Tipp gibt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreText: { type: Type.STRING },
            analyse: { type: Type.STRING },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  value: { type: Type.INTEGER },
                },
                required: ["subject", "value"],
              },
            },
            detailedAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["subject", "explanation"],
              },
            },
          },
          required: ["scoreText", "analyse", "chartData", "detailedAnalysis"],
        },
      },
    });

	if (!response.text) {
		throw new Error("no res text")
	}

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as GeminiAnalysis;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get financial analysis from Gemini API.");
  }
}
