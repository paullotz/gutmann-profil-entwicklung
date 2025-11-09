import { StepProps } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useCallback, useEffect, useState } from "react";
import { generateDynamicScenarios } from "@/app/actions/analyze";
import { LoaderCircle } from "lucide-react";

export const ScenarioSimulation: React.FC<StepProps> = ({ setData, data }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasLoaded, setHasLoaded] = useState(false);
	const { step4 } = data;

	const fetchScenarios = useCallback(async () => {
		if (hasLoaded || (data.step4.scenarios && data.step4.scenarios.length > 0)) {
			setIsLoading(false);
			return;
		}
		
		setIsLoading(true);
		setError(null);
		try {
			const result = await generateDynamicScenarios(data);
			setData(prev => ({
				...prev,
				step4: { 
					scenarios: result.scenarios, 
					answers: {} 
				}
			}));
			setHasLoaded(true);
		} catch (e) {
			setError("Fehler bei der Szenario-Erstellung. Bitte laden Sie die Seite neu.");
		} finally {
			setIsLoading(false);
		}
	}, [hasLoaded, data.step4.scenarios, setData]);

	useEffect(() => {
		fetchScenarios();
	});

	const handleAnswer = (scenarioId: string, value: string) => {
		setData(prev => ({ 
			...prev, 
			step4: { 
				...prev.step4, 
				answers: {
					...prev.step4.answers,
					[scenarioId]: value
				}
			} 
		}));
	};

	if (isLoading) {
		return (
			<Card className="shadow-sm text-center p-8">
				<LoaderCircle className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" />
				<p>Ihre persönlichen Szenarien werden generiert...</p>
				<p className="text-sm text-muted-foreground">Die KI analysiert Ihre Eingaben, um relevante Entscheidungssituationen zu erstellen.</p>
			</Card>
		);
	}

	if (error) return <div className="text-center p-8 text-destructive">{error}</div>;

	return (
		<div className="space-y-6">
			{step4.scenarios?.map((scenario, index) => (
				<Card key={scenario.id} className="shadow-sm">
					<CardHeader>
						<CardTitle>Szenario {index + 1}: Ihre Entscheidung</CardTitle>
						<CardDescription>{scenario.scenario}</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 space-y-4">
						{scenario.options.map(opt => (
							<div
								key={opt.value}
								onClick={() => handleAnswer(scenario.id, opt.value)}
								className={`p-4 border rounded-lg cursor-pointer transition-all ${
									step4.answers?.[scenario.id] === opt.value 
										? "border-primary bg-primary/5 ring-2 ring-primary" 
										: "hover:bg-muted/50 hover:border-muted-foreground/20"
								}`}
							>
								<h4 className="font-semibold">{opt.title}</h4>
								<p className="text-sm text-muted-foreground">{opt.description}</p>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
};
