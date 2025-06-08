export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Photo {
  id: number;
  filename: string;
  originalName: string;
  description?: string;
  gcsUrl?: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  user: User;
} 