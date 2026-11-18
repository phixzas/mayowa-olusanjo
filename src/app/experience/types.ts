export type Experience = {
  id: string;
  title: string;
  organization: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  is_published: boolean;
  display_order: number;
};
