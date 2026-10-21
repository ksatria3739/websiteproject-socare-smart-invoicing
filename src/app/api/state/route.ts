import { NextRequest, NextResponse } from 'next/server';
import { getServerStore, persistServerStore } from '@/lib/store';
import { getInitialDatabaseState } from '@/lib/seed';
import { DatabaseState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getServerStore();
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.action === 'RESET_DEMO') {
      const initial = getInitialDatabaseState();
      persistServerStore(initial);
      return NextResponse.json({ ok: true, state: initial });
    }

    if (body?.action === 'SYNC_CLIENT' && body?.state) {
      const incoming = body.state as DatabaseState;
      const store = getServerStore();

      // Merge any custom invoices created on client that server might not have after cold start
      if (Array.isArray(incoming.invoices)) {
        for (const clientInv of incoming.invoices) {
          const existingIdx = store.invoices.findIndex(
            (s) =>
              s.id === clientInv.id ||
              s.viewToken === clientInv.viewToken ||
              s.checkoutToken === clientInv.checkoutToken
          );
          if (existingIdx === -1) {
            store.invoices.unshift(clientInv);
          } else {
            // Keep whichever version was updated more recently (e.g., if paid)
            const serverInv = store.invoices[existingIdx];
            if (
              clientInv.status === 'PAID' &&
              serverInv.status !== 'PAID'
            ) {
              store.invoices[existingIdx] = clientInv;
            }
          }
        }
      }

      persistServerStore(store);
      return NextResponse.json({ ok: true, state: store });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
