"use server"

import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeminiAnalysis, GeneratedScenarios } from '../../lib/types';

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash"

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export async function checkAvailableModels() {
  console.log("Fetching available models...");
  try {
    // The SDK method to list models
    const response = await ai.models.list();
    
    // Log them to your server console
    console.log("--- AVAILABLE MODELS ---");
    // The response structure usually contains a 'models' array
    // We try to map over it, or just log the raw response if structure varies
    if (Array.isArray(response)) {
        response.forEach(m => console.log(m.name));
    } else if (response && 'models' in response && Array.isArray((response as any).models)) {
        (response as any).models.forEach((m: any) => console.log(m.name));
    } else {
        console.log(JSON.stringify(response, null, 2));
    }
    console.log("------------------------");
    
    return { success: true };
  } catch (error) {
    console.error("Error listing models:", error);
    return { success: false, error: String(error) };
  }
}

export async function generateDynamicScenarios(data: Pick<FormData, 'step1' | 'step2' | 'step3'>): Promise<GeneratedScenarios> {
    const relevantGoals = Object.entries(data.step1.goals)
      .filter(([, checked]) => checked)
      .map(([key]) => key)
      .join(", ") || "allgemeiner Vermögensaufbau";

    const prompt = `
        Basierend auf den folgenden Benutzerdaten, generiere ZWEI verschiedene, personalisierte Finanzszenarien.
        
        **WICHTIG: Jedes Szenario muss KURZ und PRÄGNANT sein (maximal 2 kurze Sätze, ca. 20-30 Wörter).**
        
        **Benutzerdaten:**
        - Lebensphase: ${data.step1.lifePhase}
        - Hauptziele: ${relevantGoals}
        - Monatliches Einkommen: ${data.step2.income} EUR
        - Monatliche Ausgaben: ${data.step2.expenses} EUR
        - Liquides Vermögen: ${data.step2.assets} EUR
        - Gefühle zu Geld: ${data.step3.moneyFeelings.join(", ")}
        - Investment-Erfahrung: ${data.step3.investmentExperience}

        **Anforderungen:**
        1.  **Anzahl**: Generiere GENAU 2 verschiedene Szenarien
        2.  **Kürze**: Jedes Szenario darf MAXIMAL 2 kurze Sätze haben (20-30 Wörter total)
        3.  **Verschiedenheit**: Die beiden Szenarien müssen unterschiedliche Aspekte testen (z.B. eines über Verluste, eines über Chancen)
        4.  **Relevanz**: Beide Szenarien müssen auf die Ziele und Situation des Benutzers zugeschnitten sein
        5.  **Drei Optionen pro Szenario**: Jedes Szenario hat genau drei kurze Handlungsoptionen
        6.  **Titel**: Jeder Titel maximal 2-3 Wörter
        7.  **Beschreibung**: Jede Beschreibung maximal 1 kurzer Satz (10-15 Wörter)
        
        **Beispiel für die richtige Struktur:**
        Szenario 1: "Ihr Portfolio verliert 20% an Wert. Wie reagieren Sie?"
        - Option 1: Titel: "Sofort verkaufen" / Beschreibung: "Verluste begrenzen und Kapital sichern."
        - Option 2: Titel: "Abwarten" / Beschreibung: "Position halten und Erholung abwarten."
        - Option 3: Titel: "Nachkaufen" / Beschreibung: "Günstigen Einstieg nutzen."

        Szenario 2: "Eine risikoreiche Chance verspricht 30% Rendite. Was tun Sie?"
        - Option 1: Titel: "Ablehnen" / Beschreibung: "Risiko ist zu hoch für mich."
        - Option 2: Titel: "Klein einsteigen" / Beschreibung: "Nur kleinen Betrag investieren."
        - Option 3: Titel: "Voll investieren" / Beschreibung: "Chance maximal nutzen."

        **Antwortformat**: 
        Deine Antwort MUSS ein valides JSON-Objekt sein:

        \`\`\`json
        {
          "scenarios": [
            {
              "id": "scenario_1",
              "scenario": "Maximal 2 kurze Sätze...",
              "options": [
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_a" },
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_b" },
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_c" }
              ]
            },
            {
              "id": "scenario_2",
              "scenario": "Maximal 2 kurze Sätze...",
              "options": [
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_a" },
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_b" },
                { "title": "2-3 Wörter", "description": "Ein kurzer Satz mit max 15 Wörtern.", "value": "option_c" }
              ]
            }
          ]
        }
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL, 
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
        return result as GeneratedScenarios;
    } catch (error) {
        console.error("Error calling Gemini API for scenario generation:", error);
        return {
            scenarios: [
                {
                    id: "scenario_1",
                    scenario: "Ihr Portfolio verliert unerwartet 20% an Wert. Wie reagieren Sie?",
                    options: [
                        { title: "Sofort verkaufen", description: "Verluste begrenzen und Kapital sichern.", value: "option_a" },
                        { title: "Abwarten", description: "Position halten und Erholung abwarten.", value: "option_b" },
                        { title: "Nachkaufen", description: "Günstigen Einstieg für mehr Investment nutzen.", value: "option_c" }
                    ]
                },
                {
                    id: "scenario_2",
                    scenario: "Eine risikoreiche Chance verspricht 30% Rendite in einem Jahr. Was tun Sie?",
                    options: [
                        { title: "Ablehnen", description: "Risiko ist mir zu hoch.", value: "option_a" },
                        { title: "Klein investieren", description: "Nur einen kleinen Teil investieren.", value: "option_b" },
                        { title: "Voll einsteigen", description: "Maximale Chance nutzen.", value: "option_c" }
                    ]
                }
            ]
        };
    }
}

export async function getFinancialAnalysis(data: FormData): Promise<GeminiAnalysis> {
  // Sammle alle Szenario-Antworten
  const scenarioAnswers = data.step4.scenarios?.map((scenario, index) => {
    const selectedOption = scenario.options.find(opt => opt.value === data.step4.answers?.[scenario.id]);
    return `Szenario ${index + 1}: "${scenario.scenario}" - Gewählte Reaktion: "${selectedOption?.title}: ${selectedOption?.description}"`;
  }).join("\n") || "Keine Szenario-Antworten vorhanden";
  

	const prompt = `
    Führe eine Finanzanalyse für einen Kunden durch, basierend auf den folgenden Daten.
    Gib deine Antwort NUR als JSON-Objekt zurück, das dem bereitgestellten Schema entspricht.
    Sprache der Analyse: Deutsch.

    **Kundendaten:**

    **Schritt 1: Lebenssituation & Ziele**
    - Lebensphase: ${data.step1.lifePhase}
    - Hauptziele: ${Object.entries(data.step1.goals).filter(([, v]) => v).map(([k]) => k).join(", ")}
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
	- Präsentiertes Szenario: "${data.step4.scenarios}"
    - Gewählte Reaktion: "${scenarioAnswers}"
    
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
			model: MODEL,
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
