export interface User {
  id: number;
  email: string;
  username: string;
  woodcuttingXp: number;
  fishingXp: number;
  miningXp: number;
  huntingXp: number;
}

export interface RegistrationRequest {
  email: string;
  username: string;
  password: string;
}
