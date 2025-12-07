import { Step1Data, StepProps } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { InfoIcon } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import { Slider } from "../ui/slider"

// Step 1
export const LifeGoals: React.FC<StepProps> = ({ setData, data }) => {
	const { step1 } = data

	const handleGoalChange = (goal: keyof Step1Data["goals"]) => {
		setData((prev) => ({
			...prev,
			step1: { ...prev.step1, goals: { ...prev.step1.goals, [goal]: !prev.step1.goals[goal] } },
		}))
	}

	const goalLabels: Record<keyof Step1Data["goals"], string> = {
		retirement: "Ruhestand & Nachfolgeplanung", // Statt "Altersvorsorge"
		realEstate: "Real Estate Investments",      // Statt "Immobilie"
		wealth: "Vermögensstrukturierung",          // Statt "Vermögensaufbau"
		other: "Andere",
	}

	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle>Lebenssituation & Strategie</CardTitle>
				<CardDescription>In welcher Phase befinden Sie sich und welche Prioritäten setzen Sie?</CardDescription>
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
								<SelectItem value="Next Generation">Next Generation</SelectItem>
								<SelectItem value="Unternehmer">Unternehmer</SelectItem>
								<SelectItem value="Family Office">Family Office</SelectItem>
								<SelectItem value="Vor dem Ruhestand">Vor dem Ruhestand</SelectItem>
								<SelectItem value="Im Ruhestand">Privatier</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Label>Was sind die Schwerpunkte Ihrer Strategie?</Label>
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<button type="button" className="text-muted-foreground hover:text-primary transition-colors">
										<InfoIcon className="h-4 w-4" />
									</button>
								</TooltipTrigger>
								<TooltipContent className="max-w-[300px] bg-slate-900 text-white p-3">
									<p className="leading-snug">
										Wählen Sie die Bereiche aus, die für Ihre Zukunft oder Ihre Familie am wichtigsten sind.
										Das hilft uns dabei, Ihr Vermögen passend zu Ihren Wünschen aufzuteilen.
									</p>
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
									<h4 className="font-semibold">Fokus: {goalLabels[key]}</h4>
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
													<SelectItem value="0-5 Jahre">0-5 Jahre (Kurzfristig)</SelectItem>
													<SelectItem value="5-10 Jahre">5-10 Jahre (Mittelfristig)</SelectItem>
													<SelectItem value="10-20 Jahre">10-20 Jahre (Langfristig)</SelectItem>
													<SelectItem value="20+ Jahre">20+ Jahre (Generationenübergreifend)</SelectItem>
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
