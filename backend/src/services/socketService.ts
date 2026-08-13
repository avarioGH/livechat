import { Server, Socket } from 'socket.io';
import { prisma } from '../index';
import { generateAIReply } from './aiService';

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join a specific organization's room (e.g. for Agents to listen to all chats)
    socket.on('join_organization', (organizationId: string) => {
      socket.join(organizationId);
      console.log(`Socket ${socket.id} joined organization room ${organizationId}`);
    });

    // Join a specific conversation room (for both Customer and Agent)
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data: { conversationId: string, content: string, senderId: string, senderType: 'CUSTOMER' | 'HUMAN_AGENT' | 'AI_EMPLOYEE' | 'SYSTEM', organizationId: string }) => {
      try {
        // Ensure Conversation exists (especially for new Customer chats from Widget)
        let conversation = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
          include: { aiEmployee: true }
        });

        if (!conversation) {
           // Find an active AI employee for this organization to assign
           const ai = await prisma.aIEmployee.findFirst({
              where: { organizationId: data.organizationId, isActive: true }
           });
           
           let site = await prisma.site.findFirst({ where: { organizationId: data.organizationId } });
           if (!site) {
             site = await prisma.site.create({
               data: { organizationId: data.organizationId, name: 'Default Site', domain: 'example.com' }
             });
           }
           let customer = await prisma.customer.findFirst({ where: { organizationId: data.organizationId } });
           if (!customer) {
             customer = await prisma.customer.create({
               data: { organizationId: data.organizationId, name: 'Default Customer' }
             });
           }
           
           conversation = await prisma.conversation.create({
              data: {
                 id: data.conversationId,
                 organizationId: data.organizationId,
                 siteId: site.id,
                 customerId: customer.id,
                 status: 'OPEN',
                 assignedAIId: ai ? ai.id : null,
              },
              include: { aiEmployee: true }
           });
           
           // Notify organization that a new conversation started
           io.to(data.organizationId).emit('new_conversation', conversation);
        }

        // 1. Save to DB
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            content: data.content,
            senderId: data.senderId || 'guest',
            senderType: data.senderType,
            messageType: 'TEXT'
          }
        });

        // 2. Emit to the conversation room and organization room
        io.to(data.conversationId).emit('new_message', message);
        io.to(data.organizationId).emit('new_message', message);

        // 3. If Customer sent it, check if AI is assigned and needs to reply
        if (data.senderType === 'CUSTOMER') {
          // Check if AI is active for this conversation and no human has taken over
          if (conversation?.assignedAIId && !conversation?.assignedAgentId && conversation.status !== 'CLOSED') {
            console.log('Triggering AI for conversation:', data.conversationId);
            
            // Generate Reply
            // Fetch last 5 messages for context
            const lastMessages = await prisma.message.findMany({
               where: { conversationId: data.conversationId },
               orderBy: { createdAt: 'desc' },
               take: 5
            });
            const history = lastMessages.reverse().map((m: any) => ({
               role: (m.senderType === 'CUSTOMER' ? 'user' : 'assistant') as 'user' | 'assistant' | 'system',
               content: m.content
            }));

            const aiReplyText = await generateAIReply(data.organizationId, history);

            // Save AI Reply to DB
            const aiMessage = await prisma.message.create({
              data: {
                conversationId: data.conversationId,
                content: aiReplyText,
                senderId: conversation.assignedAIId,
                senderType: 'AI_EMPLOYEE',
                messageType: 'TEXT'
              }
            });

            // Emit AI response back to the rooms
            io.to(data.conversationId).emit('new_message', aiMessage);
            io.to(data.organizationId).emit('new_message', aiMessage);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handover to Human (Assign agent, remove AI)
    socket.on('take_over', async (data: { conversationId: string, agentId: string }) => {
      try {
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { 
            assignedAgentId: data.agentId,
            assignedAIId: null,
            status: 'ASSIGNED'
          }
        });
        io.to(data.conversationId).emit('ai_handover_status', { isAIActive: false, agentId: data.agentId });
      } catch (error) {
         console.error('Error in take_over:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
