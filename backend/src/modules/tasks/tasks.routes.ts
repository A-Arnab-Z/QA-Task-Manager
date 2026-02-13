import { Router } from 'express';
import { authorize } from '../../middleware/rbac';

const router = Router();

router.get('/', authorize('super_admin', 'admin', 'qa_lead', 'team_member', 'inspector'), async (req, res) => {
  // Supports query params: page, pageSize, status, project, department, from, to, sortBy, sortOrder, keyword
  return res.json({ message: 'List tasks endpoint (server-side filtering + pagination)' });
});

router.post('/', authorize('super_admin', 'admin'), async (req, res) => {
  return res.status(201).json({ message: 'Create task' });
});

router.post('/bulk-import', authorize('super_admin', 'admin'), async (req, res) => {
  return res.status(202).json({ message: 'CSV bulk import accepted' });
});

router.patch('/:id/assign', authorize('super_admin', 'admin', 'qa_lead'), async (req, res) => {
  return res.json({ message: `Reassign task ${req.params.id}` });
});

router.patch('/:id/status', authorize('super_admin', 'admin', 'team_member', 'inspector', 'qa_lead'), async (req, res) => {
  return res.json({ message: `Update status for task ${req.params.id}` });
});

router.post('/:id/remarks', authorize('super_admin', 'admin', 'team_member', 'inspector', 'qa_lead'), async (req, res) => {
  return res.status(201).json({ message: `Add remark to task ${req.params.id}` });
});

router.get('/:id/activity', authorize('super_admin', 'admin', 'qa_lead', 'department_head'), async (req, res) => {
  return res.json({ message: `Task ${req.params.id} activity log` });
});

export default router;
