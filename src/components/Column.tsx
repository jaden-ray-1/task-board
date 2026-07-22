import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import type { Task } from "../lib/types"
import styles from "../css/Column.module.css";

interface ColumnProps {
	id: string;
	title: string;
	cards: Task[];
	onAddCard: (status: string, title: string, description: string) => void;
};

export default function Column({ id, title, cards, onAddCard }: ColumnProps) {
	
	const [showForm, setShowForm] = useState(false); // If adding new task
	const [newTitle, setNewTitle] = useState(""); // New task's title
	const [newDescription, setNewDescription] = useState(""); // New task's description
	const { setNodeRef } = useDroppable({ id });
	const popoverRef = useRef<HTMLDivElement>(null);

	// Create new task
	const handleSubmit = () => {
		if (!newTitle.trim()) return; // Do nothing if title is blank
		onAddCard(id, newTitle.trim(), newDescription.trim());
		
		// Reset states
		setNewTitle("");
		setNewDescription("");
		setShowForm(false);
	};

	// Handle new task popover
	useEffect(() => {
		if (!showForm) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				
				// Reset form
				setShowForm(false);
				setNewTitle("");
				setNewDescription("");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showForm]);

	return (
		<div ref={setNodeRef} className={styles.column}>
			<div className={styles.titleRow}>
				<h2 className={styles.title}> {title} </h2>
				<div className={styles.buttonWrapper}>
					<button className={styles.addTaskButton} onMouseDown={e => e.stopPropagation()} onClick={() => setShowForm(prev => !prev)}>
						<img src="/plus.svg" alt="Add task" />
					</button>
					{showForm && (
						<div ref={popoverRef} className={styles.popover}>
							<input
								placeholder="Task title"
								value={newTitle}
								onChange={e => setNewTitle(e.target.value)}
								autoFocus
							  />

							<textarea
								placeholder="Description (optional)"
								value={newDescription}
								onChange={e => setNewDescription(e.target.value)}
							/>
							<button onClick={handleSubmit}>Create task</button>
						</div>
					)}
				</div>
			</div>
			{cards.map(card => (
				<Card key={card.id} id={card.id} status={id} title={card.title} description={card.description} />
			))}
		</div>
	);
};
