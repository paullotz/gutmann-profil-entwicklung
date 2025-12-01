"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarIcon, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";

interface FeedbackFormProps {
	consultationCode?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ consultationCode }) => {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

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
			<Card className="bg-green-50 border-green-200 mt-12 mb-8 animate-fade-in">
				<CardContent className="pt-6 text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle2 className="h-10 w-10 text-green-600" />
					</div>
					<h3 className="text-lg font-semibold text-green-800">Danke für dein Feedback!</h3>
					<p className="text-green-700">Deine Rückmeldung hilft uns, den Prototypen zu verbessern.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mt-12 mb-8 border-dashed border-2 bg-muted/30">
			<CardHeader>
				<CardTitle className="text-base">Feedback für das Entwickler-Team</CardTitle>
				<CardDescription>
					Dies ist ein Prototyp. Hilf uns mit deinem Feedback!
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Wie findest du den Prototypen?</Label>
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

				<Button
					onClick={handleSubmit}
					disabled={rating === 0 || isSubmitting}
					size="sm"
				>
					{isSubmitting ? "Wird gesendet..." : "Feedback absenden"}
				</Button>
			</CardContent>
		</Card>
	);
};
