import React from 'react';
import { auth, signOut } from '@/auth';
import db from '@/lib/db';
import { HeaderBridge } from './HeaderBridge';

export default async function Header() {
  const session = await auth();

  let isAdmin = false;
  if (session?.user?.id) {
    const { data: adminRow } = await db.from('admins').select('id').eq('discord_id', session.user.id).single();
    isAdmin = !!adminRow;
  }

  const logoutAction = async () => {
    "use server"
    await signOut({ redirectTo: '/' })
  };

  return <HeaderBridge session={session} isAdmin={isAdmin} logoutAction={logoutAction} />;
}
