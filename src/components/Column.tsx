import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import type { Task } from "../lib/types"
import styles from "../css/Column.module.css";

interface ColumnProps {
	id: string;
	title: string;
	cards: Task[];
	onAddCard: (status: string, title: string, description: string, dueDate: string | null, tags: string[] | null) => void;
	isPopoverOpen: boolean; // Track popover state across columns
	onTogglePopover: () => void; // Switch popover between columns
	onClosePopover: () => void;
};

export default function Column({ id, title, cards, onAddCard, isPopoverOpen, onTogglePopover, onClosePopover  }: ColumnProps) {
	
	const [newTitle, setNewTitle] = useState(""); // New task's title
	const [newDescription, setNewDescription] = useState(""); // New task's description
	const [newDueDate, setNewDueDate] = useState(""); // New task's due date
	const [tagInput, setTagInput] = useState(""); // Current tag being typed
	const [newTags, setNewTags] = useState<string[]>([]); // Added tags
	const { setNodeRef } = useDroppable({ id });
	const popoverRef = useRef<HTMLDivElement>(null);

	// Make adding tags chip-like
	const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

		// Add tag on enter or comma
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const tag = tagInput.trim();
			if (tag && !newTags.includes(tag)) {
				setNewTags(prev => [...prev, tag]);
			}
			setTagInput("");
		}

		// Remove tag on backspace
		if (e.key === "Backspace" && !tagInput && newTags.length > 0) {
			setNewTags(prev => prev.slice(0, -1));
		}
	};

	// Click to remove tag
	const removeTag = (index: number) => {
		setNewTags(prev => prev.filter((_, i) => i !== index));
	};

	// Create new task
	const handleSubmit = () => {
		if (!newTitle.trim()) return; // Do nothing if title is blank
		onAddCard(id, newTitle.trim(), newDescription.trim() || null, newDueDate || null, newTags || null);

		// Reset form
		setNewTitle("");
		setNewDescription("");
		setNewDueDate("");
		setNewTags([]);
		setTagInput("");
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
				setNewTags([]);
				setTagInput("");
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

							<label className={styles.forumLabel}>Title</label>
							<input
								placeholder="Fix Styling"
								value={newTitle}
								onChange={e => setNewTitle(e.target.value)}
								autoFocus
							  />

							<label className={styles.forumLabel}>Description (optional)</label>
							<textarea
								placeholder="Update CSS to center the root div"
								value={newDescription}
								onChange={e => setNewDescription(e.target.value)}
							/>

							<label className={styles.forumLabel}>Due date (optional)</label>
							<input
								type="date"
								value={newDueDate}
								onChange={e => setNewDueDate(e.target.value)}
							/>

							<label className={styles.formLabel}>Tags</label>
			
							<div className={styles.tagsContainer}>
								{newTags.map((tag, i) => (
									<span key={i} className={styles.tag}>
										{tag}
										<button type="button" onClick={() => removeTag(i)} className={styles.tagRemove}>×</button>
									</span>
								))}
								<input
									className={styles.tagInput}
									placeholder="Add a tag"
									value={tagInput}
									onChange={e => setTagInput(e.target.value)}
									onKeyDown={handleTagKeyDown}
								/>
							</div>

							<button onClick={handleSubmit}>Create task</button>
						</div>
					)}
				</div>
			</div>
			{cards.map(card => (
				<Card key={card.id} id={card.id} status={id} title={card.title} description={card.description} due_date={card.due_date} tags={card.tags} />
			))}

		</div>
	);
};
