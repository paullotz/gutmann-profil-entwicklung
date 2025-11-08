"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import type { FormData, Step1Data, Step2Data, GeminiAnalysis } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import RadarChartComponent from "@/components/RadarChartComponent"
import { generateDynamicScenario, getFinancialAnalysis } from "@/app/actions/analyze"
import {
	ChartIcon,
	SparkleIcon,
	ShieldIcon,
	ArrowRightIcon,
	InfoIcon,
	CopyIcon,
	CalendarIcon,
} from "@/components/icons"

const TOTAL_STEPS = 6

const initialFormData: FormData = {
	step1: {
		lifePhase: "Berufseinsteiger",
		goals: { retirement: false, realEstate: false, wealth: false, other: false },
		goalDetails: {
			retirement: { priority: 50, horizon: "20+ Jahre" },
			realEstate: { priority: 50, horizon: "10-20 Jahre" },
			wealth: { priority: 50, horizon: "5-10 Jahre" },
			other: { priority: 50, horizon: "0-5 Jahre" },
		},
	},
	step2: { income: "", expenses: "", assets: "", liabilities: "", pensionGap: "", equityForRealEstate: "" },
	step3: { moneyFeelings: [], lifestyleVsSecurity: 50, retirementConfidence: 50, financialKnowledge: 50, decisionStyle: "", investmentExperience: "Keine" },
	step4: { scenario: "", options: [], answer: "" },
	step5: { riskProfileAnswers: {}, financialWorries: "" },
};

interface StepProps {
	setData: React.Dispatch<React.SetStateAction<FormData>>
	data: FormData
}

const Step0_Start: React.FC<{ onNext: () => void }> = ({ onNext }) => (
	<Card className="max-w-2xl mx-auto shadow-sm">
		<CardHeader className="text-center space-y-2">
			<CardTitle className="text-3xl md:text-4xl font-bold">Entdecken Sie Ihre finanzielle Zukunft.</CardTitle>
			<CardDescription className="text-base md:text-lg">
				Unser KI-gestützter Financial Health Check analysiert nicht nur Ihre Zahlen, sondern auch Ihre Ziele und Ihr
				persönliches Verhältnis zu Geld. Erhalten Sie in wenigen Minuten eine ganzheitliche Einschätzung und klare
				nächste Schritte.
			</CardDescription>
		</CardHeader>
		<CardContent className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
				<div className="flex items-start gap-3">
					<div className="bg-muted p-2.5 rounded-lg shrink-0">
						<ChartIcon />
					</div>
					<div>
						<h4 className="font-semibold text-sm">Ganzheitliche Analyse</h4>
						<p className="text-sm text-muted-foreground">Wir betrachten Ihre Finanzen, Ziele und Ihr Mindset.</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<div className="bg-muted p-2.5 rounded-lg shrink-0">
						<SparkleIcon />
					</div>
					<div>
						<h4 className="font-semibold text-sm">KI-gestützte Einblicke</h4>
						<p className="text-sm text-muted-foreground">
							Profitieren Sie von modernster Technologie für Ihr Ergebnis.
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<div className="bg-muted p-2.5 rounded-lg shrink-0">
						<ShieldIcon />
					</div>
					<div>
						<h4 className="font-semibold text-sm">100% Sicher & Anonym</h4>
						<p className="text-sm text-muted-foreground">
							Ihre Daten werden vertraulich behandelt und nicht gespeichert.
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<div className="bg-muted p-2.5 rounded-lg shrink-0">
						<ArrowRightIcon />
					</div>
					<div>
						<h4 className="font-semibold text-sm">Konkrete nächste Schritte</h4>
						<p className="text-sm text-muted-foreground">Erhalten Sie eine klare Handlungsempfehlung.</p>
					</div>
				</div>
			</div>
			<div className="pt-2">
				<Button onClick={onNext} className="w-full" size="lg">
					Jetzt Check starten
				</Button>
			</div>
		</CardContent>
	</Card>
)

const Step1_LifeGoals: React.FC<StepProps> = ({ setData, data }) => {
	const { step1 } = data
	const handleGoalChange = (goal: keyof Step1Data["goals"]) => {
		setData((prev) => ({
			...prev,
			step1: { ...prev.step1, goals: { ...prev.step1.goals, [goal]: !prev.step1.goals[goal] } },
		}))
	}

	const goalLabels: Record<keyof Step1Data["goals"], string> = {
		retirement: "Altersvorsorge",
		realEstate: "Immobilie",
		wealth: "Vermögensaufbau",
		other: "Andere",
	}

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Lebenssituation & Finanzziele</CardTitle>
				<CardDescription>Wo stehen Sie und was ist Ihnen wichtig?</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label>Ihre aktuelle Lebensphase?</Label>
					<Select
						value={step1.lifePhase}
						onValueChange={(value) => setData((prev) => ({ ...prev, step1: { ...prev.step1, lifePhase: value } }))}
					>
						<SelectTrigger>
							<SelectValue placeholder="Wählen Sie Ihre Lebensphase" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="Berufseinsteiger">Berufseinsteiger</SelectItem>
								<SelectItem value="Karriere-Aufbau">Karriere-Aufbau</SelectItem>
								<SelectItem value="Familiengründung">Familiengründung</SelectItem>
								<SelectItem value="Vor dem Ruhestand">Vor dem Ruhestand</SelectItem>
								<SelectItem value="Im Ruhestand">Im Ruhestand</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Label>Was sind Ihre finanziellen Ziele?</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button type="button">
										<InfoIcon />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Ziele können Altersvorsorge, der Kauf einer Immobilie oder allgemeiner Vermögensaufbau sein.</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					{(Object.keys(step1.goals) as Array<keyof Step1Data["goals"]>).map((key) => (
						<div key={key}>
							<div className="flex items-center space-x-2">
								<Checkbox id={key} checked={step1.goals[key]} onCheckedChange={() => handleGoalChange(key)} />
								<Label
									htmlFor={key}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{goalLabels[key]}
								</Label>
							</div>
							{step1.goals[key] && (
								<div className="p-4 border rounded-lg space-y-4 bg-muted/50 animate-fade-in mt-2 ml-6">
									<h4 className="font-semibold">Details zu: {goalLabels[key]}</h4>
									<div className="space-y-2">
										<Label>Priorität (0-100): {step1.goalDetails[key].priority}</Label>
										<Slider
											min={0}
											max={100}
											step={1}
											value={[step1.goalDetails[key].priority]}
											onValueChange={(value) =>
												setData((prev) => ({
													...prev,
													step1: {
														...prev.step1,
														goalDetails: {
															...prev.step1.goalDetails,
															[key]: {
																...prev.step1.goalDetails[key],
																priority: value[0],
															},
														},
													},
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Zeithorizont</Label>
										<Select
											value={step1.goalDetails[key].horizon}
											onValueChange={(value) =>
												setData((prev) => ({
													...prev,
													step1: {
														...prev.step1,
														goalDetails: {
															...prev.step1.goalDetails,
															[key]: { ...prev.step1.goalDetails[key], horizon: value },
														},
													},
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Wählen Sie Ihren Zeithorizont" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="0-5 Jahre">0-5 Jahre</SelectItem>
													<SelectItem value="5-10 Jahre">5-10 Jahre</SelectItem>
													<SelectItem value="10-20 Jahre">10-20 Jahre</SelectItem>
													<SelectItem value="20+ Jahre">20+ Jahre</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

const Step2_Financials: React.FC<StepProps> = ({ setData, data }) => {
	const { step1, step2 } = data
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		if (/^\d*\.?\d*$/.test(value)) {
			setData((prev) => ({ ...prev, step2: { ...prev.step2, [name]: value } }))
		}
	}

	const primaryFields: (keyof Step2Data)[] = ["income", "expenses", "assets", "liabilities"]
	const labels: Record<keyof Step2Data, string> = {
		income: "Monatliches Nettoeinkommen",
		expenses: "Monatliche Ausgaben",
		assets: "Liquides Vermögen",
		liabilities: "Verbindlichkeiten",
		pensionGap: "Bestehende Rentenlücke (geschätzt, pro Monat)",
		equityForRealEstate: "Verfügbares Eigenkapital für Immobilien",
	}

	const tooltipContent: Partial<Record<keyof Step2Data, string>> = {
		assets:
			"Dies ist Geld, auf das Sie schnell zugreifen können, z.B. Guthaben auf Giro- und Tagesgeldkonten oder Bargeld.",
		liabilities: "Dies sind Ihre Schulden, z.B. Raten für Kredite, Hypotheken oder Leasingverträge.",
	}

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Ihre finanzielle Situation</CardTitle>
				<CardDescription>Ein kurzer Überblick über Ihre Finanzen.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{primaryFields.map((key) => (
					<div key={key} className="space-y-2">
						<div className="flex items-center gap-2">
							<Label>{labels[key]}</Label>
							{tooltipContent[key] && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button type="button">
												<InfoIcon />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>{tooltipContent[key]}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
						<div className="relative">
							<Input
								type="text"
								inputMode="decimal"
								name={key}
								value={step2[key]}
								onChange={handleChange}
								placeholder="0"
								className="pl-7"
							/>
							<span className="absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground">€</span>
						</div>
					</div>
				))}

				{(step1.goals.retirement || step1.goals.realEstate) && (
					<div className="p-4 border rounded-lg space-y-4 bg-muted/50 animate-fade-in mt-6">
						<h4 className="font-semibold">Details zu Ihren Zielen</h4>
						{step1.goals.retirement && (
							<div className="space-y-2">
								<Label>{labels.pensionGap}</Label>
								<div className="relative">
									<Input
										type="text"
										inputMode="decimal"
										name="pensionGap"
										value={step2.pensionGap}
										onChange={handleChange}
										placeholder="0"
										className="pl-7"
									/>
									<span className="absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground">€</span>
								</div>
							</div>
						)}
						{step1.goals.realEstate && (
							<div className="space-y-2">
								<Label>{labels.equityForRealEstate}</Label>
								<div className="relative">
									<Input
										type="text"
										inputMode="decimal"
										name="equityForRealEstate"
										value={step2.equityForRealEstate}
										onChange={handleChange}
										placeholder="0"
										className="pl-7"
									/>
									<span className="absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground">€</span>
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

const Step3_Mindset: React.FC<StepProps> = ({ setData, data }) => {
	const { step1, step2, step3 } = data

	const income = Number.parseFloat(step2.income) || 0
	const expenses = Number.parseFloat(step2.expenses) || 0
	const assets = Number.parseFloat(step2.assets) || 0
	const liabilities = Number.parseFloat(step2.liabilities) || 0

	let dynamicIntro = "Wie fühlen Sie sich beim Thema Geld?"

	if (income > 0 && expenses > 0) {
		const savingsRate = (income - expenses) / income
		const bufferMonths = expenses > 0 ? (assets - liabilities) / expenses : Number.POSITIVE_INFINITY

		if (savingsRate > 0.2 && bufferMonths > 6) {
			dynamicIntro =
				"Ihre Zahlen deuten auf eine solide finanzielle Basis hin. Das ist ein hervorragender Ausgangspunkt. Lassen Sie uns nun tiefer in Ihre persönliche Einstellung zu Geld eintauchen."
		} else if (savingsRate < 0.05 || bufferMonths < 3) {
			dynamicIntro =
				"Jeder fängt irgendwo an. Es ist wichtig, nicht nur die Zahlen, sondern auch das Gefühl hinter den Finanzen zu verstehen. Wie fühlen Sie sich beim Thema Geld?"
		}
	}

	const showRetirementConfidence = step1.goals.retirement && step1.goalDetails.retirement.priority > 60

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Ihr "Money Mindset"</CardTitle>
				<CardDescription>{dynamicIntro}</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 space-y-8">
				<div className="space-y-3">
					<Label>Welche Begriffe beschreiben Ihr Gefühl zu Geld am besten?</Label>
					<div className="flex flex-wrap gap-2">
						{["Sicherheit", "Stress", "Chance", "Freiheit", "Kompliziert"].map(feeling => (
							<button key={feeling} onClick={() => setData(prev => ({ ...prev, step3: { ...prev.step3, moneyFeelings: prev.step3.moneyFeelings.includes(feeling) ? prev.step3.moneyFeelings.filter(f => f !== feeling) : [...prev.step3.moneyFeelings, feeling] } }))} className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${step3.moneyFeelings.includes(feeling) ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-muted'}`}>
								{feeling}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<Label>Wie schätzen Sie Ihr Finanzwissen ein?</Label>
					<input type="range" min={0} max={100} step={1} value={step3.financialKnowledge} onChange={(e) => setData((prev) => ({ ...prev, step3: { ...prev.step3, financialKnowledge: parseInt(e.target.value) } }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
					<div className="flex justify-between text-xs text-muted-foreground"><span>Anfänger</span><span>Experte</span></div>
				</div>

				<div className="space-y-3">
					<Label>Wie treffen Sie typischerweise wichtige finanzielle Entscheidungen?</Label>
					<div className="flex flex-wrap gap-2">
						{["Spontan", "Nach Recherche", "Mit Beratung", "Ich vermeide sie"].map(style => (
							<button key={style} onClick={() => setData(prev => ({ ...prev, step3: { ...prev.step3, decisionStyle: style } }))} className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${step3.decisionStyle === style ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent hover:bg-muted'}`}>
								{style}
							</button>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Ihre bisherige Erfahrung mit Geldanlagen (Aktien, Fonds, etc.)?</Label>
					<select
						value={step3.investmentExperience}
						onChange={(e) => setData(prev => ({ ...prev, step3: { ...prev.step3, investmentExperience: e.target.value } }))}
						className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="Keine">Keine</option>
						<option value="Anfänger">Anfänger (z.B. ETF-Sparplan)</option>
						<option value="Fortgeschritten">Fortgeschritten (z.B. Einzelaktien)</option>
						<option value="Experte">Experte (z.B. komplexe Produkte)</option>
					</select>
				</div>

				{showRetirementConfidence && (
					<div className="space-y-3 animate-fade-in">
						<Label>Wie zuversichtlich fühlen Sie sich bezüglich Ihrer Altersvorsorge?</Label>
						<input type="range" min={0} max={100} step={1} value={step3.retirementConfidence || 50} onChange={(e) => setData(prev => ({ ...prev, step3: { ...prev.step3, retirementConfidence: parseInt(e.target.value) } }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
						<div className="flex justify-between text-xs text-muted-foreground"><span>Eher unsicher</span><span>Sehr zuversichtlich</span></div>
					</div>
				)}

				<div className="space-y-3">
					<Label>Was ist Ihnen wichtiger?</Label>
					<input type="range" min={0} max={100} step={1} value={step3.lifestyleVsSecurity} onChange={(e) => setData(prev => ({ ...prev, step3: { ...prev.step3, lifestyleVsSecurity: parseInt(e.target.value) } }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
					<div className="flex justify-between text-xs text-muted-foreground"><span>Heutigen Lebensstil genießen</span><span>Langfristige Sicherheit</span></div>
				</div>
			</CardContent>
		</Card>
	);
};

const determineScenario = (data: FormData) => {
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

const Step4_ScenarioSimulation: React.FC<StepProps> = ({ setData, data }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { step4 } = data;

	const fetchScenario = useCallback(async () => {
		// Only fetch if scenario is not already loaded
		if (data.step4.scenario) {
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const result = await generateDynamicScenario(data);
			setData(prev => ({
				...prev,
				step4: { ...prev.step4, scenario: result.scenario, options: result.options }
			}));
		} catch (e) {
			setError("Fehler bei der Szenario-Erstellung. Bitte laden Sie die Seite neu.");
		} finally {
			setIsLoading(false);
		}
	}, [data, setData]);

	useEffect(() => {
		fetchScenario();
	}, [fetchScenario]);

	const handleAnswer = (value: string) => {
		setData(prev => ({ ...prev, step4: { ...prev.step4, answer: value } }));
	};

	if (isLoading) {
		return (
			<Card className="shadow-sm text-center p-8">
				<LoaderCircle className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" />
				<p>Ihr persönliches Szenario wird generiert...</p>
				<p className="text-sm text-muted-foreground">Die KI analysiert Ihre Eingaben, um eine relevante Entscheidungssituation für Sie zu erstellen.</p>
			</Card>
		);
	}

	if (error) return <div className="text-center p-8 text-destructive">{error}</div>;

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Szenario: Ihre Entscheidung</CardTitle>
				<CardDescription>{step4.scenario}</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 space-y-4">
				{step4.options.map(opt => (
					<div
						key={opt.value}
						onClick={() => handleAnswer(opt.value)}
						className={`p-4 border rounded-lg cursor-pointer transition-all ${step4.answer === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-muted/50 hover:border-muted-foreground/20"}`}
					>
						<h4 className="font-semibold">{opt.title}</h4>
						<p className="text-sm text-muted-foreground">{opt.description}</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
};
const Step5_RiskProfile: React.FC<StepProps> = ({ setData, data }) => {
	const { step3, step5 } = data;
	const { riskProfileAnswers, financialWorries } = step5;

	const riskQuestions = useMemo(() => generateRiskQuestions(data), [data]);

	const handleAnswer = (questionId: string, value: string) => {
		setData((prev) => ({
			...prev,
			step5: {
				...prev.step5,
				riskProfileAnswers: {
					...prev.step5.riskProfileAnswers,
					[questionId]: value,
				},
			},
		}));
	};

	const showWorriesQuestion = step3.moneyFeelings.includes("Stress") || step3.moneyFeelings.includes("Kompliziert");

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Finanz-Charakter & Risiko</CardTitle>
				<CardDescription>Ihre Antworten helfen uns, Ihr Risikoprofil besser zu verstehen.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 space-y-8">
				{riskQuestions.map((q, index) => (
					<div key={q.id} className="space-y-4 border-b pb-8 last:border-b-0 last:pb-0">
						<Label className="font-semibold text-base">{index + 1}. {q.question}</Label>
						<div className="space-y-3">
							{q.options.map(opt => (
								<div
									key={opt.value}
									onClick={() => handleAnswer(q.id, opt.value)}
									className={`p-4 border rounded-lg cursor-pointer transition-all ${riskProfileAnswers[q.id] === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-muted/50 hover:border-muted-foreground/20"}`}
								>
									<h4 className="font-semibold">{opt.title}</h4>
									<p className="text-sm text-muted-foreground">{opt.description}</p>
								</div>
							))}
						</div>
					</div>
				))}

				{showWorriesQuestion && (
					<div className="p-4 border rounded-lg space-y-4 bg-muted/50 animate-fade-in mt-6">
						<div className="space-y-2">
							<Label htmlFor="financialWorries" className="font-semibold">Ihre größten Sorgen</Label>
							<p className="text-sm text-muted-foreground">Sie haben "Stress" oder "Kompliziert" als Gefühl zu Geld angegeben. Was genau bereitet Ihnen Sorgen?</p>
							<Textarea id="financialWorries" value={financialWorries} onChange={(e) => setData((prev) => ({ ...prev, step5: { ...prev.step5, financialWorries: e.target.value } }))} placeholder="z.B. Angst vor Inflation, Unwissen über Anlagemöglichkeiten, Komplexität von Finanzprodukten..." />
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
const generateRiskQuestions = (data: FormData) => {
	const questions = [];
	const { step3 } = data;

	questions.push({
		id: "loss_aversion",
		question: "Was wiegt für Sie emotional schwerer?",
		options: [
			{ value: "Verlust", title: "Der Schmerz über 1.000 € Verlust", description: "Einen Verlust zu realisieren, fühlt sich besonders schlecht an." },
			{ value: "Gewinn", title: "Die Freude über 1.000 € Gewinn", description: "Ein Gewinn motiviert mich und fühlt sich großartig an." },
			{ value: "Gleich", title: "Beides wiegt etwa gleich", description: "Ich betrachte Gewinne und Verluste rational und unemotional." },
		],
	});

	if (step3.investmentExperience !== 'Keine') {
		questions.push({
			id: 'regret_aversion',
			question: 'Was würden Sie im Nachhinein mehr bereuen?',
			options: [
				{ value: 'Chance verpasst', title: 'Eine große Chance verpasst zu haben', description: 'Ich würde mich ärgern, nicht investiert zu haben, wenn die Anlage stark steigt.' },
				{ value: 'Geld verloren', title: 'In eine Anlage investiert zu haben, die an Wert verliert', description: 'Ich würde mich ärgern, Geld verloren zu haben, auch wenn das Risiko bekannt war.' },
			]
		});
	}

	return questions;
};


const Step6_Results: React.FC<{ data: FormData }> = ({ data }) => {
	const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [consultationCode] = useState(generateConsultationCode());
	const [isCopied, setIsCopied] = useState(false);

	const fetchAnalysis = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await getFinancialAnalysis(data);
			setAnalysis(result);
		} catch (e) {
			setError("Fehler bei der Analyse. Bitte versuchen Sie es später erneut.");
		} finally {
			setIsLoading(false);
		}
	}, [data]);

	useEffect(() => {
		fetchAnalysis();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCopy = () => {
		navigator.clipboard.writeText(consultationCode).then(() => {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		});
	};

	if (isLoading) return (<div className="text-center p-8"><LoaderCircle className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" /><p>Ihre persönliche Analyse wird erstellt...</p></div>);
	if (error || !analysis) return <div className="text-center p-8 text-destructive">{error || "Analyse konnte nicht geladen werden."}</div>;

	const scoreColors: Record<string, string> = { Ausgezeichnet: "text-green-600 bg-green-100", Gut: "text-green-600 bg-green-100", Solide: "text-yellow-600 bg-yellow-100", Optimierungsbedarf: "text-orange-600 bg-orange-100" };

	return (
		<div className="space-y-6">
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Ihr Finanz-Ergebnis</CardTitle>
					<div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-fit ${scoreColors[analysis.scoreText] || "bg-gray-100"}`}>{analysis.scoreText}</div>
				</CardHeader>
				<CardContent className="pt-6"><p>{analysis.analyse}</p></CardContent>
			</Card>
			<Card className="shadow-sm">
				<CardHeader><CardTitle>Profil-Übersicht</CardTitle></CardHeader>
				<CardContent className="pt-0"><RadarChartComponent data={analysis.chartData} /></CardContent>
			</Card>
            <Card className="shadow-sm">
                <CardHeader><CardTitle>Ihre Detail-Analyse</CardTitle><CardDescription>Hier sehen Sie eine Aufschlüsselung Ihrer Ergebnisse in den Kernbereichen.</CardDescription></CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {analysis.detailedAnalysis.map((detail, index) => {
                        const chartItem = analysis.chartData.find(item => item.subject === detail.subject);
                        const score = chartItem ? chartItem.value : 0;
                        const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-orange-600';

                        return (
                            <div key={index} className="p-4 rounded-lg bg-muted/50">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold">{detail.subject}</h4>
                                    <span className={`font-bold text-lg ${scoreColor}`}>{score} / 100</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{detail.explanation}</p>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
			<Card className="bg-muted/50 border-primary shadow-sm">
				<CardContent className="pt-6 text-center">
					<h3 className="text-xl font-semibold mb-2">Der nächste Schritt? Ein persönliches Gespräch.</h3>
					<p className="text-muted-foreground mb-4">Ihr Code schaltet eine persönliche Besprechung Ihrer Ergebnisse frei. Ein Bank Gutmann Experte kann Ihnen helfen, die nächsten Schritte zu planen.</p>
					<div className="my-6">
						<Label className="text-sm text-muted-foreground">Ihr persönlicher Beratungscode</Label>
						<div className="flex items-center justify-center gap-2 mt-1">
							<span className="text-2xl font-mono p-2 bg-background border rounded-md">{consultationCode}</span>
							<Button variant="ghost" size="icon" onClick={handleCopy}>{isCopied ? "Kopiert!" : <CopyIcon />}</Button>
						</div>
					</div>
					<Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto" size="lg"><CalendarIcon className="mr-2" />Jetzt Experten-Gespräch anfordern</Button>
				</CardContent>
			</Card>
			{isModalOpen && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setIsModalOpen(false)}><div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-semibold mb-2">Beratungstermin vereinbaren</h3><div className="text-center"><p className="mb-4">Vielen Dank für Ihr Interesse! Dieses Feature ist im Prototyp nicht implementiert.</p><Button onClick={() => setIsModalOpen(false)}>Schließen</Button></div></div></div>}
		</div>
	);
};

export default function App() {
	const [currentStep, setCurrentStep] = useState(0)
	const [formData, setFormData] = useState<FormData>(initialFormData)

	const nextStep = () => setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev))
	const prevStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

	const progress = (currentStep / (TOTAL_STEPS - 1)) * 100

	const renderStep = () => {
		switch (currentStep) {
			case 0: return <Step0_Start onNext={nextStep} />;
			case 1: return <Step1_LifeGoals setData={setFormData} data={formData} />;
			case 2: return <Step2_Financials setData={setFormData} data={formData} />;
			case 3: return <Step3_Mindset setData={setFormData} data={formData} />;
			case 4: return <Step4_ScenarioSimulation setData={setFormData} data={formData} />;
			case 5: return <Step5_RiskProfile setData={setFormData} data={formData} />;
			case 6: return <Step6_Results data={formData} />;
			default: return <Step0_Start onNext={nextStep} />;
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-2xl mx-auto">
				<header className="mb-8">
					{currentStep > 0 && currentStep < TOTAL_STEPS && (
						<div className="mb-4">
							<Progress value={progress} />
							<p className="text-sm text-right mt-1 text-muted-foreground">
								Schritt {currentStep} von {TOTAL_STEPS - 1}
							</p>
						</div>
					)}
				</header>

				<main>{renderStep()}</main>

				{currentStep > 0 && currentStep < TOTAL_STEPS && (
					<footer className="mt-8 flex justify-between">
						<Button variant="outline" onClick={prevStep}>
							Zurück
						</Button>
						<Button onClick={nextStep}>{currentStep === TOTAL_STEPS - 1 ? "Analyse ansehen" : "Weiter"}</Button>
					</footer>
				)}
			</div>
		</div>
	)
}

const generateConsultationCode = () => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let code = "GUT-"
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return code
}
