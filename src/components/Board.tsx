import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "../lib/supabase"
import { signInAnonymously } from "../lib/auth";
import Column from "./Column"
import Card from "./Card";
import type { Task } from "../lib/types";
import styles from "../css/Board.module.css";

/* NOTE
 * In the future, the list of columns could be dynamically generated
 * But that doesn't make sense for now since no option to add or edit columns exists
*/
const defaultCols = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

export default function Board() {
	const [activeCard, setActiveCard] = useState<Task | null>(null); // Task being acted upon
	const [columns, setColumns] = useState<Record<string, Task[]>>({}); // Record of columns using the status as the key
	const [error, setError] = useState<string | null>(null); // Error string if exists 
	const [loading, setLoading] = useState(true); // If loading
	const [openPopover, setOpenPopover] = useState<string | null>(null); // Track if a popover is open
	const [userId, setUserId] = useState<string | null>(null); // User's id as a string
	const [layout, setLayout] = useState<"row" | "column">("row"); // For setting vertical or horizontal layout based on screen size

	const boardRef = useRef<HTMLDivElement>(null);

	// Move a card and update columns
	const moveCard = useCallback((cardId: string, columnFromId: string, columnToId: string) => {
		setColumns(prev => {
			const fromCards = (prev[columnFromId] ?? []).filter(c => c.id !== cardId); // Remove card from its original column
			const card = (prev[columnFromId] ?? []).find(c => c.id === cardId); // Locate card
			if (!card) return prev; // Do nothing if card does not exist
			const toCards = [...(prev[columnToId] ?? []), { ...card, status: columnToId }]; // Append card with updated status to new column
			return { ...prev, [columnFromId]: fromCards, [columnToId]: toCards }; // Return columns with updated card lists
		});
	}, []);

	// Make cards move with mouse
	const handleDragStart = useCallback((event: DragStartEvent) => {
		const cardId = event.active.id as string;

		// Find and set active card
		for (const cards of Object.values(columns)) {
			const card = cards.find(c => c.id === cardId);
			if (card) { setActiveCard(card); break; }
		}
	}, [columns]);

	// Move card when dragged and dropped over column
	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return; // Do nothing if not dropped over droppable zone

		try {
			// Extract ids
			const cardId = active.id as string;
			const columnFromId = active.data.current?.status as string;
			const columnToId = over.id as string;
			if (columnFromId === columnToId) return;
			
			// Update card optimistically
			moveCard(cardId, columnFromId, columnToId);
			getSupabase().from("tasks").update({ status: columnToId }).eq("id", cardId).then(({ error }) => {
				if (error) setError(error.message);
				setActiveCard(null);
			});
			

		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "An unexpected error occurred");
		}
	}, [moveCard]);

	// Add card to both frontend and backend
	const handleAddCard = useCallback(async (status: string, title: string, description: string, due_date: string | null) => {
		if (!userId) return; // Do nothing if user hasn't been loaded
		try {
			// Attempt to add card to the backend
			const { data, error: insertError } = await getSupabase().from("tasks")
				.insert({ title, description, status, user_id: userId, due_date })
				.select()
				.single();
			if (insertError) throw insertError;

			// Update columns	
			setColumns(prev => ({
				...prev,
				[status]: [...(prev[status] ?? []), { id: data.id, title: data.title, description: data.description, due_date: data.due_date, status }],
			}));
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "An unexpected error occurred");
		}
	}, [userId]);

	// Create guest session on first app launch
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				getSupabase();

				// Attempt to restore existing guest session
				const { data: { session } } = await getSupabase().auth.getSession();
				if (!session) {
					await signInAnonymously(); // Create new one if can't find one
				}

				// Attempt to get user's id
				const { data } = await getSupabase().auth.getUser();
				const uid = data.user?.id ?? null;
				setUserId(uid);

				// Attempt to get user's tasks
				const { data: tasks, error: fetchError } = await getSupabase().from("tasks").select("*");
				if (fetchError) throw fetchError;

				// Convert backend result to Task
				const grouped: Record<string, Task[]> = {};
				for (const col of defaultCols) {
					grouped[col.id] = (tasks ?? [])
						.filter(t => t.status === col.id)
						.map(t => ({ id: t.id, title: t.title, description: t.description ?? null, status: t.status,  due_date: t.due_date ?? null }));
				}
				setColumns(grouped);

			} catch (e: unknown) {
				setError(e instanceof Error ? e.message : "An unexpected error occurred");
			} finally {
				setLoading(false);
			}
		})();
	}, []);


	// Decide to render columns vertically or horizontally
	useEffect(() => {
		const el = boardRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => {
			const totalColWidth = Object.keys(columns).length * 280 + (Object.keys(columns).length - 1) * 24;
			setLayout(totalColWidth > el.clientWidth ? "column" : "row");
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [Object.keys(columns).length]);

	// Show loading screen if loading
	if (loading) return (
		<div className={styles.loading}>
		<div className={styles.spinner} />
		</div>
	);
	
	// Show error if exists
	if (error) return (
		<div className={styles.error}>
			<div className={styles.errorCard}>
				<h2 className={styles.errorTitle}>Something went wrong</h2>
				<p className={styles.errorMessage}>{error}</p>
				<button className={styles.retryButton} onClick={() => window.location.reload()}>Try Again</button>
			</div>
		</div>
	);

	// Show main content
	return (
		<>	
			<h1 className={styles.title}>Guest's Task Board</h1>
			<div ref={boardRef} className={styles.board} data-layout={layout} style={{ "--cols": defaultCols.length } as React.CSSProperties }>
				
				<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
					{defaultCols.map(col => (
						<Column
							key={col.id}
							id={col.id}
							title={col.title}
							cards={columns[col.id] ?? []}
							onAddCard={handleAddCard}
							isPopoverOpen={openPopover === col.id}
							onTogglePopover={() => setOpenPopover(prev => prev === col.id ? null : col.id)}
							onClosePopover={() => setOpenPopover(null)}
						/>
					))}
					<DragOverlay dropAnimation={null}>
						{activeCard ? <Card {...activeCard} /> : null}
					</DragOverlay>

				</DndContext>
			</div>
		</>
	);
};
