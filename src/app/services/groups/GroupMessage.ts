export interface GroupMessage{
  id: number;
  groupId:number;
  message?: string;
  dateSent: Date;
  fileUrl?:string;
}
