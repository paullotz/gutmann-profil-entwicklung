"use client"

import React, { useState, useCallback, useMemo } from "react"
import type { FormData, Step1Data, Step2Data, GeminiAnalysis } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import RadarChartComponent from "@/components/RadarChartComponent"
import { getFinancialAnalysis } from "@/app/actions/analyze"
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
	step3: { moneyFeelings: [], lifestyleVsSecurity: 50, retirementConfidence: 50 },
	step4: { riskReaction: "", financialWorries: "", scenarioQuestion: "", scenarioType: "" },
}

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
				<CardTitle>Ihr \"Money Mindset\"</CardTitle>
				<CardDescription>{dynamicIntro}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="space-y-3">
					<Label>Welche Begriffe beschreiben Ihr Gefühl zu Geld am besten?</Label>
					<ToggleGroup
						type="multiple"
						value={step3.moneyFeelings}
						onValueChange={(value) => setData((prev) => ({ ...prev, step3: { ...prev.step3, moneyFeelings: value } }))}
						className="flex-wrap justify-start"
					>
						<ToggleGroupItem value="Sicherheit">Sicherheit</ToggleGroupItem>
						<ToggleGroupItem value="Stress">Stress</ToggleGroupItem>
						<ToggleGroupItem value="Chance">Chance</ToggleGroupItem>
						<ToggleGroupItem value="Freiheit">Freiheit</ToggleGroupItem>
						<ToggleGroupItem value="Kompliziert">Kompliziert</ToggleGroupItem>
					</ToggleGroup>
				</div>

				{showRetirementConfidence && (
					<div className="space-y-3 animate-fade-in">
						<Label>Wie zuversichtlich fühlen Sie sich bezüglich Ihrer Altersvorsorge?</Label>
						<Slider
							min={0}
							max={100}
							step={1}
							value={[step3.retirementConfidence || 50]}
							onValueChange={(value) =>
								setData((prev) => ({
									...prev,
									step3: { ...prev.step3, retirementConfidence: value[0] },
								}))
							}
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Eher unsicher</span>
							<span>Sehr zuversichtlich</span>
						</div>
					</div>
				)}

				<div className="space-y-3">
					<Label>Was ist Ihnen wichtiger?</Label>
					<Slider
						min={0}
						max={100}
						step={1}
						value={[step3.lifestyleVsSecurity]}
						onValueChange={(value) =>
							setData((prev) => ({
								...prev,
								step3: { ...prev.step3, lifestyleVsSecurity: value[0] },
							}))
						}
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Heutigen Lebensstil genießen</span>
						<span>Langfristige Sicherheit</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

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

const Step4_RiskProfile: React.FC<StepProps> = ({ setData, data }) => {
	const { step3, step4 } = data
	const { riskReaction, financialWorries } = step4

	const scenario = useMemo(() => determineScenario(data), [data])

	React.useEffect(() => {
		setData((prev) => {
			if (prev.step4.scenarioQuestion !== scenario.question) {
				return {
					...prev,
					step4: {
						...prev.step4,
						riskReaction: "",
						scenarioQuestion: scenario.question,
						scenarioType: scenario.type,
					},
				}
			}
			return prev
		})
	}, [scenario, setData])

	const handleReaction = (value: string) => {
		setData((prev) => ({ ...prev, step4: { ...prev.step4, riskReaction: value } }))
	}

	const showWorriesQuestion = step3.moneyFeelings.includes("Stress") || step3.moneyFeelings.includes("Kompliziert")

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Finanz-Charakter & Risiko</CardTitle>
				<CardDescription>{scenario.question}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{scenario.options.map((opt) => (
					<div
						key={opt.value}
						onClick={() => handleReaction(opt.value)}
						className={`p-4 border rounded-lg cursor-pointer transition-all ${riskReaction === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-muted/50 hover:border-muted-foreground/20"}`}
					>
						<h4 className="font-semibold">{opt.title}</h4>
						<p className="text-sm text-muted-foreground">{opt.description}</p>
					</div>
				))}

				{showWorriesQuestion && (
					<div className="p-4 border rounded-lg space-y-4 bg-muted/50 animate-fade-in mt-6">
						<div className="space-y-2">
							<Label htmlFor="financialWorries" className="font-semibold">
								Ihre größten Sorgen
							</Label>
							<p className="text-sm text-muted-foreground">
								Sie haben \"Stress\" oder \"Kompliziert\" als Gefühl zu Geld angegeben. Was genau bereitet Ihnen Sorgen?
							</p>
							<Textarea
								id="financialWorries"
								value={financialWorries}
								onChange={(e) =>
									setData((prev) => ({ ...prev, step4: { ...prev.step4, financialWorries: e.target.value } }))
								}
								placeholder="z.B. Angst vor Inflation, Unwissen über Anlagemöglichkeiten, Komplexität von Finanzprodukten..."
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

const Step5_Results: React.FC<{ data: FormData }> = ({ data }) => {
	const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [consultationCode] = useState(generateConsultationCode())
	const [isCopied, setIsCopied] = useState(false)

	const fetchAnalysis = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const result = await getFinancialAnalysis(data)
			setAnalysis(result)
		} catch (e) {
			setError("Fehler bei der Analyse. Bitte versuchen Sie es später erneut.")
		} finally {
			setIsLoading(false)
		}
	}, [data])

	React.useEffect(() => {
		fetchAnalysis()
	}, [fetchAnalysis])

	const handleCopy = () => {
		navigator.clipboard.writeText(consultationCode).then(() => {
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000)
		})
	}

	if (isLoading) {
		return (
			<div className="text-center p-8">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
				<p>Ihre persönliche Analyse wird erstellt...</p>
			</div>
		)
	}

	if (error || !analysis) {
		return <div className="text-center p-8 text-destructive">{error || "Analyse konnte nicht geladen werden."}</div>
	}

	const scoreColors: Record<string, string> = {
		Ausgezeichnet: "text-green-600 bg-green-100",
		Gut: "text-green-600 bg-green-100",
		Solide: "text-yellow-600 bg-yellow-100",
		Optimierungsbedarf: "text-orange-600 bg-orange-100",
	}

	return (
		<div className="space-y-6">
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Ihr Finanz-Ergebnis</CardTitle>
					<div
						className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-fit ${scoreColors[analysis.scoreText] || "bg-gray-100"}`}
					>
						{analysis.scoreText}
					</div>
				</CardHeader>
				<CardContent>
					<p>{analysis.analyse}</p>
				</CardContent>
			</Card>
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Profil-Übersicht</CardTitle>
				</CardHeader>
				<CardContent>
					<RadarChartComponent data={analysis.chartData} />
				</CardContent>
			</Card>
			<Card className="bg-muted/50 border-primary shadow-sm">
				<CardContent className="pt-6 text-center">
					<h3 className="text-xl font-semibold mb-2">Der nächste Schritt? Ein persönliches Gespräch.</h3>
					<p className="text-muted-foreground mb-4">
						Ihr Code schaltet eine persönliche Besprechung Ihrer Ergebnisse frei. Ein Bank Gutmann Experte kann Ihnen
						helfen, die nächsten Schritte zu planen.
					</p>

					<div className="my-6">
						<Label className="text-sm text-muted-foreground">Ihr persönlicher Beratungscode</Label>
						<div className="flex items-center justify-center gap-2 mt-1">
							<span className="text-2xl font-mono p-2 bg-background border rounded-md">{consultationCode}</span>
							<Button variant="ghost" size="icon" onClick={handleCopy}>
								{isCopied ? "Kopiert!" : <CopyIcon />}
							</Button>
						</div>
					</div>

					<Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto" size="lg">
						<CalendarIcon className="mr-2" />
						Jetzt Experten-Gespräch anfordern
					</Button>
				</CardContent>
			</Card>
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Beratungstermin vereinbaren</DialogTitle>
					</DialogHeader>
					<div className="text-center">
						<p className="mb-4">Vielen Dank für Ihr Interesse! Dieses Feature ist im Prototyp nicht implementiert.</p>
						<Button onClick={() => setIsModalOpen(false)}>Schließen</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default function App() {
	const [currentStep, setCurrentStep] = useState(0)
	const [formData, setFormData] = useState<FormData>(initialFormData)

	const nextStep = () => setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev))
	const prevStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

	const progress = (currentStep / (TOTAL_STEPS - 1)) * 100

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return <Step0_Start onNext={nextStep} />
			case 1:
				return <Step1_LifeGoals setData={setFormData} data={formData} />
			case 2:
				return <Step2_Financials setData={setFormData} data={formData} />
			case 3:
				return <Step3_Mindset setData={setFormData} data={formData} />
			case 4:
				return <Step4_RiskProfile setData={setFormData} data={formData} />
			case 5:
				return <Step5_Results data={formData} />
			default:
				return <Step0_Start onNext={nextStep} />
		}
	}

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
