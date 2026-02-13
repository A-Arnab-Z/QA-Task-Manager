import { genkit, z } from 'genkit';

const ai = genkit({});

const prioritizeInputSchema = z.object({
  workloadCapacity: z.string(),
  recentAchievements: z.string(),
  tasks: z.array(z.object({ id: z.string(), projectName: z.string(), priority: z.string(), deadline: z.string(), status: z.string() }))
});

export const prioritizeTasks = ai.defineFlow(
  {
    name: 'prioritizeTasks',
    inputSchema: prioritizeInputSchema,
    outputSchema: z.array(z.object({ taskId: z.string(), revisedPriority: z.enum(['critical', 'high', 'medium', 'low']), reason: z.string() }))
  },
  async (input) => {
    return input.tasks.map((task) => ({
      taskId: task.id,
      revisedPriority: task.status === 'blocked' ? 'critical' : (task.priority as 'critical' | 'high' | 'medium' | 'low'),
      reason: `Suggested based on workload (${input.workloadCapacity.slice(0, 40)}) and delivery context.`
    }));
  }
);
