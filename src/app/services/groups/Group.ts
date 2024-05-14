export interface Group{
  id: number;
  name:string;
  description: string;
  coachId:number;
  profileImage?: string;
  createdAt: Date;
  coachUsername :string;
}
