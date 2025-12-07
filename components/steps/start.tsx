import { ChartBarIcon, ArrowRightIcon, SparkleIcon, FileTextIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export const Start: React.FC<{ onNext: () => void }> = ({ onNext }) => (
	<Card className="max-w-2xl mx-auto shadow-sm">
		<CardHeader className="text-center space-y-4">
			<CardTitle className="text-3xl md:text-4xl font-bold font-serif">Ihr strategischer Kompass.</CardTitle>
			<CardDescription className="text-base md:text-lg max-w-xl mx-auto">
				Bereiten Sie Ihr Erstgespräch optimal vor. Unser intelligenter Assistent hilft Ihnen, Ihre finanzielle DNA zu entschlüsseln damit wir im persönlichen Gespräch direkt über Strategien sprechen können, statt über Stammdaten.
			</CardDescription>
		</CardHeader>
		<CardContent className="space-y-8 pt-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
				<div className="flex items-start gap-4">
					<div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
						<ChartBarIcon className="w-5 h-5" />
					</div>
					<div>
						<h4 className="font-semibold text-base mb-1">Status Quo Analyse</h4>
						<p className="text-sm text-muted-foreground">Objektive Einordnung Ihrer aktuellen Vermögensstruktur.</p>
					</div>
				</div>
				<div className="flex items-start gap-4">
					<div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
						<SparkleIcon className="w-5 h-5" />
					</div>
					<div>
						<h4 className="font-semibold text-base mb-1">Money Mindset</h4>
						<p className="text-sm text-muted-foreground">
							Verstehen Sie, wie Emotionen Ihre Anlageentscheidungen beeinflussen.
						</p>
					</div>
				</div>
                
                {/* ÄNDERUNG: PDF-Report als "Win" eingefügt */}
				<div className="flex items-start gap-4">
					<div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
						<FileTextIcon className="w-5 h-5" />
					</div>
					<div>
						<h4 className="font-semibold text-base mb-1">Ihr Exklusiv-Report</h4>
						<p className="text-sm text-muted-foreground">
							Sie erhalten eine detaillierte PDF Auswertung Ihrer Strategie als Download für Ihre Unterlagen.
						</p>
					</div>
				</div>

				<div className="flex items-start gap-4">
					<div className="bg-primary/10 p-3 rounded-full shrink-0 text-primary">
						<ArrowRightIcon className="w-5 h-5" />
					</div>
					<div>
						<h4 className="font-semibold text-base mb-1">Ihr Beratungscode</h4>
						<p className="text-sm text-muted-foreground">Der Schlüssel für den nahtlosen Einstieg bei Ihrem Berater.</p>
					</div>
				</div>
			</div>
			<div className="pt-4 flex justify-center">
				<Button onClick={onNext} className="w-full sm:w-auto px-8 py-6 text-lg" size="lg">
					Analyse starten
				</Button>
			</div>
		</CardContent>
	</Card>
)
