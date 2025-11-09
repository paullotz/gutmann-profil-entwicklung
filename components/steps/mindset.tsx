import { StepProps } from "@/lib/types";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "../ui/card";
import { Label } from "../ui/label";

export const Mindset: React.FC<StepProps> = ({ setData, data }) => {
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
