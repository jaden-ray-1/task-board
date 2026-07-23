import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import type { Task } from "../lib/types"
import styles from "../css/Column.module.css";

interface ColumnProps {
	id: string;
	title: string;
	cards: Task[];
	onAddCard: (status: string, title: string, description: string, due_date: string | null) => void;
	isPopoverOpen: boolean;
	onTogglePopover: () => void;
	onClosePopover: () => void;
};

export default function Column({ id, title, cards, onAddCard, isPopoverOpen, onTogglePopover, onClosePopover }: ColumnProps) {
	
	const [newTitle, setNewTitle] = useState(""); // New task's title
	const [newDescription, setNewDescription] = useState(""); // New task's description
	const [newDueDate, setNewDueDate] = useState(""); // New task's due date
	const { setNodeRef } = useDroppable({ id });
	const popoverRef = useRef<HTMLDivElement>(null);

	// Create new task
	const handleSubmit = () => {
		if (!newTitle.trim()) return; // Do nothing if title is blank
		onAddCard(id, newTitle.trim(), newDescription.trim() || null,  newDueDate || null);
		
		// Reset form
		setNewTitle("");
		setNewDescription("");
		setNewDueDate("");
		onClosePopover();
	};

	// Handle new task popover
	useEffect(() => {
		if (!isPopoverOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
				
				// Reset form
				setNewTitle("");
				setNewDescription("");
				setNewDueDate("");
				onClosePopover();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isPopoverOpen, onClosePopover]);

	return (
		<div ref={setNodeRef} className={styles.column}>
			<div className={styles.titleRow}>
				<h2 className={styles.title}> {title} </h2>
				<div className={styles.buttonWrapper}>

					<button className={styles.addTaskButton} onMouseDown={e => e.stopPropagation()} onClick={() => {
						if (isPopoverOpen) {
							setNewTitle("");
							setNewDescription("");
							setNewDueDate("");
						}
						onTogglePopover();
					}}>
						<img src="/plus.svg" alt="Add task" />
					</button>
					{isPopoverOpen && (
						<div ref={popoverRef} className={styles.popover}>

							<label className={styles.dateLabel}>Title</label>
							<input
								placeholder="Fix Styling"
								value={newTitle}
								onChange={e => setNewTitle(e.target.value)}
								autoFocus
							  />

							<label className={styles.dateLabel}>Description (optional)</label>
							<textarea
								placeholder="Update CSS to center the root div"
								value={newDescription}
								onChange={e => setNewDescription(e.target.value)}
							/>

							<label className={styles.dateLabel}>Due date (optional)</label>
							<input
								type="date"
								value={newDueDate}
								onChange={e => setNewDueDate(e.target.value)}
							/>

							<button onClick={handleSubmit}>Create task</button>
						</div>
					)}
				</div>
			</div>
			{cards.map(card => (
				<Card key={card.id} id={card.id} status={id} title={card.title} description={card.description} due_date={card.due_date} />
			))}
		</div>
	);
};
