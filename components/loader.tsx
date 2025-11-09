import { LoaderCircle } from "lucide-react"
import { Card } from "./ui/card"

export const Loader = () => {
	return (
		<Card className="shadow-sm text-center p-8">
			<LoaderCircle className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" />
			<p>Ihr persönliches Szenario wird generiert...</p>
			<p className="text-sm text-muted-foreground">Die KI analysiert Ihre Eingaben, um eine relevante Entscheidungssituation für Sie zu erstellen.</p>
		</Card>
	)
}
