"use client"

import { getFinancialAnalysis } from "@/app/actions/analyze";
import { FormData, GeminiAnalysis } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { LoaderCircle } from "lucide-react";
import RadarChartComponent from "../RadarChartComponent";
import { CalendarIcon, CopyIcon } from "@radix-ui/react-icons";

export const Results: React.FC<{ data: FormData }> = ({ data }) => {
	const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [consultationCode, setConsultationCode] = useState<string>("");
	const [isCopied, setIsCopied] = useState(false);
	const [consentToSave, setConsentToSave] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

	const fetchAnalysis = useCallback(async () => {
		console.log("Starting fetch...");
		setIsLoading(true);
		setError(null);
		setAnalysis(null); // Clear previous analysis

		try {
			const result = await getFinancialAnalysis(data);
			setAnalysis(result);
		} catch (e) {
			console.error(e);
			setError("Fehler bei der Analyse. Bitte versuchen Sie es später erneut.");
		} finally {
			setIsLoading(false);
			console.log("Fetch finished.");
		}
	}, [data]); 

	useEffect(() => {
		if (data) { 
			fetchAnalysis();
		}
	}, [fetchAnalysis]); 

	const financialTips = useMemo(() => {
		const tips = [
			"💡 Die 50/30/20-Regel: 50% für Notwendiges, 30% für Wünsche, 20% zum Sparen",
			"📈 Zeit im Markt schlägt Market Timing - Langfristig investieren zahlt sich aus",
			"🛡️ Ein Notgroschen von 3-6 Monatsausgaben gibt finanzielle Sicherheit",
			"🎯 Diversifikation ist der einzige Free Lunch beim Investieren",
			"💰 Beginnen Sie früh - Der Zinseszins ist Ihr bester Freund",
		];

		// Personalisiere basierend auf Zielen
		if (data.step1.goals.retirement) {
			tips.push("🏖️ Je früher Sie für die Rente sparen, desto weniger müssen Sie monatlich zurücklegen");
		}
		if (data.step1.goals.realEstate) {
			tips.push("🏠 Eigenkapital von mindestens 20% senkt die Kreditkosten erheblich");
		}
		if (data.step3.investmentExperience === "Keine") {
			tips.push("📚 ETFs sind ein guter Einstieg für Anfänger - breit diversifiziert und kostengünstig");
		}
		if (data.step3.moneyFeelings.includes("Stress")) {
			tips.push("🧘 Ein klarer Finanzplan reduziert Stress und gibt Kontrolle zurück");
		}

		return tips;
	}, [data]);

	const [currentTipIndex, setCurrentTipIndex] = useState(0);
	const handleDownloadPDF = async () => {
		setIsDownloadingPDF(true);

		try {
			const response = await fetch('/api/pdf', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					formData: data,
					analysis: analysis,
					consultationCode: consultationCode,
				}),
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `financial_check_${consultationCode}.pdf`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} else {
				setError('Fehler beim Erstellen des PDFs');
			}
		} catch (error) {
			console.error('PDF download error:', error);
			setError('Fehler beim Herunterladen des PDFs');
		} finally {
			setIsDownloadingPDF(false);
		}
	};

	const handleSaveData = async () => {
		if (!consentToSave) return;

		setIsSaving(true);
		setSaveSuccess(false);

		try {
			const response = await fetch('/api/data', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					formData: data,
					analysis: analysis,
				}),
			});

			const result = await response.json();

			if (result.success) {
				const generatedCode = result.data.consultationCode;
				setConsultationCode(generatedCode);
				setSaveSuccess(true);
			} else {
				setError("Fehler beim Speichern der Daten.");
			}
		} catch (error) {
			console.error('Error saving data:', error);
			setError("Fehler beim Speichern der Daten.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(consultationCode).then(() => {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		});
	};


	const scoreColors: Record<string, string> = {
		Ausgezeichnet: "text-green-600 bg-green-100",
		Gut: "text-green-600 bg-green-100",
		Solide: "text-yellow-600 bg-yellow-100",
		Optimierungsbedarf: "text-orange-600 bg-orange-100"
	};

	// Wechsle Tipp alle 3 Sekunden
	useEffect(() => {
		if (!isLoading) return;

		const interval = setInterval(() => {
			setCurrentTipIndex((prev) => (prev + 1) % financialTips.length);
		}, 3000);

		return () => clearInterval(interval);
	}, [isLoading, financialTips.length]);

	if (isLoading) return (
		<Card className="shadow-sm text-center p-8">
			<LoaderCircle className="animate-spin rounded-full h-12 w-12 mx-auto mb-6 text-primary" />
			<h3 className="text-xl font-semibold mb-4">Ihre Analyse wird erstellt...</h3>
			<p className="text-sm text-muted-foreground mb-6">
				Die KI analysiert Ihre Eingaben und erstellt ein detailliertes Finanzprofil
			</p>

			{/* Fortschrittsbalken */}
			<div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
				<div className="h-full bg-primary animate-progress-indeterminate"></div>
			</div>

			{/* Animierte Finanztipps */}
			<div className="bg-muted/50 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
				<div className="space-y-2">
					<p className="text-xs font-semibold text-primary uppercase tracking-wide">
						Finanztipp #{currentTipIndex + 1}
					</p>
					<p
						key={currentTipIndex}
						className="text-base font-medium animate-fade-in"
					>
						{financialTips[currentTipIndex]}
					</p>
				</div>
			</div>

			<p className="text-xs text-muted-foreground mt-4">
				Dies dauert nur wenige Sekunden...
			</p>
		</Card>
	);

	if (error || !analysis) return (
		<div className="text-center p-8 text-destructive">
			{error || "Analyse konnte nicht geladen werden."}
		</div>
	);

	return (
		<div className="space-y-6">
			<Card className="bg-muted/50 border-primary shadow-sm">
				<CardContent className="pt-6">
					{!saveSuccess ? (
						<div className="space-y-4">
							<div className="text-center">
								<h3 className="text-xl font-semibold mb-2">Möchten Sie Ihre Ergebnisse speichern?</h3>
								<p className="text-muted-foreground mb-4">
									Speichern Sie Ihre Analyse, um einen persönlichen Beratungscode zu erhalten.
									Mit diesem Code können Sie später auf Ihre Ergebnisse zugreifen und ein Expertengespräch anfordern.
								</p>
							</div>

							<div className="flex items-start space-x-2 p-4 border rounded-lg bg-background">
								<Checkbox
									id="consent"
									checked={consentToSave}
									onCheckedChange={(checked) => setConsentToSave(checked as boolean)}
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										htmlFor="consent"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Ich stimme der Speicherung meiner Daten zu
									</Label>
									<p className="text-sm text-muted-foreground">
										Ihre Daten werden verschlüsselt gespeichert und nur für die Beratung verwendet.
										Sie können jederzeit die Löschung beantragen.
									</p>
								</div>
							</div>

							<Button
								onClick={handleSaveData}
								disabled={!consentToSave || isSaving}
								className="w-full"
								size="lg"
							>
								{isSaving ? (
									<>
										<LoaderCircle className="animate-spin mr-2 h-4 w-4" />
										Wird gespeichert...
									</>
								) : (
									"Daten speichern & Code erhalten"
								)}
							</Button>
							<Button
								onClick={handleDownloadPDF}
								disabled={isDownloadingPDF}
								variant="outline"
								className="w-full"
							>
								{isDownloadingPDF ? (
									<>
										<LoaderCircle className="animate-spin mr-2 h-4 w-4" />
										PDF wird erstellt...
									</>
								) : (
									<>
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										Analyse als PDF herunterladen
									</>
								)}
							</Button>
						</div>
					) : (
						<div className="text-center space-y-4">
							<div className="inline-block p-3 bg-green-100 rounded-full mb-2">
								<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold">Erfolgreich gespeichert!</h3>
							<p className="text-muted-foreground">
								Ihre Analyse wurde gespeichert. Hier ist Ihr persönlicher Beratungscode:
							</p>
							<div className="my-6">
								<Label className="text-sm text-muted-foreground">Ihr persönlicher Beratungscode</Label>
								<div className="flex items-center justify-center gap-2 mt-2">
									<span className="text-2xl font-mono p-3 bg-background border-2 border-primary rounded-md">
										{consultationCode}
									</span>
									<Button variant="ghost" size="icon" onClick={handleCopy}>
										{isCopied ? "✓" : <CopyIcon />}
									</Button>
								</div>
								<p className="text-xs text-muted-foreground mt-2">
									Bewahren Sie diesen Code auf, um später auf Ihre Ergebnisse zuzugreifen
								</p>
							</div>
							<Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto" size="lg">
								<CalendarIcon className="mr-2" />
								Jetzt Experten-Gespräch anfordern
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Ihr Finanz-Ergebnis</CardTitle>
					<div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-fit ${scoreColors[analysis.scoreText] || "bg-gray-100"}`}>
						{analysis.scoreText}
					</div>
				</CardHeader>
				<CardContent className="pt-6">
					<p>{analysis.analyse}</p>
				</CardContent>
			</Card>

			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Profil-Übersicht</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<RadarChartComponent data={analysis.chartData} />
				</CardContent>
			</Card>

			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle>Ihre Detail-Analyse</CardTitle>
					<CardDescription>Hier sehen Sie eine Aufschlüsselung Ihrer Ergebnisse in den Kernbereichen.</CardDescription>
				</CardHeader>
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


			{isModalOpen && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
					<div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
						<h3 className="text-lg font-semibold mb-2">Beratungstermin vereinbaren</h3>
						<div className="text-center">
							<p className="mb-4">Vielen Dank für Ihr Interesse! Dieses Feature ist im Prototyp nicht implementiert.</p>
							<Button onClick={() => setIsModalOpen(false)}>Schließen</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
