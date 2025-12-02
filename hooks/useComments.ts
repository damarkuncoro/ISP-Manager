import { useState, useCallback, useEffect } from 'react';
import { TicketComment } from '../types';
import { fetchComments, createComment } from '../services/commentService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useComments = (ticketId: string) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(ticketId);
      setComments(data);
    } catch (err) {
      setError(err);
      console.warn("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (content: string, authorName: string = 'Support Agent') => {
    try {
      const newComment = await createComment({
        ticket_id: ticketId,
        content,
        author_name: authorName
      });
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    comments,
    loading,
    error,
    loadComments,
    addComment
  };
};
