"use client"

import { useState } from "react"
import type { FormData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Start } from "./steps/start"
import { LifeGoals } from "./steps/life-goals"
import { Financials } from "./steps/financials"
import { Mindset } from "./steps/mindset"
import { ScenarioSimulation } from "./steps/scenario-simulation"
import { Results } from "./steps/results"
import { RiskProfile } from "./steps/risk-profile"
import { ChevronLeft } from "lucide-react"

const TOTAL_STEPS = 6

const initialFormData: FormData = {
	step1: {
		lifePhase: "Next Generation",
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
	step4: { scenarios: [], answers: {} },
	step5: { riskProfileAnswers: {}, financialWorries: "" },
};

export const CheckRouter = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<FormData>(initialFormData)

    const nextStep = () => setCurrentStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev))
    const prevStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))

    const progress = (currentStep / (TOTAL_STEPS - 1)) * 100

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0: return <Start onNext={nextStep} />;
            case 1: return <LifeGoals setData={setFormData} data={formData} />;
            case 2: return <Financials setData={setFormData} data={formData} />;
            case 3: return <Mindset setData={setFormData} data={formData} />;
            case 4: return <ScenarioSimulation setData={setFormData} data={formData} />;
            case 5: return <RiskProfile setData={setFormData} data={formData} />;
            case 6: return <Results data={formData} />;
            default: return <Start onNext={nextStep} />;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <header className="mb-8">
                    {currentStep > 0 && currentStep < TOTAL_STEPS && (
                        <div className="mb-6 space-y-2">
                            <div className="flex text-sm font-medium text-muted-foreground">
                                <span className="text-primary font-bold">Schritt {currentStep} von {TOTAL_STEPS - 1}</span>
                            </div>
                            
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </header>

                <main>{renderCurrentStep()}</main>

                {currentStep > 0 && currentStep < TOTAL_STEPS && (
                    <footer className="mt-8 flex justify-between items-center">
                        <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="mr-1 h-4 w-4"/>Zurück
                        </Button>
                        <Button onClick={nextStep} className="px-8">
                            {currentStep === TOTAL_STEPS - 1 ? "Zur Analyse" : "Weiter"}
                        </Button>
                    </footer>
                )}
            </div>
        </div>
    )
}
