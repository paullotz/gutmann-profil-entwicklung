 "use server"

  import { db } from '@/lib/db';
  import { testerFeedback } from '@/lib/db/schema';

  export async function submitFeedback(data: { rating: number; comment: string; consultationCode?: string }) {
	try {
	  await db.insert(testerFeedback).values({
		rating: data.rating,
		comment: data.comment,
		consultationCode: data.consultationCode || null,
	  });

	  return { success: true };
	} catch (error) {
	  console.error('Error submitting feedback:', error);
	  return { success: false, error: 'Failed to submit feedback' };
	}
  } 
