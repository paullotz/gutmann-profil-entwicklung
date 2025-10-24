"use server"

import { GoogleGenAI, Type } from "@google/genai"
import type { FormData, GeminiAnalysis } from "@/lib/types"

const resultSchema = {
	type: Type.OBJECT,
	properties: {
		analyse: {
			type: Type.STRING,
			description:
				"Eine kurze, positive und hilfreiche Finanzanalyse in 2-3 Sätzen auf Deutsch. Sprich den Nutzer direkt mit 'Sie' an.",
		},
		scoreText: {
			type: Type.STRING,
			description: "Ein Gesamtscore als einzelnes Wort: 'Ausgezeichnet', 'Gut', 'Solide', oder 'Optimierungsbedarf'.",
		},
		chartData: {
			type: Type.OBJECT,
			properties: {
				risiko: {
					type: Type.NUMBER,
					description: "Risikobereitschaft Score (0-100), basierend auf der Reaktion auf Marktverluste.",
				},
				sparen: {
					type: Type.NUMBER,
					description: "Sparquote & Disziplin Score (0-100), basierend auf Einkommen, Ausgaben und Vermögen.",
				},
				planung: {
					type: Type.NUMBER,
					description: "Langfristige Planung Score (0-100), basierend auf Zielen wie Altersvorsorge.",
				},
				liquiditaet: {
					type: Type.NUMBER,
					description: "Liquidität & Sicherheitspolster Score (0-100), basierend auf liquiden Mitteln vs. Ausgaben.",
				},
				vermoegen: {
					type: Type.NUMBER,
					description: "Vermögensaufbau-Potenzial Score (0-100), basierend auf Zielen, Vermögen und Verbindlichkeiten.",
				},
				lifestyle: {
					type: Type.NUMBER,
					description: "Balance zwischen Lifestyle und Sparen Score (0-100), basierend auf dem 'Money Mindset' Slider.",
				},
			},
			required: ["risiko", "sparen", "planung", "liquiditaet", "vermoegen", "lifestyle"],
		},
	},
	required: ["analyse", "scoreText", "chartData"],
}

function formatPrompt(data: FormData): string {
	const selectedGoals = (Object.keys(data.step1.goals) as Array<keyof typeof data.step1.goals>).filter(
		(key) => data.step1.goals[key],
	)

	const goalDetailsString = selectedGoals
		.map((key) => {
			const details = data.step1.goalDetails[key]
			const goalLabels = {
				retirement: "Altersvorsorge",
				realEstate: "Immobilie",
				wealth: "Vermögensaufbau",
				other: "Andere",
			}
			return `- Ziel: ${goalLabels[key]}, Priorität: ${details.priority}/100, Zeithorizont: ${details.horizon}`
		})
		.join("\n    ")

	const goalsSection = selectedGoals.length > 0 ? `\n    ${goalDetailsString}` : " Keine Angabe"

	return `
    Führe eine kurze Finanzgesundheitsanalyse für einen Bankkunden durch.
    Gib die Antwort ausschließlich im angeforderten JSON-Format zurück.
    
    Hier sind die Daten des Kunden:

    **Schritt 1: Lebenssituation & Finanzziele**
    - Lebensphase: ${data.step1.lifePhase}
    - Wichtige Ziele & Details:${goalsSection}

    **Schritt 2: Finanzielle Situation**
    - Monatliches Einkommen: ${data.step2.income} €
    - Monatliche Ausgaben: ${data.step2.expenses} €
    - Liquides Vermögen: ${data.step2.assets} €
    - Verbindlichkeiten: ${data.step2.liabilities} €
    ${data.step2.pensionGap ? `- Geschätzte monatliche Rentenlücke: ${data.step2.pensionGap} €` : ""}
    ${data.step2.equityForRealEstate ? `- Verfügbares Eigenkapital für Immobilien: ${data.step2.equityForRealEstate} €` : ""}

    **Schritt 3: Money Mindset**
    - Gefühl zu Geld: ${data.step3.moneyFeelings.join(", ")}
    - Wichtigkeit (0 = Heutiger Lebensstil, 100 = Langfristige Sicherheit): ${data.step3.lifestyleVsSecurity}
    ${data.step3.retirementConfidence !== undefined ? `- Zuversicht für Altersvorsorge (0 = Unsicher, 100 = Zuversichtlich): ${data.step3.retirementConfidence}` : ""}

    **Schritt 4: Finanz-Charakter & Risiko**
    - Gestelltes Szenario: "${data.step4.scenarioQuestion}"
    - Reaktion des Kunden: ${data.step4.riskReaction}
    ${data.step4.financialWorries ? `- Größte finanzielle Sorgen: "${data.step4.financialWorries}"` : ""}

    Basierend auf diesen Informationen, erstelle bitte die Analyse.
    `
}

export async function getFinancialAnalysis(data: FormData): Promise<GeminiAnalysis> {
	const apiKey = process.env.GEMINI_API_KEY

	if (!apiKey) {
		console.warn("GEMINI_API_KEY not found, returning mock data.")
		// Mock response for development without API key
		return {
			analyse:
				"Basierend auf Ihren Angaben haben Sie eine solide finanzielle Grundlage. Ihre Sparquote ist gut und Sie denken bereits an wichtige Ziele wie die Altersvorsorge. Ein Fokus auf den weiteren Vermögensaufbau könnte Ihr nächster Schritt sein.",
			scoreText: "Gut",
			chartData: {
				risiko: 75,
				sparen: 80,
				planung: 85,
				liquiditaet: 60,
				vermoegen: 70,
				lifestyle: 50,
			},
		}
	}

	const ai = new GoogleGenAI({ apiKey })

	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: formatPrompt(data),
			config: {
				responseMimeType: "application/json",
				responseSchema: resultSchema,
			},
		})

		if (!response) {
			throw new Error("Failed to make API call")
		}

		if (!response.text) {
			throw new Error("No response by Gemini received")
		}

		const jsonString = response.text.trim()
		const result = JSON.parse(jsonString)
		return result as GeminiAnalysis
	} catch (error) {
		console.error("Error calling Gemini API:", error)
		throw new Error("Failed to get financial analysis.")
	}
}
