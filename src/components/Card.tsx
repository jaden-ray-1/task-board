import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../lib/types" 
import styles from "../css/Card.module.css";

// Determine if a date is due today, tomorrow, or before today
function getDueLabel(dateStr: string): "today" | "tomorrow" | "yesterday" | null {

	// Get and format dates
	const due = new Date(dateStr + "T00:00:00");
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Return label based on difference between dates
	const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
	if (diff === 0) return "today";
	if (diff === 1) return "tomorrow";
	if (diff <= -1) return "yesterday";
	return null;
}

// Color palette for "random" tag colors
const tagPalette = [
	{ bg: "#9fe3a7", fg: "#1d291e" },
	{ bg: "#9fe3b7", fg: "#212e25" },
	{ bg: "#9fe3c9", fg: "#1f2b27" },
	{ bg: "#9fe3da", fg: "#1f2b2a" },
	{ bg: "#9fdce3", fg: "#273436" },
	{ bg: "#9fc6e3", fg: "#283138" },
	{ bg: "#9fc6e3", fg: "#252d33" },
];

// Derive tag color from contents
// Keeps tag color consistent between sessions
function getTagColors(tag: string) {
	let hash = 0;
	for (let i = 0; i < tag.length; i++) {
		hash = tag.charCodeAt(i) + ((hash << 5) - hash);
	}
	return tagPalette[Math.abs(hash) % tagPalette.length];
}

export default function Card({ id, status, title, description, due_date, tags }: Task) {
	const dueLabel = status === "done" || !due_date ? null : getDueLabel(due_date); // Set due label if not done and has due date
	const { attributes, listeners, setNodeRef } = useDraggable({ id, data: { status } }); // Make draggable

	return (
		<div ref={setNodeRef} className={styles.card} {...listeners} {...attributes}>
			<div className={styles.titleRow}>
				<h3 className={styles.title}>{title}</h3>
				{due_date && (
					<span className={`${styles.dueDate} ${dueLabel ? styles[dueLabel] : ""}`}>
						{new Date(due_date  + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
					</span>
				)}
			</div>
			{description && <p className={styles.description}>{description}</p>}

			{tags && tags.length > 0 && (
				<div className={styles.tags}>
					{tags.map((tag, i) => (
						<span key={i} className={styles.tag} style={{ background: getTagColors(tag).bg, color: getTagColors(tag).fg }}>
							{tag}
						</span>
					))}
				</div>
			)}


		</div>
	);
};
