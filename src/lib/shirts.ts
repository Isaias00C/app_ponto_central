import { SIZES, type Size } from '@/constants/sizes';
import { supabase } from '@/lib/supabase';

export type Shirt = {
  id: string;
  description: string;
  imageUrl: string | null;
  stock: Record<Size, number>;
  total: number;
};

type ShirtRow = {
  id: string;
  description: string;
  image_url: string | null;
  shirt_stock: { size: Size; quantity: number }[];
};

function toShirt(row: ShirtRow): Shirt {
  const stock = Object.fromEntries(SIZES.map((size) => [size, 0])) as Record<Size, number>;
  for (const item of row.shirt_stock) {
    stock[item.size] = item.quantity;
  }
  const total = SIZES.reduce((sum, size) => sum + stock[size], 0);

  return {
    id: row.id,
    description: row.description,
    imageUrl: row.image_url,
    stock,
    total,
  };
}

export async function fetchShirts(): Promise<Shirt[]> {
  const { data, error } = await supabase
    .from('shirt_types')
    .select('id, description, image_url, shirt_stock(size, quantity)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as ShirtRow[]).map(toShirt);
}

export async function createShirt(input: {
  description: string;
  imageUrl: string | null;
}): Promise<string> {
  const { data, error } = await supabase
    .from('shirt_types')
    .insert({ description: input.description, image_url: input.imageUrl })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

// Sem policy de UPDATE/DELETE (migration04) o Supabase nao da erro: apenas afeta 0 linhas.
// Por isso pedimos as linhas de volta e tratamos "nenhuma" como falha.
const NOT_CHANGED = 'Camisa não encontrada ou sem permissão para alterar.';

export async function updateShirt(
  id: string,
  input: { description: string; imageUrl: string | null },
): Promise<void> {
  const { data, error } = await supabase
    .from('shirt_types')
    .update({ description: input.description, image_url: input.imageUrl })
    .eq('id', id)
    .select('id');

  if (error) throw error;
  if (data.length === 0) throw new Error(NOT_CHANGED);
}

/** Exclui a camisa e, em cascata, o estoque dela. */
export async function deleteShirt(id: string): Promise<void> {
  const { data, error } = await supabase.from('shirt_types').delete().eq('id', id).select('id');

  if (error) throw error;
  if (data.length === 0) throw new Error(NOT_CHANGED);
}

/** Soma `quantity` ao estoque do tamanho e devolve o novo saldo. */
export async function addStock(shirtId: string, size: Size, quantity: number): Promise<number> {
  const { data, error } = await supabase.rpc('adjust_stock', {
    p_shirt_type_id: shirtId,
    p_size: size,
    p_delta: quantity,
  });

  if (error) throw error;
  return data as number;
}

export type StockItem = {
  shirtId: string;
  size: Size;
  quantity: number;
};

/** Da baixa em varios itens de uma vez. Tudo ou nada: falha sem alterar nada se faltar estoque. */
export async function checkoutStock(items: StockItem[]): Promise<void> {
  const { error } = await supabase.rpc('checkout_stock', {
    p_items: items.map((item) => ({
      shirt_type_id: item.shirtId,
      size: item.size,
      quantity: item.quantity,
    })),
  });

  if (error) throw error;
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Erro inesperado. Tente novamente.';
}
