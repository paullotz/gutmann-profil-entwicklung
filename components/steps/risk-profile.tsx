import { generateRiskQuestions } from "@/lib/risk-questionts";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RiskQuestion, StepProps } from "@/lib/types";

export const RiskProfile: React.FC<StepProps> = ({ setData, data }) => {
  const { step3, step5 } = data;
  const { riskProfileAnswers, financialWorries } = step5;

  const [riskQuestions, setRiskQuestions] = useState<RiskQuestion[]>([]);
  
  useEffect(() => {
    const questions = generateRiskQuestions(data);
    setRiskQuestions(questions);
  }, [data]);

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
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    riskProfileAnswers[q.id] === opt.value 
                      ? "border-primary bg-primary/5 ring-2 ring-primary" 
                      : "hover:bg-muted/50 hover:border-muted-foreground/20"
                  }`}
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
              <p className="text-sm text-muted-foreground">
                Sie haben "Stress" oder "Kompliziert" als Gefühl zu Geld angegeben. 
                Was genau bereitet Ihnen Sorgen?
              </p>
              <Textarea
                id="financialWorries" 
                value={financialWorries} 
                onChange={(e) => setData((prev) => ({ 
                  ...prev, 
                  step5: { ...prev.step5, financialWorries: e.target.value } 
                }))} 
                placeholder="z.B. Angst vor Inflation, Unwissen über Anlagemöglichkeiten, Komplexität von Finanzprodukten..." 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
