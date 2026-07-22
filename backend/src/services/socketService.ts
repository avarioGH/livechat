import { Server, Socket } from 'socket.io';
import { prisma } from '../index';
import { generateAIReply } from './aiService';

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join a specific tenant's room (e.g. for Client Admins to listen to all chats)
    socket.on('join_tenant', (tenantId: string) => {
      socket.join(tenantId);
      console.log(`Socket ${socket.id} joined tenant room ${tenantId}`);
    });

    // Join a specific conversation room (for both Customer and Admin)
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data: { conversationId: string, content: string, sender: 'CUSTOMER' | 'HUMAN_ADMIN', tenantId: string }) => {
      try {
        // 1. Save to DB
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            content: data.content,
            sender: data.sender,
          }
        });

        // 2. Emit to the conversation room
        io.to(data.conversationId).emit('new_message', message);

        // 3. If Customer sent it, check if AI is active and needs to reply
        if (data.sender === 'CUSTOMER') {
          const conversation = await prisma.conversation.findUnique({
            where: { id: data.conversationId }
          });

          if (conversation?.isAIActive) {
            console.log('Triggering AI for conversation:', data.conversationId);
            
            // Generate Reply
            // We pass a simple chat history (just the user's latest message for simplicity in this demo)
            // In a real app, we'd query the last N messages from the DB
            const aiReplyText = await generateAIReply(data.tenantId, [
              { role: 'user', content: data.content }
            ]);

            // Save AI Reply to DB
            const aiMessage = await prisma.message.create({
              data: {
                conversationId: data.conversationId,
                content: aiReplyText,
                sender: 'AI',
              }
            });

            // Emit AI response back to the room
            io.to(data.conversationId).emit('new_message', aiMessage);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handover to Human (Toggle AI off)
    socket.on('take_over', async (conversationId: string) => {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { isAIActive: false }
      });
      io.to(conversationId).emit('ai_handover_status', { isAIActive: false });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
