  export interface Post{
    content: string;
    userId:number;
    imageUrl?: string;
    userData?: UserData;
    datePosted: Date;
    id: number;
    loading:boolean;
    modalImage?: string;
    isFavourite:boolean;
  }


  export interface UserData {
    username: string;
    profilepicture?: string;
    // Otros campos de información del usuario si es necesario
  }
