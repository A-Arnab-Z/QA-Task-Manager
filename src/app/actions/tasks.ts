'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/firebase/init';
import { addDoc, collection, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Task } from '@/lib/types';

export async function createTask(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  await addDoc(collection(db, 'tasks'), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  revalidatePath('/tasks');
}

export async function updateTask(taskId: string, patch: Partial<Task>) {
  await updateDoc(doc(db, 'tasks', taskId), { ...patch, updatedAt: serverTimestamp() });
  revalidatePath('/tasks');
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, 'tasks', taskId));
  revalidatePath('/tasks');
}
