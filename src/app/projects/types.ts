export type ProjectType = "data_analysis" | "data_science";

export type ProjectAsset = {
  id: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  display_order: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  project_type: ProjectType;
  tools: string[];
  dashboard_path: string | null;
  cover_image_path: string | null;
  project_assets: ProjectAsset[];
  github_url: string | null;
  live_url: string | null;
  is_published: boolean;
  display_order: number;
};
