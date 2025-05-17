import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageController } from '@/app/controllers/messageController';

// DELETE /api/messages/[id] - Delete a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Use controller to delete message
    return messageController.deleteMessage(id, session);
  } catch (error: any) {
    console.error(`Error in DELETE /api/messages/${params.id}:`, error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 