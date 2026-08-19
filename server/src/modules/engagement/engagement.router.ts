import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { query, transaction } from '../../config/database.js'
import { AppError } from '../../common/errors/app-error.js'
import { created, ok } from '../../common/http/response.js'
import { requireUser } from '../../common/middleware/auth.js'
import { asyncHandler } from '../../common/utils/async-handler.js'
import { commentSchema, createPostSchema, postListSchema, reactionSchema, repairSchema, supportMessageSchema } from './engagement.schemas.js'

export const engagementRouter = Router()
engagementRouter.use(requireUser)

engagementRouter.get('/posts', asyncHandler(async (req, res) => {
  const input = postListSchema.parse(req.query); const offset = (input.page - 1) * input.pageSize
  const rows = await query<RowDataPacket[]>(`SELECT p.post_id, p.user_id, u.nickname, u.avatar, p.content, p.image_urls, p.tags_json, p.like_count, p.comment_count, p.created_at,
    EXISTS(SELECT 1 FROM community_post_reactions r WHERE r.post_id = p.post_id AND r.user_id = ? AND r.reaction_type = 'like') AS liked,
    EXISTS(SELECT 1 FROM community_post_reactions r WHERE r.post_id = p.post_id AND r.user_id = ? AND r.reaction_type = 'favorite') AS favorited
    FROM community_posts p JOIN users u ON u.user_id = p.user_id WHERE p.status = 'published' ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [req.auth!.userId, req.auth!.userId, input.pageSize, offset])
  const [count] = await query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM community_posts WHERE status = \'published\'', [])
  return ok(res, { items: rows, page: input.page, pageSize: input.pageSize, total: Number(count.total) })
}))

engagementRouter.post('/posts', asyncHandler(async (req, res) => {
  const input = createPostSchema.parse(req.body)
  const result = await query<ResultSetHeader>('INSERT INTO community_posts (user_id, content, image_urls, tags_json) VALUES (?, ?, ?, ?)', [req.auth!.userId, input.content, JSON.stringify(input.imageUrls), JSON.stringify(input.tags)])
  return created(res, { postId: result.insertId }, 'Post published')
}))

engagementRouter.get('/posts/:postId', asyncHandler(async (req, res) => {
  const [post] = await query<RowDataPacket[]>(`SELECT p.post_id, p.user_id, u.nickname, u.avatar, p.content, p.image_urls, p.tags_json, p.like_count, p.comment_count, p.created_at,
    EXISTS(SELECT 1 FROM community_post_reactions r WHERE r.post_id = p.post_id AND r.user_id = ? AND r.reaction_type = 'like') AS liked,
    EXISTS(SELECT 1 FROM community_post_reactions r WHERE r.post_id = p.post_id AND r.user_id = ? AND r.reaction_type = 'favorite') AS favorited
    FROM community_posts p JOIN users u ON u.user_id = p.user_id WHERE p.post_id = ? AND p.status = 'published' LIMIT 1`, [req.auth!.userId, req.auth!.userId, req.params.postId])
  if (!post) throw new AppError(404, 'Post not found')
  const comments = await query<RowDataPacket[]>('SELECT c.comment_id, c.post_id, c.user_id, u.nickname, u.avatar, c.content, c.created_at FROM community_comments c JOIN users u ON u.user_id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC', [req.params.postId])
  return ok(res, { ...post, comments })
}))

engagementRouter.post('/posts/:postId/comments', asyncHandler(async (req, res) => {
  const input = commentSchema.parse(req.body)
  const result = await transaction(async (connection) => {
    const [posts] = await connection.execute<RowDataPacket[]>('SELECT post_id FROM community_posts WHERE post_id = ? AND status = \'published\' FOR UPDATE', [req.params.postId])
    if (!posts.length) throw new AppError(404, 'Post not found')
    const [comment] = await connection.execute<ResultSetHeader>('INSERT INTO community_comments (post_id, user_id, content) VALUES (?, ?, ?)', [req.params.postId, req.auth!.userId, input.content])
    await connection.execute('UPDATE community_posts SET comment_count = comment_count + 1 WHERE post_id = ?', [req.params.postId])
    return comment.insertId
  })
  return created(res, { commentId: result }, 'Comment published')
}))

engagementRouter.post('/posts/:postId/reactions', asyncHandler(async (req, res) => {
  const input = reactionSchema.parse(req.body)
  const result = await transaction(async (connection) => {
    const [existing] = await connection.execute<RowDataPacket[]>('SELECT post_id FROM community_post_reactions WHERE post_id = ? AND user_id = ? AND reaction_type = ? FOR UPDATE', [req.params.postId, req.auth!.userId, input.type])
    if (existing.length) {
      await connection.execute('DELETE FROM community_post_reactions WHERE post_id = ? AND user_id = ? AND reaction_type = ?', [req.params.postId, req.auth!.userId, input.type])
      if (input.type === 'like') await connection.execute('UPDATE community_posts SET like_count = GREATEST(0, like_count - 1) WHERE post_id = ?', [req.params.postId])
      return false
    }
    await connection.execute('INSERT INTO community_post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)', [req.params.postId, req.auth!.userId, input.type])
    if (input.type === 'like') await connection.execute('UPDATE community_posts SET like_count = like_count + 1 WHERE post_id = ?', [req.params.postId])
    return true
  })
  return ok(res, { type: input.type, active: result })
}))

engagementRouter.get('/favorites', asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>(`SELECT p.post_id, p.user_id, u.nickname, u.avatar, p.content, p.image_urls, p.tags_json, p.like_count, p.comment_count, p.created_at
    FROM community_posts p JOIN users u ON u.user_id = p.user_id JOIN community_post_reactions r ON r.post_id = p.post_id
    WHERE r.user_id = ? AND r.reaction_type = 'favorite' AND p.status = 'published' ORDER BY r.created_at DESC`, [req.auth!.userId])
  return ok(res, rows)
}))

engagementRouter.get('/repairs', asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>('SELECT ticket_id, ticket_no, vehicle_id, vehicle_identifier, issue_types_json, description, contact_phone, photo_urls, status, resolution, created_at, updated_at FROM repair_tickets WHERE user_id = ? ORDER BY created_at DESC', [req.auth!.userId])
  return ok(res, rows)
}))

engagementRouter.post('/repairs', asyncHandler(async (req, res) => {
  const input = repairSchema.parse(req.body); const ticketNo = `RP${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  const result = await query<ResultSetHeader>('INSERT INTO repair_tickets (ticket_no, user_id, vehicle_id, vehicle_identifier, issue_types_json, description, contact_phone, photo_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [ticketNo, req.auth!.userId, input.vehicleId ?? null, input.vehicleIdentifier, JSON.stringify(input.issueTypes), input.description ?? null, input.contactPhone, JSON.stringify(input.photoUrls)])
  return created(res, { ticketId: result.insertId, ticketNo, status: 'submitted' }, 'Repair request submitted')
}))

engagementRouter.get('/support/messages', asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>('SELECT message_id, role, content, created_at FROM support_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100', [req.auth!.userId])
  return ok(res, rows)
}))

engagementRouter.post('/support/messages', asyncHandler(async (req, res) => {
  const input = supportMessageSchema.parse(req.body)
  const result = await transaction(async (connection) => {
    const [userMessage] = await connection.execute<ResultSetHeader>('INSERT INTO support_messages (user_id, role, content) VALUES (?, \'user\', ?)', [req.auth!.userId, input.content])
    const reply = '已收到你的问题，我可以协助处理租赁、补能、报修、积分和订单。'
    const [assistantMessage] = await connection.execute<ResultSetHeader>('INSERT INTO support_messages (user_id, role, content) VALUES (?, \'assistant\', ?)', [req.auth!.userId, reply])
    return { userMessageId: userMessage.insertId, assistantMessageId: assistantMessage.insertId, reply }
  })
  return created(res, result, 'Message received')
}))
