"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarIcon, CheckCircle2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";

interface FeedbackFormProps {
	consultationCode?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ consultationCode }) => {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = async () => {
		if (rating === 0) return;

		setIsSubmitting(true);
		const result = await submitFeedback({ rating, comment, consultationCode });
		setIsSubmitting(false);

		if (result.success) {
			setIsSuccess(true);
		}
	};

	if (isSuccess) {
		return (
			<Card className="bg-green-50 border-green-200 mt-8 mb-8 animate-fade-in">
				<CardContent className="pt-6 text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle2 className="h-10 w-10 text-green-600" />
					</div>
					<h3 className="text-lg font-semibold text-green-800">Danke für Ihr Feedback!</h3>
					<p className="text-green-700">Ihre Rückmeldung hilft uns sehr.</p>
				</CardContent>
			</Card>
		);
	}

	if (!isOpen) {
		return (
			<div className="flex justify-center mt-8 mb-8 animate-fade-in">
				<button 
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group px-4 py-2 rounded-md hover:bg-muted/50"
				>
					<MessageSquare className="h-4 w-4" />
					<span>Feedback zum Prototypen geben</span>
					<ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
				</button>
			</div>
		);
	}

	return (
		<Card className="mt-8 mb-8 border-dashed border-2 bg-muted/30 animate-in slide-in-from-bottom-2 relative">
			<button 
				onClick={() => setIsOpen(false)}
				className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-background/50 transition-colors"
				title="Schließen"
			>
				<ChevronUp className="h-4 w-4" />
			</button>

			<CardHeader>
				<CardTitle className="text-base">Feedback für das Entwickler-Team</CardTitle>
				<CardDescription>
					Dies ist ein Prototyp. Helfen Sie uns mit Ihrem Feedback!
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Wie finden Sie den Prototypen?</Label>
					<div className="flex gap-2">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onClick={() => setRating(star)}
								className="focus:outline-none transition-transform hover:scale-110"
							>
								<StarIcon
									className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
										}`}
								/>
							</button>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Kommentare oder Verbesserungsvorschläge (optional)</Label>
					<Textarea
						placeholder="Was hat Ihnen gefallen? Was fehlt?"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						className="bg-background"
					/>
				</div>

				<div className="flex justify-between items-center pt-2">
					<button 
						onClick={() => setIsOpen(false)}
						className="text-sm text-muted-foreground hover:text-foreground px-2"
					>
						Abbrechen
					</button>
					<Button
						onClick={handleSubmit}
						disabled={rating === 0 || isSubmitting}
						size="sm"
					>
						{isSubmitting ? "Wird gesendet..." : "Feedback absenden"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
