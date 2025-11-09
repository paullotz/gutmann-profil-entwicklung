import { ChartBarIcon, ArrowRightIcon, ShieldIcon, SparkleIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export const Start: React.FC<{ onNext: () => void }> = ({ onNext }) => (
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
						<ChartBarIcon />
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
