import { Step2Data, StepProps } from "@/lib/types"
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "../ui/card"
import { Label } from "../ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { InfoIcon } from "../icons"
import { Input } from "../ui/input"

export const Financials: React.FC<StepProps> = ({ setData, data }) => {
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
		income: 
            "Alles, was Sie im Jahr netto einnehmen. Zum Beispiel Gehalt, Gewinne aus Ihrer Firma oder Mieteinnahmen.",
		expenses: 
            "Alles, was Sie im Jahr ausgeben. Zum Beispiel für Wohnen, Essen, Reisen, Autos oder Hobbys.",
		assets:
			"Geld, auf das Sie schnell zugreifen können. Dazu zählen Girokonten, Sparbücher, Tagesgeld, Aktien oder Fonds. (Bitte hier keine Immobilien oder Firmenwerte mitrechnen.)",
		liabilities: 
            "Geld, das Sie der Bank oder anderen schulden. Zum Beispiel offene Kredite für Häuser, Autos oder andere Anschaffungen.",
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
