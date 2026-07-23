// Local instance of backend's task schema
export interface Task {
	id: string;
	title: string;
	status: string;
	description: string  | null;
	due_date: string | null;
}
