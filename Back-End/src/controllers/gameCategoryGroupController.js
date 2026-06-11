const GameCategoryGroup = require('../models/GameCategoryGroup');
const GameSession = require('../models/GameSession');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Helper: verify session exists ─────────────────────────────────────────
async function getSessionOr404(sessionId, res) {
  const session = await GameSession.findById(sessionId);
  if (!session) {
    res.status(404).json({ success: false, message: 'Game session not found' });
    return null;
  }
  return session;
}

// ─── GET /api/games/:id/category-groups ─────────────────────────────────────
const getCategoryGroups = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await getSessionOr404(id, res);
  if (!session) return;

  const groups = await GameCategoryGroup.findBySession(id);

  res.json({
    success: true,
    data: {
      gameSessionId: Number(id),
      count: groups.length,
      categoryGroups: groups,
    },
  });
});

// ─── POST /api/games/:id/category-groups ────────────────────────────────────
// Body: { categoryId, questionGroupId }
const addCategoryGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryId, questionGroupId } = req.body;

  if (!categoryId || !questionGroupId) {
    return res.status(400).json({
      success: false,
      message: 'categoryId and questionGroupId are required',
    });
  }

  const session = await getSessionOr404(id, res);
  if (!session) return;

  // Prevent duplicate category in the same session
  const alreadyExists = await GameCategoryGroup.existsInSession(id, categoryId);
  if (alreadyExists) {
    return res.status(409).json({
      success: false,
      message: 'This category is already assigned to the game session',
    });
  }

  const newId = await GameCategoryGroup.create({
    gameSessionId: id,
    categoryId,
    questionGroupId,
  });

  const record = await GameCategoryGroup.findById(newId);

  res.status(201).json({
    success: true,
    message: 'Category group added successfully',
    data: record,
  });
});

// ─── POST /api/games/:id/category-groups/bulk ───────────────────────────────
// Body: { groups: [{ categoryId, questionGroupId }, ...] }
const bulkAddCategoryGroups = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { groups } = req.body;

  if (!Array.isArray(groups) || groups.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'groups must be a non-empty array of { categoryId, questionGroupId }',
    });
  }

  const session = await getSessionOr404(id, res);
  if (!session) return;

  // Validate each entry
  for (const g of groups) {
    if (!g.categoryId || !g.questionGroupId) {
      return res.status(400).json({
        success: false,
        message: 'Each group must have categoryId and questionGroupId',
      });
    }
  }

  await GameCategoryGroup.bulkCreate(id, groups);

  const all = await GameCategoryGroup.findBySession(id);

  res.status(201).json({
    success: true,
    message: `${groups.length} category group(s) added successfully`,
    data: all,
  });
});

// ─── PUT /api/games/:id/category-groups/:groupId ────────────────────────────
const updateCategoryGroup = asyncHandler(async (req, res) => {
  const { id, groupId } = req.params;
  const { categoryId, questionGroupId } = req.body;

  const session = await getSessionOr404(id, res);
  if (!session) return;

  const record = await GameCategoryGroup.findById(groupId);
  if (!record || String(record.game_session_id) !== String(id)) {
    return res.status(404).json({
      success: false,
      message: 'Category group not found in this session',
    });
  }

  await GameCategoryGroup.update(groupId, { categoryId, questionGroupId });

  const updated = await GameCategoryGroup.findById(groupId);

  res.json({
    success: true,
    message: 'Category group updated successfully',
    data: updated,
  });
});

// ─── DELETE /api/games/:id/category-groups/:groupId ─────────────────────────
const deleteCategoryGroup = asyncHandler(async (req, res) => {
  const { id, groupId } = req.params;

  const session = await getSessionOr404(id, res);
  if (!session) return;

  const record = await GameCategoryGroup.findById(groupId);
  if (!record || String(record.game_session_id) !== String(id)) {
    return res.status(404).json({
      success: false,
      message: 'Category group not found in this session',
    });
  }

  await GameCategoryGroup.delete(groupId);

  res.json({
    success: true,
    message: 'Category group deleted successfully',
  });
});

// ─── DELETE /api/games/:id/category-groups ──────────────────────────────────
// Reset all category groups for a session
const deleteAllCategoryGroups = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await getSessionOr404(id, res);
  if (!session) return;

  const deleted = await GameCategoryGroup.deleteBySession(id);

  res.json({
    success: true,
    message: `Removed ${deleted} category group(s) from the session`,
  });
});

module.exports = {
  getCategoryGroups,
  addCategoryGroup,
  bulkAddCategoryGroups,
  updateCategoryGroup,
  deleteCategoryGroup,
  deleteAllCategoryGroups,
};
