// useCohereChat.js
import { useCallback } from 'react';
import { CohereClientV2 } from 'cohere-ai';
import Swal from 'sweetalert2';
import { marked } from 'marked';

const cohere = new CohereClientV2({
    token: import.meta.env.VITE_COHERE_KEY,
});

export const useCohereChat = () => {
  const sendMessage = useCallback(async (userMessage = 'Hello world!') => {
    try {
      Swal.fire({
        title: 'Đang phản hồi...',
        text: 'Đợi AI một chút nha!',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const contentArray = response.message?.content || [];
      const fullText = contentArray
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\n\n');

      const markdownHtml = marked.parse(fullText);

      Swal.fire({
        title: 'Phản hồi từ AI',
        html: `<div class="text-left max-h-[60vh] overflow-auto p-4 bg-[#f8f8f8] rounded-lg">
          ${markdownHtml}
        </div>`,
        width: '60%',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'ai-markdown-popup'
        }
      });

      return fullText;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi gọi API',
        text: error.message || 'Đã xảy ra lỗi không xác định.',
      });
      throw error;
    }
  }, []);

  return { sendMessage };
};