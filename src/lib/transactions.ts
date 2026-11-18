import type { Size } from '@/constants/sizes';
import { supabase } from '@/lib/supabase';

export type TransactionItem = {
  id: string;
  /** Nome da camisa na hora da baixa (continua valendo mesmo se ela for excluida depois). */
  description: string;
  size: Size;
  quantity: number;
};

export type Transaction = {
  id: string;
  createdAt: Date;
  items: TransactionItem[];
  totalUnits: number;
  /** Caminho do comprovante no bucket privado; `null` se a venda foi feita sem foto. */
  receiptPath: string | null;
};

type TransactionRow = {
  id: string;
  created_at: string;
  receipt_path: string | null;
  transacao_itens: { id: string; descricao: string; size: Size; quantity: number }[];
};

const LIMIT = 200;

function toTransaction(row: TransactionRow): Transaction {
  const items = row.transacao_itens.map((item) => ({
    id: item.id,
    description: item.descricao,
    size: item.size,
    quantity: item.quantity,
  }));

  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    items,
    totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
    receiptPath: row.receipt_path,
  };
}

/** Transacoes mais recentes primeiro (ate 200). Exige a migration06. */
export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transacoes')
    .select('id, created_at, receipt_path, transacao_itens(id, descricao, size, quantity)')
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (error) throw error;
  return (data as TransactionRow[]).map(toTransaction);
}
