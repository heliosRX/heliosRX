import GenericStore, { UIDMethod } from '@/generic_api/lib/generic_store/GenericStore'

import userAbtractDefinition from './user'
import userReadonlyModelDefinition from './user/userReadonly';
import userStatusModelDefinition from './user/userStatus';
import userSettingsModelDefinition from './user/userSettings';

import userContactModelDefinition from './user/userContact';
import userMsgInboxModelDefinition from './user/userMsgInbox';

import tasklistAbtractDefinition from './tasklist'
import tasklistMetaModelDefinition from './tasklist/tasklistMeta';
import tasklistMemberModelDefinition from './tasklist/tasklistMember';

import taskAbstractDefinition from './task';
import taskMetaModelDefinition from './task/taskMeta';
import taskChecklistItemModelDefinition from './task/taskChecklistItem';
import taskCommentModelDefinition from './task/taskComment';

// ------------------------------------------------------------------------ USER

export const user = new GenericStore(
  "/user/*",
  userAbtractDefinition,
  { isAbstract: true }
);

let isAdmin = true // TODO: set to false, when all users are converted

export const userReadonly = new GenericStore(
  "/user/*/readonly",
  userReadonlyModelDefinition,
  { uidMethod: UIDMethod.MY_USER_ID, isReadonly: !isAdmin }
);

export const userStatus = new GenericStore(
  "/user/*/status",
  userStatusModelDefinition,
  { uidMethod: UIDMethod.MY_USER_ID }
);

export const userSettings = new GenericStore(
  "/user/*/settings",
  userSettingsModelDefinition,
  { uidMethod: UIDMethod.MY_USER_ID }
);

export const userContact = new GenericStore(
  "/user/{uid}/contacts/*",
  userContactModelDefinition,
  { additionalProps: ['otherUserId'], uidMethod: (props) => props['otherUserId'] }
);

export const userMsgInbox = new GenericStore(
  "/user/{uid}/msginbox/*",
  userMsgInboxModelDefinition,
);
// ----------------------------------------------------------------------- TASKS

export const tasklist = new GenericStore(
  "/tasklist/*",
  tasklistAbtractDefinition,
  { isAbstract: true }
);

export const tasklistMeta = new GenericStore(
  '/tasklist/*/meta',
  tasklistMetaModelDefinition
);

export const tasklistMember = new GenericStore(
  "/tasklist/{tasklistId}/members/*",
  tasklistMemberModelDefinition,
  { uidMethod: UIDMethod.MY_USER_ID }
);

export const task = new GenericStore(
  '{tasklistId},{memberId}', // Allow paths for abstract stores
  taskAbstractDefinition
);

export const taskMeta = new GenericStore(
  "/tasklist/{tasklistId}/tasks/*",
  taskMetaModelDefinition
);

export const taskChecklistItem = new GenericStore(
  "/tasklist/{tasklistId}//task_details/{taskId}/checklist/*",
  taskChecklistItemModelDefinition
);

export const taskComment = new GenericStore(
  "/tasklist/{tasklistId}//task_details/{taskId}/comment/*",
  taskCommentModelDefinition
);
