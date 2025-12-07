import { NextRequest } from "next/server"
import { FormData } from "./types"

export const determineScenario = (data: FormData) => {
	const { step1, step2, step3 } = data
	const income = Number.parseFloat(step2.income) || 0
	const expenses = Number.parseFloat(step2.expenses) || 0
	const assets = Number.parseFloat(step2.assets) || 0
	const savingsRate = income > 0 ? (income - expenses) / income : 0

	if (step3.moneyFeelings.includes("Stress") && step3.lifestyleVsSecurity > 70) {
		return {
			type: "inflation_risk",
			question:
				"Die Inflation ist höher als erwartet, was den Wert Ihres Ersparten mindert. Wie passen Sie Ihre Strategie an?",
			options: [
				{
					value: "Ignorieren",
					title: "Nichts tun",
					description: "Ich hoffe, dass es nur eine vorübergehende Phase ist.",
				},
				{
					value: "Umschichten",
					title: "Sicherer umschichten",
					description: "Ich suche nach inflationsgeschützten Anlagen, auch bei geringerer Rendite.",
				},
				{
					value: "Mehr Risiko",
					title: "Mehr Risiko eingehen",
					description: "Ich investiere in renditestärkere Anlagen, um die Inflation auszugleichen.",
				},
			],
		}
	}

	if (step1.goals.wealth && savingsRate > 0.25 && assets > 50000) {
		return {
			type: "opportunity",
			question:
				"Es bietet sich eine einmalige, risikoreiche Investitionschance mit hohem Renditepotenzial. Sie erfordert 25% Ihres liquiden Vermögens. Was tun Sie?",
			options: [
				{
					value: "Ablehnen",
					title: "Ablehnen",
					description: "Das Risiko ist mir zu hoch, ich bleibe bei meiner Strategie.",
				},
				{
					value: "Teil-Investition",
					title: "Teilweise investieren",
					description: "Ich investiere eine kleinere Summe, um das Risiko zu streuen.",
				},
				{
					value: "Voll investieren",
					title: "Chance ergreifen",
					description: "Ich investiere die vollen 25%, um die maximale Rendite zu erzielen.",
				},
			],
		}
	}

	if (step1.goals.realEstate) {
		return {
			type: "real_estate_drop",
			question: "Die Immobilienpreise in Ihrer Wunschregion fallen plötzlich um 15%. Was tun Sie?",
			options: [
				{ value: "Abwarten", title: "Abwarten", description: "Ich warte, bis die Preise sich stabilisieren." },
				{
					value: "Jetzt kaufen",
					title: "Jetzt kaufen",
					description: "Ich nutze die Chance auf einen günstigeren Einstieg.",
				},
				{ value: "Plan überdenken", title: "Plan überdenken", description: "Ich investiere mein Geld vorerst anders." },
			],
		}
	}

	return {
		type: "portfolio_loss",
		question: "Ihr Portfolio verliert über Nacht 20% an Wert. Wie reagieren Sie am ehesten?",
		options: [
			{ value: "Verkaufen", title: "Verkaufen", description: "Ich begrenze meine Verluste sofort." },
			{ value: "Abwarten", title: "Abwarten", description: "Ich bleibe ruhig, der Markt erholt sich." },
			{ value: "Nachkaufen", title: "Nachkaufen", description: "Eine günstige Gelegenheit, mehr zu investieren." },
		],
	}
}

export const validateOrigin = (request: NextRequest): boolean => {
  if (process.env.NODE_ENV === 'development') return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://gutmann-profil-entwicklung.vercel.app";

  if (origin && origin.startsWith(ALLOWED_DOMAIN)) return true;
  if (referer && referer.startsWith(ALLOWED_DOMAIN)) return true;

  return false;
};


export const validateApiKey = (request: NextRequest): boolean => {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('API_KEY is not configured in environment variables');
    return false;
  }

  return apiKey === validApiKey;
}
