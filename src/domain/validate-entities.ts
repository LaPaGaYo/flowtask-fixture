import { isTimestamp } from './date.js'
import { isRecord, nonempty } from './guards.js'
import { ok, fail, type Result } from './result.js'
import type { Project } from './project.js'
import type { Tag } from './tag.js'
import type { ActivityEvent } from './activity.js'
export function parseProject(value: unknown): Result<Project> {
  return isRecord(value) && nonempty(value.id) && nonempty(value.name) && typeof value.archived === 'boolean'
    ? ok({ id: value.id, name: value.name.trim(), archived: value.archived }) : fail('validation', 'Invalid project')
}
export function parseTag(value: unknown): Result<Tag> {
  return isRecord(value) && nonempty(value.id) && nonempty(value.name)
    ? ok({ id: value.id, name: value.name.trim() }) : fail('validation', 'Invalid tag')
}
export function parseActivity(value: unknown): Result<ActivityEvent> {
  return isRecord(value) && nonempty(value.id) && nonempty(value.entityId) && nonempty(value.action) && isTimestamp(value.at)
    ? ok({ id: value.id, entityId: value.entityId, action: value.action, at: value.at }) : fail('validation', 'Invalid activity')
}
