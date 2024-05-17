export interface Group {
  id: number;
  name: string;
  description: string;
  coachId: number;
  profileImage?: string;
  createdAt: Date;
  coachName: string;
  perteneceUsuario:boolean;

}

export interface GroupResponse {
  content: Group[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}
