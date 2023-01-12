export type TCompanyGroup = {
  id: string;
  name: string;
  description?: string;
  members: {
    id: string | null;
    email: string;
  }[];
};
