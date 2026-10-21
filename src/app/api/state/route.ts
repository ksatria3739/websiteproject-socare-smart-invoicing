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
            const serverInv = store.invoices[existingIdx];
            if (clientInv.status === 'PAID' && serverInv.status !== 'PAID') {
              store.invoices[existingIdx] = clientInv;
            }
          }
        }
      }

      if (Array.isArray(incoming.members)) {
        for (const clientMbr of incoming.members) {
          const existingIdx = store.members.findIndex(
            (m) =>
              m.id === clientMbr.id ||
              m.email.toLowerCase() === clientMbr.email.toLowerCase()
          );
          if (existingIdx === -1) {
            store.members.unshift(clientMbr);
          } else {
            const serverMbr = store.members[existingIdx];
            if (
              new Date(clientMbr.updatedAt).getTime() >=
              new Date(serverMbr.updatedAt).getTime()
            ) {
              store.members[existingIdx] = clientMbr;
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
