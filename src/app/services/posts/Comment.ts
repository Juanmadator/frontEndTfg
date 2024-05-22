import { User } from "../user/User";

export interface Comment {
  postId: number;
  userId: number;
  content:string;
  userData?:User;
}


export interface UserData {
  username: string;
  profilepicture?: string;
  // Otros campos de información del usuario si es necesario
}
