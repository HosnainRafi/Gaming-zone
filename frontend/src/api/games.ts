import { api } from "./axios";

export interface Game {
  id: string;
  title: string;
  platform: string;
  genre: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameInput {
  title: string;
  platform: string;
  genre: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateGameInput {
  title?: string;
  platform?: string;
  genre?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export async function getGames(options?: {
  all?: boolean;
  platform?: string;
}): Promise<Game[]> {
  const params = new URLSearchParams();
  if (options?.platform) params.set("platform", options.platform);
  const basePath = options?.all ? "/games/admin" : "/games";
  const query = params.toString();
  const { data } = await api.get<Game[]>(
    query ? `${basePath}?${query}` : basePath,
  );
  return data;
}

export async function getGamePlatforms(): Promise<string[]> {
  const { data } = await api.get<string[]>("/games/platforms");
  return data;
}

export async function getGame(id: string): Promise<Game> {
  const { data } = await api.get<Game>(`/games/admin/${id}`);
  return data;
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const { data } = await api.post<Game>("/games", input);
  return data;
}

export async function updateGame(
  id: string,
  input: UpdateGameInput,
): Promise<Game> {
  const { data } = await api.patch<Game>(`/games/${id}`, input);
  return data;
}

export async function deleteGame(id: string): Promise<void> {
  await api.delete(`/games/${id}`);
}
