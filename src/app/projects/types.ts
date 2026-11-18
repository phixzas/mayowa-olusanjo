export type ProjectType = "data_analysis" | "data_science";

export type Project = {
  id: string;
  title: string;
  description: string;
  project_type: ProjectType;
  tools: string[];
  dashboard_path: string | null;
  github_url: string | null;
  live_url: string | null;
  is_published: boolean;
  display_order: number;
};
