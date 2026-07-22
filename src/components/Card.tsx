import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../lib/types" 
import styles from "../css/Card.module.css";

export default function Card({ id, status, title, description }: Task) {
	const { attributes, listeners, setNodeRef } = useDraggable({ id, data: { status } });
	return (
		<div ref={setNodeRef} className={styles.card} {...listeners} {...attributes}>
			<h2 className={styles.title}>{title}</h2>
			<p className={styles.description}>{description}</p>
		</div>
	);
};
