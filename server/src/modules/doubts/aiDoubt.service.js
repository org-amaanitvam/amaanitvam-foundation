import DoubtResponse from './doubtResponse.model.js';
import { proxyToAI } from '../conversations/conversation.proxy.js';

export const triggerAiDoubtResolution = async (doubt, user) => {
  try {
    const contextType = doubt.course_id ? 'course' : 'general';
    const aiResponse = await proxyToAI('/internal/chat', 'POST', {
      firebase_uid: user.uid || user.firebase_uid,
      message: doubt.description,
      context_type: contextType,
      context_id: doubt.course_id ? String(doubt.course_id) : null,
      context_label: [doubt.subject, doubt.topic].filter(Boolean).join(' / ') || null,
    }, user.uid || user.firebase_uid);

    const assistantMessage = aiResponse?.data;
    if (!assistantMessage?.content) {
      throw new Error('AI service returned no assistant content.');
    }

    const response = await DoubtResponse.create({
      doubt_id: doubt._id,
      user_id: doubt.student_id,
      message: assistantMessage.content,
      is_faculty_response: false,
      is_ai_generated: true,
    });

    if (aiResponse.conversation_id) {
      doubt.ai_conversation_id = aiResponse.conversation_id;
      await doubt.save();
    }

    console.log(`[AI doubt] Saved response ${response._id} for doubt ${doubt._id}`);
    return response;
  } catch (error) {
    console.error(`[AI doubt] Failed for doubt ${doubt._id}:`, error.message);
    return null;
  }
};