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


export default function Card({ id, status, title, description, due_date }: Task) {
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
		</div>
	);
};
