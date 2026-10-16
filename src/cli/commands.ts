import { command as c0 } from './commands/init.js'
import { command as c1 } from './commands/project-add.js'
import { command as c2 } from './commands/project-list.js'
import { command as c3 } from './commands/project-archive.js'
import { command as c4 } from './commands/task-list.js'
import { command as c5 } from './commands/task-show.js'
import { command as c6 } from './commands/task-done.js'
import { command as c7 } from './commands/task-cancel.js'
import { command as c8 } from './commands/task-block.js'
import { command as c9 } from './commands/task-unblock.js'
import { command as c10 } from './commands/tag-add.js'
import { command as c11 } from './commands/tag-rm.js'
import { command as c12 } from './commands/tag-list.js'
import { command as c13 } from './commands/view-list.js'
import { command as c14 } from './commands/view-run.js'
import { command as c15 } from './commands/export.js'
import { command as c16 } from './commands/report.js'
import { command as c17 } from './commands/task-add.js'
import { command as c18 } from './commands/task-update.js'
import { command as c19 } from './commands/view-save.js'
import { command as c20 } from './commands/import.js'
import { command as c21 } from './commands/serve.js'
import type { CommandSpec } from './types.js'
export const commands = (): Record<string, CommandSpec> => ({
  'init': { command: c0, arguments: 0, options: [] },
  'project add': { command: c1, arguments: 0, options: ['name'] },
  'project list': { command: c2, arguments: 0, options: [] },
  'project archive': { command: c3, arguments: 1, options: [] },
  'task list': { command: c4, arguments: 0, options: ['project', 'status', 'ready', 'sort', 'filter'] },
  'task show': { command: c5, arguments: 1, options: [] },
  'task done': { command: c6, arguments: 1, options: [] },
  'task cancel': { command: c7, arguments: 1, options: [] },
  'task block': { command: c8, arguments: 2, options: [] },
  'task unblock': { command: c9, arguments: 2, options: [] },
  'tag add': { command: c10, arguments: 0, options: ['name'] },
  'tag rm': { command: c11, arguments: 1, options: [] },
  'tag list': { command: c12, arguments: 0, options: [] },
  'view list': { command: c13, arguments: 0, options: [] },
  'view run': { command: c14, arguments: 1, options: [] },
  'export': { command: c15, arguments: 0, options: ['format'] },
  'report': { command: c16, arguments: 1, options: ['from', 'to'] },
  'task add': { command: c17, arguments: 0, options: ['project', 'title', 'description', 'priority', 'due', 'tags', 'blocked-by', 'recurrence'] },
  'task update': { command: c18, arguments: 1, options: ['project', 'title', 'description', 'status', 'priority', 'due', 'tags', 'blocked-by', 'recurrence'] },
  'view save': { command: c19, arguments: 0, options: ['name', 'filter', 'sort'] },
  'import': { command: c20, arguments: 0, options: ['file', 'format'] },
  'serve': { command: c21, arguments: 0, options: ['port', 'stdio'] }
})
