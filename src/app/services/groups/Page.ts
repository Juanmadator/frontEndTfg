
export interface Page<T> {
  content: T[];
  pageable: any; // Define la estructura adecuada para pageable si es necesario
  last: boolean;
  totalPages: number;
  totalElements: number;
  // Agrega otras propiedades si son relevantes para tu caso
}
