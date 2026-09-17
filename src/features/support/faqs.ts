export type Faq = { id: string; question: string; answer: string };

/**
 * Written here rather than served, since the answers change with the app
 * and ship with it. Move them behind an endpoint when support can edit them.
 */
export const FAQS: Faq[] = [
	{
		id: "create-event",
		question: "How do I create an event?",
		answer:
			"Go to your Profile tab, click on 'Create Event' from the options, fill in your event details (date, venue, description), and hit launch. You can invite connections directly.",
	},
	{
		id: "connect",
		question: "How do I connect with others?",
		answer:
			"Open Discover or Search, pick a person and tap Connect on their profile. They get a request, and once they accept you can message each other and plan a meetup.",
	},
	{
		id: "verify",
		question: "How do I verify my account?",
		answer:
			"Open your Profile and choose KYC Verification. You will be asked for a government ID, proof of address and a quick selfie. Verified accounts show a badge across the app.",
	},
	{
		id: "safety",
		question: "How does a safety verified meetup work?",
		answer:
			"When you agree a meetup in chat, both of you get a one time arrival code. Share your live location on the way, confirm each other's code when you arrive, and your safety circle is told if a check in is missed.",
	},
	{
		id: "subscription",
		question: "How do I change my subscription plan?",
		answer:
			"Open Profile, then Subscription Plans. Pick the plan you want and follow the payment steps. Your new plan starts as soon as the payment is confirmed.",
	},
	{
		id: "delete",
		question: "How do I delete my account?",
		answer:
			"Open Profile, then Settings, then Delete Account. Tell us why you are leaving, confirm the code we email you, and your account is deactivated straight away.",
	},
];
